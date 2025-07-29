import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://elvtvoqhzlotjqtrldqx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdnR2b3FoemxvdGpxdHJsZHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Njg2MTUsImV4cCI6MjA2OTM0NDYxNX0.wxfW_8GX8wHg_DTMG-uU4BP-j81hUN2j9aFZ-e2pdWs'

export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)
