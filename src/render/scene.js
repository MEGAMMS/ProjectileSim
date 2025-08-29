import * as THREE from 'three';

// Create the main scene
const mainScene = new THREE.Scene();
mainScene.background = new THREE.Color(0x87ceeb); // light sky blue

// Sun-like lighting setup
const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.3);
mainScene.add(ambientLight);

// Main sun light
const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(100, 200, 100);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
mainScene.add(sunLight);

// Add a softer fill light
const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
fillLight.position.set(-50, 100, -50);
mainScene.add(fillLight);


// Set up the main camera
const mainCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
mainCamera.position.set(0, 10, 5);


export { mainScene, mainCamera };