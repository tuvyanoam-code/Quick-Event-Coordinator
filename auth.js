// auth.js

var auth = firebase.auth();

// Base provider: only basic profile. Calendar scope is requested on demand.
function makeProvider(includeCalendar) {
  var p = new firebase.auth.GoogleAuthProvider();
  if (includeCalendar) p.addScope('https://www.googleapis.com/auth/calendar.events');
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
    var signOutBtn = document.getElementById('headerSignOutBtn');
    if (signInBtn) signInBtn.style.display = '';
    if (signOutBtn) signOutBtn.style.display = 'none';
    if (window.showToast) window.showToast('התנתקת בהצלחה', 'info');
    if (window.showScreen) window.showScreen('screen-login');
  }).catch(function(error) {
    if (window.showToast) window.showToast('שגיאת התנתקות: ' + error.message, 'error');
  }).finally(function() {
    hideLoader();
  });
}

// Request Google Calendar scope explicitly (used when user toggles sync ON)
function requestCalendarScope() {
  return auth.signInWithPopup(makeProvider(true)).then(function(result) {
    if (result.credential) {
      _googleAccessToken = result.credential.accessToken;
      if (window.state && window.state.user) window.state.user.accessToken = _googleAccessToken;
    }
    return _googleAccessToken;
  });
}

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
    var signOutBtn = document.getElementById('headerSignOutBtn');
    if (signInBtn) signInBtn.style.display = 'none';
    if (signOutBtn) {
      signOutBtn.style.display = '';
      signOutBtn.textContent = '🚪 ' + (user.displayName || 'יציאה');
    }

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
    var signOutBtn = document.getElementById('headerSignOutBtn');
    if (signInBtn) signInBtn.style.display = '';
    if (signOutBtn) signOutBtn.style.display = 'none';
    hideLoader();
  }
});

window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
window.requestCalendarScope = requestCalendarScope;
// Legacy name kept for existing callers
window.refreshGoogleToken = requestCalendarScope;
