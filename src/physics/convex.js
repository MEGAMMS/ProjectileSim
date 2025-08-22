import * as THREE from "three";
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import convexHull from 'monotone-convex-hull-2d';


function getPointsBuffer (geometry) {
    const points = [];
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(posAttr, i));
    }
    return points;
}

export function computeConvexPoints (geometry) {
    const geometryPoints = getPointsBuffer(geometry);
    const convex = new ConvexGeometry(geometryPoints);
    return getPointsBuffer(convex);
}



function polygonArea(polygonPoints) {
    let area = 0;
    const n = polygonPoints.length;

    for (let i = 0; i < n; i++) {
        const [x0, y0] = polygonPoints[i];
        const [x1, y1] = polygonPoints[(i + 1) % n];
        area += x0 * y1 - x1 * y0;
    }

    return Math.abs(area / 2);
}

export function computeProjectedConvexArea (convex, airflowDirection) {
    const airflow = airflowDirection.normalize();

    // Choose two orthogonal vectors in the plane perpendicular to airflow
    const basisX = new THREE.Vector3();
    const basisY = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    if (Math.abs(airflow.dot(up)) > 0.99) {
        up.set(1, 0, 0); // handle parallel case
    }

    basisX.crossVectors(up, airflow).normalize();
    basisY.crossVectors(airflow, basisX).normalize();

    const points2D = [];
    const v = new THREE.Vector3();

    for (let i = 0; i < convex.length; i++) {
        v.copy(convex[i]);
        // Project to 2D coordinates in the plane
        const x = v.dot(basisX);
        const y = v.dot(basisY);
        points2D.push([x, y]);
    }

    // This returns an array of ordered indices
    const hullIndices = convexHull(points2D);

    // Use indices to get ordered polygon points
    const polygon = hullIndices.map(i => points2D[i]);

    const area = polygonArea(polygon);
    return area;
}