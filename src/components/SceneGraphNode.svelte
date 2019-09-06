<script>
  import { onMount } from "svelte";
  import SceneGraphLeaf from "./SceneGraphLeaf.svelte";
  import { GroupNode } from "../scenegraph/nodes.js";
  import { animationNodes } from "../state/stores.js";

  export let node;
  let showChildren = true;
  let showAnimations = true;

  const toggleChildren = () => {
    showChildren = !showChildren;
  };
  const toggleAnimations = () => {
    showAnimations = !showAnimations;
  };
</script>

<style>
  .category_container {
    padding-left: 0.5em;
  }

  .children_container {
    padding-left: 1em;
    list-style: none;
    border-left: 1px solid black;
  }

  span {
    padding: 0 0.5em 0 1.5em;
    cursor: pointer;
    font-weight: bold;
  }

  .dropDown {
    background: url(icons/arrow_drop_down.svg) 0 0.2em no-repeat;
    background-size: 1em 1em;
  }

  .dropUp {
    background: url(icons/arrow_drop_up.svg) 0 0.2em no-repeat;
    background-size: 1em 1em;
  }
</style>

<SceneGraphLeaf {node} />
{#if $animationNodes.map(n => n.groupNode).indexOf(node) !== -1}
  <div class="category_container">
    <span
      class:dropDown={!showAnimations}
      class:dropUp={showAnimations}
      on:click={toggleAnimations}>
      AnimationNodes:
    </span>
    {#if showAnimations}
      <ul class="children_container">
        {#each $animationNodes.filter(aNode => aNode.groupNode === node) as animation}
          <div style="padding: 0 0.5em 0 0.5em;">
            {animation.constructor.name}
          </div>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
<div class="category_container">
  <span
    class:dropDown={!showChildren}
    class:dropUp={showChildren}
    on:click={toggleChildren}>
    ChildNodes:
  </span>
  {#if showChildren}
    <ul class="children_container">
      {#each node.children as child}
        {#if child instanceof GroupNode}
          <svelte:self node={child} />
        {:else}
          <SceneGraphLeaf node={child} />
        {/if}
      {/each}
    </ul>
  {/if}
</div>
