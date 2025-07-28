import { sheetConfig }     from './config.js';
import { renderTabs }      from './tabs.js';
import { getSheetData }    from './data.js';
import { renderEntries }   from './entries.js';
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
    const rows = await getSheetData(url);
    renderEntries(rows);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    document.getElementById('dictionary').innerHTML =
      "<p style='color:red;'>❌ Failed to load data. Check sheet visibility or format.</p>";
  }
}

init();
