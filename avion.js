class Avion extends Vehicle {
    constructor(x, y, img, altitude, targetX, targetY, carburant = 100) {
        super(x, y);
        // Propriétés spécifiques à l'avion (différences avec Vehicle original)
        this.img = img;
        this.alt = altitude;
        this.carburant = carburant; // pourcentage de carburant
        // Target de l'avion définie à sa création
        this.target = createVector(targetX, targetY);
    }

    // Override: la vitesse dépend de l'altitude
    applyBehaviors(target, obstacles, vehicules) {
        // Ajuster maxSpeed selon l'altitude : de 1 (altitude 0) à 8 (altitude 100)
        this.maxSpeed = map(this.alt, 0, 100, 1, 4);

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

        // Clignotement si carburant < 20%
        let opacite = 255;
        if (this.carburant < 20) {
            // Clignote tous les 20 frames
            opacite = (frameCount % 30) < 10 ? 255 : 0;
        }

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
        let tailleX = map(this.alt, 0, 100, 0.2, 1);
        let tailleY = map(this.alt, 0, 100, 0.2, 1);

        // Affiche l'image si disponible, sinon affiche le triangle
        if (this.img) {
            // Affiche l'image centrée
            imageMode(CENTER);
            push()
            scale(tailleX / 2, tailleY / 2);

            tint(0, 0, 0, 255); // Ombre toujours visible
            image(this.img, 0 + offsetX, 0 + offsetY, this.r_pourDessin * 2, this.r_pourDessin * 2);

            pop();

            push();
            scale(tailleX, tailleY); // taille avion base
            tint(255, 255, 255, 255); // Avion toujours visible
            image(this.img, 0, 0, this.r_pourDessin * 2, this.r_pourDessin * 2);

            pop();
            imageMode(CORNER);
        } else {
            // Dessin d'un véhicule sous la forme d'un triangle
            if (opacite > 0) {
                triangle(-this.r_pourDessin, -this.r_pourDessin / 2, -this.r_pourDessin, this.r_pourDessin / 2, this.r_pourDessin, 0);
            }
        }

        pop();
        imageMode(CORNER);

        // Petite icône clignotante en haut à droite si carburant bas (orientée vers le haut, comme le texte)
        if (this.carburant < 20 && opacite > 0) {
            if (typeof essenceImg !== 'undefined') {
                push();
                tint(255, 255, 255, opacite);
                imageMode(CENTER);
                image(essenceImg, this.pos.x + 20, this.pos.y - this.r_pourDessin - 15, 15, 15);
                pop();
            }
        }

        // cercle pour le debug
        if (Vehicle.debug) {
            stroke(255);
            noFill();
            circle(0, 0, this.r);
        }

        // Afficher le texte au-dessus du véhicule (non affecté par la rotation)
        if (Vehicle.debug) {
            push();
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(12);
            textStyle(NORMAL);
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
