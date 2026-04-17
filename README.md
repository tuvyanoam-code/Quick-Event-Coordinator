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
| 2 | Login gate + Home screen | ✅ הושלם | [`e7c734d`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/e7c734d) |
| 3 | Create + Join flows + code/share | ✅ הושלם | [`043ad44`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/043ad44) |
| 4 | Calendar + Admin + Availability | ✅ הושלם | _see below_ |
| 5 | Floating UI + QA (dark + mobile) | ✅ הושלם | _see below_ |

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

## Stage 3 — Create / Join flows + code/share + dashboard ✅

**מה נעשה:**
- **מבנה טופס אחיד** (`.form-field` / `.form-row` / `.form-card` / `.card-head`) — כל שדה עטוף ב-wrapper בעל מרחק אנכי עקבי. שני שדות תאריך (מ-עד) ב-grid של שתי עמודות במסכי desktop, עמודה אחת במובייל.
- **Copy מקצועי חדש** בכל הטפסים:
  - כותרות הקארד (`card-head`): "צור אירוע חדש" → **"אירוע חדש"** + תת-כותרת benefit-focused.
  - placeholders: "מסיבת יום הולדת" → **"פגישת צוות רבעונית"**, "שמך" → **"שם מלא"**, "שמך" ב-join → **"שם פרטי או שם מלא"**, "שם האירוע" ב-join → **"כפי שהופיע בהזמנה"**.
  - Labels משתמשים ב-`.label-aux` לציון "(אופציונלי)" באפור בהיר.
  - כפתורי פעולה: "צור אירוע" → **"יצירת אירוע"**, "הצטרף לאירוע" → **"הצטרפות"**, "המשך ללוח השנה" → **"המשך ללוח הזמינות"**, "שלח פרטים למייל שלי" → **"שליחה למייל שלי"**.
- **Join code input** — input גדול במרכז בסגנון OTP: `letter-spacing:14px`, פונט monospace, 28px, placeholder "0000" במקום "4 ספרות".
- **איזור תוצאה (code result) שוכתב**:
  - `#codeResult` מופרד מהטופס ע"י `border-top` + `padding-top` (במקום להופיע שטוח).
  - `.code-result-head` — label "קוד האירוע" באותיות קטנות מודגשות + תת-תיאור "שתפו את הקוד עם המשתתפים".
  - `.code-box` — padding מורחב (20x22), code-val 36px letter-spacing 8px, copy-btn כ-pill עם icon.
  - `.share-grid` — 3 כפתורים שווים על grid במקום flex (צפוף יותר, סימטרי יותר). הוחלף את `.share-row`.
  - כפתורי share עם **אייקונים אמיתיים** של WhatsApp ו-Telegram (SVG path של הלוגואים). בורדר אפור במצב רגיל, בורדר צבע-מותג במצב hover. לא רקע מלא צבוע (פחות רועש).
  - `.code-actions` — כפתורי "שליחה למייל" (ghost), "פתיחת מייל ידני" (ghost), "המשך ללוח הזמינות" (primary).
- **Dashboard refreshed**:
  - `.event-item` עם בורדר 1.5px ו-hover שמוסיף `--accent` border.
  - `.event-item-head` — title + role badge (מארגן/משתתף) באותה שורה.
  - Copy: "צפה באירוע" → **"פתיחת האירוע"**, "עזוב אירוע" → **"עזיבה"**.
  - Empty state: `.dashboard-empty` עם padding וכפתור ghost "חזרה למסך הבית".
  - עזיבה לא מציגה toast (אייטם נעלם מהרשימה = פידבק מספק).
- **`_flashCopyButton` תוקן** — שומר ומשחזר `innerHTML` במקום `textContent`, כדי שכפתורים עם icon+label ישוחזרו נכון אחרי "✓ הועתק".

**קבצים ששונו:**
- `index.html` — `#screen-new`, `#screen-join`, `#screen-dashboard` שוכתבו. תוספת `.form-field`, `.form-row`, `.join-code-input`, `.code-result-head`, `.share-grid`, `.code-actions`. כפתורי share עם SVG logo paths.
- `styles.css` — בלוק Stage 3 בסוף. כל הכללים ל-form-card, form-field, form-row, label-aux, join-code-input, code-result-head, code-box refined, copy-btn with icon, share-grid + share-btn refined, code-actions, dashboard empty + event-item.
- `app.js` — `_flashCopyButton` עודכן ל-innerHTML. Validation copy נוקה. Toast copy (נוצר/הצטרפת) נוקה מסימני קריאה.
- `dashboard.js` — `.dashboard-empty` state חדש, `event-item` markup עודכן עם role-badge, copy מקצועי, leave-btn משתמש ב-class `.confirming` במקום inline style.

