attribute vec3 a_position;
attribute vec4 a_colour;

uniform mat4 M;
varying vec4 vColor;

void main(){
  gl_Position=M*vec4(a_position,1.);
  vColor = a_colour;
}
