const VEL_UPPER_LIMIT = 5.0;
const VEL_LOWER_LIMIT = 0.1;
const COL_THRESHOLD = 0.01;

class RigibBody {
  constructor(x, y, mass, size) {
    this.pos = createVector(x, y);
    this.acc = createVector();
    this.vel = createVector();
    this.size = size;
    this.mass = 1.0;
  }

  getVelDir() {
    let dir = createVector();
    if (this.vel.x > .0) {
      dir.x = 1.0;
    }
    else if (this.vel.x < .0) {
      dir.x = -1.0;
    }

    if (this.vel.y > .0) {
      dir.y = 1.0;
    }
    else if (this.vel.y < .0)  {
      dir.y = -1.0;
    }

    return dir;
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(VEL_UPPER_LIMIT);

    if (abs(this.vel.x) > .0) {
      this.checkHorizontalCollision();
    }

    if (abs(this.vel.y) > .0) {
      this.checkVerticallCollision();
    }

    this.pos.add(this.vel);
  }

  checkHorizontalCollision() {
    let velDir = this.getVelDir();

    let collistionPointA = this.pos.copy();
    collistionPointA.x += this.size/2 * velDir.x;
    collistionPointA.y -= this.size/2;

    let collistionPointB = this.pos.copy();
    collistionPointB.x += this.size/2 * velDir.x;
    collistionPointB.y += this.size/2;

    collistionPointA.x += this.vel.x;
    collistionPointB.x += this.vel.x;

    let projPointACell = world.pos2Coord(collistionPointA);
    let projPointBCell = world.pos2Coord(collistionPointB);

    if (world.isSolid(projPointACell.x, projPointACell.y) ||
        world.isSolid(projPointBCell.x, projPointBCell.y)) {
          let nextCellPos = world.cell2Pos(projPointACell);

          // Resolve horizontal collision
          if (velDir.x > 0) {
            this.pos.x = nextCellPos.x - world.cellSize/2.0 - this.size/2.0 - 0.01;
            this.vel.x = 0;
          }
          else if (velDir.x < 0) {
            this.pos.x = nextCellPos.x + world.cellSize/2.0 + this.size/2.0 + 0.01;
            this.vel.x = 0;
          }
      }
  }

  checkVerticallCollision() {
    let velDir = this.getVelDir();

    let collistionPointA = this.pos.copy();
    collistionPointA.x += this.size/2;
    collistionPointA.y += this.size/2 * velDir.y;

    let collistionPointB = this.pos.copy();
    collistionPointB.x -= this.size/2;
    collistionPointB.y += this.size/2 * velDir.y;

    collistionPointA.y += this.vel.y;
    collistionPointB.y += this.vel.y;

    let projPointACell = world.pos2Coord(collistionPointA);
    let projPointBCell = world.pos2Coord(collistionPointB);

    if (world.isSolid(projPointACell.x, projPointACell.y) ||
        world.isSolid(projPointBCell.x, projPointBCell.y)) {
          let nextCellPos = world.cell2Pos(projPointACell);

          if (velDir.y > 0) {
            this.pos.y = nextCellPos.y - world.cellSize/2.0  - this.size/2.0 - COL_THRESHOLD;
            this.vel.y = 0;
          }
          else if (velDir.y < 0) {
            this.pos.y = nextCellPos.y + world.cellSize/2.0 + this.size/2.0 + COL_THRESHOLD;
            this.vel.y = 0;
          }
      }
  }

  resetAcc(callback) {
    this.acc.set(.0, .0);

    if(this.vel.mag() <= VEL_LOWER_LIMIT) {
      this.vel.set(.0, .0);
    }
  }

  applyForce(f) {
    f.div(this.mass)
    this.acc.add(f);
  }

  castRay(target, nPoints = 100) {
    let ray = p5.Vector.sub(target, this.pos);

    let rayStep = p5.Vector.normalize(ray);
    rayStep.mult(ray.mag()/nPoints);

    let p = createVector(this.pos.x, this.pos.y);
    for(let i = 1; i <= nPoints; i++) {
      p.add(rayStep);

      let pCoord = world.pos2Coord(p);
      if (world.isSolid(pCoord.x, pCoord.y)) {
        return pCoord;
      }
    }

    return null;
  }
}
