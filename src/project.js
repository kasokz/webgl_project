import Vector from './math/vector.js';
import Matrix from './math/matrix.js';
import {
  GroupNode,
  SphereNode,
  TextureBoxNode
} from './scenegraph/nodes.js';
import {
  RasterVisitor,
  RasterSetupVisitor
} from './renderer/rasterizer/rastervisitor.js';
import Shader from './shaders/shader.js';
import {
  RotationNode
} from './scenegraph/animation-nodes.js';

window.addEventListener('load', () => {
  const canvas = document.getElementById("rasteriser");
  const gl = canvas.getContext("webgl");

  // construct scene graph
  const sg = new GroupNode(Matrix.scaling(new Vector(0.2, 0.2, 0.2)));
  const gn1 = new GroupNode(Matrix.translation(new Vector(1, 1, 0)));
  sg.add(gn1);
  const gn3 = new GroupNode(Matrix.identity());
  gn1.add(gn3);
  const sphere = new SphereNode(new Vector(.5, -.8, 0, 1), 0.4, new Vector(.8, .4, .1, 1))
  gn3.add(sphere);
  let gn2 = new GroupNode(Matrix.translation(new Vector(-.7, -0.4, .1)));
  sg.add(gn2);
  const cube = new TextureBoxNode(
    new Vector(-1, -1, -1, 1),
    new Vector(1, 1, 1, 1),
    'hci-logo.png'
  );
  gn2.add(cube);

  // setup for rendering
  const setupVisitor = new RasterSetupVisitor(gl);
  setupVisitor.setup(sg);

  const visitor = new RasterVisitor(gl);

  let camera = {
    eye: new Vector(-.5, .5, -1, 1),
    center: new Vector(0, 0, 0, 1),
    up: new Vector(0, 1, 0, 0),
    fovy: 60,
    aspect: canvas.width / canvas.height,
    near: 0.1,
    far: 100
  };

  const phongShader = new Shader(gl,
    "shaders/perspective-vertex-shader.glsl",
    "shaders/perspective-phong-fragment-shader.glsl"
  );
  visitor.shader = phongShader;
  const textureShader = new Shader(gl,
    "shaders/perspective-texture-vertex-shader.glsl",
    "shaders/texture-fragment-shader.glsl"
  );
  visitor.textureshader = textureShader;

  let animationNodes = [
    new RotationNode(gn2, new Vector(0, 0, 1)),
    new RotationNode(gn3, new Vector(0, 1, 0))
  ];

  function simulate(deltaT) {
    for (let animationNode of animationNodes) {
      animationNode.simulate(deltaT);
    }
  }

  let lastTimestamp = performance.now();

  function animate(timestamp) {
    simulate(timestamp - lastTimestamp);
    visitor.render(sg, camera);
    lastTimestamp = timestamp;
    window.requestAnimationFrame(animate);
  }
  Promise.all(
    [phongShader.load(), textureShader.load()]
  ).then(x =>
    window.requestAnimationFrame(animate)
  );

  window.addEventListener('keydown', function (event) {
    switch (event.code) {
      case "ArrowUp":
        animationNodes.forEach(node => node.toggleActive());
        break;
      case "KeyW":
        break;
      case "KeyA":
        break;
      case "KeyS":
        break;
      case "KeyD":
        break;
      case "KeyQ":
        break;
      case "KeyE":
        break;
    }
  });
});