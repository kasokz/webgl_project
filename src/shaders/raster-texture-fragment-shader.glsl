precision mediump float;

uniform sampler2D sampler;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_pos;

varying float v_kA;
varying float v_kD;
varying float v_kS;
varying float v_shininess;
const vec3 lightPos = vec3(.2,.6,-.5);

float ambient() {
  return v_kA;
}

float diffuse() {
  float lambertian = max(dot(normalize(lightPos - v_pos), v_normal), .0);
  return v_kD * lambertian;
}

float specular() {
  vec3 l = normalize(lightPos - v_pos);
  vec3 r = reflect(-l,v_normal);
  vec3 v = normalize(-v_pos);
  return v_kS * pow(max(dot(r,v),0.0), v_shininess);
}

void main( void ) {
  vec4 textureColor = texture2D(sampler, v_texCoord);
  gl_FragColor=vec4((textureColor*ambient() + textureColor* diffuse() + textureColor* specular()).xyz, 1.0);
}
