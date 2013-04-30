
/**
 * Module dependencies.
 */

var express = require('express')
  , config = require( process.env['TASK_CONFIG'] || './config.json')
  , routes = require('./routes')
  , taskUI = require('./routes/task')
  , errorUI = require('./routes/error')
  , api = require('./routes/api')
  , consolidate = require('consolidate')
  , http = require('http')
  , task = require('./lib/task')
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
app.get('/', taskUI.taskManage);
app.get('/task/view', taskUI.taskView);
app.get('/task/create', taskUI.taskCreate);
app.get('/task/edit', taskUI.taskEdit);
app.get('/task/manage', taskUI.taskManage);
app.get('/error', errorUI.route);

// API
app.get('/api/task', api.taskGet );
app.post('/api/task', api.taskCreate );
app.put('/api/task', api.taskEdit );
app.delete('/api/task', api.taskDelete );
app.get('/api/task/list', api.taskList );
app.get('/api', api.api );

var server = http.createServer(app).listen(config['port'] || 3000, function(){
    console.log("Express server listening on port " + server.address().port);
});
