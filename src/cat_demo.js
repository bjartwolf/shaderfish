// game kind of shamelsessly stolen and bastartized from  
// https://sokoboko.garoof.no/

const boardState = new Int32Array(64);

const style = (bc, hc, ac) => `button {
      display: inline-block; border-style: none;
      padding: 0;
      margin: 0;
      height: ${tileSize.x}px;
      width: ${tileSize.y}px;
      background-color: ${bc};
    }
    button:hover {
      background-color: ${hc};
    }
    button:active {
      background-color: ${ac};
    }
    button img {
      mix-blend-mode: multiply;
    }`;

// https://registry.khronos.org/OpenGL-Refpages/es3.0/
async function main() {
  const canvas = document.querySelector('#c');
  const gl = canvas.getContext('webgl2', { antialias: true }, "true");

  if (!gl) {
    console.error('WebGL not supported');
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
    const imageTextureElement = document.getElementById("texture");
    if (imageTextureElement) {
      console.log("found image", imageTextureElement.src);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageTextureElement);
      const textureUniformLocation = gl.getUniformLocation(program, "u_texture");
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(textureUniformLocation, 0);  // Tell WebGL to use texture unit 0 for uNoise

    } else {
      console.log("No image texture found, most shaders here do not use them");
      return "";
    }
  }

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
    gl.useProgram(program);

    // hardcoded here and in shader to 8x8 = 64, maybe not bother with larger , has to be something with 16 in shader size...


    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linking program:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    loadTexture(gl, program);
    return program;
  }

  const program = await createProgram(gl);

  const positionLocation = gl.getAttribLocation(program, 'position');
  const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
  const timeLocation = gl.getUniformLocation(program, 'iTime');

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

  function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  }

  function render(time) {
    resizeCanvasToDisplaySize(gl.canvas);
    time *= 0.001;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLocation, time);

    const gameStateLocation = gl.getUniformLocation(program, 'boardstate');
    gl.uniform1iv(gameStateLocation, boardState);

    boardState[0] = parseInt(time * 4 % 8);


    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();