<script>
  import { onDestroy } from "svelte";
  import { keysPressed, camera } from "../state/stores.js";

  const functionMap = {
    ArrowUp: () => {},
    ArrowDown: () => {},
    ArrowLeft: () => {},
    ArrowRight: () => {},
    W: () => {},
    A: () => {},
    S: () => {},
    D: () => {}
  };

  const unsubscribe = keysPressed.subscribe(keyMap => {
    keyMap.forEach((k, v) => {
      if (v) {
        functionMap[k]();
      }
    });
  });

  onDestroy(unsubscribe);
</script>
