import { createClient } from '@supabase/supabase-js';

const cleanEnvVar = (val) => {
  if (!val) return val;
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = cleanEnvVar(import.meta.env.VITE_SUPABASE_URL);
const supabaseKey = cleanEnvVar(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase URL or Key missing in Frontend .env!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
