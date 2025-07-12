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
#include "ray_march.frag"
const float frameCount = 8.0; 
const float pixelsPrFrame = 16.0; 
float pixelsX = frameCount * pixelsPrFrame; 

void main() {
    vec3 ro = vec3(0.0, 0.0, 5.0);
    vec2 uv = vUv.xy;
    uv += 1.0; 
    uv *= 0.5; 
    uv.y = 1.0 - uv.y;
    float frame = float(boardstate[0]);
    float xPos = float(boardstate[1]);

    float timeScaled = iTime / 10.0; 
    float deltaX = mod(xPos/320.0*0.2,1.1);
    float deltaY = 0.5;//0.3*sin(1.0*iTime*5.0);
    vec2 catX = vec2(-0.2+deltaX,0.0+deltaX);
    vec2 catY = vec2(0.2+deltaY,0.4+deltaY);
    float scaleX = 1.0/(catX.y - catX.x);
    float scaleY = 1.0/(catY.y - catY.x);
  
    vec3 ray_direction = normalize(vec3(uv, -1.0));
    if (uv.x > catX.x && uv.x < catX.y && uv.y > catY.x && uv.y < catY.y) {
      vec2 catPos = vec2(0.0, 0.0);
      catPos.x = (uv.x-catX.x)*scaleX/frameCount+frame*pixelsPrFrame/pixelsX;
      catPos.y = (uv.y-catY.x)*scaleY;
      fragColor = textureLod(u_texture, catPos, 0.0);
      if (fragColor.a < 0.1) {
       // fragColor = vec4(raymarch(ro, ray_direction).rgb, 1.0);
        fragColor = vec4(64.0/255.0,64.0/255.0,1.0,1.0); 
      }
    } else if (uv.y > catY.y) {
        fragColor = vec4(0.0/255.0,64.0/255.0,64.0/255.0,1.0); 
    } else {
        fragColor = vec4(64.0/255.0,64.0/255.0,1.0,1.0); 
    }
//      fragColor = vec4(raymarch(ro, ray_direction).rgb, 1.0);
   // fragColor = vec4(color);
}
