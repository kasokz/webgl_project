<script>
  import SceneGraph from "./components/SceneGraph.svelte";
  import PhongConfigurator from "./components/PhongConfigurator.svelte";
  import { onMount } from "svelte";
  import {
    sceneGraph,
    animationNodes,
    keysPressed,
    selectedNode,
    mouseOffsets
  } from "./state/stores.js";

  import vertexShader from "./shaders/raster-vertex-shader.glsl";
  import phongFragmentShader from "./shaders/raster-phong-fragment-shader.glsl";
  import textureVertexShader from "./shaders/raster-texture-vertex-shader.glsl";
  import textureFragmentShader from "./shaders/raster-texture-fragment-shader.glsl";

  import Vector from "./math/vector.js";
  import Matrix from "./math/matrix.js";
  import {
    RasterVisitor,
    RasterSetupVisitor
  } from "./renderer/rasterizer/rastervisitor.js";
  import RayVisitor from "./renderer/raytracer/rayvisitor.js";
  import Shader from "./shaders/shader.js";
  import { GroupNode } from "./scenegraph/nodes.js";
  import {
    FreeFlightNode,
    animationNodeClasses
  } from "./scenegraph/animation-nodes.js";
  import createDemoSceneGraph from "./demo.js";

  let fileInput;
  let downloadButton;
  let dataURL;
  let canvas;
  let activeRenderer;
  let rasterVisitor;
  let rasterSetupVisitor;

  const toggleRenderer = () => {};

  onMount(() => {
    const webgl = canvas.getContext("webgl");
    rasterVisitor = new RasterVisitor(webgl);
    rasterSetupVisitor = new RasterSetupVisitor(webgl);

    createDemoSceneGraph(canvas);

    rasterVisitor.shader = new Shader(webgl, vertexShader, phongFragmentShader);
    rasterVisitor.textureshader = new Shader(
      webgl,
      textureVertexShader,
      textureFragmentShader
    );

    activeRenderer = rasterVisitor;
    rasterSetupVisitor.setup($sceneGraph);

    const simulate = deltaT => {
      for (let animationNode of $animationNodes) {
        animationNode.simulate(deltaT);
      }
    };

    let lastTimestamp = performance.now();
    const animateFunc = timestamp => {
      simulate(timestamp - lastTimestamp);
      activeRenderer.render($sceneGraph);
      lastTimestamp = timestamp;
      window.requestAnimationFrame(animateFunc);
    };

    Promise.all([
      rasterVisitor.shader.load(),
      rasterVisitor.textureshader.load()
    ]).then(_ => window.requestAnimationFrame(animateFunc));
  });

  const handleKeyDown = event => {
    if (!$keysPressed.get(event.key)) {
      keysPressed.keydown(event.key);
    }
  };

  const handleKeyUp = event => {
    keysPressed.keyup(event.key);
  };

  const handleUpload = event => {
    const newSelection = event.target.files[0];
    if (newSelection) {
      const fileReader = new FileReader();
      fileReader.onload = e => {
        let parsed = JSON.parse(e.target.result);
        let sceneGraphObj = parsed.sceneGraph;
        let animationNodesArr = parsed.animationNodes;
        $selectedNode = {};
        $sceneGraph = GroupNode.fromJSON(sceneGraphObj);
        rasterSetupVisitor.setup($sceneGraph);
        $animationNodes = [];
        animationNodesArr.forEach(anim => {
          let newNode = animationNodeClasses[anim.type].fromJSON(anim);
          newNode.groupNode = $sceneGraph.find(anim.groupNodeId);
          animationNodes.add(newNode);
        });
      };
      fileReader.readAsText(newSelection);
      event.target.value = "";
    }
  };

  const handleDownload = event => {
    if (dataURL) {
      window.URL.revokeObjectURL(dataURL);
    }
    dataURL = window.URL.createObjectURL(
      new Blob(
        [
          JSON.stringify({
            sceneGraph: $sceneGraph,
            animationNodes: $animationNodes
          })
        ],
        { type: "application/json" }
      )
    );
    downloadButton.href = dataURL;
  };

  const handleMouseMove = event => {
    if (document.pointerLockElement === canvas) {
      mouseOffsets.addX(event.movementX);
      mouseOffsets.addY(event.movementY);
    }
  };

  const handlePointerLockChange = event => {
    if (
      document.pointerLockElement !== canvas &&
      document.mozPointerLockElement !== canvas
    ) {
      $animationNodes
        .filter(node => node instanceof FreeFlightNode)
        .forEach(node => (node.active = false));
    }
  };
  document.addEventListener("pointerlockchange", handlePointerLockChange);

  const startFreeFlight = event => {
    canvas.requestPointerLock();
    $animationNodes
      .filter(node => node instanceof FreeFlightNode)
      .forEach(node => (node.active = true));
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
    overflow-y: auto;
    box-shadow: 0.1em 0.1em 0.1em 0.1em rgba(0, 0, 0, 0.5);
    background-color: rgba(255, 166, 0, 0.404);
  }

  #header > a {
    text-decoration: none;
    color: inherit;
  }

  input[type="file"] {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
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
        id="freeflight_toggle"
        type="button"
        class="btn btn-primary"
        on:click={startFreeFlight}>
        Start free flight
      </button>
      <button
        id="renderer_toggle"
        type="button"
        class="btn btn-primary"
        on:click={toggleRenderer}>
        Toggle Renderer
      </button>
      <a
        id="save_button"
        role="button"
        class="btn btn-primary"
        download="scenegraph.json"
        bind:this={downloadButton}
        on:click={handleDownload}
        href="/">
        Save Scene
      </a>
      <button
        id="load_button"
        type="button"
        class="btn btn-primary"
        on:click={() => {
          fileInput.click();
        }}>
        Load Scene
        <input
          bind:this={fileInput}
          id="file-uploader"
          type="file"
          accept="application/json"
          on:change={handleUpload} />
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
  <canvas
    bind:this={canvas}
    width="1920"
    height="1080"
    on:mousemove={handleMouseMove} />
</div>
