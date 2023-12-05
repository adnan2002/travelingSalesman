// Initialize an empty array for vertices and a string of letters
let vertices = [];
let letters = 'ABCDEFGHIJ';
let canvasSize = 800;
let padding = 50; // Padding to keep vertices inside the canvas
let graph = {}; // Initialize an empty object for the graph
let tspResult = null; // Initialize a null variable for the result of the traveling salesman problem

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
      document.getElementById("result").innerHTML = "The shortest path is " + tspResult.path.join("-") + " with total weight " + tspResult.weight;
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

// Function to solve the traveling salesman problem
function travelingSalesman(graph, start) {
  let visited = [start];
  let next = start;
  let totalWeight = 0;

  // Visit each city in the graph
  while (visited.length < Object.keys(graph).length) {
    let neighbors = graph[next];
    let bestNext = null;
    let bestWeight = Infinity;

    // Find the closest city that hasn't been visited yet
    for (let city in neighbors) {
      let weight = neighbors[city];
      if (weight < bestWeight && !visited.includes(city)) {
        bestWeight = weight;
        bestNext = city;
      }
    }

    next = bestNext;
    visited.push(next);
    totalWeight += bestWeight;
  }

  totalWeight += graph[next][start]; // Return to the start city
  visited.push(start); // Return to the start city

  return {path: visited, weight: totalWeight}; // Return the path and the total weight
}