// dashboard.js

function loadUserDashboard(uid) {
  showLoader();
  window.dbGet("users/" + uid + "/events")
    .then(function(snapshot) {
      var events = snapshot.val();
      var eventListDiv = document.getElementById("dashboardEventList");
      eventListDiv.innerHTML = ""; // Clear previous list

      if (!events) {
        var tEmpty = (window.t ? window.t('dashboard.empty') : 'עדיין לא יצרתם או הצטרפתם לאירועים.');
        var tBack = (window.t ? window.t('dashboard.backHome') : 'חזרה למסך הבית');
        eventListDiv.innerHTML =
          '<div class="dashboard-empty"><p>' + tEmpty + '</p>' +
          '<button class="btn btn-ghost btn-sm" onclick="showScreen(\'screen-home\')">' + tBack + '</button></div>';
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
          var T = window.t || function(k,p){return k;};
          var loc = (window.i18n && window.i18n.getLocale()) || 'he-IL';
          var dateRangeText = "";
          if (event.data.dateFrom && event.data.dateTo) {
            dateRangeText = T('dashboard.rangeFromTo', {
              from: new Date(event.data.dateFrom).toLocaleDateString(loc),
              to: new Date(event.data.dateTo).toLocaleDateString(loc)
            });
          } else if (event.data.dateFrom) {
            dateRangeText = T('dashboard.rangeFrom', {
              from: new Date(event.data.dateFrom).toLocaleDateString(loc)
            });
          } else if (event.data.dateTo) {
            dateRangeText = T('dashboard.rangeTo', {
              to: new Date(event.data.dateTo).toLocaleDateString(loc)
            });
          }

          var esc = window.escapeHtml || function(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
          var roleBadge = event.role === 'admin'
            ? '<span class="event-item-role role-admin">' + T('dashboard.roleAdmin') + '</span>'
            : '<span class="event-item-role role-participant">' + T('dashboard.roleParticipant') + '</span>';
          eventItem.innerHTML =
            '<div class="event-item-head">' +
              '<h3></h3>' +
              roleBadge +
            '</div>' +
            '<div class="meta">' +
              '<span>' + T('dashboard.participants', {n: participantCount}) + '</span>' +
              (dateRangeText ? '<span>' + esc(dateRangeText) + '</span>' : '') +
            '</div>' +
            '<div class="actions">' +
              '<button class="btn btn-primary view-btn" type="button">' + T('dashboard.view') + '</button>' +
              '<button class="btn btn-ghost leave-btn" type="button">' + T('dashboard.leave') + '</button>' +
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
      var T = window.t || function(k,p){return k;};
      window.showToast(T('toast.dashboardLoadError', {msg: error.message}), "error");
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
  var T = window.t || function(k,p){return k;};
  if (targetBtn && !targetBtn._confirming) {
    targetBtn._confirming = true;
    var originalText = targetBtn.textContent;
    targetBtn.textContent = T('dashboard.leaveConfirm');
    targetBtn.classList.add('confirming');
    window.showToast(T('toast.confirmLeave'), 'warning', 5000);
    _leaveConfirmTimer = setTimeout(function() {
      targetBtn._confirming = false;
      targetBtn.textContent = originalText;
      targetBtn.classList.remove('confirming');
    }, 5000);
    return;
  }
  if (_leaveConfirmTimer) clearTimeout(_leaveConfirmTimer);
  showLoader();
  window.dbRemove('users/' + window.state.user.id + '/events/' + eventKey)
    .then(function() {
      // Rely on the event disappearing from the list as feedback — no toast.
      loadUserDashboard(window.state.user.id);
    })
    .catch(function(error) {
      window.showToast(T('toast.leaveError', {msg: error.message}), 'error');
    })
    .finally(function() {
      hideLoader();
    });
}

// Expose functions to global scope
window.loadUserDashboard = loadUserDashboard;
window.viewEvent = viewEvent;
window.leaveEvent = leaveEvent;
