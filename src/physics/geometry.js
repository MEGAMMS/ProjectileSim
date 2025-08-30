import * as THREE from "three";


export function getPointsBuffer (geometry) {
    const points = [];
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(posAttr, i));
    }
    return points;
}

export function getFaceData(mesh) {
    const geom = mesh.geometry;
    geom.computeVertexNormals(); // ensure normals exist

    const positionAttr = geom.attributes.position;
    const indexAttr = geom.index;

    const faces = [];

    if (indexAttr) {
        // Indexed geometry
        for (let i = 0; i < indexAttr.count; i += 3) {
            const a = indexAttr.getX(i);
            const b = indexAttr.getX(i + 1);
            const c = indexAttr.getX(i + 2);

            const vA = new THREE.Vector3().fromBufferAttribute(positionAttr, a);
            const vB = new THREE.Vector3().fromBufferAttribute(positionAttr, b);
            const vC = new THREE.Vector3().fromBufferAttribute(positionAttr, c);

            const centroid = new THREE.Vector3()
                .add(vA)
                .add(vB)
                .add(vC)
                .divideScalar(3);

            const normal = new THREE.Vector3()
                .subVectors(vB, vA)
                .cross(new THREE.Vector3().subVectors(vC, vA))
                .normalize();

            // approximate area of triangle
            const area = new THREE.Vector3().subVectors(vB, vA).cross(new THREE.Vector3().subVectors(vC, vA)).length() * 0.5;

            faces.push({ centroid, normal, area });
        }
    } else {
        // Non-indexed geometry
        for (let i = 0; i < positionAttr.count; i += 3) {
            const vA = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
            const vB = new THREE.Vector3().fromBufferAttribute(positionAttr, i + 1);
            const vC = new THREE.Vector3().fromBufferAttribute(positionAttr, i + 2);

            const centroid = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);

            const normal = new THREE.Vector3()
                .subVectors(vB, vA)
                .cross(new THREE.Vector3().subVectors(vC, vA))
                .normalize();

            const area = new THREE.Vector3().subVectors(vB, vA).cross(new THREE.Vector3().subVectors(vC, vA)).length() * 0.5;

            faces.push({ centroid, normal, area });
        }
    }

    return faces;
}