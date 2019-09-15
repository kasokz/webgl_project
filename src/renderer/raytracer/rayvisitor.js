import Visitor from '../visitor.js';
import Shader from '../../shaders/shader.js';
import Vector from '../../math/vector.js';
import { SphereNode } from '../../scenegraph/nodes.js';
import { phongConfiguration } from "../../state/stores.js";

/**
 * Class representing a Visitor that uses
 * Raytracing to render a Scenegraph
 */
export default class RayVisitor extends Visitor {
  /**
   * Creates a new RayVisitor
   * @param {Object} context - The webgl context to render to
   * @param {Shader} shader - The raytracer shader
   */
  constructor(context, shader) {
    super(context);
    this.shader = shader;
  }

  setupCamera() {
    super.setupCamera();
    this.fillBuffers();
  }

  /**
   * Renders the Scenegraph
   * @param  {Node} rootNode - The root node of the Scenegraph
   */
  render(rootNode) {
    this.sphereCenters = [];
    this.sphereRadii = [];
    this.sphereColors = [];
    super.render(rootNode);
    const shader = this.shader;
    shader.use();
    shader.trySet(shader.getUniformMatrix.bind(shader), "iMVP", (this.perspective.mul(this.lookat)).invert());
    phongConfiguration.loadIntoShader(this.shader);
    this.sphereCenters.forEach((center, i) => {
      shader.trySet(shader.getUniformVec3.bind(shader), 'sphereCenters[' + i + ']', new Vector(center.x, center.y, center.z));
    });
    this.sphereColors.forEach((color, i) => {
      shader.trySet(shader.getUniformVec4.bind(shader), 'sphereColors[' + i + ']', new Vector(color.x, color.y, color.z, 1.0));
    });
    this.sphereRadii.forEach((radius, i) => {
      shader.trySet(shader.getUniformFloat.bind(shader), 'sphereRadii[' + i + ']', radius);
    });
    shader.trySet(shader.getUniformInt.bind(shader), "spheres", this.sphereCenters.length);
    this.lightPositions.forEach((light, i) => {
      shader.trySet(shader.getUniformVec3.bind(shader), 'lightPositions[' + i + ']', new Vector(light.x, light.y, light.z))
    });
    this.draw();
  }

  fillBuffers() {
    this.screenBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.screenBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      -1.0, -1.0,
    ]), this.gl.STATIC_DRAW);
  }

  draw() {
    phongConfiguration.loadIntoShader(this.shader);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.screenBuffer);
    const aVertexPosition = this.shader.getAttributeLocation('a_vertexPosition');
    this.gl.enableVertexAttribArray(aVertexPosition);
    this.gl.vertexAttribPointer(aVertexPosition, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.gl.disableVertexAttribArray(aVertexPosition);
  }

  visit(node) {
    if (!this.shouldRender || !(node instanceof SphereNode)) {
      return;
    }
    this.sphereCenters.push(this.matrixStack.top().mul(new Vector(0, 0, 0, 1)));
    this.sphereRadii.push(node.radius);
    this.sphereColors.push(node.color);
  }

}
