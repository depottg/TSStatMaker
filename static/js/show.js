let tasksPersistance = null;

function dateToString(date) {
    var ret = "";

    ret += date.getFullYear().toString();
    ret += "-";

    if ((date.getMonth() + 1).toString().length === 1)
        ret += 0;
    ret += (date.getMonth() + 1).toString();
    ret += "-";

    if (date.getDate().toString().length === 1)
        ret += 0;
    ret += date.getDate().toString();

    return ret;
}

function loadChart(tasks) {
    tasksPersistance = tasks;

    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawCurveTypes);
}

function groupTasksByDate(tasks) {
    const dates = [];

    let startDate = new Date(tasks[0].startDate);
    let endDate = new Date(tasks[0].startDate);

    // Finding the startDate and the endDate
    for (let i = 0; i < tasks.length; i++) {

        if (dateToString(startDate) > tasks[i].startDate)
            startDate = new Date(tasks[i].startDate);
        if (dateToString(endDate) < tasks[i].startDate)
            endDate = new Date(tasks[i].startDate);
    }

    // Building the histogram of empty dates
    let currentDate = new Date(tasks[0].startDate);
    while (dateToString(currentDate) <= dateToString(endDate)) {
        dates.push({
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            tasks: []
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Putting the tasks in the histogram
    for (let i = 0; i < tasks.length; i++) {
        const index = dates.findIndex(function(date) {return dateToString(date.date) === tasks[i].startDate});
        // Checks if the date of the task is in the dates list
        if (index >= 0) {
            dates[index].tasks.push(tasks[i]);
        }
    }

    return dates;
}

function applyGranularity(dates) {
    let ret = [];

    const granularity = document.getElementById("granularity-select").value;
    if (granularity === "Day") {
        // Do nothing
        ret = dates;
    }
    else if (granularity === "Week") {
        ret = dates;
    }
    else if (granularity === "Month") {
        for (let i = 0; i < dates.length; i++) {
            console.log();
            const index = ret.findIndex(function (row) {
                return row.date.getMonth() === dates[i].date.getMonth() &&
                    row.date.getFullYear() === dates[i].date.getFullYear();
            });
            if (index === -1) {
                ret.push({
                    date: new Date(dates[i].date.getFullYear(), dates[i].date.getMonth(), 1),
                    tasks: dates[i].tasks
                });
            }
            else {
                ret[index].tasks = ret[index].tasks.concat(dates[i].tasks);
            }
        }
    }
    else if (granularity === "Year") {
    }
    else {
        console.log("BUG");
        // Do nothing
        ret = dates;
    }

    console.log(ret);

    return ret;
}

function applyDateFilters(dates) {
    const ret = [];

    return dates;
}

// FIXME Make a real project filter
function applyProjectFilter(dates) {
    const ret = [];

    const projectFilterName = document.getElementById("project-filter-input").value;
    if (projectFilterName === "")
        return dates;

    for (let i = 0; i < dates.length; i++) {
        ret.push({
            date: dates[i].date,
            tasks: []
        });
        for (let j = 0; j < dates[i].tasks.length; j++) {
            let task = dates[i].tasks[j];
            if (task.project === projectFilterName)
                ret[i].tasks.push(task);
        }
    }

    return ret;
}

function applyTaskFilter(dates) {
    const ret = [];

    return dates;
}

// Converts a "X:XX:XX" duration to a number of hours
function durationToHours(duration) {
    const splitted = duration.split(":");
    return parseInt(splitted[0]) + (parseInt(splitted[1]) / 60);
}

function accumulateByDisplayMode(dates) {
    let displayMode = document.getElementById("display-mode-select").value;
    let ret = [];

    if (displayMode === "Project")
        ret = accumulateByProject(dates);
    else if (displayMode === "Task")
        ret = accumulateByTask(dates);
    else if (displayMode === "Tag")
        ret = accumulateByTag(dates);

    return ret;
}

function accumulateByProject(dates) {
    const ret = {columns: [], rows: []};

    // Listing the projects
    for (let i = 0; i < dates.length; i++) {
        for (let j = 0; j < dates[i].tasks.length; j++) {
            if (ret.columns.findIndex(function(column) {return column === dates[i].tasks[j].project}) === -1)
                ret.columns.push(dates[i].tasks[j].project);
        }
    }

    // Accumulating the times
    for (let i = 0; i < dates.length; i++) {
        const row = [dates[i].date];

        // Building the histogram
        for (let j = 0; j < ret.columns.length; j++)
            row.push(0);

        // Filling the histogram
        for (let j = 0; j < dates[i].tasks.length; j++) {
            const task = dates[i].tasks[j];
            const index = ret.columns.findIndex(function(column) {return column === task.project});

            if (index === -1 || index >= row.length - 1)
                continue;
            row[index + 1] += durationToHours(task.duration);
        }

        ret.rows.push(row);
    }

    return ret;
}

function taskToTaskId(task) {
    return task.project + " - " + task.name;
}

function accumulateByTask(dates) {
    const ret = {columns: [], rows: []};

    // Listing the projects
    for (let i = 0; i < dates.length; i++) {
        for (let j = 0; j < dates[i].tasks.length; j++) {
            if (ret.columns.findIndex(function(column) {return column === taskToTaskId(dates[i].tasks[j])}) === -1)
                ret.columns.push(taskToTaskId(dates[i].tasks[j]));
        }
    }

    // Accumulating the times
    for (let i = 0; i < dates.length; i++) {
        const row = [dates[i].date];

        // Building the histogram
        for (let j = 0; j < ret.columns.length; j++)
            row.push(0);

        // Filling the histogram
        for (let j = 0; j < dates[i].tasks.length; j++) {
            const task = dates[i].tasks[j];
            const index = ret.columns.findIndex(function(column) {return column === taskToTaskId(task)});

            if (index === -1 || index >= row.length - 1)
                continue;
            row[index + 1] += durationToHours(task.duration);
        }

        ret.rows.push(row);
    }

    return ret;
}

function accumulateByTag(dates) {
    const ret = {columns: [], rows: []};
    console.log(ret);

    // Listing the tags
    for (let i = 0; i < dates.length; i++) {
        for (let j = 0; j < dates[i].tasks.length; j++) {
            for (let k = 0; k < dates[i].tasks[j].tags.length; k++) {
                if (ret.columns.findIndex(function(column) {return column === dates[i].tasks[j].tags[k]}) === -1)
                    ret.columns.push(dates[i].tasks[j].tags[k]);
            }
        }
    }
    console.log(ret);

    // Accumulating the times
    for (let i = 0; i < dates.length; i++) {
        const row = [dates[i].date];

        // Building the histogram
        for (let j = 0; j < ret.columns.length; j++)
            row.push(0);

        // Filling the histogram
        for (let j = 0; j < dates[i].tasks.length; j++) {
            for (let k = 0; k < dates[i].tasks[j].tags.length; k++) {
                const tag = dates[i].tasks[j].tags[k];
                const index = ret.columns.findIndex(function(column) {return column === tag});

                if (index === -1 || index >= row.length - 1)
                    continue;
                row[index + 1] += durationToHours(dates[i].tasks[j].duration);
            }
        }

        ret.rows.push(row);
    }
    console.log(ret);

    return ret;
}

function accumulateRowsIfNeeded(columnsRows) {
    if (!document.getElementById("accumulate-checkbox").checked)
        return columnsRows;

    for (let i = 1; i < columnsRows.rows.length; i++) {
        for (let j = 1; j < columnsRows.rows[i].length; j++) {
            columnsRows.rows[i][j] += columnsRows.rows[i - 1][j];
        }
    }

    return columnsRows;
}

function addTotalIfNeeded(columnsRows) {
    if (!document.getElementById("total-checkbox").checked)
        return columnsRows;

    columnsRows.columns.push("[ALL]");
    for (let i = 0; i < columnsRows.rows.length; i++) {
        let accu = 0;
        for (let j = 1; j < columnsRows.rows[i].length; j++)
            accu += columnsRows.rows[i][j];
        columnsRows.rows[i].push(accu);
    }

    return columnsRows;
}

function drawCurveTypes() {
    // Gets the list of dates containing all the events
    let data = tasksPersistance;
    data = groupTasksByDate(data);

    // Refines the data
    data = applyGranularity(data);
    data = applyDateFilters(data);
    data = applyProjectFilter(data);
    data = applyTaskFilter(data);

    // Makes the data digest for the chart, regarding the display mode
    let columnsRows = accumulateByDisplayMode(data);

    // Apply post-filters
    columnsRows = accumulateRowsIfNeeded(columnsRows);
    columnsRows = addTotalIfNeeded(columnsRows);

    const dataTable = new google.visualization.DataTable();

    // Adding the columns
    dataTable.addColumn('date', "Moment");
    for (let i = 0; i < columnsRows.columns.length; i++) {
        dataTable.addColumn('number', columnsRows.columns[i]);
    }

    // Adding the rows
    dataTable.addRows(columnsRows.rows);

    const options = {
        height: 1000,
        hAxis: {
            title: 'Moment of the year'
        },
        vAxis: {
            title: 'Time spent'
        }};

    const chart = new google.visualization.LineChart(document.getElementById('line-chart-container'));
    chart.draw(dataTable, options);
}