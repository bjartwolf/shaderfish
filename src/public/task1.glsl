precision highp float;
varying vec2 vUv;

void main() {
  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = vUv.st * 2.0 - 1.0;

  // set the 4D vector with R,G,B and alpha
  // try changing them.
  // You can try fancy stuff like sin(uv.x*10.0)
  // indexing with multiple like uv.xy gives two components etc
  // glsl is really good at working with vectors

  gl_FragColor = vec4(uv.x, uv.y, 0.5, 0.5);
  //gl_FragColor = vec4(sin(uv.xy*5.0), 0.5, 0.5);
}
