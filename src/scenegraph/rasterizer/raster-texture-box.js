import TextureRasterizable from "./texture-rasterizable";

/**
 * A class creating buffers for a textured box to render it with WebGL
 */
export default class RasterTextureBox extends TextureRasterizable {
  /**
   * Creates all WebGL buffers for the textured box
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
  constructor(gl, minPoint, maxPoint, texture, normalMap) {
    super();
    this.loaded = false;
    this.gl = gl;
    const mi = minPoint;
    const ma = maxPoint;
    this.vertices = [
      // front
      mi.x, mi.y, ma.z,
      ma.x, mi.y, ma.z,
      ma.x, ma.y, ma.z,
      ma.x, ma.y, ma.z,
      mi.x, ma.y, ma.z,
      mi.x, mi.y, ma.z,
      // back
      ma.x, mi.y, mi.z,
      mi.x, mi.y, mi.z,
      mi.x, ma.y, mi.z,
      mi.x, ma.y, mi.z,
      ma.x, ma.y, mi.z,
      ma.x, mi.y, mi.z,
      // right
      ma.x, mi.y, ma.z,
      ma.x, mi.y, mi.z,
      ma.x, ma.y, mi.z,
      ma.x, ma.y, mi.z,
      ma.x, ma.y, ma.z,
      ma.x, mi.y, ma.z,
      // top
      mi.x, ma.y, ma.z,
      ma.x, ma.y, ma.z,
      ma.x, ma.y, mi.z,
      ma.x, ma.y, mi.z,
      mi.x, ma.y, mi.z,
      mi.x, ma.y, ma.z,
      // left
      mi.x, mi.y, mi.z,
      mi.x, mi.y, ma.z,
      mi.x, ma.y, ma.z,
      mi.x, ma.y, ma.z,
      mi.x, ma.y, mi.z,
      mi.x, mi.y, mi.z,
      // bottom
      mi.x, mi.y, mi.z,
      ma.x, mi.y, mi.z,
      ma.x, mi.y, ma.z,
      ma.x, mi.y, ma.z,
      mi.x, mi.y, ma.z,
      mi.x, mi.y, mi.z
    ];

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    this.vertexBuffer = vertexBuffer;
    this.elements = this.vertices.length / 3;



    new Promise((resolve, _) => {
      let cubeTexture = gl.createTexture();
      let cubeImage = new Image();
      cubeImage.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        resolve()
      };
      cubeImage.src = texture;
      this.texBuffer = cubeTexture;
    }).then(() => {
      let normalMapTexture = gl.createTexture();
      let normalMapImage = new Image();
      normalMapImage.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, normalMapTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, normalMapImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
      };
      normalMapImage.src = normalMap;
      this.normalMapBuffer = normalMapTexture;
    }).then(() => this.loaded = true);

    let uv = [
      // front
      0, 0,
      1, 0,
      1, 1,
      1, 1,
      0, 1,
      0, 0,
      // back
      0, 0,
      1, 0,
      1, 1,
      1, 1,
      0, 1,
      0, 0,
      // right
      0, 0,
      1, 0,
      1, 1,
      1, 1,
      0, 1,
      0, 0,
      // top
      0, 0,
      1, 0,
      1, 1,
      1, 1,
      0, 1,
      0, 0,
      // left
      0, 0,
      1, 0,
      1, 1,
      1, 1,
      0, 1,
      0, 0,
      // bottom
      0, 0,
      1, 0,
      1, 1,
      1, 1,
      0, 1,
      0, 0
    ];
    let uvBuffer = this.gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    this.texCoords = uvBuffer;

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
    const normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
    this.normalBuffer = normalBuffer;
  }

}
