precision mediump float;

uniform vec3 lightPositions[8];
const int maxLights = 8;
uniform int lights;

uniform sampler2D sampler;
uniform sampler2D normalSampler;

varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_pos;

uniform float kA;
uniform float kD;
uniform float kS;
uniform float shininess;

float ambient() {
  return kA;
}

float diffuse(vec3 lightPos, vec3 normal) {
  float lambertian = max(dot(normalize(lightPos - v_pos), normal), .0);
  return kD * lambertian;
}

float specular(vec3 lightPos, vec3 normal) {
  vec3 l = normalize(lightPos - v_pos);
  vec3 r = reflect(-l, normal);
  vec3 v = normalize(-v_pos);
  return kS * pow(max(dot(r,v),0.0), shininess);
}

void main( void ) {
  vec4 textureColor = texture2D(sampler, v_texCoord);
  vec4 normalCoord = 2.*(texture2D(normalSampler, v_texCoord))-1.;
  gl_FragColor=vec4((textureColor*ambient()).xyz, 1.0);
  for(int i = 0; i < maxLights; i++) {
    if (i < lights) {
      gl_FragColor += vec4((textureColor* diffuse(lightPositions[i], normalize(v_normal + normalCoord.xyz)) + textureColor* specular(lightPositions[i], normalize(v_normal + normalCoord.xyz))).xyz, 1.0);
    }
  }
  gl_FragColor.a = 1.;
}
