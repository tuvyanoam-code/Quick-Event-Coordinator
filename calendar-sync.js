// calendar-sync.js

async function syncAvailabilityToCalendar(dateKey, note) {
  if (!window.state.user || window.state.isGuest) {
    window.showToast('יש להתחבר עם Google כדי לסנכרן ליומן.', 'warning');
    return;
  }

  var token = window.state.user.accessToken;

  // If no token, ask for Calendar scope now (only when user actually syncs)
  if (!token && window.requestCalendarScope) {
    try {
      token = await window.requestCalendarScope();
    } catch (e) {
      window.showToast('צריך להרשות גישה ל-Google Calendar כדי לסנכרן.', 'warning');
      return;
    }
  }

  if (!token) {
    window.showToast('לא קיבלנו הרשאת גישה ל-Google Calendar.', 'error');
    return;
  }

  var eventName = window.state.eventName;
  var calendarEvent = {
    summary: 'זמינות: ' + eventName,
    description: 'הערה: ' + (note || 'אין') + '\n\nנוצר באמצעות Quick Event Coordinator',
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
      window.showToast('הזמינות סונכרנה ל-Google Calendar!', 'success');
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
        window.showToast('הזמינות סונכרנה ל-Google Calendar!', 'success');
      } else {
        window.showToast('שגיאה בסנכרון. נסה להתנתק ולהתחבר מחדש.', 'error');
      }
    } else {
      var errorData = await response.json();
      window.showToast('שגיאה בסנכרון: ' + (errorData.error ? errorData.error.message : 'נסה שוב.'), 'error');
    }
  } catch (error) {
    console.error('Network error syncing to Google Calendar:', error);
    window.showToast('שגיאת רשת בסנכרון ל-Google Calendar.', 'error');
  }
}

window.syncAvailabilityToCalendar = syncAvailabilityToCalendar;
