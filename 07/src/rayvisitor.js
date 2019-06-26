import Matrix from './matrix.js';
import Sphere from './sphere.js';
import Intersection from './intersection.js';
import Ray from './ray.js';
import phong from './phong.js';

/**
 * Class representing a Visitor that uses
 * Raytracing to render a Scenegraph
 */
export default class RayVisitor {
  /**
   * Creates a new RayVisitor
   * @param {Object} context - The 2D context to render to
   * @param {number} width   - The width of the canvas
   * @param {number} height  - The height of the canvas
   */
  constructor(context, width, height) {
    this.context = context;
    this.imageData = context.getImageData(0, 0, width, height);
    this.matrixStack = [];
    this.modelMat = Matrix.identity();
  }

  /**
   * Renders the Scenegraph
   * @param  {Node} rootNode                 - The root node of the Scenegraph
   * @param  {Object} camera                 - The camera used
   * @param  {Array.<Vector>} lightPositions - The light light positions
   */
  render(rootNode, camera, lightPositions) {
    // clear
    let data = this.imageData.data;
    data.fill(0);
    this.objects = [];
    this.matrixStack = [];
    this.modelMat = Matrix.identity();

    // build list of render objects
    rootNode.accept(this);

    // raytrace
    const width = this.imageData.width;
    const height = this.imageData.height;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const ray = Ray.makeRay(x, y, camera);

        let minIntersection = new Intersection();
        let minObj = null;
        for (let shape of this.objects) {
          const intersection = shape.intersect(ray);
          if (intersection && intersection.closerThan(minIntersection)) {
            minIntersection = intersection;
            minObj = shape;
          }
        }
        if (minObj) {
          if (!minObj.color) {
            setPixel(x, y, new Vector(0, 0, 0, 1));
          } else {
            let color = phong(minObj.color, minIntersection, lightPositions, 10, camera.origin);
            data[4 * (width * y + x) + 0] = color.r * 255;
            data[4 * (width * y + x) + 1] = color.g * 255;
            data[4 * (width * y + x) + 2] = color.b * 255;
            data[4 * (width * y + x) + 3] = color.a * 255;
          }
        }
      }
    }
    this.context.putImageData(this.imageData, 0, 0);
  }

  /**
   * Visits a group node
   * @param  {Node} node - The node to visit
   */
  visitGroupNode(node) {
    node.children.forEach(child => {
      this.modelMat = this.modelMat.mul(node.matrix);
      this.matrixStack.push(this.modelMat);
      child.accept(this);
    });
    this.modelMat = this.matrixStack.pop();
  }

  /**
   * Visits a sphere node
   * @param  {Node} node - The node to visit
   */
  visitSphereNode(node) {
    this.objects.push(new Sphere(this.modelMat.mul(node.center), node.radius, node.color));
    this.modelMat = this.matrixStack.pop();
  }

  /**
   * Visits an axis aligned box node
   * @param  {Node} node - The node to visit
   */
  visitAABoxNode(node) {
    this.objects.push(
      new AABox(this.modelMat.mul(node.minPoint), this.modelMat.mul(node.maxPoint), node.color)
    );
    this.modelMat = this.matrixStack.pop();
  }

  /**
   * Visits a textured box node
   * @param  {Node} node - The node to visit
   */
  visitTextureBoxNode(node) {
    this.objects.push(
      new AABox(this.modelMat.mul(node.minPoint), this.modelMat.mul(node.maxPoint), node.color)
    );
    this.modelMat = this.matrixStack.pop();
  }
}
