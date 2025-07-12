import * as THREE from "three";

// Given the polytope, faces, and the minFace index,
// calculate the contact point on the Minkowski difference closest to the origin
// Then convert that to a contact point on shape1 (or shape2) using barycentric weights
export function calculateContactPoint(polytope, faces, minFace) {
    // Get the indices of the face vertices
    const i0 = faces[minFace * 3];
    const i1 = faces[minFace * 3 + 1];
    const i2 = faces[minFace * 3 + 2];

    const p0 = polytope[i0].point.clone();
    const p1 = polytope[i1].point.clone();
    const p2 = polytope[i2].point.clone();

    // Project origin onto triangle p0,p1,p2 using barycentric coordinates
    const contactOnMinkowski = closestPointOnTriangleToOrigin(p0, p1, p2);

    // Now calculate barycentric coordinates of contactOnMinkowski relative to p0, p1, p2
    const bary = barycentricCoordinates(contactOnMinkowski, p0, p1, p2);

    // Use barycentric weights to get contact points on original shapes
    // polytope vertices store supportA and supportB points from shapes

    const supportA0 = polytope[i0].supportA;
    const supportA1 = polytope[i1].supportA;
    const supportA2 = polytope[i2].supportA;

    // Contact point on shape1
    const contactPoint = new THREE.Vector3()
        .set(0, 0, 0)
        .addScaledVector(supportA0, bary.u)
        .addScaledVector(supportA1, bary.v)
        .addScaledVector(supportA2, bary.w);

    return contactPoint;
}


// Helper: Get barycentric coordinates (u,v,w) for point p in triangle abc
function barycentricCoordinates(p, a, b, c) {
    const v0 = b.clone().sub(a);
    const v1 = c.clone().sub(a);
    const v2 = p.clone().sub(a);

    const d00 = v0.dot(v0);
    const d01 = v0.dot(v1);
    const d11 = v1.dot(v1);
    const d20 = v2.dot(v0);
    const d21 = v2.dot(v1);

    const denom = d00 * d11 - d01 * d01;

    const v = (d11 * d20 - d01 * d21) / denom;
    const w = (d00 * d21 - d01 * d20) / denom;
    const u = 1.0 - v - w;

    return { u, v, w };
}

// Helper: find closest point on triangle abc to origin
function closestPointOnTriangleToOrigin(a, b, c) {
    // Using Ericson's Real-Time Collision Detection algorithm for closest point
    // Code adapted and simplified for origin (0,0,0)

    // Check vertices
    const zero = new THREE.Vector3(0,0,0);
    const ab = b.clone().sub(a);
    const ac = c.clone().sub(a);
    const ap = zero.clone().sub(a);

    const d1 = ab.dot(ap);
    const d2 = ac.dot(ap);
    if (d1 <= 0 && d2 <= 0) return a; // bary (1,0,0)

    const bp = zero.clone().sub(b);
    const d3 = ab.dot(bp);
    const d4 = ac.dot(bp);
    if (d3 >= 0 && d4 <= d3) return b; // bary (0,1,0)

    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const v = d1 / (d1 - d3);
        return a.clone().add(ab.multiplyScalar(v)); // bary (1-v,v,0)
    }

    const cp = zero.clone().sub(c);
    const d5 = ab.dot(cp);
    const d6 = ac.dot(cp);
    if (d6 >= 0 && d5 <= d6) return c; // bary (0,0,1)

    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        const w = d2 / (d2 - d6);
        return a.clone().add(ac.multiplyScalar(w)); // bary (1-w,0,w)
    }

    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
        const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
        return b.clone().add(c.clone().sub(b).multiplyScalar(w)); // bary (0,1-w,w)
    }

    // Otherwise inside face region
    const denom = 1 / (va + vb + vc);
    const v = vb * denom;
    const w = vc * denom;

    return a.clone()
        .add(ab.multiplyScalar(v))
        .add(ac.multiplyScalar(w));
}