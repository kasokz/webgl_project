import Matrix from '../math/matrix.js';
import Vector from '../math/vector.js';
import { selectedNode, keysPressed, mouseOffsets } from '../state/stores.js';
import { get } from "svelte/store";

/**
 * Class representing an Animation
 */
class AnimationNode {
  /**
   * Creates a new AnimationNode
   * @param {GroupNode} groupNode - The GroupNode to attach to
   */
  constructor(groupNode) {
    this.groupNode = groupNode;
    this.active = true;
  }

  /**
   * Toggles the active state of the animation node
   */
  toggleActive() {
    this.active = !this.active;
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class RotationNode extends AnimationNode {
  /**
   * Creates a new RotationNode
   * @param {GroupNode} groupNode - The group node to attach to
   * @param {Vector} axis         - The axis to rotate around
   */
  constructor(groupNode, axis) {
    super(groupNode);
    this.angle = 90;
    this.axis = axis;
  }

  /**
   * Advances the animation by deltaT
   * @param  {number} deltaT - The time difference, the animation is advanced by
   */
  simulate(deltaT) {
    if (this.active) {
      this.groupNode.matrix = Matrix.rotation(this.axis, this.angle * deltaT / 1000).mul(this.groupNode.matrix);
    }
  }

  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      axis: this.axis
    }
  }

  static fromJSON(obj) {
    const axis = new Vector(obj.axis._x, obj.axis._y, obj.axis._z, obj.axis._w);
    return new RotationNode(null, axis);
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class BouncingNode extends AnimationNode {
  /**
   * Creates a new RotationNode
   * @param {GroupNode} groupNode - The group node to attach to
   * @param {Vector} axis         - The axis to rotate around
   * @param {number} distance     - The distance to move on the axis
   */
  constructor(groupNode, axis, distance) {
    super(groupNode);
    this.distance = distance;
    this.axis = axis;
    this.value = 0;
  }

  /**
   * Advances the animation by deltaT
   * @param  {number} deltaT - The time difference, the animation is advanced by
   */
  simulate(deltaT) {
    if (this.active) {
      this.value += deltaT / 200;
      this.groupNode.matrix = Matrix.translation(this.axis.mul(Math.sin(this.value) / 10 * this.distance)).mul(this.groupNode.matrix);
    }
  }

  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      axis: this.axis,
      distance: this.distance
    }
  }

  static fromJSON(obj) {
    const axis = new Vector(obj.axis._x, obj.axis._y, obj.axis._z, obj.axis._w);
    return new BouncingNode(null, axis, obj.distance);
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class ManualRotationNode extends AnimationNode {
  /**
   * Creates a new ManualRotationNode
   * @param {GroupNode} groupNode - The group node to attach to
   * @param {Vector} axis         - The axis to rotate around
   */
  constructor(groupNode, axis) {
    super(groupNode);
    this.angle = 90;
    this.axis = axis;
  }

  /**
   * Advances the animation by deltaT
   * @param  {number} deltaT - The time difference, the animation is advanced by
   */
  simulate(deltaT) {
    if (this.active) {
      if (get(selectedNode) === this.groupNode) {
        if (get(keysPressed).get("ArrowRight")) {
          this.groupNode.matrix = Matrix.rotation(this.axis, -this.angle * deltaT / 1000).mul(this.groupNode.matrix);
        }
        if (get(keysPressed).get("ArrowLeft")) {
          this.groupNode.matrix = Matrix.rotation(this.axis, this.angle * deltaT / 1000).mul(this.groupNode.matrix);
        }
      }
    }
  }

  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      axis: this.axis
    }
  }

  static fromJSON(obj) {
    const axis = new Vector(obj.axis._x, obj.axis._y, obj.axis._z, obj.axis._w);
    return new ManualRotationNode(null, axis);
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class FreeFlightNode extends AnimationNode {
  /**
   * Creates a new FreeFlightNode
   * @param {GroupNode} groupNode - The group node to attach to
   * @param {GroupNode} xAxisNode - The group node to attach to
   * @param {GroupNode} yAxisNode - The group node to attach to
   * @param {number} mouseSensitivity - The mouse sensitivity
   */
  constructor(groupNode, mouseSensitivity) {
    super(groupNode);
    this.mouseSensitivity = mouseSensitivity;
    this.currentAngleX = 0;
    this.currentAngleY = 0;
    this.currentPosition = new Vector(0, 0, 0, 0);
  }

  /**
   * Advances the animation by deltaT
   * @param  {number} deltaT - The time difference, the animation is advanced by
   */
  simulate(deltaT) {
    if (this.active) {
      if (get(keysPressed).get("a")) {
        this.groupNode.matrix = Matrix.translation(this.groupNode.matrix.getLeftVector().mul(10 * deltaT / 1000)).mul(this.groupNode.matrix);
      }
      if (get(keysPressed).get("d")) {
        this.groupNode.matrix = Matrix.translation(this.groupNode.matrix.getLeftVector().mul(-10 * deltaT / 1000)).mul(this.groupNode.matrix);
      }
      if (get(keysPressed).get("w")) {
        this.groupNode.matrix = Matrix.translation(this.groupNode.matrix.getForwardVector().mul(10 * deltaT / 1000)).mul(this.groupNode.matrix);
      }
      if (get(keysPressed).get("s")) {
        this.groupNode.matrix = Matrix.translation(this.groupNode.matrix.getForwardVector().mul(-10 * deltaT / 1000)).mul(this.groupNode.matrix);
      }
      const tempOldLocation = this.groupNode.matrix.getTranslationVector();
      this.groupNode.matrix = Matrix.translation(tempOldLocation.mul(-1)).mul(this.groupNode.matrix);
      this.groupNode.matrix = Matrix.rotation(new Vector(0, 1, 0), -this.currentAngleX).mul(this.groupNode.matrix);

      this.groupNode.matrix = Matrix.rotation(
        new Vector(1, 0, 0), get(mouseOffsets).y * deltaT / 100 * this.mouseSensitivity).mul(this.groupNode.matrix);

      this.groupNode.matrix = Matrix.rotation(new Vector(0, 1, 0), this.currentAngleX).mul(this.groupNode.matrix);

      this.groupNode.matrix = Matrix.rotation(
        new Vector(0, 1, 0), -get(mouseOffsets).x * deltaT / 100 * this.mouseSensitivity).mul(this.groupNode.matrix);

      this.currentAngleX + get(mouseOffsets).x;
      this.groupNode.matrix = Matrix.translation(tempOldLocation).mul(this.groupNode.matrix);
      mouseOffsets.reset();
    }
  }

  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      mouseSensitivity: this.mouseSensitivity
    }
  }

  static fromJSON(obj) {
    return new FreeFlightNode(null, obj.mouseSensitivity);
  }
}

export const animationNodeClasses = {
  "RotationNode": RotationNode,
  "BouncingNode": BouncingNode,
  "ManualRotationNode": ManualRotationNode,
  "FreeFlightNode": FreeFlightNode
}