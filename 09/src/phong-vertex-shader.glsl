attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec4 a_colour;

uniform mat4 M;
uniform mat4 V;
uniform mat4 N;

varying vec4 eyeCordFs;
varying vec4 eyeNormalFs;

varying vec3 v_normal;
varying vec4 v_color;

void main(){
  gl_Position=V*M*vec4(a_position,1.);


  v_normal = (N * vec4(a_normal,.0)).xyz;
  v_color = a_colour;
}
