import { auth } from "../lib/auth";

async function main() {
  const ctx = await auth.$context;
  const hash = await ctx.password.hash("Tari1234");
  console.log("HASH:", hash);
}

main().catch(console.error);
