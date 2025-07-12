import { BASS_NOTES, POPCORN } from "./popcorn";
import { Synth } from "./synth";
import { createCanvas, createProgram } from "./shader_setup";
import cat_shader from "./cat_demo.frag";
const boardState = new Int32Array(64);
const border = document.createElement('div');
border.style.width = '403px'
border.style.height = '284px'
border.style.backgroundColor = '#6699FF';
document.body.append(border);

// https://registry.khronos.org/OpenGL-Refpages/es3.0/
async function main() {
  const style = document.createElement('style');
  style.textContent = `
  #c {
    height: 200px;
    width: 320px;
    position: absolute;
    top: 51px;
    left: 41px;
  }`;
  document.head.appendChild(style);
  const button = document.createElement('button');
  button.textContent = 'PRESS FIRE TO PLAY';
  button.style.font = 'font-family: "Courier New", Courier, monospace;'
  button.style.top = '120px';
  button.style.left = '120px';
  button.style.backgroundColor = '#FFCC00';
  button.style.position = 'absolute';
  button.onclick = function () {
    actx = new AudioContext();
    synth_melody = new Synth(actx);
    synth_melody.envelope(0.01, 0.2, 0.0, 0.01); // A, D, S, R 
    synth_bass = new Synth(actx);
    synth_bass.envelope(0.01, 0.2, 0.2, 0.01); // A, D, S, R 
    actx.resume();
    t0 = actx.currentTime;
    QUEUE = [...SONG];
    QUEUE_BASS = [...BASS];
    requestAnimationFrame(render);
    loop();
    button.remove();
  };

  const gl = createCanvas();
  document.body.appendChild(button);
  const program = await createProgram(gl, cat_shader);

  const positionLocation = gl.getAttribLocation(program, "position");
  const resolutionLocation = gl.getUniformLocation(program, "iResolution");
  const timeLocation = gl.getUniformLocation(program, "iTime");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    -1,
    -1,
    1,
    -1,
    -1,
    1,
    -1,
    1,
    1,
    -1,
    1,
    1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  }

  let catPos = 0;
  let previousAnimationFrame = 0;
  function render() {
    resizeCanvasToDisplaySize(gl.canvas);
    let time = actx.currentTime;
    //    time *= 0.001;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // move these out?
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLocation, time);

    const gameStateLocation = gl.getUniformLocation(program, "boardstate");
    let animationFrame = time * 4 % 8;
    catPos += 1;
    gl.uniform1iv(gameStateLocation, boardState);
    boardState[0] = parseInt(animationFrame);
    boardState[1] = parseInt(catPos);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }
}

let actx;
let synth_melody;
let synth_bass;
let t0 = 0;

const PULSE = 0.25; // s

const SONG = POPCORN.reduce(function (acc, n, i) {
  const ROOT = 60; //A
  let durationSoFar = acc[i - 1]?.on || 0;
  let previousNoteDuration = acc[i - 1]?.dur || 0;

  let note = {
    note: n == null ? n : n + ROOT,
    on: durationSoFar + previousNoteDuration,
    dur: 1 * PULSE,
  };

  acc.push(note);
  return acc;
}, []);

const BASS = BASS_NOTES.reduce(function (acc, n, i) {
  const ROOT = 41; //F
  let durationSoFar = acc[i - 1]?.on || 0;
  let previousNoteDuration = acc[i - 1]?.dur || 0;

  let note = {
    note: n == null ? n : n + ROOT,
    on: durationSoFar + previousNoteDuration,
    dur: 1 * PULSE,
  };
  acc.push(note);

  return acc;
}, []);

let rAF;
const LOOKAHEAD = 0.75;

let QUEUE = [...SONG];
console.log(QUEUE)
let QUEUE_BASS = [...BASS];
function loop(time) {
  let lastNote = SONG[SONG.length - 2];
  let tMax = lastNote.on + lastNote.dur;

  let deltaT = actx.currentTime - t0;
  //  console.log("deltat", deltaT);
  rAF = requestAnimationFrame(loop);
  if (deltaT > tMax) {
    cancelAnimationFrame(rAF);
    return;
  }

  let scheduleThreshold = deltaT + LOOKAHEAD;
  while (QUEUE.length && QUEUE[0].on < scheduleThreshold) {
    let { note, on, dur } = QUEUE[0];
    console.log("pop from queue for scheudling", note, on, dur)
    QUEUE.splice(0, 1);

    if (note != null) {
      synth_melody.play(note, t0 + on, dur, 1.0, "sawtooth");
      //      synth_melody.play(note + 4, t0 + on + 0.02, dur, 0.2, "sine"); //third major
      //      synth_melody.play(note + 7, t0 + on + 0.04, dur, 0.3, "sine"); // perfect fifth
    }

  }
  while (QUEUE_BASS.length && QUEUE_BASS[0].on < scheduleThreshold) {
    let { note, on, dur } = QUEUE_BASS[0];
    QUEUE_BASS.splice(0, 1);

    console.log("pop from bass queue for scheudling", note, on, dur)
    if (note != null) {
      synth_bass.play(note, t0 + on, dur * 2.0, 3.0, "sawtooth");
      //     synth_bass.play(note + 7, t0 + on + 0.04, dur * 4.0, 0.3, "sawtooth");
    }
  }
}
main()
