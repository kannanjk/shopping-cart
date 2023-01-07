const createError = require('http-errors');
const express = require('express');
const path = require('path');
const axios = require('axios')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
const hbs = require('express-handlebars');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin')
const db = require('./config/connection');
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')

dotenv.config()

const app = express();

// view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name : 'codeil',
  secret : 'something',   
  resave :false,
  saveUninitialized: true,
  cookie : {
          maxAge:(1000 * 60 * 100)
  }      
}));
app.use(fileUpload())

// mongdb connections
db.connect((err) => {
  if (err) {
    console.log("connection error" + err);
  }
  else {
    console.log("connection succsess");
  }
})
app.use('/', userRouter);
app.use('/admi', adminRouter)

app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);   
  res.render('error');
});

module.exports = app;


// git commit