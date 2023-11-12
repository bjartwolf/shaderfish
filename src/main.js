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
  camera.position.z = 10;
  camera.position.y = 1;
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
  const fishes = fish.createFish(UNIFORMS);

  const matrix1 = (new THREE.Matrix4()).makeTranslation(0.3,0.4,0.0);
  const matrix2 = (new THREE.Matrix4()).makeRotationAxis(new THREE.Vector3(1.0,1.0,1.0), 5);
  fishes.setMatrixAt(0,matrix1);
  fishes.setMatrixAt(1,matrix2);
  fishes.instanceMatrix.needsUpdate = true;

  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add( axesHelper );
 
  scene.add(fishes);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

}

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
  UNIFORMS.time.value = 1.0; 
//  UNIFORMS.time.value = (Date.now() - t0) * 0.001;
}

init();
render();
