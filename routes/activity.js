var jive = require("jive-sdk");
var url = require("url");
var task = require("../lib/task");
var error = require("./error");

exports.activityList = function(req, res){
    res.render('activity_list');
};