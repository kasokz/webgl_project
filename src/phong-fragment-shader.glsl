precision mediump float;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_pos;

const float kA = 0.6;
const float kD = 0.8;
const float kS = 0.8;
const vec3 lightPos = vec3(0.,0.,-10.);
const float shininess=16.;

vec4 ambient() {
  return v_color * kA;
}

vec4 diffuse() {
  float lambertian = max(dot(normalize(lightPos - v_pos), v_normal), .0);
  return v_color * kD * lambertian;
}

vec4 specular() {
  vec3 l = normalize(lightPos - v_pos);
  vec3 r = reflect(-l,v_normal);
  vec3 v = normalize(-v_pos+vec3(0.,0.,-1.));
  return v_color * kS * pow(max(dot(r,v),0.0), shininess);
}

void main(void){
  gl_FragColor=vec4((ambient() + diffuse() + specular()).xyz, 1.0);
}
