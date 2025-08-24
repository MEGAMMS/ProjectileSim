import * as THREE from 'three';

// Global physics world options
export const worldOptions = {
  damping: 0.99,
  gravityY: -9.81,
  airDensity: 1.225,
  windX: 0,
  windY: 0,
  windZ: 0,
};
const gravityForce = new THREE.Vector3(0, -9.81, 0);
export const updateGravity = () => gravityForce.set(0,worldOptions.gravityY,0);
const windSpeed = new THREE.Vector3(0,0,0);
export const updateWind = () => windSpeed.set(worldOptions.windX,worldOptions.windY,worldOptions.windZ);


/* Forces */
export function applyGravity(body) {
    body.addForce(gravityForce.clone().multiplyScalar(body.mass));
}

export function applyDamping (body) {
    body.velocity.multiplyScalar(worldOptions.damping);
    body.angularVelocity.multiplyScalar(worldOptions.damping);
}

export function applyAirDynamics(body) {
    const relVelocity = body.velocity.clone().sub(windSpeed);
    const v = relVelocity.length();
    if (v === 0) return;
    const dragMagnitude = 0.5 * worldOptions.airDensity * v * v * body.dragArea * body.dragCoefficient;
    const dragDirection = relVelocity.clone().normalize().negate();
    body.addForce(dragDirection.multiplyScalar(dragMagnitude));
}

export function applyMagnusForce(body) {
    // relative velocity (body w.r.t air/wind)
    const relVelocity = body.velocity.clone().sub(windSpeed);
    if (relVelocity.length() === 0 || body.angularVelocity.length() === 0) return;

    // characteristic radius: approximate as half bounding sphere diameter
    const radius = body.sphere.radius;

    // Magnus coefficient
    const S = 0.5 * worldOptions.airDensity * body.dragArea * radius;

    // Force = S * omega × v_rel
    const magnusForce = new THREE.Vector3().crossVectors(body.angularVelocity, relVelocity).multiplyScalar(S);

    // Apply to body
    body.addForce(magnusForce);
}
