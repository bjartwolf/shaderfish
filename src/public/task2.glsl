#version 300 es 
precision highp float;
uniform float iTime;
in vec2 vUv;
out vec4 fragColor;

void main() {
  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = vUv.st * 2.0 - 1.0;

  fragColor = vec4(sin(iTime*3.0), uv.y, 0.5, 0.5);
}
