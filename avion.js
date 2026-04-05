class Avion extends Vehicle {
    constructor(x, y, img, altitude, targetX, targetY, carburant = 100) {
        super(x, y);
        // Propriétés spécifiques à l'avion (différences avec Vehicle original)
        this.img = img;
        this.alt = altitude;
        this.carburant = carburant; // pourcentage de carburant
        // Target de l'avion définie à sa création
        this.target = createVector(targetX, targetY);
        // État d'atterrissage
        this.isLanding = false;
        this.landingAirport = null;
        this.landingPhase = "normal"; // "normal", "approach1", "approach2", "landing"
        this.selectedLandingPath = null; // Le chemin choisi (Dir1 ou Dir2)
    }

    // Vérifier si un aéroport est bloqué par un obstacle
    isAirportBlocked(airport, obstacles) {
        for (let obstacle of obstacles) {
            let dist = airport.pos.dist(obstacle.pos);
            if (dist < obstacle.r) {
                return true;
            }
        }
        return false;
    }

    // Trouver l'aéroport le plus proche parmi tous les véhicules (sans obstacle dessus)
    findClosestAirport(airports) {
        let closestAirport = null;
        let closestDistance = Infinity;

        for (let airport of airports) {
            // Vérifier que c'est un Airport (a un angle et pas de carburant)
            if (airport.carburant === undefined && airport.angle !== undefined) {
                // Vérifier qu'il n'y a pas d'obstacle sur l'aéroport
                if (this.isAirportBlocked(airport, obstacles)) continue;

                let distance = this.pos.dist(airport.pos);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestAirport = airport;
                }
            }
        }
        return closestAirport;
    }

    // Choisir le meilleur chemin d'atterrissage (celui qui demande le moins de rotation)
    chooseBestLandingPath(airport) {
        // Direction du premier waypoint de chaque chemin
        let dir1 = p5.Vector.sub(airport.landingPathDir1.points[0], this.pos);
        let dir2 = p5.Vector.sub(airport.landingPathDir2.points[0], this.pos);

        // Angle entre la vélocité courante et chaque direction
        let angle1 = abs(this.vel.heading() - dir1.heading());
        let angle2 = abs(this.vel.heading() - dir2.heading());

        // Normaliser les angles entre 0 et PI
        angle1 = angle1 > PI ? TWO_PI - angle1 : angle1;
        angle2 = angle2 > PI ? TWO_PI - angle2 : angle2;

        // Choisir le chemin qui demande le moins de rotation
        return angle1 < angle2 ? airport.landingPathDir1 : airport.landingPathDir2;
    }

    // Behavior: S'aligner avec l'orientation du chemin d'atterrissage
    alignWithPath(path) {
        // Trouver le segment le plus proche du chemin
        let predictPos = this.pos.copy().add(this.vel.copy().mult(10));

        let closestSegment = null;
        let closestDist = Infinity;

        for (let i = 0; i < path.points.length - 1; i++) {
            let a = path.points[i];
            let b = path.points[i + 1];

            // Distance du point prédit au segment
            let segmentDist = this.distPointToSegment(predictPos, a, b);

            if (segmentDist < closestDist) {
                closestDist = segmentDist;
                closestSegment = { a: a, b: b };
            }
        }

        if (!closestSegment) return createVector(0, 0);

        // Direction du segment
        let pathDirection = p5.Vector.sub(closestSegment.b, closestSegment.a);
        pathDirection.normalize();

        // Vitesse désirée dans la direction du chemin
        let desired = pathDirection.copy();
        desired.mult(this.maxSpeed);

        // Steering = desired - velocity
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce * 0.3);

        return steer;
    }

    // Fonction utilitaire pour calculer la distance d'un point à un segment
    distPointToSegment(p, a, b) {
        let ap = p5.Vector.sub(p, a);
        let ab = p5.Vector.sub(b, a);
        let t = ap.dot(ab) / ab.magSq();
        t = constrain(t, 0, 1);

        let closest = a.copy().add(ab.mult(t));
        return p.dist(closest);
    }

    // Behavior: Atterrir (réduire l'altitude graduellement)
    landingBehavior(airport) {
        let distanceAirport = this.pos.dist(airport.pos);

        // Distance de descente : commencer à descendre seulement très près de l'aéroport
        let descendDistance = 100;

        // Utiliser les waypoints du chemin sélectionné
        let wp1 = this.selectedLandingPath.points[0]; // Premier waypoint d'approche
        let wp2 = this.selectedLandingPath.points[1]; // Deuxième waypoint d'approche

        // Gestion des phases d'atterrissage
        if (this.landingPhase === "approach1") {
            let distWaypoint1 = this.pos.dist(wp1);
            if (distWaypoint1 < 20) {
                this.landingPhase = "approach2";
            }
        } else if (this.landingPhase === "approach2") {
            let distWaypoint2 = this.pos.dist(wp2);
            if (distWaypoint2 < 20) {
                this.landingPhase = "landing";
            }
        }

        // Réduire l'altitude progressivement et plus rapidement
        if (this.landingPhase === "landing" && distanceAirport < descendDistance) {
            this.alt -= 3;
            this.alt = max(0, this.alt);
        }

        return createVector(0, 0);
    }

    // Séparation uniquement entre avions à altitude similaire
    separateSameAltitude(vehicules, altitudeThreshold = 15) {
        let desiredSeparation = this.r * 2;
        let steer = createVector(0, 0);
        let count = 0;

        for (let other of vehicules) {
            if (other === this) continue;
            if (!(other instanceof Avion)) continue;

            // Ne séparer que si altitudes proches
            let altDiff = abs(this.alt - other.alt);
            if (altDiff > altitudeThreshold) continue;

            let d = this.pos.dist(other.pos);
            if (d > 0 && d < desiredSeparation) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steer.div(count);
        }

        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    // Override: la vitesse dépend de l'altitude
    applyBehaviors(target, obstacles, vehicules) {
        // Ajuster maxSpeed selon l'altitude : de 1 (altitude 0) à 8 (altitude 100)
        this.maxSpeed = map(this.alt, 0, 100, 1, 4);

        // Vérifier si l'avion doit atterrir (carburant très bas)
        if (this.carburant < 30 && !this.isLanding) {
            this.isLanding = true;
            this.landingAirport = this.findClosestAirport(vehicules);
            this.selectedLandingPath = this.chooseBestLandingPath(this.landingAirport);
            this.landingPhase = "approach1"; // Commencer par l'approche lointaine
        }

        if (this.isLanding && this.landingAirport && this.selectedLandingPath) {
            let landForce = this.landingBehavior(this.landingAirport);
            this.applyForce(landForce);

            // Séparation entre avions à même altitude (aussi pendant l'atterrissage)
            let separateForce = this.separateSameAltitude(vehicules);
            separateForce.mult(1.5);
            this.applyForce(separateForce);

            if (this.landingPhase === "approach1") {
                // Phase 1 : Aller vers le premier waypoint (orange ou jaune)
                let wp1 = this.selectedLandingPath.points[0];
                let seekForce = this.arrive(wp1);
                seekForce.mult(0.4);
                this.applyForce(seekForce);
            } else if (this.landingPhase === "approach2") {
                // Phase 2 : Aller vers le deuxième waypoint en s'alignant face à la piste
                let wp1 = this.selectedLandingPath.points[0];
                let wp2 = this.selectedLandingPath.points[1];
                let seekForce = this.seek(wp2);

                // S'aligner avec la direction wp1 → wp2 (face à la piste)
                let pathDir = p5.Vector.sub(wp2, wp1);
                pathDir.normalize();
                let desired = pathDir.mult(this.maxSpeed);
                let alignForce = p5.Vector.sub(desired, this.vel);
                alignForce.limit(this.maxForce * 0.5);

                seekForce.mult(0.3);
                alignForce.mult(0.4);
                this.applyForce(seekForce);
                this.applyForce(alignForce);
            } else {
                // Phase landing : Suivre le chemin + alignement + seek fin de piste
                let pathFollowForce = this.selectedLandingPath.follow(this);
                let alignForce = this.alignWithPath(this.selectedLandingPath);
                let lastPoint = this.selectedLandingPath.points[this.selectedLandingPath.points.length - 1];
                let seekEndForce = this.seek(lastPoint);

                pathFollowForce.mult(0.3);
                alignForce.mult(0.4);
                seekEndForce.mult(0.2);

                this.applyForce(pathFollowForce);
                this.applyForce(alignForce);
                this.applyForce(seekEndForce);
            }
        } else {
            // Comportements normaux
            let seekForce = this.arrive(target);
            let avoidForce = this.avoid(obstacles);
            let separateForce = this.separate(vehicules);
            let boudariesForce = this.boundaries();

            let altSeparateForce = this.separateSameAltitude(vehicules);

            seekForce.mult(0.2);
            avoidForce.mult(3);
            altSeparateForce.mult(1.5);
            boudariesForce.mult(3);

            this.applyForce(seekForce);
            this.applyForce(avoidForce);
            this.applyForce(altSeparateForce);
        }
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

        // La taille augmente progressivement avec l'altitude : 0.3 à altitude 0, 1 à altitude 100
        let tailleX = map(this.alt, 0, 100, 0.3, 1);
        let tailleY = map(this.alt, 0, 100, 0.3, 1);

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

        if (Vehicle.debug && this.isLanding && this.landingAirport && this.selectedLandingPath) {
            // Afficher une ligne vers le waypoint courant
            push();
            stroke(100, 200, 255);
            strokeWeight(2);

            let currentWp;
            if (this.landingPhase === "approach1") {
                currentWp = this.selectedLandingPath.points[0];
            } else if (this.landingPhase === "approach2") {
                currentWp = this.selectedLandingPath.points[1];
            } else {
                currentWp = this.selectedLandingPath.points[this.selectedLandingPath.points.length - 1];
            }

            // Ligne depuis l'avion vers le waypoint courant
            line(this.pos.x, this.pos.y, currentWp.x, currentWp.y);

            // Cercle sur le waypoint courant
            noFill();
            circle(currentWp.x, currentWp.y, 20);
            pop();

            // Afficher la phase courante et le chemin sélectionné
            push();
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(10);
            let pathStr = this.selectedLandingPath === this.landingAirport.landingPathDir1 ? "Dir1" : "Dir2";
            text(this.landingPhase + " - " + pathStr, this.pos.x, this.pos.y + 30);
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
