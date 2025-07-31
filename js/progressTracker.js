//Progress Tracker Graph using Chart.js 
let progressChart;

const initializeChart = () => {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], // Labels will update dynamically
            datasets: [{
                label: 'No. of Tasks Completed',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
          plugins: {
              legend: {
                  labels: {
                      color: '#1b263b', // Change text color
                      font: {
                          size: 16 // Change font size
                      },
                      boxWidth: 0, // Change size of the legend box
                      boxHeight: 0 // Change height of the legend box
                  },
                  position: 'top' // Move the legend to the bottom
              }
          },
          scales: {
              y: {
                  beginAtZero: true,
              }
          }
      }
      
    });
};

initializeChart();

// Formatting Dates Using Flatpickr
flatpickr.formatDate = (date, format) => {
  const options = { day: "2-digit", month: "short" }; // Format: "28 OCT"
  const formattedDate = date.toLocaleDateString("en-US", options).toUpperCase();
  
  // Swap the day and month order to "29 NOV"
  const [month, day] = formattedDate.split(" "); // Split on space
  return `${day} ${month}`;
};
const getWeekLabels = () => {
  const today = new Date();
  const options = { day: "2-digit", month: "short" };

  // Find the start of the week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Subtract days to get to Sunday

  // Generate labels from Sunday to Saturday
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek); // Copy the start of the week
    date.setDate(startOfWeek.getDate() + i); // Add i days to get the correct day
    const formattedDate = date.toLocaleDateString("en-US", options);
  
  // Swap the day and month order to "29 NOV"
  const [month, day] = formattedDate.split(" "); // Split on space
  return `${day} ${month}`; // Format as "d M"
  });
};

/* // Example usage:
console.log(getWeekLabels()); */
/* const getTasksFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}; */

const calculateProgress = () => {
  const tasks = getTasksFromLocalStorage(); // Ensure this function retrieves the data correctly
  /* console.log("All tasks:", tasks); */

  const today = new Date().toLocaleDateString('en-GB'); // Format today's date as dd/mm/yyyy
  /* console.log(today) */
  // Calculate completed tasks for today
  const completedToday = tasks.filter((task) => {
    const [taskDescription, taskDate] = task.split(' - '); // Assuming tasks are stored as "description - date"
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
    const taskDateObj = new Date(formattedDate).toLocaleDateString("en-GB");
    /* console.log(taskDateObj) */
    return (taskDescription.startsWith("✔ ") && taskDateObj === today); // Check both completion and date match
  });

  /* console.log("Completed tasks today:", completedToday); */
  return completedToday.length; // Return the count of tasks completed today
};

// Retrieve progress from localStorage (an array of percentages)
const getProgressFromLocalStorage = () => {
  const progress = JSON.parse(localStorage.getItem("weekProgress")) || [0, 0, 0, 0, 0, 0, 0];
  
  // Ensure the retrieved progress is a nested array
  const formattedProgress = Array.isArray(progress[0]) ? progress : [progress];

  /* console.log("Formatted Progress from localStorage:", formattedProgress); // Debugging line */

  return formattedProgress;
};

/* const progress1 = getProgressFromLocalStorage()
console.log(progress1)
console.log(calculateProgress()) */

const saveProgressToLocalStorage = (progress) => {
  /* console.log("Saving Progress to localStorage:", progress); // Debugging line */
  localStorage.setItem("weekProgress", JSON.stringify(progress));
};

// Helper function to get the current week number
const getCurrentWeek = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const days = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

// Check and reset weekly progress if needed
const resetWeeklyProgressIfNeeded = () => {
  const storedWeek = parseInt(localStorage.getItem("lastUpdatedWeek")) || 0;
  const currentWeek = getCurrentWeek();

  if (storedWeek !== currentWeek) {
    // Reset progress to 0 for the new week
    const resetProgress = [0, 0, 0, 0, 0, 0, 0];
    saveProgressToLocalStorage([resetProgress]);

    // Update the stored week number
    localStorage.setItem("lastUpdatedWeek", currentWeek);
  }
};



