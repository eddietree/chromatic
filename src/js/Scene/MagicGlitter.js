var TWEEN = require("tween.js");
var animitter = require("animitter");

var mathext = require("./../MathExt.js");
var signal = require("./Signal.js");

let obj3d = new THREE.Object3D();
var material;
var numParticles = 1024;

module.exports = {

    obj3d : obj3d,

    setPulsePosZ: function(val) {
        if ( typeof material === 'undefined' ) {
            return;
        }
        material.uniforms.uPulsePosZ.value = val;
    },

    init: function() {

        material = new THREE.ShaderMaterial({

            uniforms: {
                uTime: {value: 0.1 },
                uPulsePosZ: {value: 0.0 },
                uCamPos: {value: new THREE.Vector3() },
                uTexRainbow: {value: require('../Textures.js').get('rainbow') },
            },
            vertexShader: require('../Shaders.js').get('magicGlitter.vp'),
            fragmentShader: require('../Shaders.js').get('magicGlitter.fp'),
            transparent: true,
            depthWrite: false,
            depthTest: false,

            //blending: THREE.CustomBlending,
            //blendEquation: THREE.SubtractEquation,
            //blendSrc: THREE.ZeroAlphaFactor,
            //blendDst: THREE.OneFactor,
        });


        //material.blending = THREE.CustomBlending;
        material.blendEquation = THREE.SubtractEquation;
        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.ZeroFactor;
        //console.log(material.blendEquation);

        let positions = [];
        let randData = [];

        for (let i = 0; i < numParticles; i += 1) {

            var x = mathext.randBetween(0.0, 1.0);
            var y = mathext.randBetween(0.0, 1.0);
            var z = mathext.randBetween(0.0, 1.0);

            positions.push(x);
            positions.push(y);
            positions.push(z);

            randData.push(mathext.randBetween(0.0, 1.0));
            randData.push(mathext.randBetween(0.0, 1.0));
            randData.push(mathext.randBetween(0.0, 1.0));
        }

        let geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(randData), 3));

        let mesh = new THREE.Points(geometry, material);
        mesh.frustumCulled = false;
        obj3d.add(mesh);

        /*let lines = new THREE.LineSegments(geometry, material);
        lines.frustumCulled = false;
        obj3d.add(lines);*/

        var scene = require('./Scene.js');
        scene.obj.add(obj3d);

        var controlVR = require("./../CameraControlVR.js");

        var loop = animitter(function(deltaTime, elapsedTime, frameCount) {
            let time = elapsedTime * 0.001;
            let speed = signal.get("soothingLight", 1.0, 2.0);
            let touchPulsate = signal.get("hit_touchStart");

            material.uniforms.uTime.value += (speed+touchPulsate*5.0) * deltaTime*0.001;
            material.uniforms.uCamPos.value.copy(controlVR.getCamPos());
        }).start();
    },

    start: function() {

    },
};