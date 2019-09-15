import Rasterizable from "./rasterizable.js";
import Vector from "../../math/vector.js"

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class RasterMesh extends Rasterizable {
  /**
   * Creates all WebGL buffers for the given OBJ Wavefront file
   *  looking in negative z axis direction
   * @param {WebGLContext} gl - The canvas' context
   * @param {string} url - The minimal x,y,z of the box
   * @param {Vector} color - The color the mesh should have
   */
  constructor(gl, url, color) {
    super();
    this.loaded = false;
    this.gl = gl;
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.colors = [];
    fetch(url).then(resp => resp.text()).then(contents => {
      const mesh = parseObjectFile(contents);
      mesh.indices.forEach(index => {
        if (isNaN(index.v) || isNaN(index.n)) {
          hasNaNs = true;
        }
        const vertex = mesh.vertices[index.v];
        if (vertex) {
          this.vertices.push(vertex.x, vertex.y, vertex.z);
        }
        if (mesh.normals.length > 0) {
          const normal = mesh.normals[index.n];
          this.normals.push(normal.x, normal.y, normal.z);
        }
      });
      if (mesh.normals.length === 0) {
        this.calcNormals();
      }
      for (let i = 0; i < this.vertices.length / 3; i++) {
        this.colors.push(color.r);
        this.colors.push(color.g);
        this.colors.push(color.b);
        this.colors.push(color.a);
      }
      this.indices = [...Array(this.vertices.length / 3).keys()];
      this.fillBuffers();
    }).then(() => this.loaded = true);
  }
}

const parseObjectFile = contents => {
  const lines = contents.split("\n");
  const vertices = [];
  const normals = [];
  const indices = [];
  lines.forEach(line => {
    const cols = line.split(/\s/).filter(c => c.length > 0);
    if (cols.length > 0) {
      switch (cols[0]) {
        case "v":
          vertices.push(new Vector(parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])));
          break;
        case "vn":
          normals.push(new Vector(parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])));
          break;
        case "f":
          for (let i = 1; i < 4; i++) {
            if (cols[i].includes("/")) {
              const indCols = cols[i].split("/");
              const vInd = parseInt(indCols[0]) - 1;
              const nInd = indCols[2].length == 0 ? 0 : parseInt(indCols[2]) - 1;
              indices.push({ v: vInd, n: nInd });
            } else {
              indices.push({ v: parseInt(cols[i]) - 1, n: 0 });
            }
          }
          break;
      }
    }
  });
  return { vertices, normals, indices };
}