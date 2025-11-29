const https = require('https');

const token = process.env.MMVENTAS_GITHUB_TOKEN;

console.log('Token configurado:', token ? 'SÍ' : 'NO');
console.log('Token length:', token ? token.length : 0);

const options = {
  hostname: 'raw.githubusercontent.com',
  path: '/Lautaroemurua/MMVentas-Licenses/main/licenses.json',
  method: 'GET',
  headers: {
    'User-Agent': 'MMVentas-System',
    'Authorization': token ? `token ${token}` : undefined,
    'Cache-Control': 'no-cache',
    'Accept': 'application/vnd.github.v3.raw'
  },
  timeout: 5000
};

console.log('\nIntentando conectar a GitHub...\n');

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n--- Respuesta ---');
    console.log(data);
    
    if (res.statusCode === 200) {
      try {
        const licenses = JSON.parse(data);
        console.log('\n✅ JSON válido, licencias encontradas:', licenses.length);
      } catch (e) {
        console.log('\n❌ Error parseando JSON:', e.message);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error de conexión:', error.message);
});

req.on('timeout', () => {
  console.error('❌ Timeout');
  req.destroy();
});

req.end();
