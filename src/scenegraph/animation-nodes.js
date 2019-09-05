import Matrix from '../math/matrix.js';

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
      this.groupNode.matrix = Matrix.rotation(this.axis, this.angle * deltaT/1000).mul(this.groupNode.matrix);
    }
  }

}