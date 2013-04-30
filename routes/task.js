var jive = require("jive-sdk");
var url = require("url");
var task = require("../lib/task");
var error = require("./error");

exports.taskView = function(req, res){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;
    var taskID =  query['taskID'];

    task.persistence.find( "tasks", { 'taskID': taskID }).then( function( found ){
        if ( !found || found.length < 1 ) {
            // redirect to error
            res.render( "error", {
                detail : "Could not find task ID" + taskID
            });
            return;
        }

        // use the first find, just in case more than 1 found
        var first = found[0];
        res.render('task_view', {
            'taskID' : first['taskID'],
            'taskDescription' : first['description']
        });
    });

//    res.render('task_view');
};

exports.taskCreate = function(req, res){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;

    res.render('task_edit', {
        'placeID' : query['placeID']
    });

    exports.taskEdit(req, res);
};

exports.taskEdit = function(req, res){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;

    var taskID =  query['taskID'];
    var placeID =  query['placeID'];

    task.persistence.find( "tasks", { 'taskID': taskID }).then( function( found ){
        if ( !found ) {
            return exports.taskCreate(req,res);
        }

        var first = found[0];
        res.render('task_edit', {
            'taskID' : first['taskID'],
            'taskDescription' : first['description'],
            'placeID' : first['placeID']
        });
    });

};

exports.taskManage = function(req, res) {
    res.render('task_manage');
};