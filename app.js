var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session=require('express-session')
var cookieParser = require('cookie-parser');  
var logger = require('morgan');
var session=require('express-session')
var hbs = require('express-handlebars');
var userRouter = require('./routes/user');
var adminRouter=require('./routes/admin')
const { join } = require('path');
var db=require('./config/connection');
var fileUpload=require('express-fileupload')
const { error } = require('console');


var app = express();

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
app.use(session({secret:"key",cookie:{maxAge:600000}}))
app.use(fileUpload())

db.connect((err)=>{
  if(err){
  console.log("connection error"+err);}
  else{
  console.log("connection succsess");}
})
app.use('/',  userRouter);
app.use('/admin',adminRouter)

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
