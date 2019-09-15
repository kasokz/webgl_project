import Matrix from '../math/matrix.js';
import Vector from '../math/vector.js';
import { selectedNode, keysPressed, mouseOffsets } from '../state/stores.js';
import { get } from "svelte/store";
import { sceneGraph } from "../state/stores.js";
import { GroupNode } from "../scenegraph/nodes.js";

/**
 * Class representing an Animation
 */
class AnimationNode {
  /**
   * Creates a new AnimationNode
   */
  constructor(groupNodeId) {
    this.active = true;
    const nodeStack = [];
    nodeStack.push.apply(nodeStack, get(sceneGraph).children);
    nodeStack.push(get(sceneGraph));
    while (nodeStack.length > 0) {
      const currNode = nodeStack.pop();
      if (currNode.id == groupNodeId) {
        this.groupNode = currNode;
        break;
      }
      if (currNode instanceof GroupNode) {
        nodeStack.push.apply(nodeStack, currNode.children);
      }
    }
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
   * @param {string} groupNodeId - The group node to attach to
   * @param {Vector} axis         - The axis to rotate around
   */
  constructor(groupNodeId, axis) {
    super(groupNodeId);
    this.angle = 90;
    this.axis = axis;
    this.origin = this.groupNode.matrix.transpose().transpose();
    this.currentAngle = 0;
  }

  /**
   * Advances the animation by deltaT
   * @param  {number} deltaT - The time difference, the animation is advanced by
   */
  simulate(deltaT) {
    if (this.active) {
      this.currentAngle += (this.angle * deltaT / 1000) % 360;
      this.groupNode.matrix = Matrix.rotation(this.axis, this.currentAngle).mul(this.origin);
    }
  }

  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      axis: this.axis,
      currentAngle: this.currentAngle,
      origin: this.origin,
    }
  }

  static fromJSON(obj) {
    const axis = new Vector(obj.axis._x, obj.axis._y, obj.axis._z, obj.axis._w);
    const result = new RotationNode(obj.groupNodeId, axis);
    result.currentAngle = obj.currentAngle;
    result.origin.data = obj.origin.data;
    return result;
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class BouncingNode extends AnimationNode {
  /**
   * Creates a new BouncingNode
   * @param {string} groupNodeId - The group node to attach to
   * @param {Vector} axis         - The axis to rotate around
   * @param {number} distance     - The distance to move on the axis
   */
  constructor(groupNodeId, axis, distance, speed) {
    super(groupNodeId);
    this.distance = distance;
    this.speed = speed;
    this.axis = axis;
    this.value = 0;
    this.translation = Matrix.identity();
    this.origin = this.groupNode.matrix.transpose().transpose();
  }

  /**
   * Advances the animation by deltaT
   * @param  {number} deltaT - The time difference, the animation is advanced by
   */
  simulate(deltaT) {
    if (this.active) {
      this.value += deltaT / (1000 / this.speed);
      this.groupNode.matrix = this.translation.mul(
        Matrix.translation(this.axis.mul(Math.sin(this.value) * this.distance))).mul(
          this.origin);
    }
  }

  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      axis: this.axis,
      distance: this.distance,
      speed: this.speed,
      translation: this.translation,
      value: this.value,
      origin: this.origin,
    }
  }

  static fromJSON(obj) {
    const axis = new Vector(obj.axis._x, obj.axis._y, obj.axis._z, obj.axis._w);
    const result = new BouncingNode(obj.groupNodeId, axis, obj.distance, obj.speed);
    result.translation.data = obj.translation.data;
    result.value = obj.value;
    result.origin.data = obj.origin.data;
    return result;
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
  constructor(groupNodeId, axis) {
    super(groupNodeId);
    this.angle = 90;
    this.axis = axis;
    this.origin = this.groupNode.matrix.transpose().transpose();
    this.currentAngle = 0;
  }

  /**
   * Advances the animation by deltaT
   * @param  {number} deltaT - The time difference, the animation is advanced by
   */
  simulate(deltaT) {
    if (this.active) {
      if (get(selectedNode) === this.groupNode) {
        if (get(keysPressed).get("ArrowRight")) {
          this.currentAngle += (-this.angle * deltaT / 1000) % 360;
        }
        if (get(keysPressed).get("ArrowLeft")) {
          this.currentAngle += (this.angle * deltaT / 1000) % 360;
        }
        this.groupNode.matrix = Matrix.rotation(this.axis, this.currentAngle).mul(this.origin);

      }
    }
  }

  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      axis: this.axis,
      currentAngle: this.currentAngle,
      origin: this.origin,
    }
  }

  static fromJSON(obj) {
    const axis = new Vector(obj.axis._x, obj.axis._y, obj.axis._z, obj.axis._w);
    const result = new ManualRotationNode(obj.groupNodeId, axis);
    result.currentAngle = obj.currentAngle;
    result.origin.data = obj.origin.data;
    return result;
  }
}

