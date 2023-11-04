import * as THREE from 'three';

const fragmentShaderCode = 
`
uniform float time;
varying vec3 normalVec;

float normalize2(float min, float max, float value) {
  return (value - min) / (max - min);
}

void main() {
  vec3 color = 0.5 * normalVec + 0.5;
  float alpha = normalize2(-1.0, 1.0, sin(0.1 * time));

  gl_FragColor = vec4(color, alpha);
}
`
const vertexShaderCode = `
varying vec3 normalVec;

void main() {
  normalVec = normal;

  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
`

let scene, camera, renderer, cubes, t0;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const UNIFORMS = {
  time: { value: 0.0 }
};

function init() {
  scene = new THREE.Scene();
  t0 = Date.now() * 0.01;

  initCubes();
  initCamera();
  initRenderer();

  document.body.appendChild(renderer.domElement);

  renderer.render(scene, camera);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
  camera.position.z = 40;
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
}

function initCubes() {

    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderCode,
      fragmentShader: fragmentShaderCode,
      transparent: true,
      uniforms: UNIFORMS
    });

    let cube = new THREE.Mesh(geometry, material);

    cube.position.set(0, 0, 0);

    scene.add(cube);
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

init();
render();