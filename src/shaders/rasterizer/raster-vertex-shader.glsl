attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec4 a_colour;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;
uniform mat4 N;

uniform float kA;
uniform float kD;
uniform float kS;
uniform float shininess;

varying vec4 v_color;
varying vec3 v_pos;
varying vec3 v_normal;
varying float v_kA;
varying float v_kD;
varying float v_kS;
varying float v_shininess;

void main(){
  mat4 modelView = V * M;
  vec4 vert_pos = modelView * vec4(a_position,1.);
  gl_Position= P * vert_pos;
  v_normal = normalize(vec3(
    N *
    vec4(a_normal, .0)));
  v_color = a_colour;
  v_pos = vec3(vert_pos.xyz / vert_pos.w);
  v_kA = kA;
  v_kD = kD;
  v_kS = kS;
  v_shininess = shininess;
}
