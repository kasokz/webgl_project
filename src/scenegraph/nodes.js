import Matrix from '../math/matrix.js';
import Vector from "../math/vector.js"

/**
 * Class representing a Node in a Scenegraph
 */
class Node {

  constructor(id) {
    this.id = id;
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param  {Visitor} visitor - The visitor
   */
  accept(visitor) {
    visitor["visit" + this.constructor.name](this);
  }
}

/**
 * Class representing a GroupNode in the Scenegraph.
 * A GroupNode holds a transformation and is able
 * to have child nodes attached to it.
 * @extends Node
 */
export class GroupNode extends Node {
  /**
   * Constructor
   * @param  {Matrix} mat - A matrix describing the node's transformation
   */
  constructor(id, mat) {
    super(id);
    this.matrix = mat;
    this.children = new Array();
  }

  /**
   * Adds a child node
   * @param {Node} childNode - The child node to add
   */
  add(childNode) {
    this.children.push(childNode);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      matrix: this.matrix,
      children: this.children
    };
  }

  find(nodeId) {
    if (this.id === nodeId) {
      return this;
    }
    if (this.children.length === 0) {
      return null;
    }
    for (let child of this.children.filter(c => c instanceof GroupNode)) {
      const childResult = child.find(nodeId);
      if (childResult) {
        return childResult;
      }
    }
    return null;
  }

  static fromJSON(obj) {
    const matrix = new Matrix([]);
    matrix.data = obj.matrix.data;
    const result = new GroupNode(obj.id, matrix);
    result.children = obj.children.map(child => nodeClasses[child.type].fromJSON(child));
    return result;
  }
}

/**
 * Class representing a Sphere in the Scenegraph
 * @extends Node
 */
export class SphereNode extends Node {
  /**
   * Creates a new Sphere with center and radius
   * @param  {Vector} center - The center of the Sphere
   * @param  {number} radius - The radius of the Sphere
   * @param  {Vector} color  - The colour of the Sphere
   */
  constructor(id, center, radius, color) {
    super(id);
    this.center = center;
    this.radius = radius;
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      center: this.center,
      radius: this.radius,
      color: this.color
    }
  }

  static fromJSON(obj) {
    return new SphereNode(obj.id,
      new Vector(obj.center._x, obj.center._y, obj.center._z, obj.center._w),
      obj.radius,
      new Vector(obj.color._x, obj.color._y, obj.color._z, obj.color._w));
  }

}

/**
 * Class representing an Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export class AABoxNode extends Node {
  /**
   * Creates an axis aligned box
   * @param  {Vector} minPoint - The minimum Point
   * @param  {Vector} maxPoint - The maximum Point
   * @param  {Vector} color    - The colour of the cube
   */
  constructor(id, minPoint, maxPoint, color) {
    super(id);
    this.minPoint = minPoint;
    this.maxPoint = maxPoint;
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      minPoint: this.minPoint,
      maxPoint: this.maxPoint,
      color: this.color
    }
  }

  static fromJSON(obj) {
    const minPoint = new Vector(obj.minPoint._x, obj.minPoint._y, obj.minPoint._z, obj.minPoint._w);
    const maxPoint = new Vector(obj.maxPoint._x, obj.maxPoint._y, obj.maxPoint._z, obj.maxPoint._w);
    const color = new Vector(obj.color._x, obj.color._y, obj.color._z, obj.color._w);
    return new AABoxNode(obj.id, minPoint, maxPoint, color);
  }
}


/**
 * Class representing a Textured Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export class TextureBoxNode extends Node {
  /**
   * Creates an axis aligned box textured box
   * @param  {Vector} minPoint - The minimum Point
   * @param  {Vector} maxPoint - The maximum Point
   * @param  {string} texture  - The image filename for the texture
   */
  constructor(id, minPoint, maxPoint, texture) {
    super(id);
    this.minPoint = minPoint;
    this.maxPoint = maxPoint;
    this.texture = texture;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      minPoint: this.minPoint,
      maxPoint: this.maxPoint,
      texture: this.texture
    }
  }

  static fromJSON(obj) {
    const minPoint = new Vector(obj.minPoint._x, obj.minPoint._y, obj.minPoint._z, obj.minPoint._w);
    const maxPoint = new Vector(obj.maxPoint._x, obj.maxPoint._y, obj.maxPoint._z, obj.maxPoint._w);
    return new TextureBoxNode(obj.id, minPoint, maxPoint, obj.texture);
  }
}

/**
 * Class representing a Pyramid node in the Scenegraph
 * @extends Node
 */
export class PyramidNode extends Node {
  /**
   * Creates an axis aligned box textured box
   * @param  {Vector} minPoint - The minimum Point
   * @param  {Vector} maxPoint - The maximum Point
   * @param  {string} texture  - The image filename for the texture
   */
  constructor(id, minPoint, maxPoint, height, color) {
    super(id);
    this.minPoint = minPoint;
    this.maxPoint = maxPoint;
    this.height = height;
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      minPoint: this.minPoint,
      maxPoint: this.maxPoint,
      height: this.height,
      color: this.color,
    }
  }

  static fromJSON(obj) {
    const minPoint = new Vector(obj.minPoint._x, obj.minPoint._y, obj.minPoint._z, obj.minPoint._w);
    const maxPoint = new Vector(obj.maxPoint._x, obj.maxPoint._y, obj.maxPoint._z, obj.maxPoint._w);
    const color = new Vector(obj.color._x, obj.color._y, obj.color._z, obj.color._w);
    return new PyramidNode(obj.id, minPoint, maxPoint, obj.height, color);
  }
}

export const nodeClasses = {
  "GroupNode": GroupNode,
  "SphereNode": SphereNode,
  "AABoxNode": AABoxNode,
  "TextureBoxNode": TextureBoxNode,
  "PyramidNode": PyramidNode
}