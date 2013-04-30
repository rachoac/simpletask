var url = require("url");

exports.route = function(req, res){
    var reqUrl = req.url;
    var url_parts = url.parse(reqUrl, true);
    var query = url_parts.query;

    res.render('error', { detail: query['detail'] });
};