// Global physics world options
export const worldOptions = {
  damping: 0.99,
  gravityY: -9.81,
  airDensity: 1.225,
  windX: 0,
  windY: 0,
  windZ: 0,
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

// Stats object
const projectileStats = {
  speed: 0,
  kineticEnergy: 0,
  flightTime: 0,
  distanceTraveled: 0,
};