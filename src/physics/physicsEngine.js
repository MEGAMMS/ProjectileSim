import { getContact } from "./collision/collisionDetection";
import { applyPositionalCorrection, resolveCollision } from "./collision/collisionResponse";
import { computeProjectedConvexArea } from "./convex";

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
        
        this.bodies.forEach(b => {
            if (b.mass == 0.0) return;
            b.mesh.updateMatrixWorld(true);
            b.convex = b.lconvex.map(v => v.clone().applyMatrix4(b.mesh.matrixWorld));
            b.dragArea = computeProjectedConvexArea(b.convex,b.velocity.clone().negate());
        });

        
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