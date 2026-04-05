let pursuer1;
let target;
let obstacles = [];
let vehicules = [];
let entities = [];
let nuages = [];
let nbAvionsSlider;
let nbNuagesSlider;
let windDirection;

let avionImg;
let essenceImg;
let nuageImgs = [];

function preload() {
  avionImg = loadImage('assets/mode-avion.png');
  essenceImg = loadImage('assets/station-essence.png');
  nuageImgs.push(loadImage('assets/nuages/nuage1.svg'));
  nuageImgs.push(loadImage('assets/nuages/nuage2.svg'));
  nuageImgs.push(loadImage('assets/nuages/nuage3.svg'));
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  nbAvionsSlider = creerUnSlider("Nombre avions", vehicules, 0, 20, 1, 1, 20, 20, "nbAvionsSlider");
  maxaltitudeAvionDefault = creerUnSlider("Altitude max", vehicules, 0, 100, 50, 1, 20, 40, "altitude");
  maxCarburantDefault = creerUnSlider("Carburant max", vehicules, 10, 100, 100, 10, 20, 60, "maxCarburant");
  nbNuagesSlider = creerUnSlider("Nombre nuages", nuages, 0, 30, 5, 1, 20, 80, "nbNuagesSlider");


  // pursuer1 = new Avion(100, 100, avionImg, 20);
  // vehicules.push(pursuer1);

  // Créer 3 aéroports aléatoires (avec marge pour éviter le centre et les bords)
  for (let i = 0; i < 3; i++) {
    let margin = 150;
    let x, y;
    // Éviter le centre de l'écran (zone 40%-60%)
    do {
      x = random(margin, width - margin);
      y = random(margin, height - margin);
    } while (x > width * 0.35 && x < width * 0.65 && y > height * 0.35 && y < height * 0.65);
    let airport = new Airport(x, y);
    vehicules.push(airport);
    entities.push(airport);
  }

  // On cree un obstace au milieu de l'écran
  obstacles.push(new Obstacle(width / 2, height / 2, 50, "red", 0));

  // Direction du vent aléatoire (change à chaque refresh)
  let angle = random(TWO_PI);
  windDirection = createVector(cos(angle), sin(angle));

  // Créer quelques nuages initiaux
  for (let i = 0; i < 5; i++) {
    nuages.push(creerNuage());
  }
}

function draw() {
  // changer le dernier param (< 100) pour effets de trainée
  background(4, 214, 255, 255);

  // dessin des obstacles
  obstacles.forEach(obstacle => {
    obstacle.show();
  })

  // Spawn aléatoire de nuages (environ 1 toutes les 2-3 secondes à 60fps)
  // Spawn de nuages si en dessous du slider
  if (nuages.length < nbNuagesSlider.value() && random() < 0.05) {
    nuages.push(creerNuage());
  }

  // Supprimer des nuages si au-dessus du slider
  while (nuages.length > nbNuagesSlider.value()) {
    nuages.splice(0, 1);
  }

  // Mise à jour des nuages (sans affichage, rendu après les véhicules)
  for (let i = nuages.length - 1; i >= 0; i--) {
    let n = nuages[i];
    n.applyBehaviors();
    n.update();

    // Supprimer les nuages sortis de l'écran (avec marge)
    if (n.pos.x > width + 200 || n.pos.x < -200 || n.pos.y > height + 200 || n.pos.y < -200) {
      nuages.splice(i, 1);
    }
  }

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
        vehicule.carburant -= 0.02; // Consommation de carburant à chaque frame
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

  // Affichage des nuages au-dessus des pistes et des avions
  for (let n of nuages) {
    n.show();
  }

  // Supprimer les avions qui ont atteint leur target OU qui ont atterri
  for (let i = vehicules.length - 1; i >= 0; i--) {
    let vehicule = vehicules[i];

    // Cas 1: Avion a atteint sa destination normale
    if (vehicule.target !== undefined && vehicule.carburant !== undefined) {
      let distance = vehicule.pos.dist(vehicule.target);
      if (distance < 20) {
        vehicules.splice(i, 1);
        continue;
      }
    }

    // Cas 2: Avion a atterri et atteint le bout de la piste
    if (vehicule.isLanding !== undefined && vehicule.isLanding && vehicule.alt === 0) {
      // L'avion doit atteindre le bout du chemin sélectionné pour disparaître
      if (vehicule.selectedLandingPath) {
        let lastPoint = vehicule.selectedLandingPath.points[vehicule.selectedLandingPath.points.length - 1];
        let distanceRunwayEnd = vehicule.pos.dist(lastPoint);
        if (distanceRunwayEnd < 40) {
          vehicules.splice(i, 1);
          continue;
        }
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

  /* Target sur le bord opposé */
  let targetX, targetY;
  let bordTarget;

  // 0:haut ↔ 1:bas, 2:gauche ↔ 3:droite
  if (bord === 0) bordTarget = 1;
  else if (bord === 1) bordTarget = 0;
  else if (bord === 2) bordTarget = 3;
  else bordTarget = 2;

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
    obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), "green"));
  }
}

// Crée un nuage sur le bord opposé à la direction du vent
function creerNuage() {
  let x, y;

  // Spawn sur le bord opposé à la direction du vent
  if (windDirection.x > 0) {
    x = random(-200, -50);
  } else {
    x = random(width + 50, width + 200);
  }
  if (windDirection.y > 0) {
    y = random(-200, -50);
  } else {
    y = random(height + 50, height + 200);
  }

  return new Nuage(x, y, windDirection, random(nuageImgs));
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