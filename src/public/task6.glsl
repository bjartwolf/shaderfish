#version 300 es 
// based on 
// https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
in vec2 vUv;
out vec4 fragColor;

#define MAX_STEPS 70
#define EPSILON 0.01

float sdSphere(vec3 p, float radius) {
  return length(p) - radius;
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

vec3 getNormal(vec3 p) {
  // a small unit vector to use as a basis to create the others
  vec2 e = vec2(EPSILON, 0.0);

  vec3 delta_x = e.xyy;
  vec3 delta_y = e.yxy;
  vec3 delta_z = e.yyx;
  vec3 n = scene(p) - vec3( scene(p-delta_x), scene(p-delta_y), scene(p-delta_z));

  return normalize(n);
}


const float MARCH_SIZE = 0.08;
const vec3 SUN_POSITION = vec3(1.0, 0.0, 0.0);
vec4 raymarch(vec3 rayOrigin, vec3 rayDirection) {
  float depth = 0.0;
  vec3 p = rayOrigin + depth * rayDirection;
  
  vec4 res = vec4(0.0);

  for (int i = 0; i < MAX_STEPS; i++) {
    float density = scene(p);

    if (density > 0.0) {
      float diffuse = clamp((scene(p) - scene(p + 0.3 * SUN_POSITION)) / 0.3, 0.0, 1.0 );
      vec3 lin = vec3(0.60,0.60,0.75) * 1.1 + 0.8 * vec3(1.0,0.6,0.3) * diffuse;
      vec4 color = vec4(mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), density), density );
      color.rgb *= lin;
      color.rgb *= color.a;
      res += color * (1.0 - res.a);
    }

   p = rayOrigin + depth * rayDirection;
   depth += MARCH_SIZE;
  }

  return res;
}

void main() {
    vec2 uv = vUv.xy;

    vec3 ro = vec3(0.0, 0.0, 5.0);
//    vec3 lightPosition = vec3(1.0);
    vec3 ray_direction = normalize(vec3(uv, -1.0));
    vec4 color = raymarch(ro, ray_direction);

//    vec3 foo = vec3(fbm(ray_direction));
//    fragColor = vec4(foo, 1.0);
    fragColor = color; 
}