**החלטות עיצוב לתיעוד:**
- **Share buttons עם border+icon, לא רקע מלא צבוע.** brickato-style — סיבה: רקע ירוק של WhatsApp + כחול של Telegram שני פריטים בצבעים מרעישים ליד הכפתור הראשי. גישת border שקטה יותר ומאפשרת למשתמש לראות את ה-primary CTA (המשך ללוח) ללא הסחות.
- **Code box: font size עלה מ-28 ל-36, letter-spacing מ-6 ל-8.** הקוד הוא הפריט החשוב במסך — צריך להיות impossible to miss.
- **Join-code input כ-OTP** — בהשראת אפליקציות ש-4-digit code הוא UX חוזר. letter-spacing 14px מפריד בבירור בין הספרות. פונט monospace מבטיח יישור.
- **Dashboard empty state** — מעודד חזרה להום (ולא ליצור ישירות), כי ה-home screen הוא נקודת הפיצול הטבעית.

**מה **לא** נעשה בשלב 3 (נשאר לשלב 4–5):**
- Calendar screen (grid, days, side-panel, admin) — שלב 4.
- Toast visual overhaul מעמיק — כבר קיים מ-Stage 1 polish, אבל יש מקום לעבודה נוספת ב-Stage 5.
- AI chatbot (fab + window) — שלב 5.

---

## Stage 4 — Calendar + Admin + Availability ✅

**מה נעשה:**
- **Event head (כותרת האירוע) שוכתב** — `.cal-event-head` עם title למעלה בגודל 22px/800, מתחתיו `.cal-event-meta` שמכיל:
  - **Code badge מפוצל**: label "קוד" קטן באותיות גדולות עם spacing רחב, ואז הקוד עצמו בפונט monospace. יותר ברור איזה חלק הוא label ואיזה הוא הערך.
  - **Admin badge** נפרד ב-tone של "זהב" (על רקע `--admin-bg`) כדי להבדיל מ-code.
- **User pill עם avatar dot** — הנקודה גדלה ל-22px וקיבלה inset shadow שמדמה "ring" דק, נראה יותר כמו avatar קטן ולא רק dot טכני.
- **Date range info refined** — היה פס טקסט קטן ירוק, עכשיו רכיב 10px radius עם גבול subtle ב-accent-soft ו-padding נדיב. יותר נראה כמו "info pill".
- **Month navigation** — label בחודש ובשנה ב-17px/700 במרכז, כפתורי chevron ב-30px עגולים עדינים משני הצדדים.
- **Day cells** — refined:
  - רקע `--surface`, בורדר 1.5px שמתעבה ב-hover.
  - Today: border accent + background accent-softer + `.dnum` ב-accent 800.
  - Selected: border accent + background accent-soft + **ring** של `box-shadow 3px rgba(accent, .12)`. ברור מאוד שהיום נבחר.
  - Disabled: opacity .55 ורקע אפור בהיר.
  - Dots: 7px, עגולים, עם shadow-ring כדי להיפרד ברקע הצבעוני.
- **Side panel שני pcards**:
  - **pcard headers** — h3 באותיות גדולות uppercase 13px עם tracking — יותר נראה כמו section label של Notion מאשר כותרת רגילה.
  - **`.sel-label`** — 15px/700 בצבע `--ink`. הוא הדבר הכי חשוב ב-pcard אחרי שנבחר יום.
  - **Hint** — 12px muted.
  - **Textarea** — בורדר 1.5px, focus state ירוק עם ring.
  - **Add-btn** — primary מלא, 14px עם shadow subtle.
  - **Cancel-btn** — ghost קטן מופיע רק בעריכה.
