// ייבוא מודל המונגוז
const mongoose = require('mongoose');

// יצירת תת-סכמה עבור הקורסים
var take_course = new mongoose.Schema({
  cid: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
});

// יצירת סכמת הסטודנדטים
var student_schema = new mongoose.Schema(
  {
    id: {
      type: String,
      maxLength: 9,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    toar: {
      type: String,
      required: true,
      enum: ['ba', 'ma', 'phd'],
    },
    courses: [take_course],
  },
  { collection: 'students' }
);

// יצירה וייבוא של מודל הסטודנדטים
var student_model = mongoose.model('', student_schema);
module.exports = student_model;