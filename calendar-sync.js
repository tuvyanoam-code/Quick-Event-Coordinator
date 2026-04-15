// calendar-sync.js

async function syncAvailabilityToCalendar(dateKey, note) {
  if (!window.state.user || window.state.isGuest) {
    window.showToast('יש להתחבר כדי לסנכרן עם Google Calendar.', 'warning');
    return;
  }

  var token = window.state.user.accessToken;

  // If no token, try to refresh
  if (!token && window.refreshGoogleToken) {
    try {
      window.showToast('מתחבר מחדש ל-Google Calendar...', 'info');
      token = await window.refreshGoogleToken();
    } catch (e) {
      window.showToast('לא ניתן להתחבר ל-Google Calendar. נסה להתנתק ולהתחבר מחדש.', 'error');
      return;
    }
  }

  if (!token) {
    window.showToast('אין הרשאת גישה ל-Google Calendar. נסה להתנתק ולהתחבר מחדש.', 'error');
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
    } else if (response.status === 401 && window.refreshGoogleToken) {
      // Token expired, try refresh
      token = await window.refreshGoogleToken();
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
