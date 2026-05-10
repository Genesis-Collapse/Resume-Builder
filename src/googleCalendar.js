// ══════════════════════════════════════════════════════════════
//  GOOGLE CALENDAR API SERVICE
//  Uses the REST API with OAuth2 access token from Firebase Auth
// ══════════════════════════════════════════════════════════════

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Fetch events from Google Calendar for a given time range.
 * @param {string} accessToken - Google OAuth access token
 * @param {string} timeMin - ISO date string for range start
 * @param {string} timeMax - ISO date string for range end
 * @param {string} calendarId - Calendar ID (default: 'primary')
 * @returns {Array} Array of calendar events
 */
export async function fetchGoogleEvents(accessToken, timeMin, timeMax, calendarId = 'primary') {
  if (!accessToken) return [];
  
  const params = new URLSearchParams({
    timeMin: new Date(timeMin).toISOString(),
    timeMax: new Date(timeMax).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100'
  });

  try {
    const res = await fetch(
      `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    if (res.status === 401) {
      // Token expired — caller should re-authenticate
      sessionStorage.removeItem('google_access_token');
      throw new Error('TOKEN_EXPIRED');
    }
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Calendar API error: ${res.status}`);
    }

    const data = await res.json();
    return (data.items || []).map(normalizeEvent);
  } catch (err) {
    console.error('Google Calendar fetch error:', err);
    throw err;
  }
}

/**
 * Create a new event on Google Calendar.
 * @param {string} accessToken
 * @param {Object} event - { title, date, description, color, startTime, endTime }
 * @param {string} calendarId
 * @returns {Object} Created event
 */
export async function createGoogleEvent(accessToken, event, calendarId = 'primary') {
  if (!accessToken) throw new Error('No access token');

  const body = {
    summary: event.title,
    description: event.description || '',
    start: event.startTime 
      ? { dateTime: event.startTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      : { date: event.date },
    end: event.endTime 
      ? { dateTime: event.endTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      : { date: event.date },
    colorId: mapColorToGoogleColorId(event.color)
  };

  const res = await fetch(
    `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create event');
  }

  return normalizeEvent(await res.json());
}

/**
 * Delete an event from Google Calendar.
 */
export async function deleteGoogleEvent(accessToken, eventId, calendarId = 'primary') {
  if (!accessToken) throw new Error('No access token');

  const res = await fetch(
    `${CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!res.ok && res.status !== 404) {
    throw new Error('Failed to delete event');
  }
}

// ══════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════

/**
 * Normalize a Google Calendar event into our app's event format.
 */
function normalizeEvent(gcalEvent) {
  const start = gcalEvent.start?.dateTime || gcalEvent.start?.date || '';
  const end = gcalEvent.end?.dateTime || gcalEvent.end?.date || '';
  
  // Extract date portion (YYYY-MM-DD)
  const dateStr = start.substring(0, 10);
  
  // Extract time if it's a dateTime event
  let timeStr = '';
  if (gcalEvent.start?.dateTime) {
    const d = new Date(gcalEvent.start.dateTime);
    timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  return {
    id: gcalEvent.id,
    date: dateStr,
    title: gcalEvent.summary || '(No title)',
    description: gcalEvent.description || '',
    color: mapGoogleColorIdToHex(gcalEvent.colorId) || '#7C3AED',
    time: timeStr,
    startRaw: start,
    endRaw: end,
    isGoogleEvent: true,
    htmlLink: gcalEvent.htmlLink || '',
    status: gcalEvent.status
  };
}

/**
 * Map our hex colors to Google Calendar color IDs.
 * Google Calendar has predefined color IDs (1-11).
 */
function mapColorToGoogleColorId(hex) {
  const map = {
    '#7C3AED': '1',  // Lavender → closest to purple
    '#3B82F6': '9',  // Blueberry
    '#10B981': '10', // Basil → closest to green
    '#F59E0B': '5',  // Banana → closest to yellow/amber
    '#EF4444': '11', // Tomato
    '#EC4899': '4',  // Flamingo → closest to pink
  };
  return map[hex] || '1';
}

/**
 * Map Google Calendar color IDs back to our hex colors.
 */
function mapGoogleColorIdToHex(colorId) {
  const map = {
    '1': '#7C3AED', '2': '#10B981', '3': '#8B5CF6',
    '4': '#EC4899', '5': '#F59E0B', '6': '#F97316',
    '7': '#06B6D4', '8': '#6B7280', '9': '#3B82F6',
    '10': '#10B981', '11': '#EF4444'
  };
  return map[colorId] || '#7C3AED';
}

/**
 * Get the month range boundaries for API calls.
 * Returns { timeMin, timeMax } as ISO date strings.
 */
export function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString()
  };
}
