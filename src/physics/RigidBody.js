import * as THREE from 'three';

class RigidBody {
  constructor(mesh, mass = 1, friction = 0.5, restitution = 0.8) {
    this.mesh = mesh;
    this.mass = mass;
    this.friction = friction;
    this.restitution = restitution;
    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3();
    this.force = new THREE.Vector3();
    this.torque = new THREE.Vector3();
  }

  applyForce(force) {
    this.force.add(force);
  }

  applyTorque(torque) {
    this.torque.add(torque);
  }

  setVelocity(velocity) {
    this.velocity.copy(velocity);
  }

  setAngularVelocity(angularVelocity) {
    this.angularVelocity.copy(angularVelocity);
  }

  getPosition() {
    return this.mesh.position.clone();
  }

  setPosition(position) {
    this.mesh.position.copy(position);
  }

  getRotation() {
    return this.mesh.rotation.clone();
  }

  setRotation(rotation) {
    this.mesh.rotation.copy(rotation);
  }
}

export default RigidBody; 