import Visitor from "../visitor.js";
import RasterSphere from "../../scenegraph/rasterizer/raster-sphere.js";
import { phongConfiguration } from "../../state/stores.js";
import Vector from "../../math/vector.js";

export class CollisionVisitor extends Visitor {
  /**
    * Creates a new CollisionVisitor
    * @param {Object} context - The 3D context to render to
    */
  constructor(context, shader) {
    super(context);
    this.shader = shader;
  }

  render(rootNode) {
    this.lightPositions = [];

    this.shouldRender = false;
    this.lightSearch = false;
    rootNode.accept(this);
    this.setupCamera();

    this.shouldRender = true;
    rootNode.accept(this);
  }

  /**
   * Visits a sphere node
   * @param  {Node} node - The node to visit
   */
  visit(node) {
    if (this.shouldRender && node.boundingSphere) {
      const shader = this.shader;
      shader.use();
      phongConfiguration.loadIntoShader(shader);
      shader.trySet(shader.getUniformMatrix.bind(shader), 'M', this.matrixStack.top());
      shader.trySet(shader.getUniformMatrix.bind(shader), 'V', this.lookat);
      shader.trySet(shader.getUniformMatrix.bind(shader), 'P', this.perspective);
      node.boundingSphere.render(shader);
    }
  }
}

/** Class representing a Visitor that sets up buffers for use by the RasterVisitor */
export class CollisionSetupVisitor {
  /**
   * Creates a new CollisionSetupVisitor
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
    rootNode.accept(this);
  }

  visit(node) {
    const wrap = () => {
      if (node.rasterObject.vertices.length === 0) {
        setTimeout(wrap, 1000);
      } else {
        const vertexComponents = node.rasterObject.vertices;
        const vertices = [];
        for (let i = 0; i < vertexComponents.length; i += 3) {
          vertices.push(new Vector(vertexComponents[i], vertexComponents[i + 1], vertexComponents[i + 2], 1));
        }
        const { ritterCenter, ritterRadius } = calcRitter(vertices);
        node.boundingSphere = new RasterSphere(this.gl, ritterCenter, ritterRadius, new Vector(1, 0, 0, 0.5));
      }
    };
    wrap();
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

const currentMax = (x) => (acc, vert) => {
  const distance = x.sub(vert).length;
  if (distance > acc.currMin) {
    return { currMin: distance, currentMax: vert };
  } else {
    return acc;
  }
};

const calcRitter = (vertices) => {
  const x = vertices[0];
  let y = vertices.reduce(currentMax(x), { currMin: 0, currentMax: {} }).currentMax;
  let z = vertices.reduce(currentMax(y), { currMin: 0, currentMax: {} }).currentMax;
  let radius = y.sub(z).length / 2;
  let center = y.add(z.sub(y).mul(0.5));
  const max = 10;
  let i = 0;
  while (vertices.filter(v => v.sub(center).length > (radius + 0.005)).length > 0 && i++ < max) {
    const newY = vertices.filter(v => v.sub(center).length > (radius + 0.005))[0];
    const newZ = center.add(newY.sub(center).normalised().mul(-radius));
    radius = newY.sub(newZ).length / 2;
    center = newY.add(newZ.sub(newY).mul(0.5));
    y = newY;
    z = newZ;
  }
  return { ritterCenter: center, ritterRadius: radius };
}