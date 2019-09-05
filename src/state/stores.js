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

export const sceneGraph = createSceneGraph();