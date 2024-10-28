// https://registry.khronos.org/OpenGL-Refpages/es3.0/
async function main() {
  const canvas = document.querySelector('#c');
  const gl = canvas.getContext('webgl2', { antialias: false }, "true");
  //const gl = canvas.getContext('webgl2', { antialias: true }, "true");

  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  // Vertex shader program
  const vertexShaderSource = `#version 300 es 
precision mediump float;

in vec4 position;
out vec2 vUv;

void main() {
    vUv = position.xy;
    gl_Position = position; 
  }
  `;

  // Fragment shader program
  async function loadShader() {
    const script = document.getElementById("fragment_shader");
    const response = await fetch(script.src);
    return await response.text();
  }

  //  https://cdn.maximeheckel.com/noises/noise2.png
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  async function createProgram(gl) {
    const fragmentShaderSource = await loadShader();
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linking program:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  const program = await createProgram(gl);

  // Look up locations
  const positionLocation = gl.getAttribLocation(program, 'position');
  const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
  const timeLocation = gl.getUniformLocation(program, 'iTime');

  // Create buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  function render(time) {
    time *= 0.001;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLocation, time);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
