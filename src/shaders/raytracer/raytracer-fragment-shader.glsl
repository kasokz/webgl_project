precision mediump float;

varying vec3 rayDirection;
varying vec3 rayOrigin;

// point light
uniform vec3 light0;

struct Ray
{
  vec3    origin;
  vec3    direction;
};

struct Material
{
  vec3  diffuse;
  float   reflectance;
};


struct Hit
{
  vec3    position;
  vec3    normal;
  float   t;

  Material  material;
};

struct Sphere
{
  // coords + radius
  vec3    center;
  float   radius;
  Material  material;
};


// a small epsilon to work around the biggest problems with floats
const float EPS = 0.0001;
// 'clear value' for the ray
const float START_T = 100000.0;
// maximum recursion depth for rays
const int MAX_DEPTH = 3;


Ray initRay()
{
  Ray r;
  r.origin = rayOrigin;
  r.direction = normalize(rayDirection);
  return r;
}

// intersects the ray with a sphere and returns the line parameter t for
// a hit or -1 if not hit occured
float intersectRaySphere(in Ray ray, in Sphere sphere)
{
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
    return firstHitDistance;
  }
  return -1.;
}

// the scene consists of 7 spheres, a ground plane an a light
Sphere sphereObjects[7];
const int maxSpheres = 64;
uniform vec3 sphereCenters[64];
uniform vec4 sphereColors[64];
uniform float sphereRadii[64];
uniform int spheres;

uniform float kA;
uniform float kD;
uniform float kS;
uniform float shininess;

// initializes the scene
void initScene()
{
  for (int i = 0; i < maxSpheres; i++) {
    if (i < spheres) {
      sphereObjects[i].center = sphereCenters[i];
      sphereObjects[i].radius = sphereRadii[i];
      sphereObjects[i].material.diffuse = vec3(0.7,0.,0.);
      sphereObjects[i].material.reflectance = kS;
    }
  }
}


// traces the scene and reports the closest hit
bool traceScene(in Ray ray, inout Hit hit)
{
  hit.t = START_T;

  float t = START_T;
  if (t >= 0.0 && t <= hit.t)
  {
    hit.t = t;
    hit.position = ray.origin + ray.direction * t;
    hit.normal = vec3(0,1,0);
    hit.material.diffuse  = vec3(0.6);
    hit.material.reflectance = 0.0;//05;
  }

  // then check each of the seven sphers
  for (int i = 0; i < 7; ++i)
  {
    t = intersectRaySphere(ray, sphereObjects[i]);

    // only keep this hit if it's closer (smaller t)
    if (t >= 0.0 && t <= hit.t)
    {
      vec3 pos = ray.origin + ray.direction * t;;
      vec3 N = normalize(pos - sphereObjects[i].center);

      hit.t = t;
      hit.normal = N;
      hit.material = sphereObjects[i].material;
      hit.position = pos;
    }
  }

  return hit.t < START_T;
}


// shades a given hit and returns the final color
vec3 shadeHit(in Hit hit)
{
  vec3 color = hit.material.diffuse;
  // ray to the light
  vec3 L = normalize(light0 - hit.position);
  // test for shadows
  Ray r;
  r.origin = hit.position + hit.normal * EPS;
  r.direction = L;
  // Phong shading with 0.2 min. ambient contribution.
  float s = max(0.2, dot(L,hit.normal));
  color *= s;
  return color;
}

void main()
{
  // create the primary ray
  Ray ray = initRay();
  initScene();
  // the 'clear color' is the ray direction (useful for debugging)
  vec3 color = ray.direction;
  Hit hit;
  // trace the scene and see if we hit something
  if (traceScene(ray, hit))
  {
    // if we do, shade the hit
    color = shadeHit(hit);
  }
  gl_FragColor = vec4(color, 1.0);
}