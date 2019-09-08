<script>
  import Slider from "./Slider.svelte";
  import { phongConfiguration } from "../state/stores.js";
</script>

<style>
  .phong_container {
    padding: 1em;
    height: 100%;
  }
</style>

<div class="phong_container">
  <h2>Phong Parameters</h2>
  <hr />
  <Slider
    bind:value={$phongConfiguration.ambient}
    name="Ambient"
    min="0"
    max="1"
    step="0.01" />
  <Slider
    bind:value={$phongConfiguration.diffuse}
    name="Diffuse"
    min="0"
    max="1"
    step="0.01" />
  <Slider
    bind:value={$phongConfiguration.specular}
    name="Specular"
    min="0"
    max="1"
    step="0.01" />
  <Slider
    bind:value={$phongConfiguration.shininess}
    name="Shininess"
    min="0.1"
    max="100"
    step="0.1" />

</div>
