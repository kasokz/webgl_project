<script>
  import SceneGraph from "./components/SceneGraph.svelte";
  import PhongConfigurator from "./components/PhongConfigurator.svelte";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import {
    sceneGraph,
    animationNodes,
    keysPressed,
    selectedNode,
    mouseOffsets,
    mousePosition,
    mouseClicked
  } from "./state/stores.js";

  import vertexShader from "./shaders/rasterizer/raster-vertex-shader.glsl";
  import phongFragmentShader from "./shaders/rasterizer/raster-phong-fragment-shader.glsl";
  import textureVertexShader from "./shaders/rasterizer/raster-texture-vertex-shader.glsl";
  import textureFragmentShader from "./shaders/rasterizer/raster-texture-fragment-shader.glsl";
  import raytracerVertexShader from "./shaders/raytracer/raytracer-vertex-shader.glsl";
  import raytracerFragmentShader from "./shaders/raytracer/raytracer-fragment-shader.glsl";
  import collisionVertexShader from "./shaders/boundingSphere/bounding-sphere-vertex-shader.glsl";
  import collisionFragmentShader from "./shaders/boundingSphere/bounding-sphere-fragment-shader.glsl";

  import Vector from "./math/vector.js";
  import Matrix from "./math/matrix.js";
  import {
    RasterVisitor,
    RasterSetupVisitor
  } from "./renderer/rasterizer/rastervisitor.js";
  import RayVisitor from "./renderer/raytracer/rayvisitor.js";
  import {
    CollisionVisitor,
    CollisionSetupVisitor
  } from "./renderer/boundingSphere/collisionVisitor.js";
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
  let collisionVisitor;
  let collisionSetupVisitor;
  let rayVisitor;

  let averageFps;
  let frames = 0;
  let time = 0;
  let fps = 0;
  let framesLastSecond = 0;
  let nextSecond = 1000;

  const toggleRenderer = () => {
    if (activeRenderer === rasterVisitor) {
      activeRenderer = rayVisitor;
    } else {
      activeRenderer = rasterVisitor;
    }
  };

  onMount(() => {
    const webgl = canvas.getContext("webgl", {
      premultipliedAlpha: false
    });
    webgl.clearDepth(1.0);
    webgl.enable(webgl.DEPTH_TEST);
    webgl.depthFunc(webgl.LEQUAL);
    webgl.enable(webgl.BLEND);
    webgl.blendFunc(webgl.SRC_ALPHA, webgl.ONE_MINUS_SRC_ALPHA);
    webgl.getExtension("OES_element_index_uint");
    createDemoSceneGraph(canvas);

    rayVisitor = new RayVisitor(
      webgl,
      new Shader(webgl, raytracerVertexShader, raytracerFragmentShader)
    );
    rasterVisitor = new RasterVisitor(
      webgl,
      new Shader(webgl, vertexShader, phongFragmentShader),
      new Shader(webgl, textureVertexShader, textureFragmentShader)
    );
    rasterSetupVisitor = new RasterSetupVisitor(webgl);
    collisionVisitor = new CollisionVisitor(
      webgl,
      new Shader(webgl, collisionVertexShader, collisionFragmentShader)
    );
    collisionSetupVisitor = new CollisionSetupVisitor(webgl);

    activeRenderer = rasterVisitor;
    rasterSetupVisitor.setup($sceneGraph);
    collisionSetupVisitor.setup($sceneGraph);

    const simulate = deltaT => {
      for (let animationNode of $animationNodes) {
        animationNode.simulate(deltaT);
      }
    };

    let lastTimestamp = performance.now();
    const animateFunc = timestamp => {
      const deltaT = timestamp - lastTimestamp;
      simulate(deltaT);
      activeRenderer.render($sceneGraph);
      collisionVisitor.render($sceneGraph);
      updateFPS(deltaT);
      lastTimestamp = timestamp;
      window.requestAnimationFrame(animateFunc);
    };

    Promise.all([
      rasterVisitor.shader.load(),
      rasterVisitor.textureShader.load(),
      rayVisitor.shader.load(),
      collisionVisitor.shader.load()
    ]).then(_ => window.requestAnimationFrame(animateFunc));
  });

  const handleKeyDown = event => {
    if (!$keysPressed.get(event.key)) {
      keysPressed.keydown(event.key);
    }
  };

  const updateFPS = deltaT => {
    frames++;
    time += deltaT;
    averageFps = (frames / (time / 1000)).toFixed(2);
    framesLastSecond++;
    if (time >= nextSecond) {
      fps = framesLastSecond;
      nextSecond = time + 1000;
      framesLastSecond = 0;
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
        collisionSetupVisitor.setup($sceneGraph);
        $animationNodes = animationNodesArr.map(anim =>
          animationNodeClasses[anim.type].fromJSON(anim)
        );
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
    const x = event.clientX;
    const y = event.clientY;
    const rect = event.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      const x_in_canvas = x - rect.left;
      const y_in_canvas = rect.bottom - y;
      const canvasHeight = rect.bottom - rect.top;
      const canvasWidth = rect.right - rect.left;
      mousePosition.setX((2 * x_in_canvas) / canvasWidth - 1);
      mousePosition.setY((2 * y_in_canvas) / canvasHeight - 1);
    }
  };

  const toggleIntersectSearch = () => {
    collisionVisitor.toggleIntersect();
  };

  const handleStop = event => {
    get(animationNodes)
      .filter(n => !(n instanceof FreeFlightNode))
      .forEach(n => n.toggleActive());
  };

  const handleBoundToggle = () => {
    collisionVisitor.toggleRender();
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
    event.preventDefault();
    canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
    $animationNodes
      .filter(node => node instanceof FreeFlightNode)
      .forEach(node => (node.active = true));
  };

  const handleMouseDown = event => {
    if (event.which == 1) {
      $mouseClicked = true;
    }
  };

  const handleMouseUp = event => {
    if (event.which == 1) {
      $mouseClicked = false;
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
    overflow: hidden;
  }

  #header {
    grid-area: header;
    padding: 2em;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 166, 0, 0.904);
  }

  .main_content {
    position: relative;
    width: 100%;
    height: 100%;
    grid-area: content;
  }

  .main_content__canvas {
    width: 100%;
    height: 100%;
  }

  .main_content__overlay {
    position: absolute;
    left: 10px;
    top: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-family: monospace;
    padding: 1em;
  }

  .main_content__overlay > div {
    margin: auto;
  }

  #sidebar {
    grid-area: sidebar;
  }

  .sidebar__scenegraph {
    height: 70%;
    box-shadow: 0.1em 0.1em 0.1em 0.1em rgba(0, 0, 0, 0.5);
    background-color: rgba(255, 166, 0, 0.404);
    margin-bottom: 2%;
  }

  .sidebar__configurator {
    height: 28%;
    overflow-y: auto;
    box-shadow: 0.1em 0.1em 0.1em 0.1em rgba(0, 0, 0, 0.5);
    background-color: rgba(255, 166, 0, 0.404);
  }

  #header > .logo a {
    text-decoration: none;
    color: inherit;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  input[type="file"] {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }

  .logo {
    display: flex;
    flex-direction: row;
  }
</style>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />
<div class="main-container">
  <div id="header">
    <div class="logo">
      <img
        style="margin-right: 1em;"
        id="logo-img"
        alt="HCI Logo"
        src="hci-logo.png"
        width="70px"
        height="70px" />
      <div>
        <a href="/">
          <h1>ICG CS Master Project</h1>
        </a>
        <em style="padding-left: 1em; font-size: 1em">Long Bui</em>
      </div>
    </div>
    <div class="header__button-group">
      <button
        type="button"
        class="btn btn-primary"
        on:click={handleBoundToggle}>
        Toggle Bounding Spheres
      </button>
      <button type="button" class="btn btn-primary" on:click={handleStop}>
        Toggle Animation
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
  <div class="main_content">
    <canvas
      class="main_content__canvas"
      bind:this={canvas}
      width="1920"
      height="1080"
      on:contextmenu={startFreeFlight}
      on:mousemove={handleMouseMove}
      on:mouseenter={toggleIntersectSearch}
      on:mouseleave={toggleIntersectSearch}
      on:mousedown={handleMouseDown}
      on:mouseup={handleMouseUp} />
    <div class="main_content__overlay">
      <div>FPS: {fps}</div>
      <div>Average: {averageFps}</div>
    </div>
  </div>
</div>
