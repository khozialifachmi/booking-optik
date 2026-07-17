const fs = require('fs');
const path = require('path');

const helperContent = `export function formatJakartaTime(date: Date | string | number) {
    const d = new Date(date);
    const jakartaTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const h = jakartaTime.getUTCHours().toString().padStart(2, '0');
    const m = jakartaTime.getUTCMinutes().toString().padStart(2, '0');
    return \`\${h}.\${m}\`;
}
`;

fs.writeFileSync(path.join(__dirname, '../lib/format-time.ts'), helperContent);

const filesToUpdate = [
    'actions/booking-actions.ts',
    'app/(admin)/admin/bookings/page.tsx',
    'app/(admin)/admin/dashboard/page.tsx',
    'app/(admin)/admin/fcfs/page.tsx',
    'app/(customer)/booking/page.tsx',
    'app/(customer)/dashboard/page.tsx',
    'components/booking/booking-form.tsx'
];

const regex = /([a-zA-Z0-9_.\(\)\[\]]+)\.toLocaleTimeString\(\s*['"]id-ID['"]\s*,\s*\{\s*timeZone:\s*['"]Asia\/Jakarta['"]\s*,\s*hour:\s*['"]2-digit['"]\s*,\s*minute:\s*['"]2-digit['"]\s*,\s*hour12:\s*false\s*\}\s*\)/g;

filesToUpdate.forEach(relPath => {
    const absPath = path.join(__dirname, '..', relPath);
    if (!fs.existsSync(absPath)) return;
    
    let content = fs.readFileSync(absPath, 'utf8');
    
    if (content.match(regex)) {
        // Add import
        if (!content.includes('formatJakartaTime')) {
            // Find last import
            const lastImportIndex = content.lastIndexOf('import ');
            const endOfLastImport = content.indexOf('\n', lastImportIndex);
            
            // For components and pages we might need relative import
            // The simplest is to just use '@/lib/format-time'
            const importStatement = `\nimport { formatJakartaTime } from "@/lib/format-time";\n`;
            
            if (endOfLastImport !== -1) {
                content = content.substring(0, endOfLastImport + 1) + importStatement + content.substring(endOfLastImport + 1);
            } else {
                content = importStatement + content;
            }
        }
        
        // Replace method calls
        content = content.replace(regex, (match, objectStr) => {
            return `formatJakartaTime(${objectStr})`;
        });
        
        fs.writeFileSync(absPath, content);
        console.log(`Updated ${relPath}`);
    }
});
