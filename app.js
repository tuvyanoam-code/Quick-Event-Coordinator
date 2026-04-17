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
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
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

// De-duplicate identical toasts fired within 1.5s, cap visible stack at 3,
// and shorten defaults so confirmations feel subtle rather than loud.
var _recentToasts = {};
var TOAST_MAX = 3;

function showToast(message, type, duration) {
  var key = (type || 'info') + '::' + message;
  var now = Date.now();
  if (_recentToasts[key] && now - _recentToasts[key] < 1500) return;
  _recentToasts[key] = now;

  var existing = toastContainer.querySelectorAll('.toast');
  if (existing.length >= TOAST_MAX) {
    var oldest = existing[0];
    oldest.classList.remove('show');
    setTimeout(function() { if (oldest.parentNode) oldest.remove(); }, 280);
  }

  var toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'info');
  var icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'i';
  toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span class="toast-text">' + message + '</span>';
  toastContainer.appendChild(toast);

  void toast.offsetWidth;
  requestAnimationFrame(function() { toast.classList.add('show'); });

  var def = (type === 'error' || type === 'warning') ? 3800 : 2400;
  setTimeout(function() {
    toast.classList.remove('show');
    var removed = false;
    toast.addEventListener('transitionend', function() {
      if (removed) return;
      removed = true;
      if (toast.parentNode) toast.remove();
    });
    setTimeout(function() { if (!removed && toast.parentNode) toast.remove(); }, 600);
  }, duration || def);
}

// Screen management
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(function(screen) {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
  // Hide AI window when changing screens
  document.getElementById('ai-window').classList.remove('open');
  // The login gate has its own sign-in button; hide the floating top header
  // there, and also hide the floating AI assistant so it doesn't distract.
  var appHeader = document.querySelector('.app-header');
  var aiFab = document.getElementById('ai-fab');
  var onGate = (screenId === 'screen-login');
  if (appHeader) appHeader.style.display = onGate ? 'none' : 'flex';
  if (aiFab) aiFab.style.display = onGate ? 'none' : 'flex';
  // Pre-fill the create-event form with the signed-in user's name + email
  // as editable defaults the first time they arrive at the screen.
  if (screenId === 'screen-new') prefillCreateEventForm();
  window.scrollTo(0, 0);
}

// Pre-fill the create-event form with the logged-in user's name + email.
// Fields remain fully editable — the Google email is just a default, and a
// small hint tells the user they can change it. The hint hides if they do.
function prefillCreateEventForm() {
  if (!state.user || state.isGuest) return;
  var nameInput = document.getElementById('newOrgName');
  var emailInput = document.getElementById('newOrgEmail');
  var hint = document.getElementById('emailAutoHint');
  if (nameInput && !nameInput.value && state.user.name && state.user.name !== 'אורח') {
    nameInput.value = state.user.name;
  }
  if (emailInput && state.user.email) {
    if (!emailInput.value) emailInput.value = state.user.email;
    if (hint) hint.style.display = (emailInput.value === state.user.email) ? 'flex' : 'none';
    emailInput.oninput = function() {
      if (hint) hint.style.display = (this.value === state.user.email) ? 'flex' : 'none';
    };
  }
}

// Theme: automatic based on sunset/sunrise at user's location.
// Manual toggle overrides until the page is refreshed.
var themeToggle = document.getElementById('theme-toggle');
var THEME_LOC_KEY = 'theme-location';
var THEME_DEFAULT_LOC = { lat: 32.0853, lng: 34.7818 }; // Tel Aviv fallback
var themeManualOverride = false;

// Minimal inline SVG icons used for UI chrome — keeps parity with HTML icons.
var ICONS = {
  sun:  '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  user: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  caret:'<svg class="icon caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
  pencil:'<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  trash:'<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  chevronBack:'<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
  mail:'<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
};
window.ICONS = ICONS;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Show the icon of the mode the user can SWITCH TO (not the current one)
  themeToggle.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
}

