async function loadPrioritizationCSV() {
  const csvPath = "./datasets/task_management.csv";

  // Load the dataset
  const dataset = tf.data.csv(csvPath);

  return dataset;
}
/* //log the dataset
async function logDataset() {
  const dataset = await loadPrioritizationCSV();
  const records = await dataset.toArray();
  console.log(records);
}
logDataset(); */
function showEmptyMessage(containerId, iconClass, message) {
  const container = document.getElementById(containerId);
  if (!container || container.children.length > 0) return;

  const messageBox = document.createElement("div");
  messageBox.className = "empty-message-box text-center my-3";

  messageBox.innerHTML = `
    <div class="text-secondary d-flex flex-column align-items-center justify-content-center p-4">
      <i class="${iconClass}" style="font-size: 2.75rem; color: #90caf9; margin-bottom: 1rem;"></i>
      <p class="empty-message-text">${message}</p>
    </div>
  `;

  container.appendChild(messageBox);
}



// Improved text tokenization with punctuation removal and stemming placeholder
function tokenizeText(text) {
  if (!text) return [];
  const trimmedText = text.trim();

  // Remove punctuation and split into words
  const tokens = trimmedText.toLowerCase().replace(/[.,!?]/g, ' ').split(/\s/);

  // Stemming or lemmatization could be added here
  return tokens;
}
// Enhanced preprocessing pipeline
async function processDataset() {
  const dataset = await loadPrioritizationCSV();

  // Map and transform dataset records
  const transformedDataset = dataset.map(record => {
    return {
      ...record,
      Task_Description: tokenizeText(record.Task_Description),
      Keywords: tokenizeText(record.Keywords),
    };
  });

  return transformedDataset;
}
/* //log the processed dataset
async function logProcessedDataset() {
  const transformedDataset = await processDataset();
  const records = await transformedDataset.toArray();
  console.log(records);
}
logProcessedDataset(); */

// Combine Description and Keywords for BoW representation
async function createCombinedVocabulary() {
  const transformedDataset = await processDataset();
  const datasetArray = await transformedDataset.toArray();

  // Collect tokens from Description and Keywords
  const allTokens = datasetArray.flatMap(row => row.Task_Description.concat(row.Keywords));

  // Remove duplicates and combine with priorityKeywords
  const uniqueTokens = [...new Set(allTokens)];
  return uniqueTokens;
}
/* //log the combined vocabulary
async function logCombinedVocabulary() {
  const vocabulary = await createCombinedVocabulary();
  console.log(vocabulary);
}
logCombinedVocabulary(); */

// Function to create Bag of Words vector
async function createBoWVector(tokens, vocabulary) {
  const vector = new Array(vocabulary.length).fill(0);  // Initialize vector with zeros

  tokens.forEach(token => {
    const index = vocabulary.indexOf(token);
    if (index !== -1) {
      vector[index] += 1; // Increment the count
    }
  });
  return vector; // Return the BoW vector
}

// Create separate BoW matrices for description and keywords
async function createDescriptionBoWMatrix() {
  const vocabulary = await createCombinedVocabulary();
  const transformedDataset = await processDataset();
  const datasetArray = await transformedDataset.toArray();

  // Generate Bag-of-Words vectors for description
  const bowMatrix = await Promise.all(
    datasetArray.map(row => {
      return createBoWVector(row.Task_Description, vocabulary);
    })
  );
  return bowMatrix;
}
/* //log the description BoW matrix
async function logDescriptionBoWMatrix() {
  const bowMatrix = await createDescriptionBoWMatrix();
  console.log(bowMatrix);
}
logDescriptionBoWMatrix(); */

async function createKeywordsBoWMatrix() {
  const vocabulary = await createCombinedVocabulary();
  const transformedDataset = await processDataset();
  const datasetArray = await transformedDataset.toArray();

  // Generate Bag-of-Words vectors for keywords
  const bowMatrix = await Promise.all(
    datasetArray.map(row => {
      return createBoWVector(row.Keywords, vocabulary);
    })
  );

  return bowMatrix;
}

/* //log the keywords BoW matrix
async function logKeywordsBoWMatrix() {
  const bowMatrix = await createKeywordsBoWMatrix();
  console.log(bowMatrix);
}
logKeywordsBoWMatrix(); */

