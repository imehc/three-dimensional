import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from "./setupModel";

const loadBirds = async () => {
  const loader = new GLTFLoader();

  const parrotUrl = new URL('./assets/models/Parrot.glb', import.meta.url).href;
  const flamingoUrl = new URL('./assets/models/Flamingo.glb', import.meta.url).href;
  const storkUrl = new URL('./assets/models/Stork.glb', import.meta.url).href;

  const [parrotData, flamingoData, storkData] = await Promise.all([
    loader.loadAsync(parrotUrl),
    loader.loadAsync(flamingoUrl),
    loader.loadAsync(storkUrl)
  ])

  const parrot = setupModel(parrotData);
  parrot.position.set(0, 0, 2.5);
  console.log('Squaaawk!', parrotData);

  const flamingo = setupModel(flamingoData);
  flamingo.position.set(7.5, 0, -10);

  const stork = setupModel(storkData);
  stork.position.set(0, -2.5, -10);

  return {
    parrot,
    flamingo,
    stork,
  }
}

export { loadBirds };