// NOAA sunrise/sunset algorithm. Returns UTC hours (decimal) for the given date.
function computeSunTimes(date, lat, lng) {
  var rad = Math.PI / 180;
  var deg = 180 / Math.PI;
  var start = Date.UTC(date.getUTCFullYear(), 0, 0);
  var n = Math.floor((date.getTime() - start) / 86400000);
  var lngHour = lng / 15;
  var zenith = 90.833; // official sunrise/sunset

  function calc(isSunrise) {
    var t = n + ((isSunrise ? 6 : 18) - lngHour) / 24;
    var M = (0.9856 * t) - 3.289;
    var L = M + (1.916 * Math.sin(rad * M)) + (0.020 * Math.sin(rad * 2 * M)) + 282.634;
    L = (L + 360) % 360;
    var RA = deg * Math.atan(0.91764 * Math.tan(rad * L));
    RA = (RA + 360) % 360;
    var Lq = Math.floor(L / 90) * 90;
    var RAq = Math.floor(RA / 90) * 90;
    RA = (RA + (Lq - RAq)) / 15;
    var sinDec = 0.39782 * Math.sin(rad * L);
    var cosDec = Math.cos(Math.asin(sinDec));
    var cosH = (Math.cos(rad * zenith) - (sinDec * Math.sin(rad * lat))) / (cosDec * Math.cos(rad * lat));
    if (cosH > 1 || cosH < -1) return null;
    var H = (isSunrise ? 360 - deg * Math.acos(cosH) : deg * Math.acos(cosH)) / 15;
    var T = H + RA - (0.06571 * t) - 6.622;
    return (T - lngHour + 24) % 24;
  }

  return { sunriseUT: calc(true), sunsetUT: calc(false) };
}

function isNightNow(lat, lng) {
  var now = new Date();
  var times = computeSunTimes(now, lat, lng);
  if (times.sunriseUT == null || times.sunsetUT == null) {
    // Polar day/night — fall back to local clock
    var h = now.getHours();
    return h < 6 || h >= 18;
  }
  var nowUT = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  return nowUT < times.sunriseUT || nowUT >= times.sunsetUT;
}

function autoApplyTheme() {
  if (themeManualOverride) return;
  var loc;
  try { loc = JSON.parse(localStorage.getItem(THEME_LOC_KEY)); } catch (e) {}
  if (!loc || typeof loc.lat !== 'number') loc = THEME_DEFAULT_LOC;
  applyTheme(isNightNow(loc.lat, loc.lng) ? 'dark' : 'light');
}

autoApplyTheme();

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(pos) {
    localStorage.setItem(THEME_LOC_KEY, JSON.stringify({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    }));
    autoApplyTheme();
  }, function() { /* denied — keep cached or default */ },
  { timeout: 8000, maximumAge: 86400000 });
}

// Re-check every 5 minutes so the theme flips automatically at sunrise/sunset.
setInterval(autoApplyTheme, 5 * 60 * 1000);

