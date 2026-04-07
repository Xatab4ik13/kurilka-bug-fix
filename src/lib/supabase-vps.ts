import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const VPS_SUPABASE_URL = "https://api.kurilka.online";
const VPS_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.7Rkw5xj8ToKWA5mAGwvycb6Zkt0bd_mdL20bcTPfiVw";

export const supabase = createClient<Database>(VPS_SUPABASE_URL, VPS_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
