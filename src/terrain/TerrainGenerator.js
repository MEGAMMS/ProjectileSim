import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { mainScene } from '../threeSetup.js';
import physicsEngine from '../physics/PhysicsEngine.js';
import RigidBody from '../physics/RigidBody.js';

// Terrain Configuration
const TERRAIN_WIDTH = 400;
const TERRAIN_DEPTH = 400;
const TERRAIN_SEGMENTS = 200;
const CHUNK_SIZE = 20;
const CHUNK_RESOLUTION = 10;
const MAX_TERRAIN_HEIGHT = 15;

// Create base geometry (horizontal plane)
const terrainGeometry = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
terrainGeometry.rotateX(-Math.PI / 2);

const noiseGenerator = new ImprovedNoise();

// Fractal noise function for smooth but random terrain
function generateFractalNoise(x, z, octaves = 4, persistence = 0.7, lacunarity = 1.5) {
  let amplitude = 1;
  let frequency = 1;
  let noiseSum = 0;
  let maxAmplitude = 0;

  for (let o = 0; o < octaves; o++) {
    noiseSum += noiseGenerator.noise(x * frequency, z * frequency, 0) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return noiseSum / maxAmplitude;
}

// Apply noise to terrain vertices
for (let i = 0; i < terrainGeometry.attributes.position.count; i++) {
  const x = terrainGeometry.attributes.position.getX(i);
  const z = terrainGeometry.attributes.position.getZ(i);

  // Base smooth layer
  const baseElevation = generateFractalNoise(x * 0.05, z * 0.05, 3, 0.7, 1.5);
  // Add fine detail layer
  const detailElevation = noiseGenerator.noise(x * 0.3, z * 0.3, 0) * 0.2;

  const finalElevation = baseElevation + detailElevation;
  terrainGeometry.attributes.position.setY(i, finalElevation * MAX_TERRAIN_HEIGHT);
}

terrainGeometry.computeVertexNormals();

// Terrain material
const terrainMaterial = new THREE.MeshStandardMaterial({
  color: 0x556633,
  wireframe: false,
});

// Extract vertices for convex chunk generation
function extractChunkVertices(baseGeometry, startX, startZ, countX, countZ) {
  const positions = baseGeometry.attributes.position;
  const vertices = [];

  const rowLength = TERRAIN_SEGMENTS + 1;

  for (let z = 0; z <= countZ; z++) {
    for (let x = 0; x <= countX; x++) {
      const gridX = Math.floor(startX + x);
      const gridZ = Math.floor(startZ + z);

      if (gridX > TERRAIN_SEGMENTS || gridZ > TERRAIN_SEGMENTS) continue;

      const index = gridZ * rowLength + gridX;

      const vertexX = positions.getX(index);
      const vertexY = positions.getY(index);
      const vertexZ = positions.getZ(index);
      vertices.push(new THREE.Vector3(vertexX, vertexY, vertexZ));

      // Add base vertex for convex volume
      vertices.push(new THREE.Vector3(vertexX, 0, vertexZ));
    }
  }

  return vertices;
}

// Generate convex terrain chunks
const segmentStep = TERRAIN_WIDTH / TERRAIN_SEGMENTS;
const totalChunksX = Math.floor(TERRAIN_WIDTH / CHUNK_SIZE);
const totalChunksZ = Math.floor(TERRAIN_DEPTH / CHUNK_SIZE);

for (let chunkZ = 0; chunkZ < totalChunksZ; chunkZ++) {
  for (let chunkX = 0; chunkX < totalChunksX; chunkX++) {
    const startX = (chunkX * CHUNK_SIZE) / segmentStep;
    const startZ = (chunkZ * CHUNK_SIZE) / segmentStep;

    const chunkVertices = extractChunkVertices(
      terrainGeometry,
      startX,
      startZ,
      CHUNK_RESOLUTION,
      CHUNK_RESOLUTION
    );

    if (chunkVertices.length < 4) continue;

    const convexChunkGeometry = new ConvexGeometry(chunkVertices);
    const terrainChunkMesh = new THREE.Mesh(convexChunkGeometry, terrainMaterial.clone());

    terrainChunkMesh.position.set(0, 0, 0);
    terrainChunkMesh.updateMatrixWorld();

    const terrainChunkBody = new RigidBody(terrainChunkMesh, 0, 0.8, 0.8);
    mainScene.add(terrainChunkMesh);
    physicsEngine.addBody(terrainChunkBody);
  }
}

export { physicsEngine }; 
