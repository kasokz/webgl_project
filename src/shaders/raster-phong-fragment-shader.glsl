precision mediump float;

varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_pos;

varying float v_kA;
varying float v_kD;
varying float v_kS;
varying float v_shininess;
const vec3 lightPos = vec3(.2,.6,-.5);

vec4 ambient() {
  return v_color * v_kA;
}

vec4 diffuse() {
  float lambertian = max(dot(normalize(lightPos - v_pos), v_normal), .0);
  return v_color * v_kD * lambertian;
}

vec4 specular() {
  vec3 l = normalize(lightPos - v_pos);
  vec3 r = reflect(-l,v_normal);
  vec3 v = normalize(-v_pos);
  return v_color * v_kS * pow(max(dot(r,v),0.0), v_shininess);
}

void main(void){
  gl_FragColor=vec4((ambient() + diffuse() + specular()).xyz, 1.0);
//  gl_FragColor=vec4((v_normal+vec3(1.,1.,1.)) / 2., 1.0);
}
