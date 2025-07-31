/**
 * Fetches a Google Sheets JSON endpoint and returns an array of row objects.
 * Expects the columns to be in C3–C6 (zero-based index: 2–5).
 *
 * @param {string} url - Google Sheets gviz endpoint
 * @returns {Promise<Array<Object>>} Parsed row data
 */
export async function getSheetData(url) {
  const text = await fetch(url).then(r => r.text());

  // Extract JSON from gviz padded response
  const json = JSON.parse(text.match(/{.*}/s)[0]);

  const rows = json.table.rows;
  const header = rows[0].c.slice(2, 6).map(c => c?.v?.trim());

  return rows.slice(1).map(r => {
    const obj = {};
    r.c.slice(2, 6).forEach((cell, i) => {
      obj[header[i]] = cell?.v || "";
    });
    return obj;
  });
}
