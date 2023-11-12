import * as THREE from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
function createBezier(vectors, side) {
  const curve = new THREE.CubicBezierCurve3(
    vectors[0],
    vectors[1],
    vectors[2],
    vectors[3]
  );
  const points = curve.getPoints(50);
  
  const planeGeometries = [];
  const planeHeight = 0.3; // Height of the vertical plane
  const planeWidth = 0.05; // Thickness of the plane (small value)
  points.forEach(point => {
      const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      planeGeometry.translate(point.x, point.y + planeHeight / 2, point.z); 
      planeGeometries.push(planeGeometry);
  });

  // Merge the plane geometries
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(planeGeometries);


  //let sideArray = new Float32Array(51*3);
  let sideArray = new Float32Array(51*3*4);
  for (let i = 0; i < sideArray.length; i++) {
      sideArray[i] = side;
  }
  let bufferAttribute = new THREE.BufferAttribute(sideArray,3, false);
  mergedGeometry.setAttribute("side",bufferAttribute);
  return mergedGeometry;
}

const fragmentShaderCode = `
uniform float time;
void main() {
  gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
} `;

/// I am not convinced the "flattening" to the y and x axis is actually maintaining the proper 
/// perspective required for perfect composition, but for now I guess it is ok.
/// It could possibly work to just have the one line animated and use composition of those
/// using matrixes and compose them to one fish. That would lead to some issues later with pixelshaders
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
      new THREE.Vector3(1.0, 0.0),
      new THREE.Vector3(0.896, 0.062),
      new THREE.Vector3(0.837, 0.107),
      new THREE.Vector3(0.766, 0.202),
    ], 1),
    createBezier([
      new THREE.Vector3(0.766, 0.202),
      new THREE.Vector3(0.66, 0.208),   
      new THREE.Vector3(0.589, 0.217),
      new THREE.Vector3(0.5, 0.25),
    ], 1),
    createBezier([
      new THREE.Vector3(0.5, 0.25),
      new THREE.Vector3(0.5, 0.41),
      new THREE.Vector3(0.5, 0.46),
      new THREE.Vector3(0.5, 0.5),
    ], 1),
    createBezier([
      new THREE.Vector3(0.5, 0.5),
      new THREE.Vector3(0.5, 0.575),
      new THREE.Vector3(0.5, 0.625),
      new THREE.Vector3(0.5, 0.75),
    ], 1),
    createBezier([
      new THREE.Vector3(0.5, 0.75),
      new THREE.Vector3(0.411, 0.783),
      new THREE.Vector3(0.34, 0.792),
      new THREE.Vector3(0.234, 0.798),
    ], 1),
    createBezier([
      new THREE.Vector3(0.234, 0.798),
      new THREE.Vector3(0.163, 0.893),
      new THREE.Vector3(0.104, 0.938),
      new THREE.Vector3(0.0, 1.0),
    ], 1),
    createBezier([
      new THREE.Vector3(0.0, 1.0),
      new THREE.Vector3(-0.042, 0.834),
      new THREE.Vector3(-0.056, 0.73),
      new THREE.Vector3(-0.032, 0.564),
    ], 2),
    createBezier([
      new THREE.Vector3(-0.032, 0.564),
      new THREE.Vector3(-0.132, 0.452),
      new THREE.Vector3(-0.194, 0.372),
      new THREE.Vector3(-0.25, 0.25),
    ], 2),
    createBezier([
      new THREE.Vector3(-0.25, 0.25),
      new THREE.Vector3(-0.15, 0.15),
      new THREE.Vector3(-0.05, 0.05),
      new THREE.Vector3(0.0, 0.0),
    ], 2),
  ];
  let group = new THREE.Group();
  fishyBeziers.forEach((fishGeometry) => {
    const line = new THREE.Line(fishGeometry, material);
    group.add(line);
  });
  return group;
}
