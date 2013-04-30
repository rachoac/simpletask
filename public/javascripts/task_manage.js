$(document).ready( function() {

    var rowTemplate = $("li.j-task-row.template");
    var controlTemplate = $(".j-task-control.template");

    var selectedPlace = function(val) {
        if ( val ) {
            // set it
            $("#fld_place option").val( val );
        }

        return $("#fld_place option:selected").attr("id");
    };

    var handleAdd = function() {
        var placeID = selectedPlace();
        window.location = '/task/create?placeID=' + placeID;
    };

    var handleView = function() {
        var taskID = $(this).closest("li.j-task-row").attr("data-taskID");
        window.location = '/task/view?taskID=' + taskID;
    };

    var handleEdit = function() {
        var taskID = $(this).closest("li.j-task-row").attr("data-taskID");
        window.location = '/task/edit?taskID=' + taskID;
    };

    var handleDelete = function() {
        var taskID = $(this).closest("li.j-task-row").attr("data-taskID");
        var handler = function() {
            window.location = '/task/manage';
        };
        $.ajax({
            type: "DELETE",
            url: "/api/task?taskID=" + taskID,
            success: handler,
            error:  handler,
            dataType: "application/json"
        });
    };

    var refreshTasks = function( placeID ) {
        // clear list
        $("#j-task-list li").remove();

        // tasks
        $.getJSON('/api/task/list?filter=placeID:' + placeID, function(data) {
            data.forEach( function(taskData ) {
                var taskRow = rowTemplate.clone();

                // setup task row
                taskRow.find(".j-task-description").html( taskData['description'] );
                taskRow.attr("data-taskID", taskData['taskID']);

                $("ul.j-task-list").append( taskRow );

                // setup task controls

                // view
                var viewControl = controlTemplate.clone().show();
                viewControl.find(".j-task-control-label").html("view");
                viewControl.click( handleView );
                taskRow.find(".j-task-controls").append(viewControl);

                // edit
                var editControl = controlTemplate.clone().show();
                editControl.find(".j-task-control-label").html("edit");
                editControl.click( handleEdit );
                taskRow.find(".j-task-controls").append(editControl);

                // delete
                var removeControl = controlTemplate.clone().show();
                removeControl.find(".j-task-control-label").html("remove");
                removeControl.click( handleDelete    );
                taskRow.find(".j-task-controls").append(removeControl);

                taskRow.show();
            });
        });
    };

    ////////////////////////////////////////////
    $("#btn_add_task").click( handleAdd );
    $("#fld_place").change( function() {
        refreshTasks( selectedPlace() );
    });

    // get places
    $.getJSON('/api/place/list', function(data) {
        var first = true;
        data.forEach( function( placeData ) {
            var placeOption = $("<option id='" + placeData['placeID'] + "'>" + placeData['name'] + "</option>");
            $("#fld_place").append( placeOption );

            if ( first ) {
                selectedPlace( placeData['placeID'] );
                first = false;
            }
        });

        refreshTasks( selectedPlace() );
    });

});