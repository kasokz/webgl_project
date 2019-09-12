attribute vec2 a_vertexPosition;
attribute vec3 a_plotPosition;

varying vec3 v_position;

void main(void) {
  gl_Position = vec4(a_vertexPosition, 0.0, 1.0);
  v_position = a_plotPosition;
}