export class DriverNode extends AnimationNode {
  /**
     * Creates a new FreeFlightNode
     * @param {GroupNode} groupNode - The group node to attach to
     */
  constructor(groupNodeId) {
    super(groupNodeId);
    this.origin = this.groupNode.matrix.transpose().transpose();
    this.translationMatrix = Matrix.identity();
    this.active = true;
  }

  /**
    * Advances the animation by deltaT
    * @param  {number} deltaT - The time difference, the animation is advanced by
    */
  simulate(deltaT) {
    if (this.active) {
      if (get(selectedNode) === this.groupNode) {
        if (get(keysPressed).get("ArrowRight")) {
          this.translationMatrix = Matrix.translation(this.groupNode.matrix.getLeftVector().mul(deltaT / 1000)).mul(this.translationMatrix);
        }
        if (get(keysPressed).get("ArrowLeft")) {
          this.translationMatrix = Matrix.translation(this.groupNode.matrix.getLeftVector().mul(-deltaT / 1000)).mul(this.translationMatrix);
        }
        if (get(keysPressed).get("ArrowUp")) {
          this.translationMatrix = Matrix.translation(this.groupNode.matrix.getUpVector().mul(deltaT / 1000)).mul(this.translationMatrix);
        }
        if (get(keysPressed).get("ArrowDown")) {
          this.translationMatrix = Matrix.translation(this.groupNode.matrix.getUpVector().mul(-deltaT / 1000)).mul(this.translationMatrix);
        }
        this.groupNode.matrix = this.translationMatrix.mul(this.origin);
      }
    }
  }


  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      translationMatrix: this.translationMatrix,
      origin: this.origin,
    }
  }

  static fromJSON(obj) {
    const result = new DriverNode(obj.groupNodeId);
    result.translationMatrix.data = obj.translationMatrix.data;
    result.origin.data = obj.origin.data;
    return result;
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
   * @param {number} mouseSensitivity - The mouse sensitivity
   */
  constructor(groupNodeId, mouseSensitivity) {
    super(groupNodeId);
    this.mouseSensitivity = mouseSensitivity;
    this.origin = this.groupNode.matrix.transpose().transpose();
    this.currentX = 0;
    this.currentY = 0;
    this.translationMatrix = Matrix.identity();
    this.active = false;
  }

  /**
   * Advances the animation by deltaT
   * @param  {number} deltaT - The time difference, the animation is advanced by
   */
  simulate(deltaT) {
    if (this.active) {
      if (get(keysPressed).get("a")) {
        this.translationMatrix = Matrix.translation(this.groupNode.matrix.getLeftVector().mul(-10 * deltaT / 1000)).mul(this.translationMatrix);
      }
      if (get(keysPressed).get("d")) {
        this.translationMatrix = Matrix.translation(this.groupNode.matrix.getLeftVector().mul(10 * deltaT / 1000)).mul(this.translationMatrix);
      }
      if (get(keysPressed).get("w")) {
        this.translationMatrix = Matrix.translation(this.groupNode.matrix.getForwardVector().mul(-10 * deltaT / 1000)).mul(this.translationMatrix);
      }
      if (get(keysPressed).get("s")) {
        this.translationMatrix = Matrix.translation(this.groupNode.matrix.getForwardVector().mul(10 * deltaT / 1000)).mul(this.translationMatrix);
      }
      if (get(keysPressed).get("q")) {
        this.translationMatrix = Matrix.translation(this.groupNode.matrix.getUpVector().mul(10 * deltaT / 1000)).mul(this.translationMatrix);
      }
      if (get(keysPressed).get("e")) {
        this.translationMatrix = Matrix.translation(this.groupNode.matrix.getUpVector().mul(-10 * deltaT / 1000)).mul(this.translationMatrix);
      }
      this.currentY += -get(mouseOffsets).y * deltaT / 100 * this.mouseSensitivity;
      this.currentX += -get(mouseOffsets).x * deltaT / 100 * this.mouseSensitivity;
      this.groupNode.matrix = this.translationMatrix.mul(
        Matrix.rotation(new Vector(0, 1, 0), this.currentX).mul(Matrix.rotation(new Vector(1, 0, 0), this.currentY))).mul(this.origin);
      mouseOffsets.reset();
    }
  }

  toJSON() {
    return {
      type: this.constructor.name,
      groupNodeId: this.groupNode.id,
      mouseSensitivity: this.mouseSensitivity,
      currentX: this.currentX,
      currentY: this.currentY,
      translationMatrix: this.translationMatrix,
      origin: this.origin,
    }
  }

  static fromJSON(obj) {
    const result = new FreeFlightNode(obj.groupNodeId, obj.mouseSensitivity);
    result.currentX = obj.currentX;
    result.currentY = obj.currentY;
    result.translationMatrix = new Matrix([]);
    result.translationMatrix.data = obj.translationMatrix.data;
    result.origin.data = obj.origin.data;
    return result;
  }
}

export const animationNodeClasses = {
  "RotationNode": RotationNode,
  "BouncingNode": BouncingNode,
  "ManualRotationNode": ManualRotationNode,
  "FreeFlightNode": FreeFlightNode,
  "DriverNode": DriverNode,
}