// Enhanced normalization of Due_Days
async function normalizeNumericalColumns() {
  const transformedDataset = await processDataset();
  const datasetArray = await transformedDataset.toArray();

  const dueDays = datasetArray.map(row => row.Due_Days);
  const dueDaysTensor = tf.tensor1d(dueDays);

  // Mean normalization using tf.moments()
  const { mean, variance } = tf.moments(dueDaysTensor);
  const std = tf.sqrt(variance).dataSync()[0];
  const meanValue = mean.dataSync()[0];

  const normalizedDueDays = dueDays.map(value => (value - meanValue) / std);

  return { normalizedDueDays, meanValue, std};
}
/* //log Numerical Columns
async function logNumericalColumns()
{
  const columns = await normalizeNumericalColumns();
  const normalizedDueDays = await columns.normalizedDueDays
  console.log(normalizedDueDays);
}
logNumericalColumns(); */

// Consolidated input feature matrix creation
async function createInputMatrix() {
  const descriptionBoWMatrix = await createDescriptionBoWMatrix();
  const keywordsBoWMatrix = await createKeywordsBoWMatrix();
  const { normalizedDueDays } = await normalizeNumericalColumns();

  const inputMatrix = descriptionBoWMatrix.map((row, index) => {
    return row.concat(keywordsBoWMatrix[index]).concat(normalizedDueDays[index]);
  });

  return inputMatrix;
}
/* //log the input matrix
  async function logInputMatrix() {
  const inputMatrix = await createInputMatrix();
  console.log(inputMatrix);
  }
  logInputMatrix(); */

async function createOutputMatrix() {
  const transformedDataset = await processDataset();
  const datasetArray = await transformedDataset.toArray();

  const priorityScores = datasetArray.map(row => row.Priority_Score);
  return priorityScores;
}
/* //log the output matrix
  async function logOutputMatrix() {
  const outputMatrix = await createOutputMatrix();
  console.log(outputMatrix);
  }
  logOutputMatrix(); */

/*   //log vocabulary of output matrix
  async function logOutputMatrixVocabulary() {
    const outputMatrix = await createOutputMatrix();
    const uniqueValues = [...new Set(outputMatrix)];
    console.log(uniqueValues);
  }
  logOutputMatrixVocabulary(); */

// Splitting the data into training and testing
async function splitData() {
  const inputMatrix = await createInputMatrix();
  const outputMatrix = await createOutputMatrix();

  // Split the data into training and testing
  const trainingDataSize = Math.floor(inputMatrix.length * 0.8);
  const trainingInput = inputMatrix.slice(0, trainingDataSize);
  const trainingOutput = outputMatrix.slice(0, trainingDataSize);

  const testingInput = inputMatrix.slice(trainingDataSize);
  const testingOutput = outputMatrix.slice(trainingDataSize);

  return { trainingInput, trainingOutput, testingInput, testingOutput };
}
/* //log the split data
async function logSplitData() {
  const { trainingInput, trainingOutput, testingInput, testingOutput } = await splitData();
  console.log('Training Input:', trainingInput);
  console.log('Training Output:', trainingOutput);
  console.log('Testing Input:', testingInput);
  console.log('Testing Output:', testingOutput);
}
logSplitData(); */

