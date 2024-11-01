#version 300 es 
// based on 
// https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/
precision highp float;
uniform sampler2D u_texture;
uniform vec2 iResolution;
uniform float iTime;
in vec2 vUv;
out vec4 fragColor;
uniform int boardstate[64];

#define MAX_STEPS 70

const float frameCount = 8.0; 

void main() {
    vec2 uv = vUv.xy;
    uv += 1.0; 
    uv *= 0.5; 
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      fragColor = vec4(1.0, 1.0, 1.0, 1.0);
      return; 
    }
    float frame = float(boardstate[0]);
    uv.y = mod((1.0 - uv.y)*2.0,1.0);
    uv.x = mod((uv.x)/frameCount,1.0);
    
    fragColor = textureLod(u_texture, uv, 0.0);
}
