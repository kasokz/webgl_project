attribute vec2 a_vertexPosition;

varying vec3 rayOrigin;
varying vec3 rayDirection;

uniform mat4 iMVP;

void main(void) {

  // expand the vertex to [-1..1]
  vec2 vertex = a_vertexPosition * 2.0 - vec2(1.0);

  // Calculate the farplane vertex position.
  // Input is clipspace, output is worldspace
  vec4 farPlane = iMVP * vec4(vertex, 1.0, 1.0);
  farPlane /= farPlane.w;

  // Same as above for the near plane.
  // Remember the near plane in OpenGL is at z=-1
  vec4 nearPlane = iMVP * vec4(vertex, -1.0, 1.0);
  nearPlane /= nearPlane.w;

  // No need to normalize ray direction here, as it might get
  // interpolated (and become non-unit) before going to the fragment
  // shader.
  rayDirection = (farPlane.xyz - nearPlane.xyz);
  rayOrigin = nearPlane.xyz;

  // output the actual clipspace position for OpenGL
  gl_Position = vec4(vertex, 0.0, 1.0);
}