<script>
  import SceneGraph from "./components/SceneGraph.svelte";
  import { onMount, tick } from "svelte";
  import { sceneGraph, animationNodes, keysPressed } from "./state/stores.js";

  import vertexShader from "./shaders/raster-vertex-shader.glsl";
  import phongFragmentShader from "./shaders/raster-phong-fragment-shader.glsl";
  import textureVertexShader from "./shaders/raster-texture-vertex-shader.glsl";
  import textureFragmentShader from "./shaders/raster-texture-fragment-shader.glsl";

  import Vector from "./math/vector.js";
  import Matrix from "./math/matrix.js";
  import { GroupNode, SphereNode, TextureBoxNode } from "./scenegraph/nodes.js";
  import {
    RasterVisitor,
    RasterSetupVisitor
  } from "./renderer/rasterizer/rastervisitor.js";
  import RayVisitor from "./renderer/raytracer/rayvisitor.js";
  import Shader from "./shaders/shader.js";
  import { RotationNode, BouncingNode } from "./scenegraph/animation-nodes.js";
  import handleExport from "./io/export.js";
  import handleImport from "./io/import.js";

  let canvas;
  let activeRenderer;
  let rasterVisitor;
  let rasterSetupVisitor;
  let lightPositions = [new Vector(1, 1, -1, 1)];

  const toggleRenderer = () => {};

  onMount(() => {
    const webgl = canvas.getContext("webgl");
    rasterVisitor = new RasterVisitor(webgl);
    rasterSetupVisitor = new RasterSetupVisitor(webgl);

    let camera = {
      eye: new Vector(0, 0, -1, 1),
      center: new Vector(0, 0, 0, 1),
      up: new Vector(0, 1, 0, 0),
      fovy: 90,
      aspect: canvas.width / canvas.height,
      near: 0.1,
      far: 100
    };

    // initialize scene graph
    sceneGraph.set(new GroupNode(Matrix.scaling(new Vector(0.2, 0.2, 0.2))));
    const gn1 = new GroupNode(Matrix.translation(new Vector(1, 1, 0)));
    const gn3 = new GroupNode(Matrix.identity());
    gn1.add(gn3);
    const sphere = new SphereNode(
      new Vector(0.5, -0.8, 0, 1),
      0.4,
      new Vector(0.8, 0.4, 0.1, 1)
    );
    gn3.add(sphere);
    sceneGraph.add(gn1);
    let gn2 = new GroupNode(Matrix.translation(new Vector(-0.7, -0.4, 0.1)));
    const cube = new TextureBoxNode(
      new Vector(-1, -1, -1, 1),
      new Vector(1, 1, 1, 1),
      "hci-logo.png"
    );
    gn2.add(cube);
    sceneGraph.add(gn2);

    const phongShader = new Shader(webgl, vertexShader, phongFragmentShader);
    rasterVisitor.shader = phongShader;
    const textureShader = new Shader(
      webgl,
      textureVertexShader,
      textureFragmentShader
    );
    rasterVisitor.textureshader = textureShader;

    activeRenderer = rasterVisitor;
    rasterSetupVisitor.setup($sceneGraph);

    animationNodes.add(new RotationNode(gn2, new Vector(0, 0, 1)));
    animationNodes.add(new RotationNode(gn2, new Vector(0, 1, 0)));
    animationNodes.add(new BouncingNode(gn3, new Vector(0, 1, 0), 0.7));

    function simulate(deltaT) {
      for (let animationNode of $animationNodes) {
        animationNode.simulate(deltaT);
      }
    }

    let lastTimestamp = performance.now();

    const animateFunc = timestamp => {
      simulate(timestamp - lastTimestamp);
      activeRenderer.render($sceneGraph, camera, lightPositions);
      lastTimestamp = timestamp;
      window.requestAnimationFrame(animateFunc);
    };

    Promise.all([phongShader.load(), textureShader.load()]).then(_ =>
      window.requestAnimationFrame(animateFunc)
    );
  });

  const handleKeyDown = event => {
    if (event.code == "ArrowUp") {
      $animationNodes.forEach(node => node.toggleActive());
      return;
    }
    if (!$keysPressed.get(event.code)) {
      keysPressed.keydown(event.code);
    }
  };

  const handleKeyUp = event => {
    keysPressed.keyup(event.code);
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

  canvas {
    width: 100%;
    height: 100%;
    grid-area: content;
  }

  #sidebar {
    grid-area: sidebar;
    background-color: rgba(255, 166, 0, 0.404);
  }
</style>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />
<div class="main-container">
  <div id="header">
    <h1>ICG Master Project</h1>
    <div class="header__button-group">
      <button
        id="renderer_toggle"
        type="button"
        class="btn btn-primary"
        on:click={toggleRenderer}>
        Toggle Renderer
      </button>
      <button
        id="save_button"
        type="button"
        class="btn btn-primary"
        on:click={() => handleExport(sceneGraph)}>
        Save Scene
      </button>
      <button
        id="load_button"
        type="button"
        class="btn btn-primary"
        on:click={() => handleImport()}>
        Load Scene
      </button>
    </div>
  </div>
  <div id="sidebar">
    <SceneGraph />
  </div>
  <canvas bind:this={canvas} width="1920" height="1080" />
</div>
