import physicsEngine from './physicsEngine.js';
import * as forces from './forces.js';
import { worldOptions } from '../objects/options.js';

// fixed timestep for physics
const FIXED_DELTA = 1 / 60;
export let lastPhysicsTime = performance.now();
export let physicsIntervalDuration;

function runPhysicsLoop() {
    physicsIntervalDuration = (1 / worldOptions.simulationSpeed) * FIXED_DELTA * 1000;
    lastPhysicsTime = performance.now();
    physicsEngine.bodies.forEach(body => {
        if (body.mass === 0) return;
        forces.applyDamping(body);
        forces.applyGravity(body);
        forces.applyAerodynamicForces(body);
    });
    physicsEngine.update(FIXED_DELTA);
    setTimeout(runPhysicsLoop, physicsIntervalDuration); 
}
        
// Start initially
runPhysicsLoop();