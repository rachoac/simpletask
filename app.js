
/**
 * Module dependencies.
 */

var express = require('express')
  , config = require( process.env['TASK_CONFIG'] || './config.json')
  , routes = require('./routes')
  , taskUI = require('./routes/task')
  , errorUI = require('./routes/error')
  , activityUI = require('./routes/activity')
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
app.get('/activity', activityUI.activityList);
app.get('/error', errorUI.route);

// API
app.get('/api', api.api );

// task
app.get('/api/task', api.taskGet );
app.post('/api/task', api.taskCreate );
app.put('/api/task', api.taskEdit );
app.delete('/api/task', api.taskDelete );
app.get('/api/task/list', api.taskList );

// user
app.get('/api/user', api.userGet );
app.post('/api/user', api.userCreate );
app.put('/api/user', api.userEdit );
app.delete('/api/user', api.userDelete );
app.get('/api/user/list', api.userList );

// user place membership
app.post('/api/user/membership', api.userMembershipAdd );
app.put('/api/user/membership', api.userMembershipAdd );
app.delete('/api/user/membership', api.userMembershipDelete );
app.get('/api/user/membership/list', api.userMembershipList );

// place
app.get('/api/place', api.placeGet );
app.post('/api/place', api.placeCreate );
app.put('/api/place', api.placeEdit );
app.delete('/api/place', api.placeDelete );
app.get('/api/place/list', api.placeList );

// activity
app.get('/api/activity', api.activityGet );
app.post('/api/activity', api.activityCreate );
app.get('/api/activity/list', api.activityGetList );
app.get('/api/activity/comment', api.activityCommentGet );
app.post('/api/activity/:activityID/comment', api.activityCommentCreate );
app.get('/api/comment/list', api.commentList );

var server = http.createServer(app).listen(config['port'] || 3000, function(){
    console.log("Express server listening on port " + server.address().port);
});
