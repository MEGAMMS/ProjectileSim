import * as THREE from 'three';
import { followCamera, mainScene , transform } from '../render/render.js';
import RigidBody from '../physics/rigidBody.js';
import physicsEngine from '../physics/physicsEngine.js';
import {createShape} from './projectiles.js';
import { shapeOptions , dynamicsOptions , currentObjects } from './options.js';
import { buildStatsFolders } from "../utility/gui.js"


const projectileFactory = new THREE.Object3D();
projectileFactory.position.set(0,8,0);

// Arrow (cylinder shaft + cone head)
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

// Orientation
let dir = new THREE.Vector3(0, 1, 0);
arrow.quaternion.setFromUnitVectors(
  dir, // original axis
  dir.normalize() // target direction
);

projectileFactory.add(arrow);


// CENTER OF MASS GIZMO
const comMarker = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
projectileFactory.add(comMarker);

transform.attach(comMarker);

// Sync with physics options
transform.addEventListener("change", () => {
  comMarker.updateMatrixWorld(true);
  const position = comMarker.position.clone().applyMatrix4(comMarker.matrixWorld).sub(projectileFactory.position);
  dynamicsOptions.centerOfMass.copy(position);
});


// Projectiles
let currentShape = createShape(shapeOptions.type, shapeOptions);
projectileFactory.add(currentShape);
mainScene.add(projectileFactory);
const initialBody = createBody(currentShape.clone());
mainScene.remove(initialBody.mesh);


export function updateShape() {
    projectileFactory.remove(currentShape);
    currentShape.geometry.dispose();
    currentShape.material.dispose();
    currentShape = createShape(shapeOptions.type, shapeOptions);
    shaftMaterial.color.set(shapeOptions.color);
    headMaterial.color.set(shapeOptions.color);
    projectileFactory.add(currentShape);
}


function createBody (projectile) {
  const projectileBody = new RigidBody(
    projectile,
    projectileFactory.position,
    projectileFactory.quaternion,
    dynamicsOptions.mass ,
    dynamicsOptions.dragCoefficient,
    dynamicsOptions.liftCoefficient,
    dynamicsOptions.friction,
    dynamicsOptions.restitution,
    dynamicsOptions.centerOfMass
  );
  buildStatsFolders(projectileBody);
  return projectileBody;
}

/*
export let activeProjectile = null; // store the last fired projectile
export function getActiveProjectile() {
  return activeProjectile;
}
*/
function fireProjectile() {
  const projectile = currentShape.clone();
  projectile.material = currentShape.material.clone();
  projectile.material.transparent = false;
  projectile.castShadow = true;
  projectile.receiveShadow = true;
  const projectileBody = createBody(projectile);
  const impulse = dir.clone().multiplyScalar(dynamicsOptions.initialVelocity);
  projectileBody.velocity.copy(impulse);
  physicsEngine.addBody(projectileBody);

  // === Attach follow camera ===
  currentObjects.activeCamera = followCamera;
  currentObjects.activeProjectile = projectileBody;
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
  dir.set(0, 1, 0); // forward vector in local space
  dir.applyQuaternion(projectileFactory.quaternion); // rotate with factory
});