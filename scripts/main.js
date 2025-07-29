import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Replace with your actual keys
const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchEntries() {
  const { data, error } = await supabase.from('entries').select('*')
  if (error) {
    console.error('Fetch error:', error)
    return
  }
  console.log('✅ Fetched:', data)
  // Render to HTML here...
}

async function updateStatus(id, newStatus) {
  const { error } = await supabase.from('entries')
    .update({ status: newStatus })
    .eq('id', id)
  if (error) {
    console.error('Update error:', error)
  } else {
    console.log('✅ Status updated')
  }
}
