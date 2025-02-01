async function loadCategorizationCSV() {
    const csvPath = "./datasets/Updated_Task_categorization_dataset_fixed_work.csv";
    const dataset = tf.data.csv(csvPath);
    return dataset;
}
/* //log the dataset
async function logCategorizationCSV()
{
    const dataset = await loadCategorizationCSV();
    const records = await dataset.toArray();
    console.log(records);
}
logCategorizationCSV(); */

function tokenizeTextFormats(text) {
    if (typeof text !== 'string') {
      throw new TypeError('Expected a string');
    }
    return text.toLowerCase().split(/\W+/).filter(token => token.length > 0);
  }

async function tokenizedDataset() {
    const dataset = await loadCategorizationCSV()

    const transformedCategorizedDataset = dataset.map(record => {
        return {
            ...record,
            Task_Description : tokenizeTextFormats(record.Task_Description),
            Keywords: tokenizeTextFormats(record.Keywords),
            Category : tokenizeTextFormats(record.Category),
        }
    });
    return transformedCategorizedDataset;
}
/* //log tokenizedDataset
async function logTokenizedDataset() {
    const dataset = await tokenizedDataset()
    const datasetArray = await dataset.toArray()
    console.log(datasetArray)
}
logTokenizedDataset()
 */
async function descriptionVocabulary()
{
    const dataset = await tokenizedDataset();
    const datasetArray = await dataset.toArray();

    const Tokens = datasetArray.flatMap(row => row.Task_Description);

    const uniquedescriptionTokens = [...new Set(Tokens)];
    return uniquedescriptionTokens;
}
/* //log descriptionVocabulary
async function logdescriptionVocabulary() {
    const dataset = await descriptionVocabulary()
    console.log(dataset)
}
logdescriptionVocabulary() */
async function keywordsVocabulary()
{
    const dataset = await tokenizedDataset();
    const datasetArray = await dataset.toArray();

    const Tokens = datasetArray.flatMap(row => row.Keywords);

    const uniqueKeywordsTokens = [...new Set(Tokens)];
    return uniqueKeywordsTokens;
}
/* //log keywordsVocabulary
async function logKeywordsVocabulary() {
    const dataset = await keywordsVocabulary()
    console.log(dataset)
}
logKeywordsVocabulary() */

async function categoryVocabulary()
{
    const dataset = await tokenizedDataset();
    const datasetArray = await dataset.toArray();
    
    const Tokens = datasetArray.flatMap(row => row.Category)

    const uniqueCategoryTokens =  [...new Set(Tokens)];
    return uniqueCategoryTokens;
}
/* //log categoryVocabulary
async function logcategoryVocabulary() {
    const dataset = await categoryVocabulary()
    console.log(dataset)
}
logcategoryVocabulary() */
// Function to create Bag of Words vector
async function BoWVector(tokens, vocabulary) {
    const vector = new Array(vocabulary.length).fill(0);  // Initialize vector with zeros
  
    tokens.forEach(token => {
      const index = vocabulary.indexOf(token);
      if (index !== -1) {
        vector[index] += 1; // Increment the count
      }
    });
    return vector; // Return the BoW vector
}

async function descriptionBowVector() {
    const vocabulary = await descriptionVocabulary();
    const transformedDataset = await tokenizedDataset();
    const dataset = await transformedDataset.toArray();
    const bowMatrix = await Promise.all(
        dataset.map(row => {
            return BoWVector(row.Task_Description,vocabulary);
        })
    );
    return bowMatrix;
}
/* //log descriptionBowVector 
async function logDescriptionBowVector() {
    const bowMatrix = await descriptionBowVector();
    console.log(bowMatrix);
}
logDescriptionBowVector(); */
async function keywordsBowVector() {
    const vocabulary = await keywordsVocabulary();
    const transformedDataset = await tokenizedDataset();
    const dataset = await transformedDataset.toArray();
    const bowMatrix = await Promise.all(
        dataset.map(row => {
            return BoWVector(row.Keywords,vocabulary);
        })
    );
    return bowMatrix;
}
/* //log keywordsBowVector 
async function logKeywordsBowVector() {
    const bowMatrix = await keywordsBowVector();
    console.log(bowMatrix);
}
logKeywordsBowVector(); */

