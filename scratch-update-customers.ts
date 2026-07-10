const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  { name: 'Raihan', usia: '29', hasil: 'Minus 3' },
  { name: 'Oktaviana Silitonga', usia: '35', hasil: 'Minus 2' },
  { name: 'Candra Widiati', usia: '37', hasil: 'Minus 1' },
  { name: 'Putri Nur Arfianti', usia: '30', hasil: 'Minus 2,5' },
  { name: 'Yuli Susi Karmila Sari', usia: '46', hasil: 'Minus 2,5' },
  { name: 'Eli', usia: '45', hasil: 'Minus 2' },
  { name: 'Susi', usia: '39', hasil: 'Minus 2' },
  { name: 'Desi Ikarimawati', usia: '29', hasil: 'Minus 3' },
  { name: 'May Liana Sari', usia: '37', hasil: 'Minus 2' },
  { name: 'Sudirman', usia: '48', hasil: 'Minus 3,5' },
  { name: 'Ossa', usia: '25', hasil: 'Minus 0,5' },
  { name: 'Irwandi', usia: '40', hasil: 'Minus 0,5' },
  { name: 'Hudorie', usia: '36', hasil: 'Minus 0,5 / Plus 1' },
  { name: 'Lucky', usia: '34', hasil: 'Minus 3 / Plus 1,5' },
  { name: 'Rahma', usia: '28', hasil: 'Plus 1' },
  { name: 'Ummayah', usia: '34', hasil: 'Plus 1,75' },
  { name: 'Seri Jubaedah', usia: '39', hasil: 'Minus 0,5 / Plus 1,75' },
  { name: 'Dimas', usia: '34', hasil: 'Minus 0,5' },
  { name: 'Sabila', usia: '38', hasil: 'Minus 5' },
  { name: 'Tari', usia: '30', hasil: 'Minus 2' },
];

async function run() {
  console.log("Fetching bookings...");
  const bookings = await prisma.booking.findMany({
    include: { user: { include: { profile: true } } }
  });

  for (const b of bookings) {
    if (!b.notes) continue;
    
    // Parse notes
    // format: Nama: X | HP: Y | Usia: Z | Kelamin: W | Keluhan: V | Kacamata: U
    const parts = b.notes.split(" | ");
    let extractedName = "";
    
    for (const p of parts) {
      if (p.startsWith("Nama: ")) extractedName = p.replace("Nama: ", "").trim();
    }
    
    // Find matching update
    const update = updates.find(u => u.name.toLowerCase() === extractedName.toLowerCase() || (b.user && b.user.name.toLowerCase() === u.name.toLowerCase()));
    
    if (update) {
      // Rebuild notes with updated Usia and Keluhan
      const newParts = parts.map(p => {
        if (p.startsWith("Usia: ")) return `Usia: ${update.usia}`;
        if (p.startsWith("Keluhan: ")) return `Keluhan: ${update.hasil}`;
        return p;
      });
      
      const newNotes = newParts.join(" | ");
      
      await prisma.booking.update({
        where: { id: b.id },
        data: { notes: newNotes }
      });
      
      console.log(`Updated ${update.name}`);
    }
  }
  
  console.log("Done!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
