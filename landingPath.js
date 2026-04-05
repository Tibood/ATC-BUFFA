/*
  Calcule la projection orthogonale du point p sur le segment (a-b)
*/
function findProjectionOnPath(p, a, b) {
    let ap = p5.Vector.sub(p, a);
    let ab = p5.Vector.sub(b, a);
    ab.normalize();
    ab.mult(ap.dot(ab));
    let normalPoint = p5.Vector.add(a, ab);
    return normalPoint;
}

class LandingPath {
    constructor(airport, reverse = false) {
        // Rayon du couloir d'approche (±50 pixels de chaque côté)
        this.radius = 50;
        this.reverse = reverse;

        // Points du chemin d'atterrissage
        if (!reverse) {
            // Direction 1 : approche par le côté négatif → vers runwayEnd
            this.points = [
                airport.approachWaypoint1,  // Approche lointaine (-100)
                airport.approachWaypoint2,  // Approche finale (-30)
                airport.runwayStart,        // Début de la piste (-15)
                airport.runwayEnd           // Fin de la piste (+50)
            ];
        } else {
            // Direction 2 : approche par le côté positif → vers runwayStart
            this.points = [
                airport.approachWaypoint1_reverse,  // Approche lointaine (+150)
                airport.approachWaypoint2_reverse,  // Approche finale (+80)
                airport.runwayEnd,                  // Entrée piste (+50)
                airport.runwayStart                 // Fin de la piste (-15)
            ];
        }

        this.airport = airport;
    }

    // Afficher le couloir d'approche en debug
    display() {
        if (!Vehicle.debug) return;

        // Dessiner le couloir
        stroke(100, 200, 255, 80);
        strokeWeight(this.radius * 2);
        noFill();
        beginShape();
        for (let p of this.points) {
            vertex(p.x, p.y);
        }
        endShape();

        // Dessiner la ligne centrale
        stroke(100, 200, 255, 200);
        strokeWeight(1);
        noFill();
        beginShape();
        for (let p of this.points) {
            vertex(p.x, p.y);
        }
        endShape();
    }

    // Comportement de suivi du chemin (inspiré de Craig Reynolds)
    follow(vehicle) {
        // Prédire la position future du véhicule (25 frames à l'avance)
        let predict = vehicle.vel.copy();
        predict.normalize();
        predict.mult(25);
        let predictPos = p5.Vector.add(vehicle.pos, predict);

        let normal = null;
        let target = null;
        let worldRecord = 1000000; // Distance max

        // Trouver le segment le plus proche
        for (let i = 0; i < this.points.length - 1; i++) {
            let a = this.points[i];
            let b = this.points[i + 1];

            // Projeter le point prédit sur le segment
            let normalPoint = findProjectionOnPath(predictPos, a, b);

            // Vérifier si le point projeté est dans les limites du segment
            if (
                normalPoint.x < min(a.x, b.x) ||
                normalPoint.x > max(a.x, b.x) ||
                normalPoint.y < min(a.y, b.y) ||
                normalPoint.y > max(a.y, b.y)
            ) {
                normalPoint = b.copy();
            }

            // Distance entre la position prédite et le point projeté
            let d = p5.Vector.dist(predictPos, normalPoint);

            if (d < worldRecord) {
                worldRecord = d;
                normal = normalPoint;

                // Regarder plus loin sur le segment
                let dir = p5.Vector.sub(b, a);
                dir.normalize();
                dir.mult(30);
                target = normal.copy();
                target.add(dir);
            }
        }

        // Debug: dessiner les éléments de suivi
        if (Vehicle.debug) {
            // Position prédite
            push();
            stroke(0);
            fill(0);
            circle(predictPos.x, predictPos.y, 6);
            line(vehicle.pos.x, vehicle.pos.y, predictPos.x, predictPos.y);
            pop();

            // Point projeté
            if (normal) {
                push();
                stroke(100, 200, 255);
                fill(100, 200, 255);
                circle(normal.x, normal.y, 6);
                pop();
            }

            // Cible
            if (target) {
                push();
                if (worldRecord > this.radius) {
                    fill(255, 0, 0);
                } else {
                    fill(0, 255, 0);
                }
                noStroke();
                circle(target.x, target.y, 8);
                pop();
            }
        }

        // Si trop loin du couloir, chercher à y revenir
        if (worldRecord > this.radius && target) {
            return vehicle.seek(target);
        } else {
            return createVector(0, 0);
        }
    }
}
