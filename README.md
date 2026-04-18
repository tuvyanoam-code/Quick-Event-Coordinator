# Quick Event Coordinator

> תיאום זמינות, בלי הרעש.

אפליקציית תיאום זמינות קבוצתי — יוצרים אירוע, משתפים קוד של 4 ספרות, וכל משתתף מסמן מתי הוא פנוי. המערכת מזהה את היום שהכי הרבה אנשים פנויים בו ומתחברת ל-Google Calendar לסנכרון אירועים.

- **אתר חי:** [tuvyanoam-code.github.io/Quick-Event-Coordinator](https://tuvyanoam-code.github.io/Quick-Event-Coordinator/)
- **APK לאנדרואיד:** [דף ה-Releases](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/releases/latest)
- **דו-לשוני:** עברית (RTL) + אנגלית (LTR) עם כפתור החלפה בפינה.

---

## תוכן עניינים

- [1. סקירה כללית](#1-סקירה-כללית)
- [2. איך משתמשים](#2-איך-משתמשים)
  - [2.1 האתר](#21-האתר)
  - [2.2 התקנה כ-PWA](#22-התקנה-כ-pwa)
  - [2.3 APK לאנדרואיד](#23-apk-לאנדרואיד)
- [3. ארכיטקטורה](#3-ארכיטקטורה)
  - [3.1 קבצים](#31-קבצים)
  - [3.2 מסכים](#32-מסכים)
  - [3.3 Design tokens](#33-design-tokens)
  - [3.4 מודל Firebase](#34-מודל-firebase)
  - [3.5 מערכת i18n](#35-מערכת-i18n)
- [4. היסטוריית פיתוח](#4-היסטוריית-פיתוח)
  - [4.1 פילוסופיה עיצובית](#41-פילוסופיה-עיצובית)
  - [4.2 שיפוץ ויזואלי (5 שלבים)](#42-שיפוץ-ויזואלי-5-שלבים)
  - [4.3 ריבוי שפות (i18n)](#43-ריבוי-שפות-i18n)
  - [4.4 הפצה (PWA + APK)](#44-הפצה-pwa--apk)
- [5. אינדקס commits](#5-אינדקס-commits)
- [6. פיתוח מקומי](#6-פיתוח-מקומי)

---

## 1. סקירה כללית

**מה האפליקציה עושה:**
משתמש יוצר אירוע → מקבל קוד של 4 ספרות → משתף עם חברים (WhatsApp / Telegram / מייל / העתקת קישור) → כל משתתף מזין את השם שלו ומסמן ימים פנויים → המערכת מציגה את הימים שהכי הרבה אנשים פנויים בהם. מארגנים יכולים להגדיר טווח תאריכים ולמחוק את האירוע. משתמשים מחוברים יכולים לסנכרן את הזמינות שלהם אוטומטית ל-Google Calendar.

**Tech stack:**
- **Frontend:** HTML/CSS/JS sטטי (ללא build step)
- **Auth:** Firebase Auth (Google Sign-In)
- **Database:** Firebase Realtime Database
- **Email:** EmailJS
- **AI:** Gemini (דרך Firebase Cloud Function proxy)
- **Calendar:** Google Calendar API
- **Fonts:** Heebo (300/400/500/600/700/800) דרך Google Fonts
- **Hosting:** GitHub Pages (main branch)
- **APK build:** GitHub Actions + Bubblewrap (TWA)

---

## 2. איך משתמשים

### 2.1 האתר

פותחים את [tuvyanoam-code.github.io/Quick-Event-Coordinator](https://tuvyanoam-code.github.io/Quick-Event-Coordinator/) בכל דפדפן מודרני (Chrome, Safari, Firefox, Edge). עובד בדסקטופ ובמובייל. אין צורך בהתקנה.

### 2.2 התקנה כ-PWA

האתר ניתן להתקנה כאפליקציה עצמאית במסך הבית (נפתח במסך מלא, בלי שורת כתובת):

- **Android (Chrome):** תפריט ⋮ → "התקן אפליקציה" / "Install app". לפעמים יופיע באנר אוטומטי.
- **iOS (Safari):** Share button → "Add to Home Screen". (חובה Safari, לא Chrome על iOS.)
- **Desktop (Chrome / Edge):** אייקון "התקן" בצד ימין של שורת הכתובת, או Menu → "Install Quick Event Coordinator".

### 2.3 APK לאנדרואיד

לטלפונים שלא נוח להתקין PWA (או למי שרוצה אפליקציה "אמיתית" עם אייקון APK), יש APK מוכן:

1. נכנסים ל-[דף ה-Releases](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/releases/latest) מהטלפון.
2. מורידים את הקובץ `quick-event-coordinator-*.apk`.
3. פותחים את הקובץ מה-Downloads. אם אנדרואיד שואל על "מקורות לא מוכרים" — מאשרים: Settings → Apps → Special access → Install unknown apps → בוחרים את הדפדפן/מנהל הקבצים ומאפשרים.
4. לוחצים Install.

האפליקציה תיראה כמו כל אפליקציה נטיבית — אייקון משלה, מסך מלא, לא קשורה לדפדפן.

**עדכון האפליקציה בעתיד:** ב-GitHub → Actions → "Build Android APK" → "Run workflow". APK חדש תוך ~2 דקות ב-Releases.

---

## 3. ארכיטקטורה

### 3.1 קבצים

```
/
├── index.html            ← כל המבנה (5 מסכים מוחלפים דרך .active)
├── styles.css            ← Base + Polish layers + Stage N overrides
├── i18n.js               ← מילון עברית/אנגלית + API (t, setLanguage)
├── app.js                ← State, createEvent, render, toasts, icons
├── auth.js               ← Firebase Auth, user menu
├── dashboard.js          ← האירועים שלי
├── calendar-sync.js      ← Google Calendar API
├── chatbot.js            ← Gemini AI chatbot
├── service-worker.js     ← PWA (network-only, אין cache)
├── manifest.json         ← PWA config
├── twa-manifest.json     ← config ל-Bubblewrap (בניית APK)
├── .github/workflows/
│   └── build-apk.yml     ← GitHub Actions שבונה APK
└── assets/
    ├── login-bg.jpg      ← רקע מסך הכניסה
    ├── icon-192.png      ← אייקון PWA
    └── icon-512.png      ← אייקון PWA
```

### 3.2 מסכים

| ID | תיאור |
|---|---|
| `screen-login` | שער כניסה (ברירת מחדל פעילה). Google sign-in או "המשך ללא התחברות". |
| `screen-home` | מסך הבית. ברכה מותאמת + 3 כרטיסים (אירוע חדש, הצטרפות, האירועים שלי). |
| `screen-new` | טופס יצירת אירוע + אזור שיתוף הקוד. |
| `screen-join` | טופס הצטרפות (שם, קוד 4 ספרות, שם תצוגה). |
| `screen-calendar` | לוח שנה, פאנל הוספת זמינות, רשימת זמינויות, פאנל מארגן. |
| `screen-dashboard` | רשימת כל האירועים של המשתמש. |

הפונקציה `showScreen(id)` מחליפה את `.active` class. בכל מעבר:
- מחביאה את AI window.
- מעדכנת visibility של `.app-header` (hidden style fragment ב-login).
- מפעילה `prefillCreateEventForm()` ב-`screen-new`.
- מפעילה `updateHomeGreeting()` ב-`screen-home`.

### 3.3 Design tokens

כל ה-CSS מבוסס CSS custom properties ב-`:root` ו-`[data-theme="dark"]`:

| Token | שימוש |
|---|---|
| `--accent` (`#0f4c2e` בהיר) | Primary buttons, event code, accent border on hover |
| `--accent-soft`, `--accent-softer` | Badge backgrounds, selected day fill |
| `--ink` / `--text` / `--text-2` / `--muted` / `--muted-2` | היררכיית טקסט (כהה → בהיר) |
| `--surface` / `--surface-2` / `--bg` | שכבות רקע (כרטיס → sub-card → דף) |
| `--border` / `--border-strong` | גבולות ב-2 רמות |
| `--shadow-xs/sm/md/lg` | עומק מדורג |
| `--font-sans` | `'Heebo', 'Assistant', system-ui, ...` |
| `--radius-sm` / `--radius` / `--radius-md` / `--radius-lg` | 8/12/14/20 px |
| `--ease` / `--ease-out` | cubic-bezier(0.4,0,0.2,1) ו-(0.16,1,0.3,1) |

### 3.4 מודל Firebase

```
/events/{eventKey}/
  name               שם האירוע
  organizer          { id, name, email }
  code               4-digit string
  dateFrom, dateTo   YYYY-MM-DD (טווח אופציונלי)
  createdAt          timestamp
  users/{userId}     { name, color }
  availability/{date}   array of { userId, note }

/users/{uid}/
  displayName, email, photoURL, lastLogin
  events/{eventKey}  { role: "admin" | "participant", eventName }
```

### 3.5 מערכת i18n

- **`window.i18n.t(key, params)`** — lookup בזמן ריצה עם `{placeholder}` substitution.
- **`window.t`** — alias קצר.
- **`setLanguage('he' | 'en')`** — מחליף שפה, מעדכן `dir`/`lang` על `<html>`, מפעיל `applyTranslations()`, מפיץ `i18n:changed` event.
- **`getLocale()`** — מחזיר `'he-IL'` או `'en-US'` ל-`toLocaleDateString`.
- **`data-i18n*` markers** על אלמנטים סטטיים ב-HTML:
  - `data-i18n="key"` → textContent
  - `data-i18n-placeholder="key"` → placeholder
  - `data-i18n-title="key"` → title
  - `data-i18n-aria-label="key"` → aria-label
- **Persistence** ב-`localStorage['qec.lang']`. זיהוי ראשוני לפי `navigator.language`.
- **Event listener** ב-app.js על `i18n:changed` — מרנדר מחדש greeting + calendar + dashboard.

---

## 4. היסטוריית פיתוח

### 4.1 פילוסופיה עיצובית

השיפוץ הוויזואלי נעשה בהשראת [brickato.com](https://brickato.com) ו-ampus.gov.il — החלפת המראה החובבני במראה מקצועי, מאופק ובהיר.

עקרונות מנחים:

- **פלטה של פחם-ראשון** — ניגוד של ~90% אפור/פחם עם שימוש מאופק בירוק-יער כהה כאקסנט (לא כרקע).
- **היררכיה ע"י מרחק, לא צבע** — רווחי נשימה נדיבים. שטחים ריקים הם חלק מהעיצוב.
- **ללא emoji ב-UI** — כל האייקונים הם SVG stroke 1.75 מתוך סט מוגדר. עקביות בין סביבות.
- **פונט Heebo** עברית/לטינית מודרני עם משקלים 300–800.
- **אנימציות עדינות** — עקומות `cubic-bezier(.16,1,.3,1)`, טיפים אורגניים.

### 4.2 שיפוץ ויזואלי (5 שלבים)

#### Stage 1 — יסודות [[`93a385d`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/93a385d)]

Design system: tokens חדשים (charcoal+green palette, shadow scale, radius scale, semantic tokens), פונט Heebo, הסרת כל ה-emoji מה-UI והחלפה בסט SVG (`window.ICONS`), logo עם gradient brand-mark, polish ל-form elements.

**החלטות עיצוב:**
- `--accent` עבר מ-`#2d6a4f` ל-`#0f4c2e` (עמוק יותר). רק `.btn` ו-`.code-val` מקבלים את הגוון המלא.
- Legacy alias `--accent2:#52b788` נשמר לתאימות אחורה עם כללים ישנים.
- `.icon-flip-rtl` class — chevrons מתהפכים אוטומטית ב-LTR.

#### Stage 2 — Login + Home [[`e7c734d`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/e7c734d)]

המסכים הראשונים שהמשתמש רואה. Hero tagline **"תיאום זמינות, בלי הרעש."** (34px/800) על מסך הכניסה, Google button בסטנדרט Material, guest link משני. ב-home: ברכה אישית (`updateHomeGreeting()` מציג "שלום, [שם]. מה נתאם היום?"), כרטיסים עברו ל-`<button>` עם chevron אנימטיבי, פילטר ב-class של placeholder names כדי לא להציג ברכה ל-"אורח" או "Guest".

**החלטות עיצוב:**
- הגיבור הוא אמירה (benefit-driven), לא כותרת ("ברוך הבא" גנרי).
- Google button לבן עם border אפור — קונבנציה מוכרת, משתמשים מזהים מיד.
- Chevron ב-home cards רק ב-hover, מחליק לכיוון הלחיצה ב-RTL/LTR.

#### Stage 3 — Create / Join / Dashboard [[`043ad44`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/043ad44)]

מבנה טופס אחיד (`.form-field` / `.form-row` / `.card-head`), copy מקצועי חדש בכל הטפסים (placeholders benefit-focused). OTP-style input לקוד הצטרפות (28px monospace, letter-spacing 14px). אזור תוצאה (code result) עם header, `.code-box` גדול (36px code, letter-spacing 8px), `.share-grid` של 3 כפתורים עם SVG לוגואים אמיתיים של WhatsApp/Telegram (border-first, לא רקע צבוע). Dashboard עם role-badge ו-hover state מודגש.

**החלטות עיצוב:**
- Share buttons עם border ו-icon צבעוני, לא background מלא — כדי לא להתחרות עם ה-primary CTA "המשך ללוח".
- Code font size 36px עם letter-spacing 8px — ה-code הוא הפריט הכי חשוב במסך.
- Empty state ב-dashboard מעודד חזרה ל-home (לא יצירה ישירה) — home הוא נקודת הפיצול הטבעית.

#### Stage 4 — Calendar + Admin + Availability [[`d3d369f`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/d3d369f)]

Event head עם code badge מפוצל (label "קוד" + mono value), user pill כ-avatar dot 22px, date-range-info כ-"info pill". Day cells עם today/selected ring, pcards עם section headers uppercase (Notion-style), `.av-item.mine` עם background accent-softer, iOS-style sync switch (custom toggle עם thumb שזז). Admin panel מחולק ל-sections (`border-top` בין טווח-תאריכים ל-"אזור מסוכן" של מחיקה), כפתור מחיקה עם `.confirming` class שמפעיל `pulse-danger` animation.

**החלטות עיצוב:**
- Code badge "split label": טיפוגרפיה שונה ל-label ול-value מתקשרת מה מה מיד.
- Selected day ring = border + box-shadow במקום שינוי דרסטי של רקע (refined, לא aggressive).
- Pulse animation על אישור מחיקה: הסאבטקסט הוויזואלי של "זה מצב זמני — אתה עומד לעשות משהו קריטי".

#### Stage 5 — Floating UI + Final QA [[`7af7695`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/7af7695)]

AI FAB עם gradient overlay, AI window גדול (380×560) עם border-radius-lg ו-shadow-lg, bot bubbles כ-cards (לא fill), user bubbles ב-accent עם shadow subtle, typing indicator כ-3 נקודות CSS animated. Send button מרובע עם paper-plane SVG. User menu hover מציג accent-softer + טקסט accent. Final QA: focus-visible גלובלי, `font-variant-numeric: tabular-nums` על ספרות, `color-scheme: light/dark` hint למערכת, mobile sweep מלא בכל מסך.

**החלטות עיצוב:**
- Bot bubble כ-card (border, לא fill צבוע) — brickato-inspired, פחות "chat צבעוני", יותר "מסמך".
- Typing dots ב-CSS בלבד (radial-gradient + animation) — לא JS loop, לא איטליקס.
- Send button מרובע 38×38: הוא action בפינה, לא FAB.

#### Post-stage refinements

- **Login layout** [[`534e766`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/534e766)] — חזרה למיושר-מרכז עם פס מפריד "או" בין Google ל-guest button. Guest button outlined בגודל זהה ל-Google button (לא קישור שקט). הקופי של stage 2 נשמר.
- **Hero background photo** [[`9737bd5`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/9737bd5)] — תמונת handshake+design (מ-Downloads של המשתמש) עם overlay 88% + blur 10px. גלויה רק במסך כניסה דרך `body:has(#screen-login.active)` selector.

### 4.3 ריבוי שפות (i18n)

#### i18n Stage 1 — תשתית + HTML סטטי [[`bcb8421`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/bcb8421)]

`i18n.js` חדש עם 2 dictionaries (~150 מפתחות כל אחד). API פשוט על `window.i18n`. ~80 אלמנטים תוייגו ב-`data-i18n*`. כפתור החלפת שפה ב-app-header (`.lang-toggle`, 38px, מציג את הקוד של השפה אליה עוברים). `.icon-flip-rtl` class להיפוך chevrons ב-LTR. Persistence ב-localStorage. `dir`/`lang` על `<html>` מתעדכנים מיד (לפני DOMContentLoaded) כדי ש-first paint יהיה תקין.

**החלטות עיצוב:**
- קובץ יחיד עם 2 שפות (לא קובץ-פר-שפה) — האפליקציה קטנה דיה, edit diff נקי יותר.
- Synchronous load (לפני app.js) — אין race conditions, `window.t()` תמיד זמין.
- Fallback chain: key → current lang → default (he) → raw key. חסר תרגום לא שובר את האפליקציה.

#### i18n Stage 2 — מחרוזות דינמיות + תאריכים + chatbot [[`e5d8c02`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/e5d8c02)]

כל `showToast(...)` וכל assignment דינמי של `textContent`/`innerHTML` ב-5 הקבצים (app.js, auth.js, dashboard.js, calendar-sync.js, chatbot.js) עבר ל-`tt()`/`t()`. Date formatting משתמש ב-`Intl.DateTimeFormat(window.i18n.getLocale())` — "Apr 19, 2026" באנגלית, "19 באפריל 2026" בעברית. שמות ימים מהמילון (`days.short`). `_inviteText()` helper חדש מאחד את התבנית של WhatsApp/Telegram/copy-link. `i18n:changed` event listener מרנדר מחדש את המסך הפעיל כשהשפה מתחלפת.

**החלטות עיצוב:**
- `tt()` ב-app.js / `T` local ב-שאר הקבצים — shorthand שעוטף `window.t` עם fallback ל-key.
- Gemini system prompt נשאר בעברית — זה טקסט פנימי ל-AI, לא למשתמש. ההוראה "respond in user's language" כבר שם.
- תוכן אירועים ב-Google Calendar נשאר באנגלית (`Availability: ...`) — הוא מוצג ב-UI של Google, לא אצלנו.

#### i18n Post-stage fixes

- **Language toggle on login gate** [[`b1a0729`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/b1a0729)] — היה regression: ה-app-header הוסתר במסך הכניסה ולכן לא-עברי לא יכל להחליף שפה. כעת ה-header נשאר גלוי עם class `app-header-gate` שמסתיר sign-in/user-menu אבל שומר על lang toggle + theme toggle.
- **Chevron direction in LTR** [[`51d3493`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/51d3493)] — ה-chevron בכרטיסי home לא התהפך באנגלית. תוקן עם CSS variables `--chev-flip` ו-`--chev-offset` שמשנים גם את כיוון ה-SVG (scaleX) וגם את כיוון האנימציה (translateX).

### 4.4 הפצה (PWA + APK)

#### PWA Stage 1 — Installable Progressive Web App [[`4de5ff8`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/4de5ff8)]

- `manifest.json` — שם, אייקונים (192/512 רגילים + maskable), theme_color, display standalone, orientation portrait.
- `service-worker.js` — network-only fetch handler (ללא caching). דרוש כדי ש-Chrome יציג "Install app". online-only מתאים לדרישה הנוכחית.
- אייקונים: center crop של `assets/login-bg.jpg` ע"י `sips` ל-1333×1333, ואז resize ל-512 ול-192.
- `<head>` עם `<link rel="manifest">`, `theme-color`, `apple-mobile-web-app-capable` (iOS fullscreen), `apple-touch-icon`.
- רישום SW ב-app.js בתוך `if ('serviceWorker' in navigator)` — דפדפנים ישנים מתעלמים.

**החלטות עיצוב:**
- Online-only SW — "לא עובד offline" נקי יותר מ"לפעמים". שדרוג עתידי פרוגרסיבי.
- אייקון photo-based (handshake) — סמלי וקשור לקונספט. החלפה לברנד-mark = 2 קבצי PNG בלבד.
- `scope: "./"` — מתאים ל-GitHub Pages על sub-path.

#### APK Build Workflow [[`8c82689`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/8c82689) → [`d6c942a`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/d6c942a)]

- `twa-manifest.json` — Bubblewrap config (packageId `io.github.tuvyanoamcode.quickeventcoordinator`, URL GitHub Pages, theme color).
- `.github/workflows/build-apk.yml` — workflow שבונה APK ב-Ubuntu runner:
  1. Sets up JDK 17 (Temurin), Node 20, Android SDK (`android-actions/setup-android@v3`).
  2. Installs Bubblewrap CLI.
  3. כותב `~/.bubblewrap/config.json` עם JDK + Android SDK paths של ה-runner.
  4. מריץ `bubblewrap init --manifest=URL` עם 40 newlines מופנים ל-stdin (accept כל prompt).
  5. מחליף את ה-`twa-manifest.json` האוטומטי בשלנו, מריץ `bubblewrap update`.
  6. Patch defensive: `sed` על `splashScreenFadeOutDuration: ,` (bubblewrap bug).
  7. Generate keystore, builds signed APK.
  8. APK נטען כ-artifact ו-Release.
- **הפעלה:** manual (`gh workflow run "Build Android APK"`) או push של tag `v*`.

**החלטות עיצוב:**
- GitHub Actions במקום local build — אין צורך להוריד ~700MB של JDK+SDK למפתח.
- Debug keystore מתחדש בכל run — מתאים ל-sideload. production signing יצטרך keystore קבוע ב-GitHub Secrets.

---

## 5. אינדקס commits

| קטגוריה | שלב | Commit |
|---|---|---|
| שיפוץ ויזואלי | 1. יסודות (tokens, Heebo, SVG icons) | [`93a385d`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/93a385d) |
| שיפוץ ויזואלי | 2. Login + Home | [`e7c734d`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/e7c734d) |
| שיפוץ ויזואלי | 3. Create / Join / Dashboard | [`043ad44`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/043ad44) |
| שיפוץ ויזואלי | 4. Calendar + Admin + Availability | [`d3d369f`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/d3d369f) |
| שיפוץ ויזואלי | 5. Floating UI + Final QA | [`7af7695`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/7af7695) |
| שיפוץ ויזואלי | Post: Login layout restore | [`534e766`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/534e766) |
| שיפוץ ויזואלי | Post: Hero background photo | [`9737bd5`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/9737bd5) |
| ריבוי שפות | i18n-1: תשתית + markup | [`bcb8421`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/bcb8421) |
| ריבוי שפות | i18n-2: JS דינמי + תאריכים | [`e5d8c02`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/e5d8c02) |
| ריבוי שפות | Fix: כפתור שפה ב-login | [`b1a0729`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/b1a0729) |
| ריבוי שפות | Fix: Chevron direction in LTR | [`51d3493`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/51d3493) |
| הפצה | PWA: Installable web app | [`4de5ff8`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/4de5ff8) |
| הפצה | APK: GitHub Actions workflow | [`d6c942a`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/d6c942a) |

---

## 6. פיתוח מקומי

```bash
# Serve locally (any static server works)
python3 -m http.server 8000
# או:
npx serve .
```

- **אין build step** — קבצים סטטיים בלבד. GitHub Pages מגיש את `main` branch ישירות.
- **Firebase config** inline ב-`app.js` (public — זה ה-pattern של Firebase לאתרים סטטיים, הגנה אמיתית נעשית בחוקי Security Rules של ה-database).
- **Live site:** `https://tuvyanoam-code.github.io/Quick-Event-Coordinator/`
