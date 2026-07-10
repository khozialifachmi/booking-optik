const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('scratch');
for (const file of files) {
  if (!file.endsWith('.json')) continue;
  try {
    const raw = fs.readFileSync(path.join('scratch', file), 'utf8');
    const obj = JSON.parse(raw);
    console.log(`File: ${file}`);
    
    // Check if it's a tool call with replacement chunks or targetContent
    if (obj.tool_calls) {
      for (let i = 0; i < obj.tool_calls.length; i++) {
        const tc = obj.tool_calls[i];
        if (tc.args) {
          if (tc.args.TargetContent) {
            console.log(`  ToolCall ${i} TargetContent length:`, tc.args.TargetContent.length);
            if (tc.args.TargetContent.length > 2000) {
              console.log("  TargetContent starts with:\n", tc.args.TargetContent.substring(0, 200));
            }
          }
          if (tc.args.ReplacementContent) {
            console.log(`  ToolCall ${i} ReplacementContent length:`, tc.args.ReplacementContent.length);
          }
          if (tc.args.ReplacementChunks) {
            console.log(`  ToolCall ${i} ReplacementChunks count:`, tc.args.ReplacementChunks.length);
            tc.args.ReplacementChunks.forEach((chunk, idx) => {
              console.log(`    Chunk ${idx} TargetContent length:`, chunk.TargetContent ? chunk.TargetContent.length : 0);
              console.log(`    Chunk ${idx} ReplacementContent length:`, chunk.ReplacementContent ? chunk.ReplacementContent.length : 0);
            });
          }
        }
      }
    }
  } catch (e) {
    console.log(`Error reading ${file}:`, e.message);
  }
}
