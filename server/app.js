
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose');
  
mongoose.connect('mongodb://localhost/youdao');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.post('/register', routes.register);
app.post('/login', routes.login);
app.post('/find', routes.find);
app.post('/create', routes.create);
app.post('/send', routes.send);
app.post('/list', routes.list);
app.post('/question', routes.question);
app.post('/answer', routes.answer);
app.post('/stat', routes.stat);
app.post('/score', routes.score);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
