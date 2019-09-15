import { GroupNode, SphereNode, AABoxNode, TextureBoxNode, PyramidNode, CameraNode, LightNode, MeshNode } from './scenegraph/nodes.js'
import {
  sceneGraph,
  animationNodes,
} from "./state/stores.js";
import {
  RotationNode,
  BouncingNode,
  ManualRotationNode,
  FreeFlightNode,
  DriverNode,
} from "./scenegraph/animation-nodes.js";
import Vector from "./math/vector.js";
import Matrix from "./math/matrix.js";

const createDemoSceneGraph = (canvas) => {
  sceneGraph.set(
    new GroupNode("root", Matrix.scaling(new Vector(0.2, 0.2, 0.2)))
  );
  const sphereNode = new GroupNode(
    "sphereNode1",
    Matrix.translation(new Vector(0, 0, 0))
  );
  sphereNode.add(
    new AABoxNode(
      "nose",
      new Vector(0.5, 0.5, 0.5, 1),
      new Vector(-0.5, -0.5, -0.5, 1),
      new Vector(0, 0, 1, 1)
    )
  );
  const nose = new GroupNode(
    "noseGroup",
    Matrix.translation(new Vector(0, 0, -1))
  );
  nose.add(
    new SphereNode(
      "sphere1",
      new Vector(0, 0, 0, 1),
      0.5,
      new Vector(0.8, 0.4, 0.1, 1)
    )
  );
  sphereNode.add(nose);

  const clockTower = new GroupNode(
    "clockTower",
    Matrix.translation(new Vector(0, 0.0, -8.0))
  );
  const towerBase = new GroupNode("towerBaseNode", Matrix.translation(new Vector(0, -3, 0)));
  towerBase.add(
    new AABoxNode(
      "towerBase",
      new Vector(-0.5, -1, -0.5, 1),
      new Vector(0.5, 6, 0.5, 1),
      new Vector(0.8, 0.2, 0.4, 1)
    )
  );
  const clockHand = new GroupNode(
    "clockHandGroup",
    Matrix.translation(new Vector(0, 5, 1))
  );
  const clockHandRoot = new GroupNode("clockHandRoot", Matrix.identity());
  clockHandRoot.add(
    new PyramidNode(
      "clockHand",
      new Vector(-0.5, -1, -0.5, 1),
      new Vector(0.5, -1, 0.5, 1),
      4,
      new Vector(0, 0.6, 0, 1)
    )
  );
  const clockFix = new GroupNode(
    "clockFixNode",
    Matrix.translation(new Vector(0, 0, 0.5))
  );
  clockFix.add(
    new SphereNode(
      "clockFix",
      new Vector(0, 0, 0, 1),
      0.1,
      new Vector(0.5, 0.2, 0.4, 1)
    )
  );
  const rotatingBlockGroup = new GroupNode(
    "rotatingBlockGroup",
    Matrix.translation(new Vector(0, 4, 0))
  );
  let group2 = new GroupNode(
    "group2",
    Matrix.translation(new Vector(0, 0, 0))
  );
  let cubeNode = new GroupNode("cubeNode1", Matrix.identity());
  cubeNode.add(
    new TextureBoxNode(
      "textureBox1",
      new Vector(-1, -1, -1, 1),
      new Vector(1, 1, 1, 1),
      "hci-logo.png",
      "wave_normal.png"
    )
  );
  group2.add(cubeNode);
  rotatingBlockGroup.add(group2);
  clockFix.add(rotatingBlockGroup);
  clockTower.add(towerBase);
  towerBase.add(clockHand);
  clockHand.add(clockHandRoot);
  clockHandRoot.add(clockFix);

  const monkeyGroup = new GroupNode("monkeyGroup", Matrix.translation(new Vector(-3, 0, 1, -1)));
  monkeyGroup.add(new MeshNode("monkey", "http://localhost:5000/monkey.obj", new Vector(0.8, 0.5, .03, 1)));
  const teapotGroup = new GroupNode("teapotGroup", Matrix.translation(
    new Vector(5, 0, -11, 1)).mul(Matrix.scaling(
      new Vector(0.5, 0.5, 0.5))).mul(
        Matrix.rotation(new Vector(0, 1, 0), 180)));
  teapotGroup.add(new MeshNode("teapot", "http://localhost:5000/teapot.obj", new Vector(0, 0.8, 0.2, 1)));

  const cameraNode = new GroupNode("cameraNode", Matrix.identity());
  cameraNode.add(
    new CameraNode(
      "camera",
      new Vector(0, 0, 1, 1),
      new Vector(0, 0, -1, 1),
      new Vector(0, 1, 0, 1),
      75,
      canvas.width / canvas.height,
      0.1,
      100
    )
  );
  const lightNode = new GroupNode("lightNode", Matrix.identity());
  lightNode.add(new LightNode("centerLight", new Vector(1, 0, 0, 1)))
  lightNode.add(new SphereNode("centerLightVis", new Vector(0, 0, 0), 0.1, new Vector(1, 1, 1, 1)));
  const sunNode = new GroupNode("sunNode", Matrix.translation(new Vector(20, 0, 0, 1)));
  sunNode.add(new LightNode("sun", new Vector(1, 1, 0, 1)));
  sunNode.add(new SphereNode("sunVis", new Vector(0, 0, 0), 0.1, new Vector(1, 1, 0, 1)));

  sceneGraph.add(cameraNode);
  sceneGraph.add(sphereNode);
  // sceneGraph.add(teapotGroup);
  // sceneGraph.add(monkeyGroup);
  // sceneGraph.add(clockTower);
  sceneGraph.add(lightNode);
  sceneGraph.add(sunNode);


  // animationNodes.add(new RotationNode(clockHandRoot.id, new Vector(0, 0, 1)));
  // animationNodes.add(new ManualRotationNode(sphereNode.id, new Vector(0, 1, 0)));
  // animationNodes.add(new RotationNode(cubeNode.id, new Vector(0, 1, 0)));
  // animationNodes.add(new BouncingNode(sphereNode.id, new Vector(0, 1, 0), 2, 5));
  // animationNodes.add(new ManualRotationNode(towerBase.id, new Vector(0, 1, 0)));
  // animationNodes.add(new DriverNode(lightNode.id));
  // animationNodes.add(new RotationNode(sunNode.id, new Vector(0, 1, 1)));
  animationNodes.add(new FreeFlightNode(cameraNode.id, 0.5));
}

export default createDemoSceneGraph;