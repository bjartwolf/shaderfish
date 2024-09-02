import * as THREE from "three";

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
	renderer.autoClearColor = false;

	const camera = new THREE.OrthographicCamera(
		- 1, // left
		1, // right
		1, // top
		- 1, // bottom
		- 1, // near,
		1, // far
	);
	const scene = new THREE.Scene();
	const plane = new THREE.PlaneGeometry( 2, 2 );

	const fragmentShader = `
  #include <common>

  uniform vec3 iResolution;
  uniform float iTime;
  varying vec2 vUv;


float distance_from_sphere(in vec3 p, in vec3 c, float r)
{
    return length(p - c) - r;
}

vec3 ray_march(in vec3 ro, in vec3 rd)
{
    float total_distance_traveled = 0.0;
    const int NUMBER_OF_STEPS = 32;
    const float MINIMUM_HIT_DISTANCE = 0.001;
    const float MAXIMUM_TRACE_DISTANCE = 1000.0;

    for (int i = 0; i < NUMBER_OF_STEPS; ++i)
    {
        vec3 current_position = ro + total_distance_traveled * rd;

        float distance_to_closest = distance_from_sphere(current_position, vec3(0.0), 1.0);

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) 
        {
            return vec3(1.0, 0.0, 0.0);
        }

        if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE)
        {
            break;
        }
        total_distance_traveled += distance_to_closest;
    }
    return vec3(0.0);
}

void main()
{
    vec2 uv = vUv.st * 2.0 - 1.0;

    vec3 camera_position = vec3(0.0, 0.0, -5.0);
    vec3 ro = camera_position;
    vec3 rd = vec3(uv, 1.0);

    vec3 shaded_color = ray_march(ro, rd);

    gl_FragColor  = vec4(shaded_color, 1.0);
}

  `;
  const vertexShader = `
  
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }

`;

	const uniforms = {
		iTime: { value: 0 },
		iResolution: { value: new THREE.Vector3() },
	};
	const material = new THREE.ShaderMaterial( {
		fragmentShader,
		vertexShader,
		uniforms
	} );
	scene.add( new THREE.Mesh( plane, material ) );

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

	function render( time ) {

		time *= 0.001; // convert to seconds

		resizeRendererToDisplaySize( renderer );

		const canvas = renderer.domElement;
		uniforms.iResolution.value.set( canvas.width, canvas.height, 1 );
		uniforms.iTime.value = time;

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
