import * as THREE from 'three';
import { mainScene } from '../render/render';
import { computeConvexPoints } from './convex';
import { createConvexHelper, createAxesHelper, visualizePoint } from '../utility/helpers';
import { monitorOptions } from '../objects/options';
import { Quaternion } from 'three';


const forceColors = {
    gravity: 0x0000ff, // blue
    drag: 0xff0000,    // red
    magnus: 0x00ff00,  // green
    wind: 0xffff00,  // yellow
};


class RigidBody {
  constructor(mesh, position , quaternion , mass = 1 , dragCoefficient = 0.5 , friction = 0.5, restitution = 0.8 , com = new THREE.Vector3()) {
    this.mesh = mesh;
    mainScene.add(mesh);

    // Physics state
    this.position = new THREE.Vector3().copy(position);     // world-space physics position
    this.quaternion = new Quaternion().copy(quaternion);       // physics orientation
    this.updateMatrix();

    // Previous state for interpolation
    this.prevPosition = this.position.clone();
    this.prevQuaternion = this.quaternion.clone();

    this.lconvex = computeConvexPoints(mesh.geometry);
    this.convex = this.lconvex.map(v => v.clone().applyMatrix4(this.matrix));
    this.lsphere = new THREE.Sphere().setFromPoints(this.lconvex);
    this.sphere = this.lsphere.clone().applyMatrix4(this.matrix);

    this.mass = mass;
    this.inverseMass = (mass !== 0.0) ? (1.0 / mass) : 0.0;
    
    this.inertiaTensor = (2 / 5) * mass;
    this.invInertiaTensor = 1 / this.inertiaTensor;

    this.com = com.clone();
    this.comWorld = new THREE.Vector3().copy(com).applyMatrix4(this.matrix);

    this.friction = friction;
    this.restitution = restitution;
    this.dragCoefficient = dragCoefficient;
    this.dragArea = 0;

    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3();
    this.forceAccum = new THREE.Vector3();
    this.torqueAccum = new THREE.Vector3();

    // Tracking Properties
    this.speed = 0;
    this.kineticEnergy = 0;
    this.flightTime = 0;
    this.distanceTraveled = 0;
    this.lastPosition = this.position.clone();
    this.contact = false;

    // Visulize Helpers
    createConvexHelper(this);
    if (mass != 0.0) createAxesHelper(this);
    this.toggleHelpers();
    this.forceArrows = {};
  }

    addForce(force, name ,point = this.comWorld) {
        if (this.mass === 0.0) return;

        // Linear
        this.forceAccum.add(force);

        // Angular
        const r = new THREE.Vector3().subVectors(point, this.position);
        const torque = new THREE.Vector3().crossVectors(r, force);
        this.torqueAccum.add(torque);

        if (monitorOptions.showForces) {
            
            if (this.forceArrows[name]) {
                const arrow = this.forceArrows[name];
                arrow.position.copy(point);
                arrow.setDirection(force.clone().normalize());
                arrow.setLength(force.length() * 0.1); // same scale factor
                return;
            }

            // Create arrow
            const arrow = new THREE.ArrowHelper(
                force.clone().normalize(),
                point,
                force.length() * 0.1,
                forceColors[name]
            );

            // Add to scene and save reference
            mainScene.add(arrow);
            this.forceArrows[name] = arrow;

        }
    }

    addImpulse(impulse , point) {
        if (this.mass === 0.0) return;

        if (point == null) point = this.comWorld;

        // Linear
        this.velocity.addScaledVector(impulse, this.inverseMass);

        // Angular
        const r = new THREE.Vector3().subVectors(point, this.position);
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

        // Save previous physics state
        this.prevPosition.copy(this.position);
        this.prevQuaternion.copy(this.quaternion);

        if (monitorOptions.showPath) visualizePoint(this.comWorld);
    
        // --- Linear ---
        const acceleration = this.forceAccum.clone().multiplyScalar(this.inverseMass);
        this.velocity.addScaledVector(acceleration, deltaTime);
        this.position.addScaledVector(this.velocity, deltaTime);
    
        // --- Angular: Apply torque to angular velocity ---
        if (this.torqueAccum.lengthSq() > 0.0) {
            const angularAcc = this.torqueAccum.clone().multiplyScalar(this.invInertiaTensor);
            this.angularVelocity.addScaledVector(angularAcc, deltaTime);
        }
    
        // --- Angular: Rotate orientation based on angular velocity ---
        if (this.angularVelocity.lengthSq() > 0.0) {
        // Quaternion derivative: q' = 0.5 * ω_quat * q
        const omegaQuat = new THREE.Quaternion(
            this.angularVelocity.x * deltaTime * 0.5,
            this.angularVelocity.y * deltaTime * 0.5,
            this.angularVelocity.z * deltaTime * 0.5,
            0
        );

        omegaQuat.multiply(this.quaternion);

        this.quaternion.x += omegaQuat.x;
        this.quaternion.y += omegaQuat.y;
        this.quaternion.z += omegaQuat.z;
        this.quaternion.w += omegaQuat.w;

        this.quaternion.normalize();   // prevent drift
    }

        // Update Tracking
        this.speed = this.velocity.length();
        this.kineticEnergy = 0.5 * this.mass * this.speed * this.speed;
        if (!this.contact) {
            this.flightTime += deltaTime;
            this.distanceTraveled += this.position.distanceTo(this.lastPosition);
            this.lastPosition.copy(this.position);
        }
        this.clearForces();
    }

    updateMatrix () {
        // Create a 4x4 transformation matrix from physics state
        this.matrix = new THREE.Matrix4();
        this.matrix.compose(
            this.position,    // THREE.Vector3 position
            this.quaternion,  // THREE.Quaternion rotation
            new THREE.Vector3(1, 1, 1) // scale (use 1 if no scaling)
        );
    }

    toggleHelpers() {
    if (this.convexHelper) this.convexHelper.visible = monitorOptions.showHelpers;
    if (this.axisHelper) this.axisHelper.visible = monitorOptions.showHelpers;
  }
}

export default RigidBody; 