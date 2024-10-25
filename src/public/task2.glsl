#include <common>
varying vec2 vUv;
uniform float iTime;

void main() {
  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = vUv.st * 2.0 - 1.0;

  gl_FragColor = vec4(sin(iTime*3.0), uv.y, 0.5, 0.5);
}
