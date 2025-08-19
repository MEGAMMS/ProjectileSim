import * as THREE from "three";
import {
	computeBoundsTree, disposeBoundsTree,
	computeBatchedBoundsTree, disposeBatchedBoundsTree, acceleratedRaycast,
	MeshBVH, MeshBVHHelper, SAH
} from 'three-mesh-bvh';
import  "../../Utility";
import { scene } from "../../../renderer/Initialize";


// Add the extension functions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

THREE.BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree;
THREE.BatchedMesh.prototype.disposeBoundsTree = disposeBatchedBoundsTree;
THREE.BatchedMesh.prototype.raycast = acceleratedRaycast;


export function generateBVHGeometry () {
    if (!this.bvh) computeBVHGeometry(this);
}


function computeBVHGeometry (mesh) {
    const mergedGeometry = mesh.getMergedGeometry();
    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry, {
        strategy: SAH,
        maxLeafTris: 1,
    });
    mesh.bvh = mergedGeometry;
}


export function createBVHHelper () {
    const helperMesh = new THREE.Mesh(
        this.bvh,
        new THREE.MeshBasicMaterial({visible: false})
    );
    this.add(helperMesh);

    const helper = new MeshBVHHelper(helperMesh,10);
    helper.children[0].material.color.set(0xff0000);
    helper.children[0].material.transparent = true
    scene.add(helper);
}


THREE.Object3D.prototype.generateBVHGeometry = generateBVHGeometry;
THREE.Object3D.prototype.createBVHHelper = createBVHHelper;