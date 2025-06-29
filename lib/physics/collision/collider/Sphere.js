import * as THREE from "three";


export function generateSphereGeometry () {
    if (!this.sphere) computeSphereGeometry(this);
}


function computeSphereGeometry (mesh) {
    const mergedGeometry = mesh.getMergedGeometry();
    mergedGeometry.computeBoundingSphere();
    mesh.sphere = mergedGeometry.boundingSphere;
}


export function createSphereHelper () {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(this.sphere.radius),
        new THREE.MeshBasicMaterial({wireframe: true})
    );
    this.add(mesh);
}


THREE.Object3D.prototype.generateSphereGeometry = generateSphereGeometry;
THREE.Object3D.prototype.createSphereHelper = createSphereHelper;