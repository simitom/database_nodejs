var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sqlite3 = require("sqlite3");
var pg =require('pg');
var knex = require('knex');
var exphbs  = require('express3-handlebars');



var routes = require('./routes/index');
var users = require('./routes/users');
var connection = require('./routes/connection');

var app = express();


var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        foo: function (obj, options) { 
            console.log(options);
            console.log("KEY: ", options.hash.key);
            
            return obj[options.hash.key]; 
        },
        ifvalue: function (conditional, options) {
            if (options.hash.value === conditional) {
            return options.fn(this)
          } else {
            return options.inverse(this);
          }
        }
    },
    defaultLayout: "main",
    extname : ".handlebars"
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/connection', connection);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
