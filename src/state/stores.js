import { writable, derived } from 'svelte/store';
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
        let kA = shader.getUniformFloat("kA");
        if (kA) {
          kA.set(phong.ambient);
        }
        let kD = shader.getUniformFloat("kD");
        if (kD) {
          kD.set(phong.diffuse)
        }
        let kS = shader.getUniformFloat("kS");
        if (kS) {
          kS.set(phong.specular);
        }
        let shininess = shader.getUniformFloat("shininess");
        if (shininess) {
          shininess.set(phong.shininess);
        }
      });
      unsubscribe();
    }
  }
}

export const phongConfiguration = createPhongConfiguration();
export const camera = writable({});
export const keysPressed = createKeysPressed();
export const selectedNode = writable({});
export const sceneGraph = createSceneGraph();
export const animationNodes = createAnimationNodes();