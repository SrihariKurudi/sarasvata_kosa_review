console.log("✅ main.js loaded");

import { sheetConfig }     from './config.js';
import { renderTabs }      from './tabs.js';
import { getSheetData }    from './data.js';
import { renderEntries, loadStatuses } from './entries.js';
import { filterEntries }   from './search.js';
import { adjustNavbar }    from './ui.js';

/* --- bootstrap ---------------------------------------------------------- */

async function init() {
  renderTabs(loadSheet);                   // build tab bar
  document.getElementById('searchBox')
          .addEventListener('input', filterEntries);
  window.addEventListener('scroll', adjustNavbar);

  // initial load (first sheet in config)
  const firstUrl = Object.values(sheetConfig)[0];
  loadSheet(firstUrl);
}

async function loadSheet(url) {
  try {
    await loadStatuses();
    const rows = await getSheetData(url); // ✅ FIXED here
    console.log("Fetched rows:", rows);
    renderEntries(rows);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    document.getElementById('dictionary').innerHTML =
      "<p style='color:red;'>❌ Failed to load data. Check sheet visibility or format.</p>";
  }
}

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


init();