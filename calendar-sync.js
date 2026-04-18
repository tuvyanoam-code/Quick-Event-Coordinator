// calendar-sync.js — sync availability into the user's Google Calendar.
// All toasts go through i18n; event summary/description stay English for the
// Calendar-side representation so it's readable regardless of app language.

async function syncAvailabilityToCalendar(dateKey, note) {
  var T = window.t || function(k,p){return k;};

  if (!window.state.user || window.state.isGuest) {
    window.showToast(T('toast.syncGuestWarn'), 'warning');
    return;
  }

  var token = window.state.user.accessToken;

  // If no token, ask for Calendar scope now (only when user actually syncs)
  if (!token && window.requestCalendarScope) {
    try {
      token = await window.requestCalendarScope();
    } catch (e) {
      window.showToast(T('toast.calendarNoAuth'), 'warning');
      return;
    }
  }

  if (!token) {
    window.showToast(T('toast.calendarNoPerm'), 'error');
    return;
  }

  var eventName = window.state.eventName;
  var calendarEvent = {
    summary: 'Availability: ' + eventName,
    description: 'Note: ' + (note || '—') + '\n\nCreated via Quick Event Coordinator',
    start: { date: dateKey },
    end: { date: dateKey },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 60 }]
    }
  };

  try {
    var response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(calendarEvent)
      }
    );

    if (response.ok) {
      window.showToast(T('toast.calendarSynced'), 'success');
    } else if (response.status === 401 && window.requestCalendarScope) {
      // Token expired, try refresh
      token = await window.requestCalendarScope();
      var retry = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(calendarEvent)
        }
      );
      if (retry.ok) {
        window.showToast(T('toast.calendarSynced'), 'success');
      } else {
        window.showToast(T('toast.calendarRetryFail'), 'error');
      }
    } else {
      var errorData = await response.json();
      var msg = errorData.error ? errorData.error.message : '?';
      window.showToast(T('toast.calendarSyncError', {msg: msg}), 'error');
    }
  } catch (error) {
    console.error('Network error syncing to Google Calendar:', error);
    window.showToast(T('toast.calendarNetworkError'), 'error');
  }
}

window.syncAvailabilityToCalendar = syncAvailabilityToCalendar;
