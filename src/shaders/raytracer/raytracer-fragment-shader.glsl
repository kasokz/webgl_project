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

struct Hit
{
  vec3    position;
  vec3    normal;
  float   t;
  vec4 color;
};

struct Sphere
{
  // coords + radius
  vec3    center;
  float   radius;
  vec4 color;
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

uniform vec3 lightPositions[8];
const int maxLights = 8;
uniform int lights;

Sphere sphereObjects[7];
const int maxSpheres = 64;
uniform vec3 camera;
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
      sphereObjects[i].color = sphereColors[i];
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
  }

  for (int i = 0; i < 7; ++i)
  {
    t = intersectRaySphere(ray, sphereObjects[i]);
    if (t >= 0.0 && t <= hit.t)
    {
      vec3 pos = ray.origin + ray.direction * t;
      vec3 N = normalize(pos - sphereObjects[i].center);
      hit.t = t;
      hit.normal = N;
      hit.color = sphereObjects[i].color;
      hit.position = pos;
    }
  }

  return hit.t < START_T;
}

vec4 diffuse(vec3 lightPos, vec3 hit, vec3 normal, vec4 color) {
  float lambertian = max(dot(normalize(lightPos - hit), normal), .0);
  return color * kD * lambertian;
}

vec4 specular(vec3 lightPos, vec3 hit, vec3 normal, vec4 color) {
  vec3 l = normalize(lightPos - hit);
  vec3 r = reflect(-l,normal);
  vec3 v = normalize(camera - hit);
  return color * kS * pow(max(dot(r,v),0.0), shininess);
}

void main()
{
  Ray ray = initRay();
  initScene();
  vec4 color = vec4(ray.direction, 1.0);
  Hit hit;
  if (traceScene(ray, hit))
  {
    color = kA * hit.color;
    for(int i = 0; i < maxLights; i++) {
      if (i < lights) {
        color += (diffuse(lightPositions[i], hit.position, hit.normal, hit.color) +
          specular(lightPositions[i], hit.position, hit.normal, hit.color));
      }
    }
  }
  gl_FragColor = color;
}