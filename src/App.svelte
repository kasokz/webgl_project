<script>
  import SceneGraph from "./components/SceneGraph.svelte";
  import PhongConfigurator from "./components/PhongConfigurator.svelte";
  import { onMount, tick } from "svelte";
  import {
    sceneGraph,
    animationNodes,
    keysPressed,
    camera
  } from "./state/stores.js";

  import vertexShader from "./shaders/raster-vertex-shader.glsl";
  import phongFragmentShader from "./shaders/raster-phong-fragment-shader.glsl";
  import textureVertexShader from "./shaders/raster-texture-vertex-shader.glsl";
  import textureFragmentShader from "./shaders/raster-texture-fragment-shader.glsl";

  import Vector from "./math/vector.js";
  import Matrix from "./math/matrix.js";
  import {
    GroupNode,
    SphereNode,
    TextureBoxNode,
    AABoxNode
  } from "./scenegraph/nodes.js";
  import {
    RasterVisitor,
    RasterSetupVisitor
  } from "./renderer/rasterizer/rastervisitor.js";
  import RayVisitor from "./renderer/raytracer/rayvisitor.js";
  import Shader from "./shaders/shader.js";
  import {
    RotationNode,
    BouncingNode,
    ManualRotationNode
  } from "./scenegraph/animation-nodes.js";
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

    camera.set({
      eye: new Vector(0, 0, -1, 1),
      center: new Vector(0, 0, 0, 1),
      up: new Vector(0, 1, 0, 0),
      fovy: 60,
      aspect: canvas.width / canvas.height,
      near: 0.1,
      far: 100
    });

    // initialize scene graph
    sceneGraph.set(new GroupNode(Matrix.scaling(new Vector(0.2, 0.2, 0.2))));
    const group1 = new GroupNode(Matrix.translation(new Vector(1, 1, 0)));
    const sphereNode = new GroupNode(Matrix.identity());
    sphereNode.add(
      new SphereNode(new Vector(0, 0, 0, 1), 0.4, new Vector(0.8, 0.4, 0.1, 1))
    );
    group1.add(sphereNode);
    sceneGraph.add(group1);

    let group2 = new GroupNode(Matrix.translation(new Vector(0, 0, 5)));
    let cubeNode = new GroupNode(Matrix.identity());
    cubeNode.add(
      new TextureBoxNode(
        new Vector(-1, -1, -1, 1),
        new Vector(1, 1, 1, 1),
        "hci-logo.png"
      )
    );
    group2.add(cubeNode);
    sceneGraph.add(group2);

    let group3 = new GroupNode(Matrix.translation(new Vector(-6.0, 0.0, 3.0)));
    let redCube = new GroupNode(Matrix.rotation(new Vector(0, 1, 0), 180));
    redCube.add(
      new AABoxNode(
        new Vector(-1, -1, -1, 1),
        new Vector(1, 1, 1, 1),
        new Vector(0.8, 0, 0, 1)
      )
    );
    group3.add(redCube);
    sceneGraph.add(group3);

    rasterVisitor.shader = new Shader(webgl, vertexShader, phongFragmentShader);
    rasterVisitor.textureshader = new Shader(
      webgl,
      textureVertexShader,
      textureFragmentShader
    );

    activeRenderer = rasterVisitor;
    rasterSetupVisitor.setup($sceneGraph);
    animationNodes.add(new RotationNode(cubeNode, new Vector(0, 1, 0)));
    animationNodes.add(new BouncingNode(sphereNode, new Vector(0, 1, 0), 0.5));
    animationNodes.add(new ManualRotationNode(redCube, new Vector(0, 1, 0)));
    animationNodes.add(new ManualRotationNode(group3, new Vector(0, 1, 0)));
    animationNodes.add(new RotationNode(sphereNode, new Vector(0, 1, 0)));

    function simulate(deltaT) {
      for (let animationNode of $animationNodes) {
        animationNode.simulate(deltaT);
      }
    }

    let lastTimestamp = performance.now();

    const animateFunc = timestamp => {
      simulate(timestamp - lastTimestamp);
      activeRenderer.render($sceneGraph, $camera, lightPositions);
      lastTimestamp = timestamp;
      window.requestAnimationFrame(animateFunc);
    };

    Promise.all([
      rasterVisitor.shader.load(),
      rasterVisitor.textureshader.load()
    ]).then(_ => window.requestAnimationFrame(animateFunc));
  });

  const handleKeyDown = event => {
    if (event.key == "ArrowUp") {
      $animationNodes.forEach(node => node.toggleActive());
      return;
    }
    if (!$keysPressed.get(event.key)) {
      keysPressed.keydown(event.key);
    }
  };

  const handleKeyUp = event => {
    keysPressed.keyup(event.key);
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
  }

  .sidebar__scenegraph {
    height: 48%;
    box-shadow: 0.1em 0.1em 0.1em 0.1em rgba(0, 0, 0, 0.5);
    background-color: rgba(255, 166, 0, 0.404);
    margin-bottom: 2%;
  }

  .sidebar__configurator {
    height: 50%;
    overflow-y: scroll;
    box-shadow: 0.1em 0.1em 0.1em 0.1em rgba(0, 0, 0, 0.5);
    background-color: rgba(255, 166, 0, 0.404);
  }

  #header > a {
    text-decoration: none;
    color: inherit;
  }
</style>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />
<div class="main-container">
  <div id="header">
    <a href="/">
      <h1>ICG Master Project</h1>
    </a>
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
    <div class="sidebar__scenegraph">
      <SceneGraph />
    </div>
    <div class="sidebar__configurator">
      <PhongConfigurator />
    </div>
  </div>
  <canvas bind:this={canvas} width="1920" height="1080" />
</div>
