import Vector from '../../math/vector.js';

/**
 * Class representing a ray
 */
export default class Ray {
  /**
   * Creates a new ray with origin and direction
   * @param  {Vector} origin    - The origin of the Ray
   * @param  {Vector} direction - The direction of the Ray
   */
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }

  /**
   * Creates a ray from the camera through the image plane.
   * @param  {number} xpos   - The pixel's x-position in the canvas
   * @param  {number} ypos   - The pixel's y-position in the canvas
   * @param  {{eye, center, up, fovy, aspect, near, far}} camera - The Camera
   * @return {Ray}             The resulting Ray
   */
  static makeRay(xpos, ypos, camera, width, height) {
    const rayOrigin = camera.eye;
    const rayDirection = new Vector(
      xpos - (width - 1) / 2,
      (height - 1) / 2 - ypos,
      -(height / 2 / Math.tan(camera.fovy / 2)),
      1
    ).normalised();
    return new Ray(rayOrigin, rayDirection);
  }
}
