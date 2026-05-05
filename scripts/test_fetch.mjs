const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testFetch() {
  const url = `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: { parts: [{ text: "Hello" }] } })
  });
  
  if (resp.ok) {
    const data = await resp.json();
    console.log("v1 Success! Dimension:", data.embedding.values.length);
  } else {
    const err = await resp.text();
    console.log("v1 Failed:", err);
    
    // Try v1beta
    const urlBeta = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
    const respBeta = await fetch(urlBeta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: { parts: [{ text: "Hello" }] } })
    });
    console.log("v1beta Status:", respBeta.status);
    console.log("v1beta Text:", await respBeta.text());
  }
}

testFetch();
