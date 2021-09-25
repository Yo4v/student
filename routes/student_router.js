// ייבוא מודלים נדרשים
const express = require('express');
const studentRoute = express.Router();

// יצירת סטודנט
studentRoute.post('/add', function (req, res) {
  let StudentModel = require('..models/student_model');
  let student = new StudentModel(req.body);
  student.save(function (err, the_student) {
    if (!err) {
      console.log('Successfully stored student:');
      res.send('Student added successfuly');
    } else {
      res.send('Could not save student');
    }
  });
});

// קריאת סטודנדטים
studentRoute.get('/', function (req, res) {
  StudentModel.find(function (err, students) {
    if (!err) {
      console.log('Found: ', students.length);
      var s = '<table border=1>';
      students.forEach((usr) => {
        s += '<tr><td>' + usr.name + '</td><td>' + usr.company + '</td>';
        s +=
          '<td><form method="post" action="http://localhost:8080/student/delete/' +
          usr.id +
          '">';
        s += '<input type="submit" value="DEL"></form></td></tr>';
      });
      s += '</table>';
      res.send(s);
    } else {
      res.send('Could not retrieve students');
    }
  });
});

// עדכון סטודנט
studentRoute.post('/update/:id', function (req, res) {
  let id = req.params.id;
  res.send('Asked to update student id: ' + id);
});

// מחיקת סטודנט
studentRoute.post('/delete/:id', function (req, res) {
  let id = req.params.id;

  StudentModel.deleteOne({ _id: id }, function (err) {
    if (!err) {
      res.send('Student deleted');
    } else {
      res.send('Could not delete student');
    }
  });
});

module.exports = studentRoute;