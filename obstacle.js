class Obstacle {
  constructor(x, y, r, couleur, altitude) {
    this.pos = createVector(x, y);
    this.r = r;
    this.color = couleur;
    this.alt = altitude; // altitude de l'obstacle
  }

  show() {
    push();

    // Remplir le cercle en rouge
    noFill();

    stroke(255, 0, 0);
    strokeWeight(6);
    circle(this.pos.x, this.pos.y, this.r * 2);

    // Ajouter les hachures (lignes diagonales limitées au cercle)
    stroke(255, 0, 0);
    strokeWeight(2);
    let spacing = 15;

    // Dessiner seulement les hachures qui restent dans le cercle
    for (let i = -this.r * 3; i < this.r * 3; i += spacing) {
      // Parcourir les points de la ligne
      let points = [];
      for (let j = -this.r * 2; j <= this.r * 2; j += 2) {
        let x = this.pos.x + i + j / 2;
        let y = this.pos.y + j;
        // Vérifier si le point est dans le cercle
        let dist = sqrt(pow(x - this.pos.x, 2) + pow(y - this.pos.y, 2));
        if (dist <= this.r) {
          points.push({ x, y });
        }
      }
      // Dessiner les segments de la ligne qui sont dans le cercle
      for (let k = 0; k < points.length - 1; k++) {
        line(points[k].x, points[k].y, points[k + 1].x, points[k + 1].y);
      }
    }

    pop();

    // Redessiner le contour du cercle et le centre
    push();
    noFill();
    stroke(255, 0, 0);
    strokeWeight(6);
    circle(this.pos.x, this.pos.y, this.r * 2);

    fill(0);
    noStroke();
    circle(this.pos.x, this.pos.y, 10);
    pop();
  }
}