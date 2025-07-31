import { supabase } from './supabaseClient.js';

// ─── Status Map ────────────────────────────────────────────────────────────────
// Stores the current review status of each entry by composite key.
export const entryStatuses = {};

// ─── Load Statuses from Supabase ───────────────────────────────────────────────
async function loadStatuses() {
  const { data, error } = await supabase
    .from('entries_review')
    .select('angla_padam, samskrta_padam, status');

  if (error) {
    console.error('❌ Error loading statuses:', error);
    return {};
  }

  const normalize = s => s?.trim().toLowerCase().replace(/\s+/g, '');
  const statusMap = {};

  for (const row of data) {
    const key = `${normalize(row.angla_padam)}|${normalize(row.samskrta_padam)}`;
    statusMap[key] = row.status;
  }

  Object.assign(entryStatuses, statusMap);
  console.log('✅ Loaded statuses from Supabase:', entryStatuses);
  return statusMap;
}

// ─── Update Status in Supabase ────────────────────────────────────────────────
async function updateStatus(entryId, anglaPadam, samskrtaPadam, _notes, _example, newStatus) {
  const { error } = await supabase
    .from('entries_review')
    .upsert(
      {
        angla_padam: anglaPadam,
        samskrta_padam: samskrtaPadam,
        status: newStatus
      },
      { onConflict: ['angla_padam', 'samskrta_padam'] }
    );

  if (error) {
    console.error('❌ Failed to update status:', error);
  } else {
    console.log(`✅ Saved: ${anglaPadam} ⇨ ${samskrtaPadam} = ${newStatus}`);
    entryStatuses[`${anglaPadam.toLowerCase()}|${samskrtaPadam}`] = newStatus;
    colorCodeEntry(entryId, newStatus);
  }
}

// ─── Apply Color Coding to Entry UI ───────────────────────────────────────────
function colorCodeEntry(entryId, status) {
  const div = document.getElementById(entryId);
  if (!div) {
    console.warn('No div found for:', entryId);
    return;
  }

  let color = "#eee"; // default background
  if (status === "संस्कार्यम्") color = "#ffdddd"; // red tint
  else if (status === "समीक्ष्यम्") color = "#fff7cc"; // yellow tint
  else if (status === "सिद्धम्") color = "#ddffdd"; // green tint

  div.style.backgroundColor = color;
  console.log(`🎨 ${entryId} → ${status} → ${color}`);
}

// ─── Exports ───────────────────────────────────────────────────────────────────
export { loadStatuses, updateStatus, colorCodeEntry };
