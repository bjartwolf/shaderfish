export const name = "fish";
import * as THREE from "three";

function createBezier(vectors, side) {
  const curve = new THREE.CubicBezierCurve3(
    vectors[0],
    vectors[1],
    vectors[2],
    vectors[3]
  );
  const points = curve.getPoints(50);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  let sideArray = new Float32Array(51*3);
  for (let i = 0; i < sideArray.length; i++) {
      sideArray[i] = side;
  }
  let bufferAttribute = new THREE.BufferAttribute(sideArray,3, false);
  lineGeometry.setAttribute("side",bufferAttribute);
  return lineGeometry;
}

const fragmentShaderCode = `
uniform float time;
void main() {
  gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
} `;

const vertexShaderCode = `
varying vec3 normalVec;
uniform float time;
attribute float side;

void main() {
  normalVec = normal;
  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  if (side < 1.5) {
    modelSpaceCoordinates.y = ((1.0-modelSpaceCoordinates.x)*(1.0-abs(sin(time)))+modelSpaceCoordinates.y*(abs(sin(time))));
  } else {
    modelSpaceCoordinates.x = modelSpaceCoordinates.x*abs(sin(time));
  }
  vec4 worldSpaceCoordinates = modelViewMatrix * modelSpaceCoordinates;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
`;
export function createFish(UNIFORMS) {
  let material = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCode,
    fragmentShader: fragmentShaderCode,
    transparent: true,
    uniforms: UNIFORMS,
  });

  let fishyBeziers = [
    createBezier([
      new THREE.Vector2(1.0, 0.0),
      new THREE.Vector2(0.896, 0.062),
      new THREE.Vector2(0.837, 0.107),
      new THREE.Vector2(0.766, 0.202),
    ], 1),
    createBezier([
      new THREE.Vector2(0.766, 0.202),
      new THREE.Vector2(0.66, 0.208),
      new THREE.Vector2(0.589, 0.217),
      new THREE.Vector2(0.5, 0.25),
    ], 1),
    createBezier([
      new THREE.Vector2(0.5, 0.25),
      new THREE.Vector2(0.5, 0.41),
      new THREE.Vector2(0.5, 0.46),
      new THREE.Vector2(0.5, 0.5),
    ], 1),
    createBezier([
      new THREE.Vector2(0.5, 0.5),
      new THREE.Vector2(0.5, 0.575),
      new THREE.Vector2(0.5, 0.625),
      new THREE.Vector2(0.5, 0.75),
    ], 1),
    createBezier([
      new THREE.Vector2(0.5, 0.75),
      new THREE.Vector2(0.411, 0.783),
      new THREE.Vector2(0.34, 0.792),
      new THREE.Vector2(0.234, 0.798),
    ], 1),
    createBezier([
      new THREE.Vector2(0.234, 0.798),
      new THREE.Vector2(0.163, 0.893),
      new THREE.Vector2(0.104, 0.938),
      new THREE.Vector2(0.0, 1.0),
    ], 1),
    createBezier([
      new THREE.Vector2(0.0, 1.0),
      new THREE.Vector2(-0.042, 0.834),
      new THREE.Vector2(-0.056, 0.73),
      new THREE.Vector2(-0.032, 0.564),
    ], 2),
    createBezier([
      new THREE.Vector2(-0.032, 0.564),
      new THREE.Vector2(-0.132, 0.452),
      new THREE.Vector2(-0.194, 0.372),
      new THREE.Vector2(-0.25, 0.25),
    ], 2),
    createBezier([
      new THREE.Vector2(-0.25, 0.25),
      new THREE.Vector2(-0.15, 0.15),
      new THREE.Vector2(-0.05, 0.05),
      new THREE.Vector2(0.0, 0.0),
    ], 2),
  ];
  let group = new THREE.Group();
  fishyBeziers.forEach((fishGeometry) => {
    const line = new THREE.Line(fishGeometry, material);
    group.add(line);
  });
  return group;
}
