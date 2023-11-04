export const name = "fish";
import * as THREE from "three";

function createBezier(vectors) {
  const curve = new THREE.CubicBezierCurve3(vectors[0], vectors[1], vectors[2], vectors[3]);
  const points = curve.getPoints(50);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  return lineGeometry;
}

export function createFish(material) {
  let fishyBeziers = [
    createBezier([
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
      new THREE.Vector2(-0.15, 0.15),
      new THREE.Vector2(-0.05, 0.05),
      new THREE.Vector2(0.0, 0.0),
    ]),
  ];
  let group = new THREE.Group();
  fishyBeziers.forEach((fishGeometry) => {
    const line = new THREE.Line(fishGeometry, material);
    group.add(line);
  });
  return group;
}
