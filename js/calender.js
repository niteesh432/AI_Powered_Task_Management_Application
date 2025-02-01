// Array to store tasks
const tasks = [];

// Function to add a task
function addTask(taskName, taskDate) {
    tasks.push({ name: taskName, date: taskDate });
    displayTasks();
}

// Function to display tasks for the selected date
function displayTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = ""; // Clear previous tasks

    tasks.forEach(task => {
        const taskElement = document.createElement("div");
        taskElement.className = "task-item";
        taskElement.textContent = `${task.name} - Due: ${task.date}`;
        taskList.appendChild(taskElement);
    });
}

// Event listener for form submission
document.getElementById("add-task-form").addEventListener("submit", function(event) {
    event.preventDefault();
    const taskName = document.getElementById("task-name").value;
    const taskDate = document.getElementById("task-date").value;

    if (taskName && taskDate) {
        addTask(taskName, taskDate);
        document.getElementById("add-task-form").reset(); // Clear form fields
    } else {
        alert("Please enter both the task name and due date.");
    }
});
