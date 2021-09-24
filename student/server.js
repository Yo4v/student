                                                                        /* מטלת גמר קורס תכנות צד שרת – לניהול סטודנטים
                                                                                         מאת: יואב ליברמן */
// ייבוא מודלים נדרשים
mongoose = require('mongoose');
const express = require('express');
bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// הגדרת מופע למודל האקספרס וכן פורט
const app = express();
const port = 8080;
app.use(urlencodedParser);

// יצירת נתב הסטודנט
const studentRoute = require('./routes/student_router');
app.use('/student', studentRoute);

// יצירת מופע של מודל המונגוז בשביל להתחבר למסד הנתונים
const uri = 'mongodb://localhost/academy';
options = { useNewUrlParser: true };

mongoose.connect(uri, options);

mongoose.connection.on('error', function (err) {
  console.log('Error connecting to server/db');
});
mongoose.connection.on('open', function () {
  console.log('Connected to MongoDB');
});

// התחלת הקשבה בעזרת מודל האקספרס
app.listen(port, () => {
  console.log(`Server started on port at http://localhost:${port}`);
});