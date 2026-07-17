import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const rawData = [
  { no: 1, name: "Raihan", result: "Minus 3", arrival: "09:00", start: "09:00", completion: "09:20", age: 29, gender: "Laki-laki" },
  { no: 2, name: "Oktaviana Silitonga", result: "Minus 2", arrival: "09:05", start: "09:20", completion: "09:40", age: 35, gender: "Perempuan" },
  { no: 3, name: "Candra Widiati", result: "Minus 1", arrival: "09:12", start: "09:40", completion: "10:00", age: 37, gender: "Perempuan" },
  { no: 4, name: "Putri Nur Arfianti", result: "Minus 2,5", arrival: "09:20", start: "10:00", completion: "10:20", age: 30, gender: "Perempuan" },
  { no: 5, name: "Yuli Susi Karmila Sari", result: "Minus 2,5", arrival: "09:32", start: "10:20", completion: "10:40", age: 46, gender: "Perempuan" },
  { no: 6, name: "Eli", result: "Minus 2", arrival: "09.50", start: "10.40", completion: "11.00", age: 45, gender: "Perempuan" },
  { no: 7, name: "Susi", result: "Minus 2", arrival: "10.00", start: "11.00", completion: "11.20", age: 39, gender: "Perempuan" },
  { no: 8, name: "Desi Ikarimawati", result: "Minus 3", arrival: "10.07", start: "11.20", completion: "11.40", age: 29, gender: "Perempuan" },
  { no: 9, name: "May Liana Sari", result: "Minus 2", arrival: "10.40", start: "11.40", completion: "12.00", age: 37, gender: "Perempuan" },
  { no: 10, name: "Sudirman", result: "Minus 3,5", arrival: "11.10", start: "12.00", completion: "12.20", age: 48, gender: "Laki-laki" },
  { no: 11, name: "Ossa", result: "Minus 0,5", arrival: "11.50", start: "12.20", completion: "12.40", age: 25, gender: "Perempuan" },
  { no: 12, name: "Irwandi", result: "Minus 0,5", arrival: "12.03", start: "12.40", completion: "13.00", age: 40, gender: "Laki-laki" },
  { no: 13, name: "Hudorie", result: "Minus 0,5 Plus 1", arrival: "12.48", start: "13.00", completion: "13.20", age: 36, gender: "Laki-laki" },
  { no: 14, name: "Lucky", result: "Minus 3 Plus 1,5", arrival: "13.03", start: "13.20", completion: "13.40", age: 34, gender: "Laki-laki" },
  { no: 15, name: "Rahma", result: "Plus 1", arrival: "13.15", start: "13.40", completion: "14.00", age: 28, gender: "Perempuan" },
  { no: 16, name: "Ummayah", result: "Plus 1,75", arrival: "13.55", start: "14.00", completion: "14.20", age: 34, gender: "Perempuan" },
  { no: 17, name: "Seri Jubaedah", result: "Minus 0,5 Plus 1,75", arrival: "14.02", start: "14.20", completion: "14.40", age: 39, gender: "Perempuan" },
  { no: 18, name: "Dimas", result: "Minus 0,5", arrival: "14.28", start: "14.40", completion: "15.00", age: 34, gender: "Laki-laki" },
  { no: 19, name: "Sabila", result: "Minus 5", arrival: "14.46", start: "15.00", completion: "15.20", age: 38, gender: "Perempuan" },
  { no: 20, name: "Tari", result: "Minus 2", arrival: "15.02", start: "15.20", completion: "15.40", age: 30, gender: "Perempuan" }
];

function cleanTime(timeStr) {
  return timeStr.replace(".", ":").trim();
}

function parseSph(result) {
  let sph = null;
  const lower = result.toLowerCase();
  if (lower.includes("minus")) {
    const match = lower.match(/minus\s*(\d+([,\.]\d+)?)/);
    if (match) {
      const val = parseFloat(match[1].replace(",", "."));
      sph = `-${val.toFixed(2)}`;
    }
  } else if (lower.includes("plus")) {
    const match = lower.match(/plus\s*(\d+([,\.]\d+)?)/);
    if (match) {
      const val = parseFloat(match[1].replace(",", "."));
      sph = `+${val.toFixed(2)}`;
    }
  }
  return sph;
}

