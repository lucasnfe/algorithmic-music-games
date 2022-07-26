const FRICTION = -0.5;

class Player extends RigibBody {
  constructor(x, y, mass, size) {
    super(x, y, mass, size);
  }

  draw() {
    this.update();

    // Draw player
    noStroke();
    fill(200);
    circle(this.pos.x, this.pos.y, this.size);

    this.resetAcc();
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) {
      this.applyForce(createVector(-1.0, 0.0));
    }

    if (keyIsDown(RIGHT_ARROW)) {
      this.applyForce(createVector(1.0, 0.0));
    }

    if (keyIsDown(UP_ARROW)) {
      this.applyForce(createVector(0.0, -1.0));
    }

    if (keyIsDown(DOWN_ARROW)) {
      this.applyForce(createVector(0.0, 1.0));
    }

    // Apply friction
    let friction = p5.Vector.normalize(this.vel);
    friction.mult(FRICTION);
    this.applyForce(friction);

    super.update();
  }
}
