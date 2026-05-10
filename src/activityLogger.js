// ══════════════════════════════════════════════════════════════
//  ACTIVITY LOGGER — Shared utility for cross-component logging
// ══════════════════════════════════════════════════════════════
const ACTIVITY_KEY = 'activity-log';

export function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Activity types:
 *   resume_save    — Cloud save
 *   resume_edit    — Section edits (experience, education, etc.)
 *   template_change — Switched template
 *   export_pdf     — Exported PDF
 *   todo_complete  — Pipeline todo completed
 *   deadline_done  — Pipeline deadline completed
 *   checkpoint     — Manual user checkpoint
 */

export function logActivity({ type, title, detail, resumeData }) {
  const log = getActivities();
  log.unshift({
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    detail: detail || '',
    resumeData,
    timestamp: new Date().toISOString()
  });
  // Keep max 200 entries
  if (log.length > 200) log.length = 200;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log));
  // Dispatch for cross-component reactivity
  window.dispatchEvent(new CustomEvent('activity-updated'));
}

export function getActivities() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
  } catch { return []; }
}

export function removeActivityByTitle(title) {
  const log = getActivities();
  const filtered = log.filter(a => a.title !== title);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('activity-updated'));
}

export function clearActivities() {
  localStorage.setItem(ACTIVITY_KEY, '[]');
  window.dispatchEvent(new CustomEvent('activity-updated'));
}

/**
 * Transforms a todo title from present tense to past tense for activity display.
 * "Apply to Access Pharma" → "Applied to Access Pharma"
 */
export function todoToPastTense(title) {
  const verbs = {
    'Apply': 'Applied', 'Submit': 'Submitted', 'Follow': 'Followed',
    'Update': 'Updated', 'Draft': 'Drafted', 'Review': 'Reviewed',
    'Prep': 'Prepped', 'Research': 'Researched', 'Revise': 'Revised',
    'Send': 'Sent', 'Complete': 'Completed', 'Schedule': 'Scheduled',
    'Create': 'Created', 'Write': 'Wrote', 'Edit': 'Edited',
    'Upload': 'Uploaded', 'Download': 'Downloaded', 'Check': 'Checked',
    'Finish': 'Finished', 'Prepare': 'Prepared', 'Contact': 'Contacted',
    'Reach': 'Reached', 'Start': 'Started', 'Add': 'Added',
    'Remove': 'Removed', 'Set': 'Set', 'Fix': 'Fixed',
    'Build': 'Built', 'Design': 'Designed', 'Test': 'Tested'
  };
  for (const [present, past] of Object.entries(verbs)) {
    if (title.startsWith(present + ' ') || title.startsWith(present + ':') || title.startsWith(present + '-')) {
      return title.replace(new RegExp(`^${present}`), past);
    }
  }
  // Lowercase check
  const lower = title.toLowerCase();
  for (const [present, past] of Object.entries(verbs)) {
    if (lower.startsWith(present.toLowerCase() + ' ')) {
      return past + title.slice(present.length);
    }
  }
  return `Completed: ${title}`;
}
