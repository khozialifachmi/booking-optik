import { auth } from "../lib/auth";

async function main() {
  console.log("Instantiating auth successfully!");
  console.log("Auth session API is available:", typeof auth.api.getSession);
}

main().catch(console.error);
