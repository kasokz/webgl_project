import Intersection from './intersection.js';

/**
 * A class representing a sphere
 */
export default class Sphere {
  /**
   * Creates a new Sphere with center and radius
   * @param  {Vector} center - The center of the Sphere
   * @param  {number} radius - The radius of the Sphere
   * @param  {Vector} color  - The colour of the Sphere
   */
  constructor(center, radius, color) {
    this.center = center;
    this.radius = radius;
    this.color = color;
  }

  /**
   * Calculates the intersection of the sphere with the given ray
   * @param  {{origin, direction}} ray      - The ray to intersect with
   * @return {Intersection}   The intersection if there is one, null if there is none
   */
  intersect(ray) {
    let rayOrigin = ray.origin;
    let rayDir = ray.direction;

    let t = this.center.sub(rayOrigin).dot(rayDir);
    let perp = rayOrigin.add(rayDir.mul(t));
    let y = this.center.sub(perp).length;
    if (y < this.radius) {
      let x = Math.sqrt(this.radius * this.radius - y * y);
      let t1 = t - x;
      let t2 = t + x;
      let firstHitDistance = Math.min(t1, t2);
      return new Intersection(
        firstHitDistance,
        rayOrigin.add(rayDir.mul(firstHitDistance)),
        this.center.sub(rayOrigin.add(rayDir.mul(firstHitDistance))).normalised()
      );
    }
    return null;
  }
}
