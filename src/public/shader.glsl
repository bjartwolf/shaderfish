#include <common>

uniform vec3 iResolution;
uniform float iTime;
varying vec2 vUv;

float distance_from_sphere(in vec3 p, in vec3 c, float r) {
  return min(
    length(p - c)- r,
    length(p-(c+vec3(-1.1,1.0,1.3)))-r
  );
}

float map_the_world(in vec3 p) {
  float displacement = sin(1.0 * p.x*iTime) * sin(2.0 * p.y/iTime) * sin(1.0 * p.z) * 0.95;
  float sphere_0 = distance_from_sphere(p, vec3(0.0), 1.0);

  return sphere_0 + displacement;
}

vec3 calculate_normal(in vec3 p) {
  const vec3 small_step = vec3(0.0001, 0.0, 0.0);

  float gradient_x = map_the_world(p + small_step.xyy) - map_the_world(p - small_step.xyy);
  float gradient_y = map_the_world(p + small_step.yxy) - map_the_world(p - small_step.yxy);
  float gradient_z = map_the_world(p + small_step.yyx) - map_the_world(p - small_step.yyx);

  vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

  return normalize(normal);
}


vec3 light_position = vec3(0.0, 0.0, -10.0);
vec3 camera_position = vec3(0.0, 1.0, -4.0);

vec3 ray_march(in vec3 ro, in vec3 ray_direction) {
  float total_distance_traveled = 0.0;
  const int NUMBER_OF_STEPS = 32;
  const float MINIMUM_HIT_DISTANCE = 0.001;
  const float MAXIMUM_TRACE_DISTANCE = 1000.0;

  for (int i = 0; i < NUMBER_OF_STEPS; ++i)
  {
    vec3 current_position = ro + total_distance_traveled * ray_direction;

    float distance_to_closest = map_the_world(current_position);

    if (distance_to_closest < MINIMUM_HIT_DISTANCE) {
      vec3 normal = calculate_normal(current_position);

      // i flipped it
      //vec3 direction_to_light = normalize(current_position - light_position);
      vec3 direction_to_light = normalize(light_position - current_position);

      float diffuse_intensity = max(0.2, dot(normal, direction_to_light));

      return (current_position.zxy+ 0.0)  * diffuse_intensity;
    }

    if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
        break;
    }

    total_distance_traveled += distance_to_closest;
  }
  return vec3(0.0);
}

void main() {
  vec2 uv = vUv.st * 2.0 - 1.0;

  vec3 ray_origin = camera_position;
  vec3 ray_direction = vec3(uv, 1.0);

  vec3 shaded_color = ray_march(ray_origin, ray_direction);

  gl_FragColor = vec4(shaded_color, 1.0);
}
