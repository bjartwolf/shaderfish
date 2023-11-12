import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

function createBezier(vectors, side) {
  const curve = new THREE.CubicBezierCurve3(
    vectors[0],
    vectors[1],
    vectors[2],
    vectors[3]
  );
  let n = 15;
  const points = curve.getPoints(n);

  var shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);

  for (var i = 0; i < points.length; i++) {
    let point = points[i];
    shape.lineTo(point.x, point.y);
  }

  var extrudeSettings = {
    steps: 10,
    curveSegments: n,
    depth: 0.3, // Depth of the extrusion
    bevelEnabled: false, // This can be true if you want beveled edges
  };

  var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  let positionLength = geometry.attributes["position"]["array"].length;

  let sideArray = new Float32Array(positionLength);
  for (let i = 0; i < sideArray.length; i++) {
    sideArray[i] = side;
  }
  let bufferAttribute = new THREE.BufferAttribute(sideArray, 3, false);
  geometry.setAttribute("side", bufferAttribute);
  return geometry;
}

const fragmentShaderCode = `
uniform float time;
void main() {
  gl_FragColor = vec4(1.0,0.0,0.0, 0.5);
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
    wireframe: true,
    transparent: true,
    uniforms: UNIFORMS,
  });

  let fishyBeziers = [
    createBezier(
      [
        new THREE.Vector3(1.0, 0.0, 0.0),
        new THREE.Vector3(0.896, 0.062, 0.0),
        new THREE.Vector3(0.837, 0.107, 0.0),
        new THREE.Vector3(0.766, 0.202, 0.0),
      ],
      1
    ),
    createBezier(
      [
        new THREE.Vector3(0.766, 0.202, 0.0),
        new THREE.Vector3(0.66, 0.208, 0),
        new THREE.Vector3(0.589, 0.217, 0),
        new THREE.Vector3(0.5, 0.25, 0),
      ],
      1
    ),
    createBezier(
      [
        new THREE.Vector3(0.5, 0.25, 0),
        new THREE.Vector3(0.5, 0.41, 0),
        new THREE.Vector3(0.5, 0.46, 0),
        new THREE.Vector3(0.5, 0.5, 0),
      ],
      1
    ),
    createBezier(
      [
        new THREE.Vector3(0.5, 0.5, 0),
        new THREE.Vector3(0.5, 0.575, 0),
        new THREE.Vector3(0.5, 0.625, 0),
        new THREE.Vector3(0.5, 0.75, 0),
      ],
      1
    ),
    createBezier(
      [
        new THREE.Vector3(0.5, 0.75, 0),
        new THREE.Vector3(0.411, 0.783, 0),
        new THREE.Vector3(0.34, 0.792, 0),
        new THREE.Vector3(0.234, 0.798, 0),
      ],
      1
    ),
    createBezier(
      [
        new THREE.Vector3(0.234, 0.798, 0),
        new THREE.Vector3(0.163, 0.893, 0),
        new THREE.Vector3(0.104, 0.938, 0),
        new THREE.Vector3(0.0, 1.0, 0),
      ],
      1
    ),
    createBezier(
      [
        new THREE.Vector3(0.0, 1.0, 0),
        new THREE.Vector3(-0.042, 0.834, 0),
        new THREE.Vector3(-0.056, 0.73, 0),
        new THREE.Vector3(-0.032, 0.564, 0),
      ],
      2
    ),
    createBezier(
      [
        new THREE.Vector3(-0.032, 0.564, 0),
        new THREE.Vector3(-0.132, 0.452, 0),
        new THREE.Vector3(-0.194, 0.372, 0),
        new THREE.Vector3(-0.25, 0.25, 0),
      ],
      2
    ),
    createBezier(
      [
        new THREE.Vector3(-0.25, 0.25, 0),
        new THREE.Vector3(-0.15, 0.15, 0),
        new THREE.Vector3(-0.05, 0.05, 0),
        new THREE.Vector3(0.0, 0.0, 0),
      ],
      2
    ),
  ];
  let fishGeometry= BufferGeometryUtils.mergeGeometries(fishyBeziers);
  let fish = new THREE.Mesh(fishGeometry, material);
  return fish;
}
