import physicsEngine from './physicsEngine.js';
import Stats from 'stats.js';
import * as forces from './forces.js';
import { worldOptions } from '../objects/options.js';


const stats = new Stats();
document.body.appendChild(stats.dom);

// fixed timestep for physics
const FIXED_DELTA = 1 / 60;
let physicsInterval;

export function startPhysicsLoop() {
    if (physicsInterval) clearInterval(physicsInterval);
    physicsInterval = setInterval(() => {
        stats.update();
        physicsEngine.bodies.forEach(body => {
            if (body.mass === 0) return;
            forces.applyDamping(body);
            forces.applyGravity(body);
            forces.applyAirDynamics(body);
            forces.applyWind(body);
            forces.applyMagnusForce(body); 
        });
        physicsEngine.update(FIXED_DELTA);
    }, (1 / worldOptions.simulationSpeed) * FIXED_DELTA * 1000);
}
    
// Start initially
startPhysicsLoop();