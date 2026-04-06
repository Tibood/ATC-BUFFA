class Airport {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        // Direction aléatoire
        this.alt = 0;
        this.angle = random(TWO_PI);

        // === Direction 1 : approche par le côté négatif ===
        // Waypoints d'approche côté 1
        this.approachWaypoint1 = this.calculateWaypoint(-100);
        this.approachWaypoint2 = this.calculateWaypoint(-30);
        // Début de la piste (la ligne va de -15 à +50)
        this.runwayStart = this.calculateWaypoint(-15);
        // Bout de la piste
        this.runwayEnd = this.calculateWaypoint(50);

        // === Direction 2 : approche par le côté positif (opposé) ===
        // Waypoints d'approche côté 2 (de l'autre côté de la piste)
        this.approachWaypoint1_reverse = this.calculateWaypoint(150);
        this.approachWaypoint2_reverse = this.calculateWaypoint(80);

        // Créer les chemins d'atterrissage dans les deux directions
        this.landingPathDir1 = new LandingPath(this, false); // Direction normale
        this.landingPathDir2 = new LandingPath(this, true);  // Direction inverse
    }

    // Calculer la position d'un waypoint sur la piste
    // distance : position le long de la ligne (0, -15, 0, 50)
    calculateWaypoint(distance) {
        // La piste est une ligne verticale de -15 à 50 dans le repère local
        // Elle pointe à angle + PI/2 après rotation
        let runwayAngle = this.angle + PI / 2;

        // Position du point sur la piste
        let x = this.pos.x + distance * Math.cos(runwayAngle);
        let y = this.pos.y + distance * Math.sin(runwayAngle);

        return createVector(x, y);
    }

    // Pas de comportements autonomes - l'entité est statique
    applyBehaviors() {
        // Pas de forces appliquées
    }

    // Update (statique - ne fait rien)
    update() {
        // L'aéroport ne bouge pas
    }

    // Affichage
    show() {
        this.drawVehicle();
    }

    // Dessiner l'aéroport
    drawVehicle() {

        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);

        stroke(0);
        strokeWeight(2);

        // Cercle vert plein autour de la piste
        fill(0, 200, 0);
        stroke(0, 200, 0);
        strokeWeight(2);
        circle(0, 17.5, 200);

        // Croix au centre
        stroke(0);
        strokeWeight(2);
        line(0, -15, 0, 50);

        pop();

        // Afficher les couloirs d'approche (deux directions)
        this.landingPathDir1.display();
        this.landingPathDir2.display();

        // Afficher les waypoints quand le debug est actif
        if (Vehicle.debug) {
            // === Direction 1 (orange/rose) ===
            // Waypoint 1 Dir1
            push();
            fill(255, 150, 0);
            stroke(255, 150, 0);
            strokeWeight(2);
            circle(this.approachWaypoint1.x, this.approachWaypoint1.y, 10);
            pop();

            // Waypoint 2 Dir1
            push();
            fill(255, 0, 150);
            stroke(255, 0, 150);
            strokeWeight(2);
            circle(this.approachWaypoint2.x, this.approachWaypoint2.y, 10);
            pop();

            // === Direction 2 (jaune/cyan) ===
            // Waypoint 1 Dir2
            push();
            fill(255, 255, 0);
            stroke(255, 255, 0);
            strokeWeight(2);
            circle(this.approachWaypoint1_reverse.x, this.approachWaypoint1_reverse.y, 10);
            pop();

            // Waypoint 2 Dir2
            push();
            fill(0, 255, 255);
            stroke(0, 255, 255);
            strokeWeight(2);
            circle(this.approachWaypoint2_reverse.x, this.approachWaypoint2_reverse.y, 10);
            pop();

            // Début et fin de piste
            push();
            fill(0, 255, 0);
            stroke(0, 255, 0);
            strokeWeight(2);
            circle(this.runwayStart.x, this.runwayStart.y, 12);
            circle(this.runwayEnd.x, this.runwayEnd.y, 12);
            textAlign(CENTER, CENTER);
            textSize(10);
            text("S", this.runwayStart.x, this.runwayStart.y);
            text("E", this.runwayEnd.x, this.runwayEnd.y);
            pop();
        }
    }
}