import * as THREE from "three";


export function generateBoxGeometry () {
    computeBoxGeometry(this);
}


function computeBoxGeometry (mesh) {
    const mergedGeometry = mesh.getMergedGeometry().clone();
    mergedGeometry.computeBoundingBox();
    mesh.box = mergedGeometry.boundingBox;
}


export function createBoxHelper () {
    const helper = new THREE.Box3Helper(this.box);
    this.add(helper);
}


THREE.Object3D.prototype.generateBoxGeometry = generateBoxGeometry;
THREE.Object3D.prototype.createBoxHelper = createBoxHelper;