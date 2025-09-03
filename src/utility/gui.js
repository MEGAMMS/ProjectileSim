import GUI from "lil-gui";
import { worldOptions , shapeOptions , dynamicsOptions , monitorOptions, currentObjects } from "../objects/options";
import { updateShape } from "../objects/projectileLauncher";
import { mainCamera } from "../render/render.js";


// ================== MAIN CONTROL GUI (RIGHT) ==================
const gui = new GUI({ title: "Projectile Controls" });
gui.domElement.style.position = "absolute";
gui.domElement.style.top = "10px";
gui.domElement.style.right = "10px"; // stick to right side

// Shape type buttons
gui.add(shapeOptions, "type", ["Box", "Sphere", "Cylinder"]).onChange(value => {
  updateShape();
  showFolderForShape(value);
});

// Box folder
const boxFolder = gui.addFolder("Box");
boxFolder.add(shapeOptions, "width", 0.1, 1).onChange(updateShape);
boxFolder.add(shapeOptions, "height", 0.1, 1).onChange(updateShape);
boxFolder.add(shapeOptions, "depth", 0.1, 1).onChange(updateShape);

// Sphere folder
const sphereFolder = gui.addFolder("Sphere");
sphereFolder.add(shapeOptions, "radius", 0.1, 1).onChange(updateShape);

// Cylinder folder
const cylinderFolder = gui.addFolder("Cylinder");
cylinderFolder.add(shapeOptions, "radiusTop", 0.1, 1).onChange(updateShape);
cylinderFolder.add(shapeOptions, "radiusBottom", 0.1, 1).onChange(updateShape);
cylinderFolder.add(shapeOptions, "height", 0.1, 1).onChange(updateShape);

// Shape folder toggle logic
const shapeFolders = {
  Box: boxFolder,
  Sphere: sphereFolder,
  Cylinder: cylinderFolder,
};
function showFolderForShape(type) {
  Object.entries(shapeFolders).forEach(([key, folder]) => {
    if (key === type) folder.show();
    else folder.hide();
  });
}
showFolderForShape(shapeOptions.type);

// Shape color
gui.addColor(shapeOptions, "color").onChange(updateShape);

// World physics folder
const worldFolder = gui.addFolder("Gravity & Environment");
worldFolder.add(worldOptions, "simulationSpeed", 0.1, 2).step(0.1).name("Simulation Speed");
worldFolder.add(worldOptions, "damping", 0.9, 1).step(0.001).name("Damping");
worldFolder.add(worldOptions, "airDensity", 0, 3).step(0.01).name("Air Density");
worldFolder.add(worldOptions.windForce, "x", -10, 10).step(0.1).name("Wind X");
worldFolder.add(worldOptions.windForce, "y", -10, 10).step(0.1).name("Wind Y");
worldFolder.add(worldOptions.windForce, "z", -10, 10).step(0.1).name("Wind Z");

// Projectile dynamics folder
const dynamicsFolder = gui.addFolder("Projectile Dynamics");
dynamicsFolder.add(dynamicsOptions, "initialVelocity", 10, 100).step(1).name("Initial Velocity");
dynamicsFolder.add(dynamicsOptions, "mass", 0.1, 50).step(0.1).name("Mass");
dynamicsFolder.add(dynamicsOptions, "dragCoefficient", 0, 2).step(0.01).name("Drag Coeff");
dynamicsFolder.add(dynamicsOptions, "liftCoefficient", 0, 2).step(0.01).name("Lift Coeff");
dynamicsFolder.add(dynamicsOptions, "friction", 0, 1).step(0.01).name("Friction");
dynamicsFolder.add(dynamicsOptions, "restitution", 0, 1).step(0.01).name("Restitution");

// Monitor folder
const monitorFolder = gui.addFolder("Monitor");
monitorFolder.add(monitorOptions, "showForces").name("Show Forces");
monitorFolder.add(monitorOptions, "showPath").name("Show Path");
monitorFolder.add(monitorOptions, "showHelpers").name("Show Helpers");
monitorFolder.add({ reset: () => currentObjects.activeCamera = mainCamera }, "reset").name("Return to Main Camera");



// ================== STATISTICS GUI (LEFT) ==================
const statsGui = new GUI({ title: "Projectile Statistics" });
statsGui.domElement.style.position = "absolute";
statsGui.domElement.style.top = "10px";
statsGui.domElement.style.left = "10px"; // stick to left side

export function buildStatsFolders(projectile) {
  // Destroy all folders inside statsGui
  statsGui.foldersRecursive().forEach(folder => folder.destroy());

  // --- Position Folder ---
  const posFolder = statsGui.addFolder("Position");
  posFolder.add(projectile.position, "x").name("X").listen();
  posFolder.add(projectile.position, "y").name("Y").listen();
  posFolder.add(projectile.position, "z").name("Z").listen();

  // --- Motion Stats Folder ---
  const motionFolder = statsGui.addFolder("Motion Stats");
  motionFolder.add(projectile, "speed").name("Speed").listen();
  motionFolder.add(projectile, "kineticEnergy").name("Kinetic Energy").listen();
  motionFolder.add(projectile, "flightTime").name("Flight Time").listen();
  motionFolder.add(projectile, "distanceTraveled").name("Distance Traveled").listen();
}
