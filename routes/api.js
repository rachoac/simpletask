var jive = require('jive-sdk');
var task = require('../lib/task');
var url = require('url');

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

var errorResponse = function( res, code, error ){
    res.status(code);
    res.set({'Content-Type': 'application/json'});
    var err = {'error':error};
    res.send( JSON.stringify(err) );
    jive.logger.debug(err);
};

exports.taskCreate = function(req, res){
    handleCreateEdit(req, res);
};

exports.taskEdit = function(req, res){
    handleCreateEdit(req,res);
};

exports.taskGet = function(req, res){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;

    var taskID = query['taskID'];

    task.persistence.find( "tasks", { 'taskID': taskID }).then( function( found ){
        if ( !found || found.length < 1 ) {
            errorResponse( res, 404, "Task not found");
            return;
        }

        var first = found[0];
        var task =  {
            'taskID' : first['taskID'],
            'taskDescription' : first['description']
        };

        res.status(200);
        res.set({'Content-Type': 'application/json'});
        res.send( JSON.stringify(task, null, 4) );
    });
};

exports.taskDelete = function(req, res){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;

    var taskID = query['taskID'];

    task.persistence.remove( "tasks", taskID ).then( function( found ){
        if ( found ) {
            res.status(204);
        } else {
            res.status(404);
        }
        res.set({'Content-Type': 'application/json'});
        res.end();
    });

};

exports.taskList = function(req, res){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);

    var query = url_parts.query;
    var filter = query['filter'];

    if ( filter ) {
        var terms = filter.split(/,/);
        var filterKeys = {};
        terms.forEach( function(term) {
            var termParts = term.split(/:/);
            filterKeys[termParts[0]] = termParts[1];
        });
        jive.logger.info("Search terms", filterKeys);
    }

    task.persistence.find( "tasks", filterKeys).then( function( found ){
        res.status(200);
        res.set({'Content-Type': 'application/json'});
        res.send( JSON.stringify(found, null, 4) );
    });
};

exports.api = function(req, res ){
    var app = req.app;

    var routes = [];

    var adder = function( verb ) {
        app.routes[verb].forEach( function(route) {
            if ( route.path.indexOf('/api/') === 0 ) {
                var routeInfo = verb.toUpperCase() + " " + route.path;
                routes.push( routeInfo);
            }
        } );
    };

    adder('get');
    adder('put');
    adder('post');
    adder('delete');

    res.status(200);
    res.set({'Content-Type': 'application/json'});
    res.send( JSON.stringify(routes, null, 4) );

};