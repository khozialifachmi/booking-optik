import { auth } from "../lib/auth";

async function main() {
  console.log("auth.$context keys:", Object.keys(auth.$context));
  if (auth.$context.password) {
    console.log("auth.$context.password keys:", Object.keys(auth.$context.password));
    console.log("auth.$context.password.hashPassword:", typeof auth.$context.password.hashPassword);
    console.log("auth.$context.password.verifyPassword:", typeof auth.$context.password.verifyPassword);
  }
  
  // Also check if we can call setPassword with some context or bypass
  const internalPassword = (auth as any).internalPassword;
  console.log("internalPassword:", typeof internalPassword);
}

main().catch(console.error);