- **Availability list refined**:
  - `.av-item` עם padding 8x10, border-radius 10px, hover מציג רקע `--pill-bg`.
  - `.av-item.mine` מקבל רקע accent-softer + border דק accent-soft — ברור "זה שלי".
  - `.av-color` dot גדול ל-10px עם ring, shadow שמתאים לרקע של הפריט (mine vs לא).
  - `.av-actions` buttons גדלו ל-30x30 עם hover state ברור — edit רגיל, delete ב-danger.
  - Empty state: "עדיין אין זמינות לתאריך זה" באיטליק אפור.
- **Sync switch iOS-style** — החלפה של checkbox אפור ב-custom toggle:
  - `.sync-switch-track` 36x20 עם thumb 16x16 שזז משמאל לימין ב-transition 200ms.
  - רקע אפור כשכבוי → רקע accent ירוק כשפועל.
  - ה-input checkbox מוסתר (opacity:0 ברוחב מלא של הטרק) כך שהלחיצה עובדת טבעי.
  - עטוף ב-box עם bordered card משלו.
- **Admin panel refactored**:
  - כותרת "ניהול האירוע" (במקום "פאנל מנהל") + hint "הגדרות שרק המארגן/ת יכול/ה לשנות".
  - מחולק ל-`.admin-section`s עם `border-top` ביניהם — הפרדה ויזואלית ברורה בין "טווח תאריכים" לבין "אזור מסוכן" של מחיקה.
  - Date range section: label + date-row עם 2 inputs + כפתור "עדכון" באותה שורה (לא שורה נפרדת).
  - Danger section: כפתור מחיקה עם `.confirming` class שמפעיל `pulse-danger` animation של box-shadow — סימון ויזואלי ברור במצב המתנה לאישור כפול.
- **Copy refresh**:
  - "לא נבחר יום" → **"בחרו יום מהלוח"**
  - "אין זמינות ליום זה" → **"עדיין אין זמינות לתאריך זה"**
  - "הוסף זמינות" → **"הוספת זמינות"**; "עדכן זמינות" → **"עדכון זמינות"**
  - "שומר..." → **"שומר…"** (ellipsis אמיתי)
  - "פאנל מנהל" → **"ניהול האירוע"**
  - "מחק את האירוע" → **"מחיקת האירוע"**; "לחץ שוב לאישור" → **"לחצו שוב לאישור מחיקה"**
  - "סנכרן עם Google Calendar" → **"סנכרון אוטומטי ל-Google Calendar"**

**קבצים ששונו:**
- `index.html` — שכתוב מלא של `#screen-calendar`: `.cal-event-head` + `.cal-event-title` + `.cal-event-meta` + `.event-badge-code` עם `.badge-label`. הוחלפה `.calendar-sync-toggle` ב-`.sync-switch` עם structure של track + thumb. `#adminPanel` עבר לחלוקה ל-`.admin-panel-head` + `.admin-section`s עם labels ו-date-row שמכיל כפתור עדכון.
- `styles.css` — בלוק Stage 4 בסוף הקובץ: calendar event head, code-badge split, user-pill, date-range-info, month-nav, day cells (today/sel/disabled refined), pcard + sel-label, av-list + av-item (mine variant), sync-switch iOS-style, admin-panel sectioned.
- `app.js` — `renderSel` ו-`cancelEdit` ו-`addAvailability` עודכנו עם הקופי החדש. `deleteEvent` משתמש ב-`.confirming` class (+ pulse animation) במקום inline style. `createBtn` text בעת reset משתמש ב-"יצירת אירוע". Toast "טווח תאריכים עודכן" נוקה מ-"!".

**החלטות עיצוב לתיעוד:**
- **Code badge עם label נפרד** — brickato-inspired: לא "קוד: 1234" ברצף, אלא שני "תוויות" בתוך pill אחד, עם typography שונה (text vs mono). מתקשר מיידית מה label ומה value.
- **Selected day ring** — שני מקורות ויזואליים (border + box-shadow) במקום שינוי דרסטי של רקע. יותר refined, פחות aggressive.
- **Sync switch עם `<input>` מוסתר ב-opacity:0 על כל הטרק** — cross-browser compatible, keyboard accessible (Space מחליף), label עם `for` גורם לכל המבנה להיות clickable. לא משתמשים ב-`:has()` בלבד כי תמיכה לא אחידה בדפדפנים ישנים.
- **Pulse animation על מצב אישור מחיקה** — הסאבטקסט הוויזואלי של "זה זמני, אתה עומד לעשות משהו קריטי". זה אנימציה רכה, לא מרעישה, אבל מסוכנת.

