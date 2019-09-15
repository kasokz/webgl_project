import { writable } from 'svelte/store';
import { GroupNode } from '../scenegraph/nodes.js';
import Matrix from '../math/matrix.js';

const createSceneGraph = () => {
  const { subscribe, update, set } = writable(new GroupNode(Matrix.identity()));

  return {
    subscribe,
    set,
    add: (node) => update(sg => { sg.add(node); return sg }),
    remove: (node) => update(sg => sg.filter((_, i) => i !== sg.indexOf(node))),
  }
}

const createAnimationNodes = () => {
  const { subscribe, update, set } = writable([]);

  return {
    subscribe,
    set,
    add: (node) => update(nodes => [...nodes, node]),
    remove: (node) => update(nodes => nodes.filter((_, i) => i !== nodes.indexOf(node))),
  }
}

const createKeysPressed = () => {
  const { subscribe, update } = writable(new Map());

  return {
    subscribe,
    keydown: (key) => update(keys => { keys.set(key, true); return keys; }),
    keyup: (key) => update(keys => { keys.set(key, false); return keys; })
  }
}

const createPhongConfiguration = () => {
  const { subscribe, update, set } = writable({
    ambient: 0.6,
    diffuse: 0.6,
    specular: 0.8,
    shininess: 10.
  });

  return {
    subscribe,
    update,
    set,
    loadIntoShader: (shader) => {
      const unsubscribe = subscribe(phong => {
        shader.trySet(shader.getUniformFloat.bind(shader), "kA", phong.ambient);
        shader.trySet(shader.getUniformFloat.bind(shader), "kD", phong.diffuse);
        shader.trySet(shader.getUniformFloat.bind(shader), "kS", phong.specular);
        shader.trySet(shader.getUniformFloat.bind(shader), "shininess", phong.shininess);
      });
      unsubscribe();
    }
  }
}

const createMouseMovement = () => {
  const { subscribe, update, set } = writable({ x: 0, y: 0 });

  return {
    subscribe,
    addX: (offsetX) => { update(offsets => { return { ...offsets, x: offsets.x + offsetX } }) },
    addY: (offsetY) => { update(offsets => { return { ...offsets, y: offsets.y + offsetY } }) },
    reset: () => set({ x: 0, y: 0 })
  }
}

const createMousePosition = () => {
  const { subscribe, update, set } = writable({ x: 0, y: 0 });

  return {
    subscribe,
    setX: (mouseX) => { update(position => { return { ...position, x: mouseX } }) },
    setY: (mouseY) => { update(position => { return { ...position, y: mouseY } }) },
    reset: () => set({ x: 0, y: 0 })
  }
}

export const mousePosition = createMousePosition();
export const mouseOffsets = createMouseMovement();
export const phongConfiguration = createPhongConfiguration();
export const camera = writable({});
export const keysPressed = createKeysPressed();
export const selectedNode = writable({});
export const hoveredNode = writable({});
export const sceneGraph = createSceneGraph();
export const animationNodes = createAnimationNodes();