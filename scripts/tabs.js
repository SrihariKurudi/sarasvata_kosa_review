import { sheetConfig } from './config.js';

/**
 * Renders tab buttons and sets up click handlers.
 * @param {Function} onTabSelect - Callback to invoke with the sheet URL when a tab is selected.
 */
export function renderTabs(onTabSelect) {
  const tabBar = document.getElementById('tabs');

  Object.entries(sheetConfig).forEach(([label, url], i) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'tab-btn' + (i === 0 ? ' active' : '');

    btn.addEventListener('click', () => {
      // Remove 'active' class from all buttons
      tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

      // Activate the clicked tab and trigger load
      btn.classList.add('active');
      onTabSelect(url);
    });

    tabBar.appendChild(btn);
  });
}