**מה **לא** נעשה בשלב 4 (נשאר לשלב 5):**
- AI chatbot (fab + window) — שלב 5.
- Toast visual polish נוסף — שלב 5.
- Account dropdown (user-menu) — שלב 5.
- Theme toggle ו-loader — שלב 5.
- בדיקת dark theme פר מסך — שלב 5.
- Mobile responsive sweep — שלב 5.

---

## Stage 5 — Floating UI + Final QA ✅

**מה נעשה:**
- **AI FAB (כפתור העוזר)**:
  - Shadow מדורג (`0 10px 28px` + `0 2px 6px`) נותן תחושת floating אמיתית.
  - overlay גרדיאנט עדין בתוך ה-FAB (`::before` עם linear-gradient משמאל-למעלה) שמוסיף "brightness" ולא מצריך שינוי רקע.
  - Hover: `scale(1.08) translateY(-1px)` + הגברת shadow — בולט אבל לא צעקני.
  - אייקון ה-sparkle 22px מגיע מ-Stage 1.
- **AI window**:
  - גודל: 380x560 (גדול יותר), `border-radius: var(--radius-lg)` (20px), border 1px, `shadow-lg`, entrance של scale+translate.
  - Header ב-`--surface-2` (הבחנה מ-body), h2 700/14.5px/`--ink`, אייקון ב-`--accent`, כפתור close עם hover של `--pill-bg`.
  - Messages area: רקע `--bg` עם scroll-behavior:smooth.
- **Message bubbles**:
  - **Bot**: `--surface` + border `--border`, ללא פילו אפור מלא — יותר "card-ly" מאשר "chip". border-bottom-right-radius 4px לתחושה של conversational corner.
  - **User**: accent מלא + shadow subtle + לבן. border-bottom-left-radius 4px (ה-corner מצביע חזרה אל ה-fab משמאל).
  - `.ai-msg.typing` — לא איטליקס, אלא 3 נקודות animated (CSS `radial-gradient` עם animation) — נקי וחי יותר מ-"..." סטטי.
- **Input row**:
  - רקע `--surface-2`, border-top.
  - Textarea: border 1.5px עם focus state ירוק.
  - Send button: מרובע (38x38, radius 10) במקום עגול, עם אייקון paper-plane SVG (ב-RTL הוא מתהפך אופקית כדי להצביע לכיוון ה-input).
- **Toast**:
  - Padding נדיב יותר: 12px 18px 12px 14px.
  - Font-size 13.5px, line-height 1.4.
  - Side-stripe עבר ל-inset-inline-start:7px (במקום 6).
- **Theme toggle**: 38x38, רוטציה 15deg ב-hover + scale 1.05. אייקון `--text-2`.
- **Loader**: backdrop-filter blur 4px, spinner לבן 38x38 border 3px.
- **User menu** (הדרופדאון של החשבון):
  - border-radius עלה ל-`--radius` (12px), shadow-lg.
  - פריטים: hover נותן `--accent-softer` background + טקסט `--accent` + אייקונים `--accent`. ברור איזה פריט הוצב עליו.
- **Chatbot copy refresh** — הודעת הפתיחה התקצרה: "שלום! אפשר לבקש ממני ליצור אירוע, להצטרף לקיים, להוסיף זמינות, או למצוא את היום שהכי מתאים לכולם. במה אוכל לעזור?" (במקום הודעה ארוכה עם מעט רלוונטיות). Placeholder ב-"שאלו אותי משהו…" (רבים + ellipsis אמיתי). "מקליד..." → "מקליד" (הנקודות animated מה-CSS).
- **Mobile sweep**:
  - Login hero 34→28, home greeting 28→24.
  - Day cells 76px→58px, padding מופחת, dots 7px→5.5px.
  - AI FAB ב-mobile 52→50, window בגודל מלא (left/right 10px).
  - Admin date-row flex-wrap, כפתור עדכון מלא-רוחב במובייל.
