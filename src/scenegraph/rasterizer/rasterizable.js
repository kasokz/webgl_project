import Vector from "../../math/vector.js";

export default class Rasterizable {

  constructor() {
    this.loaded = true;
  }

  calcNormals() {
    const calcNormal = (v1, v2, v3) => {
      const vec1 = v1.sub(v2);
      const vec2 = v3.sub(v2);
      return vec2.cross(vec1).normalised();
    }
    this.normals = [];
    for (let i = 0; i < this.vertices.length;) {
      const normal = calcNormal(
        new Vector(this.vertices[i++], this.vertices[i++], this.vertices[i++]),
        new Vector(this.vertices[i++], this.vertices[i++], this.vertices[i++]),
        new Vector(this.vertices[i++], this.vertices[i++], this.vertices[i++]));
      this.normals.push(normal.x, normal.y, normal.z);
      this.normals.push(normal.x, normal.y, normal.z);
      this.normals.push(normal.x, normal.y, normal.z);
    }
  }

  fillBuffers() {
    const vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
    this.vertexBuffer = vertexBuffer;

    const indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), this.gl.STATIC_DRAW);
    this.indexBuffer = indexBuffer;

    const colourBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colourBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);
    this.colourBuffer = colourBuffer;

    const normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
    this.normalBuffer = normalBuffer;
  }

  /**
    * Renders the rasterizable
    * @param {Shader} shader - The shader used to render
  */
  render(shader) {
    if (this.loaded) {
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
      this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_INT, 0);

      this.gl.disableVertexAttribArray(positionLocation);
      this.gl.disableVertexAttribArray(colourLocation);
      this.gl.disableVertexAttribArray(normalLocation);
    }
  }
}