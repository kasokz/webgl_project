<script>
  import { sceneGraph, selectedNode, hoveredNode } from "../state/stores.js";

  export let node;

  const click = () => {
    selectedNode.set(node);
  };

  const mouseEnter = () => {
    hoveredNode.set(node);
  };

  const remove = event => {
    event.preventDefault();
    sceneGraph.remove(node.id);
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

<span
  class:active={$selectedNode === node}
  on:click={click}
  on:mouseenter={mouseEnter}
  on:contextmenu={remove}>
  <strong>{node.id}</strong>
  {` (${node.constructor.name})`}
</span>
