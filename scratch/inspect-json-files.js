const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('scratch');
for (const file of files) {
  if (!file.endsWith('.json')) continue;
  try {
    const raw = fs.readFileSync(path.join('scratch', file), 'utf8');
    const obj = JSON.parse(raw);
    console.log(`File: ${file}`);
    
    // Recursive search for large strings (longer than 2000 chars)
    function searchStrings(node, currentPath = '') {
      if (typeof node === 'string') {
        if (node.length > 2000) {
          console.log(`  Found string of length ${node.length} at path "${currentPath}":`);
          console.log(node.substring(0, 150) + "...\n");
        }
      } else if (Array.isArray(node)) {
        node.forEach((item, idx) => searchStrings(item, `${currentPath}[${idx}]`));
      } else if (node && typeof node === 'object') {
        for (const [key, val] of Object.entries(node)) {
          searchStrings(val, currentPath ? `${currentPath}.${key}` : key);
        }
      }
    }
    searchStrings(obj);
  } catch (e) {
    console.log(`Error reading ${file}:`, e.message);
  }
}