- **Accessibility + QA**:
  - `*:focus-visible` — outline accent 2px, offset 2px על כל הרכיבים האינטראקטיביים. נגישות מקלדת מלאה.
  - `::selection` — רקע `--accent-soft` וטקסט `--ink`.
  - `font-variant-numeric: tabular-nums` על קוד האירוע, join-code-input, והיום ב-grid — ספרות רוחב-קבוע.
  - `:root { color-scheme: light }` + `[data-theme="dark"] { color-scheme: dark }` — למערכת ההפעלה יש רמז ל-form controls (scrollbars, date pickers) להתאים.
  - `will-change: transform` על elements שעוברים transform חוזר (fab, home-card, btn) למנוע jitter.
- **Dark theme** — כל הטוקנים הוגדרו ב-`:root` ו-`[data-theme="dark"]` החל משלב 1. בדיקת cross-screen: login card, home cards, calendar grid, availability items (mine variant), admin panel — כולם משתמשים בטוקנים שמתאימים. Google sign-in button נשאר לבן גם ב-dark (brand convention). Share icons WhatsApp/Telegram נשארים בצבעים המותגיים בכל הנושאים.

**קבצים ששונו:**
- `index.html` — AI window פותחת עם הודעה מקוצרת, placeholder עודכן, send button עם SVG (paper-plane במקום ➤).
- `styles.css` — בלוק Stage 5 בסוף: AI FAB עם gradient overlay, AI window עם shadow-lg, bot bubble כ-card, user bubble ב-accent, typing dots animated, send button מרובע עם אייקון. Toast padding + stripe refined. Theme toggle rotation + hover. Loader backdrop-blur. User menu accent-softer hover. Mobile sweeps מותאמים לכל מסך. Final QA: focus-visible, selection, tabular-nums, color-scheme.
- `chatbot.js` — "מקליד..." → "מקליד" (הנקודות עכשיו CSS).

**החלטות עיצוב לתיעוד:**
- **Bot bubble כ-card (לא fill)** — brickato-inspired: הודעות AI מרגישות כ-"מסמכים" קטנים ולא כ-"הודעות chat צבעוניות". מקצועי יותר.
- **Send button מרובע** — עם paper-plane, מתאים יותר ל-corner של input row מאשר עיגול. הוא לא "FAB", הוא "action".
- **Typing dots עם CSS-only** — אין צורך ב-JS loop או איטליקס. CSS radial-gradient + animation נותן אפקט חי ונקי.
- **color-scheme hint** — חשוב ל-native form controls. Date picker של Chrome למשל מקבל dark/light theme אוטומטית על פי זה.

**מה **לא** בוצע במתכוון:**
- לא הוחלף מצב guest notice (ב-pill Stage 2), נשאר.
- לא נוגעים לקוד Firebase — אין סיבה.
- לא משנים placeholder של date inputs — הדפדפן מחליט על פי locale.

---

## Post-stage refinement — Login layout ✅

בעקבות משוב המשתמש אחרי שלב 5: הוחזר לעיצוב login מיושר-מרכז עם פס מפריד אלגנטי, אבל **עם הקופי החדש של שלב 2** (Hero tagline + sub על היעילות).

**מה השתנה:**
- `text-align:right` → **`text-align:center`** על `#screen-login.active`.
- הוסר `.login-actions` wrapper — הכפתורים עכשיו flow טבעי במרכז.
- Hero `login-hero` 34px → **30px**, עם `<br/>` ידני שמחלק "תיאום זמינות,\nבלי הרעש." לשתי שורות. קצב ויזואלי יותר נוח במרכז.
- `login-sub` הצטמצם ל-max-width 360px, margin אוטומטי ל-centering.
- Google sign-in button: `width:100%;max-width:300px;margin:0 auto`. גודל קבוע, לא stretched.
- **`.login-divider`** שוחזר — `display:flex` עם `::before`/`::after` כ-lines משני הצדדים של "או". max-width 300px כמו הכפתורים, צבע `--muted-2` לטקסט, `--border` לקוים.
- **Guest button OUTLINED** (לא קישור): `border:1.5px solid var(--border)`, width 300px בדיוק כמו Google button. Hover מעדן border + רקע `--surface-2` + lift עדין.
- Fine print: margin auto, max-width 380px, centered.

**שומר:**
- כל הקופי של שלב 2 (Hero + sub על היעילות והערך).
- Brand mark בראש (`.login-brand` + gradient square).
- Gradient top stripe על הקארד.
- fadeUp entrance animation.

**Commit:** נפרד, נקרא "post-stage: restore centered login layout with divider".

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
