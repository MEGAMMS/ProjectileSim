import * as THREE from 'three';
import physicsEngine from '../physics/physicsEngine.js';
import RigidBody from '../physics/rigidBody.js';


// Prefabs for sphere and box
const spherePrefab = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x0000FF, roughness: 0.8, metalness: 0.2 })
);
spherePrefab.castShadow = true;
spherePrefab.receiveShadow = true;

const boxPrefab = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xFF0000, roughness: 0.8, metalness: 0.2 })
  
);
boxPrefab.castShadow = true;
boxPrefab.receiveShadow = true;

// Spawn objects on key press
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 's': {
      const sphere = new RigidBody(spherePrefab.clone(), 1, 0.8, 0.8);
      sphere.mesh.position.set(1, 15, 0);
      physicsEngine.addBody(sphere);
      projectiles.push(sphere);
      break;
    }
    case 'b': {
      const box = new RigidBody(boxPrefab.clone(), 10, 0.8, 0.8);
      box.mesh.position.set(0, 15, 0);
      physicsEngine.addBody(box);
      projectiles.push(box);
      break;
    }
  }
});


// Shape factory
export function createShape(type, props) {
  let geometry;

  switch(type) {
    case "Box":
      geometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
      break;
    case "Sphere":
      geometry = new THREE.SphereGeometry(props.radius, 32, 32);
      break;
    case "Cylinder":
      geometry = new THREE.CylinderGeometry(props.radiusTop, props.radiusBottom, props.height, 32);
      break;
    case "Capsule":
      geometry = new THREE.CapsuleGeometry(props.radius, props.length, 8, 16);
      break;
    default:
      geometry = new THREE.BoxGeometry(1,1,1);
  }

  const material = new THREE.MeshStandardMaterial({ color: props.color || 0x00ff00 , transparent: true , opacity: 0.8 });
  return new THREE.Mesh(geometry, material);
}