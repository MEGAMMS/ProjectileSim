import { mainScene, mainCamera, mainRenderer } from './threeSetup.js';
import './renderer/skyboxEnvironment.js';
import * as THREE from 'three';

// Create a simple spinning cube
const spinningCube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.3 })
);
mainScene.add(spinningCube);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  spinningCube.rotation.y += 0.01;
  mainRenderer.render(mainScene, mainCamera);
}
animate(); 