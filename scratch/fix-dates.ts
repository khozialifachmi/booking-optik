import fs from 'fs';
import path from 'path';

const pages = [
  "app/(admin)/admin/dashboard/page.tsx",
  "app/(admin)/admin/history/page.tsx",
  "app/(admin)/admin/customers/page.tsx",
  "app/(admin)/admin/fcfs/page.tsx",
  "app/(admin)/admin/finances/page.tsx",
  "app/(admin)/admin/accounts/page.tsx",
  "app/(admin)/admin/bookings/page.tsx",
  "app/(admin)/admin/cashflow/page.tsx",
  "app/(customer)/dashboard/page.tsx"
];

const basePath = path.resolve(process.cwd());

for (const p of pages) {
  const fullPath = path.join(basePath, p);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace forced dates with normal ones
  content = content.replace(/\/\/ Forced to May 15, 2026 for demo purposes\n\s*const todayDateUTC = new Date\(Date\.UTC\(2026, 4, 15, 0, 0, 0, 0\)\);/g, 
    "const now = new Date();\n  const jakartaOffset = 7 * 60 * 60 * 1000;\n  const jakartaTime = new Date(now.getTime() + jakartaOffset);\n  const todayDateUTC = new Date(Date.UTC(jakartaTime.getUTCFullYear(), jakartaTime.getUTCMonth(), jakartaTime.getUTCDate(), 0, 0, 0, 0));");
  
  content = content.replace(/const jakartaTime = new Date\(Date\.UTC\(2026, 4, 15, 0, 0, 0, 0\)\);/g, 
    "const now = new Date();\n  const jakartaOffset = 7 * 60 * 60 * 1000;\n  const jakartaTime = new Date(now.getTime() + jakartaOffset);");

  // Fix dashboard targetDate overrides
  content = content.replace(/if \(demoDate >= gte && demoDate <= todayDateUTC\) \{[\s\S]*?targetDate = new Date\(0\); \/\/ empty\n\s*\}/g, "targetDate = gte;");
  
  // Actually, wait, let's just restore from git!
}
