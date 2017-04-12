var TWEEN = require("tween.js");
var animitter = require("animitter");

var mathext = require("./../MathExt.js");

var material, mesh;


function createSphere(pos) {
    var geometry = new THREE.SphereGeometry(0.05, 8, 8);

    material = new THREE.ShaderMaterial({

        uniforms: {
            time: {
                value: 0.1
            },
            resolution: {
                value: new THREE.Vector2()
            }
        },
        vertexShader: require('../Shaders.js').get('default.vp'),
        fragmentShader: require('../Shaders.js').get('default.fp'),
        //visible: true
        side: THREE.DoubleSide
    });

    //var material = new THREE.MeshBasicMaterial({color: 0xff00ff, wireframe: false });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pos);


    var tweenIn = new TWEEN.Tween(mesh.position).to({
        z: pos.z - 0.5
    }, 1000).easing(TWEEN.Easing.Cubic.Out);

    var tweenOut = new TWEEN.Tween(mesh.position).to({
        z: pos.z + 0.0
    }, 1000).easing(TWEEN.Easing.Cubic.In);

    tweenIn.chain(tweenOut);
    tweenOut.chain(tweenIn);
    //tweenIn.repeat(Infinity);
    tweenIn.start();

    return mesh;
}


module.exports = {
    init: function() {
        for (let i = 0; i < 100; i += 1) {

            let radiusMin = 1;
            let radiusMax = 5;
            let radius = mathext.randBetween(radiusMin, radiusMax);

            let theta = mathext.randBetween(0.0, -Math.PI);
            let phi = mathext.randBetween(Math.PI * 0.3, Math.PI * 0.7);
            let pos = mathext.sphericalCoord(theta, phi, radius);

            let sphere = createSphere(pos);

            var scene = require('./Scene.js');
            scene.obj.add(sphere);
        }
    },

    start: function() {

    },
};