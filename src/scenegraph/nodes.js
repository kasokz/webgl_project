import Matrix from '../math/matrix.js';
import Vector from "../math/vector.js"
import Intersection from "../renderer/raytracer/intersection.js";

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
    visitor.visit(this);
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
    * @param  {string} id - The id of this node
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

  accept(visitor) {
    visitor.visitGroupNode(this);
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
    * @param  {string} id - The id of this node
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
    * @param  {string} id - The id of this node
    * @param  {Vector} minPoint - The minimum Point
    * @param  {Vector} center - The maximum Point
    * @param  {Vector} color    - The colour of the cube
  */
  constructor(id, minPoint, center, color) {
    super(id);
    this.minPoint = minPoint;
    this.center = center;
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      minPoint: this.minPoint,
      center: this.center,
      color: this.color
    }
  }

  static fromJSON(obj) {
    const minPoint = new Vector(obj.minPoint._x, obj.minPoint._y, obj.minPoint._z, obj.minPoint._w);
    const center = new Vector(obj.center._x, obj.center._y, obj.center._z, obj.center._w);
    const color = new Vector(obj.color._x, obj.color._y, obj.color._z, obj.color._w);
    return new AABoxNode(obj.id, minPoint, center, color);
  }
}


/**
 * Class representing a Textured Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export class TextureBoxNode extends Node {
  /**
    * Creates an axis aligned box textured box
    * @param  {string} id - The id of this node
    * @param  {Vector} minPoint - The minimum Point
    * @param  {Vector} center - The maximum Point
    * @param  {string} texture  - The image filename for the texture
  */
  constructor(id, minPoint, center, texture, normalMap) {
    super(id);
    this.minPoint = minPoint;
    this.center = center;
    this.texture = texture;
    this.normalMap = normalMap;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      minPoint: this.minPoint,
      center: this.center,
      texture: this.texture,
      normalMap: this.normalMap
    }
  }

  static fromJSON(obj) {
    const minPoint = new Vector(obj.minPoint._x, obj.minPoint._y, obj.minPoint._z, obj.minPoint._w);
    const center = new Vector(obj.center._x, obj.center._y, obj.center._z, obj.center._w);
    return new TextureBoxNode(obj.id, minPoint, center, obj.texture, obj.normalMap);
  }
}

/**
 * Class representing a Pyramid node in the Scenegraph
 * @extends Node
 */
export class PyramidNode extends Node {
  /**
    * Creates an axis aligned box textured box
    * @param  {string} id - The id of this node
    * @param  {Vector} minPoint - The minimum Point
    * @param  {Vector} center - The maximum Point
    * @param  {string} texture  - The image filename for the texture
  */
  constructor(id, minPoint, center, height, color) {
    super(id);
    this.minPoint = minPoint;
    this.center = center;
    this.height = height;
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      minPoint: this.minPoint,
      center: this.center,
      height: this.height,
      color: this.color,
    }
  }

  static fromJSON(obj) {
    const minPoint = new Vector(obj.minPoint._x, obj.minPoint._y, obj.minPoint._z, obj.minPoint._w);
    const center = new Vector(obj.center._x, obj.center._y, obj.center._z, obj.center._w);
    const color = new Vector(obj.color._x, obj.color._y, obj.color._z, obj.color._w);
    return new PyramidNode(obj.id, minPoint, center, obj.height, color);
  }
}

export class CameraNode extends Node {

  /**
    * Creates a camera node
    * @param  {string} id - The id of this node
    * @param  {Vector} eye - The eye position relative to center
    * @param  {Vector} center - The center
    * @param  {Vector} up  - The up vector relative to center
    * @param  {number} fovy  - The field of view in y-axis
    * @param  {number} aspect  - The aspect ratio
    * @param  {number} near  - The distance where rendering begins
    * @param  {number} far  - The distance where rendering stops
 */
  constructor(id, eye, center, up, fovy, aspect, near, far) {
    super(id);
    this.eye = eye;
    this.center = center;
    this.up = up;
    this.fovy = fovy;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      eye: this.eye,
      center: this.center,
      up: this.up,
      fovy: this.fovy,
      aspect: this.aspect,
      near: this.near,
      far: this.far,
    }
  }

  accept(visitor) {
    visitor.visitCameraNode(this);
  }

  static fromJSON(obj) {
    const eye = new Vector(obj.eye._x, obj.eye._y, obj.eye._z, obj.eye._w);
    const center = new Vector(obj.center._x, obj.center._y, obj.center._z, obj.center._w);
    const up = new Vector(obj.up._x, obj.up._y, obj.up._z, obj.up._w);
    const fovy = obj.fovy;
    const aspect = obj.aspect;
    const near = obj.near;
    const far = obj.far;
    return new CameraNode(obj.id, eye, center, up, fovy, aspect, near, far);
  }
}

export class LightNode extends Node {

  /**
    * Creates a light node
    * @param  {string} id - The id of this node
    * @param  {Vector} color - The light color
 */
  constructor(id, color) {
    super(id);
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      color: this.color,
    }
  }

  accept(visitor) {
    visitor.visitLightNode(this);
  }

  static fromJSON(obj) {
    const color = new Vector(obj.color._x, obj.color._y, obj.color._z, obj.color._w);
    return new LightNode(obj.id, color);
  }
}

export class MeshNode extends Node {
  /**
    * Creates a light node
    * @param  {string} id - The id of this node
    * @param  {string} url - The url to load the mesh from
    * @param  {Vector} color - The light color
 */
  constructor(id, url, color) {
    super(id);
    this.url = url;
    this.color = color;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.constructor.name,
      url: this.url,
      color: this.color,
    }
  }

  static fromJSON(obj) {
    const url = obj.url;
    const color = new Vector(obj.color._x, obj.color._y, obj.color._z, obj.color._w);
    return new MeshNode(obj.id, url, color);
  }
}

export const nodeClasses = {
  "GroupNode": GroupNode,
  "SphereNode": SphereNode,
  "AABoxNode": AABoxNode,
  "TextureBoxNode": TextureBoxNode,
  "PyramidNode": PyramidNode,
  "CameraNode": CameraNode,
  "LightNode": LightNode,
  "MeshNode": MeshNode,
}