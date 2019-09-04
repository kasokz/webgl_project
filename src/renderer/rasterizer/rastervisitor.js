import RasterSphere from '../../scenegraph/rasterizer/raster-sphere.js';
import RasterBox from '../../scenegraph/rasterizer/raster-box.js';
import RasterTextureBox from '../../scenegraph/rasterizer/raster-texture-box.js';
import Vector from '../../math/vector.js';
import Matrix from '../../math/matrix.js';

/**
 * Class representing a Visitor that uses Rasterisation to render a Scenegraph
 */
export class RasterVisitor {
  /**
   * Creates a new RasterVisitor
   * @param {Object} context                 - The 3D context to render to
   * @param {string} vertexShaderId          - The id of the vertex shader script node
   * @param {string} fragmentShaderId        - The id of the fragment shader script node
   * @param {string} textureVertexShaderId   - The id of the texture vertex shader script node
   * @param {string} textureFragmentShaderId - The id of the texture fragment shader script node
   */
  constructor(context) {
    this.gl = context;
    this.matrixStack = [Matrix.identity()];
    this.matrixStack.top = function () {
      return this[this.length - 1];
    };
  }

  /**
   * Renders the Scenegraph
   * @param  {Node} rootNode                 - The root node of the Scenegraph
   * @param  {Object} camera                 - The camera used
   * @param  {Array.<Vector>} lightPositions - The light light positions
   */
  render(rootNode, camera, lightPositions) {
    // clear
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.clearColor(.0,.0,.0,.1)
    this.setupCamera(camera);

    // traverse and render
    rootNode.accept(this);
  }

  /**
   * Helper function to setup camera matrices
   * @param  {Object} camera - The camera used
   */
  setupCamera(camera) {
    if (camera) {
      this.lookat = Matrix.lookat(camera.eye, camera.center, camera.up);

      this.perspective = Matrix.perspective(camera.fovy, camera.aspect, camera.near, camera.far);
    }
  }

  /**
   * Visits a group node
   * @param  {Node} node - The node to visit
   */
  visitGroupNode(node) {
    this.matrixStack.push(this.matrixStack.top().mul(node.matrix));
    node.children.forEach(child => {
      child.accept(this);
    });
    this.matrixStack.pop();
  }

  /**
   * Visits a sphere node
   * @param  {Node} node - The node to visit
   */
  visitSphereNode(node) {
    let shader = this.shader;
    shader.use();
    shader.getUniformMatrix('M').set(this.matrixStack.top());

    let V = shader.getUniformMatrix('V');
    if (V && this.lookat) {
      V.set(this.lookat);
    }
    let P = shader.getUniformMatrix('P');
    if (P && this.perspective) {
      P.set(this.perspective);
    }
    let N = shader.getUniformMatrix('N');
    if (N && this.lookat) {
      const modelViewMat = this.lookat.mul(this.matrixStack.top());
      N.set(modelViewMat.invert().transpose());
    }
    node.rastersphere.render(shader);
  }

  /**
   * Visits an axis aligned box node
   * @param  {Node} node - The node to visit
   */
  visitAABoxNode(node) {
    let shader = this.shader;
    shader.use();
    shader.getUniformMatrix('M').set(this.matrixStack.top());

    let V = shader.getUniformMatrix('V');
    if (V && this.lookat) {
      V.set(this.lookat);
    }
    let P = shader.getUniformMatrix('P');
    if (P && this.perspective) {
      P.set(this.perspective);
    }
    node.rasterbox.render(shader);
  }

  /**
   * Visits a textured box node
   * @param  {Node} node - The node to visit
   */
  visitTextureBoxNode(node) {
    this.textureshader.use();
    let shader = this.textureshader;

    shader.getUniformMatrix('M').set(this.matrixStack.top());

    let P = shader.getUniformMatrix('P');
    if (P && this.perspective) {
      P.set(this.perspective);
    }
    shader.getUniformMatrix('V').set(this.lookat);

    node.rastertexturebox.render(shader);
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

  /**
   * Visits a group node
   * @param  {Node} node - The node to visit
   */
  visitGroupNode(node) {
    for (let child of node.children) {
      child.accept(this);
    }
  }

  /**
   * Visits a sphere node
   * @param  {Node} node - The node to visit
   */
  visitSphereNode(node) {
    node.rastersphere = new RasterSphere(this.gl, node.center, node.radius, node.color);
  }

  /**
   * Visits an axis aligned box node
   * @param  {Node} node - The node to visit
   */
  visitAABoxNode(node) {
    node.rasterbox = new RasterBox(this.gl, node.minPoint, node.maxPoint);
  }

  /**
   * Visits a textured box node. Loads the texture
   * and creates a uv coordinate buffer
   * @param  {Node} node - The node to visit
   */
  visitTextureBoxNode(node) {
    node.rastertexturebox = new RasterTextureBox(
      this.gl,
      node.minPoint,
      node.maxPoint,
      node.texture
    );
  }
}
