// dashboard.js

function loadUserDashboard(uid) {
  showLoader();
  window.dbGet("users/" + uid + "/events")
    .then(function(snapshot) {
      var events = snapshot.val();
      var eventListDiv = document.getElementById("dashboardEventList");
      eventListDiv.innerHTML = ""; // Clear previous list

      if (!events) {
        eventListDiv.innerHTML = 
          `<div style="text-align: center; padding: 20px; color: var(--muted);">
            <p>עדיין לא יצרת או הצטרפת לאירועים.</p>
            <button class="btn btn-sm" style="width: auto; margin-top: 15px;" onclick="showScreen('screen-home')">צור/הצטרף לאירוע</button>
          </div>`;
        hideLoader();
        return;
      }

      var eventKeys = Object.keys(events);
      var promises = eventKeys.map(function(eventKey) {
        return window.dbGet("events/" + eventKey).then(function(eventSnap) {
          var eventData = eventSnap.val();
          if (eventData) {
            return { key: eventKey, role: events[eventKey].role, data: eventData };
          } else {
            // If event data is missing, remove from user's dashboard
            window.dbRemove("users/" + uid + "/events/" + eventKey);
            return null;
          }
        });
      });

      Promise.all(promises).then(function(eventDetails) {
        eventDetails.filter(function(e) { return e !== null; }).forEach(function(event) {
          var eventItem = document.createElement("div");
          eventItem.className = "event-item";

          var participantCount = Object.keys(event.data.users || {}).length;
          var dateRangeText = "";
          if (event.data.dateFrom && event.data.dateTo) {
            dateRangeText = `מ-${new Date(event.data.dateFrom).toLocaleDateString("he-IL")} עד-${new Date(event.data.dateTo).toLocaleDateString("he-IL")}`;
          } else if (event.data.dateFrom) {
            dateRangeText = `מ-${new Date(event.data.dateFrom).toLocaleDateString("he-IL")}`;
          } else if (event.data.dateTo) {
            dateRangeText = `עד-${new Date(event.data.dateTo).toLocaleDateString("he-IL")}`;
          }

          var esc = window.escapeHtml || function(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
          eventItem.innerHTML =
            '<h3></h3>' +
            '<p>תפקיד: ' + (event.role === "admin" ? "מארגן" : "משתתף") + '</p>' +
            '<div class="meta">' +
              '<span>' + participantCount + ' משתתפים</span>' +
              '<span>' + esc(dateRangeText) + '</span>' +
            '</div>' +
            '<div class="actions">' +
              '<button class="btn view-btn" type="button">צפה באירוע</button>' +
              '<button class="btn leave-btn" type="button">עזוב אירוע</button>' +
            '</div>';
          // Safely set name as textContent so HTML in the name can't inject
          eventItem.querySelector('h3').textContent = event.data.name || '';

          var viewBtn = eventItem.querySelector('.view-btn');
          var leaveBtn = eventItem.querySelector('.leave-btn');
          viewBtn.addEventListener('click', function() {
            viewEvent(event.key, event.data.name, event.data.code, event.role === 'admin');
          });
          leaveBtn.addEventListener('click', function() {
            leaveEvent(event.key, event.data.name, leaveBtn);
          });
          eventListDiv.appendChild(eventItem);
        });
        hideLoader();
      });
    })
    .catch(function(error) {
      console.error("Error loading dashboard:", error);
      window.showToast("שגיאה בטעינת לוח המחוונים: " + error.message, "error");
      hideLoader();
    });
}

function viewEvent(eventKey, eventName, eventCode, isAdmin) {
  showLoader();
  window.state.eventKey = eventKey;
  window.state.eventName = eventName;
  window.state.eventCode = eventCode;
  window.state.isAdmin = isAdmin;
  window.state.isGuest = false; // Ensure not in guest mode when viewing a specific event

  window.listenToEvent(eventKey);
  window.showScreen("screen-calendar");
  hideLoader();
}

var _leaveConfirmTimer = null;
function leaveEvent(eventKey, eventName, targetBtn) {
  // Use double-click confirmation instead of native confirm()
  if (targetBtn && !targetBtn._confirming) {
    targetBtn._confirming = true;
    targetBtn.textContent = '⚠️ לחץ שוב לאישור';
    targetBtn.style.background = '#991b1b';
    window.showToast('לחץ שוב תוך 5 שניות לאישור עזיבה', 'warning', 5000);
    _leaveConfirmTimer = setTimeout(function() {
      targetBtn._confirming = false;
      targetBtn.textContent = 'עזוב אירוע';
      targetBtn.style.background = '';
    }, 5000);
    return;
  }
  if (_leaveConfirmTimer) clearTimeout(_leaveConfirmTimer);
  showLoader();
  window.dbRemove('users/' + window.state.user.id + '/events/' + eventKey)
    .then(function() {
      window.showToast('עזבת את האירוע "' + eventName + '"', 'info');
      loadUserDashboard(window.state.user.id);
    })
    .catch(function(error) {
      window.showToast('שגיאה בעזיבת אירוע: ' + error.message, 'error');
    })
    .finally(function() {
      hideLoader();
    });
}

// Expose functions to global scope
window.loadUserDashboard = loadUserDashboard;
window.viewEvent = viewEvent;
window.leaveEvent = leaveEvent;
