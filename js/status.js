const completedTasksNumber = document.getElementById('completedTasks');
const pendingTasksNumber = document.getElementById('pendingTasks');
const averageProgress = document.getElementById('averageProgress');

// Helper function for animating numbers
function animateNumber(element, start, end, duration, isPercentage = false) {
    let startTime = null;

    function animationStep(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = isPercentage
            ? `${currentValue}%`
            : currentValue;
        if (progress < 1) {
            requestAnimationFrame(animationStep);
        }
    }

    requestAnimationFrame(animationStep);
}

function TasksStatus() {
    let completedTasks = 0;
    let pendingTasks = 0;
    let totalProgress = 0;

    // Get tasks and weekly progress data from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let progress = JSON.parse(localStorage.getItem('weekProgress')) || [];

    // Count completed and pending tasks
    if (tasks) {
        tasks.forEach(task => {
            if (task.startsWith('✔')) {
                completedTasks++;
            } else {
                pendingTasks++;
            }
        });
    }

    // Calculate total progress based on completed tasks in the current week
    if (tasks.length > 0) {
        // Calculate percentage of tasks completed in the week
        totalProgress = (completedTasks / tasks.length) * 100;
    } else {
        totalProgress = 0;  // If no tasks exist, progress is 0%
    }

    // Animate the numbers for completed tasks, pending tasks, and total progress
    animateNumber(completedTasksNumber, 0, completedTasks, 2000);
    animateNumber(pendingTasksNumber, 0, pendingTasks, 2000);
    animateNumber(averageProgress, 0, Math.round(totalProgress), 2000, true);
}

TasksStatus();

