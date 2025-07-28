import { sheetConfig } from './config.js';

/**
 * Builds tab buttons and wires their click handlers.
 * @param {Function} onTabSelect  callback(url) when a tab is chosen
 */
export function renderTabs(onTabSelect) {
  const tabBar = document.getElementById('tabs');
  Object.entries(sheetConfig).forEach(([label, url], i) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'tab-btn' + (i === 0 ? ' active' : '');
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onTabSelect(url);
    });
    tabBar.appendChild(btn);
  });
}
