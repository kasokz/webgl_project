precision mediump float;

uniform vec3 lightPositions[8];
const int lights = 8;

uniform sampler2D sampler;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_pos;

varying float v_kA;
varying float v_kD;
varying float v_kS;
varying float v_shininess;

float ambient() {
  return v_kA;
}

float diffuse(vec3 lightPos) {
  float lambertian = max(dot(normalize(lightPos - v_pos), v_normal), .0);
  return v_kD * lambertian;
}

float specular(vec3 lightPos) {
  vec3 l = normalize(lightPos - v_pos);
  vec3 r = reflect(-l,v_normal);
  vec3 v = normalize(-v_pos);
  return v_kS * pow(max(dot(r,v),0.0), v_shininess);
}

void main( void ) {
  vec4 textureColor = texture2D(sampler, v_texCoord);
  gl_FragColor=vec4((textureColor*ambient()).xyz, 1.0);
  for(int i = 0; i < lights; i++) {
    gl_FragColor=vec4((textureColor* diffuse(lightPositions[i]) + textureColor* specular(lightPositions[i])).xyz, 1.0);
  }
  gl_FragColor.a = 1.;
}
