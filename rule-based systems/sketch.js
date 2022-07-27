let s = 40;

function setup() {
    grid = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 0, 1, 0, 7, 1, 0, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1],
            [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 7, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 7, 0, 1],
            [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];

    createCanvas(grid[0].length * s, grid.length * s);

    Tone.start();
    Tone.Transport.start();
    Tone.Transport.bpm.value = 40;
    Tone.Transport.timeSignature = [4, 4];

    sampler = new Tone.Sampler({
        "A1" : "Tom1.[mp3|ogg|wav]",
        "A2" : "Tom2.[mp3|ogg|wav]",
        "A3" : "Tom3.[mp3|ogg|wav]",
        "A4" : "Crash1.[mp3|ogg|wav]",
        "A5" : "Woodblock3.[mp3|ogg|wav]"
    }, {
        "release" : 1,
        "baseUrl" : 'samples/toms/'
    }).toDestination();

    const notes1 = [{ pitch: "A1", duration: "8n", isRest: false, velocity: 0.9  }];

    const notes3 = [{ pitch: "A3", duration: "8n", isRest: true, velocity: 0.9  },
                    { pitch: "A5", duration: "8n", isRest: false, velocity: 0.7 },
                    { pitch: "A3", duration: "8n", isRest: true, velocity: 0.6 },
                    { pitch: "A5", duration: "8n", isRest: false, velocity: 0.9 },
                    { pitch: "A3", duration: "8n", isRest: true, velocity: 0.7 },
                    { pitch: "A5", duration: "8n", isRest: false, velocity: 0.5 },
                    { pitch: "A3", duration: "8n", isRest: true, velocity: 0.5 },
                    { pitch: "A5", duration: "8n", isRest: false, velocity: 0.4 } ];

    part1 = createPart(notes1, true);
    part3 = createPart(notes3, true);

    part1.start();
    part1.mute = true;
    part3.start();
    part3.mute = true;

    world = new World(grid, s);

    let playerPos = world.cell2Pos(createVector(1, 1));
    player = new Player(playerPos.x, playerPos.y, 1, 20);

    let enemyPos = world.cell2Pos(createVector(12, 12));
    enemy = new Enemy(enemyPos.x, enemyPos.y, 1.0, 20);
}

function draw() {
    background(30);

    world.draw();
    player.draw();
    enemy.draw();
}

function mousePressed() {
    let mouseCoord = world.pos2Coord(createVector(mouseX, mouseY));

    if (mouseButton === LEFT) {
        world.set(mouseCoord.x, mouseCoord.y);
    }
}

function mouseDragged() {
    if(mouseIsPressed && mouseButton === LEFT) {
        let mouseCoord = world.pos2Coord(createVector(mouseX, mouseY));
        world.set(mouseCoord.x, mouseCoord.y);
    }
}

function createPart(notes, loop = false) {
  let events = [];

  let noteStartTime = 0;
  for(let note of notes) {
    events.push({
          rest: note.isRest,
          time: noteStartTime,
          note: note
    });

    noteStartTime += Tone.Time(note.duration);
  }

  const part = new Tone.Part((time, ev) => {
     if(!ev.rest) {
       sampler.triggerAttackRelease(ev.note.pitch, ev.note.duration, time, ev.note.velocity);
     }
  }, events);

  part.loop = loop;
  part.loopEnd = noteStartTime;

  return part;
}
