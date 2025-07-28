// transliterate-toggle.js

// Toggle state
window.__transliterationMode = false;

// Regex for Devanagari characters
const DEVANAGARI_RANGE = /[\u0900-\u097F]/;

// Returns true if a string contains Devanagari
function containsDevanagari(str) {
  return DEVANAGARI_RANGE.test(str);
}

// Transliterates all visible text nodes
function transliterateAllTexts() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentNode;

    if (!node.nodeValue.trim()) continue;
    if (!containsDevanagari(node.nodeValue)) continue;

    // Store original Devanagari in data attribute
    if (!parent.dataset.devanagariOriginal) {
      parent.dataset.devanagariOriginal = node.nodeValue;
    }

    // Perform transliteration
    node.nodeValue = Sanscript.t(parent.dataset.devanagariOriginal, "devanagari", "iast");
  }
}

function revertAllTexts() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentNode;
    if (parent.dataset.devanagariOriginal) {
      node.nodeValue = parent.dataset.devanagariOriginal;
    }
  }
}

// Button logic
function toggleScriptSystem() {
  window.__transliterationMode = !window.__transliterationMode;

  if (window.__transliterationMode) {
    transliterateAllTexts();
    toggleBtn.textContent = 'अ';
  } else {
    revertAllTexts();
    toggleBtn.textContent = 'A';
  }
}

// Inject toggle button
const toggleBtn = document.createElement('button');
toggleBtn.id = 'globalScriptToggle';
toggleBtn.className = 'toggle-button';
toggleBtn.textContent = 'A';
toggleBtn.title = 'Toggle Devanagari/IAST everywhere';
toggleBtn.onclick = toggleScriptSystem;

// Position the button in the top-right corner (non-invasive)
Object.assign(toggleBtn.style, {
  position: 'fixed',
  top: '10px',
  right: '10px',
  zIndex: 9999,
  background: '#eee6ba',
  border: '1px solid #8B4513',
  padding: '0.4em 0.8em',
  borderRadius: '20px',
  fontSize: '1.1em',
  fontFamily: 'Noto Serif Devanagari, serif',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
});

toggleBtn.onmouseenter = () => toggleBtn.style.backgroundColor = '#8B4513', toggleBtn.style.color = 'white';
toggleBtn.onmouseleave = () => toggleBtn.style.backgroundColor = '#eee6ba', toggleBtn.style.color = '#4e2c0a';

document.body.appendChild(toggleBtn);
