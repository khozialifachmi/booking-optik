// Generate password for each user: capitalize first letter of email prefix + "123"
// Min password is 8 chars. If result < 8, append sequential number until >= 8.
import { auth } from "../lib/auth";

const rawData = [
  { no: 1, email: "raihan@gmail.com" },
  { no: 2, email: "oktaviana@gmail.com" },
  { no: 3, email: "candra@gmail.com" },
  { no: 4, email: "putri@gmail.com" },
  { no: 5, email: "yuli@gmail.com" },
  { no: 6, email: "eli@gmail.com" },
  { no: 7, email: "susi@gmail.com" },
  { no: 8, email: "desi@gmail.com" },
  { no: 9, email: "may@gmail.com" },
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

function getPassword(email: string, no: number): string {
  const prefix = email.split("@")[0]; // e.g. "eli", "raihan"
  const capitalized = prefix.charAt(0).toUpperCase() + prefix.slice(1); // "Eli", "Raihan"
  let password = capitalized + "123";
  // Min 8 chars: if still too short, append sequential number
  if (password.length < 8) {
    password = password + no.toString();
  }
  return password;
}

async function main() {
  const ctx = await auth.$context;
  for (const u of rawData) {
    const password = getPassword(u.email, u.no);
    const hash = await ctx.password.hash(password);
    console.log(`${u.email} | password: ${password} | hash: ${hash}`);
  }
}

main().catch(console.error);
