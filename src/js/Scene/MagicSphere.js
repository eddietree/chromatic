var TWEEN = require("tween.js");
var animitter = require("animitter");

var mathext = require("./../MathExt.js");

var material, mesh;


function createSphere(pos) {
    var geometry = new THREE.SphereGeometry(3, 64, 64);

    material = new THREE.ShaderMaterial({

        uniforms: {
            uTime: {
                value: 0.1
            },
            uCamPos: {
                value: new THREE.Vector3()
            }
        },
        vertexShader: require('../Shaders.js').get('magicSphere.vp'),
        fragmentShader: require('../Shaders.js').get('magicSphere.fp'),
        //visible: true
        side: THREE.DoubleSide
    });

    var controlVR = require("./../CameraControlVR.js");

    var loop = animitter(function(deltaTime, elapsedTime, frameCount) {
        material.uniforms.uTime.value = elapsedTime;
        material.uniforms.uCamPos.value.copy(controlVR.getCamPos());
    }).start();

    //var material = new THREE.MeshBasicMaterial({color: 0xff00ff, wireframe: false });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);

    return mesh;
}


module.exports = {
    init: function() {

        let sphere = createSphere(new THREE.Vector3(0.0, 0.0, 0.0));

        var scene = require('./Scene.js');
        scene.obj.add(sphere);
    },

    start: function() {

    },
};