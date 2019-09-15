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

const Sphere nullSphere = Sphere(vec3(-10000., -10000., -10000.), vec4(0.,0.,0.,0.), 0.);

struct Intersection {
  float t;
  vec3 hit;
  vec3 normal;
};

bool closerThan(Intersection i1, Intersection i2) {
    if (i1.t < i2.t) {
      return true;
    } else {
      return false;
    }
}

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

const int reflections = 3;

varying vec3 rayOrigin;
varying vec3 rayDirection;

uniform float kA;
uniform float kD;
uniform float kS;
uniform float shininess;

vec4 ambient(vec4 color) {
  return color * kA;
}

vec4 diffuse(Intersection intersection, vec4 color, vec3 lightPos) {
  float lambertian = max(dot(normalize(lightPos - intersection.hit), intersection.normal), .0);
  return color * kD * lambertian;
}

vec4 specular(Intersection intersection, vec4 color, vec3 lightPos) {
  vec3 l = normalize(lightPos - intersection.hit);
  vec3 r = reflect(-l,intersection.normal);
  vec3 v = normalize(-intersection.hit);
  return color * kS * pow(max(dot(r,v),0.0), shininess);
}

vec4 getPhongColor(vec4 color, Intersection intersection) {
  vec4 result = vec4(ambient(color).xyz, 1.);
  for(int i = 0; i < maxLights; i++) {
    if (i < lights) {
      result += (diffuse(intersection, color, lightPositions[i]) + specular(intersection, color, lightPositions[i]));
    }
  }
  result.a = 1.;
  return result;
}


void main(void) {
  Ray ray = Ray(rayOrigin, normalize(rayDirection));
  Intersection minIntersection = Intersection(100000., vec3(0.,0.,0.), vec3(0.,0.,0.));
  Sphere minSphere = nullSphere;
  for (int i = 0; i < maxSpheres; i++) {
    if (i < spheres) {
      Sphere currentSphere = Sphere(sphereCenters[i], sphereColors[i], sphereRadii[i]);
      Intersection intersection = intersect(currentSphere,  ray);
      if (intersection != miss && closerThan(intersection, minIntersection)) {
        minIntersection = intersection;
        minSphere = currentSphere;
      }
    }
  }
  if(minSphere != nullSphere) {
    gl_FragColor = getPhongColor(minSphere.color, minIntersection);
    // gl_FragColor = vec4(1.,1.,1.,1.);
  } else {
    gl_FragColor = vec4(0.8,0.8,0.8,.5);
  }
  gl_FragColor = vec4(normalize(rayDirection), 1.);
}