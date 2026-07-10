import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const prefixes = ["0898", "0856", "0878", "0813", "0888", "0855", "0812", "0821", "0895", "0896"];

function generateRandomPhone(usedPhones: Set<string>) {
  while (true) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8 digits
    const phone = `${prefix}${randomDigits}`;
    if (!usedPhones.has(phone)) {
      usedPhones.add(phone);
      return phone;
    }
  }
}

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'customer' }
  });

  const usedPhones = new Set<string>();

  for (const user of users) {
    const newPhone = generateRandomPhone(usedPhones);
    
    // Update User
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: newPhone }
    });

    // Update UserProfile if exists
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    });

    if (profile) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: { phone: newPhone }
      });
    }

    // Update Booking notes
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id }
    });

    for (const booking of bookings) {
      if (booking.notes && booking.notes.includes(" | HP: ")) {
        // Replace old phone number in notes
        const parts = booking.notes.split(" | ");
        const updatedParts = parts.map(p => {
          if (p.startsWith("HP:")) {
            return `HP: ${newPhone}`;
          }
          return p;
        });
        const newNotes = updatedParts.join(" | ");

        await prisma.booking.update({
          where: { id: booking.id },
          data: { notes: newNotes }
        });
      }
    }
    
    console.log(`Updated user ${user.name} and their bookings to ${newPhone}`);
  }

  console.log(`Successfully updated ${users.length} users and their bookings with random varied phone numbers.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
