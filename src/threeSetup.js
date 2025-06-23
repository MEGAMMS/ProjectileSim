import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Create the main scene
const mainScene = new THREE.Scene();

// Set up the main camera
const mainCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
mainCamera.position.z = 5;

// Set up the main renderer
const mainRenderer = new THREE.WebGLRenderer({ antialias: true });
mainRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(mainRenderer.domElement);

const controls = new OrbitControls(mainCamera, mainRenderer.domElement);
controls.update();

mainRenderer.toneMapping = THREE.ACESFilmicToneMapping;
mainRenderer.outputEncoding = THREE.sRGBEncoding;
// mainRenderer.physicallyCorrectLights = true;
// mainRenderer.shadowMap.enabled = true;

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    mainCamera.aspect = window.innerWidth / window.innerHeight;
    mainCamera.updateProjectionMatrix();
    mainRenderer.setSize(window.innerWidth, window.innerHeight);
}

const textureLoader = new THREE.TextureLoader();
const modelLoader = new GLTFLoader();

export { mainScene, mainCamera, mainRenderer, controls, textureLoader, modelLoader };
