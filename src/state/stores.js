import { writable } from 'svelte/store';
import { GroupNode } from '../scenegraph/nodes.js';
import Matrix from '../math/matrix.js';

const createSceneGraph = () => {
  const { subscribe, update, set } = writable(new GroupNode(Matrix.identity()));

  return {
    subscribe,
    set,
    add: (node) => update(sg => { sg.add(node); return sg }),
    //remove: (node) => update(sg => sg.filter((_, i) => i !== sg.indexOf(node))),
  }
}

const createAnimationNodes = () => {
  const { subscribe, update } = writable([]);

  return {
    subscribe,
    add: (node) => update(nodes => [...nodes, node]),
    remove: (node) => update(nodes => nodes.filter((_, i) => i !== nodes.indexOf(node))),
  }
}

export const selectedNode = writable({});
export const sceneGraph = createSceneGraph();
export const animationNodes = createAnimationNodes();