import { supabase } from './supabaseClient.js';

import {
  entryStatuses,
  loadStatuses,
  updateStatus,
  colorCodeEntry
} from './status.js';

// ─── Render All Glossary Entries ──────────────────────────────────────────────
export function renderEntries(rows) {
  const container = document.getElementById('entries-container');
  container.innerHTML = ''; // Clear existing content

  // Group rows by English headword (आङ्ग्लपदम्)
  const grouped = {};
  for (const row of rows) {
    const word = row["आङ्ग्लपदम्"]?.trim();
    if (!word) continue;
    if (!grouped[word]) grouped[word] = [];
    grouped[word].push(row);
  }

  // Helper to normalize keys
  const normalize = s => s?.trim().toLowerCase().replace(/\s+/g, '');

  Object.entries(grouped).forEach(([word, groupRows], groupIndex) => {
    const entryId = `entry-${groupIndex}`;
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';
    entryDiv.id = entryId;

    // Main headword
    const title = document.createElement('h3');
    title.className = 'headword';
    title.textContent = word;
    entryDiv.appendChild(title);

    groupRows.forEach((row, i) => {
      const samskrta = row["संस्कृतपदम्"]?.trim() || '';
      const notes = (row["टिप्पणं/पदान्तरङ्गम्"] || '').replace(/\n/g, '<br>');
      const example = (row["उदाहरणवाक्यम्"] || '').replace(/\n/g, '<br>');

      const subId = `${entryId}-${i}`;
      const statusKey = `${normalize(word)}|${normalize(samskrta)}`;
      const currentStatus = entryStatuses[statusKey];
      console.log('🔑 Looking for statusKey:', statusKey, '→ Found:', entryStatuses[statusKey]);

      if (i > 0) {
        entryDiv.appendChild(document.createElement('hr'));
      }

      const subDiv = document.createElement('div');
      subDiv.className = 'subentry';
      subDiv.id = subId;
      subDiv.dataset.word = word;
      subDiv.dataset.sanskrit = samskrta.replace(/\s+/g, '');

      // Glossary content display
      const para = document.createElement('p');
      para.innerHTML = `
        <div class="sanskrit">${samskrta}</div>
        ${notes   ? `<div><b>📘 पदान्तरङ्गम्</b><div class="notes">${notes}</div></div>` : ''}
        ${example ? `<div><b>📝 उदाहरणम्</b><div class="example"><i>${example}</i></div></div>` : ''}
      `;
      subDiv.appendChild(para);

      // Status radio buttons
      const statusBox = document.createElement('div');
      statusBox.className = 'status-radio';

      ['संस्कार्यम्', 'समीक्ष्यम्', 'सिद्धम्'].forEach(opt => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `status-${subId}`;
        input.value = opt;
        if (currentStatus === opt) input.checked = true;
        input.onclick = () =>
          updateStatus(subId, word, samskrta, notes, example, opt, supabase);
        label.appendChild(input);
        label.append(` ${opt} `);
        statusBox.appendChild(label);
      });

      // Clear button
      const clearBtn = document.createElement('button');
      clearBtn.textContent = '❌ Clear';
      clearBtn.className = 'clear-button';
      clearBtn.onclick = async () => {
        // Reset all selections
        statusBox.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        colorCodeEntry(subId, null);

        const fallbackStatus = 'अपरीक्षितम्';

        const { error } = await supabase
          .from('entries_review')
          .upsert(
            {
              angla_padam: word.trim().toLowerCase(),
              samskrta_padam: samskrta.trim(), // retain inner spaces
              status: fallbackStatus
            },
            { onConflict: ['angla_padam', 'samskrta_padam'] }
          );

        if (error) {
          console.error('❌ Failed to reset status to अपरीक्षितम्:', error);
        } else {
          const key = `${normalize(word)}|${normalize(samskrta)}`;
          entryStatuses[key] = fallbackStatus;
          colorCodeEntry(subId, fallbackStatus);
          subDiv.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
          console.log(`🧹 Cleared: ${word} ⇨ ${samskrta} → set to अपरीक्षितम्`);
        }
      };
      statusBox.appendChild(clearBtn);
      subDiv.appendChild(statusBox);

      // Apply color code if status pre-selected
      const checked = statusBox.querySelector('input[type="radio"]:checked');
      if (checked) {
        colorCodeEntry(subId, checked.value);
      }

      entryDiv.appendChild(subDiv);
    });

    container.appendChild(entryDiv);
  });

  // Final pass to apply color coding to all subentries
  document.querySelectorAll('.subentry').forEach(div => {
    const checked = div.querySelector('input[type="radio"]:checked');
    if (checked) {
      colorCodeEntry(div.id, checked.value);
    }
  });
}
