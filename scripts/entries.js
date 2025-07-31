import { supabase } from './supabaseClient.js';

const entryStatuses = {};

export async function loadStatuses() {
  const { data, error } = await supabase
    .from('entries_review')
    .select('angla_padam, samskrta_padam, status');

  if (error) {
    console.error('❌ Error loading statuses:', error);
    return {};
  }

const normalize = s => s?.trim().toLowerCase().replace(/\s+/g, '');
const statusMap = {};
for (const row of data) {
  const key = `${normalize(row.angla_padam)}|${normalize(row.samskrta_padam)}`;
  statusMap[key] = row.status;
}


  Object.assign(entryStatuses, statusMap);
  console.log('✅ Loaded statuses from Supabase:', entryStatuses);
  return statusMap;
}


async function updateStatus(entryId, anglaPadam, samskrtaPadam, _notes, _example, newStatus) {
  const { error } = await supabase
    .from('entries_review')
    .upsert(
      {
        angla_padam: anglaPadam,
        samskrta_padam: samskrtaPadam,
        status: newStatus
      },
      { onConflict: ['angla_padam', 'samskrta_padam'] }
    );

  if (error) {
    console.error('❌ Failed to update status:', error);
  } else {
    console.log(`✅ Saved: ${anglaPadam} ⇨ ${samskrtaPadam} = ${newStatus}`);
    entryStatuses[`${anglaPadam.toLowerCase()}|${samskrtaPadam}`] = newStatus;
    colorCodeEntry(entryId, newStatus);
  }
}

function colorCodeEntry(entryId, status) {
  const div = document.getElementById(entryId);
  if (!div) {
    console.warn('No div found for:', entryId);
    return;
  }

  let color = "#eee";
  if (status === "संस्कार्यम्") color = "#ffdddd";
  else if (status === "समीक्ष्यम्") color = "#fff7cc";
  else if (status === "सिद्धम्") color = "#ddffdd";

  div.style.backgroundColor = color;
  console.log(`🎨 ${entryId} → ${status} → ${color}`);
}


export function renderEntries(rows) {
  const container = document.getElementById('entries-container');
  container.innerHTML = ''; // Clear existing

  // Group rows by angla_padam
  const grouped = {};
  for (const row of rows) {
    const word = row["आङ्ग्लपदम्"]?.trim();
    if (!word) continue;
    if (!grouped[word]) grouped[word] = [];
    grouped[word].push(row);
  }

  Object.entries(grouped).forEach(([word, groupRows], groupIndex) => {
    const entryId = `entry-${groupIndex}`;
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';
    entryDiv.id = entryId;

    const title = document.createElement('h3');
    title.className = 'headword';
    title.textContent = word;
    entryDiv.appendChild(title);

    groupRows.forEach((row, i) => {
      const samskrta = row["संस्कृतपदम्"]?.trim() || '';
      const notes = (row["टिप्पणं/पदान्तरङ्गम्"] || '').replace(/\n/g, '<br>');
      const example = (row["उदाहरणवाक्यम्"] || '').replace(/\n/g, '<br>');
      const subId = `${entryId}-${i}`;
      const normalize = s => s?.trim().toLowerCase().replace(/\s+/g, '');
      const statusKey = `${normalize(word)}|${normalize(samskrta)}`;
      const currentStatus = entryStatuses[statusKey];
      console.log('🔑 Looking for statusKey:', statusKey, '→ Found:', entryStatuses[statusKey]);

      if (i > 0) {
        const hr = document.createElement('hr');
        entryDiv.appendChild(hr);
      }

      const subDiv = document.createElement('div');
      subDiv.className = 'subentry';
      subDiv.id = subId;
      subDiv.dataset.word = word;
      subDiv.dataset.sanskrit = samskrta.replace(/\s+/g, '');

      const para = document.createElement('p');
      para.innerHTML = `
        <div class="sanskrit">${samskrta}</div>
        ${notes   ? `<div><b>📘 पदान्तरङ्गम्</b><div class="notes">${notes}</div></div>` : ''}
        ${example ? `<div><b>📝 उदाहरणम्</b><div class="example"><i>${example}</i></div></div>` : ''}
      `;
      subDiv.appendChild(para);

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
          updateStatus(subId, word, samskrta, notes, example, opt);
        label.appendChild(input);
        label.append(` ${opt} `);
        statusBox.appendChild(label);
      });

      // 💥 Add Clear Button INSIDE the statusBox
      const clearBtn = document.createElement('button');
      clearBtn.textContent = '❌ Clear';
      clearBtn.className = 'clear-button';
      clearBtn.onclick = async () => {
        statusBox.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        colorCodeEntry(subId, null);

        const normalize = s => s?.trim().toLowerCase().replace(/\s+/g, '');
        const fallbackStatus = 'अपरीक्षितम्';

        const { error } = await supabase
          .from('entries_review')
          .upsert(
            {
              angla_padam: word.trim().toLowerCase(),
              samskrta_padam: samskrta.replace(/\s+/g, ''),
              status: fallbackStatus
            },
            { onConflict: ['angla_padam', 'samskrta_padam'] }
          );

        if (error) {
          console.error('❌ Failed to reset status to अपरिक्षितम्:', error);
        } else {
          entryStatuses[statusKey] = fallbackStatus;
          colorCodeEntry(subId, fallbackStatus);
          console.log(`🧹 Cleared: ${word} ⇨ ${samskrta} → set to अपरिक्षितम्`);
        }
      };
      statusBox.appendChild(clearBtn);
      subDiv.appendChild(statusBox);

      const checked = statusBox.querySelector('input[type="radio"]:checked');
      if (checked) {
        colorCodeEntry(subId, checked.value);
      }

      entryDiv.appendChild(subDiv);
    });

    container.appendChild(entryDiv);
  });

  // Final pass to apply color to all subentries after DOM render
  document.querySelectorAll('.subentry').forEach(div => {
    const checked = div.querySelector('input[type="radio"]:checked');
    if (checked) {
      colorCodeEntry(div.id, checked.value);
    }
  });
}

export { entryStatuses, colorCodeEntry };
