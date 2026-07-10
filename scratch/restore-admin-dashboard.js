const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a6e2a7c8-f82c-4f62-9a55-2bda3c38e4e3\\.system_generated\\logs\\transcript_full.jsonl';
const targetFile = 'c:\\Users\\Lenovo\\Documents\\SKRIPSI APP\\booking-optik\\app\\(admin)\\admin\\dashboard\\page.tsx';

try {
  const fileContent = fs.readFileSync(transcriptPath, 'utf8');
  const lines = fileContent.split('\n');
  
  // Find the step where we viewed the file
  let viewFileContent = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const obj = JSON.parse(line);
    if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('Total Lines: 426')) {
      viewFileContent = obj.content;
      break;
    }
  }
  
  if (viewFileContent) {
    console.log("Found original file content in transcript!");
    // Extract lines
    const contentLines = viewFileContent.split('\n');
    const originalLines = [];
    for (const l of contentLines) {
      const match = l.match(/^\d+:\s(.*)/);
      if (match) {
        originalLines.push(match[1]);
      }
    }
    
    const restoredContent = originalLines.join('\n');
    fs.writeFileSync(targetFile, restoredContent, 'utf8');
    console.log("SUCCESSFULLY RESTORED original admin dashboard file!");
  } else {
    console.log("Could not find the view step with 426 lines.");
  }
} catch (e) {
  console.error("Error:", e);
}
