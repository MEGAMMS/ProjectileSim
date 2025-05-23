import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {renderer,scene} from "./Initialize.js";

  // Load HDR environment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  
  new RGBELoader()
    .setPath('./assets/hdri/') // Replace with your path
    .load('kloppenheim_06_puresky_4k.hdr', (hdrEquirect) => {
      const envMap = pmremGenerator.fromEquirectangular(hdrEquirect).texture;
  
      scene.environment = envMap;
      scene.background = envMap; // optional, for visible background
  
      hdrEquirect.dispose();
      pmremGenerator.dispose();
    });