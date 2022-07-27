
const ARRIVE_RADIUS = 10.0;

const ENEMY_STATES = {
  'idle': 0,
  'patrol': 1,
  'seek': 2,
  'catch': 3
}

const ENEMY_STATES_TIME_LIMITS = {
  'idle': 1.5
}

const ENEMY_STATES_SPEEDS = {
  'idle': 0,
  'patrol': 1.5,
  'seek': 5.0,
}

function getNormalPoint(p, a, b) {
  // PVector that points from a to p
  let ap = p5.Vector.sub(p, a);

  // PVector that points from a to b
  let ab = p5.Vector.sub(b, a);

  //[full] Using the dot product for scalar projection
  ab.normalize();
  ab.mult(ap.angleBetween(ab));
  //[end]
  // Finding the normal point along the line segment
  let normalPoint = p5.Vector.add(a, ab);

  return normalPoint;
}

class Enemy extends RigibBody {
  constructor(x, y, mass, size) {
    super(x, y, mass, size);

    this.playerLastSeen = null;

    this.path = [];
    this.lastPathLength = 0;
    this.stepCount = 0;
    this.state = ENEMY_STATES['idle'];
    this.timer = .0;
  }

  draw() {
    noStroke();
    fill(85, 56, 120);
    circle(this.pos.x, this.pos.y, this.size);

    // draw path
    if(this.path && this.path.length > 0) {
        for(let n of this.path) {
            fill(85, 56, 120, 100);
            rect(n.y * world.cellSize, n.x * world.cellSize, world.cellSize, world.cellSize);
        }
    }

    this.resetAcc();
  }

  seek(target, velocity, radius) {
    // The distance is the magnitude of the vector pointing from location to target.
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    desired.normalize();

    if (d < radius) {
      let m = map(d, 0, radius, 0, velocity);
      desired.mult(m);
    }
    else {
      desired.mult(velocity);
    }

    // The usual steering = desired - velocity
    let steer = p5.Vector.sub(desired, this.vel);

    if(this.state == ENEMY_STATES['patrol']) {
      steer.limit(0.115);
    }
    else if(this.state == ENEMY_STATES['seek']) {
      steer.limit(0.2);
    }

    this.applyForce(steer);
  }

  followPath(velocity, radius) {
  	let c_min_dist = Infinity;
  	let c_min_n = null;

  	// project obj position f_pos
  	let f_pos = p5.Vector.add(this.pos, this.vel);

  	// find the set of normal points
  	for (let i = 0; i < this.path.length - 1; i++) {
  		let s = world.cell2Pos(this.path[i]);
  		let e = world.cell2Pos(this.path[i+1]);

  		let n = getNormalPoint(f_pos, s, e);

  		// If normal point n is outside the segment (s,e)
  		if(n.x < min(s.x, e.x) || n.x > max(s.x, e.x)) {
  			n = e;
  		}

  	  // Pick the nearest one n
  		let dist = p5.Vector.dist(f_pos, n)

  		if(dist < c_min_dist) {
  			c_min_dist = dist;
  			c_min_n = n;
  		}
  	}

  	// calc the dist d between f_pos and c_min_n
  	dist = p5.Vector.dist(f_pos, c_min_n);

  	if(dist > radius) {
  		this.seek(c_min_n, velocity, 0.0);
  	}
  }

  update() {
    if(this.state == ENEMY_STATES['catch'])
      return;

    let wall = this.castRay(player.pos);
    if (!wall) {

      if(this.state != ENEMY_STATES['seek']) {
        this.state = ENEMY_STATES['seek'];

        Tone.Transport.bpm.value = 300;
        part1.mute = false;
        part3.mute = false;
      }
    }

    if(this.state == ENEMY_STATES['idle']) {
      part1.mute = true;
      part3.mute = true;

      this.vel.set(0., 0.);

      this.timer += deltaTime/360;
      if(this.timer > ENEMY_STATES_TIME_LIMITS['idle']) {
        // Find random patrol point
        this.playerLastSeen = world.getRandomCoord();

        this.timer = .0;
        this.state = ENEMY_STATES['patrol'];
      }
    }
    else if(this.state == ENEMY_STATES['patrol']) {
      part1.mute = true;
      part3.mute = true;

      // Find path to random patrol point
      this.path = world.a_star(world.pos2Coord(this.pos), this.playerLastSeen);

      if(this.path) {
        if(this.path.length != this.lastPathLength) {
          if(this.stepCount == 2) {
            this.stepCount = 0;
            sampler.triggerAttackRelease("A5", "8n", Tone.now(), random(0.3, 0.9));
          }

          this.stepCount += 1;
          this.lastPathLength = this.path.length;
        }
      }

      if(this.path && this.path.length > 1) {
        this.followPath(ENEMY_STATES_SPEEDS['patrol'], 25);
      }
      else {
        let seekPos = world.cell2Pos(this.playerLastSeen);
        this.seek(seekPos, ENEMY_STATES_SPEEDS['patrol'], ARRIVE_RADIUS);
        if (p5.Vector.dist(this.pos, seekPos) <= 1.0) {
          this.path = [];
          this.state = ENEMY_STATES['idle'];
          this.stepCount = 0;
        }
      }
    }
    else if(this.state == ENEMY_STATES['seek']) {
      // Update tempo
      let musicPath = world.a_star(world.pos2Coord(this.pos), world.pos2Coord(player.pos));

      if(musicPath) {
        let tempo = map(musicPath.length, 0, world.grid.length, 300, 40);
        Tone.Transport.bpm.value = tempo;
      }

      if (!wall) {
        this.path = [];
        this.playerLastSeen = world.pos2Coord(player.pos);

        this.seek(player.pos, ENEMY_STATES_SPEEDS['seek'], ARRIVE_RADIUS);
        if (p5.Vector.dist(this.pos, player.pos) <= 0.01) {
          this.state = ENEMY_STATES['catch'];

          Tone.Transport.bpm.value = 40;
          sampler.triggerAttackRelease('A4', '1n', Tone.now(), 0.8);
          Tone.Transport.stop();
        }
      }
      else {
        // Find path to random patrol point
        this.path = world.a_star(world.pos2Coord(this.pos), this.playerLastSeen);
        if (this.path && this.path.length > 1) {
          this.followPath(ENEMY_STATES_SPEEDS['seek'], 25);
        }
        else {
          this.path = [];
          let seekPos = world.cell2Pos(this.playerLastSeen);
          this.seek(seekPos, ENEMY_STATES_SPEEDS['seek'], ARRIVE_RADIUS);
          if (p5.Vector.dist(this.pos, seekPos) <= 1.0) {
            this.state = ENEMY_STATES['idle'];
            Tone.Transport.bpm.value = 40;
          }
        }
      }
    }

    super.update();
  }
}
