import { BASS_NOTES, POPCORN } from "./popcorn";
import { Synth } from "./synth";
import cat_shader from './cat_demo.frag'
const boardState = new Int32Array(64);

// https://registry.khronos.org/OpenGL-Refpages/es3.0/
async function main() {
  const style = document.createElement('style');
  style.textContent = `
  #c {
    height: 450px;
    aspect-ratio: 1/1;
    background-color: lightgreen;
  }
`;
  document.head.appendChild(style);
  const canvas = document.createElement('canvas');
  canvas.id = 'c';
  document.body.appendChild(canvas);
  const button = document.createElement('button');
  button.textContent = 'When not running with autoplay enabled this must be clicked';
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
  };

  document.body.appendChild(button);

  const gl = canvas.getContext("webgl2", { antialias: true }, "true");

  if (!gl) {
    console.error("WebGL not supported");
    return;
  }

  // Vertex shader program
  const vertexShaderSource = `#version 300 es 
precision highp float;

in vec4 position;
out vec2 vUv;

void main() {
    vUv = position.xy;
    gl_Position = position; 
  }
  `;

  function loadTexture(gl, program) {
    const img = document.createElement('img');
    img.id = "texture";
    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAAAVCAMAAAAn8RGpAAAAAXNSR0IArs4c6QAAAA9QTFRFAAAAAAAAOjo6UVFRbW1t/kAd+gAAAAV0Uk5TAP////8c0CZSAAABH0lEQVRIieWXAQ7DIAhFRbn/mVdBLHRaMavZzMhi5/vsi7HVNYQcAKEZ23DEprIPT01hI56qAmfr4j2fp7ijHiMAXaUd8+kJT3JfPUZIEIB6Tl6NFnFnPVoAEvw8LOb39fDCiAAxlQAXNwMs4I56yg/wFA4f+ni5GWABH9TDS4PlhGAjZCMnrwMs4oN6+B6qe0FWEPN6+rgyWsId9RwdmuA1nFwNsIQ76uGHI1KUS4xOHjs+T3FHPSLYOHeDAX8b4GE+rufDCXyf/1xBfzgBQFQacsA2nI7xa0CHy5+/qfyef89nlvN7jo56XFshgkwgfzfpEW7yu/5tH8pW+2rp9sfNN5F51ZQunR2gcOny4afTg/Bm/o1/ywdqU7E0zfwXvmIbea4eByYAAAAASUVORK5CYII=";
    document.body.appendChild(img); // Append the image to the document body
    img.onload = () => {
      const imageTextureElement = document.getElementById("texture");
      if (imageTextureElement) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          imageTextureElement
        );
        const textureUniformLocation = gl.getUniformLocation(
          program,
          "u_texture",
        );
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureUniformLocation, 0); // Tell WebGL to use texture unit 0 for uNoise
      } else {
        console.log("No image texture found, most shaders here do not use them");
        return "";
      }
    }

  }

  //  https://cdn.maximeheckel.com/noises/noise2.png
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  async function createProgram(gl) {
    const fragmentShaderSource = cat_shader;

    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Error linking program:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    loadTexture(gl, program);
    return program;
  }

  const program = await createProgram(gl);

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
      synth_melody.play(note + 4, t0 + on + 0.02, dur, 0.2, "sine");
      synth_melody.play(note + 7, t0 + on + 0.04, dur, 0.3, "sine");
    }

  }
  while (QUEUE_BASS.length && QUEUE_BASS[0].on < scheduleThreshold) {
    let { note, on, dur } = QUEUE_BASS[0];
    QUEUE_BASS.splice(0, 1);

    console.log("pop from bass queue for scheudling", note, on, dur)
    if (note != null) {
      synth_bass.play(note, t0 + on, dur * 2.0, 3.0, "sawtooth");
      synth_bass.play(note + 7, t0 + on + 0.04, dur * 4.0, 0.3, "sawtooth");
    }
  }
}
main()