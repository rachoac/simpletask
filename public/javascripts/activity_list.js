$(document).ready( function() {

    var activityTemplate = $(".j-activity-row.template");
    var commentTemplate = $(".j-comment-row.template");

    var clickHandler = function( activityID, target ){
        var content = prompt('Your comment:');
        if ( !content ) return;

        console.log(activityID);

        var comment = {
            "content" : content,
            "activityID" : activityID
        };

        var handler = function(XMLHttpRequest, textStatus, errorThrown) {
            var response = JSON.parse( XMLHttpRequest['responseText'] );

            if ( XMLHttpRequest.status >= 200 && XMLHttpRequest.status <= 299 ) {
                target.append("<li>" + content + "</li>");
            } else {
                // error
                console.log(response);
                alert('Error - ' + response );
            }
        };

        // create
        $.ajax({
            type: "POST",
            url: "/api/activity/" + activityID + '/comment',
            data: comment,
            success: handler,
            error:  handler,
            dataType: "application/json"
        });


    };

    // tasks
    $.getJSON('/api/activity/list', function(data) {
        data.forEach( function(activityData ) {
            var activityRow = activityTemplate.clone();

            // setup task row
            activityRow.find(".j-activity-content").html( activityData['content'] );

            var activityID = activityData['activityID'];

            console.log(activityID);

            var f = function() {
                var target = $(this).parent().find('.j-activity-comments');
                clickHandler(activityID, target )
            };

            activityRow.find('.btn_add_comment').click( f );

            $.getJSON('/api/comment/list?filter=activityID:' + activityID, function(data) {
                data.forEach( function(commentData ) {
                    activityRow.find('.j-activity-comments').append("<li>" + commentData['content'] + "</li>")
                });

                activityRow.show();
            });

//            activityRow.show();

            $(".j-activity-container").append( activityRow).append("<hr>");
        });
    });

});