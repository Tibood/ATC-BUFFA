class Nuage extends Vehicle {
    constructor(x, y, direction, img) {
        super(x, y);
        // Direction constante du vent (p5.Vector)
        this.windDirection = direction.copy().normalize();
        // Vitesse lente pour un nuage
        this.maxSpeed = random(0.5, 1.5);
        this.maxForce = 0.05;
        // Taille aléatoire du nuage
        this.taille = random(100, 220);
        // Altitude haute (au-dessus des avions visuellement)
        this.alt = 200;
        // Image du nuage
        this.img = img;
        // Pas de path pour les nuages
        this.pathMaxLength = 0;
    }

    applyBehaviors() {
        // Le nuage suit toujours la même direction (vent)
        let desired = this.windDirection.copy().mult(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        this.applyForce(steer);
    }

    show() {
        push();
        imageMode(CENTER);
        image(this.img, this.pos.x, this.pos.y, this.taille, this.taille * (this.img.height / this.img.width));
        pop();
    }
}
