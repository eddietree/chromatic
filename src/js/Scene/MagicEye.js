var TWEEN = require("tween.js");
var animitter = require("animitter");

var mathext = require("./../MathExt.js");

var material, mesh;

module.exports = {
    init: function() {

        function makeSphere( radius, pos, color) {
             var geometry = new THREE.SphereGeometry(radius, 32, 32);

            material = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.BackSide 
            });

            mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(pos);

            var scene = require('./Scene.js');
            scene.obj.add(mesh);
        }

        makeSphere(0.15, new THREE.Vector3(0.0,0.0,-20.0), 0xffffff);
        makeSphere(0.3, new THREE.Vector3(0.0,0.0,-20.0), 0xff33ff);
        makeSphere(0.45, new THREE.Vector3(0.0,0.0,-20.0), 0x333333);
        makeSphere(0.6, new THREE.Vector3(0.0,0.0,-20.0), 0xff33ff);
    },

    start: function() {

    },
};