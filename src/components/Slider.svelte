<script>
  export let value;
  export let name;
  export let min;
  export let max;
  export let step;
</script>

<style>
  .input_group {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: bottom;
  }
  label {
    padding-top: 0.3em;
    flex: 2;
  }
  input {
    flex: 6;
  }
  .value_container {
    padding-top: 0.3em;
    flex: 1;
    text-align: center;
    background: white;
    margin-left: 0.5em;
  }
</style>

<div class="input_group">
  <label for="slider">{name}</label>
  <input bind:value type="range" name="slider" {min} {max} {step} />
  <div class="value_container">{value}</div>
</div>
