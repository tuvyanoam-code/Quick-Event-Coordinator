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
| 1 | יסודות — tokens, פונט, אייקונים | ✅ הושלם | _see below_ |
| 2 | Login gate + Home screen | ⏳ הבא | — |
| 3 | Create + Join flows + code/share | ⏳ ממתין | — |
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
