var firebaseConfig = {
    apiKey: "AIzaSyCi0_5qjlb-YgX7tCjygQHV8tbhyN4Bado",
    authDomain: "quick-event-coordinator.firebaseapp.com",
    databaseURL: "https://quick-event-coordinator-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "quick-event-coordinator",
    storageBucket: "quick-event-coordinator.firebasestorage.app",
    messagingSenderId: "979701328018",
    appId: "1:979701328018:web:55fbfe949fbdeb9b901e4b"
};
firebase.initializeApp(firebaseConfig);
window._db = firebase.database();

// Global state object
var state = {
  eventKey: null,
  eventName: null,
  eventCode: null,
  user: null, // Will hold authenticated user info or guest info
  users: {},
  availability: {},
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  selected: null,
  unsubscribe: null,
  isAdmin: false,
  dateFrom: null,
  dateTo: null,
  editingEntry: null,
  isGuest: true, // New state for guest mode
  // New state for calendar sync preference
  syncCalendar: localStorage.getItem('syncCalendar') === 'true'
};

// Utility functions (fmtKey, fmtLabel, showToast, showScreen, etc.)
function fmtKey(date) {
  return date.toISOString().split('T')[0];
}

function fmtLabel(date) {
  return date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Toast Notification System
var toastContainer = document.getElementById('toast-container');
if (!toastContainer) {
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  document.body.appendChild(toastContainer);
}

function showToast(message, type, duration) {
  var toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'info');
  var icon = '';
  if (type === 'success') icon = '✅';
  else if (type === 'error') icon = '❌';
  else if (type === 'warning') icon = '⚠️';
  else icon = 'ℹ️';

  toast.innerHTML = '<span class="toast-icon">' + icon + '</span>' + message;
  toastContainer.appendChild(toast);

  setTimeout(function() {
    toast.classList.add('show');
  }, 10);

  setTimeout(function() {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', function() {
      toast.remove();
    });
  }, duration || 3000);
}

