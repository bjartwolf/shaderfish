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
const float pixelsPrFrame = 16.0; 
float pixelsX = frameCount * pixelsPrFrame; 

void main() {
    vec2 uv = vUv.xy;
    uv += 1.0; 
    uv *= 0.5; 
    uv.y = 1.0 - uv.y;
    if (uv.x < 0.01 || uv.x > 1.00-0.01 || uv.y < 0.0+0.01 || uv.y > 1.0 - 0.01) {
      fragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    float frame = float(boardstate[0]);
    vec2 catPos = vec2(0.0, 0.0);

    float scale = 20.0;
    if (uv.x > 0.0 && uv.x*scale < 1.0 && uv.y > 0.0 && uv.y*scale < 1.0) {
    
      catPos.y = scale*mod(uv.y,1.0)*1.0;
      catPos.x = scale*mod((uv.x)/frameCount,1.0)+frame*pixelsPrFrame/pixelsX;
      
      //float color = texelFetchOffset(u_texture, catPos, 0, vec2(0.5,0.5));
    
      fragColor = textureLod(u_texture, catPos, 0.0);
   // fragColor = vec4(color);
    }
}
