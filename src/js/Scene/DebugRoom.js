var TWEEN = require("tween.js");
var animitter = require("animitter");

const boxWidth = 15;

module.exports = {
    init: function() {

    	var scene = require('./Scene.js');
        
        var loader = new THREE.TextureLoader();
        loader.load('res/img/checker.png', onTextureLoaded);

        function onTextureLoaded(texture) {

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(boxWidth/2, boxWidth/2);
            var geometry = new THREE.BoxGeometry(boxWidth, boxWidth, boxWidth);
            var material = new THREE.MeshBasicMaterial({
                map: texture,
                color: 0xffffff,
                side: THREE.BackSide
            });
            var skybox = new THREE.Mesh(geometry, material);
            scene.obj.add(skybox);
        }
    },
};