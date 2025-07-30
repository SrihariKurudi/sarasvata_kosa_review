// supabaseClient.js
const { createClient } = supabase;

const SUPABASE_URL = 'https://elvtvoqhzlotjqtrldqx.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key'; // Keep this anon (not service role)

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
