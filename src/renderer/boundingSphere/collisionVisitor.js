import Visitor from "../visitor.js";
import Matrix from "../../math/matrix.js";
import RasterSphere from "../../scenegraph/rasterizer/raster-sphere.js";
import { phongConfiguration, mousePosition, hoveredNode } from "../../state/stores.js";
import { get } from "svelte/store";
import Vector from "../../math/vector.js";
import { SphereNode } from "../../scenegraph/nodes.js";
import Sphere from "../../math/sphere.js";
import Intersection from "../raytracer/intersection.js";

export class CollisionVisitor extends Visitor {
  /**
    * Creates a new CollisionVisitor
    * @param {Object} context - The 3D context to render to
    */
  constructor(context, shader) {
    super(context);
    this.shader = shader;
    this.renderActive = false;
    this.intersectActive = false;
  }

  toggleRender() {
    this.renderActive = !this.renderActive;
  }

  toggleIntersect() {
    this.intersectActive = !this.intersectActive;
  }

  render(rootNode) {
    this.minIntersection = new Intersection();
    this.intersectedNode = {};
    this.lightSearch = false;
    this.shouldRender = false;
    this.intersectionSearch = false;
    rootNode.accept(this);
    this.setupCamera();
    this.intersectionSearch = true;
    rootNode.accept(this);
    if (this.intersectActive) {
      hoveredNode.set(this.intersectedNode);
    }
    this.intersectionSearch = false;
    this.shouldRender = true;
    rootNode.accept(this);
  }

  draw(node) {
    const shader = this.shader;
    shader.use();
    phongConfiguration.loadIntoShader(shader);
    shader.trySet(shader.getUniformMatrix.bind(shader), 'M', this.matrixStack.top());
    shader.trySet(shader.getUniformMatrix.bind(shader), 'V', this.lookat);
    shader.trySet(shader.getUniformMatrix.bind(shader), 'P', this.perspective);
    if (node == get(hoveredNode)) {
      shader.trySet(shader.getUniformVec4.bind(shader), 'color', new Vector(1, 1, 0, 0.5));
    } else {
      shader.trySet(shader.getUniformVec4.bind(shader), 'color', new Vector(1, 0, 0, 0.5));
    }
    node.rasterBoundingSphere.render(shader);
  }

  getIntersection(node) {
    const toWorld = (this.perspective.mul(this.lookat)).invert();
    let from = toWorld.mul(new Vector(get(mousePosition).x, get(mousePosition).y, -1, 1));
    from = from.div(from.w);
    let to = toWorld.mul(new Vector(get(mousePosition).x, get(mousePosition).y, 1, 1));
    to = to.div(to.w);
    const intersection = new Sphere(this.matrixStack.top().mul(node.boundingSphere.center),
      node.boundingSphere.radius).intersect({ origin: from, direction: from.sub(to).normalised() });
    if (intersection && intersection.closerThan(this.minIntersection)) {
      this.minIntersection = intersection;
      this.intersectedNode = node;
    }
  }

  /**
   * Visits a sphere node
   * @param  {Node} node - The node to visit
   */
  visit(node) {
    if (node.rasterBoundingSphere) {
      if (this.renderActive && this.shouldRender) {
        this.draw(node);
      }
      if (this.intersectActive && this.intersectionSearch) {
        this.getIntersection(node);
      }
    }
  }

  visitCameraNode(node) {
    if (!this.shouldRender && !this.intersectionSearch) {
      this.camera = node;
      this.cameraWorld = this.matrixStack.top().mul(node.center);
      this.lookat = this.inverseMatrixStack.top();
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
        node.boundingSphere = new SphereNode("", ritterCenter, ritterRadius, new Vector(0, 0, 0, 0));
        node.rasterBoundingSphere = new RasterSphere(this.gl, ritterCenter, ritterRadius, new Vector(1, 0, 0, 0.5));
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