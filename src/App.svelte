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
    mousePosition
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
    webgl.getExtension('OES_element_index_uint');
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
    // collisionSetupVisitor.setup($sceneGraph);

    const simulate = deltaT => {
      for (let animationNode of $animationNodes) {
        animationNode.simulate(deltaT);
      }
    };

    let lastTimestamp = performance.now();
    const animateFunc = timestamp => {
      simulate(timestamp - lastTimestamp);
      activeRenderer.render($sceneGraph);
      // collisionVisitor.render($sceneGraph);
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
  <canvas
    bind:this={canvas}
    width="1920"
    height="1080"
    on:contextmenu={startFreeFlight}
    on:mousemove={handleMouseMove}
    on:mouseenter={toggleIntersectSearch}
    on:mouseleave={toggleIntersectSearch} />
</div>
