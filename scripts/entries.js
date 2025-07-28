/**
 * Renders dictionary entries into #dictionary.
 * @param {Array<Object>} data  parsed sheet rows
 */
export function renderEntries(data) {
  const wrap = document.getElementById('dictionary');
  wrap.innerHTML = '';

  // group by English headword
  const grouped = data.reduce((acc, row) => {
    const key = row["आङ्ग्लपदम्"]?.trim();
    if (key) (acc[key] ??= []).push(row);
    return acc;
  }, {});

  for (const [headword, group] of Object.entries(grouped)) {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `<div class="headword">${headword}</div>`;

    group.forEach((row, i) => {
      const sanskrit = (row["संस्कृतपदम्"] || '').replace(/\n/g, '<br>');
      const notes    = (row["टिप्पणं/पदान्तरङ्गम्"] || '').replace(/\n/g, '<br>');
      const example  = (row["उदाहरणवाक्यम्"]      || '').replace(/\n/g, '<br>');

      div.innerHTML += `
        <div class="sanskrit">${sanskrit}</div>
        ${notes   ? `<div><b>📘 पदान्तरङ्गम्</b><div class="notes">${notes}</div></div>` : ''}
        ${example ? `<div><b>📝 उदाहरणम्</b><div class="example"><i>${example}</i></div></div>` : ''}
        ${i < group.length - 1 ? '<hr>' : ''}
      `;
    });

    // save raw html for later highlight reset
    setTimeout(() =>
      div.querySelectorAll('.headword,.sanskrit,.notes,.example')
         .forEach(el => el.dataset.raw = el.innerHTML)
    );

    wrap.appendChild(div);
  }
}
