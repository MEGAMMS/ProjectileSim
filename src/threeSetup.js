import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mainCamera } from './objects/world';

// Set up the main renderer
const mainRenderer = new THREE.WebGLRenderer({ antialias: true });
mainRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(mainRenderer.domElement);
mainRenderer.toneMapping = THREE.ACESFilmicToneMapping;
mainRenderer.outputEncoding = THREE.sRGBEncoding;
mainRenderer.physicallyCorrectLights = true;
mainRenderer.shadowMap.enabled = true;
mainRenderer.shadowMap.enabled = true;
mainRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Responsivity
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    mainCamera.aspect = window.innerWidth / window.innerHeight;
    mainCamera.updateProjectionMatrix();
    mainRenderer.setSize(window.innerWidth, window.innerHeight);
}

// Set up Controls
const controls = new OrbitControls(mainCamera, mainRenderer.domElement);
controls.update();

// Create Loaders
const textureLoader = new THREE.TextureLoader();
const modelLoader = new GLTFLoader();

export {mainRenderer, controls, textureLoader, modelLoader };