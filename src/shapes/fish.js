export const name = "fish";
import * as THREE from "three";

function createBezier(vectors) {
  const curve = new THREE.CubicBezierCurve3(
    vectors[0],
    vectors[1],
    vectors[2],
    vectors[3]
  );
  const points = curve.getPoints(50);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  return lineGeometry;
}

const fragmentShaderCode1 = `
uniform float time;
void main() {
  float color = 0.5 + 0.5 *abs(sin(3.0*time));
  gl_FragColor = vec4(1.0,0.0,0.0,1.0);
} `;
const fragmentShaderCode2 = `
uniform float time;
void main() {
  float color = 0.5 + 0.5 *abs(sin(3.0*time));
  gl_FragColor = vec4(0.0,1.0,0.0, 1.0);
} `;
const fragmentShaderCode3 = `
uniform float time;
void main() {
  float color = 0.5 + 0.5 *abs(sin(3.0*time));
  gl_FragColor = vec4(0.0,0.0,1.0, 1.0);
} `;
const fragmentShaderCode4 = `
uniform float time;
void main() {
  float color = 0.5 + 0.5 *abs(sin(3.0*time));
  gl_FragColor = vec4(1.0,1.0,0.0, 1.0);
} `;
const vertexShaderCode1 = `
varying vec3 normalVec;
uniform float time;

void main() {
  normalVec = normal;

  modelSpaceCoordinates.y = modelSpaceCoordinates.y*(1.0+0.4*sin(time));
  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
`;

const vertexShaderCode2 = `
varying vec3 normalVec;
uniform float time;

void main() {
  normalVec = normal;

  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  modelSpaceCoordinates.y = modelSpaceCoordinates.y*(1.0+0.4*sin(time));
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
`;
const vertexShaderCode3 = `
varying vec3 normalVec;
uniform float time;

void main() {
  normalVec = normal;

  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  modelSpaceCoordinates.y = modelSpaceCoordinates.y*(1.0+0.4*sin(time));
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
`;
const vertexShaderCode4 = `
varying vec3 normalVec;
uniform float time;

void main() {
  normalVec = normal;

  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  modelSpaceCoordinates.y = modelSpaceCoordinates.y*(1.0+0.4*sin(time));
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
`;
export function createFish(UNIFORMS) {
  let material1 = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCode1,
    fragmentShader: fragmentShaderCode1,
    transparent: true,
    uniforms: UNIFORMS,
  });
  let material2 = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCode2,
    fragmentShader: fragmentShaderCode2,
    transparent: true,
    uniforms: UNIFORMS,
  });
  let material3 = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCode3,
    fragmentShader: fragmentShaderCode3,
    transparent: true,
    uniforms: UNIFORMS,
  });
  let material4 = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCode4,
    fragmentShader: fragmentShaderCode4,
    transparent: true,
    uniforms: UNIFORMS,
  });

  let fishyBeziers1 = [
    createBezier([
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.11, 0.11),
      new THREE.Vector2(0.175, 0.175),
      new THREE.Vector2(0.25, 0.25),
    ]),
    createBezier([
      new THREE.Vector2(0.25, 0.25),
      new THREE.Vector2(0.372, 0.194),
      new THREE.Vector2(0.452, 0.132),
      new THREE.Vector2(0.564, 0.032),
    ]),
    createBezier([
      new THREE.Vector2(0.564, 0.032),
      new THREE.Vector2(0.73, 0.056),
      new THREE.Vector2(0.834, 0.042),
      new THREE.Vector2(1.0, 0.0),
    ]),
  ];
  let fishyBeziers2 = [
    createBezier([
      new THREE.Vector2(1.0, 0.0),
      new THREE.Vector2(0.896, 0.062),
      new THREE.Vector2(0.837, 0.107),
      new THREE.Vector2(0.766, 0.202),
    ]),
    createBezier([
      new THREE.Vector2(0.766, 0.202),
      new THREE.Vector2(0.66, 0.208),
      new THREE.Vector2(0.589, 0.217),
      new THREE.Vector2(0.5, 0.25),
    ]),
    createBezier([
      new THREE.Vector2(0.5, 0.25),
      new THREE.Vector2(0.5, 0.41),
      new THREE.Vector2(0.5, 0.46),
      new THREE.Vector2(0.5, 0.5),
    ]),
  ];
  let fishyBeziers3 = [
    createBezier([
      new THREE.Vector2(0.5, 0.5),
      new THREE.Vector2(0.5, 0.575),
      new THREE.Vector2(0.5, 0.625),
      new THREE.Vector2(0.5, 0.75),
    ]),
    createBezier([
      new THREE.Vector2(0.5, 0.75),
      new THREE.Vector2(0.411, 0.783),
      new THREE.Vector2(0.34, 0.792),
      new THREE.Vector2(0.234, 0.798),
    ]),
    createBezier([
      new THREE.Vector2(0.234, 0.798),
      new THREE.Vector2(0.163, 0.893),
      new THREE.Vector2(0.104, 0.938),
      new THREE.Vector2(0.0, 1.0),
    ]),
  ];
  let fishyBeziers4 = [
    createBezier([
      new THREE.Vector2(0.0, 1.0),
      new THREE.Vector2(-0.042, 0.834),
      new THREE.Vector2(-0.056, 0.73),
      new THREE.Vector2(-0.032, 0.564),
    ]),
    createBezier([
      new THREE.Vector2(-0.032, 0.564),
      new THREE.Vector2(-0.132, 0.452),
      new THREE.Vector2(-0.194, 0.372),
      new THREE.Vector2(-0.25, 0.25),
    ]),
    createBezier([
      new THREE.Vector2(-0.25, 0.25),
      new THREE.Vector2(-0.15, 0.15),
      new THREE.Vector2(-0.05, 0.05),
      new THREE.Vector2(0.0, 0.0),
    ]),
  ];
  let group = new THREE.Group();
  fishyBeziers1.forEach((fishGeometry) => {
    const line = new THREE.Line(fishGeometry, material1);
    group.add(line);
  });
  fishyBeziers2.forEach((fishGeometry) => {
    const line = new THREE.Line(fishGeometry, material2);
    group.add(line);
  });
  fishyBeziers3.forEach((fishGeometry) => {
    const line = new THREE.Line(fishGeometry, material3);
    group.add(line);
  });
  fishyBeziers4.forEach((fishGeometry) => {
    const line = new THREE.Line(fishGeometry, material4);
    group.add(line);
  });
  return group;
}
