/**
  * Class representing a Visitor that uses
  * SceneGraphNodes to visualize a Scenegraph
  */
export default class UIVisitor {

  /**
   * Renders the Scenegraph
   * @param  {Node} rootNode  - The root node of the Scenegraph
   */
  visitNode(node) {
    // build list of render objects
    node.accept(this);
    return this.value;
  }

  /**
   * Visits a group node
   * @param  {Node} node - The node to visit
   */
  visitGroupNode(node) {
    this.value = "GroupNode";
  }

  /**
   * Visits a sphere node
   * @param  {Node} node - The node to visit
   */
  visitSphereNode(node) {
    this.value = "SphereNode";
  }

  /**
   * Visits an axis aligned box node
   * @param  {Node} node - The node to visit
   */
  visitAABoxNode(node) {
    this.value = "AABoxNode";
  }

  /**
   * Visits a textured box node
   * @param  {Node} node - The node to visit
   */
  visitTextureBoxNode(node) {
    this.value = "TextureBoxNode";
  }
}