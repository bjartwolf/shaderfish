import * as THREE from "three";
import * as fish from "/shapes/fish.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { randFloat } from "three/src/math/MathUtils";

let scene, camera, renderer, controls, t0, instancedFishses, raceClock;

t0 = Date.now();
raceClock = 0;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
let fishVec;
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


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

const texture = await loadTexture("/fish_uv_3.png");
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(2, 2);

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
  camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 0.001, 1000000);
  let camx = 50;
  let camy = 50;
  camera.translateX(camx);
  camera.translateZ(-100);
  camera.translateY(camy);
  //  camera.lookAt(new THREE.Vector3(50.0,50.0,0.0)); // does not work with controls enabled
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(camx, camy, 0.0);
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
  let fishCount = 71530;
  fishVec = new Array(fishCount);//matrixes.length;
  const colors = new Float32Array(fishCount*3);
  for (let i = 0; i < fishCount; i++) {
    colors[i*3] = randFloat(0.2,0.6); 
    colors[i*3+1] = randFloat(0.2,0.6); 
    colors[i*3+1] = randFloat(0.2,0.7); 
  }
  const colorAttributes = new THREE.InstancedBufferAttribute(colors, 3);

  instancedFishses = await fish.createInstancedFish(
    UNIFORMS,
    fishCount 
  );

  const m = new THREE.Matrix4().identity();
  for (var i = 0; i < fishVec.length; i++) {
    let x = Math.floor(i/ 270);
    let z = i % 270;
    if (z % 2 === 1) {
      z = 270 -z;
    }
    let translate = new THREE.Matrix4().makeTranslation(x,0,z);
    let scale = new THREE.Matrix4().makeScale(8,8,8);
    let matrix_1 = new THREE.Matrix4().multiplyMatrices(m, scale);
    let matrix = new THREE.Matrix4().multiplyMatrices(matrix_1, translate);
    fishVec[i] = i;
    instancedFishses.setMatrixAt(i, matrix);
  }
  instancedFishses.geometry.setAttribute('fish_color', colorAttributes);

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
  const m = new THREE.Matrix4().identity();
  UNIFORMS.time.value = (Date.now() - t0) * 0.001;
  if (instancedFishses) {
    var instanceMatrix = instancedFishses.instanceMatrix;
    for (var i = 0; i < fishVec.length; i += 1) {
      if (fishVec[i] < raceClock) {
        var matrix = new THREE.Matrix4();
        matrix.fromArray(instanceMatrix.array.slice(i*16, i*16 + 16));
        let translateY = new THREE.Matrix4().makeTranslation(0,0.000003*fishVec[i],0);
        let moved = new THREE.Matrix4().multiplyMatrices(matrix, translateY); 
        instancedFishses.setMatrixAt(i, moved)
      }
    }
    instancedFishses.instanceMatrix.needsUpdate = true;
    raceClock = raceClock + 10;
    if (raceClock < 4000) {
      camera.translateY(0.1);
      camera.translateZ(0.1);
      camera.translateX(0.1);
    } if (raceClock > 10000 && raceClock < 14000)
      camera.translateY(-0.1);
   }
}

init();
render();
