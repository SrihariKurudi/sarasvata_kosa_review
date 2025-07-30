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

  const statusMap = {};
  for (const row of data) {
    const cleanAngla = row.angla_padam.toLowerCase().trim();
    const cleanSanskrit = row.samskrta_padam.replace(/\s+/g, '').trim(); // remove all spacing
    const key = `${cleanAngla}|${cleanSanskrit}`;
    statusMap[key] = row.status;
  }

  Object.assign(entryStatuses, statusMap); // save globally for later use
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
    const word = row["आङ्ग्लपदम्"]?.trim().toLowerCase();
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
    title.textContent = word;
    entryDiv.appendChild(title);

    groupRows.forEach((row, i) => {
      const samskrta = row["संस्कृतपदम्"]?.trim() || '';
      const notes = row["टिप्पणं/पदान्तरङ्गम्"] || '';
      const example = row["उदाहरणवाक्यम्"] || '';
      const subId = `${entryId}-${i}`;
      const statusKey = `${word}|${samskrta.replace(/\s+/g, '')}`;
      const currentStatus = entryStatuses[statusKey];

      if (i > 0) {
        const hr = document.createElement('hr');
        subContainer.appendChild(hr);
      }
      
      const subDiv = document.createElement('div');
      subDiv.className = 'subentry';
      subDiv.id = subId;

      const para = document.createElement('p');
      para.innerHTML = `
        <b>संस्कृतपदम्:</b> ${samskrta}<br>
        <b>टिप्पणं:</b> ${notes}<br>
        <b>उदाहरणवाक्यम्:</b> ${example}
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
