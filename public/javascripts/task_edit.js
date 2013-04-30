$(document).ready( function() {
    ////////////////////////////////////////////

    $("#txt_description").focus();

    var taskID = $("#j-taskID").attr("value");

    var handler = function(XMLHttpRequest, textStatus, errorThrown) {
        var response = JSON.parse( XMLHttpRequest['responseText'] );

        if ( XMLHttpRequest.status >= 200 && XMLHttpRequest.status <= 299 ) {
            // success - redirect to view
            window.location = '/task/view?taskID=' + response['taskID'];
        } else {
            // error
            console.log(response);
            alert('Error - ' + response );
        }

    };

    var handleSubmit = function() {
        var description = $("#txt_description").val();

        if ( !description ){
            alert("Description required.");
            return;
        }

        var data = {
            "description" : description,
            "taskID" : taskID
        };

        // create
        $.ajax({
            type: taskID ? "PUT" : "POST",
            url: "/api/task",
            data: data,
            success: handler,
            error:  handler,
            dataType: "application/json"
        });

    };

    $("#btn_submit").click( handleSubmit );

});