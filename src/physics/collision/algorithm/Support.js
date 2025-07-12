import * as THREE from "three";

const _direction = new THREE.Vector3();
const _vertex = new THREE.Vector3();
const _maxPoint = new THREE.Vector3();

export function getSupport(shape1, shape2, d) {
	_direction.copy(d).normalize();

	const supportA = findFurthestPoint(shape1, _direction);
	const supportB = findFurthestPoint(shape2, _direction.clone().negate());

	return {
		point: supportA.clone().sub(supportB),
		supportA: supportA.clone(),
		supportB: supportB.clone(),
	};
}

function findFurthestPoint(shape, direction) {
	let maxDistance = -Infinity;

	for (let i = 0; i < shape.vertices.length; i++) {
		_vertex.copy(shape.vertices[i]);
		const distance = _vertex.dot(direction);
		if (distance > maxDistance) {
			maxDistance = distance;
			_maxPoint.copy(_vertex);
		}
	}
	return _maxPoint.clone();
}
