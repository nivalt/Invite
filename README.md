# ההזמנה של קרין וניב

הזמנת חתונה מונפשת, סטטית ומותאמת למובייל. נבנתה עם React, TypeScript ו־Vite בלבד.

## הרצה מקומית

```powershell
npm install
npm run dev
```

בדיקת build:

```powershell
npm run build
npm run preview
```

## פריסה ל־GitHub Pages

ה־workflow שב־`.github/workflows/deploy.yml` בונה ומפרסם אוטומטית בכל push ל־`main`. לאחר העלאת המאגר ל־GitHub, יש לבחור **GitHub Actions** כמקור הפריסה תחת **Settings → Pages**.

`base: './'` ב־Vite מאפשר לפרוס גם באתר משתמש וגם תחת נתיב של מאגר, ללא שינוי ידני.
