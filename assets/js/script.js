var taskIdCounter = 0;

var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var pageContentEl = document.querySelector("#page-content");

// create array to hold tasks for saving
var tasks = [];

var taskFormHandler = function (event) {
  event.preventDefault();
  var taskNameInput = document.querySelector("input[name='task-name']").value;
  var taskTypeInput = document.querySelector("select[name='task-type']").value;

  // check if inputs are empty (validate)
  if (!taskNameInput || !taskTypeInput) {
    alert("You need to fill out the task form!");
    return false;
  }

  // reset form fields for next task to be entered
  document.querySelector("input[name='task-name']").value = "";
  document.querySelector("select[name='task-type']").selectedIndex = 0;

  // check if task is new or one being edited by seeing if it has a data-task-id attribute
  var isEdit = formEl.hasAttribute("data-task-id");

  if (isEdit) {
    var taskId = formEl.getAttribute("data-task-id");
    completeEditTask(taskNameInput, taskTypeInput, taskId);
  } else {
    var taskDataObj = {
      name: taskNameInput,
      type: taskTypeInput,
      status: "to do",
    };

    createTaskEl(taskDataObj);
  }
};

var createTaskEl = function(taskDataObj) {
  var listItemEl = document.createElement("li");
  listItemEl.className = "task-item";
  listItemEl.setAttribute("data-task-id", taskIdCounter);

  var taskInfoEl = document.createElement("div");
  taskInfoEl.className = "task-info";
  taskInfoEl.innerHTML =
    "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
  listItemEl.appendChild(taskInfoEl);

  var taskActionsEl = createTaskActions(taskIdCounter);
  listItemEl.appendChild(taskActionsEl);

  switch (taskDataObj.status) {
    case "to do":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 0;
      tasksToDoEl.append(listItemEl);
      break;
    case "in progress":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 1;
      tasksInProgressEl.append(listItemEl);
      break;
    case "completed":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 2;
      tasksCompletedEl.append(listItemEl);
      break;
    default:
      console.log("Something went wrong!");
  }

  // save task as an object with name, type, status, and id properties then push it into tasks array
  taskDataObj.id = taskIdCounter;

  tasks.push(taskDataObj);

  // save tasks to localStorage
  saveTasks();

  // increase task counter for next unique task id
  taskIdCounter++;
};

var createTaskActions = function (taskId) {
  // create container to hold elements
  var actionContainerEl = document.createElement("div");
  actionContainerEl.className = "task-actions";

  // create edit button
  var editButtonEl = document.createElement("button");
  editButtonEl.textContent = "Edit";
  editButtonEl.className = "btn edit-btn";
  editButtonEl.setAttribute("data-task-id", taskId);
  actionContainerEl.appendChild(editButtonEl);
  // create delete button
  var deleteButtonEl = document.createElement("button");
  deleteButtonEl.textContent = "Delete";
  deleteButtonEl.className = "btn delete-btn";
  deleteButtonEl.setAttribute("data-task-id", taskId);
  actionContainerEl.appendChild(deleteButtonEl);
  // create change status dropdown
  var statusSelectEl = document.createElement("select");
  statusSelectEl.setAttribute("name", "status-change");
  statusSelectEl.setAttribute("data-task-id", taskId);
  statusSelectEl.className = "select-status";
  actionContainerEl.appendChild(statusSelectEl);
  // create status options
  var statusChoices = ["To Do", "In Progress", "Completed"];

  for (var i = 0; i < statusChoices.length; i++) {
    // create option element
    var statusOptionEl = document.createElement("option");
    statusOptionEl.setAttribute("value", statusChoices[i]);
    statusOptionEl.textContent = statusChoices[i];

    // append to select
    statusSelectEl.appendChild(statusOptionEl);
  }

  return actionContainerEl;
};

