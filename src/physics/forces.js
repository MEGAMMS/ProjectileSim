import * as THREE from 'three';
import { worldOptions } from '../objects/options';



/* Forces */
export function applyGravity(body) {
    const g = (worldOptions.G * worldOptions.M) / Math.pow(worldOptions.R + body.position.y,2);
    const gravityForce = new THREE.Vector3(0, -g, 0);
    body.addForce(gravityForce.clone().multiplyScalar(body.mass),"gravity");
}

export function applyDamping (body) {
    body.velocity.multiplyScalar(worldOptions.damping);
    body.angularVelocity.multiplyScalar(worldOptions.damping);
}

export function applyAerodynamicForces(body) {
    if (!body.faces) return;

    body.faces.forEach(face => {
        // World-space centroid and normal
        const centroidWorld = face.centroid.clone().applyMatrix4(body.matrix);
        const normalWorld = face.normal.clone().transformDirection(body.matrix);

        // Relative velocity at this point (linear + rotational)
        const r = new THREE.Vector3().subVectors(centroidWorld, body.position);
        const pointVelocity = body.velocity.clone().add(new THREE.Vector3().crossVectors(body.angularVelocity, r));
        const vRel = worldOptions.windForce.clone().sub(pointVelocity); // wind relative to point
        const speed = vRel.length();
        if (speed === 0) return;

        const vDir = vRel.clone().normalize();
        let cosTheta = normalWorld.dot(vDir);
        if (cosTheta < 0) cosTheta = 0;
        const projectedArea = face.area * cosTheta;

        // --- Drag ---
        const dragMagnitude = 0.5 * worldOptions.airDensity * speed * speed * body.dragCoefficient * projectedArea;
        const dragForce = vDir.clone().multiplyScalar(dragMagnitude);
        body.addForce(dragForce, "drag", centroidWorld);

        // --- Lift ---
        const liftDir = new THREE.Vector3().crossVectors(vDir, normalWorld).cross(vDir).normalize();
        const liftMagnitude = 0.5 * worldOptions.airDensity * speed * speed * body.liftCoefficient * projectedArea;
        const liftForce = liftDir.multiplyScalar(liftMagnitude);
        body.addForce(liftForce, "lift", centroidWorld);
    });
}

export function applyMagnusForce(body) {
    // Only apply if the body has spin and is moving
    if (!body.velocity || !body.angularVelocity) return;

    const v = body.velocity;
    const w = body.angularVelocity;
    const speed = v.length();
    const spin = w.length();
    if (speed === 0 || spin === 0) return;

    // Use body's radius if available, else default
    const r = body.radius || 0.5; // or get from shapeOptions
    const Cm = body.magnusCoefficient !== undefined ? body.magnusCoefficient : 0.2;
    const rho = worldOptions.airDensity;

    // Magnus force direction: w x v (right-hand rule)
    const magnusDir = new THREE.Vector3().crossVectors(w, v).normalize();
    // Magnitude (simplified): Cm * rho * r^3 * |w x v|
    const magnitude = Cm * rho * Math.pow(r, 3) * w.clone().cross(v).length();

    const magnusForce = magnusDir.multiplyScalar(magnitude);
    body.addForce(magnusForce, "magnus");
}
