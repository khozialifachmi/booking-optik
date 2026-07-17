const d = new Date("2026-07-17T11:14:00.000Z");
console.log("Original Date:", d.toISOString());
console.log("Local string default:", d.toLocaleString());
console.log("Jakarta string default:", d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
console.log("Jakarta time string:", d.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }));
