var TWEEN = require("tween.js");
var animitter = require("animitter");

var geometry, material, mesh;

module.exports = {
    init: function() {

        geometry = new THREE.BufferGeometry();

        material = new THREE.ShaderMaterial({

            uniforms: {
                uTime: {
                    value: 0.1
                },
                uCamPos: {
                    value: new THREE.Vector3()
                }
            },

            vertexShader: require('../Shaders.js').get('magicRings.vp'),
            fragmentShader: require('../Shaders.js').get('magicRings.fp'),
            side: THREE.DoubleSide,

            transparent: true,
            //blendSrc: THREE.OneFactor,
            //blendDst: THREE.OneFactor,
        });

        const numRings = 1;
        const numVertsPerRing = 100;

        const numVertsTotal = numRings * numVertsPerRing;

        let positions = [];
        let colors = [];
        let indices = [];

        for (let iRing = 0; iRing < numRings; iRing += 1) {
            for (let iRingVert = 0; iRingVert < numVertsPerRing; iRingVert += 1) {

                var vertIndex = iRing * numVertsPerRing + iRingVert;

                var x = iRing / (numRings - 1.0);
                var y = iRingVert / (numVertsPerRing - 1.0);
                var z = vertIndex / (numVertsTotal - 1.0);

                positions.push(x);
                positions.push(y);
                positions.push(z);

                colors.push(1.0);
                colors.push(1.0);
                colors.push(1.0);
            }
        }

        // index buffer
        for (let i = 0; i < numVertsTotal-1; i += 1) {
            indices.push(i);
            indices.push(i+1);
        }
        //geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        //geometry.computeBoundingSphere();

        //mesh = new THREE.LineSegments(geometry, material);
        mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        mesh.drawMode = THREE.TriangleFanDrawMode ;

        var loop = animitter(function(deltaTime, elapsedTime, frameCount) {
            material.uniforms.uTime.value = elapsedTime;
            //material.uniforms.uCamPos.value.copy(controlVR.getCamPos());
        }).start();

        let scene = require("./Scene.js");
        scene.obj.add(mesh);

        var app = require("./../App.js");
    },
};