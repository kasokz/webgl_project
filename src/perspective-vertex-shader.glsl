attribute vec3 a_position;
attribute vec4 a_colour;
// TODO [exercise 8]
uniform mat4 M;
uniform mat4 V;
uniform mat4 P;

varying vec4 vColor;

void main(){
  gl_Position=P*V*M*vec4(a_position,1.);
  // TODO [exercise 8]
  vColor = a_colour;
}
