import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const fragmentShaderCode = `
uniform float time;
uniform sampler2D fishTexture;
varying vec2 vUv;
varying vec3 fish_colors;

void main() {
  gl_FragColor = texture2D(fishTexture, vUv*1.0);
  vec2 normalized_position= vec2(vUv.x -0.2 ,vUv.y-0.3)*1.0;
  float distance = length(normalized_position); 
  float adjust = distance*distance;

  gl_FragColor.xyz= mix(fish_colors.xyz*gl_FragColor.xyz, gl_FragColor.xyz+gl_FragColor.xyz*0.7,adjust);
} `;

const vertexShaderCodeInstanced = `
uniform float time;
attribute vec3 fish_color;
varying vec2 vUv;
varying vec3 fish_colors;

void main() {
  //vUv = uv;
  vUv = position.xy;
  vec4 msc = vec4(position.xyz, 1.0);
  float interpolate = abs(sin(time))*0.7+0.3;
  if (color.g > 0.5) {
    float t = 1.0-interpolate;
    vec2 P0 = vec2(msc.x,msc.y); 
    msc.xy = P0 - t*((P0.x+P0.y-1.0)/2.0);
  } else if (color.r > 0.5) {
    msc.x = msc.x*interpolate;
  } else if (color.b > 0.5) {
    msc.y = msc.y*interpolate;
  }
  vec4 worldSpaceCoordinates = modelViewMatrix * instanceMatrix * msc;
  vec4 screenSpaceCoordinate = projectionMatrix * worldSpaceCoordinates;
  fish_colors= fish_color;
  
  gl_Position = screenSpaceCoordinate;
}
`;

export async function createInstancedFish(UNIFORMS, numberOfFish) {
  let instancedMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShaderCodeInstanced,
    fragmentShader: fragmentShaderCode,
    vertexColors: true,
    //    wireframe: true,
    transparent: true,
    uniforms: UNIFORMS,
    side: THREE.DoubleSide
  });
 console.log(UNIFORMS)

  return new Promise((resolve, reject) => {
    loader.load(
      "/flatfish2.glb",

      function (gltf) {
        let mesh = gltf.scene.children[0];
        console.log("loaded instanced fish");

        let fish = new THREE.InstancedMesh(
          mesh.geometry,
          instancedMaterial,
          numberOfFish 
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