attribute vec3 a_position;
attribute vec4 a_colour;
attribute vec3 a_normal;

uniform mat4 M;
uniform mat4 V;
uniform mat4 P;

void main(){
  vec3 throwAway = a_normal;
  throwAway = a_position;
  vec4 color = a_colour;
  color = vec4(0.,0.,0.,0.);
  mat4 modelView = V * M;
  vec4 vert_pos = modelView * vec4(a_position,1.);
  gl_Position= P * vert_pos;
}
