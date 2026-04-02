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

  nbPlanesUserWant = createSlider(1, 20, 5, 1);

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

  // dessin des obstacles
  // TODO
  obstacles.forEach(obstacle => {
    obstacle.show();
  })

  // Trier les véhicules par altitude (les plus bas d'abord, les plus hauts en dernier)
  // Cela permet aux avions plus hauts de s'afficher au-dessus des autres
  vehicules.sort((a, b) => a.alt - b.alt);

  vehicules.forEach(vehicule => {
    // pursuer = le véhicule poursuiveur, il vise sa target définie à sa création
    vehicule.carburant -= 0.05; // Consommation de carburant à chaque frame
    vehicule.applyBehaviors(vehicule.target, obstacles, vehicules);

    // déplacement et dessin du véhicule et de la target
    vehicule.update();
    vehicule.show();
  });

  // Supprimer les avions qui ont atteint leur target
  for (let i = vehicules.length - 1; i >= 0; i--) {
    if (vehicules[i].target !== undefined) {
      let distance = vehicules[i].pos.dist(vehicules[i].target);
      if (distance < 20) {
        vehicules.splice(i, 1);
      }
    }
  }
}

// function mousePressed() {
//   // TODO : ajouter un obstacle de taille aléatoire à la position de la souris
//   obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), "green"));
// }

// Crée un avion sur un bord aléatoire et lui assigne une target sur un autre bord aléatoire
function creerAvionBordure() {
  let x, y;
  let bord = floor(random(4)); // 0:haut, 1:bas, 2:gauche, 3:droite

  /* Position de création */
  if (bord === 0) {
    // Bord haut
    x = random(0, width);
    y = 0;
  } else if (bord === 1) {
    // Bord bas
    x = random(0, width);
    y = height;
  } else if (bord === 2) {
    // Bord gauche
    x = 0;
    y = random(0, height);
  } else {
    // Bord droit
    x = width;
    y = random(0, height);
  }

  /* Target sur un bord aléatoire */
  let targetX, targetY;
  let bordTarget = floor(random(4));

  if (bordTarget === 0) {
    // Bord haut
    targetX = random(0, width);
    targetY = 0;
  } else if (bordTarget === 1) {
    // Bord bas
    targetX = random(0, width);
    targetY = height;
  } else if (bordTarget === 2) {
    // Bord gauche
    targetX = 0;
    targetY = random(0, height);
  } else {
    // Bord droit
    targetX = width;
    targetY = random(0, height);
  }

  return new Avion(x, y, avionImg, random(10, 100), targetX, targetY);
}

function keyPressed() {
  if (key == "v") {
    vehicules.push(creerAvionBordure());
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