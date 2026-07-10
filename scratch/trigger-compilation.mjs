import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      console.log(`GET ${url} -> Status: ${res.statusCode}`);
      resolve();
    }).on('error', (e) => {
      console.error(`GET ${url} failed:`, e.message);
      resolve();
    });
  });
}

async function run() {
  console.log("Triggering home page...");
  await get('http://localhost:3000/');
  console.log("Triggering login page...");
  await get('http://localhost:3000/login');
  console.log("Triggering dashboard...");
  await get('http://localhost:3000/dashboard');
  console.log("Triggering admin dashboard...");
  await get('http://localhost:3000/admin/dashboard');
  console.log("Done triggering.");
}

run();
