const crypto = require('crypto');

// Tu System ID
const systemId = '84efb32435ba0e29';
const SECRET = 'MMV_2025_LICENSE_SECRET_KEY_DO_NOT_SHARE';

// Generar licencia
const timestamp = Date.now();
const data = `${systemId}-${timestamp}`;
const hmac = crypto.createHmac('sha256', SECRET);
hmac.update(data);
const signature = hmac.digest('hex').substring(0, 20);

const licenseKey = `${systemId.substring(0, 4)}-${signature.substring(0, 4)}-${signature.substring(4, 8)}-${signature.substring(8, 12)}-${signature.substring(12, 16)}`.toUpperCase();

console.log('\n=================================');
console.log('CÓDIGO DE ACTIVACIÓN GENERADO');
console.log('=================================');
console.log('System ID:', systemId);
console.log('License Key:', licenseKey);
console.log('=================================\n');
