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
    width: 0.5,
    height: 0.5,
    depth: 0.5,
    radius: 0.5,
    radiusTop: 0.5,
    radiusBottom: 0.5,
    length: 0.5,
    color: 0xff0000,
};


// Projectile dynamics
export const dynamicsOptions = {
  initialVelocity: 30,
  mass: 1,
  dragCoefficient: 0.5,
  friction: 0.5,
  restitution: 0.8,
};


export const monitorOptions = {
  showForces: false,
  showPath: false,
  showHelpers: false
};

let currentShape = createShape(shapeOptions.type, shapeOptions);
projectileFactory.add(currentShape);
mainScene.add(projectileFactory);

export function updateShape() {
    projectileFactory.remove(currentShape);
    currentShape.geometry.dispose();
    currentShape.material.dispose();
    currentShape = createShape(shapeOptions.type, shapeOptions);
    shaftMaterial.color.set(shapeOptions.color);
    headMaterial.color.set(shapeOptions.color);
    projectileFactory.add(currentShape);
}



let dir = new THREE.Vector3(0, 1, 0);

// Modern arrow (cylinder shaft + cone head)
const arrow = new THREE.Group();

// Shaft
const shaftGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1, 16);
const shaftMaterial = new THREE.MeshStandardMaterial({ color: shapeOptions.color, metalness: 0.3, roughness: 0.4 ,transparent: true , opacity: 0.8});
const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
shaft.position.y = 0.75; // move up so base sits at origin
arrow.add(shaft);

// Head
const headGeometry = new THREE.ConeGeometry(0.1, 0.6, 16);
const headMaterial = new THREE.MeshStandardMaterial({ color: shapeOptions.color, metalness: 0.3, roughness: 0.4 ,transparent: true , opacity: 0.8});
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 1.5; // top of shaft
arrow.add(head);

// Orientation (default points up like your old ArrowHelper)
arrow.quaternion.setFromUnitVectors(
  new THREE.Vector3(0, 1, 0), // original axis
  new THREE.Vector3(0, 1, 0).normalize() // target direction
);

projectileFactory.add(arrow);


export let currentProjectile = null;
function fireProjectile() {
  const projectile = currentShape.clone();
  projectile.material = currentShape.material.clone();
  projectile.material.transparent = false;
  projectile.castShadow = true;
  projectile.receiveShadow = true;

  const projectileBody = new RigidBody(projectile, dynamicsOptions.mass , dynamicsOptions.dragCoefficient, dynamicsOptions.friction, dynamicsOptions.restitution);
  projectile.position.copy(projectileFactory.position);
  projectile.rotation.copy(projectileFactory.rotation);
  const impulse = dir.clone().multiplyScalar(dynamicsOptions.initialVelocity);
  projectileBody.velocity.copy(impulse);
  physicsEngine.addBody(projectileBody);
  currentProjectile = projectileBody;
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