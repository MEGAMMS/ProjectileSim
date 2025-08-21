import * as THREE from "three";
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';


export function computeConvexPoints (geometry) {
    const geometryPoints = getPointsBuffer(geometry);
    const convex = new ConvexGeometry(geometryPoints);
    return getPointsBuffer(convex);
}


export function getPointsBuffer (geometry) {
    const points = [];
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(posAttr, i));
    }
    return points;
}