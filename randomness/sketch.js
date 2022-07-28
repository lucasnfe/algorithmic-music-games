
const notes = ["F2", "G#2", "C3", "C#3", "D#3", "F3", "G#3"];
const tapeMaxLength = 60; // in seconds
const tapeMaxWidth = 600;

class Tape {
  constructor(x, y, pitch, tapeDuration, noteDuration, startingPoint) {
    this.x = x;
    this.y = y;
    this.pitch = pitch;
    
    this.tapeDuration = tapeDuration;
    this.noteDuration = noteDuration;
    this.startingPoint = startingPoint;

    this.tapeTimer = .0;
    this.sustainTimer = .0;
    this.isPlaying = false;
  }

  play(sampler) {
    if(!this.isPlaying) {
      sampler.triggerAttackRelease(this.pitch, this.duration, Tone.now(), 0.3);
      this.isPlaying = true;
    }
  }

  release() {
    this.isPlaying = false;
  }

  draw() {
    strokeCap(SQUARE);

    // draw tape
    strokeWeight(20);
    stroke(40);
    line(this.x, this.y, this.x + (this.tapeDuration/tapeMaxLength) * tapeMaxWidth, this.y);

    // draw starting point
    strokeWeight(2);
    stroke(200);
    let sp = (this.startingPoint/tapeMaxLength) * tapeMaxWidth;
    line(this.x + sp, this.y - 10, this.x + sp, this.y + 10);

    // draw timer
    strokeWeight(2);
    stroke(100);
    let tp = (this.tapeTimer/tapeMaxLength) * tapeMaxWidth;
    line(this.x + tp, this.y - 10, this.x + tp, this.y + 10);
  }

  update(sampler) {
    this.tapeTimer += deltaTime/360.0;
    
    if (this.tapeTimer >= this.startingPoint) {
      this.play(sampler);
    }

    if (this.tapeTimer >= this.tapeDuration) {
      this.tapeTimer = .0;
    }

    if (this.isPlaying) {
      this.sustainTimer += deltaTime/360.0;
    }

    if (this.sustainTimer >= this.noteDuration) {
      this.release();
      this.sustainTimer = .0;
    }
  }
}

function setup() {
    let cnv = createCanvas(600, 600);
    cnv.mousePressed(play);

    sampler = new Tone.Sampler({
        "F2" : "A2.[mp3|ogg]",
        "G#2" : "Gs2.[mp3|ogg]",
        "C3" : "C3.[mp3|ogg]",
        "C#3" : "Cs3.[mp3|ogg]",
        "D#3" : "Ds3.[mp3|ogg]",
        "F3" : "F3.[mp3|ogg]",
        "G#3" : "Gs3.[mp3|ogg]",
    }, {
        "release" : 1,
        "baseUrl" : 'samples/cello/'
    }).toDestination();
    
    angleMode(DEGREES);
    stroke(0);
    noFill();

    hasPressedPlay = false;

    tapes = []
    let x = 100;
    let y = 100;    
    for(let pitch of notes) {
        let tapeDuration = random(tapeMaxLength/4, tapeMaxLength);
        let startingPoint = random(tapeDuration/4, tapeDuration);
        let noteDuration = random(tapeDuration/4, tapeDuration);

        let t = new Tape(x, y, pitch, tapeDuration, noteDuration, startingPoint);
        tapes.push(t);

        y += 40;
    }
}

function update() {
  if(hasPressedPlay) {
    for(let t of tapes) {
      t.update(sampler);
    }
  }
}

function draw() {
  clear();
  update();

  for(let t of tapes) {
    t.draw();
  }
}

function play() {
  // Initialize tone.js
  Tone.start();
  Tone.Transport.bpm.value = 120;
  Tone.Transport.timeSignature = [4, 4];
  Tone.Transport.start(); 

  hasPressedPlay = true;
}
