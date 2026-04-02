class Avion extends Vehicle {
    constructor(x, y, img, altitude, targetX, targetY) {
        super(x, y);
        // Propriétés spécifiques à l'avion (différences avec Vehicle original)
        this.img = img;
        this.alt = altitude;
        this.carburant = 100; // pourcentage de carburant
        // Target de l'avion définie à sa création
        this.target = createVector(targetX, targetY);
    }

    // Override: la vitesse dépend de l'altitude
    applyBehaviors(target, obstacles, vehicules) {
        // Ajuster maxSpeed selon l'altitude : de 1 (altitude 0) à 8 (altitude 100)
        this.maxSpeed = map(this.alt, 0, 100, 1, 8);
        
        // Appeler la méthode parent avec la nouvelle maxSpeed
        super.applyBehaviors(target, obstacles, vehicules);
    }

    // Override: dessiner l'avion avec image et altitude
    drawVehicle() {
        // formes fil de fer en blanc
        stroke(255);
        // épaisseur du trait = 2
        strokeWeight(2);

        // formes pleines
        fill(this.color);

        // sauvegarde du contexte graphique (couleur pleine, fil de fer, épaisseur du trait,
        // position et rotation du repère de référence)
        push();
        // on déplace le repère de référence.
        translate(this.pos.x, this.pos.y);
        // et on le tourne. atan2 gère correctement tous les cas (y compris quand vel = 0)
        rotate(atan2(this.vel.y, this.vel.x) + PI / 2);

        let offsetX = 30;
        let offsetY = 30;

        // La taille augmente progressivement avec l'altitude : 0 à altitude 0, 1 à altitude 100
        let tailleX = map(this.alt, 0, 100, 0, 1);
        let tailleY = map(this.alt, 0, 100, 0, 1);

        // Affiche l'image si disponible, sinon affiche le triangle
        if (this.img) {
            // Affiche l'image centrée
            imageMode(CENTER);
            push()
            scale(tailleX / 2, tailleY / 2);

            tint(0, 0, 0, 150); // Applique une teinte noire avec une certaine transparence
            image(this.img, 0 + offsetX, 0 + offsetY, this.r_pourDessin * 2, this.r_pourDessin * 2);

            pop();

            push();
            scale(tailleX, tailleY); // taille avion base
            image(this.img, 0, 0, this.r_pourDessin * 2, this.r_pourDessin * 2);
            pop();
            imageMode(CORNER);
        } else {
            // Dessin d'un véhicule sous la forme d'un triangle
            triangle(-this.r_pourDessin, -this.r_pourDessin / 2, -this.r_pourDessin, this.r_pourDessin / 2, this.r_pourDessin, 0);
        }

        // cercle pour le debug
        if (Vehicle.debug) {
            stroke(255);
            noFill();
            circle(0, 0, this.r);
        }

        pop();

        // Afficher le texte au-dessus du véhicule (non affecté par la rotation)
        if (Vehicle.debug) {
            push();
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(10);
            text("Alt: " + this.alt.toFixed(0), this.pos.x, this.pos.y - this.r_pourDessin - 15);
            // afficher le carburant
            text("Carburant: " + this.carburant.toFixed(0) + "%", this.pos.x, this.pos.y - this.r_pourDessin);
            pop();
        }

        if (Vehicle.debug) {
            // Afficher la target de l'avion
            push();
            stroke(0, 255, 0);
            noFill();
            circle(this.target.x, this.target.y, 10);
            pop();
        }

        // Cercle pour évitement entre vehicules et obstacles
        if (Vehicle.debug) {
            stroke(255);
            noFill();
            circle(this.pos.x, this.pos.y, this.r);
        }
    }
}
