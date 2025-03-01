const mainPart = document.getElementById("main-part");
const alertPlaceholder = document.getElementById('success-alert');
const dateInput = document.getElementById('task-date');
const taskInput = document.getElementById('floatingInput');
const taskListContainer = document.getElementById('task-list-container');
let selectedDate = '';

const appendAlert = (message, type) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible container" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('');
  const alertElement = wrapper.firstChild;
  mainPart.prepend(alertElement);
  setTimeout(() => {
    alertElement.remove();
  }, 2000);
};

const getTasksFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem('tasks')) || [];
};

const saveTasksToLocalStorage = (tasks) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

const scheduleWeeklyCleanup = () => {
  const today = new Date();
  /* console.log(today) */

  // Calculate the start of the current week (Sunday at 00:00:00)
  const startOfWeek = new Date(today);
  const currentDay = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const offset = -currentDay; // Move to the previous Sunday
  startOfWeek.setDate(today.getDate() + offset);
  startOfWeek.setHours(0, 0, 0, 0);
  /* console.log(startOfWeek) */

  // Calculate time until the next cleanup (end of this Saturday at 23:59:59)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  /* console.log(endOfWeek) */

  /* const timeUntilNextSaturday = endOfWeek.getTime() - today.getTime();
  console.log(timeUntilNextSaturday)
  console.log(startOfWeek); */
  removeOldTasksFromLocalStorage(startOfWeek);

  /* // Schedule cleanup
  if (timeUntilNextSaturday > 0) {
    setTimeout(() => {
      removeOldTasksFromLocalStorage(startOfWeek);
      scheduleWeeklyCleanup(); // Schedule the next cleanup
    }, timeUntilNextSaturday);
  } */
};

