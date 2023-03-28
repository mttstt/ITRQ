var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var questionnairesRouter = require('./routes/questionnaires');
var adminRouter = require('./routes/admin.js');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // sono public anche le risorse in node_modules !

/*-----------------------------------------------------------------*/
var mysql = require('mysql2');
var dotenv = require('dotenv');

const db_port = process.env.DB_PORT || 3306 ;
const db_host = process.env.DB_HOST || '127.0.0.1' ;
const db_user = process.env.DB_USER || 'itrq';
const db_password = process.env.DB_PASSWORD || 'itrq';
const db_database = process.env.DB_DATABASE || 'itrq_db';
const year_campagn = '2022';

//--
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Un nuovo client si è connesso');

  socket.on('messaggio', (data) => {
    console.log('Messaggio ricevuto: ' + data);
    io.emit('messaggio', data);
  });

  socket.on('disconnect', () => {
    console.log('Il client si è disconnesso');
  });
});

//--


//---
const hbs = require('hbs');
const helpers = require('./helpers');
hbs.registerHelper(helpers);
//---


var connection = mysql.createConnection({
  port: db_port,
  host: db_host,
  user: db_user,
  password: db_password,
  database: db_database
});

connection.connect();

app.get('/socketio', function(req, res, next) {
  res.render('socketio');
});


// Creazione di un middleware per mantenere la connessione al database
app.use((req, res, next) => {
  req.db = connection;
  req.year_campagn = year_campagn;
  next();
});
/*----------------------------------------------------------------------*/


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/questionnaires', questionnairesRouter);
app.use('/admin', adminRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
