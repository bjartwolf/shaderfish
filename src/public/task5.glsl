#version 300 es // to use textureLod..
// based on 
// https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/
// 
precision highp float;

in vec3 iResolution;
uniform float iTime;
uniform sampler2D uNoise;
in vec2 vUv;
out vec4 fragColor;  

float noise(vec3 x ) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);
  vec2 uv = (p.xy+vec2(37.0,239.0)*p.z) + f.xy;
  vec2 tex = textureLod(uNoise,(uv+0.5)/256.0,0.0).yx;

  return mix( tex.x, tex.y, f.z ) * 2.0 - 1.0;
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


float distance_from_sphere(in vec3 p, in vec3 c, float r) {
  return length(p - c)- r;
}
// https://registry.khronos.org/OpenGL-Refpages/gl4/html/textureLod.xhtml
// this is actually a glsl funciton 

vec3 light_position = vec3(0.0, 0.0, -10.0);
vec3 camera_position = vec3(0.0, 1.0, -4.0);

float map_the_world(in vec3 p) {
  // negative distance, we want to know we are inside the sphere
  float sphere_0 = distance_from_sphere(p, vec3(0.0), 1.0);

  return - sphere_0 + fbm(p); // adding noise to the density
}


vec4 ray_march(in vec3 ro, in vec3 ray_direction) {
  float step_size = 0.1;
  const float MARCH_SIZE = 0.08; // fixed step size

  const int NUMBER_OF_STEPS = 100; // we now do fixed steps and fixed iterations
  vec4 res = vec4(0.0);

  float total_distance_traveled = 0.0;
  for (int i = 0; i < NUMBER_OF_STEPS; ++i)
  {
    total_distance_traveled = total_distance_traveled + MARCH_SIZE;
    vec3 current_position = ro + total_distance_traveled * ray_direction;

    float density = map_the_world(current_position);
    if (density > 0.0) {
      // mix is linear interpolation
      // https://registry.khronos.org/OpenGL-Refpages/gl4/html/mix.xhtml
      vec4 color = vec4(mix(vec3(1.0,1.0,1.0), vec3(0.0, 0.0, 0.0), density), density );
      color.rgb *= color.a;
      // 1 - res.a is the opposite of the current alpha so far
      // so the darker we are the less we add. sort of like 
      // the light dissapearing as we enter it in the same direction we are walking
      res += color * (1.0 - res.a);
      //      My initial attempt before copypasting
//      res = res + vec4(0.1,0.1,0.0,0.03);
    }


//      vec3 normal = calculate_normal(current_position);

      // i flipped it
      //vec3 direction_to_light = normalize(current_position - light_position);
 //     vec3 direction_to_light = normalize(light_position - current_position);

  //    float diffuse_intensity = max(0.1, 2.0*dot(normal, direction_to_light));

   //   return vec4(diffuse_intensity*vec3(0.8,0.4,0.4),1.0);
    }

  return res; 
}

void main() {
  vec2 uv = vUv.st * 2.0 - 1.0;

  vec3 ray_origin = camera_position;
  vec3 ray_direction = vec3(uv, 1.0);

  fragColor = ray_march(ray_origin, ray_direction);

}
