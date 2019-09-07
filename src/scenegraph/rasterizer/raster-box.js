/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class RasterBox {
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
    this.gl = gl;
    const mi = minPoint;
    const ma = maxPoint;
    let vertices = [
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
    let indices = [...Array(36).keys()];
    let normals = [
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

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vertexBuffer = vertexBuffer;

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    this.indexBuffer = indexBuffer;
    this.elements = indices.length;

    const vertexColours = [];
    for (let i = 0; i < vertices.length / 3; i++) {
      vertexColours.push(color.r);
      vertexColours.push(color.g);
      vertexColours.push(color.b);
      vertexColours.push(1.0);
    }
    const colourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColours), gl.STATIC_DRAW);
    this.colourBuffer = colourBuffer;

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    this.normalBuffer = normalBuffer;
  }

  /**
   * Renders the box
   * @param {Shader} shader - The shader used to render
   */
  render(shader) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    const positionLocation = shader.getAttributeLocation('a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
    const colourLocation = shader.getAttributeLocation('a_colour');
    this.gl.enableVertexAttribArray(colourLocation);
    this.gl.vertexAttribPointer(colourLocation, 4, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    const normalLocation = shader.getAttributeLocation('a_normal');
    this.gl.enableVertexAttribArray(normalLocation);
    this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

    this.gl.disableVertexAttribArray(positionLocation);
    this.gl.disableVertexAttribArray(colourLocation);
    this.gl.disableVertexAttribArray(normalLocation);
  }
}
