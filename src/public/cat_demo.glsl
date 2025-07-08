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

float sdSphere(vec3 p, float radius) {
  return length(p-1.5-sin(iTime))*2.0+0.4*sin(iTime) - radius;
}
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

float scene(vec3 p) {
  float distance = sdSphere(p, 1.0);

  float f = fbm(p);

  return -distance + f;
}

const float MARCH_SIZE = 0.08;

vec4 raymarch(vec3 rayOrigin, vec3 rayDirection) {
  float depth = 0.0;
  vec3 p = rayOrigin + depth * rayDirection;
  
  vec4 res = vec4(0.0);

  for (int i = 0; i < MAX_STEPS; i++) {
    float density = scene(p);

    if (density > 0.0) {
      vec4 color = vec4(mix(vec3(1.0,1.0,1.0), vec3(0.0, sin(iTime), 0.0), density), density );
      color.rgb *= color.a;
      res += color*(1.0-res.a);
    }

    depth += MARCH_SIZE;
    p = rayOrigin + depth * rayDirection;
  }

  return res;
}

void main() {
    vec3 ro = vec3(0.0, 0.0, 5.0);

    vec2 uv = vUv.xy;
    uv += 1.0; 
    uv *= 0.5; 
    uv.y = 1.0 - uv.y;
    float frame = float(boardstate[0]);
    float xPos = float(boardstate[1]);

    float timeScaled = iTime / 10.0; 
    float deltaX = mod(xPos/1500.0,1.1);
    float deltaY = 0.0;// 0.05*sin(2.0*iTime);
    vec2 catX = vec2(-0.2+deltaX,0.0+deltaX);
    vec2 catY = vec2(0.2+deltaY,0.3+deltaY);
    float scaleX = 1.0/(catX.y - catX.x);
    float scaleY = 1.0/(catY.y - catY.x);
  
    vec3 ray_direction = normalize(vec3(uv, -1.0));
    if (uv.x > catX.x && uv.x < catX.y && uv.y > catY.x && uv.y < catY.y) {
      vec2 catPos = vec2(0.0, 0.0);
      catPos.x = (uv.x-catX.x)*scaleX/frameCount+frame*pixelsPrFrame/pixelsX;
      catPos.y = (uv.y-catY.x)*scaleY;
      fragColor = textureLod(u_texture, catPos, 0.0);
      if (fragColor.a < 0.1) {
        fragColor = vec4(raymarch(ro, ray_direction).rgb, 1.0);
      }
    } else {
        fragColor = vec4(raymarch(ro, ray_direction).rgb, 1.0);
   // fragColor = vec4(color);

  }
}
