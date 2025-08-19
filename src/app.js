import { mainScene, mainCamera, mainRenderer } from './threeSetup.js';
import './renderer/skyboxEnvironment.js';
import './terrain/TerrainGenerator.js';
import physicsEngine from './physics/PhysicsEngine.js';
import RigidBody from './physics/RigidBody.js';
import * as THREE from 'three';

// Enable shadows
mainRenderer.shadowMap.enabled = true;
mainRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Position camera for better terrain view
mainCamera.position.set(50, 30, 50);
mainCamera.lookAt(0, 0, 0);

// Sun-like lighting setup
const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.3);
mainScene.add(ambientLight);

// Main sun light
const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(100, 200, 100);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
mainScene.add(sunLight);

// Add a softer fill light
const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
fillLight.position.set(-50, 100, -50);
mainScene.add(fillLight);

// Create a test projectile (sphere)
const projectileGeometry = new THREE.SphereGeometry(1, 16, 16);
const projectileMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xff4444, 
  metalness: 0.3, 
  roughness: 0.7 
});
const testProjectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
testProjectile.castShadow = true;
testProjectile.receiveShadow = true;
testProjectile.position.set(0, 20, 0);
mainScene.add(testProjectile);

// Physics body for projectile
const projectileRigidBody = new RigidBody(testProjectile, 1, 0.5, 0.8);
projectileRigidBody.setVelocity(new THREE.Vector3(10, 0, 5));
physicsEngine.addBody(projectileRigidBody);

const objects = [];

// Prefabs for sphere and box
const spherePrefab = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x0000FF, roughness: 0.8, metalness: 0.2 })
);
spherePrefab.castShadow = true;
spherePrefab.receiveShadow = true;

const boxPrefab = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xFF0000, roughness: 1.0, metalness: 0.0 })
);
boxPrefab.castShadow = true;
boxPrefab.receiveShadow = true;

// Spawn objects on key press
// window.addEventListener('keydown', (event) => {
//   switch (event.key) {
//     case 's': {
//       const sphere = new RigidBody(spherePrefab.clone(), 1, 0.8, 0.8);
//       sphere.representation.position.set(1, 15, 0);
//       physicsEngine.addBody(sphere);

//       mainScene.add(sphere.representation); // ✅ Add mesh to scene
//       objects.push(sphere);
//       break;
//     }
//     case 'b': {
//       const box = new RigidBody(boxPrefab.clone(), 1, 0.8, 0.8);
//       box.representation.position.set(0, 15, 0);
//       physicsEngine.addBody(box);

//       mainScene.add(box.representation); // ✅ Add mesh to scene
//       objects.push(box);
//       break;
//     }
//   }
// });

// mainScene.add(objects);

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
