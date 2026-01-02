import { createClient } from '@supabase/supabase-js';

// Reemplazar con tus valores de Supabase
const SUPABASE_URL = 'https://nidiwzzufgdezjkebyer.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gttN6T1cCsore876_i2mpg_k-dYm_U9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
};
