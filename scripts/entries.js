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
    const key = `${row.angla_padam.toLowerCase()}|${row.samskrta_padam}`;
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

  const grouped = {};
  rows.forEach(row => {
    const word = row["आङ्ग्लपदम्"]?.toLowerCase();
    if (!word) return;
    if (!grouped[word]) grouped[word] = [];
    grouped[word].push(row);
  });


  Object.entries(grouped).forEach(([word, rows], index) => {
    const entryId = `entry-${index}`;
    const div = document.createElement('div');
    div.className = 'entry';
    div.id = entryId;

    const title = document.createElement('h3');
    title.textContent = word;
    div.appendChild(title);

    rows.forEach((row, i) => {
      const sanskrit = row["संस्कृतपदम्"] || '';
      const notes = row["टिप्पणं/पदान्तरङ्गम्"] || '';
      const example = row["उदाहरणवाक्यम्"] || '';
      const statusKey = `${word}|${sanskrit}`;
      const currentStatus = entryStatuses[statusKey];

      const subId = `${entryId}-${i}`;

      const subDiv = document.createElement('div');
      subDiv.id = subId;
      subDiv.className = 'subentry';

      const para = document.createElement('p');
      para.innerHTML = `
        <b>संस्कृतपदम्:</b> ${sanskrit}<br>
        <b>टिप्पणं:</b> ${notes}<br>
        <b>उदाहरणवाक्यम्:</b> ${example}
      `;
      subDiv.appendChild(para);

      const statusBox = document.createElement('div');
      statusBox.className = 'status-radio';

      // same statusBox code...
      subDiv.appendChild(statusBox);

      // Optional separator:
      if (i < rows.length - 1) {
        const hr = document.createElement('hr');
        subDiv.appendChild(hr);
      }

      div.appendChild(subDiv);

      // This will now target subDiv
      colorCodeEntry(subId, currentStatus);

      ['संस्कार्यम्', 'समीक्ष्यम्', 'सिद्धम्'].forEach(opt => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `status-${entryId}-${i}`;
        input.value = opt;
        if (currentStatus === opt) input.checked = true;
        input.onclick = () => updateStatus(`${entryId}-${i}`, word, sanskrit, notes, example, opt);
        label.appendChild(input);
        label.append(` ${opt} `);
        statusBox.appendChild(label);
      });

      div.appendChild(statusBox);
      colorCodeEntry(`${entryId}-${i}`, currentStatus);

      if (i < rows.length - 1) {
        const hr = document.createElement('hr');
        div.appendChild(hr);
      }
    });

    container.appendChild(div);
  });

}
