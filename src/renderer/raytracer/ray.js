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
   * @param  {{origin, width, height, alpha}} camera - The Camera
   * @return {Ray}             The resulting Ray
   */
  static makeRay(xpos, ypos, camera) {
    const rayOrigin = camera.origin;
    const rayDirection = new Vector(
      xpos - (camera.width - 1) / 2,
      (camera.height - 1) / 2 - ypos,
      -(camera.height / 2 / Math.tan(camera.alpha / 2)),
      1
    ).normalised();
    return new Ray(rayOrigin, rayDirection);
  }
}
