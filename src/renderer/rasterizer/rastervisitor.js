import RasterSphere from '../../scenegraph/rasterizer/raster-sphere.js';
import RasterBox from '../../scenegraph/rasterizer/raster-box.js';
import RasterTextureBox from '../../scenegraph/rasterizer/raster-texture-box.js';
import Vector from '../../math/vector.js';
import { phongConfiguration } from "../../state/stores.js";
import RasterPyramid from '../../scenegraph/rasterizer/raster-pyramid.js';
import TextureRasterizable from '../../scenegraph/rasterizer/texture-rasterizable.js';
import RasterMesh from '../../scenegraph/rasterizer/raster-mesh.js';
import Visitor from '../visitor.js';
import Shader from '../../shaders/shader.js';

/**
 * Class representing a Visitor that uses Rasterisation to render a Scenegraph
 */
export class RasterVisitor extends Visitor {

  /**
    * Creates a new RasterVisitor
    * @param {Object} context - The 3D context to render to
    * @param {Shader} shader - The "default" shader
    * @param {Shader} textureShader - The texture shader
    */
  constructor(context, shader, textureShader) {
    super(context);
    this.shader = shader;
    this.textureShader = textureShader;
  }

  /**
   * Visits a sphere node
   * @param  {Node} node - The node to visit
   */
  visit(node) {
    if (this.shouldRender) {
      const shader = (node.rasterObject instanceof TextureRasterizable) ? this.textureShader : this.shader;
      shader.use();
      phongConfiguration.loadIntoShader(shader);
      shader.trySet(shader.getUniformMatrix.bind(shader), 'M', this.matrixStack.top());
      shader.trySet(shader.getUniformMatrix.bind(shader), 'V', this.lookat);
      shader.trySet(shader.getUniformMatrix.bind(shader), 'P', this.perspective);
      shader.trySet(shader.getUniformMatrix.bind(shader), 'N', this.lookat.mul(this.matrixStack.top()));
      this.lightPositions.forEach((light, i) => {
        shader.trySet(shader.getUniformVec3.bind(shader), 'lightPositions[' + i + ']', new Vector(light.x, light.y, light.z))
      });
      shader.trySet(shader.getUniformInt.bind(shader), "lights", this.lightPositions.length);
      node.rasterObject.render(shader);
    }
  }
}

/** Class representing a Visitor that sets up buffers for use by the RasterVisitor */
export class RasterSetupVisitor {
  /**
   * Creates a new RasterSetupVisitor
   * @param {Object} context - The 3D context in which to create buffers
   */
  constructor(context) {
    this.gl = context;
  }

  /**
   * Sets up all needed buffers
   * @param  {Node} rootNode - The root node of the Scenegraph
   */
  setup(rootNode) {
    // Clear to white, fully opaque
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // Clear everything
    this.gl.clearDepth(1.0);
    // Enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    rootNode.accept(this);
  }

  visit(node) {
    node.rasterObject = new rasterNodeClasses[node.constructor.name](this.gl, ...Object.values(node).slice(1));
  }

  /**
   * Visits a group node
   * @param  {Node} node - The node to visit
   */
  visitGroupNode(node) {
    for (let child of node.children) {
      child.accept(this);
    }
  }

  visitCameraNode(node) {
  }

  visitLightNode(node) {
  }
}

const rasterNodeClasses = {
  "SphereNode": RasterSphere,
  "AABoxNode": RasterBox,
  "TextureBoxNode": RasterTextureBox,
  "PyramidNode": RasterPyramid,
  "MeshNode": RasterMesh
}