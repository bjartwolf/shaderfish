// game kind of shamelsessly stolen and bastartized from  
// https://sokoboko.garoof.no/
const vecs = new Map();
const vec = (x, y) => {
  const key = `${x},${y}`;
  if (!vecs.has(key)) {
    vecs.set(key, { x: x, y: y });
  }
  return vecs.get(key);
}

const tileSize = vec(48, 48);

const add = (a, b) => vec(a.x + b.x, a.y + b.y);
const neg = (v) => vec(-v.x, -v.y);

const newGame = str => {
  const level = str.split("\n").map((x) => x.split(""));
  return {
    level: level,
    moves: "",
    redo: "",
    won: won(level)
  }
};

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

const at = (level, pos, notfound = "#") => {
  if (pos.y < 0 || pos.y >= level.length) {
    return notfound;
  }
  const row = level[pos.y];
  if (pos.x < 0 || pos.x >= row.length) {
    return notfound;
  }
  return row[pos.x];
};

const won = (level) =>
  !level.some((row) => row.some((tile) => tile === "." || tile === "+"));

const put = (level, pos, tile) => (level[pos.y][pos.x] = tile);

const playerPos = (level) => {
  for (let y = 0; y < level.length; y++) {
    const row = level[y];
    for (let x = 0; x < row.length; x++) {
      const tile = row[x];
      if (tile === "@" || tile === "+") {
        return vec(x, y);
      }
    }
  }
  throw "no player on level? :(";
};

let game;

const startLevel = (str) => {
  game = newGame(str);
};

const player = ["@", "+"];
const box = ["$", "*"];

const step = (level, type, pos, dir) => {
  const tile = at(level, pos);
  if (tile !== type[0] && tile !== type[1]) {
    return false;
  }

  const nextPos = add(pos, dir);
  const nextTile = at(level, nextPos);
  if (nextTile !== " " && nextTile !== ".") {
    return false;
  }
  put(level, pos, tile === type[0] ? " " : ".");
  put(level, nextPos, nextTile === " " ? type[0] : type[1]);
  return true;
};

const dirs = [
  { name: "u", vec: vec(0, -1) },
  { name: "l", vec: vec(-1, 0) },
  { name: "d", vec: vec(0, 1) },
  { name: "r", vec: vec(1, 0) }
];

const move = (game, dir) => {
  if (game.won) {
    return;
  }
  const pos = playerPos(game.level);
  const boxMoved = step(game.level, box, add(pos, dir.vec), dir.vec);
  const playerMoved = step(game.level, player, pos, dir.vec);
  const moveMade = boxMoved
    ? dir.name.toUpperCase()
    : playerMoved
      ? dir.name
      : "";
  game.moves += moveMade;
  game.redo = "";
  game.won = won(game.level);
};

const undo = (game) => {
  if (game.moves === "") {
    return;
  }
  const pos = playerPos(game.level);
  const moveMade = game.moves.slice(-1);
  const forward = dirs[dirNum(moveMade)].vec;
  const back = neg(forward);
  if (!step(game.level, player, pos, back)) {
    throw "player won't move back :(";
  }

  if (moveMade === moveMade.toUpperCase()) {
    if (!step(game.level, box, add(pos, forward), back)) {
      throw "box won't move back :(";
    }
  }
  game.moves = game.moves.slice(0, -1);
  game.redo = moveMade + game.redo;
  game.won = won(game.level);
};

const restart = (game) => {
  while (game.moves !== "") {
    undo(game);
  }
};

const redo = (game) => {
  if (game.redo === "") {
    return;
  }
  const moveMade = game.redo.slice(0, 1);
  const newRedo = game.redo.slice(1);
  move(game, dirs[dirNum(moveMade)]);
  game.redo = newRedo;
};

const dirNum = (str) => {
  const s = str.toLowerCase();
  return s === "u" ? 0 : s === "l" ? 1 : s === "d" ? 2 : s === "r" ? 3 : false;
};


const colors = [
  "#000000", "#1D2B53", "#7E2553", "#008751",
  "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8",
  "#FF004D", "#FFA300", "#FFEC27", "#00E436",
  "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"
];

const makeSprites = (img) => {
  const canvas = document.body.appendChild(document.createElement("canvas"));
  const ctx = canvas.getContext("2d");;
  canvas.width = tileSize.x;
  canvas.height = tileSize.y;
  ctx.imageSmoothingEnabled = false;

  const sprites = new Map(
    [
      [" ", vec(0, 0)],
      ["#", vec(1, 0)],
      ["@", vec(0, 1)],
      ["+", vec(0, 1)],
      ["$", vec(1, 1)],
      [".", vec(0, 2)],
      ["*", vec(1, 2)]
    ].map((a) => {
      ctx.drawImage(img, a[1].x * 16, a[1].y * 16, 16, 16, 0, 0, tileSize.x, tileSize.y);
      return [a[0], canvas.toDataURL()];
    })
  );
  canvas.remove();
  return sprites;
};

const img = (tile, sprites) => {
  const img = document.createElement("img");
  img.src = sprites.get(tile);
  img.alt = "";
  return img;
};

