const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const folders = ["../app", "../components"];
console.log("Searching for 'render={<Link' references...");

folders.forEach(folder => {
  const absPath = path.resolve(__dirname, folder);
  if (!fs.existsSync(absPath)) return;
  
  walkDir(absPath, filePath => {
    if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx") && !filePath.endsWith(".js")) return;
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("render={<Link")) {
      console.log(`Found reference in: ${filePath}`);
      // Find matching lines
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.includes("render={<Link")) {
          console.log(`  Line ${index + 1}: ${line.trim()}`);
        }
      });
    }
  });
});
