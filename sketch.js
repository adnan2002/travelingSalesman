// Initialize an empty array for vertices and a string of letters
let vertices = [];
let letters = 'ABCDEFGHIJ';
let canvasSize = 800;
let padding = 50; // Padding to keep vertices inside the canvas
let graph = {}; // Initialize an empty object for the graph
let tspResult = null; // Initialize a null variable for the result of the traveling salesman problem
let brute = null;

// The setup function is called once when the program starts
function setup() {
  createCanvas(canvasSize, canvasSize); // Create a canvas
  textSize(23); // Increase font size
  textAlign(CENTER, CENTER); // Center the text
  // Create vertices for each letter
  for (let i = 0; i < letters.length; i++) {
    vertices.push(new Vertex(random(padding, width - padding), random(padding, height - padding), letters[i]));
  }
  // Create a button for randomizing vertices
  createButton('Randomize').mousePressed(randomizeVertices);
}

// The draw function is called repeatedly until the program stops
function draw() {
  background(220); // Set the background color
  // Draw lines between all vertices and calculate distances
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      line(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y); // Draw a line between the vertices
      let d = int(dist(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y)); // Calculate the Euclidean distance
      let midX = (vertices[i].x + vertices[j].x) / 2;
      let midY = (vertices[i].y + vertices[j].y) / 2;
      text(d, midX, midY); // Display the distance at the midpoint of the line
      // Add the distances to the graph
      if (!graph[vertices[i].letter]) {
        graph[vertices[i].letter] = {};
      }
      graph[vertices[i].letter][vertices[j].letter] = d;
      if (!graph[vertices[j].letter]) {
        graph[vertices[j].letter] = {};
      }
      graph[vertices[j].letter][vertices[i].letter] = d;
    }
  }

  // If a result for the traveling salesman problem exists, draw the path
  if (tspResult) {
    stroke('green');
    strokeWeight(4);
    for (let i = 0; i < tspResult.path.length - 1; i++) {
      let v1 = vertices.find(v => v.letter === tspResult.path[i]);
      let v2 = vertices.find(v => v.letter === tspResult.path[i + 1]);
      line(v1.x, v1.y, v2.x, v2.y);
    }
    stroke('black');
    strokeWeight(0.6);
  }else{
    stroke('black');
    strokeWeight(0.6);
  }

  // Check if the mouse is over a vertex and change the cursor accordingly
  let overVertex = false;
  for (let vertex of vertices) {
    vertex.display();
    if (vertex.isMouseOver()) {
      overVertex = true;
    }
  }
  cursor(overVertex ? HAND : ARROW);
}

// Function to randomize the positions of the vertices
function randomizeVertices() {
  for (let vertex of vertices) {
    vertex.x = random(padding, width - padding);
    vertex.y = random(padding, height - padding);
  }
  tspResult = null; // Reset the result of the traveling salesman problem
  document.getElementById('result').innerHTML = ""; // Clear the result display
}

// Class for vertices
class Vertex {
  constructor(x, y, letter) {
    this.x = x;
    this.y = y;
    this.letter = letter;
    this.diameter = 50; // Diameter of the circle
  }

  // Function to display the vertex
  display() {
    if (tspResult && tspResult.path.includes(this.letter)) {
      fill('green');
    } else {
      fill(255); // Fill the circle with white color to hide the line
    }
    ellipse(this.x, this.y, this.diameter, this.diameter); // Draw the circle
    fill(0); // Fill the text with black color
    text(this.letter, this.x, this.y); // Display the letter
  }
  
  // Function to check if the mouse is over the vertex
  isMouseOver() {
    // Calculate the distance between the mouse and the center of the circle
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.diameter / 2;
  }

  

  // Function to handle mouse press events
  onMousePressed() {
    if (this.isMouseOver()) {
      tspResult = travelingSalesman(graph, this.letter); // Solve the traveling salesman problem
      document.getElementById("result").innerHTML = "The resulting path using the Genetic Algorithm is " + tspResult.path.join("-") + " with total weight " + tspResult.weight;
      // brute = bruteForce(graph, this.letter);
      // document.getElementById('result').innerHTML += "<br>Brute force is "+brute.path.join('-') +" with total weight is "+brute.weight;
      return true;
    }
    return false;
  }
}