const button = (tile, sprites) => {
  const button = document.createElement("button");
  button.appendChild(img(tile, sprites));
  return button;
};

const tilemap = () => {
  const pre = document.createElement("pre");
  pre.style = "line-height: 0;";
  return pre;
};

const start = (str, sprites) => {

  let touch = false;

  const gameEl = document.querySelector("#game");
  const gamePre = gameEl.appendChild(tilemap());
  const solutionEl = gameEl.appendChild(document.createElement("p"));
  const wonEl = gameEl.appendChild(document.createElement("p"));
  const controlsEl = gameEl.appendChild(document.createElement("table"));

  const descriptions = {
    w: "Up",
    a: "Left",
    s: "Down",
    d: "Right",
    z: "Undo",
    y: "Redo",
    r: "Restart"
  };
  let perform;

  const draw = (game) => {
    solutionEl.innerText = game.moves === "" ? "..." : game.moves;
    wonEl.innerText = game.won ? "Yay!" : "...";

    gamePre.replaceChildren();
    const player = playerPos(game.level);
    const buttons = new Map(
      [
        [add(player, vec(0, -1)), "w"],
        [add(player, vec(-1, 0)), "a"],
        [add(player, vec(0, 1)), "s"],
        [add(player, vec(1, 0)), "d"]
      ]
    );
    game.level.forEach((row, y) => {
      row.forEach((tile, x) => {
        const pos = vec(x, y);
        if (touch && buttons.has(pos)) {
          const command = buttons.get(pos);
          const btn = gamePre.appendChild(button(tile, sprites));
          btn.title = `${descriptions[command]} (${command})`;
          btn.onclick = perform(command);
        } else {
          gamePre.appendChild(img(tile, sprites));
        }
      });
      gamePre.appendChild(document.createElement("br"));
    });
  };

  perform = (() => {
    const makeMove = dirNum => move(game, dirs[dirNum]);
    const commands = new Map([
      ["w", () => makeMove(0)],
      ["a", () => makeMove(1)],
      ["s", () => makeMove(2)],
      ["d", () => makeMove(3)],
      ["z", () => undo(game)],
      ["y", () => redo(game)],
      ["r", () => restart(game)],
    ]);
    return (c) => () => {
      if (commands.has(c)) {
        commands.get(c)();
        draw(game);
      }
    };
  })();

  (() => {

    const layout = `
 w r y t
asd
z
`.split("\n").map((x) => x.split(""));
    layout.pop();
    layout.shift();
    for (const row of layout) {
      const tr = controlsEl.appendChild(document.createElement("tr"));
      for (const c of row) {
        const td = tr.appendChild(document.createElement("td"));
        if (c === "t") {
          const button = td.appendChild(document.createElement("button"));
          button.style = "width: 200px;";
          button.innerText = "Toggle particularly good touch controls!";
          button.onclick = () => {
            touch = !touch;
            draw(game);
          };
        } else if (c !== " ") {
          const button = td.appendChild(document.createElement("button"));
          button.innerText = c.toUpperCase();
          button.title = descriptions[c];
          button.onclick = perform(c);
        }
      }
    }
  })();

  document.onkeypress = event => perform(event.key.toLowerCase())();
  startLevel(str);
  draw(game);
};

const defaultLevel = `
###
######
#. $ #
# $  #
#  @$#
#.  .#
######"
`;

window.onload = () => {

  const img = document.getElementById("sprites");
  img.remove()
  const sprites = makeSprites(img);

  let levelStr = defaultLevel;
  const params = new URLSearchParams(location.search);
  const urlLevel = params.get("level");
  if (urlLevel !== null) {
    try {
      levelStr = url.read(urlLevel);
    } catch (e) {
      console.error(e);
    }
  }
  start(levelStr, sprites);

};

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

    const boardState = new Int32Array(64);
    boardState[0] = 1;
    boardState[1] = 1;
    boardState[2] = 1;
    boardState[3] = 1;
    boardState[4] = 1;
    boardState[5] = 1;
    boardState[6] = 1;
    boardState[7] = 1;
    boardState[8] = 1;
    boardState[15] = 1;
    boardState[23] = 1;
    boardState[31] = 1;
    boardState[39] = 1;
    boardState[47] = 1;
    boardState[16] = 1;
    boardState[24] = 1;
    boardState[32] = 1;
    boardState[40] = 1;
    boardState[48] = 1;
    boardState[13] = 1;

    boardState[52] = 1;
    boardState[53] = 1;
    boardState[55] = 1;
    boardState[56] = 1;
    boardState[57] = 1;
    boardState[58] = 1;
    boardState[59] = 1;
    boardState[60] = 1;
    boardState[61] = 1;
    boardState[62] = 1;
    boardState[63] = 1;

    boardState[17] = 2;
    boardState[28] = 2;
    boardState[29] = 3;
    boardState[30] = 4;
    boardState[25] = 4;
    boardState[18] = 5;
    boardState[41] = 5;

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
    const gameStateLocation = gl.getUniformLocation(program, 'boardstate');
    gl.uniform1iv(gameStateLocation, boardState);

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



    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
