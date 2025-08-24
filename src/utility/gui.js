import GUI from "lil-gui";
import { shapeOptions, updateShape } from "../objects/projectileLauncher";
import { updateGravity, updateWind, worldOptions } from "../physics/forces"; 
import { dynamicsOptions } from "../objects/projectileLauncher";

const gui = new GUI();

// Shape type buttons
gui.add(shapeOptions, "type", ["Box", "Sphere", "Cylinder", "Capsule"]).onChange(value => {
  updateShape();
  showFolderForShape(value);
});

// Box folder
const boxFolder = gui.addFolder("Box");
boxFolder.add(shapeOptions, "width", 0.1, 5).onChange(updateShape);
boxFolder.add(shapeOptions, "height", 0.1, 5).onChange(updateShape);
boxFolder.add(shapeOptions, "depth", 0.1, 5).onChange(updateShape);

// Sphere folder
const sphereFolder = gui.addFolder("Sphere");
sphereFolder.add(shapeOptions, "radius", 0.1, 5).onChange(updateShape);

// Cylinder folder
const cylinderFolder = gui.addFolder("Cylinder");
cylinderFolder.add(shapeOptions, "radiusTop", 0.1, 5).onChange(updateShape);
cylinderFolder.add(shapeOptions, "radiusBottom", 0.1, 5).onChange(updateShape);
cylinderFolder.add(shapeOptions, "height", 0.1, 5).onChange(updateShape);

// Capsule folder
const capsuleFolder = gui.addFolder("Capsule");
capsuleFolder.add(shapeOptions, "radius", 0.1, 5).onChange(updateShape);
capsuleFolder.add(shapeOptions, "length", 0.1, 5).onChange(updateShape);

// World physics folder
const worldFolder = gui.addFolder("Gravity & Environment");
worldFolder.add(worldOptions, "damping", 0.9, 1).step(0.001).name("Damping");
worldFolder.add(worldOptions, "gravityY", -20, 0).step(0.1).name("Gravity (Y)").onChange(updateGravity);
worldFolder.add(worldOptions, "airDensity", 0, 3).step(0.01).name("Air Density");
worldFolder.add(worldOptions, "windX", -10, 10).step(0.1).name("Wind X").onChange(updateWind);
worldFolder.add(worldOptions, "windY", -10, 10).step(0.1).name("Wind Y").onChange(updateWind);
worldFolder.add(worldOptions, "windZ", -10, 10).step(0.1).name("Wind Z").onChange(updateWind);

// Projectile dynamics folder
const dynamicsFolder = gui.addFolder("Projectile Dynamics");
dynamicsFolder.add(dynamicsOptions, "mass", 0.1, 50).step(0.1).name("Mass");
dynamicsFolder.add(dynamicsOptions, "dragCoefficient", 0, 2).step(0.01).name("Drag Coeff");
dynamicsFolder.add(dynamicsOptions, "friction", 0, 1).step(0.01).name("Friction");
dynamicsFolder.add(dynamicsOptions, "restitution", 0, 1).step(0.01).name("Restitution");

// Shape color
gui.addColor(shapeOptions, "color").onChange(updateShape);

// Shape folder toggle logic
const shapeFolders = {
  Box: boxFolder,
  Sphere: sphereFolder,
  Cylinder: cylinderFolder,
  Capsule: capsuleFolder,
};

function showFolderForShape(type) {
  Object.entries(shapeFolders).forEach(([key, folder]) => {
    if (key === type) folder.show();
    else folder.hide();
  });
}
showFolderForShape(shapeOptions.type);