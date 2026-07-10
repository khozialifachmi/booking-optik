import { auth } from "./lib/auth";

console.log("auth keys:", Object.keys(auth));
if ((auth as any).password) {
  console.log("auth.password keys:", Object.keys((auth as any).password));
} else {
  console.log("auth.password is undefined");
}

console.log("auth.$context keys:", Object.keys(auth.$context));
if (auth.$context.password) {
  console.log("auth.$context.password keys:", Object.keys(auth.$context.password));
}
