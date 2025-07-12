import * as THREE from "three";
import { getSupport } from "./Support";
import { calculateContactPoint } from "./BarycentricCoordinates";


///////////////////////////////////
// EPA algorithm
///////////////////////////////////
const MAX_ITERATIONS = 32;
const TOLERANCE = Number.EPSILON;

export function EPA(polytope, shape1, shape2) {
    const faces = [
        0, 1, 2,
        0, 3, 1,
        0, 2, 3,
        1, 3, 2
    ];

	let {normals, minFace} = getFaceNormals(polytope, faces);

    let minNormal = new THREE.Vector3();
    let minDistance = Infinity;

    let iterations = 0;

    while (minDistance === Infinity && iterations++ < MAX_ITERATIONS) {
        minNormal.copy(normals[minFace].normal);
        minDistance = normals[minFace].distance;
        
        const support = getSupport(shape1, shape2, minNormal);
        const sDistance = minNormal.dot(support.point.clone());
        
        if (Math.abs(sDistance - minDistance) > 0.001) {
            minDistance = Infinity;

            const uniqueEdges = [];

            for (let i = 0; i < normals.length; i++) {
                const { normal } = normals[i];

                // Face is visible if the support point is in the same direction as the normal
                if ( normal.dot(support.point) > normal.dot(polytope[faces[i*3]].point)) {
                    const f = i * 3;

                    // Add edges (in clockwise order) and check for uniqueness
                    addIfUniqueEdge(uniqueEdges, faces, f,     f + 1);
                    addIfUniqueEdge(uniqueEdges, faces, f + 1, f + 2);
                    addIfUniqueEdge(uniqueEdges, faces, f + 2, f    );

                    // Remove face by replacing with last 3 indices and popping
                    faces[f + 2] = faces[faces.length - 1]; faces.pop();
                    faces[f + 1] = faces[faces.length - 1]; faces.pop();
                    faces[f    ] = faces[faces.length - 1]; faces.pop();

                    // Remove corresponding normal
                    normals[i] = normals[normals.length - 1];
                    normals.pop();

                    i--; // re-check the swapped-in normal
                }
            }

            const newFaces = [];

            // Add new triangles (edges + support point)
            for (const [i1, i2] of uniqueEdges) {
                newFaces.push(i1, i2, polytope.length); // form new triangle
            }

            // Add the new support point to the polytope
            polytope.push(support);

            // Recalculate normals and find new closest face
            const { normals: newNormals, minFace: newMinFace } = getFaceNormals(polytope, newFaces);

            if (newNormals.length === 0 || newMinFace < 0 || newMinFace >= newNormals.length) {
                // Handle the error gracefully - e.g.:
                // You can skip merging or break the loop, or try some fallback.
                console.warn("EPA: No valid new face normals found");
                return null; // Or handle otherwise
            }

            let oldMinDistance = Infinity;
            for (let i = 0; i < normals.length; i++) {
            if (normals[i].distance < oldMinDistance) {
                oldMinDistance = normals[i].distance;
                minFace = i;
            }
            }

            if (newNormals[newMinFace].distance < oldMinDistance) {
            minFace = newMinFace + normals.length;
            }

            // Merge new data
            faces.push(...newFaces);
            normals.push(...newNormals);
        }
    }

    const contactPoint = calculateContactPoint(polytope, faces, minFace);

    const collisionPoints = {
        contactPoint,
        contactNormal: minNormal.clone(), // THREE.Vector3
        penetrationDepth: minDistance + 0.001,
        hasCollision: true,
    };
        
    return collisionPoints;

}


function getFaceNormals(polytope, faces) {
    const normals = [];
    let minTriangle = 0;
    let minDistance = Infinity;

    for (let i = 0; i < faces.length; i += 3) {
        // Check valid indices
        if (faces[i] === undefined || faces[i + 1] === undefined || faces[i + 2] === undefined) continue;
        if (!polytope[faces[i]] || !polytope[faces[i + 1]] || !polytope[faces[i + 2]]) continue;

        const a = polytope[faces[i]].point.clone();
        const b = polytope[faces[i + 1]].point.clone();
        const c = polytope[faces[i + 2]].point.clone();

        const ab = new THREE.Vector3().subVectors(b, a);
        const ac = new THREE.Vector3().subVectors(c, a);
        const normal = new THREE.Vector3().crossVectors(ab, ac);
        const area = normal.lengthSq();
        if (area < TOLERANCE) continue; // Skip invalid face

        normal.normalize();

        let distance = normal.dot(a);

        if (distance < 0) {
        normal.negate();
        distance = -distance;
        }

        normals.push({ normal, distance });

        if (distance < minDistance) {
        minDistance = distance;
        minTriangle = i / 3;
        }
    }

    return { normals, minFace: minTriangle };
}


function addIfUniqueEdge(edges, faces, a, b) {
    const edge = [faces[a], faces[b]];
    const reverseEdge = [faces[b], faces[a]];

    // Search for reverse edge
    const reverseIndex = edges.findIndex(
        ([e1, e2]) => e1 === reverseEdge[0] && e2 === reverseEdge[1]
    );

    if (reverseIndex !== -1) {
        edges.splice(reverseIndex, 1); // remove shared edge
    } else {
        edges.push(edge); // add unique edge
    }
}