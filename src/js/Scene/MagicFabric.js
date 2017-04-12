var TWEEN = require("tween.js");
var animitter = require("animitter");

var mathext = require("./../MathExt.js");
var signal = require("./Signal.js");
var guihelper = require("../GuiHelper.js");

let obj3d = new THREE.Object3D();
var material, mesh;
var guiParams = guihelper.createGuiParamObj("Rainbow - Base");
var numLayersFreq = 3;

module.exports = {

    obj3d : obj3d,

    init: function() {

        var settings = require('./../Settings.js');

        function initGui() {
            var app = require('./../App.js');

            function addGuiUniformFloat(titleName, uniformName, minVal, maxVal) {
                guihelper.addGuiFloat(guiParams, titleName, material.uniforms[uniformName], 'value', minVal, maxVal );
            }

            function addGuiUniformColor(titleName, uniformName) {
                guihelper.addGuiColor(guiParams, titleName, material.uniforms[uniformName], 'value');
            }

            function addGuiUniformVectorComponent(titleName, uniformName, vec4Component, minVal, maxVal) {
                guihelper.addGuiFloat(guiParams, titleName, material.uniforms[uniformName].value, vec4Component, minVal, maxVal );
            }

            function addGuiFreq(index) {
                let uniformName = "uFreq" + index;
                let uniformVal = material.uniforms[uniformName].value;

                // freq, movement-speed, rainbow-freq, alpha
                let guiFreqParam = guihelper.createGuiParamObj("Rainbow - Layer " + index);
                let baseFreqVal = material.uniforms[uniformName].value.clone();

                function addFreqSlider(titleName, vec4Component, minVal, maxVal) {
                    guihelper.addGuiFloat(guiFreqParam, titleName, material.uniforms[uniformName].value, vec4Component, minVal, maxVal );
                }

                addFreqSlider("Frequency", 'x', 0.0, 20.0);
                addFreqSlider("Speed", 'y', -10.0, 10.0);
                addFreqSlider("Rainbow Density", 'z', 0.0, 50.0);
                addFreqSlider("Alpha", 'w', 0.0, 1.0);

                // add reset button
                guihelper.addResetButton(guiFreqParam);
            }

            // core elems
            guihelper.addResetButton(guiParams);
            addGuiUniformFloat("Global Alpha", 'uGlobalAlpha', 0.0, 2.0);
            addGuiUniformFloat("Base Radius", 'uBaseRadius', -10.0, 10.0);
            addGuiUniformFloat("Base Speed", 'uBaseSpeed', -5.0, 5.0);
            addGuiUniformFloat("Eye Sharpness", 'uEyeSharpness', 0.0, 50.0);
            addGuiUniformFloat("Eye Z-Depth", 'uEyeDepth', -50.0, 200.0);
            addGuiUniformFloat("Eye Curve Coeff", 'uEyeCurveCoeff', 1.0, 100.0);
            addGuiUniformFloat("Pulse Z-Pos", 'uPulsePosZ', -20.0, 80.0);
            addGuiUniformFloat("Colorize", 'uColorize', 0.0, 2.0);

            // soothing light
            addGuiUniformColor('Soothing Color', 'uSoothingColor' );
            addGuiUniformVectorComponent('Soothing Freq', 'uSoothingLight', 'x', 0.0, 2.0);
            addGuiUniformVectorComponent('Soothing Speed', 'uSoothingLight', 'y', -20.0, 20.0);
            addGuiUniformVectorComponent('Soothing Z-Freq', 'uSoothingLight', 'w', 1.0, 1000.0);

            // soothing light
            addGuiUniformVectorComponent('Folding Freq', 'uFolding', 'x', 0.0, 30.0);
            addGuiUniformVectorComponent('Folding Amplitude', 'uFolding', 'y', 0.0, 0.2);
            addGuiUniformVectorComponent('Folding Speed', 'uFolding', 'z', -10.0, 10.0);
            
            // freq
            for( let i =0; i < numLayersFreq; i+=1) {
                addGuiFreq(i);
            }
        }

        material = new THREE.ShaderMaterial({

            uniforms: {
                uBaseSpeed: {value: 1.0 },
                uBaseRadius: {value: 4.0 },
                uGlobalAlpha: {value: 1.0 },

                // Freq Layers: [freq, movement-speed, rainbow-freq, alpha]
                uFreq0: {value: new THREE.Vector4(3.0, 2.0, 2.0, 0.9) },
                uFreq1: {value: new THREE.Vector4(9.0, -2.0, 10.0, 0.6) },
                uFreq2: {value: new THREE.Vector4(4.0, 10.0, 25.0, 0.4) },

                // soothing-light: [freq, speed, time, z-freq]
                uSoothingColor: {value: new THREE.Vector4(0.2,0.2,0.4, 1.0) },
                uSoothingLight: {value: new THREE.Vector4(0.5, -1.0, 0.0, 7.0) }, 

                // folding: [freq, amplitude, speed, time]
                uFolding: {value: new THREE.Vector4(20.0, 0.0, 1.0, 7.0) }, 

                // other
                uTime: {value: 0.1 },
                uEyeDepth: {value: 75.0 },
                uEyeCurveCoeff: {value: 60.0 },
                uEyeSharpness: {value: 30.0 },
                uPulsePosZ: {value: 0.0 },
                uColorize: {value: 0.15 },
                uCamPos: {value: new THREE.Vector3() },
                uCamFwdDir: {value: new THREE.Vector3(0.0,0.0,-1.0) },
                uBaseColor: {value: new THREE.Color(0.0, 0.0, 0.0) },
                uTexRainbow: {value: require('../Textures.js').get('rainbow') },
            },
            vertexShader: require('../Shaders.js').get('magicFabric.vp'),
            fragmentShader: require('../Shaders.js').get('magicFabric.fp'),
            side: THREE.DoubleSide,
        });

        var controlVR = require("./../CameraControlVR.js");


        var loop = animitter(function(deltaTime, elapsedTime, frameCount) {
            material.uniforms.uTime.value += deltaTime * 0.001 * material.uniforms.uBaseSpeed.value;
            material.uniforms.uSoothingLight.value.z += deltaTime * 0.001 * material.uniforms.uSoothingLight.value.y;
            material.uniforms.uBaseColor.value.setHex(settings.clearColor);

            material.uniforms.uCamPos.value.copy(controlVR.getCamPos());
            //material.uniforms.uCamFwdDir.value.copy(controlVR.getCamForwardDir());
        }).start();

        
        var geometry = new THREE.SphereGeometry(1, 100, 200);
        mesh = new THREE.Mesh(geometry, material);
        obj3d.add(mesh);

        var scene = require('./Scene.js');
        scene.obj.add(obj3d);
        
        initGui();
    },

    start: function() {

        let loopPulse = null;

        function doAutomation() {

            signal.map('eyeDepth', material.uniforms['uEyeSharpness'], 'value', 80.0, 30.0);
            signal.map('eyeDepth', material.uniforms['uEyeDepth'], 'value', -1.0, 100.0);
            signal.map('eyeDepth', material.uniforms['uBaseRadius'], 'value', 5.0, 0.8);
            //signal.map('eyeDepth', material.uniforms['uGlobalAlpha'], 'value', 0.0, 1.0);
            signal.map('base', material.uniforms['uBaseSpeed'], 'value', 0.5, 1.5);
            signal.map('ringPulse', material.uniforms['uPulsePosZ'], 'value', -20.0, 100.0);
            signal.map('soothingLightZFreq', material.uniforms['uSoothingLight'].value, 'w', 500.0, 550.0);
            
            //signal.map('waveDistort', material.uniforms['uFolding'].value, 'x', 1.0, 20.0);
            //signal.map('soothingLightZFreq', material.uniforms['uFolding'].value, 'y', 0.0, 0.2);
        }

        doAutomation();
    },
};