async function categoryBowVector() {
    const vocabulary = await categoryVocabulary();
    const transformedDataset = await tokenizedDataset();
    const dataset = await transformedDataset.toArray();
    const bowMatrix = await Promise.all(
        dataset.map(row => {
            return BoWVector(row.Category,vocabulary);
        })
    );
    return bowMatrix;
}
/* //log categoryBowVector 
async function logcategoryBowVector() {
    const bowMatrix = await categoryBowVector();
    console.log(bowMatrix);
}
logcategoryBowVector(); */
// Consolidated input feature matrix creation
async function inputMatrix() {
    const descriptionBoWMatrix = await descriptionBowVector();
    const keywordsBoWMatrix = await keywordsBowVector();
  
    const inputMatrix = descriptionBoWMatrix.map((row,index) => {
        return row.concat(keywordsBoWMatrix[index])
    });
  
    return inputMatrix;
}
/* //log the input matrix
async function logInputMatrix() {
    const inputCategorizationMatrix = await inputMatrix();
    console.log(inputCategorizationMatrix);
}
logInputMatrix(); */

async function outputMatrix() {
    const categoryBoWMatrix = await categoryBowVector();
  
    const outputMatrix = categoryBoWMatrix;
    return outputMatrix;
}
/* //log the output matrix
async function logOutputMatrix() {
    const outputCategorizationMatrix = await outputMatrix();
    console.log(outputCategorizationMatrix);
}
logOutputMatrix(); */

// Splitting the data into training and testing
async function splitCategorizationData() {
  const inputCategorizationMatrix = await inputMatrix();
  const outputCategorizationMatrix = await outputMatrix();

  // Determine the size of the training set (80% of the total data)
  const totalSize = inputCategorizationMatrix.length;
  const trainingSize = Math.floor(totalSize * 0.8);

  // Split the data into training and testing sets
  const trainingInput = inputCategorizationMatrix.slice(0, trainingSize);
  const trainingOutput = outputCategorizationMatrix.slice(0, trainingSize);
  const testingInput = inputCategorizationMatrix.slice(trainingSize);
  const testingOutput = outputCategorizationMatrix.slice(trainingSize);

  return { trainingInput, trainingOutput, testingInput, testingOutput };
}
/* //log the split data
async function logSplitCategorizationData() {
    const { trainingInput, trainingOutput, testingInput, testingOutput } = await splitCategorizationData();
    console.log('Training Input:', trainingInput);
    console.log('Training Output:', trainingOutput);
    console.log('Testing Input:', testingInput);
    console.log('Testing Output:', testingOutput);
}
logSplitCategorizationData(); */

async function createCategorizationModel(inputShape) {
    const model = tf.sequential();
  
    // Add dense layers with L2 regularization and batch normalization
    model.add(tf.layers.dense({
      units: 64, 
      activation: "relu", 
      inputShape: [inputShape],
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.5 }));
  
    model.add(tf.layers.dense({
      units: 64, 
      activation: "relu",
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.5 }));

    model.add(tf.layers.dense({
      units: 32, 
      activation: "relu",
      kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.5 }));
  
  
    model.add(tf.layers.dense({ units: 5, activation: "softmax" }));
  
    model.compile({
      optimizer: tf.train.adam(0.005),  // Adjusted learning rate
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"]
    });
  
    return model;
  }
    /* trainCategorizationModel(); */
    /* async function saveModel() {
      const model = await testCategorizationModel();
      await model.save('localstorage://my-categorization-model');
      console.log('Model saved successfully');
  }
  saveModel(); */
