
const NOTE_DISTANCE = 75;

function preload(){
	bravuraFont = loadFont('fonts/Bravura.otf');
}

function setup() {
    textFont(bravuraFont);

    let cnv = createCanvas(1280, 300);
    cnv.mousePressed(play);

    sampler = new Tone.Sampler({
        "G3" : "G3.[mp3|ogg]",
    }, {
        "release" : 1,
        "baseUrl" : 'samples/xylo/'
    }).toDestination();

    const grammar = tracery.createGrammar({
      pattern: ['#cell# #pattern#', '#cell#'],
      cell: ['#two#', '#three#'],
      two: ['#eighth# #eighth#', '#quarter#'],
      three: [
        '#eighth# #eighth# #eighth#',
        '#quarter# #eighth#',
        '#eighth# #quarter#'
      ],
      quarter: ['h-4n', 'l-4n', 'm-4n', 'r-4n'],
      eighth: ['h-8n', 'l-8n', 'm-8n', 'r-8n']
    });

    pattern = generatePattern(grammar);
		console.log(pattern);

    let x = 150;
    let y = height/2;

    notes = [];
    for(let note of pattern.notes) {
      let pitch = (note.velocity == 'r') ? null : 'G3';
      notes.push(new Note(x, y, pitch, note.duration, note.velocity));

      x += NOTE_DISTANCE;
    }
}

function generatePattern(grammar) {
  const pattern = grammar.expand('#pattern#');

  const notes = [];
  let totalDuration = '0';

  pattern.children.forEach(function visit(node) {
    if (node.children) {
      node.children.forEach(visit);
    }
    else if (node.raw.trim().length) {
      const [velocity, duration] = node.raw.split('-');
      notes.push({ velocity, duration, node });

      totalDuration += '+' + duration;
    }
  });

  return { pattern, notes, totalDuration };
}

function draw() {
  background(255);
  for(let note of notes) {
    note.draw();
  }

  fill(0);
  strokeWeight(3);
  line(NOTE_DISTANCE, height/2, 150 + notes.length * NOTE_DISTANCE, height/2);
}

function play() {
  // Initialize tone.js
  Tone.start();
  Tone.Transport.bpm.value = 120;
  Tone.Transport.timeSignature = [4, 4];
  Tone.Transport.start();

  // Create phrase with timed notes
  let events = [];

  let noteStartTime = 0;
  for(let note of notes) {
    events.push({
          rest: note.isRest(),
          time: noteStartTime,
          note: note
    });

    noteStartTime += Tone.Time(note.duration);
  }

  const part = new Tone.Part((time, ev) => {
     if(!ev.rest) {
       sampler.triggerAttackRelease(ev.note.pitch, ev.note.duration, time, ev.note.velocity);
     }

     Tone.Draw.schedule(() => {
       ev.note.bounce();
     }, time);
  }, events);

  part.loop = true;
  part.loopEnd = noteStartTime;
  part.start();
}
