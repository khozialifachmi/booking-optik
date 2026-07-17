const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Using regex for robust replacement
    const regex = /toLocaleTimeString\(\s*['"]id-ID['"]\s*,\s*\{\s*hour\s*:\s*['"]2-digit['"]\s*,\s*minute\s*:\s*['"]2-digit['"]\s*\}\s*\)/g;
    
    if (regex.test(content)) {
        console.log(`Replacing in ${filePath}`);
        content = content.replace(regex, `toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false })`);
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'scratch') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

const root = path.join(__dirname, '..');
walkDir(path.join(root, 'app'));
walkDir(path.join(root, 'actions'));
walkDir(path.join(root, 'components'));
