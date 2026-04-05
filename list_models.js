const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const keyMatch = env.match(/GEMINI_API_KEY=([^\n\r]+)/);
if (!keyMatch) { 
  console.error("Key not found"); 
  process.exit(1); 
}
const key = keyMatch[1];

async function run() {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
    const data = await res.json();
    console.log("AVAILABLE MODELS:");
    if (data.models) {
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log(data);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
