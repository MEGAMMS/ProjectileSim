import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { mainScene } from '../threeSetup.js';
import physicsEngine from '../physics/PhysicsEngine.js';
import RigidBody from '../physics/RigidBody.js';

// Simple Terrain Configuration
const TERRAIN_WIDTH = 200;
const TERRAIN_DEPTH = 200;
const TERRAIN_SEGMENTS = 50;
const MAX_TERRAIN_HEIGHT = 12;

// Create base geometry
const terrainGeometry = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
terrainGeometry.rotateX(-Math.PI / 2);

const noiseGenerator = new ImprovedNoise();

// Simple noise function
function generateSimpleNoise(x, z) {
  return noiseGenerator.noise(x * 0.05, z * 0.05, 0);
}

// Apply simple noise to terrain
for (let i = 0; i < terrainGeometry.attributes.position.count; i++) {
  const x = terrainGeometry.attributes.position.getX(i);
  const z = terrainGeometry.attributes.position.getZ(i);

  const elevation = generateSimpleNoise(x, z);
  terrainGeometry.attributes.position.setY(i, elevation * MAX_TERRAIN_HEIGHT);
}

terrainGeometry.computeVertexNormals();

// Simple terrain material with brighter color
const terrainMaterial = new THREE.MeshLambertMaterial({
  color: 0x7cb342,
});

// Create the terrain mesh
const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
mainScene.add(terrainMesh);

// Create a simple ground plane for physics
const groundGeometry = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshBasicMaterial({ 
  transparent: true, 
  opacity: 0.0 
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
const groundBody = new RigidBody(groundMesh, 0, 0.8, 0.8);
mainScene.add(groundMesh);
physicsEngine.addBody(groundBody);

export { physicsEngine }; 
