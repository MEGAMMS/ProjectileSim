import * as THREE from 'three';
import { mainRenderer } from './render/threeSetup.js';
import { mainScene, mainCamera } from './render/scene.js';
import './objects/skybox.js';
import './objects/terrain.js';
import {projectiles} from './objects/projectiles.js';
import physicsEngine from './physics/physicsEngine.js';
import * as forces from './physics/forces.js';


// fixed timestep for physics
const FIXED_DELTA = 1 / 60;
setInterval(() => {

    physicsEngine.bodies.forEach((body) => {
      forces.applyDamping(body);
      forces.applyGravity(body);
    });

    physicsEngine.update(FIXED_DELTA);
}, FIXED_DELTA * 1000);

mainRenderer.setAnimationLoop( (t) => mainRenderer.render(mainScene, mainCamera) );