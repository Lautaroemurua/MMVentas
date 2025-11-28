// Script para forzar expiración del trial
// Ejecutar con: node force-expire.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Función de encriptación (debe coincidir con license.js)
function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync('MMV_2025_SYSTEM_KEY', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function getSystemId() {
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

// Obtener ruta del archivo de licencia
const userDataPath = process.env.APPDATA || 
  (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library', 'Application Support') : 
  path.join(process.env.HOME, '.config'));

const appDataPath = path.join(userDataPath, 'mmventas');
const licenseFile = path.join(appDataPath, '.sys');

// Crear carpeta si no existe
if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true });
}

// Crear estado expirado (trial iniciado hace 25 horas)
const systemId = getSystemId();
const expiredState = {
  systemId: systemId,
  trialStart: Date.now() - (25 * 60 * 60 * 1000), // 25 horas atrás
  activated: false
};

const encrypted = encrypt(JSON.stringify(expiredState));
fs.writeFileSync(licenseFile, encrypted, 'utf8');

console.log('\n=================================');
console.log('FORZAR EXPIRACIÓN DE TRIAL');
console.log('=================================\n');

console.log('✅ Archivo de licencia expirada creado en:');
console.log('   ' + licenseFile);

console.log('\n📋 System ID:');
console.log('   ' + systemId);

console.log('\n✅ Ahora ejecuta: npm start');
console.log('   El sistema mostrará que el trial ha expirado\n');

console.log('💡 Para obtener el código de activación ejecuta:');
console.log('   node test-license.js\n');

console.log('=================================\n');
