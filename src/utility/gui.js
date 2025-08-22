import GUI from 'lil-gui';
import { shapeOptions , updateShape } from '../objects/projectileLauncher';


const gui = new GUI();

// GUI controls

// Update shape when type changes
gui.add(shapeOptions, "type", ["Box", "Sphere", "Cylinder", "Capsule"]).onChange(value => {
  updateShape();
  showFolderForShape(value);
});

// Create folders for each shape
const boxFolder = gui.addFolder("Box");
boxFolder.add(shapeOptions, "width", 0.1, 5).onChange(updateShape);
boxFolder.add(shapeOptions, "height", 0.1, 5).onChange(updateShape);
boxFolder.add(shapeOptions, "depth", 0.1, 5).onChange(updateShape);

const sphereFolder = gui.addFolder("Sphere");
sphereFolder.add(shapeOptions, "radius", 0.1, 5).onChange(updateShape);

const cylinderFolder = gui.addFolder("Cylinder");
cylinderFolder.add(shapeOptions, "radiusTop", 0.1, 5).onChange(updateShape);
cylinderFolder.add(shapeOptions, "radiusBottom", 0.1, 5).onChange(updateShape);
cylinderFolder.add(shapeOptions, "height", 0.1, 5).onChange(updateShape);

const capsuleFolder = gui.addFolder("Capsule");
capsuleFolder.add(shapeOptions, "radius", 0.1, 5).onChange(updateShape);
capsuleFolder.add(shapeOptions, "length", 0.1, 5).onChange(updateShape);

gui.addColor(shapeOptions, "color").onChange(updateShape);

// Keep references in a map for easier toggling
const shapeFolders = {
  Box: boxFolder,
  Sphere: sphereFolder,
  Cylinder: cylinderFolder,
  Capsule: capsuleFolder,
};

// Function to show only the active shape folder
function showFolderForShape(type) {
  Object.entries(shapeFolders).forEach(([key, folder]) => {
    if (key === type) folder.show();
    else folder.hide();
  });
}
showFolderForShape(shapeOptions.type);