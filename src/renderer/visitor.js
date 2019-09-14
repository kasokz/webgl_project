import Matrix from '../math/matrix.js';
import Vector from '../math/vector.js';

export default class Visitor {
  /**
    * Creates a new Visitor
    * @param {Object} context                 - The 3D context to render to
    */
  constructor(context) {
    this.gl = context;
    this.matrixStack = [Matrix.identity()];
    this.matrixStack.top = function () {
      return this[this.length - 1];
    };
    this.inverseMatrixStack = [Matrix.identity()];
    this.inverseMatrixStack.top = function () {
      return this[this.length - 1];
    }
    this.shouldRender = false;
    this.camera = {};
  }

  /**
    * Renders the Scenegraph
    * @param  {Node} rootNode                 - The root node of the Scenegraph
    */
  render(rootNode) {
    this.gl.clearColor(.0, .0, .0, .5);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.lightPositions = [];

    this.shouldRender = false;
    this.lightSearch = false;
    rootNode.accept(this);
    this.setupCamera();

    this.lightSearch = true;
    rootNode.accept(this);
    this.lightSearch = false;

    this.shouldRender = true;
    rootNode.accept(this);
  }

  /**
    * Helper function to setup camera matrices
    */
  setupCamera() {
    this.lookat = Matrix.lookat(this.camera.eye, this.camera.center, this.camera.up).mul(this.lookat);
    this.perspective = Matrix.perspective(this.camera.fovy, this.camera.aspect, this.camera.near, this.camera.far);
  }

  /**
    * Visits a group node
    * @param  {Node} node - The node to visit
    */
  visitGroupNode(node) {
    this.matrixStack.push(this.matrixStack.top().mul(node.matrix));
    this.inverseMatrixStack.push(node.matrix.invert().mul(this.inverseMatrixStack.top()));
    node.children.forEach(child => {
      child.accept(this);
    });
    this.matrixStack.pop();
    this.inverseMatrixStack.pop();
  }

  visitCameraNode(node) {
    if (!this.shouldRender && !this.lightSearch) {
      this.camera = node;
      this.lookat = this.inverseMatrixStack.top();
    }
  }

  visitLightNode(node) {
    if (this.lightSearch) {
      this.lightPositions.push(this.lookat.mul(this.matrixStack.top()).mul(new Vector(0, 0, 0, 1)));
    }
  }
}