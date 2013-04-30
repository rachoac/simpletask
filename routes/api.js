var jive = require('jive-sdk');
var task = require('../lib/task');

var handleCreateEdit = function(req,res) {
    var reqUrl = req.url;
    var body = req.body;

    var taskID = body['taskID'];
    var description = body['description'];

    if ( !taskID ) {
        taskID = jive.util.guid();
    }

    var data = {
        "taskID" : taskID,
        "description" : description
    };

    var respond = function(saved) {
        jive.logger.info("saved", saved);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end( JSON.stringify(data) );
    };

    task.persistence.save( "tasks", taskID, data ).then( respond );
};

exports.taskCreate = function(req, res){
    handleCreateEdit(req, res);
};

exports.taskEdit = function(req, res){
    handleCreateEdit(req,res);
};

exports.taskGet = function(req, res){
};

exports.taskDelete = function(req, res){
};

exports.taskList = function(req, res){
};