var completeEditTask = function (taskName, taskType, taskId) {
  // find task list item with taskId value
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  // set new values
  taskSelected.querySelector("h3.task-name").textContent = taskName;
  taskSelected.querySelector("span.task-type").textContent = taskType;

  // loop through tasks array and task object with new content
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].name = taskName;
      tasks[i].type = taskType;
    }
  }

  alert("Task Updated!");

  // remove data attribute from form
  formEl.removeAttribute("data-task-id");
  // update formEl button to go back to saying "Add Task" instead of "Edit Task"
  formEl.querySelector("#save-task").textContent = "Add Task";
  // save tasks to localStorage
  saveTasks();
};

var taskButtonHandler = function (event) {
  // get target element from event
  var targetEl = event.target;

  if (targetEl.matches(".edit-btn")) {
    console.log("edit", targetEl);
    var taskId = targetEl.getAttribute("data-task-id");
    editTask(taskId);
  } else if (targetEl.matches(".delete-btn")) {
    console.log("delete", targetEl);
    var taskId = targetEl.getAttribute("data-task-id");
    deleteTask(taskId);
  }
};

var taskStatusChangeHandler = function (event) {
  console.log(event.target.value);

  // find task list item based on event.target's data-task-id attribute
  var taskId = event.target.getAttribute("data-task-id");

  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  // convert value to lower case
  var statusValue = event.target.value.toLowerCase();

  if (statusValue === "to do") {
    tasksToDoEl.appendChild(taskSelected);
  } else if (statusValue === "in progress") {
    tasksInProgressEl.appendChild(taskSelected);
  } else if (statusValue === "completed") {
    tasksCompletedEl.appendChild(taskSelected);
  }

  // update task's in tasks array
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === parseInt(taskId)) {
      tasks[i].status = statusValue;
    }
  }

  // save to localStorage
  saveTasks();
};

var editTask = function (taskId) {
  console.log(taskId);

  // get task list item element
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );

  // get content from task name and type
  var taskName = taskSelected.querySelector("h3.task-name").textContent;
  console.log(taskName);

  var taskType = taskSelected.querySelector("span.task-type").textContent;
  console.log(taskType);

  // write values of taskName and taskType to form to be edited
  document.querySelector("input[name='task-name']").value = taskName;
  document.querySelector("select[name='task-type']").value = taskType;

  // set data attribute to the form with a value of the task's id so it knows which one is being edited
  formEl.setAttribute("data-task-id", taskId);
  // update form's button to reflect editing a task rather than creating a new one
  formEl.querySelector("#save-task").textContent = "Save Task";
};

