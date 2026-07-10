const fs = require('fs');
const path = require('path');

try {
  const raw = fs.readFileSync('scratch/big-match-2.json', 'utf8');
  const obj = JSON.parse(raw);
  
  // Recursively find the large string and write it out
  function findAndWrite(node, currentPath = '') {
    if (typeof node === 'string') {
      if (node.length > 2000) {
        fs.writeFileSync('scratch/restored-match-2.txt', node, 'utf8');
        console.log(`Successfully wrote string of length ${node.length} to scratch/restored-match-2.txt`);
      }
    } else if (Array.isArray(node)) {
      node.forEach((item, idx) => findAndWrite(item, `${currentPath}[${idx}]`));
    } else if (node && typeof node === 'object') {
      for (const [key, val] of Object.entries(node)) {
        findAndWrite(val, currentPath ? `${currentPath}.${key}` : key);
      }
    }
  }
  findAndWrite(obj);
} catch (e) {
  console.error("Error:", e.message);
}
