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
  camera.position.z = 5;
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
  const fishyBeziers2 = fishyBeziers.clone();
  fishyBeziers2.rotation.z = Math.PI / 2.0;
  let group1 = new THREE.Group();
  group1.add(fishyBeziers);
  group1.add(fishyBeziers2);

  let group2 = group1.clone();
  group2.rotateZ(Math.PI);

  let group3 = new THREE.Group();
  group3.add(group1);
  group3.add(group2);

  
  let group4 = group3.clone();
  group4.rotateZ(Math.PI);
  group4.translateX(2.0);
  let group5 = new THREE.Group();
  group5.add(group3);
  group5.add(group4) 

  let group6 = group5.clone();
  group6.translateX(1.0)
  group6.translateY(1.0)
  scene.add(group5);
  scene.add(group6);

}

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
  UNIFORMS.time.value = (Date.now() - t0) * 0.001;
}

init();
render();