var deleteTask = function (taskId) {
  console.log(taskId);
  // find task list element with taskId value and remove it
  var taskSelected = document.querySelector(
    ".task-item[data-task-id='" + taskId + "']"
  );
  taskSelected.remove();

  // create new array to hold updated list of tasks
  var updatedTaskArr = [];

  // loop through current tasks
  for (var i = 0; i < tasks.length; i++) {
    // if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
    if (tasks[i].id !== parseInt(taskId)) {
      updatedTaskArr.push(tasks[i]);
    }
  }

  // reassign tasks array to be the same as updatedTaskArr
  tasks = updatedTaskArr;
  saveTasks();
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks = function() {
  var savedTasks = localStorage.getItem("tasks");
  // if there are no tasks, set tasks to an empty array and return out of the function
  if (!savedTasks) {
    return false;
  }
  console.log("Saved tasks found!");
  // else, load up saved tasks

  // parse into array of objects
  savedTasks = JSON.parse(savedTasks);

  // loop through savedTasks array
  for (var i = 0; i < savedTasks.length; i++) {
    // pass each task object into the `createTaskEl()` function
    createTaskEl(savedTasks[i]);
  }
};

// Create a new task
formEl.addEventListener("submit", taskFormHandler);

// for edit and delete buttons
pageContentEl.addEventListener("click", taskButtonHandler);

// for changing the status
pageContentEl.addEventListener("change", taskStatusChangeHandler);

loadTasks();



// // I deadass replaced my entire code because I couldn't get it to work :) 
// IF SOMETHING ISN'T WORKING, ENSURE E1 ISN'T EL

// var pageContentEl = document.querySelector("#page-content");
// var tasksInProgressEl = document.querySelector("#tasks-in-progress");
// var tasksCompletedEl = document.querySelector("#tasks-completed");
// var taskIdCounter = 0;
// var formE1 = document.querySelector("#task-form");
// var tasksToDoE1 = document.querySelector("#tasks-to-do");

// var tasks = [];

// var taskFormHandler = function(event) {

//     event.preventDefault();

//     var taskNameInput = document.querySelector("input[name='task-name']").value;
//     var taskTypeInput = document.querySelector("select[name='task-type']").value;

//     if (!taskNameInput || !taskTypeInput) {
//         alert("You need to fill out the task form!");
//         return false;
//     }

//     formE1.reset();

//     var isEdit = formE1.hasAttribute("data-task-id");
    
//     // package up data as an object
//     var taskDataObj = {
//         name: taskNameInput,
//         type: taskTypeInput,
//         status: "to do"
//     };

//     // send it as an argument to createTaskE1
//     //  has data attribute, so get task id and call function to edit
//     if (isEdit) {
//         var taskId = formE1.getAttribute("data-task-id");
//         completeEditTask(taskNameInput, taskTypeInput, taskId);
//     }
//     // no data attribute, so create as normal and pass to createTaskEl fn
//     else {
//         var taskDataObj = {
//             name: taskNameInput,
//             type: taskTypeInput,
//             status: "to do"
//         };

//         createTaskE1(taskDataObj);
//     }

// }

// var completeEditTask = function(taskName, taskType, taskId) {
//     // find matching task list item
//     var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

//     // set new values
//     taskSelected.querySelector("h3.task-name").textContent = taskName;
//     taskSelected.querySelector("span.task-type").textContent = taskType;

//     // loop through tasks array and task object with new content
//     for (var i = 0; i < tasks.length; i++) {
//         if (tasks[i].id === parseInt(taskId)) {
//             tasks[i].name = taskName;
//             tasks[i].type = taskType;
//         }
//     };

//     alert("Task Updated!");

//     // reset form
//     formE1.removeAttribute("data-task-id");
//     document.querySelector("#save-task").textContent = "Add Task";

// }

// var createTaskE1 = function(taskDataObj) {
    
//     // create list item
//     var listItemE1 = document.createElement("li");
//     listItemE1.className = "task-item";

//     // add task id as a custom attribute
//     listItemE1.setAttribute("data-task-id", taskIdCounter);

//     // create div to hold task info and add to list item
//     var taskInfoE1 = document.createElement("div");
//     // give it a class name
//     taskInfoE1.className = "task-info";
//     // add HTML content to div
//     taskInfoE1.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";

//     listItemE1.appendChild(taskInfoE1);
    
//     var taskActionsEl = createTaskActions(taskIdCounter);
//     listItemE1.appendChild(taskActionsEl);

//     taskDataObj.id = taskIdCounter;
//     tasks.push(taskDataObj);

//     tasksToDoE1.appendChild(listItemE1);

//     // add entire list item to list
//     tasksToDoE1.appendChild(listItemE1);

//     // increase task counter for next unique id
//     taskIdCounter++;

//     saveTasks();

// }

// var createTaskActions = function(taskId) {

//     var actionContainerEl = document.createElement("div");
//     actionContainerEl.className = "task-actions";

//     // create edit button
//     var editButtonEl = document.createElement("button");
//     editButtonEl.textContent = "Edit";
//     editButtonEl.className = "btn edit-btn";
//     editButtonEl.setAttribute("data-task-id", taskId);
    
//     actionContainerEl.appendChild(editButtonEl);

//     // create delete button
//     var deleteButtonEl = document.createElement("button");
//     deleteButtonEl.textContent = "Delete";
//     deleteButtonEl.className = "btn delete-btn";
//     deleteButtonEl.setAttribute("data-task-id", taskId);

//     actionContainerEl.appendChild(deleteButtonEl);

//     // dropdown menu select
//     var statusSelectEl = document.createElement("select");
//     statusSelectEl.className = "select-status";
//     statusSelectEl.setAttribute("name", "status-change");
//     statusSelectEl.setAttribute("data-task-id", taskId);

//     actionContainerEl.appendChild(statusSelectEl);

//     var statusChoices = ["To Do", "In Progress", "Completed"];

//     for (var i = 0; i < statusChoices.length; i++) {
//         // create option element
//         var statusOptionEl = document.createElement("option");
//         statusOptionEl.textContent = statusChoices[i];
//         statusOptionEl.setAttribute("value", statusChoices[i]);

//         // append to select
//         statusSelectEl.appendChild(statusOptionEl);
//     }

    

//     return actionContainerEl;
// };

// formE1.addEventListener("submit", taskFormHandler);

// var editTask = function(taskId) {
//     // get task list item element
//     var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

//     // get content form task name and type
//     var taskName = taskSelected.querySelector("h3.task-name").textContent;
//     var taskType = taskSelected.querySelector("span.task-type").textContent;

//     document.querySelector("input[name='task-name']").value = taskName;
//     document.querySelector("select[name='task-type']").value = taskType;
//     document.querySelector("#save-task").textContent = "Save Task";

//     formE1.setAttribute("data-task-id", taskId);

//     saveTasks();
    
// }

// var deleteTask = function(taskId) {
//     var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
//     taskSelected.remove();

//     // create new array to hold updated list of tasks
//     var updatedTaskArr = [];

//     // loop through current tasks
//     for (var i = 0; i < tasks.length; i++) {
//         // if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
//         if (tasks[i].id !== parseInt(taskId)) {
//             updatedTaskArr.push(tasks[i]);
//         }
//     }

//     // reassign tasks array to be the same as updatedTaskArr
//     tasks = updatedTaskArr;
//     saveTasks();
// };

// var taskButtonHandler = function(event) {
//     // get target element from event
//     var targetEl = event.target;

//     // edit button was clicked
//     if (event.target.matches(".edit-btn")) {
//         var taskId = targetEl.getAttribute("data-task-id");
//         editTask(taskId);
//     }
//     // delete button was clicked
//     if (event.target.matches(".delete-btn")) {
//         // get the element's task id
//         var taskId = event.target.getAttribute("data-task-id");
//         deleteTask(taskId);
//     }
// }

// var taskStatusChangeHandler = function(event) {
//     // get the task item's id
//     var taskId = event.target.getAttribute("data-task-id");

//     // get the currently selected option's value and convert to lowercase
//     var statusValue = event.target.value.toLowerCase();

//     // find the parent task item element based on the id
//     var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

//     if (statusValue === "to do") {
//         tasksToDoE1.appendChild(taskSelected);
//     }
//     else if (statusValue === "in progress") {
//         tasksInProgressEl.appendChild(taskSelected);
//     }
//     else if (statusValue === "completed") {
//         tasksCompletedEl.appendChild(taskSelected);
//     }

//     // update task's in tasks array
//     for (var i = 0; i < tasks.length; i++) {
//         if (tasks[i].id === parseInt(taskId)) {
//             tasks[i].status = statusValue;
//         }
//     }

//     saveTasks();
// };

// pageContentEl.addEventListener("change", taskStatusChangeHandler);

// var saveTasks = function() {

//     localStorage.setItem("tasks", JSON.stringify(tasks));    

// }

// var loadTasks = function() {

//     var savedTasks = localStorage.getItem("tasks");
//     // loop to ensure not storing if there are no saved tasks
//     // if there are no tasks, set tasks to an empty array and return out of the function
//      if (!savedTasks) {
//         return false;
//      }
//       console.log("Saved tasks found!");
//   // else, load up saved tasks

//   // parse into array of objects
//   savedTasks = JSON.parse(savedTasks);

//   // loop through savedTasks array
//   for (var i = 0; i < savedTasks.length; i++) {
//     // pass each task object into the `createTaskEl()` function
//     createTaskEl(savedTasks[i]);
//   }

// };

// pageContentEl.addEventListener("click", taskButtonHandler);