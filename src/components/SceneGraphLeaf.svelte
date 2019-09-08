<script>
  import { selectedNode } from "../state/stores.js";

  export let node;

  const click = () => {
    selectedNode.set(node);
  };
</script>

<style>
  span {
    cursor: pointer;
    display: inline-block;
    padding: 0 0.5em 0 0.5em;
  }

  span:hover {
    border-radius: 10px;
    background: yellow;
    color: black;
  }

  .active {
    border-radius: 10px;
    background: orange;
    color: white;
  }
</style>

<span class:active={$selectedNode === node} on:click={click}>
  <strong>{node.id}</strong>
  {` (${node.constructor.name})`}
</span>
