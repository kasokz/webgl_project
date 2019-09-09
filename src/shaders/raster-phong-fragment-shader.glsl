precision mediump float;

uniform vec3 lightPositions[8];
const int lights = 8;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_pos;

varying float v_kA;
varying float v_kD;
varying float v_kS;
varying float v_shininess;

vec4 ambient() {
  return v_color * v_kA;
}

vec4 diffuse(vec3 lightPos) {
  float lambertian = max(dot(normalize(lightPos - v_pos), v_normal), .0);
  return v_color * v_kD * lambertian;
}

vec4 specular(vec3 lightPos) {
  vec3 l = normalize(lightPos - v_pos);
  vec3 r = reflect(-l,v_normal);
  vec3 v = normalize(-v_pos);
  return v_color * v_kS * pow(max(dot(r,v),0.0), v_shininess);
}

void main(void){
  gl_FragColor=vec4(ambient().xyz, 1.);
  for(int i = 0; i < lights; i++) {
    gl_FragColor+=(diffuse(lightPositions[i]) + specular(lightPositions[i]));
  }
  gl_FragColor.a = 1.;
}
