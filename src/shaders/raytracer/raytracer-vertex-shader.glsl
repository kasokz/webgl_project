attribute vec2 a_vertexPosition;

varying vec3 rayOrigin;
varying vec3 rayDirection;

uniform mat4 iMVP;

void main(void) {

  vec2 vertex = a_vertexPosition * 2.0 - vec2(1.0);

  vec4 farPlane = iMVP * vec4(vertex, 1.0, 1.0);
  farPlane /= farPlane.w;

  vec4 nearPlane = iMVP * vec4(vertex, -1.0, 1.0);
  nearPlane /= nearPlane.w;

  rayDirection = (farPlane.xyz - nearPlane.xyz);
  rayOrigin = nearPlane.xyz;

  gl_Position = vec4(vertex, 0.0, 1.0);
}