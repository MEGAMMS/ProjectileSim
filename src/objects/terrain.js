import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import RigidBody from '../physics/rigidBody';
import { mainScene } from '../render/scene';
import physicsEngine from '../physics/physicsEngine';

// Terrain Config
const width = 200;
const depth = 200;
const segments = 50;
const chunkSize = 20;
const chunkResolution = 10;

// Create base plane geometry
const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
geometry.rotateX(-Math.PI / 2);

const noise = new ImprovedNoise();
const height = 10; // taller hills

// Fractal noise function
function fractalNoise(x, z, octaves = 4, persistence = 0.6, lacunarity = 1.5) {
  let amplitude = 1, frequency = 1, noiseSum = 0, maxAmplitude = 0;
  for (let o = 0; o < octaves; o++) {
    noiseSum += noise.noise(x * frequency, z * frequency, 0) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return noiseSum / maxAmplitude;
}

// Apply smoother noise to vertices
for (let i = 0; i < geometry.attributes.position.count; i++) {
  const x = geometry.attributes.position.getX(i);
  const z = geometry.attributes.position.getZ(i);

  const base = fractalNoise(x * 0.04, z * 0.04, 4, 0.6, 1.5);
  const detail = noise.noise(x * 0.2, z * 0.2, 0) * 0.1;

  geometry.attributes.position.setY(i, (base + detail) * height);
}

// Compute smooth normals
geometry.computeVertexNormals();

// Extract vertices for convex chunk (optimized)
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

      // Only top vertices for smoother convex hull
      vertices.push(new THREE.Vector3(vx, vy, vz));

      // Optional: bottom vertices for sealed volume (physics)
      vertices.push(new THREE.Vector3(vx, 0, vz));
    }
  }
  return vertices;
}

// Create procedural checker texture
function createCheckerTexture(repeat = 8, color1 = '#000000', color2 = '#ffffff') {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const block = size / 2;

  context.fillStyle = color1;
  context.fillRect(0, 0, block, block);
  context.fillRect(block, block, block, block);

  context.fillStyle = color2;
  context.fillRect(block, 0, block, block);
  context.fillRect(0, block, block, block);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);

  return texture;
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

    if (vertices.length < 8) continue;

    const convexGeometry = new ConvexGeometry(vertices);
    convexGeometry.computeVertexNormals(); // smooth edges

    // UV mapping
    convexGeometry.computeBoundingBox();
    const max = convexGeometry.boundingBox.max;
    const min = convexGeometry.boundingBox.min;
    const uvAttr = [];
    for (let vi = 0; vi < convexGeometry.attributes.position.count; vi++) {
      const vx = convexGeometry.attributes.position.getX(vi);
      const vz = convexGeometry.attributes.position.getZ(vi);
      const u = (vx - min.x) / (max.x - min.x);
      const v = (vz - min.z) / (max.z - min.z);
      uvAttr.push(u, v);
    }
    convexGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvAttr, 2));

    // Smooth MeshStandardMaterial
    const material = new THREE.MeshStandardMaterial({
      map: createCheckerTexture(8, '#000000', '#ffffff'),
      roughness: 0.7,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    const chunkMesh = new THREE.Mesh(convexGeometry, material);
    chunkMesh.receiveShadow = true;
    chunkMesh.position.set(0, 0, 0);
    chunkMesh.updateMatrixWorld();

    const chunk = new RigidBody(chunkMesh, 0, 0.8, 0.8); // mass 0 for static terrain
    mainScene.add(chunkMesh);
    physicsEngine.addBody(chunk);
  }
}
