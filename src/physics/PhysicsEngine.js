import * as THREE from 'three';

class PhysicsEngine {
  constructor() {
    this.rigidBodies = [];
    this.gravity = new THREE.Vector3(0, -9.81, 0);
    this.timeStep = 1 / 60;
  }

  addBody(rigidBody) {
    this.rigidBodies.push(rigidBody);
  }

  removeBody(rigidBody) {
    const bodyIndex = this.rigidBodies.indexOf(rigidBody);
    if (bodyIndex > -1) {
      this.rigidBodies.splice(bodyIndex, 1);
    }
  }

  update(deltaTime) {
    // Update physics for all dynamic bodies
    for (const rigidBody of this.rigidBodies) {
      if (rigidBody.mass > 0) {
        // Apply gravity
        rigidBody.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));
        
        // Update position
        rigidBody.mesh.position.add(rigidBody.velocity.clone().multiplyScalar(deltaTime));
        
        // Simple ground collision
        if (rigidBody.mesh.position.y < 0) {
          rigidBody.mesh.position.y = 0;
          rigidBody.velocity.y = -rigidBody.velocity.y * rigidBody.restitution;
        }
      }
    }
  }
}

export default new PhysicsEngine(); 