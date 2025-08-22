import * as THREE from 'three';

/* Global Variables */
let gravityForce = new THREE.Vector3(0, -9.81, 0);
let damping = 0.990;
let airDensity = 1.225;
let windSpeed = new THREE.Vector3(10,10,10);


/* Forces */
export function applyGravity(body) {
    body.addForce(gravityForce.clone().multiplyScalar(body.mass));
}

export function applyDamping (body) {
    body.velocity.multiplyScalar(damping);
    body.angularVelocity.multiplyScalar(damping);
}

export function applyAirDynamics(body) {
    const relVelocity = body.velocity.clone().sub(windSpeed);
    const v = relVelocity.length();
    if (v === 0) return;
    const dragMagnitude = 0.5 * airDensity * v * v * body.dragArea * body.dragCoefficient;
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
    const S = 0.5 * airDensity * body.dragArea * radius;

    // Force = S * omega × v_rel
    const magnusForce = new THREE.Vector3().crossVectors(body.angularVelocity, relVelocity).multiplyScalar(S);

    // Apply to body
    body.addForce(magnusForce);
}
