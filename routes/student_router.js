// ייבוא מודלים נדרשים
const express = require('express');
const alert = require('alert');

// הגדרת ראוטר הסטודנט וכן ייבוא מודל הסטודנט
const studentRoute = express.Router();
const StudentModel = require('../models/student_model');

// יצירת סטודנט חדש במערכת
studentRoute.get('/add', (req, res) => {
  const [id, sug_toar] = [null, { ba: false, ma: false, phd: false }];
  res.render('add.pug', { id, sug_toar });
});
studentRoute.post('/add', (req, res) => {
  const [s_id, s_name, s_city, toar] = [
    req.body.id.trim(),
    req.body.name.trim(),
    req.body.city.trim(),
    req.body.toar,
  ];
  const [sug_toar, addstudent] = [
    { ba: false, ma: false, phd: false },
    new StudentModel(req.body),
  ];
  sug_toar[toar] = true;
  addstudent.save((err, newstudent) => {
    if (err) {
      res.json('FAIL');
      alert('הוספת הסטודנט למערכת נתקלה בשגיאה');
    }

// פעולה רצוייה בהתאם למצב הריצה של היישום
    if (global.runmode === 'JSON') {
      res.setHeader('Content-Type', 'application/json');
      res.json(JSON.stringify(newstudent));
      alert('JSON פרטי הסטודנט החדש בפורמט');
    } else {
      alert('הוספת הסטודנט למערכת בוצעה בהצלחה');
      res.render('add.pug', {
        id: s_id,
        name: s_name,
        city: s_city,
        sug_toar: sug_toar,
      });
    }
  });
});

// קריאת רשימת הסטודנטים הנמצאים במערכת
studentRoute.get('/', (req, res) => {
  const [sug_toar, avg] = [
    { ba: false, ma: false, phd: false },
    req.params.avg,
  ];
  StudentModel.find({}, (err, students) => {

// פעולה רצוייה בהתאם למצב הריצה של היישום
    if (!err) {
      if (global.runmode === 'JSON') {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.stringify(students));
        alert('JSON רשימת הסטודנטים הקיימים במסד בפורמט');
      } else {
        res.render('index.pug', {
          students: students,
          sug_toar: sug_toar,
          avg: avg,
        });
      }
    }
  });
});

// סינון רשימת הסטודנטים
studentRoute.post('/', (req, res) => {
  const sug_toar = { ba: false, ma: false, phd: false };
  const { city, toar, avg } = req.body;

// יצירת אובייקט סינון עם שימוש במבנה סינון אגרגטיבי
  let filter = { $expr: { $and: [] } };

// הכנסת שדה ה"עיר" למשתנה במידה והוא לא ריק
  if (city.trim() != '') {
    filter['$expr']['$and'].push({ $eq: ['$city', city] });
  }

// הכנסת שדה ה"התואר" למשתנה במידה והוא לא ריק
  if (toar && toar.trim() != 'all') {
    filter['$expr']['$and'].push({ $eq: ['$toar', toar] });
  }

// הכנסת שדה ה"ציון המינימלי" למשתנה במידה והוא לא ריק
  if (avg.trim() != '') {
    filter['$expr']['$and'].push({
      $gte: [{ $avg: '$courses.grade' }, parseInt(avg)],
    });
  }
  StudentModel.find(filter, (err, students) => {
    sug_toar[toar] = true;

// פעולה רצוייה בהתאם למצב הריצה של היישום
    if (!err) {
      if (global.runmode === 'JSON') {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.stringify(filter));
        alert('JSON הסטודנטים שמתאימים לסינון בפורמט');
      } else {
        res.render('index.pug', {
          students: students,
          sug_toar: sug_toar,
          city: city,
          avg: avg,
        });
      }
    }
  });
});

// עדכון פרטי סטודנט
studentRoute.get('/update/:id', (req, res) => {
  StudentModel.findOne({ id: req.params.id }, (err, students) => {
    const [s_id, s_name, s_city, s_toar, s_courses] = [
      students.id,
      students.name,
      students.city,
      students.toar,
      students.courses,
    ];
    if (!err) {
      res.render('update.pug', {
        id: s_id,
        name: s_name,
        city: s_city,
        toar: s_toar,
        courses: s_courses,
      });
    } else {
      alert('לא נמצאו סטודנטים במערכת');
    }
  });
});

// פעולה בהתאם לסוג הטופס
studentRoute.post('/update/:id', async (req, res) => {

// עדכון סטודנט
  if ('updatestudent' === req.body.action) {
    try {
      const student = await StudentModel.findOneAndUpdate(
        { id: req.params.id },
        {
          $set: {
            name: req.body.name.trim(),
            city: req.body.city.trim(),
            toar: req.body.toar,
          },
        },
        { new: true }
      );
      alert('עדכון הסטודנט במערכת בוצע בהצלחה');

// פעולה רצוייה בהתאם למצב הריצה של היישום
      if (global.runmode === 'JSON') {
        res.json(student);
        alert('JSON עדכון הסטודנט בפורמט');
      } else {
        res.render('update.pug', {
          id: student.id,
          name: student.name,
          city: student.city,
          toar: student.toar,
          courses: student.courses,
        });
      }
    } catch (err) {
      if (global.runmode === 'JSON') {
        res.json('FAIL');
        alert('JSON לא ניתן לעדכן סטודנט בפורמט');
      } else {
        res.render('update.pug', {
          id: student.id,
          name: student.name,
          city: student.city,
          toar: student.toar,
          courses: student.courses,
        });
      }
    }

// הוספת קורס
  } else if ('addcourse' === req.body.action) {
    try {
      const [cid, grade] = [req.body.cid.trim(), req.body.grade.trim()];
      const [addcourse, student] = [
        { cid, grade },
        await StudentModel.findOne({ id: req.params.id }),
      ];
      student.courses.push(addcourse);
      await student.save();
      alert('הוספת הקורס למערכת בוצעה בהצלחה');

// פעולה רצוייה בהתאם למצב הריצה של היישום
      if (global.runmode === 'JSON') {
        res.json(student);
        alert('JSON הקורס נוסף למערכת בפורמט');
      } else {
        res.render('update.pug', {
          id: student.id,
          name: student.name,
          city: student.city,
          toar: student.toar,
          courses: student.courses,
        });
      }
    } catch (err) {
      if (global.runmode === 'JSON') {
        res.json('FAIL');
        alert('JSON לא ניתן להוסיף קורס בפורמט');
      } else {
        res.render('update.pug', {
          id: student.id,
          name: student.name,
          city: student.city,
          toar: student.toar,
          courses: student.courses,
        });
      }
    }
  }
});

// מחיקת סטודנט
studentRoute.post('/delete/:id', (req, res) => {
  let ids = req.params.id;
  StudentModel.deleteOne({ id: ids }, (err) => {

// פעולה רצוייה בהתאם למצב הריצה של היישום
    if (!err) {
      if (global.runmode === 'JSON') {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.stringify('1'));
        alert('JSON הסטודנט נמחק מהמערכת בפורמט');
      } else {
        alert('הסטודנט נמחק מהמערכת בהצלחה');
        res.redirect('/student');
      }
    } else {
      if (global.runmode === 'JSON') {
        res.json(JSON.stringify('0'));
        alert('JSON שגיאה במחיקת הסטודנט בפורמט');
      } else {
        res.redirect('/student');
      }
    }
  });
});

//  יצירת התווכה ליישום וכן ייצוא נתב הסטודנטים
studentRoute.use('/student', studentRoute);
module.exports = studentRoute;