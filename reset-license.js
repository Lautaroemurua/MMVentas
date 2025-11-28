// Script para resetear completamente el sistema de licencias
// Ejecutar con: node reset-license.js

const fs = require('fs');
const path = require('path');

const userDataPath = process.env.APPDATA || 
  (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library', 'Application Support') : 
  path.join(process.env.HOME, '.config'));

const appDataPath = path.join(userDataPath, 'mmventas');
const licenseFile = path.join(appDataPath, '.sys');

console.log('\n=================================');
console.log('RESETEAR SISTEMA DE LICENCIAS');
console.log('=================================\n');

if (fs.existsSync(licenseFile)) {
  fs.unlinkSync(licenseFile);
  console.log('✅ Archivo de licencia eliminado');
  console.log('   ' + licenseFile);
  console.log('\n✅ La próxima ejecución iniciará un nuevo trial de 24 horas\n');
} else {
  console.log('ℹ️  No existe archivo de licencia');
  console.log('   El sistema ya está limpio\n');
}

console.log('=================================\n');
