import * as THREE from 'three';
import { mainScene } from '../render/scene.js';
import {createShape} from './projectiles.js';


// Default shape options
export const shapeOptions = {
    type: "Box",
    width: 1,
    height: 1,
    depth: 1,
    radius: 1,
    radiusTop: 1,
    radiusBottom: 1,
    length: 1,
    color: 0xff0000,
};

let currentShape = createShape(shapeOptions.type, shapeOptions);
const projectileFactory = new THREE.Object3D();
projectileFactory.position.set(0,5,0);
projectileFactory.add(currentShape);
mainScene.add(projectileFactory);

export function updateShape() {
    projectileFactory.remove(currentShape);
    currentShape.geometry.dispose();
    currentShape.material.dispose();
    currentShape = createShape(shapeOptions.type, shapeOptions);
    projectileFactory.add(currentShape);
}