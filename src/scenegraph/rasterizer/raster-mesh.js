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
        const vertex = mesh.vertices[index.v];
        const normal = mesh.normals[index.n];
        this.vertices.push(vertex.x, vertex.y, vertex.z);
        this.normals.push(normal.x, normal.y, normal.z);
      });
      for (let i = 0; i < this.vertices.length / 3; i++) {
        this.colors.push(color.r);
        this.colors.push(color.g);
        this.colors.push(color.b);
        this.colors.push(1.0);
      }
      this.indices = [...Array(this.vertices.length / 3).keys()];
      this.fillBuffers();
      this.loaded = true;
    });
  }
}

const parseObjectFile = contents => {
  const lines = contents.split("\n");
  const vertices = [];
  const normals = [];
  const indices = [];
  lines.forEach(line => {
    const cols = line.trimRight().split(" ");
    if (cols.length > 0) {
      switch (cols[0]) {
        case "v":
          vertices.push(new Vector(parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])));
          break;
        case "vn":
          normals.push(new Vector(parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])));
          break;
        case "f":
          const v1 = cols[1].split("/");
          const v2 = cols[2].split("/");
          const v3 = cols[3].split("/");
          indices.push({ v: parseInt(v1[0]) - 1, n: parseInt(v1[2]) - 1 });
          indices.push({ v: parseInt(v2[0]) - 1, n: parseInt(v2[2]) - 1 });
          indices.push({ v: parseInt(v3[0]) - 1, n: parseInt(v3[2]) - 1 });
      }
    }
  });
  return { vertices, normals, indices };
}