import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import physicsEngine from '../physics/physicsEngine';
import { lastPhysicsTime , physicsIntervalDuration } from '../physics/physics';
import { TransformControls } from 'three/addons/controls/TransformControls.js';


// Set up the main renderer
export const mainRenderer = new THREE.WebGLRenderer({ antialias: true });
mainRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(mainRenderer.domElement);
mainRenderer.toneMapping = THREE.ACESFilmicToneMapping;
mainRenderer.outputEncoding = THREE.sRGBEncoding;
mainRenderer.physicallyCorrectLights = true;
mainRenderer.shadowMap.enabled = true;
mainRenderer.shadowMap.type = THREE.PCFSoftShadowMap;


// Create the main scene
export const mainScene = new THREE.Scene();
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


// Main Camera
export const mainCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
mainCamera.position.set(0, 10, 5);

// Gizmo Camera
const gizmoSize = 1; // tweak this to make the gizmo the right size on screen
const gizmoCamera = new THREE.OrthographicCamera(
  -gizmoSize, gizmoSize,
  gizmoSize, -gizmoSize,
  -1000, 1000
);

function updateGizmoCamera() {
  // Gizmo camera stays at origin but rotates to match main camera
  gizmoCamera.position.copy(mainCamera.position);
  gizmoCamera.quaternion.copy(mainCamera.quaternion);
  gizmoCamera.updateMatrixWorld();
}


// Set up Controls
const controls = new OrbitControls(mainCamera, mainRenderer.domElement);
window.orbitControls = controls;
controls.target.set(0, 8, 0);
controls.update();

export const transform = new TransformControls(gizmoCamera, mainRenderer.domElement);
const gizmo = transform.getHelper();
mainScene.add(gizmo);

// Disable OrbitControls while dragging
transform.addEventListener("dragging-changed", (event) => {
  window.orbitControls.enabled = !event.value;
});


// Responsivity
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    mainCamera.aspect = window.innerWidth / window.innerHeight;
    mainCamera.updateProjectionMatrix();
    mainRenderer.setSize(window.innerWidth, window.innerHeight);
}


mainRenderer.setAnimationLoop( (t) => {
  updateGizmoCamera();

   physicsEngine.bodies.forEach(body => {
        // Interpolation factor (alpha) between previous and current physics step
        const now = performance.now();
        let alpha = (now - lastPhysicsTime) / physicsIntervalDuration;
        alpha = THREE.MathUtils.clamp(alpha, 0, 1);
        
        // Interpolated position
        body.mesh.position.lerpVectors(body.prevPosition, body.position, alpha);
        // Interpolated rotation
        body.mesh.quaternion.copy(body.prevQuaternion).slerp(body.quaternion, alpha);
        
        // No Interpolation
        //body.mesh.position.copy(body.position);
        //body.mesh.quaternion.copy(body.quaternion);
    });

  mainRenderer.render(mainScene, mainCamera)
} );