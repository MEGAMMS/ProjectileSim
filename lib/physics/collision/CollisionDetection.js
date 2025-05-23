import * as THREE from "three";
import {ExtendedTriangle} from 'three-mesh-bvh';
import {getMatrixToA} from "../Utility.js";
import {scene} from "../../renderer/Initialize.js";


export function getContacts(A, B) {
  const aType = A.colliderType;
  const bType = B.colliderType;

  const pair = `${aType}_${bType}`;
  const flippedPair = `${bType}_${aType}`;
  
  switch (pair) {
    case "bvh_bvh":
      return getBVHContact(A, B);

    case "bvh_sphere":
      return getBVHSphereContact(A, B);

    case "bvh_box":
      return getBVHBoxContact(A, B);

    case "sphere_sphere":
      return getSphereContact(A, B);

    case "sphere_box":
      return getSphereBoxContact(A, B);

    case "box_box":
      return getBoxContact(A, B);
  }

  // Handle flipped cases
  switch (flippedPair) {
    case "bvh_sphere": {
      const contact = getBVHSphereContact(B, A);
      if (contact) contact.contactNormal.negate();
      return contact;
    }

    case "bvh_box": {
      const contact = getBVHBoxContact(B, A);
      if (contact) contact.contactNormal.negate();
      return contact;
    }

    case "sphere_box": {
      const contacts = getSphereBoxContact(B, A);
      contacts.forEach(contact => contact.contactNormal);
      return contacts;
    }
  }

  console.warn(`No collision handler for ${pair}`);
  return null;
}




/* BVH */
function getBVHContact(A, B) {
  const meshA = A.representation;
  const meshB = B.representation;
  const matrixToA = meshA.getMatrixToA(meshB);

  const geomA = meshA.bvh;
  const geomB = meshB.bvh;

  const triA = new ExtendedTriangle();
  const triB = new ExtendedTriangle();

  const contacts = [];

  geomB.boundsTree.shapecast({
    intersectsBounds: (box) => geomA.boundsTree.intersectsBox(box, matrixToA),

    intersectsTriangle: (triangleB) => {
      triB.copy(triangleB);
      triB.a.applyMatrix4(matrixToA);
      triB.b.applyMatrix4(matrixToA);
      triB.c.applyMatrix4(matrixToA);

      geomA.boundsTree.shapecast({
        intersectsBounds: (box) => triB.intersectsBox(box),

        intersectsTriangle: (triangleA) => {
          triA.copy(triangleA);

          if (!triA.intersectsTriangle(triB)) return false;

          const pointsA = [triB.a, triB.b, triB.c].map(p => {
            const closest = new THREE.Vector3();
            triA.closestPointToPoint(p, closest);
            return { a: closest, b: p };
          });

          const pointsB = [triA.a, triA.b, triA.c].map(p => {
            const closest = new THREE.Vector3();
            triB.closestPointToPoint(p, closest);
            return { a: p, b: closest };
          });

          const allPairs = pointsA.concat(pointsB);

          for (const pair of allPairs) {
            const distSq = pair.a.distanceToSquared(pair.b);
            if (distSq < 1e-8) continue;

            const penetrationDepth = Math.sqrt(distSq);
            const contactPoint = pair.a.clone().add(pair.b).multiplyScalar(0.5).applyMatrix4(meshA.matrixWorld);

            const triANormal = triA.getNormal(new THREE.Vector3());
            const triBNormal = triB.getNormal(new THREE.Vector3());

            let contactNormal = triANormal.dot(pair.b.clone().sub(pair.a)) < 0
              ? triANormal.clone()
              : triBNormal.clone().negate();

            const normalMatrix = new THREE.Matrix3().getNormalMatrix(meshA.matrixWorld);
            contactNormal.applyMatrix3(normalMatrix).normalize();

            contacts.push({
              contactPoint,
              contactNormal,
              penetrationDepth
            });
          }

          return false;
        }
      });

      return false;
    }
  });

  // Sort by penetration depth (descending), and return up to 4
  contacts.sort((a, b) => b.penetrationDepth - a.penetrationDepth);
  const bestContacts = contacts.slice(0, 4);

  bestContacts.forEach((e) => {visualizeContact(e)});
  return bestContacts;
}



