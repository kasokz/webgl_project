attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;
uniform mat4 N;

varying vec2 v_texCoord;
varying vec3 v_pos;
varying vec3 v_normal;

void main() {
  mat4 modelView = V * M;
  vec4 vert_pos = modelView * vec4(a_position,1.);
  gl_Position= P * vert_pos;
  v_texCoord = a_texCoord;
  v_normal = normalize(vec3(
    N *
    vec4(a_normal, .0)));
  v_pos = vec3(vert_pos.xyz / vert_pos.w);
}
