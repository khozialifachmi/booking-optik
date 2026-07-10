const { auth } = require("../lib/auth");

async function main() {
  console.log("auth.api keys:", Object.keys(auth.api));
  console.log("auth.password keys:", auth.password ? Object.keys(auth.password) : "none");
  console.log("auth.options keys:", Object.keys(auth.options));
}

main().catch(console.error);