// Function to handle mouse press events
function mousePressed() {
  for (let vertex of vertices) {
    if (vertex.onMousePressed()) {
      break;
    }
  }
}

// Function to solve the traveling salesman problem using a basic genetic algorithm
function travelingSalesman(graph, start) {
  const populationSize = 50; // Number of chromosomes in the population
  const mutationRate = 0.01; // Probability of a mutation in each gene
  const generations = 100; // Number of generations

  let population = [];

  // Initialize population with random chromosomes
  for (let i = 0; i < populationSize; i++) {
    population.push(generateRandomChromosome(Object.keys(graph), start));
  }

  // Iterate through generations
  for (let gen = 0; gen < generations; gen++) {
    population = evolvePopulation(population, graph);
  }

  // Return the fittest chromosome
  return evaluateFitness(population[0], graph);

  // Helper functions

  // Function to generate a random chromosome
  function generateRandomChromosome(cities, start) {
    let chromosome = shuffle(cities.filter(city => city !== start)); // Create a shuffled copy of the cities excluding the start city
    chromosome.unshift(start); // Add the start city at the beginning
    chromosome.push(start); // Make it a closed loop
    return chromosome;
  }

  // Function to evolve the population using selection, crossover, and mutation
  function evolvePopulation(population, graph) {
    let newPopulation = [];
    for (let i = 0; i < population.length; i++) {
      let parent1 = selectParent(population, graph);
      let parent2 = selectParent(population, graph);
      let child = crossover(parent1, parent2);
      mutate(child, mutationRate);
      newPopulation.push(child);
    }
    return newPopulation.sort((a, b) => evaluateFitness(b, graph).fitness - evaluateFitness(a, graph).fitness); // Sort the population by fitness in descending order
    }

  // Function to select a parent based on fitness
  function selectParent(population, graph) {
    let totalFitness = population.reduce((sum, chromosome) => sum + evaluateFitness(chromosome, graph).fitness, 0); // returns the sum of all the fitness values
    let randomValue = random(0, totalFitness);
    let accumulatedFitness = 0;

    for (let chromosome of population) {
      accumulatedFitness += evaluateFitness(chromosome, graph).fitness;
      if (accumulatedFitness > randomValue) {
        return chromosome;
      }
    }
  }

  // Function to perform crossover between two parents
  function crossover(parent1, parent2) {
    const crossoverPoint = Math.floor(parent1.length / 2);
    let child = parent1.slice(0, crossoverPoint);

    for (let gene of parent2) {
      if (!child.includes(gene)) {
        child.push(gene);
      }
    }

    child.push(child[0]); // Make it a closed loop
    return child;
  }

  // Function to perform mutation on a chromosome
  // used to solve local minima
  function mutate(chromosome, mutationRate) {
    for (let i = 1; i < chromosome.length - 1; i++) {
      if (random() < mutationRate) {
        let swapIndex = i + floor(random(chromosome.length - i - 1));   // switches any random 2 values other than the first and last
        [chromosome[i], chromosome[swapIndex]] = [chromosome[swapIndex], chromosome[i]];
      }
    }
  }

  // Function to evaluate fitness of a chromosome
  function evaluateFitness(chromosome, graph) {
    let totalDistance = 0;
    for (let i = 0; i < chromosome.length - 1; i++) {
      totalDistance += graph[chromosome[i]][chromosome[i + 1]];
    }
    return { path: chromosome, weight: totalDistance, fitness: 1 / totalDistance }; // Use 1/distance to favor shorter paths
  }

  // Function to shuffle an array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

// function bruteForce(graph, start){
//   let visited = [start];
//   let next = start;
//   let totalWeight = 0;

//   // Visit each city in the graph
//   while (visited.length < Object.keys(graph).length) {
//     let neighbors = graph[next];
//     let bestNext = null;
//     let bestWeight = Infinity;

//     // Find the closest city that hasn't been visited yet
//     for (let city in neighbors) {
//       let weight = neighbors[city];
//       if (weight < bestWeight && !visited.includes(city)) {
//         bestWeight = weight;
//         bestNext = city;
//       }
//     }

//     next = bestNext;
//     visited.push(next);
//     totalWeight += bestWeight;
//   }

//   totalWeight += graph[next][start]; // Return to the start city
//   visited.push(start); // Return to the start city

//   return {path: visited, weight: totalWeight}; // Return the path and the total weight
// }


