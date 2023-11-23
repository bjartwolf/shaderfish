import * as THREE from "three";
import * as fish from "/shapes/fish.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { randFloat } from "three/src/math/MathUtils";

let scene, camera, renderer, controls, t0;

t0 = Date.now();
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

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
  let matrixes = await (await fetch("/matrixes.json")).json();
  let fishCount = matrixes.length;
  const colors = new Float32Array(fishCount*3);
  for (let i = 0; i < fishCount; i++) {
    colors[i*3] = randFloat(0.2,0.6); 
    colors[i*3+1] = randFloat(0.2,0.6); 
    colors[i*3+1] = randFloat(0.2,0.7); 
  }
  const colorAttributes = new THREE.InstancedBufferAttribute(colors, 3);

  const instancedFishses = await fish.createInstancedFish(
    UNIFORMS,
    fishCount 
  );

  for (var i = 0; i < matrixes.length; i++) {
    const matrix = new THREE.Matrix4().identity();
    let a = matrixes[i][0][0];
    let c = matrixes[i][0][1];
    let b = matrixes[i][1][0];
    let d = matrixes[i][1][1];
    let e = matrixes[i][2][0];
    let f = matrixes[i][2][1];
    matrix.set( a,b,0,e,
                c,d,0,f,
                0,0,1.0,0,
                0,0,0,1.0); 

    /*
   */
    instancedFishses.setMatrixAt(i, matrix);
  }
  instancedFishses.geometry.setAttribute('fish_color', colorAttributes);

  instancedFishses.instanceMatrix.needsUpdate = true;
  scene.add(instancedFishses);

//  const axesHelper = new THREE.AxesHelper(5);
//  scene.add(axesHelper);
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
