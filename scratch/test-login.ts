import { auth } from "../lib/auth";
import { headers } from "next/headers";

async function main() {
  try {
    const res = await auth.api.signInEmail({
      body: {
        email: "tari@gmail.com",
        password: "Tari1234"
      },
      headers: new Headers()
    });
    console.log("SUCCESS", res);
  } catch (e: any) {
    console.error("ERROR", e, e?.message, e?.status, e?.body);
  }
}

main().catch(console.error);
