// ─── Module Imports ────────────────────────────────────────────────────────────
import { sheetConfig } from './config.js';
import { renderTabs } from './tabs.js';
import { getSheetData } from './data.js';
import { renderEntries } from './entries.js';
import { loadStatuses, entryStatuses, colorCodeEntry } from './status.js';
import { filterEntries } from './search.js';
import { adjustNavbar } from './ui.js';
import { supabase } from './supabaseClient.js';

// ─── Initialize Application ────────────────────────────────────────────────────
async function init() {
  renderTabs(loadSheet); // Populate tab UI and bind load handler

  document.getElementById('searchBox')
    .addEventListener('input', filterEntries);

  window.addEventListener('scroll', adjustNavbar);

  const firstUrl = Object.values(sheetConfig)[0];
  loadSheet(firstUrl); // Load the first sheet on startup
}

// ─── Load Data from Sheet and Populate UI ──────────────────────────────────────
async function loadSheet(url) {
  try {
    const statuses = await loadStatuses(supabase);
    console.log("🔎 [DEBUG] Statuses just loaded:", statuses);

    const rows = await getSheetData(url);
    console.log("📥 Fetched rows:", rows);

    renderEntries(rows);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    document.getElementById('dictionary').innerHTML =
      "<p style='color:red;'>❌ Failed to load data. Check sheet visibility or format.</p>";
  }
}

// ─── Handle Tab Selection ──────────────────────────────────────────────────────
window.onTabSelect = loadSheet;

// ─── Helper: Map Supabase Entry Key to DOM ID ──────────────────────────────────
function getSubEntryIdFromKey(key) {
  const allEntries = document.querySelectorAll('.subentry');
  for (const div of allEntries) {
    const word = div.dataset.word;
    const sanskrit = div.dataset.sanskrit;
    const idKey = `${word?.toLowerCase()}|${sanskrit?.replace(/\s+/g, '')}`;
    if (idKey === key) return div.id;
  }
  return null;
}

// ─── Supabase Realtime Subscription ────────────────────────────────────────────
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

        const checked = document.querySelector(
          `input[name="status-${subId}"][value="${updated.status}"]`
        );
        if (checked) checked.checked = true;
      }
    }
  )
  .subscribe();

// ─── Bootstrapping ─────────────────────────────────────────────────────────────
init();
