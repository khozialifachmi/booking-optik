const fs = require('fs');

for (let i = 0; i < 3; i++) {
  try {
    const raw = fs.readFileSync(`scratch/big-match-${i}.json`, 'utf8');
    const obj = JSON.parse(raw);
    console.log(`Match ${i}: type = ${obj.type}, source = ${obj.source}, keys = ${Object.keys(obj)}`);
    if (obj.tool_calls) {
      console.log(`  tool_calls: ${obj.tool_calls.map(tc => tc.name)}`);
    }
    // Print first 200 chars of content if present
    if (obj.content) {
      console.log(`  content prefix: ${obj.content.substring(0, 200).replace(/\n/g, ' ')}`);
    }
  } catch (e) {
    console.error(`Error parsing match ${i}:`, e.message);
  }
}
