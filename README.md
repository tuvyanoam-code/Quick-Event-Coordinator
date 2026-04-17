# Quick Event Coordinator

אפליקציית תיאום זמינות קבוצתי בעברית (RTL). Firebase Realtime Database, Firebase Auth (Google), EmailJS, ו-Google Calendar sync.

---

## Design overhaul roadmap

שיפוץ ויזואלי מקיף בהשראת [brickato.com](https://brickato.com) ו-ampus.gov.il — החלפת המראה החובבני במראה מקצועי, מאופק ובהיר. העבודה מחולקת ל-**5 שלבים** שמתועדים כאן. כל שלב נסגר ב-commit עצמאי עם סיכום, כך שאפשר להמשיך מכל נקודה גם בשיחה חדשה.

### הפילוסופיה העיצובית

- **פלטה של פחם-ראשון** — ניגוד של ~90% אפור/פחם עם שימוש מאופק בירוק-יער כהה כאקסנט (לא כרקע).
- **היררכיה ע"י מרחק, לא צבע** — רווחי נשימה נדיבים. שטחים ריקים הם חלק מהעיצוב.
- **ללא emoji ב-UI** — כל האייקונים הם SVG stroke 1.75 מתוך סט מוגדר. עקביות בין סביבות.
- **פונט Heebo** עברית/לטינית מודרני עם משקלים 300–800.
- **אנימציות עדינות** — עקומות `cubic-bezier(.16,1,.3,1)`, טיפים אורגניים.

### מפת השלבים

| שלב | תחום | סטטוס | Commit |
|---|---|---|---|
| 1 | יסודות — tokens, פונט, אייקונים | ✅ הושלם | [`93a385d`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/93a385d) |
| 2 | Login gate + Home screen | ✅ הושלם | _see below_ |
| 3 | Create + Join flows + code/share | ⏳ הבא | — |
| 4 | Calendar + Admin + Availability | ⏳ ממתין | — |
| 5 | Floating UI + QA (dark + mobile) | ⏳ ממתין | — |

---

## Stage 1 — Foundation ✅

**מה נעשה:**
- **Design tokens** חדשים ב-`:root` ו-`[data-theme="dark"]`: פלטה של charcoal+green, מערכת shadow ב-4 רמות, radius ב-4 רמות, טוקנים סמנטיים (danger/warning/success/info) + עקומות motion.
- **פונט Heebo** נוסף (300/400/500/600/700/800) דרך Google Fonts. ה-`body` עובר ל-`var(--font-sans)` והטקסט מקבל `-webkit-font-smoothing:antialiased` + tracking קל שלילי.
- **הסרת כל ה-emoji מה-UI**:
  - `🔑` התחבר / `👤` חשבון / `📅` הרשאות יומן / `🚪` ניתוק → SVG icons
  - `➕ 🤝 📊` בכרטיסי הבית → SVG icons (plus, users, grid)
  - `🤖` ב-AI fab + header → SVG sparkle
  - `☀️ 🌙` בכפתור theme → SVG sun/moon (מוצג האייקון של המצב שאליו **עוברים**)
  - `➡️` בכפתורי חזרה → chevron SVG (פונה ימין בעברית RTL)
  - `🗑️` מחיקת אירוע / `◀️ ▶️` ניווט חודשי / `✏️` עריכה / `📧` מייל → כולם SVG
- **סט אייקונים** מוגדר כ-`window.ICONS` ב-app.js, וב-HTML inline. כולם `viewBox="0 0 24 24"`, `stroke="currentColor"`, רוחב קו 1.75, ללא fill.
- **לוגו עם מרקר** — ריבוע gradient קטן לפני ה-wordmark (`h1.logo::before`). נותן רגע branding.
- **Polish ב-form elements** — focus rings ירוקים, border 1.5px, hover states מאופקים, focus state מחליף רקע + shadow ring.
- **Scrollbar נקי** — 10px, חום של `--border-strong`, מסתנכרן עם רקע הדף.

**קבצים ששונו:**
- `styles.css` — replaceחדשני של `:root` ו-`[data-theme="dark"]`, החלפת `font-family:'Assistant'` ב-`inherit` בכל הכללים, הוספת Stage 1 polish block בסוף.
- `index.html` — preconnect ל-Google Fonts, Heebo נטען, כל ה-emoji הוחלפו ב-SVG inline. עודכנו: app-header (sign-in + user-menu + theme-toggle), home cards, ai-fab + header, back buttons, month-nav, delete-event button, send-email button. הוסר `📅` מלוגו מסך הכניסה.
- `app.js` — אובייקט `ICONS` גלובלי עם SVG strings (sun/moon/user/caret/pencil/trash). `applyTheme()` מחליף `textContent` ב-`innerHTML` עם SVG. `renderSel()` מייצר כפתורי edit/delete עם SVG במקום emoji. `deleteEvent()` שומר ומשחזר `innerHTML` במקום `textContent`.
- `auth.js` — כשמשתמש מתחבר, `headerSignOutBtn.innerHTML` נבנה מ-`ICONS.user` + שם פרטי + `ICONS.caret`.

**החלטות עיצוב לתיעוד:**
- **Legacy token alias** — הוספנו `--accent2:#52b788` כי כללים ישנים מתייחסים אליו. אם נשנה פלטה בעתיד, צריך לעדכן גם את ה-alias.
- **`--accent` עמוק יותר** — עבר מ-`#2d6a4f` ל-`#0f4c2e` (כהה יותר, מקצועי יותר). רק `.btn` ו-`.code-val` נותנים עומק מלא של הצבע; שאר ה-UI בגוונים ניטרליים.
- **כפתורי חזרה ב-RTL** — chevron פונה ימין (`9 18 15 12 9 6`) כי בעברית "חזרה" = לכיוון הטקסט הקודם = ימינה ויזואלית.
- **Theme toggle פיזי** — `rotate(12deg)` ב-hover, rotation תמידי כדי לרמז על "מצב משתנה".

**מה **לא** נעשה בשלב 1 (נשאר לשלבים הבאים):**
- שינוי הקופי של הטקסטים (sub-title, כותרות כרטיסים, placeholder של input) — יחכה לשלב 2–3.
- שינוי מבני במסכים עצמם (layout, hero section) — שלב 2–4.
- Toast icons — עדיין chars טקסטואליים (`✓ ✕ ! i`). עדיף להשאיר קטנים בעיגולים.
- Chatbot styling — שלב 5.
- Admin panel polish מעמיק — שלב 4.

---

## Stage 2 — Login gate + Home screen ✅

**מה נעשה:**
- **Login gate שוכתב** — hero-grade treatment. מעל הכרטיס: פס gradient דק. בראש הכרטיס: brandmark קטן (ריבוע gradient + "Quick Event Coordinator" באפור). הגיבור: **"תיאום זמינות, בלי הרעש."** 34px/weight 800/letter-spacing -0.032em. Sub-headline ממוקד-תועלת. כפתור Google כ-primary (לבן, כלל סטנדרט של Google), "המשך ללא התחברות" כקישור שקט מתחת. פסקת fine-print עם separator.
- **Home screen שוכתב** — כותרת חדשה במקום subtitle:
  - מחובר: **"שלום, [שם פרטי]. מה נתאם היום?"**
  - אורח/לא מחובר: **"מה נתאם היום?"**
  - פונקציה `updateHomeGreeting()` נקראת מ-`showScreen('screen-home')` וגם מ-`onAuthStateChanged`.
- **Home cards ל-`<button>`** — נגישות טובה יותר (keyboard, screen reader), hover state עם chevron שמופיע ומתקדם לשמאל (`translateX(0)` מ-6px). בורדר מודגש ב-`--accent` בזמן hover במקום shadow בלבד. השארתי את ה-`.home-card` class כך שכללי stage 1 עדיין תקפים.
- **Guest notice refined** — מ-באנר מלא-רוחב ל-pill קומפקטית עם כפתור "התחברות עם Google" משני בתוכה.
- **Copy מקצועי חדש:**
  - "צור אירוע חדש" → **"אירוע חדש"** / "הגדירו טווח תאריכים, שתפו קוד, וראו מתי כולם פנויים."
  - "הצטרף לאירוע קיים" → **"הצטרפות לאירוע"** / "הזינו את הקוד שקיבלתם וסמנו מתי אתם זמינים."
  - "לוח המחוונים שלי" → **"האירועים שלי"** / "כל האירועים שיצרתם או הצטרפתם אליהם — במקום אחד."

**קבצים ששונו:**
- `index.html` — מבנה חדש ל-`#screen-login` (`.login-card` + `.login-brand` + `.login-hero` + `.login-sub` + `.login-actions` + `.login-fine-print`). מבנה חדש ל-`#screen-home` (`.home-header` + `#homeGreeting` + `.home-cards`). כרטיסי home עברו ל-`<button>` עם `.home-card-chev`.
- `styles.css` — בלוק שלב 2 בסוף הקובץ: login card premium עם gradient stripe ו-fadeUp, home-header + home-greeting typography, `button.home-card` reset וחידוד hover, `.home-card-chev` animation, `.guest-notice` ל-pill.
- `app.js` — `updateHomeGreeting()` חדש; קריאה שלו מ-`showScreen()` כשעוברים ל-home; חשיפה ל-`window`.
- `auth.js` — קריאה ל-`window.updateHomeGreeting()` בתוך `onAuthStateChanged` כדי שהברכה תתעדכן גם אם המשתמש כבר על home.

**החלטות עיצוב לתיעוד:**
- **הגיבור הוא אמירה, לא כותרת.** "תיאום זמינות, בלי הרעש" הוא benefit-driven (מזהה את ה-pain point של רעש התיאום). בניגוד ל-"ברוך הבא" הכללי. עוקב אחר brickato ("בונים חכם, לבנה אחר לבנה").
- **Google button סטנדרטי Material** — אף פעם לא כחול כבד, תמיד לבן עם border אפור בהיר. זה מה שמשתמשים מזהים ולוחצים עליו מיידית.
- **כפתור guest ככמעט-קישור** — כי ה-primary path היא התחברות עם Google. אורחים פסיביים, לא מקבלים דגש.
- **Home card chevron** — רק ב-hover, מחליק לשמאל (כיוון הלחיצה ב-RTL). סימון ויזואלי חזק של "זה לחיץ" בלי לצעוק.
- **home-header .logo רישום compact** — ב-home אנחנו לא עושים brand showcase (כמו ב-login). רק רמז קטן באפור, והדגש הוא על הגרייטינג. חיסכון במקום, יותר מקום לתוכן.

**מה **לא** נעשה בשלב 2 (נשאר לשלבים הבאים):**
- Screen-new / screen-join forms — שלב 3.
- Code box / share buttons refresh — שלב 3.
- Dashboard event items — שלב 3 או 4.
- Calendar screen — שלב 4.

---

## Architecture reference

### קבצים
- `index.html` — מבנה יחיד עם 5 `<div class="screen">` מוחלפים דרך `.active`
- `app.js` — state מרכזי, createEvent/joinEvent, render, toasts, icons
- `auth.js` — Firebase Auth, `makeProvider`, `signInWithGoogle`, user-menu helpers
- `dashboard.js` — `loadUserDashboard`, `viewEvent`, `leaveEvent`
- `calendar-sync.js` — Google Calendar API calls
- `chatbot.js` — Gemini proxy + AI command dispatch (createEvent/join/addAvail/etc.)
- `styles.css` — Base + Polish layer + Stage N overrides

### מזהים חשובים (IDs ו-classes)
- מסכים: `screen-login` (ברירת מחדל פעילה), `screen-home`, `screen-new`, `screen-join`, `screen-calendar`, `screen-dashboard`
- `.app-header` — כפתורי chrome עליונים
- `.user-menu` — תפריט חשבון נפתח
- `#toast-container` — פינה ימנית-תחתונה
- `#ai-fab` / `#ai-window` — צ'אט AI
- `#codeResult` / `.code-box` / `.code-val` — קוד האירוע אחרי יצירה

### טוקנים עיקריים
- `--accent` — ירוק יער עמוק (primary buttons, code)
- `--accent-soft` — רקע ירוק פסטל (badges, selected days)
- `--ink` / `--text` / `--text-2` / `--muted` / `--muted-2` — היררכיית טקסט
- `--surface` / `--surface-2` / `--bg` — שכבות רקע
- `--border` / `--border-strong` — גבולות בשתי רמות
- `--shadow-xs/sm/md/lg` — עומק מדורג

### מצב Firebase
- `/events/{key}/` — שם, organizer, code (4 ספרות), dateFrom/To, users, availability
- `/users/{uid}/events/{eventKey}` — role + eventName (משמש לדשבורד)

---

## Development

```bash
# Serve locally (any static server works)
python3 -m http.server 8000
# או:
npx serve .
```

אין build step — קבצים סטטיים בלבד. GitHub Pages מגיש את `main` branch ישירות.
