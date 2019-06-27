import Vector from './vector.js';

/**
 * Calculate the colour of an object at the intersection point according to the Phong Lighting model.
 * @param {Vector} color               - The colour of the intersected object
 * @param {Intersection} intersection     - The intersection information
 * @param {Array.<Vector>} lightPositions - The light positions
 * @param {number} shininess              - The shininess parameter of the Phong model
 * @param {Vector} cameraPosition         - The position of the camera
 * @return {Vector}                         The resulting colour
 */
export default function phong(color, intersection, lightPositions, shininess, cameraPosition) {
  const lightColor = new Vector(0.8, 0.8, 0.8, 0);
  const kA = 0.6;
  const kD = 0.8;
  const kS = 0.8;
  const sum = lightPositions.reduce((acc, lightPos) => {
    const n = intersection.normal;
    const l = lightPos.sub(intersection.point).normalised();
    const r = n
      .mul(2 * n.dot(l))
      .sub(l)
      .normalised();
    const v = cameraPosition.sub(intersection.point).normalised();
    const diffusePart = diffuse(lightColor, kD, n, l);
    const specularPart = specular(lightColor, kS, r, v, shininess);
    return acc
      .add(diffusePart)
      .add(specularPart);
  }, new Vector(0, 0, 0, 0));
  const ambientPart = ambient(color, kA);
  const result = sum.add(ambientPart);
  result.a = 1.0;
  return result;
}

const ambient = (color, kA) => {
  const result = color.mul(kA);
  return result;
};

const diffuse = (color, kD, n, l) => {
  const lambertian = Math.max(l.dot(n), 0);
  const result = color.mul(kD).mul(lambertian);
  return result;
};

const specular = (color, kS, r, v, shininess) => {
  const result = color.mul(kS).mul(Math.pow(Math.max(r.dot(v), 0), shininess));
  return result;
};
