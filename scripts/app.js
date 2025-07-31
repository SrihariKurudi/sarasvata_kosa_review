import { sheetConfig } from './config.js';
import { renderTabs } from './tabs.js';
import { getSheetData } from './data.js';
import { renderEntries, loadStatuses } from './entries.js';
import { filterEntries } from './search.js';
import { adjustNavbar } from './ui.js';

async function init() {
  renderTabs(loadSheet);
  document.getElementById('searchBox')
    .addEventListener('input', filterEntries);
  window.addEventListener('scroll', adjustNavbar);

  const firstUrl = Object.values(sheetConfig)[0];
  loadSheet(firstUrl);
}

async function loadSheet(url) {
  try {
    await loadStatuses();
    const rows = await getSheetData(url);
    console.log("Fetched rows:", rows);
    renderEntries(rows);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    document.getElementById('dictionary').innerHTML =
      "<p style='color:red;'>❌ Failed to load data. Check sheet visibility or format.</p>";
  }
}

init();

import { supabase } from './supabaseClient.js';
import { entryStatuses, colorCodeEntry } from './entries.js'; // ensure these are exported

function getSubEntryIdFromKey(key) {
  // This reconstructs the ID from key (e.g., 'headword|संस्कृतपदम्')
  const allEntries = document.querySelectorAll('.subentry');
  for (const div of allEntries) {
    const word = div.dataset.word;
    const sanskrit = div.dataset.sanskrit;
    const idKey = `${word?.toLowerCase()}|${sanskrit?.replace(/\s+/g, '')}`;
    if (idKey === key) return div.id;
  }
  return null;
}

supabase
  .channel('entries_review_realtime')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'entries_review'
    },
    (payload) => {
      const updated = payload.new;
      const key = `${updated.angla_padam.toLowerCase()}|${updated.samskrta_padam.replace(/\s+/g, '')}`;
      entryStatuses[key] = updated.status;

      const subId = getSubEntryIdFromKey(key);
      if (subId) {
        console.log(`🔁 Realtime updated: ${key} → ${updated.status}`);
        colorCodeEntry(subId, updated.status);
        const checked = document.querySelector(`input[name="status-${subId}"][value="${updated.status}"]`);
        if (checked) checked.checked = true;
      }
    }
  )
  .subscribe();
