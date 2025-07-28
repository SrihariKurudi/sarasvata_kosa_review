/**
 * Fetches a Google‑Sheets JSON endpoint and returns an array of row objects.
 * @param {string} url  gviz endpoint
 * @returns {Promise<Array<Object>>}
 */
export async function getSheetData(url) {
  const text = await fetch(url).then(r => r.text());
  const json = JSON.parse(text.match(/{.*}/s)[0]);
  const rows   = json.table.rows;
  const header = rows[0].c.slice(2, 6).map(c => c?.v?.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    r.c.slice(2, 6).forEach((cell, i) => (obj[header[i]] = cell?.v || ""));
    return obj;
  });
}