const removeOldTasksFromLocalStorage = (startOfWeek) => {
  const tasks = getTasksFromLocalStorage();
  // Filter tasks based on their assigned date being on or after the start of the week
  const updatedTasks = tasks.filter(task => {
    const [taskDescription, taskDate] = task.split(' - ');

    const currentYear = new Date().getFullYear(); // Get the current year

    // Map of month names to numbers
    const monthMap = {
      "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
      "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };

    // Split the date string into day and month parts
    const [day, month] = taskDate.split(" "); // ["05", "Dec"]

    // Format the date as yyyy-mm-dd
    const formattedDate = `${currentYear}-${monthMap[month]+1}-${day.padStart(2, "0")}`;

    // Create a Date object
    const taskDateObj = new Date(formattedDate)
    /* console.log(taskDateObj) */
    
    return taskDateObj >= startOfWeek || (!taskDescription.startsWith('✔') && taskDateObj < startOfWeek);
  });
  /* console.log(updatedTasks) */
  // Save the updated list back to localStorage
  saveTasksToLocalStorage(updatedTasks);
};


const renderTasks = () => {
  
  taskListContainer.innerHTML = ''; // Clear existing tasks

  const tasks = getTasksFromLocalStorage(); // Get tasks from localStorage
  tasks.forEach((task, index) => {
    if (task.trim() === "") return;
    const [taskInputText, taskDate] = task.split(' - ');
    const tasksDate = new Date(taskDate).toLocaleDateString("en-GB");
    /* console.log(taskInputText, tasksDate); */

    // Create the task item elements
    const taskItem = document.createElement('div');
    taskItem.className = 'input-group mb-3 task-item';

    const taskCheckbox = document.createElement('div');
    taskCheckbox.className = 'input-group-text bg-success-subtle';
    taskCheckbox.innerHTML = `<input class="form-check-input mt-0" type="checkbox" aria-label="Checkbox for following text input">`;

    const taskText = document.createElement('input');
    taskText.type = 'text';
    taskText.className = 'form-control';
    taskText.value = taskInputText.replace("✔ ", ""); // Remove the marker from the text
    taskText.readOnly = true;

    const date = document.createElement('div');
    date.className = 'date text-dark px-2';
    date.innerHTML = `${taskDate}`;


    const claenderButton = document.createElement('button');
    claenderButton.className = 'btn buttons btn-light disabled';
    claenderButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                                          <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/>
                                        </svg>`

    const editButton = document.createElement('button');
    editButton.className = `btn buttons border-none`;
    editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="23" height="23" viewBox="0 0 50 50">
                                    <path d="M 43.125 2 C 41.878906 2 40.636719 2.488281 39.6875 3.4375 L 38.875 4.25 L 45.75 11.125 C 45.746094 11.128906 46.5625 10.3125 46.5625 10.3125 C 48.464844 8.410156 48.460938 5.335938 46.5625 3.4375 C 45.609375 2.488281 44.371094 2 43.125 2 Z M 37.34375 6.03125 C 37.117188 6.0625 36.90625 6.175781 36.75 6.34375 L 4.3125 38.8125 C 4.183594 38.929688 4.085938 39.082031 4.03125 39.25 L 2.03125 46.75 C 1.941406 47.09375 2.042969 47.457031 2.292969 47.707031 C 2.542969 47.957031 2.90625 48.058594 3.25 47.96875 L 10.75 45.96875 C 10.917969 45.914063 11.070313 45.816406 11.1875 45.6875 L 43.65625 13.25 C 44.054688 12.863281 44.058594 12.226563 43.671875 11.828125 C 43.285156 11.429688 42.648438 11.425781 42.25 11.8125 L 9.96875 44.09375 L 5.90625 40.03125 L 38.1875 7.75 C 38.488281 7.460938 38.578125 7.011719 38.410156 6.628906 C 38.242188 6.246094 37.855469 6.007813 37.4375 6.03125 C 37.40625 6.03125 37.375 6.03125 37.34375 6.03125 Z"></path>
                                    </svg>`;
      /* checkboxInput.checked ? editButton.classList.add('disabled') : editButton.classList.remove('disabled'); */

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn buttons';
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="23" height="23" viewBox="0 0 30 30">
                                    <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
                                </svg>`;

    // Set the checkbox status and text-decoration based on the task marker
    const checkboxInput = taskCheckbox.querySelector('input');
    checkboxInput.checked = task.startsWith("✔ ");
    taskItem.style.textDecoration = checkboxInput.checked ? 'line-through' : 'none';

    // Add change event for the checkbox
    checkboxInput.addEventListener('change', () => {
      tasks[index] = checkboxInput.checked ? `✔ ${task.replace("✔ ", "")}` : task.replace("✔ ", "");
      taskItem.style.textDecoration = checkboxInput.checked ? 'line-through' : 'none';
      
      calculateProgress();
      window.location.reload();
      /* updateWeeklyProgress(); */
      saveTasksToLocalStorage(tasks);
    });
    checkboxInput.checked ? editButton.classList.add('disabled')  : editButton.classList.remove('disabled');

    // Attach Flatpickr to the calendar button
    claenderButton.addEventListener('click', () => {
      flatpickr(claenderButton, {
        dateFormat: "d M", // Display format as 30 OCT
        minDate: "today", // Freeze dates before today
        onChange: function(selectedDates, dateStr, instance) {
          // Update the hidden input with the selected date in desired format
          if (dateStr !== taskDate) {
            updateTaskDate(index, dateStr); // Update task date if changed
          }
        }
      }).open();
      claenderButton.classList.add('disabled')
      hideCompletedTasks();
    });

    // Function to update the task date in localStorage
    const updateTaskDate = (taskId, newDate) => {
      const tasks = getTasksFromLocalStorage();
      const task = tasks[taskId];
      const [taskInputText] = task.split(' - ');

      // Update the task with the new date
      tasks[taskId] = `${taskInputText} - ${newDate}`;
      saveTasksToLocalStorage(tasks);
      renderTasks(); // Re-render the task list
      hideCompletedTasks();
      window.location.reload()
    };

    
    editButton.addEventListener('click', () => {
      if (taskText.readOnly) {
        // Enable editing
        taskText.readOnly = false;
        taskItem.style.textDecoration = 'none';
        claenderButton.classList.remove('disabled');
        claenderButton.classList.add('date-button')
        taskText.focus(); 
        editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>`;
      } else {
        // Save changes
        taskText.readOnly = true;
        claenderButton.classList.add('disabled');
        tasks[index] = `${taskText.value} - ${taskDate}`; // Update the task in the array
        saveTasksToLocalStorage(tasks); // Save the updated tasks to local storage
        editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="23" height="23" viewBox="0 0 50 50">
                                    <path d="M 43.125 2 C 41.878906 2 40.636719 2.488281 39.6875 3.4375 L 38.875 4.25 L 45.75 11.125 C 45.746094 11.128906 46.5625 10.3125 46.5625 10.3125 C 48.464844 8.410156 48.460938 5.335938 46.5625 3.4375 C 45.609375 2.488281 44.371094 2 43.125 2 Z M 37.34375 6.03125 C 37.117188 6.0625 36.90625 6.175781 36.75 6.34375 L 4.3125 38.8125 C 4.183594 38.929688 4.085938 39.082031 4.03125 39.25 L 2.03125 46.75 C 1.941406 47.09375 2.042969 47.457031 2.292969 47.707031 C 2.542969 47.957031 2.90625 48.058594 3.25 47.96875 L 10.75 45.96875 C 10.917969 45.914063 11.070313 45.816406 11.1875 45.6875 L 43.65625 13.25 C 44.054688 12.863281 44.058594 12.226563 43.671875 11.828125 C 43.285156 11.429688 42.648438 11.425781 42.25 11.8125 L 9.96875 44.09375 L 5.90625 40.03125 L 38.1875 7.75 C 38.488281 7.460938 38.578125 7.011719 38.410156 6.628906 C 38.242188 6.246094 37.855469 6.007813 37.4375 6.03125 C 37.40625 6.03125 37.375 6.03125 37.34375 6.03125 Z"></path>
                                    </svg>`; // Change button text back to "Edit" (optional)
        window.location.reload()
                                    
      }
      hideCompletedTasks();

    });

    // Add delete functionality
    deleteButton.addEventListener('click', () => {
      tasks.splice(index, 1);
      calculateProgress();
      window.location.reload();
      /* updateWeeklyProgress(); */
      saveTasksToLocalStorage(tasks);
      renderTasks(); // Re-render the task list
      hideCompletedTasks();
    });

    // Append elements to the task item
    taskItem.appendChild(taskCheckbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(date);
    taskItem.appendChild(claenderButton);
    taskItem.appendChild(editButton);
    taskItem.appendChild(deleteButton);

    // Append the task item to the task list container
    taskListContainer.appendChild(taskItem);
  });
};

// Initialize flatpickr on the date button
flatpickr(".date-button", {
  dateFormat: "d M", // Display format as 30 OCT
  minDate: "today", // Freeze dates before today
  onChange: function(selectedDates, dateStr, instance) {
    // Update the hidden input with the selected date in desired format
    document.getElementById("task-date").value = dateStr;
  }
}); 

const alertTrigger = document.getElementById('task-add');
const date = document.getElementById('date');
if (alertTrigger) {
    alertTrigger.addEventListener('click', () => {
        const taskValue = taskInput.value.trim();
        const selectedDate = document.getElementById("task-date").value; // Use formatted date or fallback
        const task = `${taskValue} - ${selectedDate ? selectedDate : "No Date"}`;
        if (taskValue !== '') {
            const tasks = getTasksFromLocalStorage();
            tasks.push(task); // Add task with date
            saveTasksToLocalStorage(tasks);
            appendAlert('Congratulations, your task is added!', 'success');
            renderTasks(); // Update the task list
            taskInput.value = '';
            document.getElementById("task-date").value = ''; // Clear date for next entry
        } else {
            appendAlert('Please enter a task before adding!', 'danger');
        }
        window.location.reload();
        hideCompletedTasks();
    });
    /* calculateProgress();
    updateWeeklyProgress(); */
};

// Function to enable reordering tasks
const reOrderTasks = () => {
  // Get the parent container of task items
  const taskContainer = document.getElementById('task-list-container');
  // Initialize Sortable on the container
  const sortable = new Sortable(taskContainer, {
    animation: 150, // Smooth animation during drag and drop
    onEnd: () => {
      /* console.log("Reordering tasks..."); */

      // Get the current tasks from local storage
      const storedTasks = getTasksFromLocalStorage()
      /* console.log("Stored tasks from localStorage:", storedTasks); */

      // Extract the reordered tasks
      const reorderedTasks = Array.from(taskContainer.children).map((taskElement) => {
        // Extract task description
        const taskDescription = taskElement.querySelector('.form-control').value.trim();

        // Extract task date
        const taskDate = taskElement.querySelector('.date p').innerText.trim();

        // Check if the task is completed (starts with ✔)
        const isCompleted = taskElement.querySelector('.form-check-input').checked;

        // Combine task description, date, and completion status
        const formattedTask = `${isCompleted ? '✔ ' : ''}${taskDescription} - ${taskDate}`;

        console.log("Formatted task:", formattedTask);

        // Match the exact task from stored tasks
        const matchedTask = storedTasks.find((storedTask) => storedTask === formattedTask);

        console.log("Matched task from storage:", matchedTask);

        return matchedTask; // Add matched task to the reordered array
      }).filter(Boolean); // Filter out any unmatched tasks

      /* console.log("Reordered tasks:", reorderedTasks); */

      // Save reordered tasks back to local storage
      localStorage.setItem('tasks', JSON.stringify(reorderedTasks));
      window.location.reload()
    },
  });
};

const dateHighlighlighting = () => {
  const today = new Date();
  const previousDay = new Date(today);
  previousDay.setDate(today.getDate() - 1);
  previousDay.setHours(11, 59, 59, 999);
  /* console.log(previousDay) */
  const tasks = getTasksFromLocalStorage()
  const taskElements = document.querySelectorAll('.task-item'); 
  tasks.forEach((task,index) => {
    const [taskDescription, taskDate] = task.split(' - ');
    const currentYear = new Date().getFullYear(); // Get the current year
    
    // Map of month names to numbers
    const monthMap = {
      "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
      "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };

    // Split the date string into day and month parts
    const [day, month] = taskDate.split(" "); // ["05", "Dec"]

    // Format the date as yyyy-mm-dd
    const formattedDate = `${currentYear}-${monthMap[month]+1}-${day.padStart(2, "0")}`;
    /* console.log(formattedDate) */

    // Create a Date object
    const taskDateObj = new Date(formattedDate);
    taskDateObj.setHours(0, 0, 0, 0);
    /* console.log(taskDateObj) */
    if(!taskDescription.startsWith("✔") && taskDateObj < previousDay) {
      /* console.log('Task is overdue:', task); */
      const dateElement = taskElements[index]?.querySelector('.date');
      /* console.log(dateElement) */
      if (dateElement) {
        dateElement.classList.remove('text-dark');
        dateElement.classList.add('text-danger', 'fw-bold');
      } else {
        console.log("Date element not found for task:", task);
      }
      
    }  
  })
}

const hideCompletedTasks = () => {
  const tasks = getTasksFromLocalStorage(); // Fetch tasks from local storage
  const today = new Date()/* .toLocaleDateString("en-GB") */; // Get today's date
  /* today.setHours(0, 0, 0, 0); // Set time to 00:00:00 to compare only the date */
  /* console.log(today) */
  const previousDay = new Date(today);
  previousDay.setDate(today.getDate() - 1);
  previousDay.setHours(11, 59, 59, 999);

  const taskElements = document.querySelectorAll('.task-item'); // Select all task items
  /* console.log(taskElements) */

  /* console.log('Tasks from localStorage:', tasks);
  console.log('Task elements in DOM:', taskElements); */

  tasks.forEach((task, index) => {
    const [taskDescription, taskDate] = task.split(' - ');

    const currentYear = new Date().getFullYear(); // Get the current year

    // Map of month names to numbers
    const monthMap = {
      "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
      "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };

    // Split the date string into day and month parts
    const [day, month] = taskDate.split(" "); // ["05", "Dec"]

    // Format the date as yyyy-mm-dd
    const formattedDate = `${currentYear}-${monthMap[month]+1}-${day.padStart(2, "0")}`;

    // Create a Date object
    const taskDateObj = new Date(formattedDate);
    /* console.log(taskDateObj) */

    // Hide task if it's completed and the date is before today
    if (taskDateObj < previousDay && taskDescription.startsWith('✔ ')) {
      /* console.log(`Hiding task: ${task}`); */

      if (taskElements[index]) {
        taskElements[index].classList.add('d-none'); // Hide the task in the DOM
      } else {
        console.error(`Task element not found for index: ${index}`);
      }
    }
  });
};

function dateSorting() {
  const tasks = getTasksFromLocalStorage();
  /* console.log(tasks); */

  // Map of month names to numbers
  const monthMap = {
    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
  };

  // Function to parse the task date
  const parseTaskDate = (taskDate) => {
    const currentYear = new Date().getFullYear(); // Get the current year
    const [day, month] = taskDate.split(" "); // ["05", "Dec"]
    const formattedDate = `${currentYear}-${String(monthMap[month] + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
    return new Date(formattedDate);
  };

  // Sort tasks based on the parsed dates
  const sortedTasks = tasks.sort((a, b) => {
    const [, taskDateA] = a.split(' - ');
    const [, taskDateB] = b.split(' - ');
    const dateA = parseTaskDate(taskDateA);
    const dateB = parseTaskDate(taskDateB);
    return dateA - dateB;
  });

  /* console.log(sortedTasks); */
  saveTasksToLocalStorage(sortedTasks);
  renderTasks();
  hideCompletedTasks();
}

function completeOrder() {
  const tasks = getTasksFromLocalStorage();
  const completedTasks = tasks.filter(task => task.startsWith('✔ '));
  const uncompletedTasks = tasks.filter(task => !task.startsWith('✔ '));
  const orderedTasks = [...uncompletedTasks, ...completedTasks];
  /* console.log(orderedTasks); */
  saveTasksToLocalStorage(orderedTasks);
  renderTasks();
  hideCompletedTasks();
}

// Call the function after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  hideCompletedTasks();
  dateSorting();
  completeOrder();
  reOrderTasks();
  scheduleWeeklyCleanup();
});
window.onload = dateHighlighlighting;








