attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec4 a_colour;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;

varying vec4 v_color;

void main(){
  vec3 throwAway = a_normal;
  throwAway = a_position;
  mat4 modelView = V * M;
  vec4 vert_pos = modelView * vec4(a_position,1.);
  gl_Position= P * vert_pos;
  v_color = a_colour;
}
