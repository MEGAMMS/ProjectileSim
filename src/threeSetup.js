import * as THREE from 'three';

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

export { mainScene, mainCamera, mainRenderer }; 