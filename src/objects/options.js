import { Vector3 } from "three";

// Global physics world options
export const worldOptions = {
  G: 6.67430e-11,
  M: 5.9722e24,
  R: 6371000,
  simulationSpeed: 1,
  damping: 0.99,
  airDensity: 1.225,
  windForce: new Vector3(0,0,0)
};

// Default shape options
export const shapeOptions = {
    type: "Box",
    width: 0.5,
    height: 0.5,
    depth: 0.5,
    radius: 0.5,
    radiusTop: 0.5,
    radiusBottom: 0.5,
    length: 0.5,
    color: 0xff0000,
};

// Projectile dynamics
export const dynamicsOptions = {
  centerOfMass: new Vector3(),
  initialVelocity: 30,
  mass: 1,
  dragCoefficient: 0.5,
  friction: 0.5,
  restitution: 0.8,
};

// Monitor options
export const monitorOptions = {
  showForces: false,
  showPath: false,
  showHelpers: false
};