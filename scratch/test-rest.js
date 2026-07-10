async function testRest() {
  const url = "https://szdqkrgjguhfmaynooba.supabase.co";
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url);
    console.log(`Status:`, res.status);
    const text = await res.text();
    console.log(`Response snippet:`, text.substring(0, 500));
  } catch (err) {
    console.log(`Fetch error:`, err);
  }
}

testRest();
