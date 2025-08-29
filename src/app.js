import * as THREE from 'three';
import Stats from 'stats.js';
import { mainRenderer } from './render/threeSetup.js';
import { mainScene, mainCamera } from './render/scene.js';
import physicsEngine from './physics/physicsEngine.js';
import './objects/terrain.js';
import './objects/projectileLauncher.js';
import * as forces from './physics/forces.js';
import "./utility/gui.js"


const stats = new Stats();
document.body.appendChild(stats.dom);


// fixed timestep for physics
const FIXED_DELTA = 1 / 60;
setInterval(() => {
    stats.update();
    physicsEngine.bodies.forEach((body) => {
      if (body.mass == 0.0) return;
      forces.applyDamping(body);
      forces.applyGravity(body);
      forces.applyAirDynamics(body);
      forces.applyWind(body);
      forces.applyMagnusForce(body);
    });

    physicsEngine.update(FIXED_DELTA);
}, FIXED_DELTA * 1000);

mainRenderer.setAnimationLoop( (t) => mainRenderer.render(mainScene, mainCamera) );