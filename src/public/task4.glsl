precision highp float;

uniform vec3 iResolution;
uniform float iTime;
varying vec2 vUv;

float distance_from_sphere(in vec3 p, in vec3 c, float r) {
  return length(p - c)- r;
}

float map_the_world(in vec3 p) {
  float sphere_0 = distance_from_sphere(p, vec3(0.0), 1.0);

  return sphere_0;
}

vec3 calculate_normal(in vec3 p) {
  // We set this so the x element has a small step value and then we build vectors with the direction
  // we want by indexing x where we want a small value and y where not.
  // We could have used z too, both y and z are zero.
  const vec3 small_step = vec3(0.0001, 0.0, 0.0);

  const vec3 delta_x = small_step.xyy;
  const vec3 delta_y = small_step.yxy;
  const vec3 delta_z = small_step.yyx;

  float gradient_x = map_the_world(p + delta_x) - map_the_world(p - delta_x);
  float gradient_y = map_the_world(p + delta_y) - map_the_world(p - delta_y);
  float gradient_z = map_the_world(p + delta_z) - map_the_world(p - delta_z);

  vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

  return normalize(normal);
}


vec3 light_position = vec3(0.0, 0.0, -10.0);
vec3 camera_position = vec3(0.0, 1.0, -4.0);

vec4 ray_march(in vec3 ro, in vec3 ray_direction) {
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

      float diffuse_intensity = max(0.1, 2.0*dot(normal, direction_to_light));

      return vec4(diffuse_intensity*vec3(0.8,0.4,0.4),1.0);
    }

    if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
        break;
    }

    total_distance_traveled += distance_to_closest;
  }
  return vec4(0.0,0.0,0.0,0.0);
}

void main() {
  vec2 uv = vUv.st * 2.0 - 1.0;

  vec3 ray_origin = camera_position;
  vec3 ray_direction = vec3(uv, 1.0);

  gl_FragColor = ray_march(ray_origin, ray_direction);

}
