const fs = require('fs');
const transcriptPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a6e2a7c8-f82c-4f62-9a55-2bda3c38e4e3\\.system_generated\\logs\\transcript_full.jsonl';

try {
  const fileContent = fs.readFileSync(transcriptPath, 'utf8');
  const lines = fileContent.split('\n');
  
  let count = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.includes('app/(admin)/admin/dashboard/page.tsx') && line.length > 5000) {
      console.log(`Match ${count}: length = ${line.length}`);
      // Save it to a temp file
      fs.writeFileSync(`scratch/big-match-${count}.json`, line, 'utf8');
      count++;
    }
  }
  console.log(`Done. Found ${count} big matches.`);
} catch (e) {
  console.error(e);
}