themeToggle.addEventListener('click', function() {
  themeManualOverride = true;
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
  var eventName = document.getElementById('newEventName').value.trim();
  var organizerName = document.getElementById('newOrgName').value.trim();
  var organizerEmail = document.getElementById('newOrgEmail').value.trim();
  var dateFrom = document.getElementById('newDateFrom').value;
  var dateTo = document.getElementById('newDateTo').value;

  if (!eventName || !organizerName) {
    showToast('שם אירוע ושם מארגן הם שדות חובה.', 'error');
    return;
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    showToast('תאריך ההתחלה חייב להיות לפני תאריך הסיום.', 'error');
    return;
  }

  showLoader();
  var eventKey = window._db.ref('events').push().key;
  // 4-digit numeric code — easier to share verbally than an alphanumeric blob
  var eventCode = String(Math.floor(1000 + Math.random() * 9000));
  var organizerColor = getRandomColor();

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
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    // IMPORTANT: register organizer in users node so their dots/notes render
    users: (function() {
      var u = {};
      u[state.user.id] = { name: organizerName, color: organizerColor };
      return u;
    })()
  };

  // Keep the organizer's chosen display-name locally too
  state.user.name = organizerName;
  state.user.color = organizerColor;

  dbSet('events/' + eventKey, newEvent)
    .then(function() {
      // Link event to organizer's profile (only if authenticated; guests can skip)
      if (!state.isGuest) {
        return dbSet('users/' + state.user.id + '/events/' + eventKey, { role: 'admin', eventName: eventName });
      }
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
      // Hide the "Create" button now that creation succeeded
      document.getElementById('createBtn').style.display = 'none';
      // Scroll the code + share block into view on small screens
      document.getElementById('codeResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  var eventCode = document.getElementById('joinCode').value.trim();
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
          state.user.name = userName;
          state.user.color = userColor;
          return dbSet('events/' + foundEventKey + '/users/' + state.user.id, { name: userName, color: userColor });
        } else {
          // Update name if user already exists; preserve color
          state.user.name = userName;
          state.user.color = userSnap.val().color;
          return dbUpdate('events/' + foundEventKey + '/users/' + state.user.id, { name: userName });
        }
      }).then(function() {
        // Link event to user's profile only for authenticated users
        if (!state.isGuest) {
          return dbSet('users/' + state.user.id + '/events/' + foundEventKey, { role: 'participant', eventName: eventName });
        }
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

  var cb = function(snapshot) {
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
  };
  var errCb = function(error) {
    console.error('Firebase listen error:', error);
    showToast('שגיאה בטעינת נתוני אירוע: ' + error.message, 'error');
  };
  eventRef.on('value', cb, errCb);
  state.unsubscribe = function() { eventRef.off('value', cb); };
}

function updateEventHeader() {
  document.getElementById('calEventName').textContent = state.eventName;
  document.getElementById('calEventCode').textContent = state.eventCode;
  document.getElementById('eventAdminBadge').style.display = state.isAdmin ? 'inline-block' : 'none';
  document.getElementById('adminPanel').style.display = state.isAdmin ? 'block' : 'none';
  document.getElementById('logoutBtn').innerHTML = ICONS.chevronBack + '<span>חזרה למסך הבית</span>';
  // Prefer the name/color the user registered WITH this event over the auth-level name
  var eventUser = state.user && state.users[state.user.id];
  var displayName = (eventUser && eventUser.name) || (state.user && state.user.name) || '';
  var displayColor = (eventUser && eventUser.color) || 'var(--accent)';
  document.getElementById('currentUserName').textContent = displayName;
  var userDot = document.querySelector('#screen-calendar .user-pill .uc');
  if (userDot) userDot.style.background = displayColor;

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
  // dateKey and state.dateFrom/To are all "YYYY-MM-DD" — string compare works lexicographically
  if (state.dateFrom && dateKey < state.dateFrom) return false;
  if (state.dateTo && dateKey > state.dateTo) return false;
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
  // DAY_NAMES starts with Sunday (א), and JS getDay() returns 0 for Sunday —
  // so no adjustment is needed. Using any offset mis-aligns the Hebrew week.
  var start = first.getDay();

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
        var entry = avail[j];
        var u = state.users[entry.userId];
        var dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.background = (u && u.color) || '#9ca3af';
        if (u && u.name) dot.title = u.name;
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
        var u = state.users[entry.userId] || { name: 'משתתף', color: '#9ca3af' };
        var isMine = (entry.userId === state.user.id);
        var item = document.createElement('div');
        item.className = 'av-item';
        if (isMine) item.classList.add('mine');
        var html = '<div class="av-color" style="background:' + escapeHtml(u.color) + '"></div>';
        html += '<div class="av-text"><strong>' + escapeHtml(u.name) + '</strong>' + (entry.note ? ' – ' + escapeHtml(entry.note) : '') + '</div>';
        if (isMine) {
          html += '<div class="av-actions"><button type="button" class="edit-entry" title="ערוך" aria-label="ערוך">' + ICONS.pencil + '</button><button type="button" class="del-entry" title="מחק" aria-label="מחק">' + ICONS.trash + '</button></div>';
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
            // Silent delete — the row disappearing from the list is feedback enough.
            if (updated.length === 0) dbRemove('events/' + state.eventKey + '/availability/' + key);
            else dbSet('events/' + state.eventKey + '/availability/' + key, updated);
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
    // Only toast on edit — a new entry shows up in the list, which is feedback enough.
    if (wasEdit) showToast('הזמינות עודכנה', 'success');
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
  // Inline confirmation — restore the original button markup on timeout.
  showToast('לוחץ שוב על "מחק" תוך 5 שניות לאישור', 'warning', 5000);
  var delBtn = document.getElementById('deleteEventBtn');
  var originalHTML = delBtn.innerHTML;
  delBtn.textContent = 'לחץ שוב לאישור';
  delBtn.style.background = '#991b1b';
  var confirmed = false;
  var handler = function() {
    confirmed = true;
    delBtn.removeEventListener('click', handler);
    dbRemove('events/' + state.eventKey).then(function() {
      showToast('האירוע נמחק', 'success');
      logout();
    }).catch(function(e) {
      showToast('שגיאה במחיקת האירוע: ' + e.message, 'error');
    });
  };
  delBtn.addEventListener('click', handler);
  setTimeout(function() {
    if (!confirmed) {
      delBtn.removeEventListener('click', handler);
      delBtn.innerHTML = originalHTML;
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
  // Restore baseline user (without event-specific color/name)
  state.user = { id: savedUser.id, name: savedUser.name, email: savedUser.email, photoURL: savedUser.photoURL, accessToken: savedUser.accessToken };
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
  document.getElementById('sendEmailBtn').innerHTML = ICONS.mail + '<span>שלח פרטים למייל שלי</span>';
  document.getElementById('sendEmailBtn').disabled = false;
  document.getElementById('openMailtoBtn').style.display = 'none';
  document.getElementById('emailStatus').style.display = 'none';
  // No toast — the screen change itself is sufficient feedback.
  showScreen('screen-home');
  window.state = state; // Re-expose updated state
}

// Share functions
// Inline feedback — the clicked button itself flashes "✓ הועתק" for 1.5s.
// Less intrusive than a toast because the user is already looking at the button.
function _flashCopyButton(btn, txt) {
  if (!btn) return;
  var orig = btn.textContent;
  btn.textContent = txt || '✓ הועתק';
  btn.classList.add('copied');
  clearTimeout(btn._flashTimer);
  btn._flashTimer = setTimeout(function() {
    btn.textContent = orig;
    btn.classList.remove('copied');
  }, 1500);
}

function copyCode() {
  var code = document.getElementById('eventCodeDisplay').textContent;
  var btn = document.getElementById('copyBtn');
  navigator.clipboard.writeText(code).then(function() {
    _flashCopyButton(btn);
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
  var btn = document.getElementById('shareCopyLink');
  navigator.clipboard.writeText(text).then(function() {
    _flashCopyButton(btn);
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
      sendBtn.innerHTML = ICONS.mail + '<span>שלח פרטים למייל שלי</span>';
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

// Ensure a stable guest identity exists in state + localStorage (no navigation)
function setupGuestUser() {
  state.isGuest = true;
  var storedId = localStorage.getItem('guestId');
  if (!storedId) {
    storedId = 'guest_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('guestId', storedId);
  }
  state.user = { id: storedId, name: 'אורח', color: getRandomColor() };
}

// Explicit user action: "Continue as guest" from the login gate
function continueAsGuest() {
  setupGuestUser();
  showScreen('screen-home');
  var dashBtn = document.getElementById('goDashboard');
  if (dashBtn) dashBtn.style.display = 'none';
  var notice = document.getElementById('guestModeNotice');
  if (notice) notice.style.display = 'block';
  // The persistent guest-notice bar is enough — no toast on top of it.
}

// Kept for backward compatibility with any lingering callers
function initializeGuestMode(showNotice) {
  if (showNotice) continueAsGuest();
  else setupGuestUser();
}

// Event listeners for core app functionality
document.addEventListener('DOMContentLoaded', function() {
  // Set up a fallback guest identity so state.user is always defined for
  // downstream code, but DO NOT navigate. The HTML default active screen is
  // the login gate; the user must explicitly sign in or pick "continue as
  // guest" before they can reach the home / create / join flows.
  setupGuestUser();
  // On the login gate, hide the top floating controls so the gate is the
  // only interactive element on screen.
  var appHeader = document.querySelector('.app-header');
  var aiFab = document.getElementById('ai-fab');
  if (appHeader) appHeader.style.display = 'none';
  if (aiFab) aiFab.style.display = 'none';

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
    var wantOn = e.target.checked;
    if (wantOn && state.isGuest) {
      e.target.checked = false;
      state.syncCalendar = false;
      localStorage.setItem('syncCalendar', 'false');
      showToast('התחבר עם Google כדי לסנכרן ליומן.', 'warning');
      return;
    }
    state.syncCalendar = wantOn;
    localStorage.setItem('syncCalendar', state.syncCalendar);
    if (wantOn && window.requestCalendarScope && (!state.user || !state.user.accessToken)) {
      window.requestCalendarScope().then(function() {
        showToast('סנכרון Google Calendar הופעל', 'success');
      }).catch(function() {
        e.target.checked = false;
        state.syncCalendar = false;
        localStorage.setItem('syncCalendar', 'false');
        showToast('ההרשאה לא ניתנה — סנכרון כובה.', 'warning');
      });
      return;
    }
    showToast('סנכרון יומן Google ' + (wantOn ? 'הופעל' : 'כובה'), 'info');
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
window.continueAsGuest = continueAsGuest;
window.setupGuestUser = setupGuestUser;
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
window.fmtKey = fmtKey;
window.fmtLabel = fmtLabel;