function getBVHSphereContact(A, B) {
  const meshA = A.representation;
  const meshB = B.representation;
  const matrixToA = meshA.getMatrixToA(meshB);
  const sphere = meshB.sphere.clone();
  sphere.applyMatrix4(matrixToA); // Move sphere to meshA's local space

  const contacts = [];

  meshA.bvh.boundsTree.shapecast({
    intersectsBounds: box => box.distanceToPoint(sphere.center) <= sphere.radius,
    intersectsTriangle: tri => {
      const triangle = new ExtendedTriangle().copy(tri);
      const pt = new THREE.Vector3();
      triangle.closestPointToPoint(sphere.center, pt);

      const distSq = pt.distanceToSquared(sphere.center);
      if (distSq < sphere.radius * sphere.radius) {
        const contactNormal = new THREE.Vector3().subVectors(sphere.center, pt).normalize();
        const penetrationDepth = sphere.radius - Math.sqrt(distSq);

        // Convert point and normal back to world space
        const contactPoint = pt.clone().applyMatrix4(meshA.matrixWorld);
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(meshA.matrixWorld);
        const worldNormal = contactNormal.clone().applyMatrix3(normalMatrix).normalize();

        contacts.push({
          contactPoint,
          contactNormal: worldNormal,
          penetrationDepth,
          distSq
        });
      }
    }
  });

  // Sort by distance (closest to center first) and limit to 4 best contacts
  contacts.sort((a, b) => a.distSq - b.distSq);
  const bestContacts = contacts.slice(0, 4).map(({ distSq, ...rest }) => rest);

  bestContacts.forEach((e) => {visualizeContact(e)});
  return bestContacts;
}



function getBVHBoxContact(A, B) {
  const meshA = A.representation; // BVH geometry
  const meshB = B.representation; // OBB geometry

  const matrixToA = meshA.getMatrixToA(meshB);
  const obb = meshB.box.clone().applyMatrix4(matrixToA);

  const tri = new ExtendedTriangle();
  const ptOnTri = new THREE.Vector3();
  const ptOnBox = new THREE.Vector3();

  const contacts = [];

  meshA.bvh.boundsTree.shapecast({
    intersectsBounds: boundsBox => {
      return obb.intersectsBox3(boundsBox);
    },

    intersectsTriangle: triIn => {
      tri.copy(triIn);

      // Triangle center
      const triCenter = tri.getMidpoint(new THREE.Vector3());

      // Clamp triangle center to OBB
      obb.clampPoint(triCenter, ptOnBox);

      // Closest point on triangle to that point
      tri.closestPointToPoint(ptOnBox, ptOnTri);

      const distSq = ptOnBox.distanceToSquared(ptOnTri);
      if (distSq > 1e-8) {
        const penetrationDepth = Math.sqrt(distSq);
        const contactNormal = ptOnBox.clone().sub(ptOnTri).normalize();

        const contactPointWorld = ptOnTri.applyMatrix4(meshA.matrixWorld);
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(meshA.matrixWorld);
        const worldNormal = contactNormal.clone().applyMatrix3(normalMatrix).normalize();

        contacts.push({
          contactPoint: contactPointWorld,
          contactNormal: worldNormal,
          penetrationDepth
        });
      }
    }
  });

  // Sort by penetration depth and limit to 4 contacts
  contacts.sort((a, b) => b.penetrationDepth - a.penetrationDepth);
  const bestContacts = contacts.slice(0, 4);

  bestContacts.forEach((e) => {visualizeContact(e)});
  return bestContacts;
}






/* Sphere */
function getSphereContact(A, B) {
  const meshA = A.representation;
  const meshB = B.representation;

  const a = meshA.sphere.clone();
  const b = meshB.sphere.clone();

  const matrixToA = meshA.getMatrixToA(meshB);
  b.applyMatrix4(matrixToA);

  const posA = a.center;
  const posB = b.center;

  const delta = new THREE.Vector3().subVectors(posB, posA);
  const dist = delta.length();
  const penetration = a.radius + b.radius - dist;

  if (penetration > 0) {
    const baseNormal = delta.clone().normalize();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(meshA.matrixWorld);

    // Compute center contact point
    const contactCenter = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);

    // Create 4 synthetic contact points slightly offset around the center
    const tangent1 = new THREE.Vector3().crossVectors(baseNormal, new THREE.Vector3(1, 0, 0));
    if (tangent1.lengthSq() < 1e-4) tangent1.set(0, 1, 0);
    tangent1.crossVectors(baseNormal, tangent1).normalize();

    const tangent2 = new THREE.Vector3().crossVectors(baseNormal, tangent1).normalize();

    const offset = penetration * 0.25; // scale of synthetic offsets
    const offsets = [
      tangent1.clone().multiplyScalar(offset),
      tangent1.clone().multiplyScalar(-offset),
      tangent2.clone().multiplyScalar(offset),
      tangent2.clone().multiplyScalar(-offset)
    ];

    const contacts = offsets.map(o => {
      const contactPoint = contactCenter.clone().add(o).applyMatrix4(meshA.matrixWorld);
      const contactNormal = baseNormal.clone().applyMatrix3(normalMatrix).normalize();

      return {
        contactPoint,
        contactNormal,
        penetrationDepth: penetration
      };
    });

    contacts.forEach((e) => {visualizeContact(e)});
    return contacts;
  }

  return [];
}



