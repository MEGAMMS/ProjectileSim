import * as THREE from "three";
import * as MathUtils from "three/src/math/MathUtils";

import {renderer,textureLoader,modelLoader,scene,camera} from "./lib/renderer/Initialize";
//import "./lib/renderer/Skybox.js";

import physicsEngine from "./lib/physics/PhysicsEngine.js";
import RigidBody from "./lib/physics/RigidBody.js";








async function main () {
    camera.position.set(0,8,8);
    


    /* Rendering */
    /*
    const terrainModel = await modelLoader.loadAsync('assets/model/terrain/scene.gltf');
    const terrain3D = terrainModel.scene;
    terrain3D.scale.set(1,1,1);
    terrain3D.traverse(function (child) {
    if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.side = THREE.BackSide;
    }
    });
    */

    
    const terrain3D = new THREE.Mesh(
        new THREE.BoxGeometry(10,3,10),
        new THREE.MeshBasicMaterial({color: 0xFF0000})
    );
    
    


    /*
    const shellModel = await modelLoader.loadAsync('assets/model/cannonball/scene.gltf');
    const shell3D = shellModel.scene;
    shell3D.scale.set(5,5,5);
    shell3D.traverse(function (child) {
    if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.side = THREE.BackSide;
    }
    });
    */


    const sphere3D = new THREE.Mesh(
        new THREE.SphereGeometry(0.25),
        new THREE.MeshBasicMaterial({color: 0x0000FF})
    );

    const box3D = new THREE.Mesh(
        new THREE.BoxGeometry(0.25,0.25,0.25),
        new THREE.MeshBasicMaterial({color: 0xFF0000})
    );


    
    /* Physics */
    const terrain = new RigidBody(terrain3D,0.0,0.5,0.8,"box");
    physicsEngine.addBody(terrain);

    

    
    window.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 's':
                const sphere = new RigidBody(sphere3D,1,0.5,0.8,"sphere");
                sphere.representation.position.set(0,6,0);
                physicsEngine.addBody(sphere);
                break;
            case 'b':
                const box = new RigidBody(box3D,1,0.5,0.8,"box");
                box.representation.position.set(0,6,0);
                physicsEngine.addBody(box);
                break;
            default:
                break;
        }
    });


    camera.lookAt(new THREE.Vector3(0,0,0));
    camera.updateProjectionMatrix();

    const clock = new THREE.Clock();
    function animate(time) {
        terrain.representation.rotateX(MathUtils.degToRad(0.05));
        //camera.lookAt(shell.representation.position);
        //camera.updateProjectionMatrix();

        //shell.addForce(new THREE.Vector3(1000, 0, 0));

        const delta = clock.getDelta();
        physicsEngine.update(delta/2);

        renderer.render( scene, camera );
    }
    renderer.setAnimationLoop( animate );
}
main();