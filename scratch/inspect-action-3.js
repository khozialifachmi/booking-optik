const fs = require('fs');

const path = '.next/dev/server/chunks/ssr/_0_.s-zo._.js';
try {
  if (fs.existsSync(path)) {
    const content = fs.readFileSync(path, 'utf8');
    const index = content.indexOf('function $$RSC_SERVER_ACTION_3');
    if (index !== -1) {
      console.log("Found $$RSC_SERVER_ACTION_3 definition:");
      console.log(content.substring(index, index + 2000));
    } else {
      const idx2 = content.indexOf('$$RSC_SERVER_ACTION_3 =');
      if (idx2 !== -1) {
        console.log("Found $$RSC_SERVER_ACTION_3 assignment:");
        console.log(content.substring(idx2 - 100, idx2 + 1000));
      } else {
        console.log("Could not find $$RSC_SERVER_ACTION_3 definition or assignment.");
      }
    }
  } else {
    console.log("Compiled chunk file does not exist.");
  }
} catch (e) {
  console.error("Error:", e.message);
}
