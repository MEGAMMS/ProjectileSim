import * as THREE from "three";


export function resolveCollision(A, B, contact) {
    const normal = contact.contactNormal.clone().normalize();
    const contactPoint = contact.contactPoint.clone();

    // Relative positions from centers of mass
    const rA = contactPoint.clone().sub(A.representation.position);
    const rB = contactPoint.clone().sub(B.representation.position);

    // Velocities at contact point (linear + angular)
    const vA = A.velocity.clone().add(new THREE.Vector3().crossVectors(A.angularVelocity, rA));
    const vB = B.velocity.clone().add(new THREE.Vector3().crossVectors(B.angularVelocity, rB));

    const relativeVelocity = vB.clone().sub(vA);
    const contactVel = relativeVelocity.dot(normal);

    if (contactVel > 0) return; // Objects are separating

    const restitution = Math.min(A.restitution, B.restitution);
    const friction = Math.sqrt(A.friction * B.friction); // Combine frictions

    // Estimate rotational effect on impulse denominator
    const angularFactor = (r, mass) => {
        if (mass === 0.0) return 0;
        const radiusSq = r.lengthSq();
        return radiusSq !== 0 ? radiusSq / ((2 / 5) * mass) : 0;
    };

    const denom = A.inverseMass + B.inverseMass + angularFactor(rA, A.mass) + angularFactor(rB, B.mass);
    const j = -(1 + restitution) * contactVel / denom;

    const normalImpulse = normal.clone().multiplyScalar(j);

    // Apply normal impulse
    if (A.mass !== 0.0) {
        A.addImpulse(normalImpulse.clone().negate());
        A.addTorqueImpulse(normalImpulse.clone().negate(), contactPoint);
    }

    if (B.mass !== 0.0) {
        B.addImpulse(normalImpulse);
        B.addTorqueImpulse(normalImpulse, contactPoint);
    }

    // ---- Friction ----
    // Recalculate relative velocity after normal impulse
    const vA_post = A.velocity.clone().add(new THREE.Vector3().crossVectors(A.angularVelocity, rA));
    const vB_post = B.velocity.clone().add(new THREE.Vector3().crossVectors(B.angularVelocity, rB));
    const relVelPost = vB_post.clone().sub(vA_post);

    // Tangent = component perpendicular to normal
    const tangent = relVelPost.clone().sub(normal.clone().multiplyScalar(relVelPost.dot(normal)));
    if (tangent.lengthSq() > 0.0001) {
        tangent.normalize();

        // Calculate friction impulse magnitude
        const jt = -relVelPost.dot(tangent) / denom;

        // Clamp to Coulomb's law
        const maxFriction = j * friction;
        const frictionImpulseMag = Math.max(-maxFriction, Math.min(jt, maxFriction));

        const frictionImpulse = tangent.clone().multiplyScalar(frictionImpulseMag);

        if (A.mass !== 0.0) {
            A.addImpulse(frictionImpulse.clone().negate());
            A.addTorqueImpulse(frictionImpulse.clone().negate(), contactPoint);
        }

        if (B.mass !== 0.0) {
            B.addImpulse(frictionImpulse);
            B.addTorqueImpulse(frictionImpulse, contactPoint);
        }
    }
}



export function applyPositionalCorrection(A, B, contact) {
    const totalInvMass = A.inverseMass + B.inverseMass;
    if (totalInvMass === 0) return;

    // Industry-standard parameters
    const allowedPenetration = 0.001; // tolerance slop
    const correctionPercent = 0.2;   // position correction

    // Only correct if depth exceeds slop
    const depth = contact.penetrationDepth - allowedPenetration;
    if (depth <= 0) return;

    const correctionMagnitude = (depth / totalInvMass) * correctionPercent;
    const correction = contact.contactNormal.clone().multiplyScalar(correctionMagnitude);

    if (A.mass !== 0.0) A.representation.position.addScaledVector(correction, -A.inverseMass);
    if (B.mass !== 0.0) B.representation.position.addScaledVector(correction, B.inverseMass);
}