<script>
  import { sceneGraph } from "../state/stores.js";
</script>

<style>

</style>

{#each $sceneGraph.children as node}
  <div>{node.matrix.getVal(0, 0)}</div>
{/each}
