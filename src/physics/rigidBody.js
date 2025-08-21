import * as THREE from 'three';
import { mainScene } from '../render/scene';
import { computeConvexPoints } from './convex';
import { createConvexHelper, visualizePoint } from '../utility/helpers';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';


class RigidBody {
  constructor(mesh, mass = 1, friction = 0.5, restitution = 0.8 , com = new THREE.Vector3()) {
    mesh.updateMatrixWorld(true);
    this.mesh = mesh;
    mainScene.add(mesh);

    this.lconvex = computeConvexPoints(mesh.geometry);
    this.convex = this.lconvex.map(v => v.clone().applyMatrix4(mesh.matrixWorld));
    this.sphere = new THREE.Sphere().setFromPoints(this.convex);

    // Visulize Collider
    //mesh.add(createConvexHelper(new ConvexGeometry(this.convex)));

    this.mass = mass;
    this.inverseMass = (mass !== 0.0) ? (1.0 / mass) : 0.0;
    
    this.inertiaTensor = (2 / 5) * mass;
    this.invInertiaTensor = 1 / this.inertiaTensor;

    this.com = com;
    this.comWorld = new THREE.Vector3().copy(com).applyMatrix4(mesh.matrixWorld);

    this.friction = friction;
    this.restitution = restitution;
    this.dragArea = 0;

    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3();
    this.forceAccum = new THREE.Vector3();
    this.torqueAccum = new THREE.Vector3();
  }

    addForce(force,point) {
        if (this.mass === 0.0) return;

        if (point == null) point = this.comWorld;

        // Linear
        this.forceAccum.add(force);

        // Angular
        const r = new THREE.Vector3().subVectors(point, this.mesh.position);
        const torque = new THREE.Vector3().crossVectors(r, force);
        this.torqueAccum.add(torque);
    }

    addImpulse(impulse , point) {
        if (this.mass === 0.0) return;

        if (point == null) point = this.comWorld;

        // Linear
        this.velocity.addScaledVector(impulse, this.inverseMass);

        // Angular
        const r = new THREE.Vector3().subVectors(point, this.mesh.position);
        const angularImpulse = new THREE.Vector3().crossVectors(r, impulse);
        const angularAcc = angularImpulse.clone().multiplyScalar(this.invInertiaTensor);
        this.angularVelocity.add(angularAcc);
    }

    clearForces() {
        this.forceAccum.set(0, 0, 0);
        this.torqueAccum.set(0, 0, 0);
    }

    integrate(deltaTime) {
        if (this.mass === 0.0 || deltaTime <= 0.0) return;

        this.comWorld = this.comWorld.copy(this.com).applyMatrix4(this.mesh.matrixWorld);
        //visualizePoint(this.comWorld);
    
        // --- Linear ---
        const acceleration = this.forceAccum.clone().multiplyScalar(this.inverseMass);
        this.velocity.addScaledVector(acceleration, deltaTime);
        this.mesh.position.addScaledVector(this.velocity, deltaTime);
    
        // --- Angular: Apply torque to angular velocity ---
        if (this.torqueAccum.lengthSq() > 0.0) {
            const angularAcc = this.torqueAccum.clone().multiplyScalar(this.invInertiaTensor);
            this.angularVelocity.addScaledVector(angularAcc, deltaTime);
        }
    
        // --- Angular: Rotate orientation based on angular velocity ---
        if (this.angularVelocity.lengthSq() > 0.0) {
            const orientation = this.mesh.quaternion;
            const spin = new THREE.Quaternion(
                this.angularVelocity.x * 0.5 * deltaTime,
                this.angularVelocity.y * 0.5 * deltaTime,
                this.angularVelocity.z * 0.5 * deltaTime,
                0
            );
            spin.multiply(orientation);
            orientation.x += spin.x;
            orientation.y += spin.y;
            orientation.z += spin.z;
            orientation.w += spin.w;
            orientation.normalize();
        }
    
        this.clearForces();
    }
}

export default RigidBody; 