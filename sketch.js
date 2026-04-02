let pursuer1;
let target;
let obstacles = [];
let vehicules = [];
let entities = [];

let avionImg;

function preload() {
  avionImg = loadImage('assets/mode-avion.png');
  airportIcon = loadImage('assets/airport.png');
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  pursuer1 = new Avion(100, 100, avionImg, 20);
  vehicules.push(pursuer1);

  // Créer 3 aéroports aléatoires
  for (let i = 0; i < 3; i++) {
    let airport = new Entity(random(width), random(height), airportIcon, 0);
    vehicules.push(airport);
    entities.push(airport);
  }

  // On cree un obstace au milieu de l'écran
  obstacles.push(new Obstacle(width / 2, height / 2, 50, "red", 0));
}

function draw() {
  // changer le dernier param (< 100) pour effets de trainée
  background(4, 214, 255, 255);

  target = createVector(mouseX, mouseY);

  // Dessin de la cible qui suit la souris
  // Dessine un cercle de rayon 32px à la position de la souris
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);

  // dessin des obstacles
  // TODO
  obstacles.forEach(obstacle => {
    obstacle.show();
  })

  // Trier les véhicules par altitude (les plus bas d'abord, les plus hauts en dernier)
  // Cela permet aux avions plus hauts de s'afficher au-dessus des autres
  vehicules.sort((a, b) => a.alt - b.alt);

  vehicules.forEach(vehicule => {
    // pursuer = le véhicule poursuiveur, il vise un point devant la cible
    vehicule.applyBehaviors(target, obstacles, vehicules);

    // déplacement et dessin du véhicule et de la target
    vehicule.update();
    vehicule.show();
  });
}

// function mousePressed() {
//   // TODO : ajouter un obstacle de taille aléatoire à la position de la souris
//   obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), "green"));
// }

function keyPressed() {
  if (key == "v") {
    vehicules.push(new Avion(random(width), random(height), avionImg, random(10, 100)));
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  } else if (key == "f") {
    // on crée 10 véhicules à des position random espacées de 50px
    // en x = 20, y = hauteur du  canvas sur deux
    // for (let i = 0; i < 10; i++) {
    //   let v = new Vehicle(20, 300)
    //   // vitesse aléatoire
    //   v.vel = new p5.Vector(random(1, 5), random(1, 5));
    //   vehicules.push(v);
    // }
  }
}