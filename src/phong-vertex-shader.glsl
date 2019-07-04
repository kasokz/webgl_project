attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec4 a_colour;

uniform mat4 M;
uniform mat4 V;
uniform mat4 N;

varying vec3 v_normal;
varying vec4 v_color;
varying vec3 v_pos;

void main(){
  gl_Position=V*M*vec4(a_position,1.);


  v_normal = vec3(N * vec4(a_normal,.0));
  v_color = a_colour;
  v_pos = vec3(gl_Position) / gl_Position.w;
}
