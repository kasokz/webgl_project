precision mediump float;

uniform vec3 lightPositions[8];
const int maxLights = 8;
uniform int lights;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_pos;

uniform float kA;
uniform float kD;
uniform float kS;
uniform float shininess;

vec4 ambient() {
  return v_color * kA;
}

vec4 diffuse(vec3 lightPos) {
  float lambertian = max(dot(normalize(lightPos - v_pos), v_normal), .0);
  return v_color * kD * lambertian;
}

vec4 specular(vec3 lightPos) {
  vec3 l = normalize(lightPos - v_pos);
  vec3 r = reflect(-l,v_normal);
  vec3 v = normalize(-v_pos);
  return v_color * kS * pow(max(dot(r,v),0.0), shininess);
}

void main(void){
  gl_FragColor=vec4(ambient().xyz, 1.);
  for(int i = 0; i < maxLights; i++) {
    if (i < lights) {
      gl_FragColor+=(diffuse(lightPositions[i]) + specular(lightPositions[i]));
    }
  }
  gl_FragColor.a = 1.;
}
