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
    new GroupNode("root", Matrix.identity())
  );
  const baseTranslation = new GroupNode("baseTranslation", Matrix.translation(new Vector(0, 0, -8)));
  const desktopBase = new GroupNode("desktopBase", Matrix.identity());
  baseTranslation.add(desktopBase);
  desktopBase.add(
    new TextureBoxNode(
      "towerBase",
      new Vector(-2, -2, -2, 1),
      new Vector(2, 2, 2, 1),
      "hci-logo.png",
      "wood.jpg",
    )
  );
  const clockHandRoot = new GroupNode("clockHandRoot", Matrix.translation(new Vector(0, 0, 2)));
  clockHandRoot.add(
    new PyramidNode(
      "clockHand",
      new Vector(-0.25, -0.5, -0.25, 1),
      new Vector(0.25, -0.5, 0.25, 1),
      2,
      new Vector(0, 0.6, 0, 1)
    )
  );
  const clockFix = new GroupNode(
    "clockFixNode",
    Matrix.translation(new Vector(0, 0, 0.25, 1))
  );
  clockFix.add(
    new SphereNode(
      "clockFix",
      new Vector(0, 0, 0, 1),
      0.1,
      new Vector(0.5, 0.2, 0.4, 1)
    )
  );
  const clockHandTip = new GroupNode(
    "clockHandTipGroup",
    Matrix.translation(new Vector(0, 2, 0, 1)).mul(Matrix.scaling(new Vector(0.5, 0.5, 0.5)))
  );
  clockHandTip.add(
    new MeshNode(
      "clockMonkey",
      "http://localhost:5000/monkey.obj",
      new Vector(0.3, 0.2, 0.0, 1)
    )
  );
  clockFix.add(clockHandTip);
  clockHandRoot.add(clockFix);
  desktopBase.add(clockHandRoot);


  const teapotGroup = new GroupNode("teapotGroup", Matrix.translation(
    new Vector(0, 2.05, 0, 1)).mul(Matrix.scaling(
      new Vector(0.4, 0.4, 0.4))));
  teapotGroup.add(new MeshNode("teapot", "http://localhost:5000/teapot.obj", new Vector(1, 0.8, 0, 1)));
  desktopBase.add(teapotGroup);

  const carpetGroup = new GroupNode("carpetGroup", Matrix.translation(new Vector(0, -2, 0)));
  carpetGroup.add(new TextureBoxNode("carpet", new Vector(-20, 0, -20, 1), new Vector(20, 0.01, 20), "carpet.jpg"));
  baseTranslation.add(carpetGroup);

  const lucyGroup = new GroupNode("lucyGroup", Matrix.scaling(
    new Vector(5, 5, 5)));
  lucyGroup.add(new MeshNode("lucy", "http://localhost:5000/lucyBig.obj", new Vector(0, 0.8, 0.2, 1)));

  const house = new GroupNode("houseGroup", Matrix.translation(new Vector(0, -2.1, 0)));
  house.add(new TextureBoxNode("houseNode", new Vector(-20, 0, -20, 1), new Vector(20, 20, 20), "shack.jpg"));
  baseTranslation.add(house);

  const cameraHolder = new GroupNode("camerHolder", Matrix.translation(new Vector(0, 2, 0, 1)));
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
  cameraHolder.add(cameraNode);
  const lightNode = new GroupNode("lightNode", Matrix.translation(new Vector(0, 5, 0, 1)));
  lightNode.add(new LightNode("centerLight", new Vector(1, 0, 0, 1)))
  const sunNode = new GroupNode("sunNode", Matrix.translation(new Vector(20, 0, 0, 1)));
  sunNode.add(new LightNode("sun", new Vector(1, 1, 0, 1)));

  sceneGraph.add(cameraHolder);
  sceneGraph.add(baseTranslation);
  sceneGraph.add(lightNode);
  sceneGraph.add(sunNode);

  animationNodes.add(new RotationNode(desktopBase.id, new Vector(0, 1, 0), 45));
  animationNodes.add(new BouncingNode(clockHandTip.id, new Vector(0, 1, 0), 0.25, 2));
  animationNodes.add(new RotationNode(clockHandRoot.id, new Vector(0, 0, 1), 90));
  animationNodes.add(new RotationNode(sunNode.id, new Vector(0, 1, 1), 90));
  animationNodes.add(new FreeFlightNode(cameraNode.id, 0.5));
}

export default createDemoSceneGraph;