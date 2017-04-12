var TWEEN = require("tween.js");
var animitter = require("animitter");

var geometry, material, mesh;

module.exports = {
    init: function() {

        let scene = require("./Scene.js");
        let renderer = require("./../App.js").renderer;

        let planeWidth = 200;

        material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            shading: THREE.SmoothShading,
            //map: texture
        });

        var loader = new THREE.TextureLoader();
        loader.load('res/img/checker.png', function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(planeWidth / 2, planeWidth / 2);
            texture.anisotropy = renderer.getMaxAnisotropy();

            material.map = texture;
            material.needsUpdate = true;
        });

        geometry = new THREE.PlaneGeometry(planeWidth, planeWidth);

        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -1.0;
        scene.obj.add(mesh);
    },
};