let pursuer1;
let target;
let obstacles = [];
let vehicules = [];
let entities = [];
let nbAvionsSlider;

let avionImg;
let essenceImg;

function preload() {
  avionImg = loadImage('assets/mode-avion.png');
  essenceImg = loadImage('assets/station-essence.png');
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  nbAvionsSlider = creerUnSlider("Nombre avions", vehicules, 0, 20, 1, 1, 20, 20, "nbAvionsSlider");
  maxaltitudeAvionDefault = creerUnSlider("Altitude max", vehicules, 0, 100, 50, 1, 20, 40, "altitude");
  maxCarburantDefault = creerUnSlider("Carburant max", vehicules, 10, 100, 100, 10, 20, 60, "maxCarburant");


  // pursuer1 = new Avion(100, 100, avionImg, 20);
  // vehicules.push(pursuer1);

  // Créer 3 aéroports aléatoires
  for (let i = 0; i < 3; i++) {
    let airport = new Airport(random(width), random(height));
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

  // Compter seulement les avions (avec carburant)
  let nbAvions = vehicules.filter(v => v.carburant !== undefined).length;

  // Créer des avions si nécessaire
  while (nbAvions < nbAvionsSlider.value()) {
    vehicules.push(creerAvionBordure());
    nbAvions++;
  }

  // Supprimer des avions aléatoirement si le slider diminue
  while (nbAvions > nbAvionsSlider.value()) {
    let indexAvions = [];
    for (let i = 0; i < vehicules.length; i++) {
      if (vehicules[i].carburant !== undefined) {
        indexAvions.push(i);
      }
    }
    if (indexAvions.length > 0) {
      let indexAleatoire = indexAvions[floor(random(indexAvions.length))];
      vehicules.splice(indexAleatoire, 1);
      nbAvions--;
    } else {
      break;
    }
  }

  if (vehicules.length != 0) {
    vehicules.forEach(vehicule => {
      // Traiter seulement les avions (qui ont carburant et target)
      if (vehicule.carburant !== undefined && vehicule.target !== undefined && vehicule) {
        vehicule.carburant -= 0.05; // Consommation de carburant à chaque frame
        if (vehicule.carburant < 30) {
          vehicule.maxSpeed = map(vehicule.carburant, 0, 30, 0, 8); // Réduire la vitesse à mesure que le carburant diminue
        }
      }

      // Appliquer les comportements si la target existe
      if (vehicule.target !== undefined) {
        vehicule.applyBehaviors(vehicule.target, obstacles, vehicules);
      }

      // déplacement et dessin du véhicule et de la target
      vehicule.update();
      vehicule.show();
    });
  }

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

  return new Avion(x, y, avionImg, random(10, maxaltitudeAvionDefault.value()), targetX, targetY, random(20, maxCarburantDefault.value()));
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

function creerUnSlider(label, tabVehicules, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);

  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 120, posY + 15);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY + 17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    tabVehicules.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });

  return slider;
}