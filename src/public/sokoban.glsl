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
    uv += 0.1*fbm(vec3(uv,0.0)) - 0.05;
//    uv.x *= iResolution.x / iResolution.y;
    
    // figure out which col and row we are in, really
    int col = int(floor(uv.x * 8.0)); 
    int row = int(floor(uv.y * 8.0)); 
    int i = 8 * row + col; 
    if (boardstate[i] == 1) {
      float nrOfPictureRows = 3.0;
      float nrOfColumnRows = 2.0;
      float pictureRow = 1.0; // cat
      float pictureCol= 0.0; // cat
      float y1 = float(row)/8.0; 
      float y2 = float(row+1)/8.0; 
      float deltaY = y2 - y1;
      float x1 = float(col)/8.0; 
      float x2 = float(col+1)/8.0; 
      float deltaX = x2 - x1;
      // remainder of x, how far into the sprite

      float remX = uv.x - x1; 
      float remY = uv.y - y1;
      float mapX = remX*3.0;
      float mapY = 1.0 - (remY*nrOfPictureRows + pictureRow)/nrOfPictureRows;
      
      fragColor = textureLod(u_texture, vec2(mapX+uv.x/8.0, mapY+uv.y/8.0 ), 0.0);
      //fragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
      fragColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
  //    fragColor = vec4(uv.x,uv.y,0.0,1.0); 
}
