require('dotenv').config();

var debug = require('debug')('app');
var path = require('path');
var express = require('express');
var session = require('express-session');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require("socket.io");
const http = require("http");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var questionnairesRouter = require('./routes/questionnaires');
var adminRouter = require('./routes/admin');


const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {});

debug("EXPRESS_SESSION_SECRET:", process.env.EXPRESS_SESSION_SECRET);

app.use(session({
   secret: process.env.EXPRESS_SESSION_SECRET,
   resave: false,
   saveUninitialized: false,
   cookie: {
       secure: false, // set this to true on production
   }
}));

const corsOptions = {
  origin: ['localhost', 'https://login.microsoftonline.com'], // consentire solo queste origini
  optionsSuccessStatus: 200 // impostare il codice di stato di successo
};
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//app.use(helmet());


app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


/*
const trusted = ["'self'",];
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'", "'unsafe-inline'", "'unsafe-eval'"].concat(trusted),
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrcAttr: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", '*.microsoftonline.com']
    //useDefaults: helmet.contentSecurityPolicy.dangerouslyDisableDefaultSrc,
  },
  reportOnly: false,
  setAllHeaders: false,
  safari5: false,
}));
*/

/*-----------------------------------------------------------------*/
const hbs = require('hbs');
const helpers = require('./helpers');
hbs.registerHelper(helpers);

const db_port = process.env.DB_PORT || 3306 ;
const db_host = process.env.DB_HOST || '127.0.0.1' ;
const db_user = process.env.DB_USER || 'itrq';
const db_password = process.env.DB_PASSWORD || 'itrq';
const db_database = process.env.DB_DATABASE || 'itrq_db';


/* Sequelize sospeso
//----------------------------------------------------------------------------
const Sequelize = require('sequelize');
const sequelize = new Sequelize(db_database, db_user, db_password, {
  define: { freezeTableName: true },
  host: db_host, 
  dialect: 'mysql', 
  port: db_port,
  logging: console.log
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const Campagne = require(`${__dirname}/models/campagnes`)(sequelize)
const User = require(`${__dirname}/models/users`)(sequelize)
const Application = require(`${__dirname}/models/applications`)(sequelize)
const Questionnaire = require(`${__dirname}/models/questionnaire`)(sequelize)
const Questions = require(`${__dirname}/models/questions`)(sequelize)
const User_responses_reduced = require(`${__dirname}/models/user_responses_reduced`)(sequelize)
const User_responses = require(`${__dirname}/models/questions`)(sequelize)

sequelize.sync({ force: false });

Campagne.sync({force: false});
User.sync({force: false});
Application.sync({force: false});
Questionnaire.sync({force: false});
Questions.sync({force: false});
User_responses_reduced.sync({force: false});
User_responses.sync({force: false});

console.log("All models were synchronized successfully.");
//---------------------------------------------------------------
*/
var db = mysql.createConnection({
  port: db_port,
  host: db_host,
  user: db_user,
  password: db_password,
  database: db_database
});
db.connect();

// Creazione di un middleware per mantenere la connessione al database
app.use((req, res, next) => {
  req.db = db;
  next();
});
/*----------------------------------------------------------------------*/

const socketApi = require('./socketApi');
io.on('connection', (socket) => {
    socketApi(socket,db);
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
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

module.exports = { app, httpServer, io };