async function createModelEnhanced(inputShape) {
  const model = tf.sequential();

  // Add dense layers with L2 regularization and batch normalization
  model.add(tf.layers.dense({
    units: 64, 
    activation: "relu", 
    inputShape: [inputShape],
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));
  model.add(tf.layers.batchNormalization());
  model.add(tf.layers.dropout({ rate: 0.3 }));

  model.add(tf.layers.dense({
    units: 32, 
    activation: "relu",
    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
  }));
  model.add(tf.layers.batchNormalization());
  model.add(tf.layers.dropout({ rate: 0.5 }));

  model.add(tf.layers.dense({
    units: 16, 
    activation: "relu",
    kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
  }));
  model.add(tf.layers.batchNormalization());
  model.add(tf.layers.dropout({ rate: 0.5 }));

  model.add(tf.layers.dense({ units: 7, activation: "softmax" }));

  model.compile({
    optimizer: tf.train.rmsprop(0.001),  // Adjusted learning rate
    loss: "sparseCategoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

async function trainModel() {
  const { trainingInput, trainingOutput } = await splitData();
  const model = await createModelEnhanced(trainingInput[0].length);

  const trainingInputTensor = tf.tensor2d(trainingInput, [trainingInput.length, trainingInput[0].length]);
  const trainingOutputTensor = tf.tensor1d(trainingOutput);

  await model.fit(trainingInputTensor, trainingOutputTensor, {
    epochs: 60,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: [
      {
        onEpochEnd: async (epoch, logs) => {
          console.log(`Epoch: ${epoch} - loss: ${logs.loss} - accuracy: ${logs.acc}`);
        },
      },
    ],
  });

  return model;
}
  
async function loadModel() {
  try {
      const model = await tf.loadLayersModel('./models/my-prioritization-model.json');
      /* console.log('Model loaded successfully'); */
      return model;
  } catch (error) {
      console.error('Error loading the model:', error);
  }
}
async function saveModel() {
    const model = await testModel();
    /* await model.save('localstorage://my-model'); */
    await model.save('downloads://my-prioritization-model');
    console.log('Model saved successfully');
}
/* saveModel(); */

async function testModel() {
  const model = await trainModel();
  const { testingInput, testingOutput } = await splitData();

  const testingInputTensor = tf.tensor2d(testingInput, [testingInput.length, testingInput[0].length]);
  const testingOutputTensor = tf.tensor1d(testingOutput);

  const result = model.evaluate(testingInputTensor, testingOutputTensor);
  const loss = result[0].dataSync()[0];
  const accuracy = result[1].dataSync()[0];

  console.log(`Test Loss: ${loss}`);
  console.log(`Test Accuracy: ${accuracy}`);

  return model;
}
/* testModel(); */

// Function to extract keywords from the task description
function extractKeywords(description) {
  const tokens = tokenizeText(description);
  const keywordFrequency = {};

  tokens.forEach(token => {
    if (keywordFrequency[token]) {
      keywordFrequency[token]++;
    } else {
      keywordFrequency[token] = 1;
    }
  });

  // Sort tokens by frequency and select the top N keywords
  const sortedKeywords = Object.keys(keywordFrequency).sort((a, b) => keywordFrequency[b] - keywordFrequency[a]);

  return sortedKeywords;
}
// Function to predict task priority
async function predictTaskPriority(model, description, dueDays) {
  // Extract keywords from the description
  const keywords = extractKeywords(description);
  /* console.log('Extracted Keywords:', keywords); */

  // Tokenize the input description and keywords
  const tokenizedDescription = tokenizeText(description);
  const tokenizedKeywords = keywords;

  // Create BoW vectors for description and keywords
  const vocabulary = await createCombinedVocabulary();
  const descriptionBoW = await createBoWVector(tokenizedDescription, vocabulary);
  const keywordsBoW = await createBoWVector(tokenizedKeywords, vocabulary);

  /* console.log('Description BoW:', descriptionBoW);
  console.log('Keywords BoW:', keywordsBoW); */


  // Normalize the dueDays
  const { meanValue, std } = await normalizeNumericalColumns();
  const normalizedDueDays = ((Number(dueDays)) - meanValue) / std;

  /* console.log('Normalized Due Days:', normalizedDueDays); */

  // Combine the BoW vectors and normalized dueDays into a single input vector
  const inputVector = descriptionBoW.concat(keywordsBoW).concat(normalizedDueDays);

  /* console.log('Input Vector:', inputVector);
  console.log('Input Vector Shape:', [1, inputVector.length]); */

  // Convert the input vector to a tensor
  const inputTensor = tf.tensor2d([inputVector]);

  // Log the model's expected input shape
  /* console.log('Model Expected Input Shape:', model.inputs[0].shape); */

  // Make the prediction
  const prediction = model.predict(inputTensor);
  const predictedClass = prediction.argMax(-1).dataSync()[0] + 1; // Adding 1 to match the range 1-10

  return predictedClass;
}

function getDueDays(date) {
  const currentDate = new Date();
  const dueDate = new Date(date);
  const year = new Date().getFullYear();

  // Format the dates as dd/mm/yyyy
  const formattedDueDate = `${dueDate.getDate()}/${dueDate.getMonth() + 1}/${year}`;
  const formattedCurrentDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${year}`;

  /* console.log(`Formatted Due Date: ${formattedDueDate}`);
  console.log(`Formatted Current Date: ${formattedCurrentDate}`); */

  // Parse the formatted date strings back into Date objects
  const [dueDay, dueMonth, dueYear] = formattedDueDate.split('/').map(Number);
  const [currentDay, currentMonth, currentYear] = formattedCurrentDate.split('/').map(Number);

  const parsedDueDate = new Date(dueYear, dueMonth - 1, dueDay);
  const parsedCurrentDate = new Date(currentYear, currentMonth - 1, currentDay);

  /* console.log(`Parsed Due Date: ${parsedDueDate}`);
  console.log(`Parsed Current Date: ${parsedCurrentDate}`); */

  // Calculate the difference in time
  const timeDifference = parsedDueDate - parsedCurrentDate;

  // Convert time difference from milliseconds to days
  const dueDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return dueDays;
}

async function taskList() {
  const tasks = await getTasksFromLocalStorage();
  const tasksPriority = [];
  const model = await loadModel();

  for (const task of tasks) {
    const [taskDescription, taskDate] = task.split(' - ');
    const tasksDate = taskDate;
    const dueDays = parseInt(getDueDays(taskDate));
    /* console.log(dueDays); */
    const predictedPriority = await predictTaskPriority(model, taskDescription, dueDays);
    tasksPriority.push({ taskDescription,tasksDate, priority: predictedPriority });
  }
  return tasksPriority;
  
}
/* taskList(); */

async function savePriorityToLocalStorage() {
  const tasksPriority = await taskList();
  const prioritizedTasks = tasksPriority.map(({ taskDescription,tasksDate, priority }) => `${taskDescription} - ${tasksDate} - ${priority}`);
  localStorage.setItem('prioritizedTasks', JSON.stringify(prioritizedTasks));
  /* console.log('Prioritized tasks saved to local storage:', prioritizedTasks); */
  await displayTaskList();
  showEmptyMessage('smart-remainders-container', 'fas fa-bell-slash', 'You have no urgent reminders. Stay relaxed!');
}
savePriorityToLocalStorage();

async function displayTaskList() {
  const smartListContainer = document.getElementById('smart-remainders-container');
  if (!smartListContainer) {
    console.error('Element with ID "smart-remainders-container" not found.');
    return;
  }

  const tasks = await getTasksFromLocalStorage();
  const tasksPriority = JSON.parse(localStorage.getItem('prioritizedTasks'));
  /* console.log(tasksPriority) */

  // Combine tasks and priorities into an array of objects
const tasksWithPriority = tasksPriority.map(task => {
  const [taskDescription, taskDate, priority] = task.split(' - ');
  const dueDays = getDueDays(taskDate); // Assuming getDueDays is a function that calculates due days
  return { task: taskDescription, date: taskDate, priority: parseInt(priority, 6), dueDays: dueDays };
});

// Sort the array based on priority and due days
tasksWithPriority.sort((a, b) => {
  if ((a.priority === b.priority || a.priority < b.priority || a.priority > b.priority) && a.dueDays !== b.dueDays) {
    return a.dueDays - b.dueDays; // Sort by due days if priorities are equal
  }
  return a.priority - b.priority; // Sort by priority
});
/* console.log(tasksWithPriority); */

// Clear the container before appending sorted tasks
smartListContainer.innerHTML = '';

let count = tasksWithPriority.length;
// Display the sorted tasks
tasksWithPriority.forEach(({ task, priority, dueDays }) => {
  if (task.trim() === "") return;
  const remainderItem = document.createElement('div');
  remainderItem.className = 'input-group remainder-item';
  const taskInput = document.createElement('input');
  taskInput.type = 'text';
  taskInput.className = 'form-control remainder-text mb-3';
  taskInput.value = task;
  taskInput.disabled = true;
  taskInput.style.backgroundColor = `rgba(255, 0, 0, ${(count) / 10})`;
  count--;
  remainderItem.appendChild(taskInput);
  smartListContainer.appendChild(remainderItem);
});
const remainderElements = document.querySelectorAll('.remainder-item')
/* console.log(remainderElements) */
const today = new Date();
const previousDay = new Date(today);
previousDay.setDate(today.getDate() - 1);
previousDay.setHours(11, 59, 59, 999);
/* console.log(previousDay) */
  tasksWithPriority.forEach((task, index) => {
    /* console.log(task) */
    const taskDate = task['date']
    const taskDescription = task['task']
    /* console.log(taskDescription) */
    /* console.log(taskDate) */
    /* const [taskDescription, taskDate] = task.split(' - '); */

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
      /* console.log(`Hiding task: ${taskDescription} ${taskDate}`); */

      if (remainderElements[index]) {
        remainderElements[index].classList.add('d-none'); // Hide the task in the DOM
      } else {
        console.error(`Task element not found for index: ${index}`);
      }
    }
  });
}
/* displayTaskList(); */
const motivationalQuotes = [
  "Keep pushing forward!",
  "You can do it!",
  "Stay focused and never give up!",
  "Believe in yourself!",
  "Every step counts!",
  "Success is just around the corner!",
  "Stay positive and work hard!",
  "Your efforts will pay off!",
  "Keep going, you're doing great!",
  "Stay motivated and achieve your goals!",
  "Dream big and dare to fail.",
  "The harder you work for something, the greater you’ll feel when you achieve it.",
  "Don’t stop when you’re tired. Stop when you’re done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It’s going to be hard, but hard does not mean impossible.",
  "Don’t wait for opportunity. Create it.",
  "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Dream it. Wish it. Do it.",
  "Success doesn’t just find you. You have to go out and get it.",
  "The harder you work, the luckier you get.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Great things never come from comfort zones.",
  "Success is not for the lazy.",
  "The way to get started is to quit talking and begin doing.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it’s done.",
  "Don’t let yesterday take up too much of today.",
  "You learn more from failure than from success. Don’t let it stop you. Failure builds character.",
  "It’s not whether you get knocked down, it’s whether you get up.",
  "If you are working on something that you really care about, you don’t have to be pushed. The vision pulls you.",
  "People who are crazy enough to think they can change the world, are the ones who do.",
  "We may encounter many defeats but we must not be defeated.",
  "Knowing is not enough; we must apply. Wishing is not enough; we must do.",
  "Imagine your life is perfect in every respect; what would it look like?",
  "We generate fears while we sit. We overcome them by action.",
  "Whether you think you can or think you can’t, you’re right.",
  "Security is mostly a superstition. Life is either a daring adventure or nothing.",
  "The man who has confidence in himself gains the confidence of others.",
  "The only way to do great work is to love what you do.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "Creativity is intelligence having fun.",
  "What you lack in talent can be made up with desire, hustle and giving 110% all the time.",
  "Do what you can with all you have, wherever you are.",
  "Develop an ‘Attitude of Gratitude’. Say thank you to everyone you meet for everything they do for you."
];

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
}

function sendNotification(message) {
  const quote = getRandomQuote();
  const fullMessage = `${message}\n\n${quote}`;
  /* console.log(`Sending notification: ${fullMessage}`); */
  
  if (Notification.permission === "granted") {
      new Notification(fullMessage, {
          icon: "./images/icon.png",
      });
  } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
          if (permission === "granted") {
              const notification = new Notification(fullMessage, {
                  icon: "icon.png",
              });
              
              // Use 'onclick' to navigate to the desired link when the notification is clicked
              notification.onclick = () => {
                  window.location.href = "index.html"; // Redirect to index.html
              };
          }
      });
  }
}

function scheduleNotifications() {
  const now = new Date();
  const times = [
    { hour: 8, minute: 0, message: "Good morning! Here are your tasks for today." },
    { hour: 12, minute: 0, message: "Midday check-in! How are you doing with your tasks?" },
    { hour: 16, minute: 0, message: "Afternoon reminder! Don't forget to complete your tasks." },
    { hour: 20, minute: 0, message: "Evening summary! Here's what you accomplished today." }
  ];

  times.forEach(({ hour, minute, message }) => {
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1); // Schedule for the next day if the time has already passed
    }
    const delay = targetTime - now;
    /* console.log(`Scheduling notification for ${targetTime} with delay ${delay}ms`); */
    setTimeout(() => {
      sendNotification(message);
      setInterval(() => sendNotification(message), 24 * 60 * 60 * 1000); // Repeat daily
    }, delay);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        /* alert("Notification permission granted."); */
        scheduleNotifications();
      } else {
        alert("Notification permission denied.");
      }
    });
  } else {
    alert("Notifications are not supported in this browser.");
  }
  /* displayTaskList(); */
});
