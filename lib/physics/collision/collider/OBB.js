import * as THREE from "three";
import { OBB } from 'three/addons/math/OBB.js';


export function generateBoxGeometry () {
    if (!this.box) computeBoxGeometry(this);
}


function computeBoxGeometry (mesh) {
    const mergedGeometry = mesh.getMergedGeometry();
    mergedGeometry.computeBoundingBox();
    const obb = new OBB().fromBox3(mergedGeometry.boundingBox);
    mesh.box = obb;
}


export function createBoxHelper () {
    const min = new THREE.Vector3().copy(this.box.halfSize).multiplyScalar(-1);
    const max = new THREE.Vector3().copy(this.box.halfSize);
    const box = new THREE.Box3(min, max);
    const helper = new THREE.Box3Helper(box);
    this.add(helper);
}


THREE.Object3D.prototype.generateBoxGeometry = generateBoxGeometry;
THREE.Object3D.prototype.createBoxHelper = createBoxHelper;