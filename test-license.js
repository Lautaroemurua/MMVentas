// Script de prueba para sistema de licencias
// Ejecutar con: node test-license.js

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Simular las funciones de license.js
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

function generateLicenseKey(systemId) {
  const secret = 'MMV_LICENSE_SECRET_2025';
  const combined = `${systemId}-${secret}`;
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 20).toUpperCase();
}

// Obtener el System ID de este equipo
const systemId = getSystemId();
console.log('\n=================================');
console.log('PRUEBA DE SISTEMA DE LICENCIAS');
console.log('=================================\n');

console.log('✅ System ID de este equipo:');
console.log('   ' + systemId);

console.log('\n✅ Código de activación válido para este equipo:');
const licenseKey = generateLicenseKey(systemId);
console.log('   ' + licenseKey);

console.log('\n📋 PASOS PARA PROBAR:');
console.log('1. Copia el código de activación de arriba');
console.log('2. Ejecuta: npm start');
console.log('3. Cuando aparezca el diálogo de activación, pega el código');
console.log('4. El sistema debería activarse correctamente\n');

// Verificar si existe el archivo de licencia
const userDataPath = process.env.APPDATA || 
  (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library', 'Application Support') : 
  path.join(process.env.HOME, '.config'));

const licenseFile = path.join(userDataPath, 'mmventas', '.sys');

if (fs.existsSync(licenseFile)) {
  console.log('⚠️  Ya existe un archivo de licencia en:');
  console.log('   ' + licenseFile);
  console.log('\n💡 Para probar un sistema bloqueado, ejecuta:');
  console.log('   node force-expire.js');
} else {
  console.log('✅ No hay archivo de licencia. Primera ejecución.');
}

console.log('\n=================================\n');
