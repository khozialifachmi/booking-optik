const fs = require('fs');

const path = '.next/dev/server/chunks/ssr/_0_.s-zo._.js';
try {
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    console.log("File length:", content.length);
    
    const index = content.indexOf('async function AdminDashboard');
    if (index !== -1) {
      console.log("Found AdminDashboard at index:", index);
      fs.writeFileSync('scratch/compiled-dashboard-large.txt', content.substring(index, index + 150000), 'utf8');
      console.log("Wrote 150k chars of AdminDashboard to scratch/compiled-dashboard-large.txt");
    } else {
      console.log("Could not find AdminDashboard in current compiled chunk.");
    }
  } else {
    console.log("Compiled chunk file does not exist at " + path);
  }
} catch (e) {
  console.error("Error:", e.message);
}
