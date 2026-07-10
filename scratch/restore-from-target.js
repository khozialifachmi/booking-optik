const fs = require('fs');

try {
  const raw = fs.readFileSync('scratch/big-match-0.json', 'utf8');
  const obj = JSON.parse(raw);
  const toolCall = obj.tool_calls[0];
  if (toolCall && toolCall.args && toolCall.args.TargetContent) {
    const originalContent = toolCall.args.TargetContent;
    console.log("Original content length from TargetContent:", originalContent.length);
    fs.writeFileSync('app/(admin)/admin/dashboard/page.tsx', originalContent, 'utf8');
    console.log("SUCCESSFULLY RESTORED original file from TargetContent!");
  } else {
    console.log("Could not find TargetContent in tool call args.");
  }
} catch (e) {
  console.error("Error:", e.message);
}
