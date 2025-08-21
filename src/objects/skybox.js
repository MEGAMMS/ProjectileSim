import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { mainRenderer } from '../render/threeSetup.js';
import { mainScene } from '../render/scene.js';

// Set up PMREM generator for environment map
const pmremGenerator = new THREE.PMREMGenerator(mainRenderer);
pmremGenerator.compileEquirectangularShader();

// Load HDR environment texture
new RGBELoader()
  .setPath('./assets/')
  .load(
    'kloppenheim_06_puresky_1k.hdr',
    (hdrEquirect) => {
      const envMap = pmremGenerator.fromEquirectangular(hdrEquirect).texture;
      mainScene.environment = envMap;
      mainScene.background = envMap;
      hdrEquirect.dispose();
      pmremGenerator.dispose();
    },
    undefined,
    (error) => {
      console.error('Error loading HDR environment:', error);
    }
  ); 