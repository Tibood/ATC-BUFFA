class Airport {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        // Direction aléatoire
        this.alt = 0;
        this.angle = random(TWO_PI);
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

        // Croix au centre
        line(0, -15, 0, 50);

        pop();
    }
}