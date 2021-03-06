import Vector from '../../math/vector.js';
import Rasterizable from './rasterizable.js';

/**
 * A class creating buffers for a sphere to render it with WebGL
 */
export default class RasterSphere extends Rasterizable {
  /**
   * Creates all WebGL buffers for the sphere
   * @param {WebGLContext} gl - The canvas' context
   * @param {Vector} center   - The center of the sphere
   * @param {number} radius   - The radius of the sphere
   * @param {Vector} color    - The color of the sphere
   */
  constructor(gl, center, radius, color, color2) {
    super();
    this.gl = gl;

    this.vertices = [];
    this.indices = [];
    this.normals = [];

    let ringsize = 50;
    for (let ring = 0; ring < ringsize; ring++) {
      for (let ring2 = 0; ring2 < ringsize; ring2++) {
        let theta = (ring * Math.PI * 2) / ringsize - 1;
        let phi = (ring2 * Math.PI * 2) / ringsize;
        let x = radius * Math.sin(theta) * Math.cos(phi) + center.x;
        let y = radius * Math.sin(theta) * Math.sin(phi) + center.y;
        let z = radius * Math.cos(theta) + center.z;
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(z);

        let normal = new Vector(x, y, z).sub(center).normalised();
        this.normals.push(normal.x);
        this.normals.push(normal.y);
        this.normals.push(normal.z);
      }
    }

    for (let ring = 0; ring < ringsize - 1; ring++) {
      for (let ring2 = 0; ring2 < ringsize; ring2++) {
        this.indices.push(ring * ringsize + ring2);
        this.indices.push(ring * ringsize + ((ring2 + 1) % ringsize));
        this.indices.push((ring + 1) * ringsize + ring2);

        this.indices.push(ring * ringsize + ((ring2 + 1) % ringsize));
        this.indices.push((ring + 1) * ringsize + ((ring2 + 1) % ringsize));
        this.indices.push((ring + 1) * ringsize + ring2);
      }
    }

    this.colors = [];
    for (let i = 0; i < this.vertices.length / 3; i++) {
      if (color2 && (i % 2) == 0) {
        this.colors.push(color2.r);
        this.colors.push(color2.g);
        this.colors.push(color2.b);
        this.colors.push(color2.a);
      } else {
        this.colors.push(color.r);
        this.colors.push(color.g);
        this.colors.push(color.b);
        this.colors.push(color.a);
      }
    }

    this.fillBuffers();
  }
}
