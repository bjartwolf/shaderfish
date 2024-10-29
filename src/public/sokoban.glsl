#version 300 es 
// based on 
// https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/
precision highp float;
uniform sampler2D u_texture;
uniform vec2 iResolution;
uniform float iTime;
in vec2 vUv;
out vec4 fragColor;

void main() {
    vec2 uv = vUv.xy;
    uv += 1.0; 
    uv *= 0.5; 
//    uv.x *= iResolution.x / iResolution.y;
    

    if (uv.x >= 0.0 && uv.x <= 0.5 && uv.y >= 0.33333 && uv.y <= 0.66666) {
      
      fragColor = textureLod(u_texture, vec2(uv.x, 1.0-uv.y ), 0.0);
    } else {
        fragColor = vec4(0.0);
    }

  //    fragColor = vec4(0.0);
  //    fragColor = vec4(uv.x,uv.y,0.0,1.0); 
}
