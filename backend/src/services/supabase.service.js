const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const cleanEnvVar = (val) => {
  if (!val) return val;
  return val.replace(/^['"]|['"]$/g, '').trim();
};

const supabaseUrl = cleanEnvVar(process.env.SUPABASE_URL);
const supabaseKey = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log('--- Supabase Connection Test ---');
console.log('URL:', supabaseUrl);
console.log('Key Length:', supabaseKey?.length);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection immediately
supabase.from('profiles').select('count').limit(1)
  .then(({ error }) => {
    if (error) {
      console.error('❌ ERROR: Database connection failed!', error.message);
      if (error.message.includes('fetch')) {
        console.error('👉 TIP: This looks like a NETWORK BLOCK. Are you behind a firewall/college proxy?');
      }
    } else {
      console.log('✅ SUCCESS: Connected to Supabase Database.');
    }
  });

module.exports = supabase;