const saveDailyProgress = (completedTasks, totalTasks) => {
  // Reset weekly progress if a new week has started
  resetWeeklyProgressIfNeeded();

  // Calculate the progress percentage
  const percentage = calculateProgress(completedTasks, totalTasks);

  // Format today's date as "D MMM"
  const today = new Date();
  const options = { day: "2-digit", month: "short" };
  const formattedDate = today.toLocaleDateString("en-US", options); // Format: "30 Oct"
  const [month, day] = formattedDate.split(" "); // Split on space
  const dateLabel = `${day} ${month}`;

  // Save the progress percentage for the specific date
  saveProgress(dateLabel, percentage);
};


const saveProgress = (dateLabel, percentage) => {
  // Dates that will be tracked for progress
  const dateList = getWeekLabels();

  // Retrieve the current progress array from localStorage
  let storedProgress = getProgressFromLocalStorage();

  // Check if storedProgress is valid, otherwise initialize it
  if (!storedProgress || !Array.isArray(storedProgress) || storedProgress.length === 0) {
    storedProgress = [[0, 0, 0, 0, 0, 0, 0]]; // Default 0 progress for each day
    /* console.log("Progress was uninitialized. Initialized storedProgress:", storedProgress); */
  }

  // Find the index of the dateLabel in the dateList
  const dateIndex = dateList.indexOf(dateLabel);
  if (dateIndex !== -1) {
    // Update the progress at the found index with the given percentage
    storedProgress[0][dateIndex] = percentage;
    /* console.log("Updated storedProgress:", storedProgress); */
  } /* else {
    console.error("Date label not found in dateList:", dateLabel);
  } */

  // Save the updated progress back to localStorage
  saveProgressToLocalStorage(storedProgress);
};


saveDailyProgress()

// Get the progress for the week
const getProgressForWeek = () => {
  const weekLabels = getWeekLabels(); // Generate labels for the last 7 days
  const storedProgress = getProgressFromLocalStorage();

  // Debugging: Check the value of storedProgress
  /* console.log("Stored Progress from localStorage:", storedProgress); */

  // Ensure storedProgress is an array with at least one sub-array
  if (!storedProgress || !Array.isArray(storedProgress) || !storedProgress[0]) {
    console.error("Stored Progress is not properly initialized.");
    return Array(7).fill(0); // Return an array of 0s if progress is missing
  }

  // Map each label to the corresponding progress percentage or 0 if not present
  return weekLabels.map((_, index) => storedProgress[0][index] || 0); // Access progress using index
};


// Update the chart with the new labels and completion percentage
const updateChart = () => {
  if (!progressChart) {
    return; // Ensure the chart is initialized
  }

  // Get weekly labels and corresponding progress
  const weekLabels = getWeekLabels();
  const progressData = getProgressForWeek();

  // Calculate the maximum number of tasks for the week
  const maxTasksForWeek = Math.max(...progressData);

  // Set the y-axis maximum dynamically based on the number of tasks
  const dynamicMaxY = maxTasksForWeek + 4; // Add a buffer for clarity (adjust as needed)

  // Update chart data
  progressChart.data.labels = weekLabels;
  progressChart.data.datasets[0].data = progressData;

  // Update the y-axis max dynamically
  progressChart.options.scales.y.max = dynamicMaxY;

  // Refresh the chart
  progressChart.update();
};


// Function to update progress every week
const updateWeeklyProgress = () => {
  calculateProgress(); // Update stored progress
  updateChart(); // Refresh the chart with updated data
};

// Initialize weekly progress update
updateWeeklyProgress();


const scheduleWeeklyUpdate = () => {
  const now = new Date();
  const nextMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + ((1 + 7 - now.getDay()) % 7)
  );
  const timeUntilNextMonday = nextMonday - now;

  setTimeout(() => {
    resetWeeklyProgressIfNeeded(); // Reset progress for the new week
    updateWeeklyProgress(); // Update chart
    setInterval(() => {
      resetWeeklyProgressIfNeeded();
      updateWeeklyProgress();
    }, 7 * 24 * 60 * 60 * 1000); // Repeat every week
  }, timeUntilNextMonday);
};

// Start the scheduled updates
scheduleWeeklyUpdate(); 