function getSphereBoxContact(A, B) {
  const sphere = A.representation.sphere.clone().applyMatrix4(A.representation.matrixWorld);
  const sphereCenterWorld = sphere.center;
  const radius = sphere.radius;

  // Clone and transform OBB to world space
  const obb = B.representation.box.clone().applyMatrix4(B.representation.matrixWorld);

  // Find closest point on the OBB to the sphere center
  const closestPoint = new THREE.Vector3();
  obb.clampPoint(sphereCenterWorld, closestPoint);

  // Compute distance and check for collision
  const delta = new THREE.Vector3().subVectors(sphereCenterWorld, closestPoint);
  const distSq = delta.lengthSq();

  if (distSq < radius * radius) {
    const dist = Math.sqrt(distSq);
    const penetrationDepth = radius - dist;

    const contactNormal = dist > 1e-6
      ? delta.clone().normalize()
      : new THREE.Vector3(0, 1, 0); // fallback normal if sphere is perfectly centered

    const contact = {
      contactPoint: closestPoint,
      contactNormal,
      penetrationDepth
    };

    visualizeContact?.(contact);
    return [contact];
  }

  return [];
}






/* Box */
function getBoxContact(A, B) {
  const obbA = A.representation.box.clone().applyMatrix4(A.representation.matrixWorld);
  const obbB = B.representation.box.clone().applyMatrix4(B.representation.matrixWorld);

  if (!obbA.intersectsOBB(obbB)) return [];

  // Extract local axes from rotation matrix
  const axesA = getOBBAxes(obbA);
  const axesB = getOBBAxes(obbB);

  const axes = [];

  // 15 axes for SAT:
  axes.push(...axesA); // 3 face normals from A
  axes.push(...axesB); // 3 face normals from B

  // 9 cross product axes between edges of A and B
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const axis = new THREE.Vector3().crossVectors(axesA[i], axesB[j]);
      if (axis.lengthSq() > 1e-6) {
        axis.normalize();
        axes.push(axis);
      }
    }
  }

  let minPenetration = Infinity;
  let contactNormal = new THREE.Vector3();

  for (const axis of axes) {
    const [minA, maxA] = projectOBB(obbA, axis);
    const [minB, maxB] = projectOBB(obbB, axis);

    const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);
    if (overlap <= 0) return []; // Separating axis found → no intersection

    if (overlap < minPenetration) {
      minPenetration = overlap;
      contactNormal.copy(axis);
      // Flip normal if it's pointing from B to A
      const centerDir = obbB.center.clone().sub(obbA.center);
      if (centerDir.dot(contactNormal) < 0) contactNormal.negate();
    }
  }

  // Approximate contact point: clamp A’s center to B
  const contactPoint = new THREE.Vector3();
  obbB.clampPoint(obbA.center, contactPoint);

  const contact = {
    contactPoint,
    contactNormal,
    penetrationDepth: minPenetration
  };

  visualizeContact(contact);
  return [contact];
}

function getOBBAxes(obb) {
  const axes = [];
  const rot = obb.rotation;
  axes.push(new THREE.Vector3(rot.elements[0], rot.elements[1], rot.elements[2])); // X-axis
  axes.push(new THREE.Vector3(rot.elements[3], rot.elements[4], rot.elements[5])); // Y-axis
  axes.push(new THREE.Vector3(rot.elements[6], rot.elements[7], rot.elements[8])); // Z-axis
  return axes;
}

function projectOBB(obb, axis) {
  const corners = getOBBCorners(obb);
  let min = axis.dot(corners[0]);
  let max = min;
  for (let i = 1; i < corners.length; i++) {
    const projection = axis.dot(corners[i]);
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  }
  return [min, max];
}

function getOBBCorners(obb) {
  const axes = getOBBAxes(obb);
  const corners = [];
  const center = obb.center;
  const hs = obb.halfSize;

  for (let dx of [-1, 1]) {
    for (let dy of [-1, 1]) {
      for (let dz of [-1, 1]) {
        const offset = new THREE.Vector3();
        offset.addScaledVector(axes[0], dx * hs.x);
        offset.addScaledVector(axes[1], dy * hs.y);
        offset.addScaledVector(axes[2], dz * hs.z);
        corners.push(center.clone().add(offset));
      }
    }
  }
  return corners;
}









function visualizeContact(contact, size = 0.02, color = 0xff0000) {
    const contactGroup = new THREE.Group();
  
    const { contactPoint, contactNormal, penetrationDepth } = contact;
  
      // Point Marker
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(size, 8, 8),
        new THREE.MeshBasicMaterial({ color })
      );
      sphere.position.copy(contactPoint);
      contactGroup.add(sphere);
  
      // Normal Line
      const normalLine = new THREE.ArrowHelper(
        contactNormal,
        contactPoint,
        Math.max(penetrationDepth * 1.2, 0.5),
        0x00ff00 // green
      );
      contactGroup.add(normalLine);
  
    
    // Optionally, clear old ones first
    const old = scene.getObjectByName('ContactVisualization');
    if (old) scene.remove(old);
    
  
    contactGroup.name = 'ContactVisualization';
    scene.add(contactGroup);
}