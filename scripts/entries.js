import { supabase } from './supabaseClient.js';

const entryStatuses = {};

export async function loadStatuses() {
  const { data, error } = await supabase
    .from('entries_review')
    .select('angla_padam, status');

  if (error) {
    console.error('❌ Error loading statuses:', error);
    return {};
  }

  const statusMap = {};
  for (const row of data) {
    statusMap[row.angla_padam.toLowerCase()] = row.status;
  }

  Object.assign(entryStatuses, statusMap); // save globally for later use
  console.log('✅ Loaded statuses from Supabase:', entryStatuses);
  return statusMap;
}

async function updateStatus(entryId, anglaPadam, samskrtaPadam, newStatus) {
  const { error } = await supabase
    .from('entries_review')
    .upsert(
      {
        angla_padam: anglaPadam,
        samskrta_padam: samskrtaPadam,
        status: newStatus
      },
      { onConflict: ['angla_padam'] }
    );

  if (error) {
    console.error('❌ Failed to update status:', error);
  } else {
    console.log(`✅ Status for "${anglaPadam}" saved as "${newStatus}"`);
    entryStatuses[anglaPadam.toLowerCase()] = newStatus;
    colorCodeEntry(entryId, newStatus);
  }
}



function colorCodeEntry(id, status) {
  const div = document.getElementById(id);
  if (!div) return;

  let color = "#eee";
  if (status === "संस्कार्यम्") color = "#ffcccc"; // red
  else if (status === "समीक्ष्यम्") color = "#fff9cc"; // yellow
  else if (status === "सिद्धम्") color = "#ccffcc"; // green

  div.style.backgroundColor = color;
}

export function renderEntries(rows) {
  const container = document.getElementById('dictionary');
  container.innerHTML = '';

  rows.forEach((row, i) => {
    const id = `entry-${i}`;
    const word = row["आङ्ग्लपदम्"]?.toLowerCase();
    const sanskrit = row["संस्कृतपदम्"] || '';
    const notes = row["टिप्पणं/पदान्तरङ्गम्"] || '';
    const example = row["उदाहरणवाक्यम्"] || '';

    if (!word) return;

    const div = document.createElement('div');
    div.className = 'entry';
    div.id = id;

    const title = document.createElement('h3');
    title.textContent = word;
    div.appendChild(title);

    const body = document.createElement('p');
    body.innerHTML = `
      <b>संस्कृतपदम्:</b> ${sanskrit}<br>
      <b>टिप्पणं:</b> ${notes}<br>
      <b>उदाहरणवाक्यम्:</b> ${example}
    `;
    div.appendChild(body);

    const statusBox = document.createElement('div');
    statusBox.className = 'status-radio';

    ['संस्कार्यम्', 'समीक्ष्यम्', 'सिद्धम्'].forEach(opt => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `status-${id}`;
      input.value = opt;
      if (entryStatuses[word] === opt) input.checked = true;
      input.onclick = () => updateStatus(id, word, sanskrit, opt);
      label.appendChild(input);
      label.append(` ${opt} `);
      statusBox.appendChild(label);
    });

    div.appendChild(statusBox);
    colorCodeEntry(id, entryStatuses[word]);
    container.appendChild(div);
  });
}
