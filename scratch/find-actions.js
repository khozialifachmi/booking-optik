const fs = require('fs');

const path = '.next/dev/server/chunks/ssr/_0_.s-zo._.js';
try {
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    
    // Find all occurrences of server action definitions in page.tsx
    const searchString = '$$RSC_SERVER_ACTION';
    let idx = content.indexOf(searchString);
    while (idx !== -1) {
      console.log(`Found ${searchString} at index: ${idx}`);
      console.log(content.substring(idx - 100, idx + 800));
      console.log("-----------------------------------------");
      idx = content.indexOf(searchString, idx + 1);
    }
  } else {
    console.log("Compiled chunk file does not exist at " + path);
  }
} catch (e) {
  console.error("Error:", e.message);
}
