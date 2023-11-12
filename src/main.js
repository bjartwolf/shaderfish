import * as THREE from "three";
import * as fish from "/shapes/fish.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, controls, t0;

t0 = Date.now();
const WIDTH = 500;
const HEIGHT = 500;

const UNIFORMS = {
  time: { value: 0.0 },
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
  camera.position.z = 1.5;
  camera.position.y = 1.5;
  camera.position.x = 1;
  camera.lookAt(0, 0, 0);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
}

function initShapes() {
  const fishyBeziers = fish.createFish(UNIFORMS);
  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );
 
  scene.add(fishyBeziers);
//  const instancedFishMesh = new THREE.InstancedMesh(fishyBeziers)
}

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
  UNIFORMS.time.value = 1.0; 
  UNIFORMS.time.value = (Date.now() - t0) * 0.001;
}

init();
render();
