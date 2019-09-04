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
import RayVisitor from './renderer/raytracer/rayvisitor.js';
import Shader from './shaders/shader.js';
import {
  RotationNode
} from './scenegraph/animation-nodes.js';

const sceneGraph = new GroupNode(Matrix.scaling(new Vector(0.2, 0.2, 0.2)));
let rasterVisitor;
let rasterSetupVisitor;
let rayVisitor;
let activeRenderer;

const toggleRenderer = () => {
  if (activeRenderer == rasterVisitor) {
    activeRenderer = rayVisitor;
  } else {
    activeRenderer = rasterVisitor;
    rasterSetupVisitor.setup(sceneGraph);
  }
}

window.addEventListener('load', () => {
  const canvas = document.getElementById("rasteriser");
  const gl = canvas.getContext("webgl");
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  // document.getElementById('renderer_toggle').addEventListener('click', toggleRenderer);
  document.getElementById('save_button').addEventListener('click', () => handleExport(sceneGraph));
  document.getElementById('load_button').addEventListener('click', () => handleImport());

  rasterVisitor = new RasterVisitor(gl);
  rasterSetupVisitor = new RasterSetupVisitor(gl);
  // rayVisitor = new RayVisitor(gl);

  let camera = {
    eye: new Vector(0, 0, -1, 1),
    center: new Vector(0, 0, 0, 1),
    up: new Vector(0, 1, 0, 0),
    fovy: 90,
    aspect: canvas.width / canvas.height,
    near: 0.1,
    far: 100
  };

  // construct scene graph
  const gn1 = new GroupNode(Matrix.translation(new Vector(1, 1, 0)));
  sceneGraph.add(gn1);
  const gn3 = new GroupNode(Matrix.identity());
  gn1.add(gn3);
  const sphere = new SphereNode(new Vector(.5, -.8, 0, 1), 0.4, new Vector(.8, .4, .1, 1))
  gn3.add(sphere);
  let gn2 = new GroupNode(Matrix.translation(new Vector(-.7, -0.4, .1)));
  sceneGraph.add(gn2);
  const cube = new TextureBoxNode(
    new Vector(-1, -1, -1, 1),
    new Vector(1, 1, 1, 1),
    'hci-logo.png'
  );
  gn2.add(cube);


  const phongShader = new Shader(gl,
    "shaders/perspective-vertex-shader.glsl",
    "shaders/perspective-phong-fragment-shader.glsl"
  );
  rasterVisitor.shader = phongShader;
  const textureShader = new Shader(gl,
    "shaders/perspective-texture-vertex-shader.glsl",
    "shaders/perspective-texture-fragment-shader.glsl"
  );
  rasterVisitor.textureshader = textureShader;

  activeRenderer = rasterVisitor;
  rasterSetupVisitor.setup(sceneGraph);


  let animationNodes = [
    new RotationNode(gn2, new Vector(0, 0, 1)),
    new RotationNode(gn2, new Vector(0, 1, 0))
  ];

  function simulate(deltaT) {
    for (let animationNode of animationNodes) {
      animationNode.simulate(deltaT);
    }
  }

  let lastTimestamp = performance.now();

  const animateFunc = (timestamp) => {
    simulate(timestamp - lastTimestamp);
    activeRenderer.render(sceneGraph, camera);
    lastTimestamp = timestamp;
    window.requestAnimationFrame(animateFunc);
  };

  Promise.all(
    [phongShader.load(), textureShader.load()]
  ).then(x =>
    window.requestAnimationFrame(animateFunc)
  );
});

const handleKeyDown = (event) => {
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
}

const handleKeyUp = (event) => {
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
}