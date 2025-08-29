import physicsEngine from './physicsEngine.js';
import * as forces from './forces.js';
import { worldOptions } from '../objects/options.js';


// fixed timestep for physics
const FIXED_DELTA = 1 / 60;
export let lastPhysicsTime = performance.now();
let physicsInterval;
export let physicsIntervalDuration;

export function startPhysicsLoop() {
    if (physicsInterval) clearInterval(physicsInterval);
    physicsIntervalDuration = (1 / worldOptions.simulationSpeed) * FIXED_DELTA * 1000;
    physicsInterval = setInterval(() => {
        lastPhysicsTime = performance.now();
        physicsEngine.bodies.forEach(body => {
            if (body.mass === 0) return;
            forces.applyDamping(body);
            forces.applyGravity(body);
            forces.applyAirDynamics(body);
            forces.applyWind(body);
            forces.applyMagnusForce(body); 
        });
        physicsEngine.update(FIXED_DELTA);
    },physicsIntervalDuration) ;
}
    
// Start initially
startPhysicsLoop();