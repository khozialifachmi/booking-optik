const fs = require('fs');

const path = '.next/dev/server/chunks/ssr/_0_.s-zo._.js';
try {
  const content = fs.readFileSync(path, 'utf8');
  console.log("File length:", content.length);
  
  // Find where AdminDashboard is defined
  const index = content.indexOf('async function AdminDashboard');
  if (index !== -1) {
    console.log("Found AdminDashboard at index:", index);
    // Print around the index
    console.log(content.substring(index, index + 3000));
    // Write it to a file
    fs.writeFileSync('scratch/compiled-dashboard-func.txt', content.substring(index, index + 25000), 'utf8');
  } else {
    console.log("Could not find AdminDashboard in compiled chunk.");
  }
} catch (e) {
  console.error("Error:", e.message);
}
