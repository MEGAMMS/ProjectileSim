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

export function applyAerodynamicForces(body) {
    if (!body.faces) return;

    const airDensity = worldOptions.airDensity;
    const liftCoefficient = body.liftCoefficient || 0.2;

    body.faces.forEach(face => {
        // World-space centroid and normal
        const centroidWorld = face.centroid.clone().applyMatrix4(body.matrix);
        const normalWorld = face.normal.clone().transformDirection(body.matrix);

        // Relative velocity at this point (linear + rotational)
        const r = new THREE.Vector3().subVectors(centroidWorld, body.position);
        const pointVelocity = body.velocity.clone().add(new THREE.Vector3().crossVectors(body.angularVelocity, r));
        const vRel = windForce.clone().sub(pointVelocity); // wind relative to point
        const speed = vRel.length();
        if (speed === 0) return;

        const vDir = vRel.clone().normalize();

        // --- Drag ---
        let cosTheta = normalWorld.dot(vDir);
        if (cosTheta < 0) cosTheta = 0;
        const projectedArea = face.area * cosTheta;
        const dragMagnitude = 0.5 * airDensity * speed * speed * body.dragCoefficient * projectedArea;
        const dragForce = vDir.clone().multiplyScalar(dragMagnitude);
        body.addForce(dragForce, "drag", centroidWorld);

        // --- Lift ---
        const liftDir = new THREE.Vector3().crossVectors(vDir, normalWorld).cross(vDir).normalize();
        const liftMagnitude = 0.5 * airDensity * speed * speed * liftCoefficient * projectedArea;
        const liftForce = liftDir.multiplyScalar(liftMagnitude);
        body.addForce(liftForce, "lift", centroidWorld);
    });
}
