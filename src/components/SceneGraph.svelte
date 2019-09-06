<script>
  import { sceneGraph, keysPressed } from "../state/stores.js";
  import SceneGraphNode from "./SceneGraphNode.svelte";
</script>

<style>
  .scenegraph_container {
    padding: 1em;
    overflow-y: scroll;
    height: 100%;
  }
</style>

<div class="scenegraph_container">
  <h2>Scene Graph</h2>
  <hr />
  <SceneGraphNode node={$sceneGraph} />
</div>
