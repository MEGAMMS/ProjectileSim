import * as THREE from "three";
import { getSupport } from "./Support";


///////////////////////////////////
// GJK algorithm
///////////////////////////////////
const MAX_ITERATIONS = 32;
const EPSILON = Number.EPSILON;


export function GJK(shape1, shape2)
{
	// Get initial support point in any direction
	let direction = new THREE.Vector3(1, 0, 0);
	const support = getSupport(shape1, shape2, direction);

	const simplex = [support];

	// New direction is towards the origin
	direction = support.point.clone().negate();

	for (let iterations = 0 ; iterations<MAX_ITERATIONS ;++iterations) {
		const support = getSupport(shape1, shape2, direction);
		
		if (support.point.dot(direction) <= EPSILON) {
			return null; // no collision
		}
		
		// Insert at the beginning of the simplex array
		simplex.unshift(support);
		
		// Handle simplex (2, 3, or 4 points) and update direction
		if (nextSimplex(simplex, direction)) {
			return simplex;
		}
	}

	console.warn("Out Of Iterations !");
	return null;
}



function nextSimplex(simplex, direction) {
	switch (simplex.length) {
		case 2:
		return handleLine(simplex, direction);
		case 3:
		return handleTriangle(simplex, direction);
		case 4:
		return handleTetrahedron(simplex, direction);
	}

	// Should never happen
	console.warn("GJK Failure")
	return false;
}



function handleLine(simplex, direction) {
	const A = simplex[0];
	const B = simplex[1];

	const a = A.point.clone();
	const b = B.point.clone();

	const ab = new THREE.Vector3().subVectors(b, a);
	const ao = a.clone().negate();

	if (sameDirection(ab, ao)) {
		const abXao = new THREE.Vector3().crossVectors(ab, ao);
		direction.copy(new THREE.Vector3().crossVectors(abXao, ab));
	} else {
		simplex.splice(1); // Keep only point A
		direction.copy(ao);
	}

	return false;
}



function handleTriangle(simplex, direction) {
	const A = simplex[0];
	const B = simplex[1];
	const C = simplex[2];
	
	const a = A.point.clone();
	const b = B.point.clone();
	const c = C.point.clone();

	const ab = new THREE.Vector3().subVectors(b, a);
	const ac = new THREE.Vector3().subVectors(c, a);
	const ao = a.clone().negate();

	const abc = new THREE.Vector3().crossVectors(ab, ac);

	const acPerp = new THREE.Vector3().crossVectors(abc, ac);
	if (sameDirection(acPerp, ao)) {
		if (sameDirection(ac, ao)) {
			simplex.splice(0, simplex.length, A, C);
			direction.copy(
				new THREE.Vector3().crossVectors(
				new THREE.Vector3().crossVectors(ac, ao),
				ac
				)
			);
		}
		else {
			simplex.splice(0, simplex.length, A, B);
			return handleLine(simplex, direction);
		}
	}
	else {
		const abPerp = new THREE.Vector3().crossVectors(ab, abc);
		if (sameDirection(abPerp, ao)) {
			simplex.splice(0, simplex.length, A, B);
			return handleLine(simplex, direction);
		}
		else {
			if (sameDirection(abc, ao)) {
				direction.copy(abc);
			} else {
				simplex.splice(0, simplex.length, A, C, B);
				direction.copy(abc).negate();
			}
		}
	}

	return false;
}



function handleTetrahedron(simplex, direction) {
	const A = simplex[0];
	const B = simplex[1];
	const C = simplex[2];
	const D = simplex[3];

	const a = A.point.clone();
	const b = B.point.clone();
	const c = C.point.clone();
	const d = D.point.clone();

	const ab = new THREE.Vector3().subVectors(b, a);
	const ac = new THREE.Vector3().subVectors(c, a);
	const ad = new THREE.Vector3().subVectors(d, a);
	const ao = a.clone().negate();

	const abc = new THREE.Vector3().crossVectors(ab, ac);
	const acd = new THREE.Vector3().crossVectors(ac, ad);
	const adb = new THREE.Vector3().crossVectors(ad, ab);

	if (sameDirection(abc, ao)) {
		simplex.splice(0, simplex.length, A, B, C);
		return handleTriangle(simplex, direction);
	}

	if (sameDirection(acd, ao)) {
		simplex.splice(0, simplex.length, A, C, D);
		return handleTriangle(simplex, direction);
	}

	if (sameDirection(adb, ao)) {
		simplex.splice(0, simplex.length, A, D, B);
		return handleTriangle(simplex, direction);
	}

	return true; // Origin is inside the tetrahedron
}



function sameDirection(direction, ao) {
	return direction.dot(ao) > EPSILON;
}