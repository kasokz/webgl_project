<script>
  import SceneGraph from "./components/SceneGraph.svelte";
  import PhongConfigurator from "./components/PhongConfigurator.svelte";
  import { onMount, onDestroy, tick } from "svelte";
  import {
    sceneGraph,
    animationNodes,
    keysPressed,
    camera,
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
    GroupNode,
    SphereNode,
    TextureBoxNode,
    AABoxNode,
    PyramidNode,
    CameraNode
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
    ManualRotationNode,
    FreeFlightNode,
    animationNodeClasses
  } from "./scenegraph/animation-nodes.js";

  let fileInput;
  let downloadButton;
  let unsubscribeSceneGraph;
  let dataURL;
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

    // initialize scene graph
    sceneGraph.set(
      new GroupNode("root", Matrix.scaling(new Vector(0.2, 0.2, 0.2)))
    );
    const group1 = new GroupNode(
      "group1",
      Matrix.translation(new Vector(1, 1, 0))
    );
    const sphereNode = new GroupNode("sphereNode1", Matrix.identity());
    sphereNode.add(
      new SphereNode(
        "sphere1",
        new Vector(0, 0, 0, 1),
        0.5,
        new Vector(0.8, 0.4, 0.1, 1)
      )
    );
    group1.add(sphereNode);
    sceneGraph.add(group1);

    let group2 = new GroupNode(
      "group2",
      Matrix.translation(new Vector(0, 0, 5))
    );
    let cubeNode = new GroupNode("cubeNode1", Matrix.identity());
    cubeNode.add(
      new TextureBoxNode(
        "textureBox1",
        new Vector(-1, -1, -1, 1),
        new Vector(1, 1, 1, 1),
        "hci-logo.png"
      )
    );
    group2.add(cubeNode);
    sceneGraph.add(group2);

    let group3 = new GroupNode(
      "group3",
      Matrix.translation(new Vector(-6.0, 0.0, 3.0))
    );
    let redCube = new GroupNode(
      "redCubeNode",
      Matrix.rotation(new Vector(0, 1, 0), 180)
    );
    redCube.add(
      new AABoxNode(
        "redCube",
        new Vector(-1, -1, -1, 1),
        new Vector(1, 1, 1, 1),
        new Vector(0.8, 0, 0, 1)
      )
    );
    let pyramidNode = new GroupNode(
      "pyramidNode",
      Matrix.translation(new Vector(3, 0, 3))
    );
    pyramidNode.add(
      new PyramidNode(
        "pyarmid",
        new Vector(-1, -1, -1, 1),
        new Vector(1, -1, 1, 1),
        5,
        new Vector(0, 0.6, 0, 1)
      )
    );
    group3.add(redCube);
    group3.add(pyramidNode);
    sceneGraph.add(group3);

    let cameraNode = new GroupNode("cameraNode", Matrix.identity());
    cameraNode.add(
      new CameraNode(
        "camera",
        new Vector(0, 0, -1, 1),
        new Vector(0, 0, 0, 1),
        new Vector(0, 1, 0, 0),
        60,
        canvas.width / canvas.height,
        0.1,
        100
      )
    );
    sceneGraph.add(cameraNode);

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
    animationNodes.add(
      new ManualRotationNode($sceneGraph, new Vector(0, 1, 0))
    );
    animationNodes.add(new RotationNode(sphereNode, new Vector(0, 1, 0)));
    animationNodes.add(new ManualRotationNode(group1, new Vector(1, 0, 0)));
    animationNodes.add(
      new ManualRotationNode(pyramidNode, new Vector(0, 1, 0))
    );
    animationNodes.add(new FreeFlightNode(cameraNode, 0.5));

    function simulate(deltaT) {
      for (let animationNode of $animationNodes) {
        animationNode.simulate(deltaT);
      }
    }

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

  const handleCanvasClick = event => {
    canvas.requestPointerLock();
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
    on:mousemove={handleMouseMove}
    on:click={handleCanvasClick} />
</div>
