const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const LICENSE_FILE = path.join(app.getPath('userData'), '.sys');
const TRIAL_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Obtener identificador único del sistema
function getSystemId() {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let mac = '';
  
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (!net.internal && net.mac !== '00:00:00:00:00:00') {
        mac = net.mac;
        break;
      }
    }
    if (mac) break;
  }
  
  const hostname = os.hostname();
  const combined = `${mac}-${hostname}`;
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
}

// Encriptar datos
function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync('MMV_2025_SYSTEM_KEY', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Desencriptar datos
function decrypt(text) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync('MMV_2025_SYSTEM_KEY', 'salt', 32);
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = parts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return null;
  }
}

// Leer estado de licencia
function readLicenseState() {
  try {
    if (!fs.existsSync(LICENSE_FILE)) {
      return null;
    }
    const encrypted = fs.readFileSync(LICENSE_FILE, 'utf8');
    const decrypted = decrypt(encrypted);
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
}

// Guardar estado de licencia
function saveLicenseState(state) {
  try {
    const encrypted = encrypt(JSON.stringify(state));
    fs.writeFileSync(LICENSE_FILE, encrypted, 'utf8');
  } catch (error) {
    console.error('Error saving license state');
  }
}

// Verificar licencia
function checkLicense() {
  const state = readLicenseState();
  const now = Date.now();
  const systemId = getSystemId();

  // Primera ejecución - iniciar trial
  if (!state) {
    const newState = {
      systemId: systemId,
      trialStart: now,
      activated: false
    };
    saveLicenseState(newState);
    return {
      valid: true,
      trial: true,
      remaining: TRIAL_DURATION,
      systemId: systemId
    };
  }

  // Verificar si el sistema cambió (intento de bypass)
  if (state.systemId !== systemId) {
    return {
      valid: false,
      trial: false,
      remaining: 0,
      message: 'Sistema no autorizado',
      systemId: systemId
    };
  }

  // Sistema activado
  if (state.activated && state.licenseKey) {
    return {
      valid: true,
      trial: false,
      activated: true
    };
  }

  // Trial activo
  const elapsed = now - state.trialStart;
  const remaining = TRIAL_DURATION - elapsed;

  if (remaining > 0) {
    return {
      valid: true,
      trial: true,
      remaining: remaining,
      systemId: systemId
    };
  }

  // Trial expirado
  return {
    valid: false,
    trial: true,
    expired: true,
    systemId: systemId
  };
}

// Activar licencia - Validación online
async function activateLicense(licenseKey) {
  const state = readLicenseState();
  const systemId = getSystemId();
  
  if (!state) {
    return { success: false, message: 'Estado inválido' };
  }

  try {
    // Validar contra servidor online
    const isValid = await validateLicenseOnline(systemId, licenseKey);
    
    if (isValid) {
      state.activated = true;
      state.licenseKey = licenseKey;
      state.activationDate = Date.now();
      saveLicenseState(state);
      return { success: true, message: 'Sistema activado correctamente' };
    }
    
    return { success: false, message: 'Código de activación inválido. Verifique el código e intente nuevamente.' };
  } catch (error) {
    console.error('Error en activación:', error);
    
    // Fallback: Validación local/offline si el servidor no está disponible
    const isValidOffline = validateLicenseOffline(systemId, licenseKey);
    
    if (isValidOffline) {
      state.activated = true;
      state.licenseKey = licenseKey;
      state.activationDate = Date.now();
      saveLicenseState(state);
      return { success: true, message: 'Sistema activado correctamente (modo offline)' };
    }
    
    // Si hay error de conexión
    if (error.message.includes('Timeout') || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return { success: false, message: 'Error de conexión. Verifique su internet e intente nuevamente.' };
    }
    // Otros errores (archivo no encontrado, JSON inválido, etc.)
    return { success: false, message: 'Código de activación inválido.' };
  }
}

// Validación offline usando el mismo algoritmo de generación
function validateLicenseOffline(systemId, licenseKey) {
  const SECRET = 'MMV_2025_LICENSE_SECRET_KEY_DO_NOT_SHARE';
  const parts = licenseKey.split('-');
  
  if (parts.length !== 5) return false;
  
  // Verificar que el prefijo coincida con el systemId
  const prefix = parts[0].toLowerCase();
  if (prefix !== systemId.substring(0, 4)) return false;
  
  // Unir la firma completa (16 caracteres)
  const providedSignature = parts.slice(1).join('').toLowerCase();
  
  // Verificar que la firma tenga el formato correcto (16 caracteres hex)
  if (providedSignature.length !== 16 || !/^[0-9a-f]+$/.test(providedSignature)) return false;
  
  // Lista de timestamps válidos conocidos (puedes agregar más)
  // Por ahora, aceptar cualquier licencia con formato válido en modo desarrollo
  const validTimestamps = [
    1732824000000, // Timestamp base
    Date.now()
  ];
  
  for (const timestamp of validTimestamps) {
    const data = `${systemId}-${timestamp}`;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex').substring(0, 16);
    
    if (expectedSignature === providedSignature) {
      return true;
    }
  }
  
  // No validar offline - forzar validación online
  return false;
}

// Validar licencia contra servidor online
async function validateLicenseOnline(systemId, licenseKey) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    
    // Leer token desde variable de entorno (configurada en el sistema)
    // Para configurar: setx MMVENTAS_GITHUB_TOKEN "tu_token_aqui"
    const token = process.env.MMVENTAS_GITHUB_TOKEN;
    
    const headers = {
      'User-Agent': 'MMVentas-System',
      'Cache-Control': 'no-cache'
    };
    
    // Si hay token, usar API de GitHub (para repo privado)
    if (token) {
      headers['Authorization'] = `token ${token}`;
      headers['Accept'] = 'application/vnd.github.v3.raw';
    }
    
    const options = {
      hostname: 'raw.githubusercontent.com',
      path: '/Lautaroemurua/MMVentas-Licenses/main/licenses.json',
      method: 'GET',
      headers: headers,
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const licenses = JSON.parse(data);
            
            // Buscar la licencia en el archivo
            const validLicense = licenses.find(l => 
              l.systemId === systemId && l.key === licenseKey && l.active === true
            );
            
            resolve(!!validLicense);
          } else {
            reject(new Error('Error al obtener licencias'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Generar clave de licencia (solo para referencia local, no se usa para validar)
function generateLicenseKey(systemId) {
  // Hash único pero impredecible sin el archivo online
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${systemId.substring(0, 4)}-${random}-${timestamp}`.toUpperCase();
}

// Enviar notificación de expiración
async function notifyExpiration(systemId) {
  try {
    // Intentar enviar notificación a servidor
    const https = require('https');
    const data = JSON.stringify({
      systemId: systemId,
      timestamp: new Date().toISOString(),
      app: 'MMVentas'
    });

    const options = {
      hostname: 'hook.us1.make.com',
      path: '/your-webhook-path', // Configurar webhook
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    // Enviar de forma silenciosa
    const req = https.request(options, (res) => {});
    req.on('error', () => {});
    req.write(data);
    req.end();
  } catch (error) {
    // Fallar silenciosamente
  }
}

function getTrialInfo() {
  const status = checkLicense();
  if (status.trial && status.remaining) {
    const hours = Math.floor(status.remaining / (60 * 60 * 1000));
    const minutes = Math.floor((status.remaining % (60 * 60 * 1000)) / (60 * 1000));
    return {
      active: true,
      hours,
      minutes,
      remaining: status.remaining
    };
  }
  return { active: false };
}

module.exports = {
  checkLicense,
  activateLicense,
  getSystemId,
  generateLicenseKey,
  notifyExpiration,
  getTrialInfo
};
