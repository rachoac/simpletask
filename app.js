
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , task = require('./routes/task')
  , api = require('./routes/api')
  , consolidate = require('consolidate')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.engine('html', consolidate.mustache);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// UI
app.get('/', routes.index);
app.get('/task/create', task.create);
app.get('/task/edit', task.edit);
app.get('/task/manage', task.manage);

// API
app.get('/api/task', api.taskGet );
app.post('/api/task', api.taskCreate );
app.put('/api/task', api.taskEdit );
app.delete('/api/task', api.taskDelete );
app.delete('/api/task/list', api.taskList );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
