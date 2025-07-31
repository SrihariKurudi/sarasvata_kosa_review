/**
 * Filters & highlights entries live as the user types.
 * @param {Event} e - Input event from #searchBox
 */
export function filterEntries(e) {
  const q = e.target.value.trim().toLowerCase();

  document.querySelectorAll('.entry').forEach(entry => {
    // Determine if entry contains search term
    const hit = entry.innerText.toLowerCase().includes(q);
    entry.style.display = hit ? '' : 'none';

    // Highlight matched terms in subfields
    ['headword', 'sanskrit', 'example', 'notes'].forEach(cls => {
      const el = entry.querySelector('.' + cls);
      if (!el) return;

      const raw = el.dataset.raw || el.innerHTML;
      el.innerHTML = (hit && q)
        ? raw.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')
        : raw;
    });
  });
}
