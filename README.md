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
| 4 | Calendar + Admin + Availability | ✅ הושלם | [`d3d369f`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/d3d369f) |
| 5 | Floating UI + QA (dark + mobile) | ✅ הושלם | [`7af7695`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/7af7695) |
| — | Post-stage: login layout restore | ✅ הושלם | [`534e766`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/534e766) |
| — | Post-stage: hero background photo | ✅ הושלם | [`9737bd5`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/9737bd5) |
| i18n-1 | תשתית תרגום + מילון + markup | ✅ הושלם | [`bcb8421`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/bcb8421) |
| i18n-2 | מחרוזות דינמיות ב-JS + תאריכים + QA | ✅ הושלם | [`e5d8c02`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/e5d8c02) |
| — | i18n fix: כפתור שפה גם במסך login | ✅ הושלם | [`b1a0729`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/b1a0729) |
| — | Chevron direction flip in LTR | ✅ הושלם | [`51d3493`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/51d3493) |
| pwa-1 | Installable PWA (Android + iOS) | ✅ הושלם | [`4de5ff8`](https://github.com/tuvyanoam-code/Quick-Event-Coordinator/commit/4de5ff8) |

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

## i18n Stage 1 — Translation infrastructure + static HTML ✅

**מה נעשה:**
- **`i18n.js` חדש** — קובץ מרכזי עם שני dictionaries מלאים (עברית + אנגלית), ~150 מפתחות לכל שפה. כולל כל הטקסטים הסטטיים וגם פורמטים של טקסטים דינמיים (toast messages, AI replies, email templates).
- **API קטן ופשוט** נחשף ל-`window.i18n`:
  - `t(key, params)` — lookup בזמן ריצה, עם `{placeholder}` substitution (למשל `t('home.greetingPersonal', {name: 'עמית'})`).
  - `setLanguage('he'|'en')` — מחליף שפה, מעדכן `dir`/`lang` על `<html>`, מפעיל `applyTranslations()`, ומפיץ event `i18n:changed`.
  - `toggleLanguage()` — קיצור לכפתור.
  - `getCurrentLang()`, `getLocale()`, `getDir()` — accessors.
  - `applyTranslations(root?)` — סורק את ה-DOM (או subtree) ומחיל translations.
- **`data-i18n` markers** הוספו לכל ה-HTML הסטטי:
  - `data-i18n="key"` → `textContent` (או `innerHTML` אם יש `<br/>` ב-value).
  - `data-i18n-placeholder="key"` → `placeholder` attribute.
  - `data-i18n-title="key"` → `title`.
  - `data-i18n-aria-label="key"` → `aria-label`.
- **כפתור החלפת שפה** חדש ב-`.app-header` — `.lang-toggle` בגודל 38px (זהה ל-theme-toggle), מציג את הקוד של השפה שאליה עוברים ("EN" בעברית, "HE" באנגלית) — אותה קונבנציה של theme-toggle.
- **היפוך חיצים אוטומטי** דרך class חדש `.icon-flip-rtl` + כלל CSS `html[dir="ltr"] .icon-flip-rtl { transform: scaleX(-1) }`. כל chevrons של "חזרה" + ניווט חודשי קיבלו את ה-class הזה. בעברית (RTL) הם כרגיל, באנגלית (LTR) מתהפכים. אותו עיקרון ל-`#ai-send` paper-plane.
- **זיהוי שפה ראשונית** — localStorage קודם (preference קודמת), אחר כך `navigator.language` (אם מתחיל ב-`en` → EN, אחרת → HE).
- **Persistence** ב-`localStorage['qec.lang']` — השפה שנבחרה נשמרת בין ביקורים.
- **`dir` ו-`lang`** על `<html>` מתעדכנים מיד עם טעינת הסקריפט (לפני DOMContentLoaded), כך שה-first paint תקין.
- **LTR layout refinements** — `.cal-event-title h2` מיושר שמאל ב-LTR, `button.home-card` text-align:left, letter-spacing קל על hero/subtitle ב-LTR.

**מה לא נעשה בשלב הזה (שלב i18n-2):**
- **מחרוזות דינמיות ב-JS** (toasts, `textContent = '...'` assignments, validation) — עדיין בעברית הארד-קודד. שלב i18n-2.
- **פורמט תאריכים** — עדיין `toLocaleDateString('he-IL')` קבוע. יעבור ל-`Intl.DateTimeFormat(i18n.getLocale())`.
- **שמות ימים בלוח** (`א׳ ב׳ ג׳`) — עדיין מ-array קבוע ב-app.js. יעבור לשימוש ב-`Intl.DateTimeFormat(..., {weekday:'short'})`.
- **AI system prompt** לבוט — עדיין עברית-only. שלב i18n-2.
- **Full QA pass** בשתי השפות — שלב i18n-2.

**קבצים ששונו:**
- `i18n.js` — קובץ חדש. ~380 שורות (רובן הן המילון עצמו).
- `index.html` — הוספת `<script src="i18n.js">` לפני `app.js`; כפתור `.lang-toggle` ב-app-header; `data-i18n*` attributes על ~80 אלמנטים; `icon-flip-rtl` class על כל ה-chevrons. הסרת inline `title="..."` (הוחלפו ב-`data-i18n-title`).
- `styles.css` — בלוק i18n Stage 1: `.lang-toggle` styles, `html[dir="ltr"] .icon-flip-rtl { transform: scaleX(-1) }`, LTR layout refinements.

**החלטות עיצוב לתיעוד:**
- **קובץ יחיד vs קובץ-פר-שפה** — בחרנו מילון יחיד כי זה פשוט יותר לערוך (edit diff אחד, לא שניים), וכי האפליקציה לא גדולה מספיק כדי שהגודל ישפיע על ביצועים.
- **Synchronous load** — `i18n.js` נטען לפני `app.js` בלי fetch/async. פירוש: כשהסקריפטים האחרים רצים, `window.t()` כבר קיים. אין race conditions.
- **Fallback chain** — key → current lang → default lang (he) → raw key. אם חסר תרגום, האפליקציה לא נשברת.
- **`data-i18n-attr` pattern** — attributes הם separate markers (לא אובייקט JSON) כי זה נקי יותר לקריאה ב-HTML ונוח ל-sed/grep. הסכמה: `data-i18n-{attr}="key"`.

---

## PWA Stage 1 — Installable Progressive Web App ✅

**מה נעשה:**
- **`manifest.json` חדש** בשורש הריפו: שם מלא + קצר, תיאור, icons (192+512 רגילים + maskable לאנדרואיד שמעגל אייקונים), `theme_color` ירוק עמוק, `background_color` קרם חם, display `standalone` (fullscreen בלי שורת כתובת), `orientation: portrait-primary`.
- **`service-worker.js`** מינימלי — רק עם fetch handler network-only (בלי caching). זה דרוש כדי ש-Chrome/Edge יציגו את כפתור "Install app"; מאחר שהמשתמש ביקש "online בלבד" לעת עתה, אין offline fallback. קל לשדרג בהמשך בלי לשנות manifest או registration.
- **אייקונים** — נוצרו מ-`assets/login-bg.jpg` על ידי `sips`: center crop ל-1333×1333, ואז resize ל-512 ול-192. התמונה מראה את לחיצת הידיים — איקונית ומתאימה קונספטואלית.
- **meta tags** ב-`<head>`: `<link rel="manifest">`, `theme-color`, `apple-mobile-web-app-capable` (iOS Safari fullscreen), `apple-mobile-web-app-status-bar-style: black-translucent`, `apple-touch-icon` (iOS לוקח את זה במקום manifest icons), ואייקוני favicon PNG ב-192/512.
- **רישום service worker** ב-app.js בתחילת הקובץ. עטוף ב-`if ('serviceWorker' in navigator)` — דפדפנים בלי תמיכה (Safari ישן מאוד) פשוט לא נרשמים, האתר עובד כרגיל.

**איך מקבלים את האפליקציה:**
- **Android (Chrome)**: פותחים את האתר → תפריט ⋮ → "Install app" (או popup אוטומטי אחרי ביקור שני). האייקון מופיע במסך הבית, ייפתח ב-fullscreen.
- **iOS (Safari)**: Share button → "Add to Home Screen". עובד גם ב-iOS אבל עם מגבלות נטיב (notifications רק מ-iOS 16.4).
- **Desktop (Chrome/Edge)**: אייקון "התקן" בשורת הכתובת, או Menu → "Install Quick Event Coordinator".

**קבצים שנוספו/שונו:**
- `manifest.json` (חדש)
- `service-worker.js` (חדש)
- `assets/icon-192.png`, `assets/icon-512.png` (חדשים)
- `index.html` — הוספת meta tags ו-link ל-manifest ב-`<head>`
- `app.js` — רישום service worker בתחילת הקובץ

**החלטות עיצוב לתיעוד:**
- **Online-only SW** — בלי cache כרגע. זה pragmatic: אם מישהו שואל "האם זה עובד offline?" התשובה "לא, עדיין" נקייה יותר מ"לפעמים, תלוי". שדרוג עתידי הוא פרוגרסיבי בלי שבירה.
- **אייקון photo-based** — השתמשנו בתמונה הקיימת של ה-handshake. אם נרצה אייקון "brand-mark" עם לוגו QEC על רקע gradient, זה commit נוסף עם שינוי של 2 קבצי PNG בלבד.
- **`scope: "./"`** — ה-PWA חל על כל הריפו. טוב ל-GitHub Pages שעל sub-path (`/Quick-Event-Coordinator/`).

---

## i18n Stage 2 — Dynamic JS strings, dates, chatbot ✅

**מה נעשה:**
- **app.js refactor** — כל `showToast('...')` עם string קבוע הוחלף ב-`showToast(tt('toast.key'))`. כל `textContent = '...'` / `innerHTML = '...'` שמכיל טקסט משתמש עבר ל-`tt(...)`. הטקסט של כפתור "הוספת זמינות" משתנה בין "הוספת" ל-"עדכון" בזמן עריכה (`tt('cal.addBtn')` / `tt('cal.updateBtn')`).
- **`getDayNames()`** — פונקציה חדשה שמחזירה את שמות הימים מה-dictionary (`he.days.short` או `en.days.short`). renderCal משתמש בה במקום ב-array קבוע.
- **תאריכים לפי locale** — `fmtLabel()`, dateRangeInfo, monthLabel, ו-dashboard event items משתמשים ב-`(window.i18n && window.i18n.getLocale()) || 'he-IL'` כארגומנט ל-`toLocaleDateString`. באנגלית מקבלים "Sun, Apr 19" במקום "ראשון, 19 באפריל".
- **`updateHomeGreeting()`** — משתמש עכשיו ב-`tt('home.greetingPersonal', {name})` / `tt('home.greetingDefault')`. רשימת שמות placeholder (`'אורח','User','Guest','משתמש'`) כדי לדלג על greeting אישי כשאלו לא שמות אמיתיים.
- **Share invite template** — `_inviteText()` helper חדש שמשתמש ב-`tt('share.inviteTemplate', {event, code, url})`. עכשיו WhatsApp/Telegram/copy-link חולקים טקסט אחד שמתורגם.
- **Email template** — `sendEventEmail` הפאלבק ה-mailto משתמש ב-`tt('email.subject', ...)` + `tt('email.body', ...)` עם כל הפרמטרים.
- **dashboard.js** — event item markup, role badges, CTAs, date range text, empty state, leave confirmation — כולם עברו ל-`T(...)`.
- **auth.js** — כל ה-toasts של login/logout/calendar-permissions עברו ל-t. `headerSignOutBtn` fallback משתמש ב-`T('chrome.signOut')`.
- **calendar-sync.js** נכתב מחדש ב-structure נקי יותר, כל ה-toasts ב-t(). האירועים ב-Google Calendar נשארים באנגלית (`Availability: ...`, `Note: ...`) כי הם נקראים ב-Calendar של המשתמש, לא ב-UI של האפליקציה.
- **chatbot.js** — הודעת "מקליד" עברה ל-t. כל ה-AI command fallback replies (`ai.reply.*`), כל ה-toasts (botError, serverError) עברו ל-t. הודעות השגיאה של החיבור ל-Gemini בשני המקרים (HTTP error, no response, network error) פשוטו יותר והשתמשו ב-`toast.serverError` במקום שלושה טקסטים שונים.
- **i18n:changed listener** — event listener חדש ב-app.js ש:
  - מרענן את greeting של home,
  - רנדר מחדש את calendar grid, availability list, event header אם על מסך הלוח,
  - טוען מחדש את dashboard אם על dashboard,
  - מעדכן innerHTML של logoutBtn (back button) כשמשתנה,
  - מעדכן innerHTML של sendEmailBtn אם נראה.
- **System prompt של Gemini נשאר עברית** — זה טקסט שמועבר ל-AI, לא למשתמש. ההוראה "ענה בשפה שבה המשתמש פונה אליך" כבר שם, אז ה-AI עונה בשפה הרלוונטית.
- **Calendar event content באנגלית** — גוף האירוע שנוצר ב-Google Calendar ("Availability: ...", "Note: ...") כתוב באנגלית כי הוא מוצג ב-UI של Google Calendar של המשתמש, לא ב-UI שלנו. זה תואם את הקונבנציה של Google Calendar.

**קבצים ששונו:**
- `app.js` — ~30 edits, כולל `tt()` helper, i18n:changed listener, `getDayNames()` פונקציה, `_inviteText()` helper, `PLACEHOLDER_NAMES` מערך.
- `auth.js` — ~5 edits: toasts של sign-in/out/calendar grant, fallback display name.
- `dashboard.js` — event item markup refactor, empty state, leave confirm, dashboard load error.
- `calendar-sync.js` — full rewrite with i18n-first toasts. Calendar event content stays English.
- `chatbot.js` — ~15 edits: typing text, AI command fallback replies, toast errors, server error fallbacks.

**החלטות עיצוב לתיעוד:**
- **`tt()` ב-app.js** — shorthand שעוטף `window.t` (אם קיים) או מחזיר את ה-key כ-fallback. מעולה ל-call sites רבים שהיו הופכים ל-"window.t && window.t(...) || ...". שאר הקבצים משתמשים ב-`T` local variable באותה גישה.
- **Re-render on language change** — בחרנו להאזין ל-`i18n:changed` ולרנדר מחדש רק מסכים פעילים. זה יעיל יותר מלרנדר הכל תמיד.
- **Calendar events באנגלית** — שיקול UX: האירועים ב-Google Calendar של המשתמש חייבים להיות consistent אם המשתמש ישנה שפה בעתיד. באנגלית תמיד ברור מה הם.
- **AI system prompt בעברית** — זהו טקסט "פנימי" שהמודל קורא; קל יותר לתחזק אותו כטקסט אחד עם הוראה "respond in user's language" מאשר לתרגם אותו לכל שפה.

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
