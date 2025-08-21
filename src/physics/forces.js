import * as THREE from 'three';

let gravityForce = new THREE.Vector3(0, -9.81, 0);
let damping = 0.990;


export function applyGravity (body) {
    body.addForce(gravityForce)
}


export function applyDamping (body) {
    body.velocity.multiplyScalar(damping);
    body.angularVelocity.multiplyScalar(damping);
}