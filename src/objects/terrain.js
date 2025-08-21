import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import RigidBody from '../physics/rigidBody';
import { mainScene } from '../render/scene';
import physicsEngine from '../physics/physicsEngine';


// Terrain Config
const width = 200;
const depth = 200;
const segments = 100;
const chunkSize = 20;
const chunkResolution = 10;

// Create base geometry (horizontal plane)
const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
geometry.rotateX(-Math.PI / 2);

const noise = new ImprovedNoise();
const height = 15; // Max terrain height

// Fractal noise function (smooth but random)
function fractalNoise(x, z, octaves = 3, persistence = 0.7, lacunarity = 1.5) {
  let amplitude = 1;
  let frequency = 1;
  let noiseSum = 0;
  let maxAmplitude = 0;

  for (let o = 0; o < octaves; o++) {
    noiseSum += noise.noise(x * frequency, z * frequency, 0) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return noiseSum / maxAmplitude;
}

// Apply noise to terrain vertices
for (let i = 0; i < geometry.attributes.position.count; i++) {
  const x = geometry.attributes.position.getX(i);
  const z = geometry.attributes.position.getZ(i);

  // Base smooth layer
  const base = fractalNoise(x * 0.05, z * 0.05, 3, 0.7, 1.5);
  // Add a more random fine detail layer
  const detail = noise.noise(x * 0.3, z * 0.3, 0) * 0.2;

  const elevation = base + detail;
  geometry.attributes.position.setY(i, elevation * height);
}

geometry.computeVertexNormals();

// Terrain material
const baseMaterial = new THREE.MeshBasicMaterial({
  color: 0x556633,
  wireframe: false,
});

// Helper: Extract vertices for convex chunk
function extractChunkVertices(baseGeometry, startX, startZ, step, countX, countZ) {
  const positions = baseGeometry.attributes.position;
  const vertices = [];

  const rowLength = segments + 1;

  for (let z = 0; z <= countZ; z++) {
    for (let x = 0; x <= countX; x++) {
      const gridX = Math.floor(startX + x);
      const gridZ = Math.floor(startZ + z);

      if (gridX > segments || gridZ > segments) continue;

      const index = gridZ * rowLength + gridX;

      const vx = positions.getX(index);
      const vy = positions.getY(index);
      const vz = positions.getZ(index);
      vertices.push(new THREE.Vector3(vx, vy, vz));

      // Add a base vertex for convex volume
      vertices.push(new THREE.Vector3(vx, 0, vz));
    }
  }

  return vertices;
}

// Generate convex terrain chunks
const step = width / segments;
const chunksX = Math.floor(width / chunkSize);
const chunksZ = Math.floor(depth / chunkSize);

for (let i = 0; i < chunksZ; i++) {
  for (let j = 0; j < chunksX; j++) {
    const startX = (j * chunkSize) / step;
    const startZ = (i * chunkSize) / step;

    const vertices = extractChunkVertices(
      geometry,
      startX,
      startZ,
      chunkResolution,
      chunkResolution,
      chunkResolution
    );

    if (vertices.length < 4) continue;

    const convexGeometry = new ConvexGeometry(vertices);
    const chunkMesh = new THREE.Mesh(convexGeometry, baseMaterial.clone());

    chunkMesh.position.set(0, 0, 0);
    chunkMesh.updateMatrixWorld();

    const chunk = new RigidBody(chunkMesh, 0, 0.8, 0.8);
    mainScene.add(chunkMesh);
    physicsEngine.addBody(chunk);
  }
}
