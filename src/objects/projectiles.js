import * as THREE from 'three';

// Shape factory
export function createShape(type, props) {
  let geometry;

  switch(type) {
    case "Box":
      geometry = new THREE.BoxGeometry(props.width, props.height, props.depth);
      break;
    case "Sphere":
      geometry = new THREE.SphereGeometry(props.radius, 32, 32);
      break;
    case "Cylinder":
      geometry = new THREE.CylinderGeometry(props.radiusTop, props.radiusBottom, props.height, 32);
      break;
    default:
      geometry = new THREE.BoxGeometry(1,1,1);
  }

  const material = new THREE.MeshStandardMaterial({ color: props.color || 0x00ff00 , transparent: true , opacity: 0.8 });
  return new THREE.Mesh(geometry, material);
}