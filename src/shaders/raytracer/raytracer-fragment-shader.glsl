precision mediump float;

struct Ray {
  vec3 origin;
  vec3 direction;
};

struct Sphere {
  vec3 center;
  vec4 color;
  float radius;
};

struct Intersection {
  float t;
  vec3 hit;
  vec3 normal;
};

const Intersection miss = Intersection(0.0, vec3(0.0), vec3(0.0));

Intersection intersect(Sphere sphere, Ray ray) {
  vec3 rayOrigin = ray.origin;
  vec3 rayDir = ray.direction;
  float t = dot((sphere.center - rayOrigin), rayDir);
  vec3 ortho = rayOrigin + (rayDir * t);
  float y = length(sphere.center - ortho);
  if(y < sphere.radius) {
    float x = sqrt(sphere.radius * sphere.radius - y * y);
    float t1 = t - x;
    float t2 = t + x;
    float firstHitDistance = min(t1, t2);
    return Intersection(firstHitDistance,
      rayOrigin + (rayDir * firstHitDistance),
      normalize((rayOrigin + (rayDir * firstHitDistance)) - sphere.center));
  }
  return miss;
}

const int maxSpheres = 64;
uniform vec3 sphereCenters[64];
uniform vec4 sphereColors[64];
uniform float sphereRadii[64];
uniform int spheres;

uniform vec3 lightPositions[8];
const int maxLights = 8;
uniform int lights;

varying vec3 v_position;

const int reflections = 3;

void main(void) {
  gl_FragColor = vec4(0.5,0.5,0.5,1.);
  Sphere sphere = Sphere(sphereCenters[0], sphereColors[0], sphereRadii[0]);
  float normalizedX = v_position.x - sphere.center.x + 2.2;
	float normalizedY = v_position.y - sphere.center.y + 2.2;
  if (sqrt(normalizedX * normalizedX + normalizedY * normalizedY) < 2.) {
	  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else {
	  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
  // gl_FragColor = vec4(sphere.center.x, sphere.center.y, sphere.center.z,1.);
}