async function loadCategorizationModel() {
    const categorizationModel = await tf.loadLayersModel('localstorage://my-categorization-model');
    /* console.log('Model loaded successfully'); */
    return categorizationModel;
}

  
  async function trainCategorizationModel() {
    const { trainingInput, trainingOutput } = await splitCategorizationData();
    const model = await createCategorizationModel(trainingInput[0].length);
  
    const trainingInputTensor = tf.tensor2d(trainingInput, [trainingInput.length, trainingInput[0].length]);
    const trainingOutputTensor = tf.tensor2d(trainingOutput,[trainingOutput.length, trainingOutput[0].length]);
  
    await model.fit(trainingInputTensor, trainingOutputTensor, {
      epochs: 33,
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

async function testCategorizationModel() {
  const model = await trainCategorizationModel();
  const { testingInput, testingOutput } = await splitCategorizationData();

  const testingInputTensor = tf.tensor2d(testingInput, [testingInput.length, testingInput[0].length]);
  const testingOutputTensor = tf.tensor2d(testingOutput,[testingOutput.length, testingOutput[0].length]);

  const result = model.evaluate(testingInputTensor, testingOutputTensor);
  const loss = result[0].dataSync()[0];
  const accuracy = result[1].dataSync()[0];

  console.log(`Test Loss: ${loss}`);
  console.log(`Test Accuracy: ${accuracy}`);

  return model;
}
/* testCategorizationModel(); */
// Function to extract keywords from the task description
function extractCategorizationKeywords(description) {
    const tokens = tokenizeTextFormats(description);
    const keywordFrequency = {};
  
    tokens.forEach(token => {
      if (keywordFrequency[token]) {
        keywordFrequency[token]++;
      } else {
        keywordFrequency[token] = 1;
      }
    });
  
    // Sort tokens by frequency and select the top N keywords
    const sortedCategorizationKeywords = Object.keys(keywordFrequency).sort((a, b) => keywordFrequency[b] - keywordFrequency[a]);
    /* console.log(sortedKeywords); */
    return sortedCategorizationKeywords;
  }
  async function predictCategory(categorizationModel, description) {
    const descriptionVocab = await descriptionVocabulary();
    const keywordsVocab = await keywordsVocabulary();
    const descriptionCategorizationTokens = tokenizeTextFormats(description);
    const categorizationKeywords = extractCategorizationKeywords(description);
    /* console.log(categorizationKeywords); */
    /* console.log(descriptionCategorizationTokens);
    console.log('Description Vocab Length:', descriptionVocab.length);
    console.log('Keywords Vocab Length:', keywordsVocab.length); */
  
    const descriptionVector = await BoWVector(descriptionCategorizationTokens, descriptionVocab);
    const keywordsVector = await BoWVector(categorizationKeywords, keywordsVocab);
    /* console.log('Description BoW Vector:', descriptionVector);
    console.log('Keywords BoW Vector:', keywordsVector); */
    const inputCategorizationVector = descriptionVector.concat(keywordsVector);
    /* console.log('Input Vector Length:', inputCategorizationVector.length);
    console.log('Input Vector:', inputCategorizationVector); */

    const inputCategorizationTensor = tf.tensor2d([inputCategorizationVector], [1, inputCategorizationVector.length]);
  
    const prediction = categorizationModel.predict(inputCategorizationTensor);
    const categoryVocab = await categoryVocabulary();
    const categoryIndex = prediction.argMax(1).dataSync()[0];
    /* console.log('Predicted Category:', categoryVocab[categoryIndex]); */
    /* console.log('Prediction Scores:', prediction.dataSync()); */
    return categoryVocab[categoryIndex];
  }
  
  async function predictCategorizationModel() {
    const categorizationModel = await loadCategorizationModel();
    const categories = [];
    const tasks = await getTasksFromLocalStorage();
    for (const task of tasks) {
      const [taskDescription, taskDate] = task.split(' - ');
      /* console.log('Task Date:', taskDate); */
      const category= await predictCategory(categorizationModel, taskDescription);
      const taskCategory = category.charAt(0).toUpperCase() + category.slice(1);
      /* console.log('Task Category:', taskCategory); */
      categories.push({taskDescription, taskDate, tasksCategory: taskCategory});
    }
    /* console.log('Categorized Tasks:', categories); */
    return categories;
  }
  async function saveTaskCategories()
  {
    const categories = await predictCategorizationModel();
    const categorizedTasks = categories.map(({ taskDescription,taskDate, tasksCategory }) => `${taskDescription} - ${taskDate} - ${tasksCategory}`);
    // Sort tasks: not completed tasks (without "✔") at the top
    categorizedTasks.sort((a, b) => {
      const isACompleted = a.startsWith('✔');
      const isBCompleted = b.startsWith('✔');
      return isACompleted - isBCompleted;
    });

    localStorage.setItem('categorizedTasks', JSON.stringify(categorizedTasks));
    /* console.log('Categorized tasks saved to local storage:', categorizedTasks); */
    await displayCategorizedTasks();
  }
  saveTaskCategories();
  async function displayCategorizedTasks() {
    const categories = JSON.parse(localStorage.getItem('categorizedTasks'));
    const categorizedTasks = categories.map(category => {
      const [taskDescription, taskDate, taskCategory] = category.split(' - ');
      return {task: taskDescription, date: taskDate, category: taskCategory};
    });
    const categorizedTasksSorting = categorizedTasks.sort((a, b) => a.category.localeCompare(b.category));
    /* console.log('Categorized Tasks:', categorizedTasks); */

    const smartCategorization = document.getElementById('smart-categorization-container');
    smartCategorization.innerHTML = '';
    
    categorizedTasksSorting.forEach(({ task, category }) => {
      if(task.trim()===" ") return;
      const categoryItem = document.createElement('div');
      categoryItem.className = 'input-group category-item';
      const categoryTask = document.createElement('input');
      categoryTask.disabled = true;
      categoryTask.type = 'text';
      categoryTask.value = task;
      categoryTask.className = 'form-control category-description mb-3';
      categoryTask.style.width = '60%';
      categoryTask.style.backgroundColor = '#dee2ff';
      categoryItem.appendChild(categoryTask);
      const categoryElement = document.createElement('input');
      categoryElement.disabled = true;
      categoryElement.type = 'text';
      categoryElement.value = category;
      categoryElement.className = 'form-control category-text mb-3';
      categoryElement.style.fontWeight = 'bold'; 
      if(category === 'Personal') {
        categoryElement.style.backgroundColor = '#e9edc9';
      }
      else if(category === 'Work') {
        categoryElement.style.backgroundColor = '#ffccd5';
      }
      else if(category === 'Education') {
        categoryElement.style.backgroundColor = '#d8e2dc';
      }
      else if(category === 'Health') {
        categoryElement.style.backgroundColor = '#bee9e8';
      }
      else if(category === 'Household') {
        categoryElement.style.backgroundColor = '#e0fbfc';
      }
      categoryItem.appendChild(categoryElement);
      smartCategorization.appendChild(categoryItem);
    });
  const categoryElements = document.querySelectorAll('.category-item')
  /* console.log(categoryElements) */
  const today = new Date();
  const previousDay = new Date(today);
  previousDay.setDate(today.getDate() - 1);
  previousDay.setHours(11, 59, 59, 999);
  /* console.log(previousDay) */
  categorizedTasksSorting.forEach((task, index) => {
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
      /* console.log('Task is completed and the date is before today',task); */

      if (categoryElements[index]) {
        categoryElements[index].classList.add('d-none'); // Hide the task in the DOM
      } else {
        console.error(`Task element not found for index: ${index}`);
      }
    }
  });
  }
  /* displayCategorizedTasks(); */
  

    