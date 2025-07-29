const STATUS_API_URL = 'https://script.google.com/macros/s/AKfycbzrm3SByO_yBjjbxu8nG_SJLcZzW5jld3ta2i5Zq8Bk04PZq5W5A7Uq0NVVahcs4Zu65w/exec';
const entryStatuses = {};

async function loadStatuses() {
  try {
    const raw = await fetch(STATUS_API_URL).then(r => r.json());
    console.log("🔍 Raw status response:", raw);

    Object.entries(raw).forEach(([word, status]) => {
      entryStatuses[word] = status;
    });

    console.log("✅ Loaded statuses:", entryStatuses);
  } catch (e) {
    console.error('❌ Failed to load review statuses:', e);
  }
}



function updateStatus(entryId, word, status) {
  const url = `${STATUS_API_URL}?word=${encodeURIComponent(word)}&status=${encodeURIComponent(status)}`;
  fetch(url)
    .then(res => res.text())
    .then(result => {
      console.log('✅ Status updated:', result);
      entryStatuses[word] = status;
      colorCodeEntry(entryId, status);
    })
    .catch(err => {
      console.error('❌ Failed to update status:', err);
    });
}

function colorCodeEntry(entryId, status) {
  const colors = {
    'संस्कार्यम्': '#ffeeba',
    'समीक्ष्यम्': '#bee5eb',
    'सिद्धम्':    '#d4edda'
  };
  const block = document.getElementById(entryId);
  if (block) block.style.backgroundColor = colors[status] || 'transparent';
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
      input.onclick = () => updateStatus(id, word, opt);
      label.appendChild(input);
      label.append(` ${opt} `);
      statusBox.appendChild(label);
    });

    div.appendChild(statusBox);
    colorCodeEntry(id, entryStatuses[word]);
    container.appendChild(div);
  });
}


export { loadStatuses };
