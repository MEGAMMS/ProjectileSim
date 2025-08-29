import * as THREE from 'three';
import { worldOptions } from '../objects/options';


const gravityForce = new THREE.Vector3(0, -9.81, 0);
export const updateGravity = () => gravityForce.set(0,worldOptions.gravityY,0);
const windForce = new THREE.Vector3(0,0,0);
export const updateWind = () => windForce.set(worldOptions.windX,worldOptions.windY,worldOptions.windZ);


/* Forces */
export function applyGravity(body) {
    body.addForce(gravityForce.clone().multiplyScalar(body.mass),"gravity");
}

export function applyDamping (body) {
    body.velocity.multiplyScalar(worldOptions.damping);
    body.angularVelocity.multiplyScalar(worldOptions.damping);
}

export function applyAirDynamics(body) {
    const v = body.velocity.length();
    if (v === 0) return;
    const dragMagnitude = 0.5 * worldOptions.airDensity * v * v * body.dragArea * body.dragCoefficient;
    const dragDirection = body.velocity.clone().normalize().negate();
    body.addForce(dragDirection.multiplyScalar(dragMagnitude),"drag");
}

export function applyWind(body) {
    body.addForce(windForce.clone(), "wind");
}

export function applyMagnusForce(body) {
    if (body.velocity.length() === 0 || body.angularVelocity.length() === 0) return;

    // characteristic radius: approximate as half bounding sphere diameter
    const radius = body.sphere.radius;

    // Magnus coefficient
    const S = 0.5 * worldOptions.airDensity * body.dragArea * radius;

    // Force = S * omega × v_rel
    const magnusForce = new THREE.Vector3().crossVectors(body.angularVelocity, body.velocity).multiplyScalar(S);

    // Apply to body
    body.addForce(magnusForce,"magnus");
}
