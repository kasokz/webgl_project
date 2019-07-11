attribute vec3 a_position;
attribute vec4 a_colour;

uniform mat4 M;
varying vec4 v_color;

void main(){
  gl_Position=M*vec4(a_position,1.);
  v_color = a_colour;
}
