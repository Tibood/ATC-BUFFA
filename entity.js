class Entity extends Vehicle {
    constructor(x, y, img) {
        super(x, y, img);
        // Désactiver tout comportement de steering pour une entité fixe
        this.maxForce = 0;
        this.maxSpeed = 0;
        // Direction aléatoire
        this.alt = 0
        this.angle = random(TWO_PI);
    }

    // Pas de comportements autonomes - l'entité est statique
    applyBehaviors() {
        // Pas de forces appliquées
    }

    // Dessiner l'image sans rotation (position fixe)
    drawVehicle() {
        push();
        translate(this.pos.x, this.pos.y);
        // Rotation aléatoire
        rotate(this.angle);

        // if (this.img) {
        //     imageMode(CENTER);
        //     image(this.img, 0, 0, this.r_pourDessin * 2, this.r_pourDessin * 2);
        //     imageMode(CORNER);
        // }

        // Rectangle sous l'image
        stroke(0);
        strokeWeight(1);
        rect(-this.r_pourDessin, this.r_pourDessin, this.r_pourDessin * 4, 1);

        pop();
    }
}