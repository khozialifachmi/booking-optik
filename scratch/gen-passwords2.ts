import { auth } from "../lib/auth";

// Password rules:
// - Use NamaDepan + "123" if result >= 8 chars
// - Use NamaDepan + "1234" if result < 8 chars (4 char & under names)
// - Eli/May (3 chars) → Eli1234 / May1234 (7 chars, still usable)

const users = [
  { no: 1,  email: "raihan@gmail.com" },
  { no: 2,  email: "oktaviana@gmail.com" },
  { no: 3,  email: "candra@gmail.com" },
  { no: 4,  email: "putri@gmail.com" },
  { no: 5,  email: "yuli@gmail.com" },
  { no: 6,  email: "eli@gmail.com" },
  { no: 7,  email: "susi@gmail.com" },
  { no: 8,  email: "desi@gmail.com" },
  { no: 9,  email: "may@gmail.com" },
  { no: 10, email: "sudirman@gmail.com" },
  { no: 11, email: "ossa@gmail.com" },
  { no: 12, email: "irwandi@gmail.com" },
  { no: 13, email: "hudorie@gmail.com" },
  { no: 14, email: "lucky@gmail.com" },
  { no: 15, email: "rahma@gmail.com" },
  { no: 16, email: "ummayah@gmail.com" },
  { no: 17, email: "seri@gmail.com" },
  { no: 18, email: "dimas@gmail.com" },
  { no: 19, email: "sabila@gmail.com" },
  { no: 20, email: "tari@gmail.com" },
];

function getPassword(email: string): string {
  const prefix = email.split("@")[0];
  const cap = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  // Use 1234 suffix if result would be < 8 chars with 123
  return (cap + "123").length >= 8 ? cap + "123" : cap + "1234";
}

async function main() {
  const ctx = await auth.$context;
  for (const u of users) {
    const password = getPassword(u.email);
    const hash = await ctx.password.hash(password);
    console.log(`"${u.email}": "${hash}", // ${password}`);
  }
}

main().catch(console.error);
