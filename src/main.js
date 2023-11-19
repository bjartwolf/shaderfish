import * as THREE from "three";
import * as fish from "/shapes/fish.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, controls, t0;

t0 = Date.now();
const WIDTH = 500;
const HEIGHT = 500;

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      function (ok) {
        return resolve(ok);
      },
      undefined,
      function (err) {
        return reject(err);
      }
    );
  });
}

const texture = await loadTexture("/fish_uv.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(4, 4);
//texture.needsUpdate = true;
console.log(texture.image.width);

const UNIFORMS = {
  time: { value: 0.0 },
  fishTexture: { value: texture },
};

function init() {
  scene = new THREE.Scene();

  initRenderer();
  document.body.appendChild(renderer.domElement);

  initShapes();
  initCamera();

  renderer.render(scene, camera);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.01, 1000);
  camera.translateX(0);
  camera.translateZ(10);
  camera.translateY(0);
  //  camera.lookAt(new THREE.Vector3(50.0,50.0,0.0)); // does not work with controls enabled
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(0.0, 0.0, 0.0);
  controls.update();
}

function initRenderer() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2");
  renderer = new THREE.WebGLRenderer({ canvas: canvas, context: context });
  //  console.log(renderer.capabilities.isWebGL2);

  renderer.setSize(WIDTH, HEIGHT);
}

async function initShapes() {
  const instancedFishses = await fish.createInstancedFish(UNIFORMS);

  for (var i = 0; i < 100; i++) {
    for (var j = 0; j < 100; j++) {
      if (i == 0 && j == 1) {
        const turn = new THREE.Matrix4().makeRotationZ(Math.PI);
        const move = new THREE.Matrix4().makeTranslation(1.0,1.0,0.0);
        const turnAndMove = new THREE.Matrix4().multiplyMatrices(move, turn); 
        instancedFishses.setMatrixAt(1, turnAndMove);
      } else {
        const matrix = new THREE.Matrix4().makeTranslation(1.0 * i, 1.0 * j, 0.0);
        instancedFishses.setMatrixAt(i * 100 + j, matrix);
      }
    }
  }
  instancedFishses.instanceMatrix.needsUpdate = true;
  scene.add(instancedFishses);

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
  //  UNIFORMS.time.value = 1.0;
  UNIFORMS.time.value = (Date.now() - t0) * 0.001;
}

init();
render();