// Screen management
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(function(screen) {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
  // Hide AI window when changing screens
  document.getElementById('ai-window').classList.remove('open');
}

// Theme toggle
var themeToggle = document.getElementById('theme-toggle');
var currentTheme = localStorage.getItem('theme');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

if (currentTheme) {
  applyTheme(currentTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  applyTheme('dark');
} else {
  applyTheme('light');
}

themeToggle.addEventListener('click', function() {
  var newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
});

// Loader
var loaderOverlay = document.getElementById('loader-overlay');
function showLoader() { loaderOverlay.classList.add('show'); }
function hideLoader() { loaderOverlay.classList.remove('show'); }

// Firebase DB utility functions
function dbSet(path, value) {
  return window._db.ref(path).set(value);
}

function dbUpdate(path, value) {
  return window._db.ref(path).update(value);
}

function dbGet(path) {
  return window._db.ref(path).once('value');
}

function dbRemove(path) {
  return window._db.ref(path).remove();
}

// Core event logic (createEvent, joinEvent, renderCal, renderSel, addAvailability, deleteEvent, logout, etc.)
function createEvent() {
  showLoader();
  var eventName = document.getElementById('newEventName').value.trim();
  var organizerName = document.getElementById('newOrgName').value.trim();
  var organizerEmail = document.getElementById('newOrgEmail').value.trim();
  var dateFrom = document.getElementById('newDateFrom').value;
  var dateTo = document.getElementById('newDateTo').value;

  if (!eventName || !organizerName) {
    showToast('שם אירוע ושם מארגן הם שדות חובה.', 'error');
    hideLoader();
    return;
  }

  var eventKey = window._db.ref('events').push().key;
  var eventCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  var newEvent = {
    name: eventName,
    organizer: {
      id: state.user.id,
      name: organizerName,
      email: organizerEmail
    },
    code: eventCode,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  };

  dbSet('events/' + eventKey, newEvent)
    .then(function() {
      // Link event to organizer's profile
      return dbSet('users/' + state.user.id + '/events/' + eventKey, { role: 'admin', eventName: eventName });
    })
    .then(function() {
      state.eventKey = eventKey;
      state.eventName = eventName;
      state.eventCode = eventCode;
      state.isAdmin = true;
      state.dateFrom = dateFrom;
      state.dateTo = dateTo;
      showToast('אירוע נוצר בהצלחה!', 'success');
      document.getElementById('codeResult').style.display = 'block';
      document.getElementById('eventCodeDisplay').textContent = eventCode;
      document.getElementById('sendEmailBtn').style.display = 'block';
      document.getElementById('openMailtoBtn').style.display = 'none';
      document.getElementById('emailStatus').style.display = 'none';
      showScreen('screen-calendar');
      listenToEvent(eventKey);
    })
    .catch(function(error) {
      showToast('שגיאה ביצירת אירוע: ' + error.message, 'error');
    })
    .finally(function() {
      hideLoader();
    });
}

function joinEvent() {
  showLoader();
  var eventName = document.getElementById('joinEventName').value.trim();
  var eventCode = document.getElementById('joinCode').value.trim().toUpperCase();
  var userName = document.getElementById('joinUserName').value.trim();

  if (!eventName || !eventCode || !userName) {
    showToast('שם אירוע, קוד גישה ושמך הם שדות חובה.', 'error');
    hideLoader();
    return;
  }

  dbGet('events').then(function(snapshot) {
    var events = snapshot.val();
    var foundEventKey = null;
    for (var key in events) {
      if (events[key].name === eventName && events[key].code === eventCode) {
        foundEventKey = key;
        break;
      }
    }

    if (foundEventKey) {
      state.eventKey = foundEventKey;
      state.eventName = eventName;
      state.eventCode = eventCode;
      state.isAdmin = false;

      // Add user to event's user list if not already there
      dbGet('events/' + foundEventKey + '/users/' + state.user.id).then(function(userSnap) {
        if (!userSnap.exists()) {
          var userColor = getRandomColor();
          return dbSet('events/' + foundEventKey + '/users/' + state.user.id, { name: userName, color: userColor });
        } else {
          // Update name if user already exists
          return dbUpdate('events/' + foundEventKey + '/users/' + state.user.id, { name: userName });
        }
      }).then(function() {
        // Link event to user's profile
        return dbSet('users/' + state.user.id + '/events/' + foundEventKey, { role: 'participant', eventName: eventName });
      }).then(function() {
        showToast('הצטרפת לאירוע בהצלחה!', 'success');
        showScreen('screen-calendar');
        listenToEvent(foundEventKey);
      });
    } else {
      showToast('שם אירוע או קוד גישה שגויים.', 'error');
    }
  }).catch(function(error) {
    showToast('שגיאה בהצטרפות לאירוע: ' + error.message, 'error');
  }).finally(function() {
    hideLoader();
  });
}

function listenToEvent(eventKey) {
  if (state.unsubscribe) state.unsubscribe();

  var eventRef = window._db.ref('events/' + eventKey);

  state.unsubscribe = eventRef.on('value', function(snapshot) {
    var eventData = snapshot.val();
    if (!eventData) {
      showToast('האירוע נמחק או אינו קיים.', 'error');
      logout();
      return;
    }

    state.eventName = eventData.name;
    state.eventCode = eventData.code;
    state.users = eventData.users || {};
    state.availability = eventData.availability || {};
    state.dateFrom = eventData.dateFrom || null;
    state.dateTo = eventData.dateTo || null;

    // Check if current user is admin
    state.isAdmin = (eventData.organizer && eventData.organizer.id === state.user.id);

    // Update current user's name in event if it changed
    if (state.user && state.user.id && state.users[state.user.id] && state.users[state.user.id].name !== state.user.name) {
      dbUpdate('events/' + eventKey + '/users/' + state.user.id, { name: state.user.name });
    }

    renderCal();
    renderSel();
    updateAdminPanel();
    updateEventHeader();
  }, function(error) {
    console.error('Firebase listen error:', error);
    showToast('שגיאה בטעינת נתוני אירוע: ' + error.message, 'error');
  });
}

function updateEventHeader() {
  document.getElementById('calEventName').textContent = state.eventName;
  document.getElementById('calEventCode').textContent = state.eventCode;
  document.getElementById('eventAdminBadge').style.display = state.isAdmin ? 'inline-block' : 'none';
  document.getElementById('adminPanel').style.display = state.isAdmin ? 'block' : 'none';
  document.getElementById('logoutBtn').textContent = '➡️ חזור למסך הבית';
  if (state.user) document.getElementById('currentUserName').textContent = state.user.name || '';

  // Update date range info
  var dateRangeInfo = document.getElementById('dateRangeInfo');
  if (state.dateFrom || state.dateTo) {
    var from = state.dateFrom ? new Date(state.dateFrom).toLocaleDateString('he-IL') : 'תאריך התחלה לא מוגדר';
    var to = state.dateTo ? new Date(state.dateTo).toLocaleDateString('he-IL') : 'תאריך סיום לא מוגדר';
    dateRangeInfo.textContent = 'טווח תאריכים: ' + from + ' - ' + to;
    dateRangeInfo.style.display = 'block';
  } else {
    dateRangeInfo.style.display = 'none';
  }
}

function updateAdminPanel() {
  if (state.isAdmin) {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminDateFrom').value = state.dateFrom || '';
    document.getElementById('adminDateTo').value = state.dateTo || '';
  } else {
    document.getElementById('adminPanel').style.display = 'none';
  }
}

function isDayInRange(dateKey) {
  if (!state.dateFrom && !state.dateTo) return true;
  var date = new Date(dateKey);
  if (state.dateFrom && date < new Date(state.dateFrom + 'T00:00:00')) return false;
  if (state.dateTo && date > new Date(state.dateTo + 'T23:59:59')) return false;
  return true;
}

var DAY_NAMES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

function renderCal() {
  var grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  DAY_NAMES.forEach(function(n) {
    var d = document.createElement('div');
    d.className = 'dn';
    d.textContent = n;
    grid.appendChild(d);
  });

  var first = new Date(state.year, state.month, 1);
  var days = new Date(state.year, state.month + 1, 0).getDate();
  var start = (first.getDay() + 6) % 7; // Adjust for Sunday being 0, make it last

  document.getElementById('monthLabel').textContent = first.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  for (var i = 0; i < start; i++) {
    var emptyDiv = document.createElement('div');
    emptyDiv.className = 'day empty';
    grid.appendChild(emptyDiv);
  }

  var todayKey = fmtKey(new Date());
  for (var d = 1; d <= days; d++) {
    (function(d) {
      var date = new Date(state.year, state.month, d);
      var key = fmtKey(date);
      var inRange = isDayInRange(key);

      var div = document.createElement('div');
      div.className = 'day';
      if (!inRange) div.classList.add('disabled');
      if (key === todayKey) div.classList.add('today');
      if (state.selected && fmtKey(state.selected) === key) div.classList.add('sel');

      var num = document.createElement('div');
      num.className = 'dnum';
      num.textContent = d;
      div.appendChild(num);

      var dotsDiv = document.createElement('div');
      dotsDiv.className = 'dots';
      var avail = state.availability[key] || [];
      for (var j = 0; j < avail.length; j++) {
        var u = state.users[avail[j].userId];
        if (!u) continue;
        var dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.background = u.color;
        dotsDiv.appendChild(dot);
      }
      div.appendChild(dotsDiv);

      if (inRange) {
        div.addEventListener('click', function() {
          state.selected = date;
          cancelEdit();
          renderCal();
          renderSel();
        });
      }
      grid.appendChild(div);
    })(d);
  }
}

function renderSel() {
  var addBtn = document.getElementById('addBtn');
  if (!state.selected) {
    document.getElementById('selLabel').textContent = 'לא נבחר יום';
    document.getElementById('avList').innerHTML = '';
    addBtn.disabled = true;
    return;
  }
  var key = fmtKey(state.selected);
  document.getElementById('selLabel').textContent = fmtLabel(state.selected);
  var entries = state.availability[key] || [];
  var list = document.getElementById('avList');
  list.innerHTML = '';
  if (!entries.length) {
    list.innerHTML = '<span style="color:var(--muted)">אין זמינות ליום זה</span>';
  } else {
    for (var i = 0; i < entries.length; i++) {
      (function(idx) {
        var entry = entries[idx];
        var u = state.users[entry.userId];
        if (!u) return;
        var isMine = (entry.userId === state.user.id);
        var item = document.createElement('div');
        item.className = 'av-item';
        if (isMine) item.classList.add('mine');
        var html = '<div class="av-color" style="background:' + u.color + '"></div>';
        html += '<div class="av-text"><strong>' + u.name + '</strong>' + (entry.note ? ' – ' + entry.note : '') + '</div>';
        if (isMine) {
          html += '<div class="av-actions"><button type="button" class="edit-entry" title="ערוך">✏️</button><button type="button" class="del-entry" title="מחק">🗑️</button></div>';
        }
        item.innerHTML = html;
        if (isMine) {
          item.querySelector('.edit-entry').addEventListener('click', function() {
            state.editingEntry = idx;
            document.getElementById('noteInput').value = entry.note || '';
            document.getElementById('addBtn').textContent = 'עדכן זמינות';
            document.getElementById('addPanelTitle').textContent = 'עריכת זמינות';
            document.getElementById('cancelEditBtn').style.display = 'block';
            document.getElementById('noteInput').focus();
          });
          item.querySelector('.del-entry').addEventListener('click', function() {
            var updated = entries.slice();
            updated.splice(idx, 1);
            if (updated.length === 0) dbRemove('events/' + state.eventKey + '/availability/' + key).then(function() { showToast('הזמינות נמחקה', 'info'); });
            else dbSet('events/' + state.eventKey + '/availability/' + key, updated).then(function() { showToast('הזמינות נמחקה', 'info'); });
          });
        }
        list.appendChild(item);
      })(i);
    }
  }
  addBtn.disabled = false;
}

function cancelEdit() {
  state.editingEntry = null;
  document.getElementById('noteInput').value = '';
  document.getElementById('addBtn').textContent = 'הוסף זמינות';
  document.getElementById('addPanelTitle').textContent = 'הוספת זמינות';
  document.getElementById('cancelEditBtn').style.display = 'none';
}

function addAvailability() {
  if (!state.selected) return;
  var key = fmtKey(state.selected);
  var note = document.getElementById('noteInput').value.trim();
  var addBtn = document.getElementById('addBtn');
  addBtn.disabled = true;
  addBtn.textContent = 'שומר...';

  dbGet('events/' + state.eventKey + '/availability/' + key).then(function(snap) {
    var entries = snap.exists() ? snap.val() : [];
    if (state.editingEntry !== null && state.editingEntry < entries.length) {
      entries[state.editingEntry].note = note;
    } else {
      entries.push({ userId: state.user.id, note: note });
    }
    return dbSet('events/' + state.eventKey + '/availability/' + key, entries);
  }).then(function() {
    var wasEdit = state.editingEntry !== null;
    cancelEdit();
    showToast(wasEdit ? 'הזמינות עודכנה בהצלחה!' : 'הזמינות נוספה בהצלחה!', 'success');
    // Optionally sync to Google Calendar
    if (state.syncCalendar) {
      syncAvailabilityToCalendar(key, note);
    }
  }).catch(function(e) {
    showToast('שגיאה בשמירת הזמינות: ' + e.message, 'error');
  }).finally(function() {
    addBtn.disabled = false;
    addBtn.textContent = 'הוסף זמינות';
  });
}

function deleteEvent() {
  // Use a simple inline confirmation instead of native confirm()
  showToast('לוחץ שוב על "מחק" תוך 5 שניות לאישור', 'warning', 5000);
  var delBtn = document.getElementById('deleteEventBtn');
  delBtn.textContent = '⚠️ לחץ שוב לאישור';
  delBtn.style.background = '#991b1b';
  var confirmed = false;
  var handler = function() {
    confirmed = true;
    delBtn.removeEventListener('click', handler);
    dbRemove('events/' + state.eventKey).then(function() {
      showToast('האירוע נמחק בהצלחה.', 'success');
      logout();
    }).catch(function(e) {
      showToast('שגיאה במחיקת האירוע: ' + e.message, 'error');
    });
  };
  delBtn.addEventListener('click', handler);
  setTimeout(function() {
    if (!confirmed) {
      delBtn.removeEventListener('click', handler);
      delBtn.textContent = '🗑️ מחק את האירוע';
      delBtn.style.background = '';
    }
  }, 5000);
}

function logout() {
  // Leave the current event but keep user authenticated
  if (state.unsubscribe) state.unsubscribe();
  var savedUser = state.user;
  var savedIsGuest = state.isGuest;
  state.eventKey = null;
  state.eventName = null;
  state.eventCode = null;
  state.users = {};
  state.availability = {};
  state.month = new Date().getMonth();
  state.year = new Date().getFullYear();
  state.selected = null;
  state.unsubscribe = null;
  state.isAdmin = false;
  state.dateFrom = null;
  state.dateTo = null;
  state.editingEntry = null;
  state.user = savedUser;
  state.isGuest = savedIsGuest;
  // Clear form fields
  document.getElementById('newEventName').value = '';
  document.getElementById('newOrgName').value = '';
  document.getElementById('newOrgEmail').value = '';
  document.getElementById('newDateFrom').value = '';
  document.getElementById('newDateTo').value = '';
  document.getElementById('joinEventName').value = '';
  document.getElementById('joinCode').value = '';
  document.getElementById('joinUserName').value = '';
  document.getElementById('codeResult').style.display = 'none';
  var cb = document.getElementById('createBtn');
  cb.style.display = '';
  cb.disabled = false;
  cb.textContent = 'צור אירוע';
  document.getElementById('sendEmailBtn').textContent = '📧 שלח פרטים למייל שלי';
  document.getElementById('sendEmailBtn').disabled = false;
  document.getElementById('openMailtoBtn').style.display = 'none';
  document.getElementById('emailStatus').style.display = 'none';
  showToast('יצאת מהאירוע', 'info');
  showScreen('screen-home');
  window.state = state; // Re-expose updated state
}

// Share functions
function copyCode() {
  var code = document.getElementById('eventCodeDisplay').textContent;
  navigator.clipboard.writeText(code).then(function() {
    showToast('קוד האירוע הועתק!', 'success');
  }).catch(function(err) {
    showToast('שגיאה בהעתקת קוד: ' + err, 'error');
  });
}

function shareWhatsApp() {
  var eventName = state.eventName;
  var eventCode = state.eventCode;
  var url = window.location.href.split('?')[0];
  var text = `היי! אני מזמין/ה אותך לאירוע ${eventName} ב-Quick Event Coordinator.\n\nקוד גישה: ${eventCode}\n\nלהצטרפות: ${url}`; 
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareTelegram() {
  var eventName = state.eventName;
  var eventCode = state.eventCode;
  var url = window.location.href.split('?')[0];
  var text = `היי! אני מזמין/ה אותך לאירוע ${eventName} ב-Quick Event Coordinator.\n\nקוד גישה: ${eventCode}\n\nלהצטרפות: ${url}`; 
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
}

function shareCopyLink() {
  var eventName = state.eventName;
  var eventCode = state.eventCode;
  var url = window.location.href.split('?')[0];
  var text = `היי! אני מזמין/ה אותך לאירוע ${eventName} ב-Quick Event Coordinator.\n\nקוד גישה: ${eventCode}\n\nלהצטרפות: ${url}`; 
  navigator.clipboard.writeText(text).then(function() {
    showToast('פרטי האירוע הועתקו!', 'success');
  }).catch(function(err) {
    showToast('שגיאה בהעתקת פרטים: ' + err, 'error');
  });
}

// Admin panel date range update
document.getElementById('adminSetDatesBtn').addEventListener('click', function() {
  if (!state.isAdmin) {
    showToast('רק מארגן האירוע יכול לקבוע תאריכים.', 'error');
    return;
  }
  var newDateFrom = document.getElementById('adminDateFrom').value;
  var newDateTo = document.getElementById('adminDateTo').value;

  var updates = {};
  if (newDateFrom) updates['/dateFrom'] = newDateFrom;
  else updates['/dateFrom'] = null;
  if (newDateTo) updates['/dateTo'] = newDateTo;
  else updates['/dateTo'] = null;

  dbUpdate('events/' + state.eventKey, updates).then(function() {
    showToast('טווח התאריכים עודכן בהצלחה!', 'success');
  }).catch(function(e) {
    showToast('שגיאה בעדכון טווח תאריכים: ' + e.message, 'error');
  });
});

// EmailJS integration
var EMAILJS_CONFIG = {
  publicKey: 'qXuPWjrxXnWFwCqQy',
  serviceId: 'service_a0bgsq5',
  templateId: 'template_t4uiy7k'
};
var EMAILJS_READY = EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY';
if (EMAILJS_READY) emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

function sendEventEmail(toEmail, eventName, code, organizerName) {
  var siteUrl = window.location.href.split('?')[0];
  if (EMAILJS_READY) {
    return emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
      to_email: toEmail,
      event_name: eventName,
      event_code: code,
      organizer_name: organizerName,
      site_url: siteUrl
    }).then(function() {
      return { ok: true };
    }).catch(function(e) {
      console.error('EmailJS error:', e);
      return { ok: false, fallback: true };
    });
  }
  var subject = encodeURIComponent('הזמנה לתאם אירוע: ' + eventName);
  var body = encodeURIComponent('שלום,\n\n' + organizerName + ' מזמין/ת אותך לתאם זמינות לאירוע: ' + eventName + '\n\nשם האירוע: ' + eventName + '\nקוד גישה: ' + code + '\n\nכדי להצטרף היכנס לאתר: ' + siteUrl + '\nלחץ על "הצטרף לאירוע קיים" והזן את שם האירוע והקוד.\n\nבברכה,\n' + organizerName);
  return Promise.resolve({ ok: false, fallback: true, subject: subject, body: body });
}

function handleSendEmail() {
  var email = document.getElementById('newOrgEmail').value.trim();
  if (!email) {
    showToast('נא להזין כתובת אימייל.', 'error');
    return;
  }

  var sendBtn = document.getElementById('sendEmailBtn');
  sendBtn.disabled = true;
  sendBtn.textContent = 'שולח...';
  document.getElementById('emailStatus').style.display = 'none';

  sendEventEmail(email, state.eventName, state.eventCode, document.getElementById('newOrgName').value.trim())
    .then(function(result) {
      if (result.ok) {
        showToast('פרטי האירוע נשלחו למייל!', 'success');
        document.getElementById('emailStatus').textContent = 'נשלח בהצלחה!';
        document.getElementById('emailStatus').style.color = 'var(--accent)';
        document.getElementById('emailStatus').style.display = 'block';
        sendBtn.style.display = 'none';
      } else if (result.fallback) {
        showToast('שגיאה בשליחת מייל או שירות לא זמין. פותח חלון מייל ידני.', 'warning', 5000);
        document.getElementById('emailStatus').textContent = 'שגיאה בשליחה. נסה ידנית.';
        document.getElementById('emailStatus').style.color = 'var(--danger)';
        document.getElementById('emailStatus').style.display = 'block';
        document.getElementById('openMailtoBtn').style.display = 'block';
        handleMailto(result.subject, result.body);
      } else {
        showToast('שגיאה בשליחת מייל.', 'error');
        document.getElementById('emailStatus').textContent = 'שגיאה בשליחה.';
        document.getElementById('emailStatus').style.color = 'var(--danger)';
        document.getElementById('emailStatus').style.display = 'block';
      }
    })
    .catch(function(e) {
      showToast('שגיאה בשליחת מייל: ' + e.message, 'error');
      document.getElementById('emailStatus').textContent = 'שגיאה בשליחה.';
      document.getElementById('emailStatus').style.color = 'var(--danger)';
      document.getElementById('emailStatus').style.display = 'block';
    })
    .finally(function() {
      sendBtn.disabled = false;
      sendBtn.textContent = '📧 שלח פרטים למייל שלי';
    });
}

function handleMailto(subject, body) {
  var email = document.getElementById('newOrgEmail').value.trim();
  var mailtoLink = `mailto:${email}?subject=${subject || ''}&body=${body || ''}`;
  window.open(mailtoLink, '_blank');
}

function getRandomColor() {
  var colors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Initial setup for guest mode
function initializeGuestMode() {
  state.isGuest = true;
  state.user = { id: 'guest_' + Math.random().toString(36).substring(2, 9), name: 'אורח', color: getRandomColor() };
  showScreen('screen-home');
  showToast('נכנסת למצב אורח. חלק מהתכונות מוגבלות.', 'info', 5000);
  document.getElementById('guestModeNotice').style.display = 'block';
}

// Event listeners for core app functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initial screen setup - will be overridden by auth.js
  showScreen('screen-login');

  document.getElementById('goNew').addEventListener('click', function() { showScreen('screen-new'); });
  document.getElementById('goJoin').addEventListener('click', function() { showScreen('screen-join'); });
  document.getElementById('goDashboard').addEventListener('click', function() {
    showScreen('screen-dashboard');
    if (state.user && !state.isGuest) loadUserDashboard(state.user.id);
  });
  document.getElementById('backFromNew').addEventListener('click', function() { showScreen('screen-home'); });
  document.getElementById('backFromJoin').addEventListener('click', function() { showScreen('screen-home'); });
  document.getElementById('createBtn').addEventListener('click', function() { createEvent(); });
  document.getElementById('copyBtn').addEventListener('click', function() { copyCode(); });
  document.getElementById('sendEmailBtn').addEventListener('click', function() { handleSendEmail(); });
  document.getElementById('openMailtoBtn').addEventListener('click', function() { handleMailto(); });
  document.getElementById('enterCalBtn').addEventListener('click', function() { showScreen('screen-calendar'); });
  document.getElementById('joinBtn').addEventListener('click', function() { joinEvent(); });
  document.getElementById('addBtn').addEventListener('click', function() { addAvailability(); });
  document.getElementById('cancelEditBtn').addEventListener('click', function() { cancelEdit(); });
  document.getElementById('logoutBtn').addEventListener('click', function() { logout(); });
  // Update user name display when entering calendar
  if (state.user) document.getElementById('currentUserName').textContent = state.user.name || '';
  document.getElementById('deleteEventBtn').addEventListener('click', function() { deleteEvent(); });
  document.getElementById('shareWhatsApp').addEventListener('click', function() { shareWhatsApp(); });
  document.getElementById('shareTelegram').addEventListener('click', function() { shareTelegram(); });
  document.getElementById('shareCopyLink').addEventListener('click', function() { shareCopyLink(); });

  // Calendar navigation
  document.getElementById('prevMonth').addEventListener('click', function() {
    state.month--;
    if (state.month < 0) {
      state.month = 11;
      state.year--;
    }
    renderCal();
  });

  document.getElementById('nextMonth').addEventListener('click', function() {
    state.month++;
    if (state.month > 11) {
      state.month = 0;
      state.year++;
    }
    renderCal();
  });

  // Calendar sync toggle
  document.getElementById('syncCalendarToggle').addEventListener('change', function(e) {
    state.syncCalendar = e.target.checked;
    localStorage.setItem('syncCalendar', state.syncCalendar);
    showToast('סנכרון יומן Google ' + (state.syncCalendar ? 'הופעל' : 'כובה'), 'info');
  });
  // Set initial state of toggle
  document.getElementById('syncCalendarToggle').checked = state.syncCalendar;
});

// Expose functions to global scope for HTML to access
window.showScreen = showScreen;
window.createEvent = createEvent;
window.joinEvent = joinEvent;
window.addAvailability = addAvailability;
window.deleteEvent = deleteEvent;
window.logout = logout;
window.copyCode = copyCode;
window.shareWhatsApp = shareWhatsApp;
window.shareTelegram = shareTelegram;
window.shareCopyLink = shareCopyLink;
window.handleSendEmail = handleSendEmail;
window.handleMailto = handleMailto;
window.cancelEdit = cancelEdit;
window.initializeGuestMode = initializeGuestMode;
window.state = state; // Expose state for other modules to access
window.dbSet = dbSet;
window.dbUpdate = dbUpdate;
window.dbGet = dbGet;
window.dbRemove = dbRemove;
window.showToast = showToast;
window.listenToEvent = listenToEvent;
window.renderCal = renderCal;
window.renderSel = renderSel;
window.updateEventHeader = updateEventHeader;
window.updateAdminPanel = updateAdminPanel;
window.isDayInRange = isDayInRange;
window.getRandomColor = getRandomColor;
