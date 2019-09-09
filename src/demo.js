import { GroupNode, SphereNode, AABoxNode, TextureBoxNode, PyramidNode, CameraNode, LightNode } from './scenegraph/nodes.js'
import {
  sceneGraph,
  animationNodes,
} from "./state/stores.js";
import {
  RotationNode,
  BouncingNode,
  ManualRotationNode,
  FreeFlightNode,
} from "./scenegraph/animation-nodes.js";
import Vector from "./math/vector.js";
import Matrix from "./math/matrix.js";

const createDemoSceneGraph = (canvas) => {
  sceneGraph.set(
    new GroupNode("root", Matrix.scaling(new Vector(0.2, 0.2, 0.2)))
  );
  const sphereNode = new GroupNode(
    "sphereNode1",
    Matrix.translation(new Vector(3, 0, 3))
  );
  sphereNode.add(
    new SphereNode(
      "sphere1",
      new Vector(0, 0, 0, 1),
      0.5,
      new Vector(0.8, 0.4, 0.1, 1)
    )
  );
  const nose = new GroupNode(
    "noseGroup",
    Matrix.translation(new Vector(0, 0, 1))
  );
  nose.add(
    new AABoxNode(
      "nose",
      new Vector(0.5, 0.5, 0.5, 1),
      new Vector(-0.5, -0.5, -0.5, 1),
      new Vector(0, 0, 1, 1)
    )
  );
  sphereNode.add(nose);
  sceneGraph.add(sphereNode);

  const clockTower = new GroupNode(
    "clockTower",
    Matrix.translation(new Vector(0, 0.0, 8.0))
  );
  const redCube = new GroupNode("redCubeNode", Matrix.translation(new Vector(0, -3, 0)));
  redCube.add(
    new AABoxNode(
      "redCube",
      new Vector(-0.5, -1, -0.5, 1),
      new Vector(0.5, 6, 0.5, 1),
      new Vector(0.8, 0, 0, 1)
    )
  );
  const clockHand = new GroupNode(
    "clockHandGroup",
    Matrix.translation(new Vector(0, 5, -1))
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
    Matrix.translation(new Vector(0, 0, -0.5))
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
      "hci-logo.png"
    )
  );
  group2.add(cubeNode);
  rotatingBlockGroup.add(group2);
  clockFix.add(rotatingBlockGroup);
  clockTower.add(redCube);
  redCube.add(clockHand);
  clockHand.add(clockHandRoot);
  clockHandRoot.add(clockFix);
  sceneGraph.add(clockTower);

  let cameraNode = new GroupNode("cameraNode", Matrix.identity());
  cameraNode.add(
    new CameraNode(
      "camera",
      new Vector(0, 0, -2, 1),
      new Vector(0, 0, 0, 1),
      new Vector(0, 1, 0, 0),
      75,
      canvas.width / canvas.height,
      0.1,
      100
    )
  );
  sceneGraph.add(cameraNode);
  sceneGraph.add(new LightNode("centerLight", new Vector(1, 0, 0, 1)));

  animationNodes.add(new RotationNode(clockHandRoot, new Vector(0, 0, 1)));
  animationNodes.add(new ManualRotationNode(sphereNode, new Vector(0, 1, 0)));
  animationNodes.add(new RotationNode(cubeNode, new Vector(0, 1, 0)));
  animationNodes.add(new BouncingNode(sphereNode, new Vector(0, 1, 0), 2, 5));
  animationNodes.add(new ManualRotationNode(redCube, new Vector(0, 1, 0)));
  animationNodes.add(new FreeFlightNode(cameraNode, 0.5));
}

export default createDemoSceneGraph;