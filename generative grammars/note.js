const gravity = 0.98;
const bounceForce = 3.5;

class Note {
  constructor(x, y, pitch, duration, velocity) {
    this.x = x;
    this.y = y;
    this.size = 80;
    this.mass = 1.0;
    this.velocity = 0.9;
    this.color = 0;

    if (duration == '4n') {
        this.symbol = (pitch == null) ? '' : '';
        this.mass = 1.0;
    }
    else if (duration == '8n') {
        this.symbol = (pitch == null) ? '' : '';
        this.mass = 1.2;
    }

    if (velocity == 'l') {
      this.color = 75;
      this.velocity = 0.4;
      this.size = 60;
    }
    else if (duration == 'm') {
      this.color = 50;
      this.velocity = 0.7;
      this.size = 70;
    }
    else if (duration == 'h') {
      this.color = 0;
      this.velocity = 0.9;
      this.size = 80;
    }

    this.pitch = pitch;
    this.duration = duration;

    this.velY = 0;
    this.accY = 0;
    this.isBouncing = false;
    this.isBouncingBack = false;
  }

  isRest() {
    return this.pitch == null;
  }

  bounce() {
    this.isBouncing = true;
    this.applyForce(bounceForce);
  }

  applyForce(fY) {
    this.accY += fY/this.mass;
  }

  draw() {
    if (this.isBouncing) {
      let gDir = (height/2 > this.y) ? 1.0 : -1.0;
      let dist = Math.abs(height/2 - this.y);

      if (gDir > 0) {
        this.isBouncingBack = true;
      }

      if (this.isBouncingBack && gDir < 0 && dist > 0.0) {
            this.y = height/2;

            this.velY = 0;
            this.accY = 0;
            this.isBouncing = false;
            this.isBouncingBack = false;
      }
      else {
        dist = constrain(dist, 5.0, 50.0);
        let g = ((gravity*20*this.mass)/(dist*dist));
        this.applyForce(g * gDir);

        this.velY += this.accY;
        this.y += this.velY;

        this.accY = 0;
      }
    }

    textSize(this.size);
    textAlign(CENTER);
    // fill(this.color);
    text(this.symbol, this.x, this.y);
  }
}
