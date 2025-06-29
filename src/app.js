import { mainScene, mainCamera, mainRenderer } from './threeSetup.js';
import './renderer/skyboxEnvironment.js';
import './terrain/TerrainGenerator.js';
import physicsEngine from './physics/PhysicsEngine.js';
import RigidBody from './physics/RigidBody.js';
import * as THREE from 'three';

// Position camera for better terrain view
mainCamera.position.set(50, 30, 50);
mainCamera.lookAt(0, 0, 0);

// Add lighting for better terrain visibility
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
mainScene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
directionalLight.castShadow = true;
mainScene.add(directionalLight);

// Create a test projectile (sphere)
const projectileGeometry = new THREE.SphereGeometry(1, 16, 16);
const projectileMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xff4444, 
  metalness: 0.3, 
  roughness: 0.7 
});
const testProjectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
testProjectile.position.set(0, 20, 0);
mainScene.add(testProjectile);

// Create physics body for projectile
const projectileRigidBody = new RigidBody(testProjectile, 1, 0.5, 0.8);
projectileRigidBody.setVelocity(new THREE.Vector3(10, 0, 5));
physicsEngine.addBody(projectileRigidBody);

// Animation loop
let lastFrameTime = 0;
function animate(currentTime) {
  requestAnimationFrame(animate);
  
  const deltaTime = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;
  
  // Update physics simulation
  physicsEngine.update(deltaTime);
  
  mainRenderer.render(mainScene, mainCamera);
}

animate(); 