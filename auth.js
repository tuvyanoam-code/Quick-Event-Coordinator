// auth.js

var auth = firebase.auth();
var googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

// Store the Google OAuth access token globally (only available right after signInWithPopup)
var _googleAccessToken = null;

function signInWithGoogle() {
  showLoader();
  auth.signInWithPopup(googleProvider)
    .then(function(result) {
      // Store the Google OAuth access token from the credential
      var credential = result.credential;
      if (credential) {
        _googleAccessToken = credential.accessToken;
      }
      var user = result.user;
      console.log("Google Sign-In successful:", user.displayName);
      // onAuthStateChanged will handle the rest
    })
    .catch(function(error) {
      hideLoader();
      console.error("Google Sign-In error:", error.code, error.message);
      showToast("שגיאת התחברות עם Google: " + error.message, "error");
    });
}

function signOutUser() {
  showLoader();
  auth.signOut().then(function() {
    _googleAccessToken = null;
    window.state.user = null;
    window.state.isGuest = true;
    window.showScreen('screen-login');
    window.showToast('התנתקת בהצלחה', 'info');
  }).catch(function(error) {
    window.showToast('שגיאת התנתקות: ' + error.message, 'error');
  }).finally(function() {
    hideLoader();
  });
}

// Re-authenticate to get a fresh access token (needed for Google Calendar after page reload)
function refreshGoogleToken() {
  return auth.currentUser.getIdToken(true).then(function() {
    // Re-sign in with popup to get a fresh OAuth token
    return auth.signInWithPopup(googleProvider);
  }).then(function(result) {
    if (result.credential) {
      _googleAccessToken = result.credential.accessToken;
      window.state.user.accessToken = _googleAccessToken;
    }
    return _googleAccessToken;
  });
}

auth.onAuthStateChanged(function(user) {
  if (user) {
    console.log("User authenticated:", user.uid);
    window.state.isGuest = false;
    window.state.user = {
      id: user.uid,
      name: user.displayName || 'משתמש חדש',
      email: user.email,
      photoURL: user.photoURL,
      accessToken: _googleAccessToken // Will be set after signInWithPopup
    };

    // Show dashboard button on home screen
    var dashBtn = document.getElementById('goDashboard');
    if (dashBtn) dashBtn.style.display = '';

    // Hide guest notice
    document.getElementById('guestModeNotice').style.display = 'none';

    // Store user profile in Firebase DB (merge, don't overwrite events)
    window._db.ref('users/' + user.uid).update({
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: firebase.database.ServerValue.TIMESTAMP
    }).then(function() {
      window.showScreen('screen-home');
      hideLoader();
    }).catch(function(error) {
      console.error("Error updating user profile:", error);
      window.showToast('שגיאה בעדכון פרופיל: ' + error.message, 'error');
      window.showScreen('screen-home');
      hideLoader();
    });

  } else {
    console.log("User not authenticated.");
    if (window.state && window.state.isGuest === false) {
      window.showScreen('screen-login');
    }
    hideLoader();
  }
});

window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
window.refreshGoogleToken = refreshGoogleToken;
