<script>
  import { selectedNode } from "../state/stores.js";
  import UIVisitor from "../renderer/ui/UIVisitor.js";

  export let node;
  let uiVisitor = new UIVisitor();

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

  .active {
    border-radius: 10px;
    background: orange;
    color: white;
  }
</style>

<span class:active={$selectedNode === node} on:click={click}>
  {uiVisitor.visitNode(node)}
</span>
