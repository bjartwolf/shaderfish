#version 300 es 
// based on 
// https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/
precision highp float;
uniform sampler2D u_texture;
uniform vec2 iResolution;
uniform float iTime;
in vec2 vUv;
out vec4 fragColor;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);
    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);
    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);
    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));
    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float fbm(vec3 p) {
  vec3 q = p + iTime * 0.5 * vec3(1.0, -0.2, -1.0);
  float g = noise(q);

  float f = 0.0;
  float scale = 0.5;
  float factor = 2.02;

  for (int i = 0; i < 6; i++) {
      f += scale * noise(q);
      q *= factor;
      factor += 0.21;
      scale *= 0.5;
  }

  return f;
}


void main() {
    vec2 uv = vUv.xy;
    uv += 1.0; 
    uv *= 0.5; 
    uv += 0.1*fbm(vec3(uv,0.0));
//    uv.x *= iResolution.x / iResolution.y;
    

    if (uv.x >= 0.0 && uv.x <= 0.5 && uv.y >= 0.33333 && uv.y <= 0.66666) {
      
      fragColor = textureLod(u_texture, vec2(uv.x, 1.0-uv.y ), 0.0);
    } else {
        fragColor = vec4(0.0);
    }

  //    fragColor = vec4(0.0);
  //    fragColor = vec4(uv.x,uv.y,0.0,1.0); 
}
