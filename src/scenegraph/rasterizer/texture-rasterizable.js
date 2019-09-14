export default class TextureRasterizable {

  /**
   * Renders the textured rasterizable
   * @param {Shader} shader - The shader used to render
   */
  render(shader) {
    if (this.loaded) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
      const positionLocation = shader.getAttributeLocation('a_position');
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoords);
      const textureLocation = shader.getAttributeLocation('a_texCoord');
      this.gl.enableVertexAttribArray(textureLocation);
      this.gl.vertexAttribPointer(textureLocation, 2, this.gl.FLOAT, false, 0, 0);

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
      const normalLocation = shader.getAttributeLocation('a_normal');
      this.gl.enableVertexAttribArray(normalLocation);
      this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);

      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texBuffer);
      shader.getUniformInt('sampler').set(0);

      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalMapBuffer);
      shader.getUniformInt('normalSampler').set(1);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

      this.gl.disableVertexAttribArray(positionLocation);
      this.gl.disableVertexAttribArray(textureLocation);
      this.gl.disableVertexAttribArray(normalLocation);
    }
  }
}