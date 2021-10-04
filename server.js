// ייבוא מודלים נדרשים
const mongoose = require('mongoose');
const express = require('express');

// הגדרת מופע ופורט למודל האקספרס
const app = express();
const port = 8080;

//  שימוש בתווכה החדשה הבנוייה באקספרס עבור ניתוח בקשות נכנסות
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// שימוש בתווכה באקספרס על מנת לשרת צלמית לאתר
app.use('/favicon.ico', express.static('public/favicon.ico'));

// משתנה גלובלי הבודק באיזה מצב היישום רץ
global.runmode = process.argv[2] ? 'JSON' : 'HTML';

// שימוש במודל הפאג עבור ייבוא תבניות ליישום
app.set('view engine', 'pug');

//  יצירת מופע של מודל המונגוז בשביל התחברות למסד של מסמכי הסטודנטים (וכן חיווי המצב בטרמינל)
global.conn1 = mongoose.createConnection('mongodb://localhost/academy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
global.conn1.on('open', () => {
  console.log('\x1b[32mConnected to MongoDB - academy');
});
global.conn1.on('error', () => {
  console.log('\x1b[31mError connecting to the server/db (academy)');
});

//  יצירת מופע של מודל המונגוז בשביל התחברות למסד של מסמכי הלוג (וכן חיווי המצב בטרמינל)
global.conn2 = mongoose.createConnection('mongodb://localhost/academylog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
global.conn2.on('open', () => {
  console.log('\x1b[32mConnected to MongoDB - academylog');
});
global.conn2.on('error', () => {
  console.log('\x1b[31mError connecting to the server/db (academylog)');
});

// פונקציית ביניים אסינכרונית לשם ביצוע פעולת הלוג
const my_log = async (req, res, next) => {
  const LogModel = require('./models/log_model');
  let method = req.method;
  let path = req.path;
  let runmode = global.runmode;
  let newlog = new LogModel({ method, path, runmode });
  console.log(`\x1b[0mLogging data in progress: ${newlog}`);
  newlog.save();
  await my_log;
  next();
};
app.use('/student', my_log);

// יצירת נתב הסטודנט
const studentRoute = require('./routes/student_router');
app.use('/student', studentRoute);

// התחלת הקשבה בעזרת מודל האקספרס
app.listen(port, () => {
  console.log(
    `\x1b[36mServer started at http://localhost:${port}/student in ${global.runmode} Mode`
  );
});

// הפנייה לדף שלא קיים
app.use((req, res) => {
  res.status(404).render('404.pug');
});

// סגירת היישום
process.on('SIGINT', function () {
  console.log('\x1b[35mBye, bye! 👋\x1b[0m');
  process.exit();
});