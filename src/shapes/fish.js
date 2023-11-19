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

/// I am not convinced the "flattening" to the y and x axis is actually maintaining the proper
/// perspective required for perfect composition, but for now I guess it is ok.
/// It could possibly work to just have the one line animated and use composition of those
/// using matrixes and compose them to one fish. That would lead to some issues later with pixelshaders
const vertexShaderCodeInstanced = `
uniform float time;
varying vec2 vUv;

void main() {
  //vUv = uv;
  vUv = position.xy;
  vec4 modelSpaceCoordinates = vec4(position.xyz, 1.0);
  if (color.g > 0.5) {
    modelSpaceCoordinates.y = ((1.0-modelSpaceCoordinates.x)*(1.0-abs(sin(time)))+modelSpaceCoordinates.y*(abs(sin(time))));
  } else if (color.r > 0.5) {
    modelSpaceCoordinates.x = modelSpaceCoordinates.x*abs(sin(time));
  } else if (color.b > 0.5) {
    modelSpaceCoordinates.y = modelSpaceCoordinates.y*abs(sin(time));
  }
  vec4 worldSpaceCoordinates = modelViewMatrix * instanceMatrix * modelSpaceCoordinates;
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