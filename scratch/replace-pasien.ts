import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'app/(admin)/admin/fcfs/page.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Pasien/g, 'Pelanggan');
content = content.replace(/pasien/g, 'pelanggan');

fs.writeFileSync(file, content);
console.log('Replaced Pasien with Pelanggan in fcfs/page.tsx');
