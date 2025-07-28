const STATUS_API_URL = 'https://script.google.com/macros/s/AKfycbzrm3SByO_yBjjbxu8nG_SJLcZzW5jld3ta2i5Zq8Bk04PZq5W5A7Uq0NVVahcs4Zu65w/exec';
const entryStatuses = {};

async function loadStatuses() {
  try {
    const response = await fetch(STATUS_API_URL);
    const data = await response.json(); // assumes sheet returns JSON
    data.forEach(row => {
      const word = row[0];
      const status = row[1];
      entryStatuses[word] = status;
    });
  } catch (e) {
    console.error('❌ Failed to load review statuses:', e);
  }
}

function updateStatus(id, word, status) {
  const url = `${STATUS_API_URL}?word=${encodeURIComponent(word)}&status=${encodeURIComponent(status)}`;
  fetch(url)
    .then(res => res.text())
    .then(result => {
      console.log('✅ Status update successful:', result);
      entryStatuses[word] = status;
      colorCodeEntry(id, status);
    })
    .catch(err => {
      console.error('❌ Failed to update status:', err);
    });
}

function colorCodeEntry(id, status) {
  const colors = {
    'संस्कार्यम्': '#ffeeba',
    'समीक्ष्यम्': '#bee5eb',
    'सिद्धम्': '#d4edda'
  };
  const entryDiv = document.getElementById(id);
  if (entryDiv) {
    entryDiv.style.backgroundColor = colors[status] || 'transparent';
  }
}

export function renderEntries(rows) {
  const container = document.getElementById('dictionary');
  container.innerHTML = '';
  rows.forEach((row, i) => {
    const id = `entry-${i}`;
    const word = row[0];
    const div = document.createElement('div');
    div.className = 'entry';
    div.id = id;

    const wordEl = document.createElement('h3');
    wordEl.textContent = word;
    div.appendChild(wordEl);

    const defEl = document.createElement('p');
    defEl.textContent = row.slice(1).join(' — ');
    div.appendChild(defEl);

    const status = entryStatuses[word];
    if (status) colorCodeEntry(id, status);

    const statusContainer = document.createElement('div');
    statusContainer.className = 'status-radio';

    ['संस्कार्यम्', 'समीक्ष्यम्', 'सिद्धम्'].forEach(opt => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `status-${id}`;
      input.value = opt;
      if (status === opt) input.checked = true;
      input.onclick = () => updateStatus(id, word, input.value);
      label.appendChild(input);
      label.append(` ${opt} `);
      statusContainer.appendChild(label);
    });

    div.appendChild(statusContainer);
    container.appendChild(div);
  });
}

export { renderEntries, loadStatuses };
