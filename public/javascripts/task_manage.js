$(document).ready( function() {

    var rowTemplate = $("li.j-task-row.template");
    var controlTemplate = $(".j-task-control.template");

    var handleEdit = function() {
        var taskID = $(this).attr("data-taskID");
        window.location = '/task/edit?taskID=' + taskID;
    };

    var handleDelete = function() {
        var taskID = $(this).attr("data-taskID");
    };

    ////////////////////////////////////////////
    $.getJSON('/api/task/list', function(data) {

        data.forEach( function(taskData ) {
            var taskRow = rowTemplate.clone();

            // setup task row
            taskRow.find(".j-task-description").html( taskData['description'] );
            taskRow.attr("data-taskID", taskData['taskID']);

            $("ul.j-task-list").append( taskRow );

            // setup task controls
            var editControl = controlTemplate.clone().show();
            editControl.find(".j-task-control-label").html("edit");
            taskRow.find(".j-task-controls").append(editControl);
            taskRow.click( handleDelete );

            var removeControl = controlTemplate.clone().show();
            removeControl.find(".j-task-control-label").html("remove");
            taskRow.find(".j-task-controls").append(removeControl);
            taskRow.click( handleEdit );

            taskRow.show();
        });

    });
});