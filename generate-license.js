const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SECRET = 'MMV_2025_LICENSE_SECRET_KEY_DO_NOT_SHARE';

console.log('\n╔════════════════════════════════════════════╗');
console.log('║   GENERADOR DE LICENCIAS - MMVentas       ║');
console.log('╚════════════════════════════════════════════╝\n');

rl.question('System ID del cliente: ', (systemId) => {
  rl.question('Nombre del cliente: ', (clientName) => {
    rl.question('Notas (opcional): ', (notes) => {
      
      // Generar licencia
      const timestamp = Date.now();
      const data = `${systemId}-${timestamp}`;
      const hmac = crypto.createHmac('sha256', SECRET);
      hmac.update(data);
      const signature = hmac.digest('hex').substring(0, 20);
      
      const licenseKey = `${systemId.substring(0, 4)}-${signature.substring(0, 4)}-${signature.substring(4, 8)}-${signature.substring(8, 12)}-${signature.substring(12, 16)}`.toUpperCase();
      
      const today = new Date().toISOString().split('T')[0];
      
      const licenseEntry = {
        systemId: systemId,
        key: licenseKey,
        active: true,
        client: clientName,
        activationDate: today,
        notes: notes || ''
      };
      
      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║         LICENCIA GENERADA EXITOSAMENTE     ║');
      console.log('╚════════════════════════════════════════════╝\n');
      console.log('📋 CÓDIGO PARA EL CLIENTE:');
      console.log('   ' + licenseKey);
      console.log('\n📝 ENTRADA PARA licenses.json:');
      console.log('─'.repeat(50));
      console.log(JSON.stringify(licenseEntry, null, 2));
      console.log('─'.repeat(50));
      console.log('\n📌 INSTRUCCIONES:');
      console.log('1. Copia el objeto JSON de arriba');
      console.log('2. Agrega al array en MMVentas-Licenses/licenses.json');
      console.log('3. Haz commit y push a GitHub');
      console.log('4. Envía el código al cliente: ' + licenseKey);
      console.log('\n');
      
      rl.close();
    });
  });
});
