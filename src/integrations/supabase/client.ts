import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://txfbibjcejsntkhatczr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4ZmJpYmpjZWpzbnRraGF0Y3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDQzMDEsImV4cCI6MjA5MTA4MDMwMX0.OHNmTKQ9tCDlb6XedAvMSs2dAtsYltIjGtJstd_qlUQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
