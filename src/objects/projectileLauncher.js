import * as THREE from 'three';
import { mainScene } from '../render/scene.js';
import {createShape} from './projectiles.js';
import physicsEngine from '../physics/physicsEngine.js';
import RigidBody from '../physics/rigidBody.js';



const projectileFactory = new THREE.Object3D();
projectileFactory.position.set(0,8,0);


// Default shape options
export const shapeOptions = {
    type: "Box",
    width: 1,
    height: 1,
    depth: 1,
    radius: 1,
    radiusTop: 1,
    radiusBottom: 1,
    length: 1,
    color: 0xff0000,
};


// Projectile dynamics
export const dynamicsOptions = {
  mass: 1,
  dragCoefficient: 0.5,
  friction: 0.5,
  restitution: 0.8,
};

let currentShape = createShape(shapeOptions.type, shapeOptions);
projectileFactory.add(currentShape);
mainScene.add(projectileFactory);

export function updateShape() {
    projectileFactory.remove(currentShape);
    currentShape.geometry.dispose();
    currentShape.material.dispose();
    currentShape = createShape(shapeOptions.type, shapeOptions);
    projectileFactory.add(currentShape);
}



let dir = new THREE.Vector3(0, 1, 0);

const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0).normalize(), 
    new THREE.Vector3(0, 0, 0), 
    5, 0xff0000, 1, 0.5);
projectileFactory.add(arrowHelper);


function fireProjectile() {
  const projectile = currentShape.clone();
  projectile.material = currentShape.material.clone();
  projectile.material.transparent = false;
  projectile.castShadow = true;
  projectile.receiveShadow = true;

  const projectileBody = new RigidBody(projectile, dynamicsOptions.mass , dynamicsOptions.dragCoefficient, dynamicsOptions.friction, dynamicsOptions.restitution);
  projectile.position.copy(projectileFactory.position);
  projectile.rotation.copy(projectileFactory.rotation);
  const impulse = dir.clone().multiplyScalar(40);
  projectileBody.velocity.copy(impulse);
  physicsEngine.addBody(projectileBody);
}




// Rotation handling
window.addEventListener("keydown", (event) => {
  switch(event.key) {
    case "ArrowLeft":
      projectileFactory.rotation.y += 0.1; // rotate left
      break;
    case "ArrowRight":
      projectileFactory.rotation.y -= 0.1; // rotate right
      break;
    case "ArrowUp":
      projectileFactory.rotation.z -= 0.1; // pitch up
      break;
    case "ArrowDown":
      projectileFactory.rotation.z += 0.1; // pitch down
      break;
    case " ": // Space = fire projectile
      fireProjectile();
      break;
  }

  // Update arrow direction based on factory rotation
  dir = new THREE.Vector3(0, 1, 0); // forward vector in local space
  dir.applyQuaternion(projectileFactory.quaternion); // rotate with factory
});