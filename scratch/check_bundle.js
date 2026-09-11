async function check() {
  const res = await fetch("https://kaushal-ai-virtual-labs.vercel.app/assets/index-C1WhxF2w.js");
  const text = await res.text();
  console.log("Bundle length:", text.length);
  
  // Find axios.create or baseURL
  const regex = /baseURL:"([^"]+)"/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    console.log("Found baseURL:", m[1]);
  }

  // Check for any urls
  const urls = text.match(/https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?/g) || [];
  const uniqueUrls = [...new Set(urls)];
  console.log("Unique URLs in bundle:", uniqueUrls);
}
check().catch(console.error);
