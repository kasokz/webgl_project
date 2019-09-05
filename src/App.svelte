<script>
  import { onMount } from "svelte";

  import vertexShader from "./shaders/perspective-vertex-shader.glsl";
  import phongFragmentShader from "./shaders/perspective-phong-fragment-shader.glsl";
  import textureVertexShader from "./shaders/perspective-texture-vertex-shader.glsl";
  import textureFragmentShader from "./shaders/perspective-texture-fragment-shader.glsl";

  import Vector from "./math/vector.js";
  import Matrix from "./math/matrix.js";
  import { GroupNode, SphereNode, TextureBoxNode } from "./scenegraph/nodes.js";
  import {
    RasterVisitor,
    RasterSetupVisitor
  } from "./renderer/rasterizer/rastervisitor.js";
  import RayVisitor from "./renderer/raytracer/rayvisitor.js";
  import Shader from "./shaders/shader.js";
  import { RotationNode } from "./scenegraph/animation-nodes.js";

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
  };

  onMount(() => {
    const canvas = document.getElementById("rasteriser");
    const gl = canvas.getContext("webgl");
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    // document.getElementById('renderer_toggle').addEventListener('click', toggleRenderer);
    document
      .getElementById("save_button")
      .addEventListener("click", () => handleExport(sceneGraph));
    document
      .getElementById("load_button")
      .addEventListener("click", () => handleImport());

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
    const sphere = new SphereNode(
      new Vector(0.5, -0.8, 0, 1),
      0.4,
      new Vector(0.8, 0.4, 0.1, 1)
    );
    gn3.add(sphere);
    let gn2 = new GroupNode(Matrix.translation(new Vector(-0.7, -0.4, 0.1)));
    sceneGraph.add(gn2);
    const cube = new TextureBoxNode(
      new Vector(-1, -1, -1, 1),
      new Vector(1, 1, 1, 1),
      "hci-logo.png"
    );
    gn2.add(cube);

    const phongShader = new Shader(gl, vertexShader, phongFragmentShader);
    rasterVisitor.shader = phongShader;
    const textureShader = new Shader(
      gl,
      textureVertexShader,
      textureFragmentShader
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

    const animateFunc = timestamp => {
      simulate(timestamp - lastTimestamp);
      activeRenderer.render(sceneGraph, camera);
      lastTimestamp = timestamp;
      window.requestAnimationFrame(animateFunc);
    };

    Promise.all([phongShader.load(), textureShader.load()]).then(x =>
      window.requestAnimationFrame(animateFunc)
    );
  });

  const handleKeyDown = event => {
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
  };

  const handleKeyUp = event => {
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
  };
</script>

<style>
  .main-container {
    height: 100vh;
    width: 100vw;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 10% 1fr;
    grid-template-areas:
      "header header header header sidebar"
      "content content content content sidebar";
  }

  #header {
    grid-area: header;
    padding: 2em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 166, 0, 0.904);
  }

  #rasteriser {
    width: 100%;
    height: 100%;
    grid-area: content;
  }

  #sidebar {
    grid-area: sidebar;
    background-color: rgba(255, 166, 0, 0.404);
  }
</style>

<div class="main-container">
  <div id="header">
    <h1>ICG Master Project</h1>
    <div class="header__button-group">
      <button id="renderer_toggle" type="button" class="btn btn-primary">
        Toggle Renderer
      </button>
      <button id="save_button" type="button" class="btn btn-primary">
        Save Scene
      </button>
      <button id="load_button" type="button" class="btn btn-primary">
        Load Scene
      </button>
    </div>
  </div>
  <div id="sidebar" />
  <canvas id="rasteriser" width="1920" height="1080" />
</div>
