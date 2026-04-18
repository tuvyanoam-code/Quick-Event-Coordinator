// ═══════════════════════════════════════════════════════════════════════
// i18n.js — internationalization for Quick Event Coordinator
//
// Single dictionary, two languages (Hebrew, English). Loaded synchronously
// before app.js so every other module can rely on window.i18n / window.t.
//
// Usage:
//   <span data-i18n="login.hero">...</span>           → sets textContent
//   <input data-i18n-placeholder="new.nameEventPh"/>  → sets placeholder
//   <button data-i18n-title="nav.prevMonth">...       → sets title
//   <button data-i18n-aria-label="ai.sendLabel">...   → sets aria-label
//
// Runtime lookup: t('key.subkey', {name: 'Noam'})
// Language switch: setLanguage('he' | 'en')
// ═══════════════════════════════════════════════════════════════════════

(function(){
  var DICT = {
    he: {
      // ── App header chrome ─────────────────────────────────────
      'chrome.signIn': 'התחברות',
      'chrome.grantCalendar': 'הענקת הרשאות יומן',
      'chrome.signOut': 'ניתוק',
      'chrome.themeToggle': 'מצב בהיר/כהה',
      'chrome.langToggle': 'שפה',
      'chrome.langHe': 'HE',
      'chrome.langEn': 'EN',

      // ── Login gate ────────────────────────────────────────────
      'login.hero': 'תיאום זמינות,<br/>בלי הרעש.',
      'login.sub': 'צרו אירוע, שתפו קוד, וראו מתי כולם פנויים — במקום אחד, בלי טבלאות ובלי הודעות חוזרות.',
      'login.google': 'התחברות עם Google',
      'login.divider': 'או',
      'login.guest': 'המשך ללא התחברות',
      'login.finePrint': 'התחברות שומרת את האירועים שלכם ומאפשרת סנכרון ל-Google Calendar. אורחים יכולים ליצור ולהצטרף לאירועים, אבל לא לסנכרן ליומן.',

      // ── Guest notice bar ──────────────────────────────────────
      'guest.notice': 'מצב אורח — האירועים שלכם לא נשמרים בחשבון.',
      'guest.cta': 'התחברות עם Google',

      // ── Home screen ──────────────────────────────────────────
      'home.greetingDefault': 'מה נתאם היום?',
      'home.greetingPersonal': 'שלום, {name}. מה נתאם היום?',
      'home.newTitle': 'אירוע חדש',
      'home.newDesc': 'הגדירו טווח תאריכים, שתפו קוד, וראו מתי כולם פנויים.',
      'home.joinTitle': 'הצטרפות לאירוע',
      'home.joinDesc': 'הזינו את הקוד שקיבלתם וסמנו מתי אתם זמינים.',
      'home.dashTitle': 'האירועים שלי',
      'home.dashDesc': 'כל האירועים שיצרתם או הצטרפתם אליהם — במקום אחד.',

      // ── Back buttons ─────────────────────────────────────────
      'back.home': 'חזרה למסך הבית',
      'back.plain': 'חזרה',

      // ── Dashboard ────────────────────────────────────────────
      'dashboard.title': 'האירועים שלי',
      'dashboard.desc': 'כל האירועים שיצרת או הצטרפת אליהם, מסודרים ונגישים.',
      'dashboard.empty': 'עדיין לא יצרתם או הצטרפתם לאירועים.',
      'dashboard.backHome': 'חזרה למסך הבית',
      'dashboard.roleAdmin': 'מארגן',
      'dashboard.roleParticipant': 'משתתף',
      'dashboard.participants': '{n} משתתפים',
      'dashboard.view': 'פתיחת האירוע',
      'dashboard.leave': 'עזיבה',
      'dashboard.leaveConfirm': 'לחצו שוב לאישור',
      'dashboard.rangeFromTo': 'מ-{from} עד-{to}',
      'dashboard.rangeFrom': 'מ-{from}',
      'dashboard.rangeTo': 'עד-{to}',

      // ── New event form ───────────────────────────────────────
      'new.title': 'אירוע חדש',
      'new.desc': 'הגדירו את הפרטים הבסיסיים. תוכלו לעדכן תאריכים גם אחר כך.',
      'new.eventName': 'שם האירוע',
      'new.eventNamePh': 'לדוגמה: פגישת צוות רבעונית',
      'new.orgName': 'שם המארגן/ת',
      'new.orgNamePh': 'שם מלא',
      'new.orgEmail': 'אימייל המארגן/ת',
      'new.orgEmailPh': 'your@example.com',
      'new.emailAutoHint': 'מולא אוטומטית מחשבון Google — ניתן לשנות',
      'new.dateFrom': 'תאריך התחלה',
      'new.dateTo': 'תאריך סיום',
      'new.createBtn': 'יצירת אירוע',
      'label.optional': '(אופציונלי)',

      // ── Code result area ─────────────────────────────────────
      'code.label': 'קוד האירוע',
      'code.sub': 'שתפו את הקוד עם המשתתפים',
      'code.copy': 'העתקה',
      'code.copied': '✓ הועתק',
      'code.shareWhatsApp': 'WhatsApp',
      'code.shareTelegram': 'Telegram',
      'code.shareCopyLink': 'העתקת קישור',
      'code.sendEmail': 'שליחה למייל שלי',
      'code.sendingEmail': 'שולח…',
      'code.openMailto': 'פתיחת מייל ידני',
      'code.enterCal': 'המשך ללוח הזמינות',
      'code.emailStatusSent': 'נשלח בהצלחה',
      'code.emailStatusError': 'שגיאה בשליחה. נסו ידנית.',
      'share.inviteTemplate': 'היי! אני מזמין/ה אותך לאירוע {event} ב-Quick Event Coordinator.\n\nקוד גישה: {code}\n\nלהצטרפות: {url}',
      'email.subject': 'הזמנה לתאם אירוע: {event}',
      'email.body': 'שלום,\n\n{organizer} מזמין/ת אותך לתאם זמינות לאירוע: {event}\n\nשם האירוע: {event}\nקוד גישה: {code}\n\nכדי להצטרף היכנס לאתר: {url}\nלחץ על "הצטרף לאירוע קיים" והזן את שם האירוע והקוד.\n\nבברכה,\n{organizer}',

      // ── Join event form ──────────────────────────────────────
      'join.title': 'הצטרפות לאירוע',
      'join.desc': 'הזינו את פרטי ההזמנה שקיבלתם.',
      'join.eventName': 'שם האירוע',
      'join.eventNamePh': 'כפי שהופיע בהזמנה',
      'join.code': 'קוד גישה',
      'join.codePh': '0000',
      'join.userName': 'השם שיוצג למשתתפים',
      'join.userNamePh': 'שם פרטי או שם מלא',
      'join.btn': 'הצטרפות',

      // ── Calendar screen ──────────────────────────────────────
      'cal.codeBadge': 'קוד',
      'cal.adminBadge': 'מארגן',
      'cal.dateRange': 'טווח תאריכים: {from} – {to}',
      'nav.prevMonth': 'חודש קודם',
      'nav.nextMonth': 'חודש הבא',
      'cal.addTitle': 'הוספת זמינות',
      'cal.editTitle': 'עריכת זמינות',
      'cal.selectDay': 'בחרו יום מהלוח',
      'cal.noteHint': 'הוסיפו הערה קצרה (לא חובה)',
      'cal.notePh': 'לדוגמה: פנוי/ה בבוקר, אחרי 17:00',
      'cal.addBtn': 'הוספת זמינות',
      'cal.updateBtn': 'עדכון זמינות',
      'cal.savingBtn': 'שומר…',
      'cal.cancelEditBtn': 'ביטול עריכה',
      'cal.syncCalendar': 'סנכרון אוטומטי ל-Google Calendar',
      'cal.availToday': 'זמינות ליום הנבחר',
      'cal.noAvail': 'עדיין אין זמינות לתאריך זה',
      'cal.backHome': 'חזרה למסך הבית',

      // ── Admin (organizer) panel ──────────────────────────────
      'admin.title': 'ניהול האירוע',
      'admin.desc': 'הגדרות שרק המארגן/ת יכול/ה לשנות.',
      'admin.dateRange': 'טווח תאריכים לאירוע',
      'admin.update': 'עדכון',
      'admin.delete': 'מחיקת האירוע',
      'admin.deleteConfirm': 'לחצו שוב לאישור מחיקה',

      // ── AI chatbot ───────────────────────────────────────────
      'ai.header': 'עוזר האירוע',
      'ai.welcome': 'שלום! אפשר לבקש ממני ליצור אירוע, להצטרף לקיים, להוסיף זמינות, או למצוא את היום שהכי מתאים לכולם. במה אוכל לעזור?',
      'ai.placeholder': 'שאלו אותי משהו…',
      'ai.typing': 'מקליד',
      'ai.sendLabel': 'שליחה',
      'ai.closeLabel': 'סגירה',

      // ── Toasts ───────────────────────────────────────────────
      'toast.eventCreated': 'האירוע נוצר בהצלחה',
      'toast.eventJoined': 'הצטרפת לאירוע בהצלחה',
      'toast.eventNotFound': 'שם אירוע או קוד גישה שגויים',
      'toast.eventDeleted': 'האירוע נמחק',
      'toast.datesUpdated': 'טווח התאריכים עודכן',
      'toast.availUpdated': 'הזמינות עודכנה',
      'toast.emailSent': 'פרטי האירוע נשלחו למייל',
      'toast.emailFallback': 'שגיאה בשליחת מייל או שירות לא זמין. פותח חלון מייל ידני.',
      'toast.emailError': 'שגיאה בשליחת מייל',
      'toast.createRequired': 'נא למלא שם אירוע ושם מארגן',
      'toast.dateOrder': 'תאריך ההתחלה חייב להיות לפני תאריך הסיום',
      'toast.joinRequired': 'נא למלא את כל השדות',
      'toast.emailRequired': 'נא להזין כתובת אימייל',
      'toast.confirmDelete': 'לחצו שוב תוך 5 שניות לאישור',
      'toast.confirmLeave': 'לחצו שוב תוך 5 שניות לאישור עזיבה',
      'toast.adminOnly': 'רק מארגן האירוע יכול לקבוע תאריכים',
      'toast.syncOn': 'סנכרון Google Calendar הופעל',
      'toast.syncOff': 'סנכרון יומן Google כובה',
      'toast.syncGuestWarn': 'התחבר עם Google כדי לסנכרן ליומן',
      'toast.syncGranted': 'סנכרון Google Calendar הופעל',
      'toast.syncDenied': 'ההרשאה לא ניתנה — סנכרון כובה',
      'toast.signInSuccess': 'התחברת בהצלחה',
      'toast.signInError': 'שגיאת התחברות עם Google: {msg}',
      'toast.signOutSuccess': 'התנתקת בהצלחה',
      'toast.signOutError': 'שגיאת התנתקות: {msg}',
      'toast.calendarGranted': 'הרשאות יומן Google הוענקו',
      'toast.calendarOpening': 'פותח את חלון ההרשאות של Google…',
      'toast.calendarFailed': 'לא ניתן היה לקבל הרשאות: {msg}',
      'toast.calendarSynced': 'הזמינות סונכרנה ל-Google Calendar',
      'toast.calendarNetworkError': 'שגיאת רשת בסנכרון ל-Google Calendar',
      'toast.calendarNoAuth': 'לא ניתן להתחבר ל-Google Calendar',
      'toast.calendarNoPerm': 'אין הרשאת גישה ל-Google Calendar. נסו להתנתק ולהתחבר מחדש.',
      'toast.calendarRetryFail': 'שגיאה בסנכרון. נסו להתנתק ולהתחבר מחדש.',
      'toast.calendarSyncError': 'שגיאה בסנכרון: {msg}',
      'toast.saveAvailError': 'שגיאה בשמירת הזמינות: {msg}',
      'toast.createError': 'שגיאה ביצירת אירוע: {msg}',
      'toast.joinError': 'שגיאה בהצטרפות לאירוע: {msg}',
      'toast.copyError': 'שגיאה בהעתקה',
      'toast.eventMissing': 'האירוע נמחק או אינו קיים',
      'toast.eventLoadError': 'שגיאה בטעינת נתוני אירוע: {msg}',
      'toast.datesUpdateError': 'שגיאה בעדכון טווח תאריכים: {msg}',
      'toast.deleteError': 'שגיאה במחיקת האירוע: {msg}',
      'toast.dashboardLoadError': 'שגיאה בטעינת לוח המחוונים: {msg}',
      'toast.leaveError': 'שגיאה בעזיבת אירוע: {msg}',
      'toast.profileUpdateError': 'שגיאה בעדכון פרופיל: {msg}',
      'toast.botError': 'שגיאה בתקשורת עם הבוט',
      'toast.serverError': 'שגיאה בחיבור לשרת',

      // ── AI command reply copy ───────────────────────────────
      'ai.reply.createMissing': 'חסרים פרטים ליצירת אירוע. נא לציין שם אירוע ושמך.',
      'ai.reply.joinMissing': 'חסרים פרטים להצטרפות. נא לציין שם אירוע, קוד גישה ושמך.',
      'ai.reply.availMissing': 'חסר תאריך להוספת זמינות.',
      'ai.reply.notInEvent': 'אתה לא בתוך אירוע. הצטרף לאירוע קודם.',
      'ai.reply.badDate': 'תאריך לא תקין. השתמש בפורמט YYYY-MM-DD.',
      'ai.reply.delMissing': 'חסר תאריך למחיקת זמינות.',
      'ai.reply.noAvailForDate': 'אין זמינות שלך ליום {date}.',
      'ai.reply.availDeleted': 'הזמינות שלך ליום {date} נמחקה.',
      'ai.reply.adminOnly': 'רק מארגן האירוע יכול לקבוע תאריכים.',
      'ai.reply.datesMissing': 'חסרים תאריכים.',
      'ai.reply.datesUpdated': 'תאריכי האירוע עודכנו.',
      'ai.reply.deleteOnly': 'רק מארגן האירוע יכול למחוק את האירוע.',
      'ai.reply.eventDeleted': 'האירוע נמחק בהצלחה.',
      'ai.reply.loggedOut': 'התנתקתי מהאירוע.',
      'ai.reply.noAvailEntered': 'עדיין אין זמינויות שהוזנו.',
      'ai.reply.bestDay': 'היום הכי מתאים: {date} עם {count} אנשים פנויים ({names}).',
      'ai.reply.unknown': 'פקודה לא מוכרת.',

      // ── Day / month names (fallback; Intl used when possible) ─
      'days.short': ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'],

      // ── Locale hint for Intl.DateTimeFormat ────────────────
      '_locale': 'he-IL',
      '_dir': 'rtl'
    },

    en: {
      // ── App header chrome ─────────────────────────────────────
      'chrome.signIn': 'Sign in',
      'chrome.grantCalendar': 'Grant calendar access',
      'chrome.signOut': 'Sign out',
      'chrome.themeToggle': 'Light / dark mode',
      'chrome.langToggle': 'Language',
      'chrome.langHe': 'HE',
      'chrome.langEn': 'EN',

      // ── Login gate ────────────────────────────────────────────
      'login.hero': 'Scheduling,<br/>without the noise.',
      'login.sub': 'Create an event, share a code, and see when everyone is free — all in one place. No spreadsheets, no back-and-forth.',
      'login.google': 'Sign in with Google',
      'login.divider': 'or',
      'login.guest': 'Continue without signing in',
      'login.finePrint': 'Signing in saves your events and enables Google Calendar sync. Guests can create and join events, but cannot sync to a calendar.',

      // ── Guest notice bar ──────────────────────────────────────
      'guest.notice': 'Guest mode — your events are not saved to an account.',
      'guest.cta': 'Sign in with Google',

      // ── Home screen ──────────────────────────────────────────
      'home.greetingDefault': "What are we scheduling today?",
      'home.greetingPersonal': "Hi {name}, what are we scheduling today?",
      'home.newTitle': 'New event',
      'home.newDesc': 'Set a date range, share a code, and see when everyone is free.',
      'home.joinTitle': 'Join an event',
      'home.joinDesc': "Enter the code you received and mark when you're available.",
      'home.dashTitle': 'My events',
      'home.dashDesc': 'Every event you created or joined — all in one place.',

      // ── Back buttons ─────────────────────────────────────────
      'back.home': 'Back to home',
      'back.plain': 'Back',

      // ── Dashboard ────────────────────────────────────────────
      'dashboard.title': 'My events',
      'dashboard.desc': 'Every event you created or joined, organized and accessible.',
      'dashboard.empty': "You haven't created or joined any events yet.",
      'dashboard.backHome': 'Back to home',
      'dashboard.roleAdmin': 'Organizer',
      'dashboard.roleParticipant': 'Participant',
      'dashboard.participants': '{n} participants',
      'dashboard.view': 'Open event',
      'dashboard.leave': 'Leave',
      'dashboard.leaveConfirm': 'Click again to confirm',
      'dashboard.rangeFromTo': '{from} – {to}',
      'dashboard.rangeFrom': 'From {from}',
      'dashboard.rangeTo': 'Until {to}',

      // ── New event form ───────────────────────────────────────
      'new.title': 'New event',
      'new.desc': 'Start with the basics. You can update dates later.',
      'new.eventName': 'Event name',
      'new.eventNamePh': 'e.g. Quarterly team meeting',
      'new.orgName': 'Organizer name',
      'new.orgNamePh': 'Full name',
      'new.orgEmail': 'Organizer email',
      'new.orgEmailPh': 'your@example.com',
      'new.emailAutoHint': 'Autofilled from your Google account — you can change it',
      'new.dateFrom': 'Start date',
      'new.dateTo': 'End date',
      'new.createBtn': 'Create event',
      'label.optional': '(optional)',

      // ── Code result area ─────────────────────────────────────
      'code.label': 'Event code',
      'code.sub': 'Share this code with your participants',
      'code.copy': 'Copy',
      'code.copied': '✓ Copied',
      'code.shareWhatsApp': 'WhatsApp',
      'code.shareTelegram': 'Telegram',
      'code.shareCopyLink': 'Copy link',
      'code.sendEmail': 'Send details to my email',
      'code.sendingEmail': 'Sending…',
      'code.openMailto': 'Open mail manually',
      'code.enterCal': 'Continue to availability',
      'code.emailStatusSent': 'Sent successfully',
      'code.emailStatusError': 'Send failed. Try manually.',
      'share.inviteTemplate': "Hi! You're invited to the event \"{event}\" on Quick Event Coordinator.\n\nAccess code: {code}\n\nJoin here: {url}",
      'email.subject': 'Event coordination invitation: {event}',
      'email.body': 'Hello,\n\n{organizer} is inviting you to coordinate availability for: {event}\n\nEvent name: {event}\nAccess code: {code}\n\nTo join, visit: {url}\nClick "Join an event" and enter the event name and code.\n\nBest,\n{organizer}',

      // ── Join event form ──────────────────────────────────────
      'join.title': 'Join an event',
      'join.desc': 'Enter the invitation details you received.',
      'join.eventName': 'Event name',
      'join.eventNamePh': 'As it appeared in the invitation',
      'join.code': 'Access code',
      'join.codePh': '0000',
      'join.userName': 'Display name',
      'join.userNamePh': 'First name or full name',
      'join.btn': 'Join',

      // ── Calendar screen ──────────────────────────────────────
      'cal.codeBadge': 'Code',
      'cal.adminBadge': 'Organizer',
      'cal.dateRange': 'Date range: {from} – {to}',
      'nav.prevMonth': 'Previous month',
      'nav.nextMonth': 'Next month',
      'cal.addTitle': 'Add availability',
      'cal.editTitle': 'Edit availability',
      'cal.selectDay': 'Pick a day from the calendar',
      'cal.noteHint': 'Add a short note (optional)',
      'cal.notePh': 'e.g. Free in the morning, after 5 PM',
      'cal.addBtn': 'Add availability',
      'cal.updateBtn': 'Update availability',
      'cal.savingBtn': 'Saving…',
      'cal.cancelEditBtn': 'Cancel edit',
      'cal.syncCalendar': 'Auto-sync with Google Calendar',
      'cal.availToday': 'Availability for the selected day',
      'cal.noAvail': 'No availability recorded for this date yet',
      'cal.backHome': 'Back to home',

      // ── Admin (organizer) panel ──────────────────────────────
      'admin.title': 'Event management',
      'admin.desc': 'Settings only the organizer can change.',
      'admin.dateRange': 'Event date range',
      'admin.update': 'Update',
      'admin.delete': 'Delete event',
      'admin.deleteConfirm': 'Click again to confirm deletion',

      // ── AI chatbot ───────────────────────────────────────────
      'ai.header': 'Event assistant',
      'ai.welcome': 'Hi! You can ask me to create an event, join an existing one, add availability, or find the best day for everyone. How can I help?',
      'ai.placeholder': 'Ask me anything…',
      'ai.typing': 'Typing',
      'ai.sendLabel': 'Send',
      'ai.closeLabel': 'Close',

      // ── Toasts ───────────────────────────────────────────────
      'toast.eventCreated': 'Event created successfully',
      'toast.eventJoined': "You've joined the event",
      'toast.eventNotFound': 'Event name or access code is incorrect',
      'toast.eventDeleted': 'Event deleted',
      'toast.datesUpdated': 'Date range updated',
      'toast.availUpdated': 'Availability updated',
      'toast.emailSent': 'Event details sent to your email',
      'toast.emailFallback': 'Email service unavailable. Opening a manual email window.',
      'toast.emailError': 'Failed to send email',
      'toast.createRequired': 'Please fill in the event name and organizer name',
      'toast.dateOrder': 'The start date must come before the end date',
      'toast.joinRequired': 'Please fill in all fields',
      'toast.emailRequired': 'Please enter an email address',
      'toast.confirmDelete': 'Click again within 5 seconds to confirm',
      'toast.confirmLeave': 'Click again within 5 seconds to confirm leaving',
      'toast.adminOnly': 'Only the event organizer can set dates',
      'toast.syncOn': 'Google Calendar sync enabled',
      'toast.syncOff': 'Google Calendar sync disabled',
      'toast.syncGuestWarn': 'Sign in with Google to sync to your calendar',
      'toast.syncGranted': 'Google Calendar sync enabled',
      'toast.syncDenied': 'Permission denied — sync disabled',
      'toast.signInSuccess': 'Signed in successfully',
      'toast.signInError': 'Google sign-in error: {msg}',
      'toast.signOutSuccess': 'Signed out',
      'toast.signOutError': 'Sign-out error: {msg}',
      'toast.calendarGranted': 'Google Calendar access granted',
      'toast.calendarOpening': 'Opening Google permissions window…',
      'toast.calendarFailed': "Couldn't get permissions: {msg}",
      'toast.calendarSynced': 'Availability synced to Google Calendar',
      'toast.calendarNetworkError': 'Network error while syncing to Google Calendar',
      'toast.calendarNoAuth': 'Cannot connect to Google Calendar',
      'toast.calendarNoPerm': 'No Google Calendar permission. Try signing out and back in.',
      'toast.calendarRetryFail': 'Sync failed. Try signing out and back in.',
      'toast.calendarSyncError': 'Sync error: {msg}',
      'toast.saveAvailError': 'Failed to save availability: {msg}',
      'toast.createError': 'Failed to create event: {msg}',
      'toast.joinError': 'Failed to join event: {msg}',
      'toast.copyError': 'Copy failed',
      'toast.eventMissing': 'Event deleted or does not exist',
      'toast.eventLoadError': 'Failed to load event: {msg}',
      'toast.datesUpdateError': 'Failed to update date range: {msg}',
      'toast.deleteError': 'Failed to delete event: {msg}',
      'toast.dashboardLoadError': 'Failed to load dashboard: {msg}',
      'toast.leaveError': 'Failed to leave event: {msg}',
      'toast.profileUpdateError': 'Failed to update profile: {msg}',
      'toast.botError': 'Assistant connection error',
      'toast.serverError': 'Server connection error',

      // ── AI command reply copy ───────────────────────────────
      'ai.reply.createMissing': 'Missing details to create an event. Please provide the event name and your name.',
      'ai.reply.joinMissing': 'Missing details to join. Please provide the event name, access code, and your name.',
      'ai.reply.availMissing': 'Missing date to add availability.',
      'ai.reply.notInEvent': "You're not in an event. Join one first.",
      'ai.reply.badDate': 'Invalid date. Use YYYY-MM-DD format.',
      'ai.reply.delMissing': 'Missing date to delete availability.',
      'ai.reply.noAvailForDate': 'You have no availability on {date}.',
      'ai.reply.availDeleted': 'Your availability on {date} has been deleted.',
      'ai.reply.adminOnly': 'Only the organizer can set event dates.',
      'ai.reply.datesMissing': 'Missing dates.',
      'ai.reply.datesUpdated': 'Event dates updated.',
      'ai.reply.deleteOnly': 'Only the organizer can delete the event.',
      'ai.reply.eventDeleted': 'Event deleted successfully.',
      'ai.reply.loggedOut': 'Left the event.',
      'ai.reply.noAvailEntered': 'No availability entered yet.',
      'ai.reply.bestDay': 'Best day: {date} with {count} available people ({names}).',
      'ai.reply.unknown': 'Unknown command.',

      // ── Day / month names ─────────────────────────────────
      'days.short': ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],

      // ── Locale hint for Intl.DateTimeFormat ────────────────
      '_locale': 'en-US',
      '_dir': 'ltr'
    }
  };

  var LANG_KEY = 'qec.lang';
  var SUPPORTED = ['he','en'];
  var DEFAULT_LANG = 'he';

  function detectInitialLang() {
    var stored = localStorage.getItem(LANG_KEY);
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    // First visit: pick based on browser locale
    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf('en') === 0) return 'en';
    return DEFAULT_LANG;
  }

  var currentLang = detectInitialLang();

  function t(key, params) {
    var dict = DICT[currentLang] || DICT[DEFAULT_LANG];
    var val = dict[key];
    if (val == null) {
      // Fallback to other language, then raw key
      var other = DICT[DEFAULT_LANG];
      val = (other && other[key] != null) ? other[key] : key;
    }
    if (params && typeof val === 'string') {
      val = val.replace(/\{(\w+)\}/g, function(_, p) {
        return params[p] != null ? params[p] : '{' + p + '}';
      });
    }
    return val;
  }

  // Apply translations to all marked elements in the DOM
  function applyTranslations(root) {
    root = root || document;
    // textContent (plain string; may contain <br/> — use innerHTML if <br/> found)
    root.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (typeof val === 'string' && val.indexOf('<br') !== -1) el.innerHTML = val;
      else el.textContent = val;
    });
    // Attribute bindings
    var attrs = ['placeholder','title','aria-label'];
    attrs.forEach(function(attr) {
      root.querySelectorAll('[data-i18n-' + attr + ']').forEach(function(el) {
        el.setAttribute(attr, t(el.getAttribute('data-i18n-' + attr)));
      });
    });
  }

  function setLanguage(lang, opts) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', DICT[lang]._dir);
    applyTranslations();
    // Let app code re-render anything that's dynamic
    window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
    updateLangToggleLabel();
    if (!opts || !opts.silent) { /* could toast here later if we want */ }
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'he' ? 'en' : 'he');
  }

  function getCurrentLang() { return currentLang; }
  function getLocale() { return DICT[currentLang]._locale; }
  function getDir() { return DICT[currentLang]._dir; }

  function updateLangToggleLabel() {
    var btn = document.getElementById('langToggle');
    if (!btn) return;
    // Show the code of the language the user will SWITCH TO, like theme-toggle does
    var label = btn.querySelector('.lang-label');
    if (label) label.textContent = currentLang === 'he' ? 'EN' : 'HE';
    btn.setAttribute('title', t('chrome.langToggle'));
    btn.setAttribute('aria-label', t('chrome.langToggle') + ' — ' + (currentLang === 'he' ? 'EN' : 'HE'));
  }

  // Apply direction + lang ASAP so the first paint is correct
  document.documentElement.setAttribute('lang', currentLang);
  document.documentElement.setAttribute('dir', DICT[currentLang]._dir);

  // Expose public API
  window.i18n = {
    t: t,
    setLanguage: setLanguage,
    toggleLanguage: toggleLanguage,
    getCurrentLang: getCurrentLang,
    getLocale: getLocale,
    getDir: getDir,
    applyTranslations: applyTranslations,
    updateLangToggleLabel: updateLangToggleLabel
  };
  window.t = t; // short alias for dynamic JS lookups

  // Apply on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      applyTranslations();
      updateLangToggleLabel();
    });
  } else {
    applyTranslations();
    updateLangToggleLabel();
  }
})();
