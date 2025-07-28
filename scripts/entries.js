const STATUS_API_URL = "https://script.google.com/macros/s/AKfycbzrm3SByO_yBjjbxu8nG_SJLcZzW5jld3ta2i5Zq8Bk04PZq5W5A7Uq0NVVahcs4Zu65w/exec";
let entryStatuses = {};

async function loadStatuses() {
  try {
    const res = await fetch(STATUS_API_URL);
    entryStatuses = await res.json();
  } catch (e) {
    console.error("Failed to load statuses:", e);
  }
}

async function updateStatus(id, status) {
  try {
    await fetch(STATUS_API_URL, {
      method: "POST",
      body: JSON.stringify({ id, status }),
      headers: { "Content-Type": "application/json" },
    });
    entryStatuses[id] = status;
    colorCodeEntry(id, status);
  } catch (e) {
    console.error("Failed to update status:", e);
  }
}

function colorCodeEntry(id, status) {
  const el = document.querySelector(`[data-entry-id="${id}"]`);
  if (!el) return;
  el.classList.remove("status-sanskaryam", "status-samikshyam", "status-siddham");
  if (status === "संस्कार्यम्") el.classList.add("status-sanskaryam");
  if (status === "समीक्ष्यम्") el.classList.add("status-samikshyam");
  if (status === "सिद्धम्") el.classList.add("status-siddham");
}

function renderEntries(data) {
  const wrap = document.getElementById('dictionary');
  wrap.innerHTML = '';

  const grouped = data.reduce((acc, row) => {
    const key = row["आङ्ग्लपदम्"]?.trim();
    if (key) (acc[key] ??= []).push(row);
    return acc;
  }, {});

  for (const [headword, group] of Object.entries(grouped)) {
    const div = document.createElement('div');
    const id = headword;
    const currentStatus = entryStatuses[id] || "";

    div.className = 'entry';
    div.setAttribute("data-entry-id", id);
    div.innerHTML = `<div class="headword">${headword}</div>`;

    group.forEach((row, i) => {
      const sanskrit = (row["संस्कृतपदम्"] || '').replace(/\n/g, '<br>');
      const notes    = (row["टिप्पणं/पदान्तरङ्गम्"] || '').replace(/\n/g, '<br>');
      const example  = (row["उदाहरणवाक्यम्"]      || '').replace(/\n/g, '<br>');

      const statusButtons = `
        <div class="status-controls">
          <label><input type="radio" name="status-${id}" value="संस्कार्यम्" ${currentStatus === "संस्कार्यम्" ? "checked" : ""}> संस्कार्यम्</label>
          <label><input type="radio" name="status-${id}" value="समीक्ष्यम्" ${currentStatus === "समीक्ष्यम्" ? "checked" : ""}> समीक्ष्यम्</label>
          <label><input type="radio" name="status-${id}" value="सिद्धम्" ${currentStatus === "सिद्धम्" ? "checked" : ""}> सिद्धम्</label>
        </div>
      `;

      div.innerHTML += `
        <div class="entry-content">
          <div class="entry-text">
            <div class="sanskrit">${sanskrit}</div>
            ${notes ? `<div><b>📘 पदान्तरङ्गम्</b><div class="notes">${notes}</div></div>` : ''}
            ${example ? `<div><b>📝 उदाहरणम्</b><div class="example"><i>${example}</i></div></div>` : ''}
            ${statusButtons}
          </div>
        </div>
        ${i < group.length - 1 ? '<hr>' : ''}
      `;
    });

    setTimeout(() => {
      div.querySelectorAll(`input[name="status-${id}"]`).forEach(radio => {
        radio.addEventListener("change", (e) => {
          updateStatus(id, e.target.value);
        });
      });
      if (currentStatus) colorCodeEntry(id, currentStatus);
      div.querySelectorAll('.headword,.sanskrit,.notes,.example').forEach(el => {
        el.dataset.raw = el.innerHTML;
      });
    });

    wrap.appendChild(div);
  }
}

export { renderEntries, loadStatuses };

