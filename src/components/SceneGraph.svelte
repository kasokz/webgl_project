<script>
  import { sceneGraph } from "../state/stores.js";
  import SceneGraphNode from "./SceneGraphNode.svelte";
  import UIVisitor from "../renderer/ui/UIVisitor.js";
</script>

<style>
  .scenegraph_container {
    padding: 1em;
  }
</style>

<div class="scenegraph_container">
  <h2>Current Scene Graph</h2>
  <hr />
  <SceneGraphNode node={$sceneGraph} />
</div>
