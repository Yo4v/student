// ייבוא מודלים נדרשים
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const alert = require('alert');

/* ^
האם יש צורך לכתוב את זה גם פה וגם בקובץ הראשי? או שמספיק רק בקובץ אחד? 
אם כן אז פה או או בראשי? */

// הגדרת ראוטר הסטודנט וכן ייבוא מודל הסטודנט
const studentRoute = express.Router();
const StudentModel = require('../models/student_model');

// יצירת סטודנט חדש במערכת
studentRoute.get('/add', (req, res) => {
  console.log('Open add page');
  console.log(req.body);
  let id = null;
  let sug_toar = { ba: false, ma: false, phd: false };
  res.render('add.pug', { id: id, sug_toar: sug_toar });
});
studentRoute.post('/add', (req, res) => {
  let s_id = req.body.id.trim();
  let s_name = req.body.name.trim();
  let s_city = req.body.city.trim();
  let toar = req.body.toar;
  let sug_toar = { ba: false, ma: false, phd: false };
  sug_toar[toar] = true;
  let addstudent = new StudentModel(req.body);
  addstudent.save(function (err, newstudent) {
    let error = null;
    if (err) {
      error = err.message;
      console.log('Could not save student', err.message);
    }

// פעולה רצוייה בהתאם למצב הריצה של היישום
    if (global.runmode === 'JSON') {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(newstudent));
      alert('JSON פרטי הסטודנט החדש בפורמט');
    } else {
      alert('הוספת הסטודנט/ית למערכת בוצעה בהצלחה');
      console.log(`Student added successfully: ${newstudent}`);
      res.render('add.pug', {
        id: s_id,
        name: s_name,
        city: s_city,
        sug_toar: sug_toar,
        error,
      });
    }
  });
});

// קריאת רשימת הסטודנטים הנמצאים במערכת
studentRoute.get('/', (req, res) => {
  let sug_toar = { ba: false, ma: false, phd: false };
  let avg = req.params.avg;
  StudentModel.find({}, (err, students) => {

// פעולה רצוייה בהתאם למצב הריצה של היישום
    if (!err) {
      if (global.runmode === 'JSON') {
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.stringify(students));
        alert('JSON רשימת הסטדודנטים הקיימים במסד בפורמט');
      } else {
        res.render('index.pug', {
          students: students,
          sug_toar: sug_toar,
          avg: avg,
        });
      }
    } else {
      alert('Could not retrieve students');
    }
  });
});

// סינון רשימת הסטודנדטים
studentRoute.post('/', (req, res) => {
  console.log('Filter: ', req.body);
  let sug_toar = { ba: false, ma: false, phd: false };
  let { city, toar, avg } = req.body;

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
        console.log(`The students who meet the criteria set are: ${students}`);
        res.render('index.pug', {
          students: students,
          sug_toar: sug_toar,
          city: city,
          avg: avg,
        });
      }
    } else {
      res.send('No students found matching criteria set, please try again');
      alert('לא נמצאו סטודנטים התואמים את הגדרות הסינון');
    }
  });
});

// עדכון פרטי סטודנט
studentRoute.get('/update/:id', (req, res) => {
  StudentModel.findOne({ id: req.params.id }, (err, students) => {
    let studentID = students.id;
    let studentName = students.name;
    let studentCity = students.city;
    let studentToar = students.toar;
    let studentCourses = students.courses;
    if (!err) {
      res.render('update.pug', {
        id: studentID,
        name: studentName,
        city: studentCity,
        toar: studentToar,
        courses: studentCourses,
      });
    } else {
      alert('Could not retrieve students');
    }
  });
});

// עדכון סטודנט - כרגע ריק

// הוספת קורס
studentRoute.post('/update/:id', async (req, res) => {
  try {
    console.log('Adding new course...');
    let cid = req.body.cid.trim();
    let grade = req.body.grade.trim();
    let addcourse = { cid, grade };
    let student = await StudentModel.findOne({ id: req.params.id });
    student.courses.push(addcourse);
    await student.save();
    alert('הוספת הקורס למערכת בוצעה בהצלחה');
    console.log(`Course added successfully: ID - ${cid} ; Grade - ${grade}`);


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
    console.log('Adding course error!', err.message);
    if (global.runmode === 'JSON') {
      res.json('fail');
      alert('JSON לא ניתן להוסיף קורס בפורמט');
    } else {
      error = err.message;
      res.render('update.pug', {
        id: student.id,
        name: student.name,
        city: student.city,
        toar: student.toar,
        courses: student.courses,
      });
    }
  }
});

// מחיקת סטודנט
studentRoute.post('/delete/:id', (req, res) => {
  let ids = req.params.id;
  console.log('Asked to delete a student: ', req.params.id);
  StudentModel.deleteOne({ id: ids }, (err) => {

// פעולה רצוייה בהתאם למצב הריצה של היישום
    if (!err) {
      if (global.runmode === 'JSON') {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify('1'));
        alert('JSON הסטודנט נמחק מהמערכת בפורמט');
      } else {
        console.log(`Student ID ${req.params.id} deleted successfully`);
        alert('הסטודנט נמחק מהמערכת בהצלחה');
        res.redirect('/student');
      }
    } else {
      if (global.runmode === 'JSON') {
        res.send(JSON.stringify('0'));
        alert('JSON שגיאה במחיקת הסטודנט בפורמט');
      } else {
        res.redirect('/student');
      }
    }
  });
});

studentRoute.use('/student', studentRoute);
module.exports = studentRoute;