import * as THREE from 'three';
import { mainRenderer } from './threeSetup.js';
import { mainScene, mainCamera } from './objects/world.js';
import './objects/skybox.js';
import './objects/terrain.js';
import {projectiles} from './objects/projectiles.js';
import physicsEngine from './physics/PhysicsEngine.js';


// Animation loop
let lastFrameTime = 0;
function animate(currentTime) {
  requestAnimationFrame(animate);

  const deltaTime = (currentTime - lastFrameTime) / 1000 || 0;
  lastFrameTime = currentTime;

  physicsEngine.update(deltaTime);

  mainRenderer.render(mainScene, mainCamera);
}

animate();