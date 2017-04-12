var TWEEN = require("tween.js");
var animitter = require("animitter");

var geometry, material, mesh;

module.exports = {
    init: function() {

        let scene = require("./Scene.js").obj;

        material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            shading: THREE.SmoothShading,

            transparent: true,
            blending: THREE.CustomBlending,
            blendEquation: THREE.MaxEquation,
        });

        material.needsUpdate = true;
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = -1.0;

        scene.add(mesh);
    },
};