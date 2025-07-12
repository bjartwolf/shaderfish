import { loadTexture } from "./textureloader";
export function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'c';
  document.body.appendChild(canvas);

  const gl = canvas.getContext("webgl2", { antialias: true }, "true");

  if (!gl) {
    console.error("WebGL not supported");
  }
  return gl;
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

export async function createProgram(gl, fragmentShaderSource) {
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


