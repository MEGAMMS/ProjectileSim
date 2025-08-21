import { getContact } from "./collision/collisionDetection";
import { applyPositionalCorrection, resolveCollision } from "./collision/collisionResponse";

class PhysicsEngine {
    constructor() {
        this.bodies = [];
    }

    addBody(body) {
        this.bodies.push(body);
    }


    update(deltaTime) {

        // Integrate full timestep
        for (const body of this.bodies) {
            body.integrate(deltaTime);
        }
        
        this.bodies.forEach(b => b.mesh.updateMatrixWorld(true));
        
        // Collision Detection & Response
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const A = this.bodies[i];
                const B = this.bodies[j];

                if (A.mass === 0.0 && B.mass === 0.0) continue;
                
                // 🧭 Get contact info
                const contact = getContact(A, B);

                // 💥 Collision response
                if (contact) {
                    resolveCollision(A, B, contact);
                    applyPositionalCorrection(A, B, contact);
                }
            }
        }
        
    }
}

export default new PhysicsEngine(); 