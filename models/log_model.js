// ייבוא מודל המונגוז
const mongoose = require('mongoose');

// ייבוא ספריה של תאריכים
const dayjs = require('dayjs');

// יצירת מופע המגדיר מחרוזת כתאריך עם פורמט מקומי
const now = dayjs().format('DD/MM/YYYY HH:mm:ss ZZ');

// יצירת סכמת הלוג
const log_schema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['POST', 'GET'],
    },
    when: {
      type: String,
      default: now,
    },
    path: {
      type: String,
    },
    runmode: {
      type: String,
      enum: ['HTML', 'JSON'],
    },
  },
  {
    collection: 'log',
  }
);

// יצירה וייבוא של מודל הלוג
module.exports = global.conn2.model('', log_schema);