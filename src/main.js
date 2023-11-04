import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const fragmentShaderCode = `
uniform float time;
varying vec3 normalVec;

float normalize2(float min, float max, float value) {
  return (value - min) / (max - min);
}

void main() {
  vec3 color = 0.5 * normalVec + 0.5;
  //float alpha = normalize2(-1.0, 1.0, sin(0.1 * time));

  gl_FragColor = vec4(color, 1.0);
}
`;
const vertexShaderCode = `
varying vec3 normalVec;
uniform float time;

void main() {
  normalVec = normal;

  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  modelSpaceCoordinates.y = modelSpaceCoordinates.y * cos(time); 
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
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
  camera.position.z = 40;
  camera.lookAt(0, 0, 0);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
}

function initShapes() {
  const curve = new THREE.CubicBezierCurve(
    new THREE.Vector2(-10, 0),
    new THREE.Vector2(-5, 15),
    new THREE.Vector2(20, 15),
    new THREE.Vector2(10, 0)
  );

  const points = curve.getPoints(50);

  let material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCode,
    fragmentShader: fragmentShaderCode,
    transparent: true,
    uniforms: UNIFORMS,
  });

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, material);
  scene.add(line);
}

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
  UNIFORMS.time.value = (Date.now() - t0) * 0.001;
  console.log(UNIFORMS.time.value);
  console.log(Math.sin(UNIFORMS.time.value));
}

init();
render();