const knownPhones = {
  "raihan": "089537931336",
  "oktaviana silitonga": "088814928499",
  "candra widiati": "085636246519",
  "putri nur arfianti": "089580682423",
  "yuli susi karmila sari": "089558946126",
  "eli": "088850788369",
  "susi": "087816983896"
};

const prefixes = ["0898", "0856", "0878", "0813", "0888", "0855", "0812", "0821", "0895", "0896"];
const usedPhones = new Set(Object.values(knownPhones));

function getPhoneForUser(name) {
  const normalized = name.toLowerCase().trim();
  if (knownPhones[normalized]) {
    return knownPhones[normalized];
  }
  // Generate random realistic phone number
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

// Password hash map per email — format: NamaDepan123 (jika ≥8 karakter) atau NamaDepan1234 (jika <8 karakter)
// Eli/May/Yuli/Susi/Desi/Ossa/Seri/Tari (≤4 huruf) → pakai 1234
const passwordHashes = {
  "raihan@gmail.com":    "33fdaea7ae0c9f7f00688ae0e6fb218e:138913fdb867935e0e0eb5308b23b607ea91a2bddad24e7d51fd7980395ecf5ffca4dd80df07bf27d02c9846f46e244ca3add664683b5d53ab04ec51fa876878",   // Raihan123
  "oktaviana@gmail.com": "e6437988c89d24035d656e58f03caaf7:52d42cd71afb8470ecc2c517f513e9dac273b22ee8ab819c858171396b13279acbd0872d9f7b3d7b1051cc98ed89d7a589977c09d28e0e4b218de715c166dcfb",  // Oktaviana123
  "candra@gmail.com":    "5a317d087534975b91cc08cea0d14309:6c5838f5d6ca8fee2598c144ffde418dde5e7815f4564981c884f7160a86574c3eb22c9e77451d39dc5f66db2e42f08c5aae9a1273c253868853580b2d19ea06",   // Candra123
  "putri@gmail.com":     "a085d158c8a384119d82bf91637e9e4f:a719f6b01b22198dd041b432471c906cc1bd37ec6a532d00bba1c289bf468fab6073eb19ca476c0f174497ce17298fdfc2c71419f2aacab58bff1f2df8c5e716",   // Putri123
  "yuli@gmail.com":      "e2bf65e007ed89b52e6d32000fabf537:8f207628bc51a3c4b58b05de78dda37ed0e2a38d6a1bd9b2023eb95d202ad56a22cb2c74f8e1a739c922ee3488aab236c61b16728c99d3268cad2311d404f5d3",    // Yuli1234
  "eli@gmail.com":       "993ca03f81eb6a5773434bafe9596a45:961c790a859416b323e436a3b57020a5b574605938361601b0fee27922d31f1bf70ce7ce0222e88e975ed94d64fccd2164a66f09506b9ca20b9ebfd9b9eac1fa",    // Eli1234
  "susi@gmail.com":      "18e1f46bfbd1076c0507db95131ace23:5db70bd18b62a4337b28728c9dce8a9c77381c4608a6741f2928ea516181df7fa0388b94d03f84e1ab2d2862aa1f426079810a25a9471c643cd9542c2ac0d0af",    // Susi1234
  "desi@gmail.com":      "34ce97ddaf5b5eb0d4c9ec5db1053750:790036bad9b4ad000fc33af011febdd86430afb88f9f2e7e8fdbc27c991de95a8158a2f9e16205b78b96dbbb38ba14cc0c0c240996e31dd4bdfe768f75f7afdf",    // Desi1234
  "may@gmail.com":       "9dff3e2436e11d16b2c5bc7d8dc6c3cf:8faecac4da8846501338acf815caedf92246ef98baa6a0e11d7e75bb39c76b3bd272dd097114a18f77fd7930baed38f27cc76b33f83385e068e8ee49716246f5",    // May1234
  "sudirman@gmail.com":  "c623753c69784b693044fecd31728a7a:9898308c78070475c79b43a03e96a802665ab1a69c45a991ffd5b2cff32e723af63661e5810002c5e32966581facd1f6c83894b6d2e54f200e17ec0272457339",  // Sudirman123
  "ossa@gmail.com":      "581cc34904fd10153a0dada8091545b1:642ef6e7b6fe7fa0d4e0924e348c8f0a9a1d227e3596b612a64f1c8f6bb2fa95eb4980521a9f92e409fe7ce06826fd30c3dfffb568dfd69b635a95680cf206da",    // Ossa1234
  "irwandi@gmail.com":   "a0d8ab7970a46ccbac690379d15d9291:a052be3b115d66758c95ea948d39474da98125f3c566663dd3f68b2d36627f2d023242a87c7ea7d0e47fd9163dcc6c75a9c6fbab7565974dec7eeb71a968fde9",   // Irwandi123
  "hudorie@gmail.com":   "03151768ffdc6f448c4b3adb3d011097:3b926babd634dacd53d60dd682ff35d548d7bf0280baa1cc6da050faf5dfb0ec9b769bb0954181bd132e8dc34b68125c67158b56e46ad856a89880b07dc8963a",   // Hudorie123
  "lucky@gmail.com":     "95d019b3b80658f3dfc4c4465015d75c:835634f5ff8526682ea92e823bd5ed62dca8cf1d41424c1540e2389cc71947646423d7e920444d8df526df116b580e7f874d1973affdee99002c9ce171d00196",    // Lucky123
  "rahma@gmail.com":     "99e2dc26ebebf61d9f3c9413262d8701:9e06a0906a78e34d244d92454fd8847144829420e6da8dee1f64b03bcd194bb6f7ac6434c70b9016fb07f559763d78b746ee7f0da056296926b4c5bc216dcbbb",    // Rahma123
  "ummayah@gmail.com":   "79db83d3167675cd76bdd587467a4d9d:d52bead8a98477a5ab2e125303fc9f8a059b85293e7dfaaffe47b8d8a13ce90c767a7d2af9f8de17d9e3798a780e07a78f4e6de32b42b6f74375ff56f93f57b9",   // Ummayah123
  "seri@gmail.com":      "72d2d9742f9d141b5c8a89e664911b75:f6d707baddeb70ce734ffd8171468a66501b1819b876d23953897ff99e16a5599136b00fefe96556e29ed921127e00d5df835451022385938a5b9eabf35f5c57",    // Seri1234
  "dimas@gmail.com":     "199236ace8169f91f3126ea2d96276cf:0b500bf3d3c9605056e21e9108e42abd0d49dbaecba5551c6ea1f25f2f56865a0f9fdcc2842c754630ae5eb495b5edc176b5f5ad1533cdc754b21c758f92884d",    // Dimas123
  "sabila@gmail.com":    "935d192ded46de7d54df58e050aa227b:73cd6ca2ec196521ea948489a233f7b2abc843de0485e9e07287d107e764c6d973b8bf389bdbb413bbd93171bcf8e34c82360eb36ed8906bfa3ddba328e98b2c",   // Sabila123
  "tari@gmail.com":      "805b946d5cfc5b8d0139d35bd648b58a:832e9574f72a545e9c5cb590a0444cd87689be7d797650cc58dde5eac6a40de8435020f4b098f60f7c8bf19cf45d6b9744adcb46023a269873b28f72e4596a45",    // Tari1234
};


async function main() {
  console.log("Starting seed script for May 15, 2026...");

  const dateBase = "2026-05-15";
  const bookingDate = new Date(`${dateBase}T00:00:00.000Z`);

  // Hapus data booking lama pada tanggal 15 Mei 2026 agar bersih
  const deletedBookings = await prisma.booking.deleteMany({
    where: { bookingDate: bookingDate }
  });
  console.log(`Deleted ${deletedBookings.count} old bookings on ${dateBase}`);

  // Hapus data cashflow lama pada tanggal 15 Mei 2026 agar bersih
  const deletedCashflows = await prisma.cashflow.deleteMany({
    where: { date: bookingDate }
  });
  console.log(`Deleted ${deletedCashflows.count} old cashflow records on ${dateBase}`);

  // Hapus user lama yang emailnya berakhiran @khayra.com atau gmail sabila/tari agar bersih
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { endsWith: '@khayra.com' } },
        { email: "raihan@gmail.com" },
        { email: "oktaviana@gmail.com" },
        { email: "candra@gmail.com" },
        { email: "putri@gmail.com" },
        { email: "yuli@gmail.com" },
        { email: "eli@gmail.com" },
        { email: "susi@gmail.com" },
        { email: "desi@gmail.com" },
        { email: "may@gmail.com" },
        { email: "sudirman@gmail.com" },
        { email: "ossa@gmail.com" },
        { email: "irwandi@gmail.com" },
        { email: "hudorie@gmail.com" },
        { email: "lucky@gmail.com" },
        { email: "rahma@gmail.com" },
        { email: "ummayah@gmail.com" },
        { email: "seri@gmail.com" },
        { email: "dimas@gmail.com" },
        { email: "sabila@gmail.com" },
        { email: "tari@gmail.com" }
      ]
    }
  });
  console.log(`Deleted ${deletedUsers.count} old users from previous runs`);

  for (const row of rawData) {
    const userId = randomUUID();
    // Gunakan nama depan (kata pertama) sebagai email @gmail.com
    const firstName = row.name.toLowerCase().split(' ')[0];
    const email = `${firstName}@gmail.com`;
    const phone = getPhoneForUser(row.name);
    const arrivalTime = new Date(`${dateBase}T${cleanTime(row.arrival)}:00+07:00`);
    const startTime = new Date(`${dateBase}T${cleanTime(row.start)}:00+07:00`);
    const completionTime = new Date(`${dateBase}T${cleanTime(row.completion)}:00+07:00`);

    console.log(`Creating user: ${row.name} (${email})...`);

    // 1. Buat User
    await prisma.user.create({
      data: {
        id: userId,
        name: row.name,
        email: email,
        phone: phone,
        role: "customer",
        createdAt: arrivalTime,
        updatedAt: arrivalTime
      }
    });

    // 2. Buat User Profile
    await prisma.userProfile.create({
      data: {
        userId: userId,
        phone: phone,
        role: "customer",
        createdAt: arrivalTime,
        updatedAt: arrivalTime
      }
    });

    // 3. Buat Account (Autentikasi) - password unik per user sesuai format NamaDepan123
    await prisma.account.create({
      data: {
        userId: userId,
        accountId: email,
        providerId: "credential",
        password: passwordHashes[email] || passwordHashes["raihan@gmail.com"],
        createdAt: arrivalTime,
        updatedAt: arrivalTime
      }
    });

    // 4. Buat Booking
    const bookingId = randomUUID();
    const sphValue = parseSph(row.result) || "-1.00";
    const notesStr = `Nama: ${row.name} | HP: ${phone} | Usia: ${row.age} | Kelamin: ${row.gender} | Keluhan: Hasil periksa: ${row.result} | Kacamata: Tidak`;

    // Buat status completed untuk seluruh 20 antrean
    let status = "completed";
    let actualStart = startTime;

    await prisma.booking.create({
      data: {
        id: bookingId,
        userId: userId,
        bookingDate: bookingDate,
        queueNumber: row.no,
        serviceType: "Pemeriksaan Mata",
        status: status,
        estimatedServiceTime: arrivalTime,
        actualServiceTime: actualStart,
        notes: notesStr,
        sortPriority: row.no,
        createdAt: arrivalTime
      }
    });

    // Gunakan raw SQL untuk memperbarui updatedAt ke Completion Time karena Prisma otomatis mengubah updatedAt ke waktu eksekusi
    if (status === "completed") {
      await prisma.$executeRawUnsafe(
        `UPDATE bookings SET "updatedAt" = $1 WHERE id = $2`,
        completionTime,
        bookingId
      );
    } else if (status === "serving") {
      // Set updatedAt ke waktu mulai dilayani
      await prisma.$executeRawUnsafe(
        `UPDATE bookings SET "updatedAt" = $1 WHERE id = $2`,
        startTime,
        bookingId
      );
    }

    // 5. Buat Rekam Medis (Medical Record)
    if (status === "completed") {
      await prisma.medicalRecord.create({
        data: {
          userId: userId,
          bookingId: bookingId,
          rightSph: sphValue,
          leftSph: sphValue,
          notes: `Hasil periksa: ${row.result}`,
          createdAt: completionTime,
          updatedAt: completionTime
        }
      });
    }

    // 6. Buat Cashflow (Keuangan)
    await prisma.cashflow.create({
      data: {
        type: "income",
        amount: 15000,
        description: `Pendaftaran Pemeriksaan Mata - ${row.name}`,
        date: bookingDate,
        notes: `Otomatis dari verifikasi booking ID: ${bookingId}`,
        createdAt: startTime,
        updatedAt: startTime
      }
    });
  }

  console.log("Finished seeding data successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
