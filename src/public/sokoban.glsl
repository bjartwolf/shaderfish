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

const float MARCH_SIZE = 0.08;

vec4 raymarch(vec3 rayOrigin, vec3 rayDirection) {
  float depth = 0.0;
  vec3 p = rayOrigin + depth * rayDirection;
  
  vec4 res = vec4(0.0);

  for (int i = 0; i < MAX_STEPS; i++) {
    float density = scene(p);

    if (density > 0.0) {
      vec4 color = vec4(mix(vec3(1.0,1.0,1.0), vec3(0.0, 0.0, 0.0), density), density );
      color.rgb *= color.a;
      res += color*(1.0-res.a);
    }

    depth += MARCH_SIZE;
    p = rayOrigin + depth * rayDirection;
  }

  return res;
}

const float boardSize = 8.0; 
const float nrOfPictureRows = 3.0;
const float nrOfColumns = 2.0;

void main() {
    vec2 uv = vUv.xy;
    uv += 1.0; 
    uv *= 0.5; 
   // uv += 0.01*fbm(vec3(uv,0.0)) - 0.05;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      fragColor = vec4(1.0, 1.0, 1.0, 1.0);
      return; 
    }
    uv.y = 1.0 - uv.y; 
//    uv.x *= iResolution.x / iResolution.y;
    
    // figure out which col and row we are in, really
    int col = int(floor(uv.x * boardSize)); 
    int row = int(floor(uv.y * boardSize)); 
    float pictureRow = 0.0; // default empty
    float pictureCol= 0.0; // default empty 

    int i = 8 * row + col; 
    if (boardstate[i] == 1) {
      pictureRow = 0.0; // stein
      pictureCol= 1.0; 
    } else if (boardstate[i] == 2) {
      pictureRow = 1.0; // cat 
      pictureCol= 0.0; //
      vec3 ro = vec3(0.0, 0.0, 5.0);
      float mapX = (uv.x-(float(col)/8.0))/nrOfColumns*boardSize + pictureCol/nrOfColumns;
      float mapY = (uv.y-(float(row)/8.0))/nrOfPictureRows*boardSize+pictureRow/nrOfPictureRows;
      vec4 catColor = textureLod(u_texture, vec2(mapX, mapY), 0.0);

      // this is gray, because it is not white or black...
      if (catColor.r > 0.01 && catColor.r < 0.999999999999999999) {
          // obvious thing to do is use volumetric ray marching to texture the cat
          vec3 ro = vec3(0.0, 0.0, 5.0);
          vec3 ray_direction = normalize(vec3(uv.x-0.5,uv.y-0.5, -1.0));
          catColor = vec4(raymarch(ro, ray_direction).rgb, 1.0);
      }
      fragColor = catColor;
      return;


    } else if (boardstate[i] == 3) {
      pictureRow = 1.0; // nøste 
      pictureCol= 1.0; //
    } else if (boardstate[i] == 4) {
      pictureRow = 2.0; // emptygoal 
      pictureCol= 0.0; //
    } else if (boardstate[i] == 5) {
      pictureRow = 2.0; // goal 
      pictureCol= 1.0; //
    }
  
    float mapX = (uv.x-(float(col)/8.0))/nrOfColumns*boardSize + pictureCol/nrOfColumns;
    float mapY = (uv.y-(float(row)/8.0))/nrOfPictureRows*boardSize+pictureRow/nrOfPictureRows;
      
      vec3 ro = vec3(0.0, 0.0, 5.0);
      fragColor = textureLod(u_texture, vec2(mapX, mapY), 0.0);
}
