#version 300 es 

precision highp float;
uniform vec3 iResolution;
uniform float iTime;
in vec2 vUv;
out vec4 fragColor;

float distance_from_sphere(in vec3 p, in vec3 c, float r) {
  return length(p - c) - r;
}

float map_the_world(in vec3 p) {
  float sphere_0 = distance_from_sphere(p, vec3(0.0,0.0,5.0), 2.0);
  return sphere_0;
}

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
      return vec4(1.0, 0.3,0.4,0.8);
    }

    if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
        break;
    }

    total_distance_traveled += distance_to_closest;
  }
  return vec4(0.0);
}

vec3 camera_position = vec3(-1.0, 2.0, -6.0);
void main() {
  //camera_position += 1.0*abs(sin(iTime*2.0));
  vec2 uv = vUv.st * 2.0 - 1.0;

  vec3 ray_origin = camera_position;
  vec3 ray_direction = vec3(uv, 1.0);

  vec4 shaded_color = ray_march(ray_origin, ray_direction);

  fragColor = shaded_color;
}
