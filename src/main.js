import * as THREE from "three";
import * as fish from "/shapes/fish.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const fragmentShaderCode = `
uniform float time;

void main() {
  float color = 0.5 + 0.5 *abs(sin(3.0*time));
  gl_FragColor = vec4(color,0.5,0.0, 1.0);
}
`;
const vertexShaderCode = `
varying vec3 normalVec;
uniform float time;

void main() {
  normalVec = normal;

  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
`;

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
  let material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCode,
    fragmentShader: fragmentShaderCode,
    transparent: true,
    uniforms: UNIFORMS,
  });

  const fishyBeziers = fish.createFish(material);
  const fishyBeziers2 = fishyBeziers.clone();
  fishyBeziers2.rotation.z = Math.PI/2.0 
  let group1 = new THREE.Group();
  group1.add(fishyBeziers)
  group1.add(fishyBeziers2)
  
  let group2 = group1.clone()
  group2.rotateZ(Math.PI)

  scene.add(group1);
  scene.add(group2);
}

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
  UNIFORMS.time.value = (Date.now() - t0) * 0.001;
}

init();
render();
