import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const fragmentShaderCode = `
uniform float time;
uniform sampler2D fishTexture;
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(fishTexture, vUv*1.0);
} `;

const vertexShaderCodeInstanced = `
uniform float time;
varying vec2 vUv;

void main() {
  //vUv = uv;
  vUv = position.xy;
  vec4 msc = vec4(position.xyz, 1.0);
  if (color.g > 0.5) {
    float t = 1.0-abs(sin(time));
    vec2 P0 = vec2(msc.x,msc.y); 
    msc.xy = P0 - t*((P0.x+P0.y-1.0)/2.0);
  } else if (color.r > 0.5) {
    msc.x = msc.x*abs(sin(time));
  } else if (color.b > 0.5) {
    msc.y = msc.y*abs(sin(time));
  }
  vec4 worldSpaceCoordinates = modelViewMatrix * instanceMatrix * msc;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;

  gl_Position = screenSpaceCoordinate;
}
`;

export async function createInstancedFish(UNIFORMS) {
  let instancedMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCodeInstanced,
    fragmentShader: fragmentShaderCode,
    vertexColors: true,
    //    wireframe: true,
    transparent: true,
    uniforms: UNIFORMS
  });
 console.log(UNIFORMS)

  return new Promise((resolve, reject) => {
    loader.load(
      "/flatfish1.glb",

      function (gltf) {
        let mesh = gltf.scene.children[0];
        console.log("loaded instanced fish");

        let fish = new THREE.InstancedMesh(
          mesh.geometry,
          instancedMaterial,
          10000
        );
        resolve(fish);
      },
      undefined,
      function (error) {
        reject(error); 
      }
    );
  });
}