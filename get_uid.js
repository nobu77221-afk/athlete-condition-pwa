const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n\r]+)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\n\r]+)/)[1];

const supabase = createClient(url, key);

async function run() {
  const { data } = await supabase.from('daily_targets').select('user_id').limit(1);
  if(data && data.length > 0) {
    console.log("★★★★あなたのUSER_ID★★★★");
    console.log(data[0].user_id);
    console.log("★★★★★★★★★★★★★★★★");
  } else {
    console.log("まだログインとデータの作成が行われていないようです。");
  }
}
run();
