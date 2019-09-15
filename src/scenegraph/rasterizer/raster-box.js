import Rasterizable from "./rasterizable.js";

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class RasterBox extends Rasterizable {
  /**
   * Creates all WebGL buffers for the box
   *     6 ------- 7
   *    / |       / |
   *   3 ------- 2  |
   *   |  |      |  |
   *   |  5 -----|- 4
   *   | /       | /
   *   0 ------- 1
   *  looking in negative z axis direction
   * @param {WebGLContext} gl - The canvas' context
   * @param {Vector} minPoint - The minimal x,y,z of the box
   * @param {Vector} maxPoint - The maximal x,y,z of the box
   */
  constructor(gl, minPoint, maxPoint, color) {
    super();
    this.gl = gl;
    const mi = minPoint;
    const ma = maxPoint;
    this.vertices = [
      mi.x, mi.y, ma.z,
      ma.x, mi.y, ma.z,
      ma.x, ma.y, ma.z,
      ma.x, ma.y, ma.z,
      mi.x, ma.y, ma.z,
      mi.x, mi.y, ma.z,
      ma.x, mi.y, mi.z,
      mi.x, mi.y, mi.z,
      mi.x, ma.y, mi.z,
      mi.x, ma.y, mi.z,
      ma.x, ma.y, mi.z,
      ma.x, mi.y, mi.z,
      ma.x, mi.y, ma.z,
      ma.x, mi.y, mi.z,
      ma.x, ma.y, mi.z,
      ma.x, ma.y, mi.z,
      ma.x, ma.y, ma.z,
      ma.x, mi.y, ma.z,
      mi.x, ma.y, ma.z,
      ma.x, ma.y, ma.z,
      ma.x, ma.y, mi.z,
      ma.x, ma.y, mi.z,
      mi.x, ma.y, mi.z,
      mi.x, ma.y, ma.z,
      mi.x, mi.y, mi.z,
      mi.x, mi.y, ma.z,
      mi.x, ma.y, ma.z,
      mi.x, ma.y, ma.z,
      mi.x, ma.y, mi.z,
      mi.x, mi.y, mi.z,
      mi.x, mi.y, mi.z,
      ma.x, mi.y, mi.z,
      ma.x, mi.y, ma.z,
      ma.x, mi.y, ma.z,
      mi.x, mi.y, ma.z,
      mi.x, mi.y, mi.z,
    ];
    this.indices = [...Array(36).keys()];
    this.normals = [
      // front
      0., 0., 1.,
      0., 0., 1.,
      0., 0., 1.,
      0., 0., 1.,
      0., 0., 1.,
      0., 0., 1.,
      // back
      0., 0., -1.,
      0., 0., -1.,
      0., 0., -1.,
      0., 0., -1.,
      0., 0., -1.,
      0., 0., -1.,
      // right
      1.0, 0., 0.,
      1.0, 0., 0.,
      1.0, 0., 0.,
      1.0, 0., 0.,
      1.0, 0., 0.,
      1.0, 0., 0.,
      // top
      0., 1., 0.,
      0., 1., 0.,
      0., 1., 0.,
      0., 1., 0.,
      0., 1., 0.,
      0., 1., 0.,
      // left
      -1.0, 0., 0.,
      -1.0, 0., 0.,
      -1.0, 0., 0.,
      -1.0, 0., 0.,
      -1.0, 0., 0.,
      -1.0, 0., 0.,
      // bottom
      0., -1., 0.,
      0., -1., 0.,
      0., -1., 0.,
      0., -1., 0.,
      0., -1., 0.,
      0., -1., 0.
    ];

    this.colors = [];
    for (let i = 0; i < this.vertices.length / 3; i++) {
      this.colors.push(color.r);
      this.colors.push(color.g);
      this.colors.push(color.b);
      this.colors.push(color.a);
    }

    this.fillBuffers();
  }
}
