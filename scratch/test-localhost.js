async function testLocalhost() {
  const url = "http://localhost:3000";
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url);
    console.log(`Status:`, res.status);
    const text = await res.text();
    console.log(`Response snippet (first 1000 chars):`);
    console.log(text.substring(0, 1000));
  } catch (err) {
    console.log(`Fetch error:`, err);
  }
}

testLocalhost();
