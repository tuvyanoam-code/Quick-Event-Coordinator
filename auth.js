// auth.js

var auth = firebase.auth();

// Base provider: only basic profile. Calendar scope is requested on demand.
// `prompt=select_account` forces Google's small account-chooser popup instead of
// silently reusing the last session, so users can pick which account to use.
// When re-requesting a scope (calendarConsent), use `prompt=consent` so Google
// shows the permission dialog again even if previously granted.
function makeProvider(includeCalendar, calendarConsent) {
  var p = new firebase.auth.GoogleAuthProvider();
  if (includeCalendar) p.addScope('https://www.googleapis.com/auth/calendar.events');
  p.setCustomParameters({ prompt: calendarConsent ? 'consent' : 'select_account' });
  return p;
}

// Store the Google OAuth access token globally (only available right after signInWithPopup)
var _googleAccessToken = null;

function signInWithGoogle(includeCalendar) {
  showLoader();
  auth.signInWithPopup(makeProvider(includeCalendar))
    .then(function(result) {
      var credential = result.credential;
      if (credential) _googleAccessToken = credential.accessToken;
      console.log('Google Sign-In successful:', result.user.displayName);
      // onAuthStateChanged handles the rest
    })
    .catch(function(error) {
      hideLoader();
      console.error('Google Sign-In error:', error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User dismissed — no toast needed
        return;
      }
      if (window.showToast) window.showToast('שגיאת התחברות עם Google: ' + error.message, 'error');
    });
}

function signOutUser() {
  showLoader();
  auth.signOut().then(function() {
    _googleAccessToken = null;
    // Re-prime guest identity without navigating, then send the user back to
    // the login gate so they can explicitly choose how to continue.
    if (window.setupGuestUser) window.setupGuestUser();
    var dashBtn = document.getElementById('goDashboard');
    if (dashBtn) dashBtn.style.display = 'none';
    var signInBtn = document.getElementById('headerSignInBtn');
    var menuWrap = document.getElementById('userMenuWrap');
    if (signInBtn) signInBtn.style.display = '';
    if (menuWrap) menuWrap.style.display = 'none';
    closeUserMenu();
    if (window.showToast) window.showToast('התנתקת בהצלחה', 'info');
    if (window.showScreen) window.showScreen('screen-login');
  }).catch(function(error) {
    if (window.showToast) window.showToast('שגיאת התנתקות: ' + error.message, 'error');
  }).finally(function() {
    hideLoader();
  });
}

// Request Google Calendar scope explicitly (used when user toggles sync ON
// or re-grants from the account menu).
function requestCalendarScope() {
  return auth.signInWithPopup(makeProvider(true, true)).then(function(result) {
    if (result.credential) {
      _googleAccessToken = result.credential.accessToken;
      if (window.state && window.state.user) window.state.user.accessToken = _googleAccessToken;
    }
    return _googleAccessToken;
  });
}

// ── Account dropdown menu ──────────────────────────────────────────────
function toggleUserMenu(ev) {
  if (ev) ev.stopPropagation();
  var menu = document.getElementById('userMenu');
  var btn = document.getElementById('headerSignOutBtn');
  if (!menu) return;
  var open = menu.hasAttribute('hidden');
  if (open) {
    menu.removeAttribute('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  } else {
    closeUserMenu();
  }
}
function closeUserMenu() {
  var menu = document.getElementById('userMenu');
  var btn = document.getElementById('headerSignOutBtn');
  if (menu && !menu.hasAttribute('hidden')) menu.setAttribute('hidden', '');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}
function userMenuSignOut() { closeUserMenu(); signOutUser(); }
function userMenuGrantCalendar() {
  closeUserMenu();
  if (window.showToast) window.showToast('פותח את חלון ההרשאות של Google…', 'info');
  requestCalendarScope().then(function() {
    if (window.showToast) window.showToast('הרשאות יומן Google הוענקו', 'success');
  }).catch(function(error) {
    if (error && (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')) return;
    if (window.showToast) window.showToast('לא ניתן היה לקבל הרשאות: ' + (error && error.message ? error.message : 'שגיאה לא ידועה'), 'error');
  });
}
// Close menu when clicking elsewhere or pressing Escape
document.addEventListener('click', function(e) {
  var wrap = document.getElementById('userMenuWrap');
  if (wrap && !wrap.contains(e.target)) closeUserMenu();
});
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeUserMenu(); });

auth.onAuthStateChanged(function(user) {
  if (user) {
    console.log('User authenticated:', user.uid);
    window.state.isGuest = false;
    window.state.user = {
      id: user.uid,
      name: user.displayName || 'משתמש',
      email: user.email,
      photoURL: user.photoURL,
      accessToken: _googleAccessToken
    };

    var dashBtn = document.getElementById('goDashboard');
    if (dashBtn) dashBtn.style.display = '';
    var notice = document.getElementById('guestModeNotice');
    if (notice) notice.style.display = 'none';
    var signInBtn = document.getElementById('headerSignInBtn');
    var menuWrap = document.getElementById('userMenuWrap');
    var signOutBtn = document.getElementById('headerSignOutBtn');
    if (signInBtn) signInBtn.style.display = 'none';
    if (menuWrap) menuWrap.style.display = '';
    if (signOutBtn) signOutBtn.textContent = '👤 ' + (user.displayName || 'חשבון') + ' ▾';

    // Persist profile (merge so we don't clobber /events subtree)
    window._db.ref('users/' + user.uid).update({
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: firebase.database.ServerValue.TIMESTAMP
    }).catch(function(e) { console.warn('user profile update failed', e); });

    // Only navigate home if the user is currently staring at the legacy login screen
    var loginEl = document.getElementById('screen-login');
    if (loginEl && loginEl.classList.contains('active') && window.showScreen) {
      window.showScreen('screen-home');
    }
    hideLoader();
  } else {
    console.log('User not authenticated.');
    var signInBtn = document.getElementById('headerSignInBtn');
    var menuWrap = document.getElementById('userMenuWrap');
    if (signInBtn) signInBtn.style.display = '';
    if (menuWrap) menuWrap.style.display = 'none';
    hideLoader();
  }
});

window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
window.requestCalendarScope = requestCalendarScope;
window.toggleUserMenu = toggleUserMenu;
window.closeUserMenu = closeUserMenu;
window.userMenuSignOut = userMenuSignOut;
window.userMenuGrantCalendar = userMenuGrantCalendar;
// Legacy name kept for existing callers
window.refreshGoogleToken = requestCalendarScope;
