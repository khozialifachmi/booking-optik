import * as crypto from "better-auth/crypto";
console.log("crypto keys:", Object.keys(crypto));
if ((crypto as any).hashPassword) {
  console.log("Found hashPassword!");
}
