import Rasterizable from "./rasterizable";
import Vector from "../../math/vector.js";

/**
 * A class creating buffers for an pyramid to render it with WebGL
 */
export default class RasterPyramid extends Rasterizable {
  /**
   * Creates all WebGL buffers for the pyramid
   *
   *        4
   *       / \`.
   *      /   \ `.
   *     / 3   \  `2
   *    /_______\/
   *   0        1
   *
   *  looking in negative z axis direction
   * @param {WebGLContext} gl - The canvas' context
   * @param {Vector} minPoint - The minimal x,y,z of the pyramid
   * @param {Vector} maxPoint - The maximal x,y,z of the pyramid
   */
  constructor(gl, minPoint, maxPoint, height, color) {
    super();
    this.gl = gl;
    const mi = minPoint;
    const ma = maxPoint;
    const top = new Vector((mi.x + ma.x) / 2, mi.y + height, (mi.z + ma.z) / 2, 1);
    this.vertices = [
      mi.x, mi.y, ma.z,
      ma.x, mi.y, ma.z,
      top.x, top.y, top.z,
      ma.x, mi.y, ma.z,
      ma.x, mi.y, mi.z,
      top.x, top.y, top.z,
      mi.x, mi.y, mi.z,
      mi.x, mi.y, ma.z,
      top.x, top.y, top.z,
      ma.x, mi.y, mi.z,
      mi.x, mi.y, mi.z,
      top.x, top.y, top.z,
      ma.x, mi.y, mi.z,
      ma.x, mi.y, ma.z,
      mi.x, mi.y, ma.z,
      mi.x, mi.y, ma.z,
      mi.x, mi.y, mi.z,
      ma.x, mi.y, mi.z,
    ];
    this.indices = [...Array(this.vertices.length / 3).keys()];

    this.calcNormals();

    this.colors = [];
    for (let i = 0; i < this.vertices.length / 3; i++) {
      this.colors.push(color.r);
      this.colors.push(color.g);
      this.colors.push(color.b);
      this.colors.push(1.0);
    }

    this.fillBuffers();
  }
}
