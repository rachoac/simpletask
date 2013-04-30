var jive = require('jive-sdk');
var task = require('../lib/task');
var url = require('url');
var q = require('q');

var errorResponse = function( res, code, error ){
    res.status(code);
    res.set({'Content-Type': 'application/json'});
    var err = {'error':error};
    res.end( JSON.stringify(err) );
    jive.logger.debug("Sent", code, err);
};

var okResponse = function( res, code, data ) {
    jive.logger.debug("Sent",code, data);
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end( JSON.stringify(data, null, 4) );
};

var doDeleteByID  = function( req, res, collection, keyID ){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;

    var id = query[keyID];

    task.persistence.remove( collection, id ).then( function( found ){
        if ( found ) {
            res.status(204);
        } else {
            res.status(404);
        }
        res.set({'Content-Type': 'application/json'});
        res.end();
    });
};

var extractSearchTerms = function (query) {
    var filter = query['filter'];

    if (filter) {
        var terms = filter.split(/,/);
        var filterKeys = {};
        terms.forEach(function (term) {
            var termParts = term.split(/:/);
            filterKeys[termParts[0]] = termParts[1];
        });
        jive.logger.info("Search terms", filterKeys);
    }
    return filterKeys;
};

////////////////////////////
// task

exports.taskEdit = function(req, res){
    var body = req.body;

    var taskID = body['taskID'];
    var description = body['description'];
    var assignedUserID = body['assignedUserID'];
    var placeID = body['placeID'];

    if ( !taskID ) {
        taskID = jive.util.guid();
    }

    var data = {
        "taskID" : taskID,
        "description" : description,
        "assignedUserID" : assignedUserID,
        "placeID" : placeID
    };

    var respond = function(saved) {
        okResponse( res, 200, saved );
    };

    task.persistence.save( "tasks", taskID, data ).then( respond );
};

exports.taskCreate = function(req, res){
    exports.taskEdit( req, res );
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
            'taskDescription' : first['description'],
            'assignedUserID' : first['assignedUserID'],
            'placeID' : first['placeID']
        };

        okResponse( res, 200, task );
    });
};

exports.taskDelete = function(req, res){
    doDeleteByID(req, res, "tasks", "taskID" );
};

exports.taskList = function(req, res){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);

    var query = url_parts.query;
    var filterKeys = extractSearchTerms(query);
    task.persistence.find( "tasks", filterKeys).then( function( found ){
        okResponse( res, 200, found );
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

    routes = routes.sort();

    res.status(200);
    res.set({'Content-Type': 'application/json'});
    res.send( JSON.stringify(routes, null, 4) );

};

////////////////////////////
// user

exports.userGet = function(req, res ) {
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;

    var userID = query['userID'];

    task.persistence.find( "users", { 'userID': userID }).then( function( found ){
        if ( !found || found.length < 1 ) {
            errorResponse( res, 404, "User not found");
            return;
        }

        var first = found[0];
        var user =  {
            'userID' : first['userID'],
            'name' : first['name']
        };

        okResponse( res, 200, user );
    });
};

exports.userEdit = function(req, res ) {
    var body = req.body;

    var userID = body['userID'];
    var name = body['name'];

    if ( !userID ) {
        userID = jive.util.guid();
    }

    var data = {
        "userID" : userID,
        "name" : name
    };

    var respond = function(saved) {
        okResponse(res, 200, saved );
    };

    task.persistence.save( "users", userID, data ).then( respond );
};

exports.userCreate = function(req, res ) {
    exports.userEdit( req, res );
};

exports.userDelete = function(req, res ) {
    doDeleteByID( req, res, "users", "userID" );
};

exports.userList = function(req, res ) {
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);

    var query = url_parts.query;
    var filterKeys = extractSearchTerms(query);

    var placeID;
    if (filterKeys['placeID'] ) {
        placeID = filterKeys['placeID'];
        delete filterKeys['placeID'];
    }

    task.persistence.find( "users", filterKeys).then( function( found ){

        if ( placeID) {
            var toReturn = [];

            found.forEach( function(user) {
                task.persistence.find( "userMemberships", {'userID': user['userID'] }).then( function( memberships ){
                    for ( var i = 0; i < memberships.length; i++ ){
                        var membership = memberships[i];
                        if ( membership['placeID'] === placeID ) {
                            toReturn.push( user );
                            break;
                        }
                    }
                }).then( function() {
                    okResponse( res, 200, toReturn );
                });
            });
        } else {
            okResponse( res, 200, found );
        }

    });
};


////////////////////////////
// user membership

exports.userMembershipAdd = function(req, res ) {
    var body = req.body;

    var userID = body['userID'];
    var placeID = body['placeID'];

    var err = [];
    var all = [];

    all.push( task.persistence.find( "places", { 'placeID': placeID }).then( function (found) {
        if ( !found || found.length < 1 ) {
            err.push("Place not found");
        }
    }) );

    all.push( task.persistence.find( "users", { 'userID': userID }).then( function( found ) {
        if ( !found || found.length < 1 ) {
            err.push("User not found");
        }
    }));

    q.all( all).then( function( ){
        if ( err.length > 0 ) {
            errorResponse(res, 400, err );
        } else {
            var key = userID + placeID;

            var data = {
                "userID" : userID,
                "placeID" : placeID
            };

            var respond = function(saved) {
                okResponse(res, 200, saved );
            };

            task.persistence.save( "userMemberships", key, data ).then( respond );
        }
    });
};

exports.userMembershipDelete = function(req, res ) {
    var body = req.body;

    var userID = body['userID'];
    var placeID = body['placeID'];

    var key = userID + placeID;

    task.persistence.remove( "userMemberships", key ).then( function( found ){
        if ( found ) {
            res.status(204);
        } else {
            res.status(404);
        }
        res.set({'Content-Type': 'application/json'});
        res.end();
    });
};

exports.userMembershipList = function(req, res ) {
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);

    var query = url_parts.query;
    var filterKeys = extractSearchTerms(query);
    task.persistence.find( "userMemberships", filterKeys).then( function( found ){
        okResponse( res, 200, found );
    });
};

////////////////////////////
// place

exports.placeGet = function(req, res ) {
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;

    var placeID = query['placeID'];

    task.persistence.find( "places", { 'placeID': placeID }).then( function( found ){
        if ( !found || found.length < 1 ) {
            errorResponse( res, 404, "Place not found");
            return;
        }

        var first = found[0];
        var place =  {
            'placeID' : first['placeID'],
            'name' : first['name']
        };

        okResponse( res, 200, place );
    });
};

exports.placeEdit = function(req, res ) {
    var body = req.body;

    var placeID = body['placeID'];
    var name = body['name'];

    if ( !placeID ) {
        placeID = jive.util.guid();
    }

    var data = {
        "placeID" : placeID,
        "name" : name
    };

    var respond = function(saved) {
        okResponse(res, 200, saved );
    };

    task.persistence.save( "places", placeID, data ).then( respond );
};

exports.placeCreate = function(req, res ) {
    exports.placeEdit( req, res );
};

exports.placeDelete = function(req, res ) {
    doDeleteByID( req, res, "places", "placeID" );
};

exports.placeList = function(req, res ) {
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);

    var query = url_parts.query;
    var filterKeys = extractSearchTerms(query);
    task.persistence.find( "places", filterKeys).then( function( found ){
        okResponse( res, 200, found );
    });
};

