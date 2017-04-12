var TWEEN = require("tween.js");
var animitter = require('animitter');

var mathext = require("../MathExt.js");
var settings = require('./../Settings.js');
var guihelper = require('./../GuiHelper.js');
var background = require('./Background.js');
var signal = require('./Signal.js');
var audiogen = require('./AudioGen.js');

let params = {
    gazeCharge: 0.0,
    gazeLocked: 0.0,
    gazeLockTime: 0.0,
    gazeLevel: 0,
    currState: "",
    gazeChargePaused: false,
};

let gazeChargeParams = {

    splash: {
        gazeThreshold: 0.0,
        gazeChargeUpSpeedMin: 0.0,
        gazeChargeUpSpeedMax: 0.0,
        gazeChargeDownSpeed: 0.0,
    },

    unlock: {
        gazeThreshold: 0.95,
        gazeChargeUpSpeedMin: 0.2,
        gazeChargeUpSpeedMax: 0.2,
        gazeChargeDownSpeed: 0.3,
    },

    baby: {
        gazeThreshold: 0.0,
        gazeChargeUpSpeedMin: 0.04,
        gazeChargeUpSpeedMax: 0.05,
        gazeChargeDownSpeed: 0.3,
    },

    tunnel: {
        gazeThreshold: 0.0,
        gazeChargeUpSpeedMin: 0.025,
        gazeChargeUpSpeedMax: 0.03,
        gazeChargeDownSpeed: 0.3,
    },

    prism: {
        gazeThreshold: 0.0,
        gazeChargeUpSpeedMin: 0.025,
        gazeChargeUpSpeedMax: 0.035,
        gazeChargeDownSpeed: 0.3,
    },
};

let gazeChargeParamsCurr = {
    gazeThreshold: 0.0,
    gazeChargeUpSpeed: 0.0,
    gazeChargeDownSpeed: 0.0,
};

function setGazeParams(key) {

    let goalParams = gazeChargeParams[key];

    gazeChargeParamsCurr.gazeThreshold = goalParams.gazeThreshold;
    gazeChargeParamsCurr.gazeChargeUpSpeed = mathext.randBetween(goalParams.gazeChargeUpSpeedMin, goalParams.gazeChargeUpSpeedMax);
    gazeChargeParamsCurr.gazeChargeDownSpeed = goalParams.gazeChargeDownSpeed;

    //console.log(gazeChargeParamsCurr.gazeChargeUpSpeed);
}

let fsm = null;

let loopTouch = animitter(function(deltaTime, elapsedTime, frameCount) {
    signal.pulsate("hit_touchStart", 0.3);
});

function onTouchStart(event) {
    background.pingColor(0x222222, 1.0);
    signal.pulsate("hit_touchStart");
    loopTouch.start();
}

function onTouchEnd(event) {
    loopTouch.stop();
}

window.addEventListener("touchstart", (event) => {
    onTouchStart(event);
}, false);

window.addEventListener("touchend", (event) => {
    onTouchEnd(event);
}, false)

window.addEventListener('keydown', function(event) {
    if (event.code === "KeyT") {
        onTouchStart(event);
    }
}, false);

window.addEventListener('keyup', function(event) {
    if (event.code === "KeyT") {
        onTouchEnd(event);
    }
}, false);

function createFSM() {

    let states = {};
    let currState = null;

    return {

        changeTo: function(stateName) {

            if (currState != null) {

                // ignore if same
                if (currState.name == stateName) {
                    return;
                }

                currState.onEnd();
            }

            params.currState = stateName;
            let prevState = currState;
            let nextState = states[stateName];


            currState = nextState;
            currState.onBegin();
            currState.elapsedTime = 0.0;
        },

        init: function() {
            states['splash'] = createStateSplash();
            states['unlock'] = createStateUnlock();
            states['baby'] = createStateBaby();
            states['tunnel'] = createStateTunnel();
            states['prism'] = createStatePrism();
        },

        start: function() {
            if (settings.doSplashSeq) {
                this.changeTo('splash');
                //this.changeTo('tunnel');
            } else {
                this.changeTo('unlock');
            }

            let loop = animitter(function(deltaTime, elapsedTime, frameCount) {
                if (currState != null) {
                    let dt = deltaTime * 0.001;
                    currState.onUpdate(dt);
                    currState.elapsedTime += dt;
                }
            }).start();
        },

        onEnterNextGazeLevel: function(gazeLevel) {

            if (currState !== null) {
                currState.onEnterNextGazeLevel(currState);
            }
        },

        onHitNote: function(noteId) {
            if (currState !== null) {
                currState.onHitNote(noteId);
            }
        },

        getCurrState : function() {
            return currState;
        },

        getStateName : function() {
            return currState.name;
        },
    };
}

function createState(stateName) {
    let signals = [];
    let tweens = [];

    return {
        name: stateName,
        elapsedTime: 0.0,
        onBegin: function() {},
        onEnd: function() {},
        onUpdate: function(dt) {},
        onEnterNextGazeLevel: function(gazeLevel) {},
        onHitNote: function(noteId) {},
        
        clearSignalsTweens: function() {
            signal.removeByIdArray(signals);
            signals.length = 0;

            for( let i = 0; i < tweens.length; i+=1) {
                tweens[i].stop();
            }
            tweens.length = 0;

            //TWEEN.removeAll();
        },

        signals: signals,
        tweens: tweens,
    };
}

function makePrismTweenUniformVecComponent(state, prismLayerName, uniformName, tweenParams, time) {
    let sceneObjs = require('./Scene.js').sceneObjs;
    let prism = sceneObjs['MagicPrism'];
    let material = prism.layers[prismLayerName].material;

    let newTween = new TWEEN.Tween(material.uniforms[uniformName].value);
    newTween.to(tweenParams, time);

    state.tweens.push(newTween);
    return newTween;
}

function makePrismTweenUniform(state, prismLayerName, uniformName, tweenParams, time) {
    let sceneObjs = require('./Scene.js').sceneObjs;
    let prism = sceneObjs['MagicPrism'];
    let material = prism.layers[prismLayerName].material;

    let newTween = new TWEEN.Tween(material.uniforms[uniformName]);
    newTween.to(tweenParams, time);

    state.tweens.push(newTween);
    return newTween;
}

function createStateSplash() {
    let state = createState('splash');
    let sceneObjs = require('./Scene.js').sceneObjs;
    let prism = sceneObjs['MagicPrism'];

    state.onBegin = function() {

        audiogen.enableSynths(['pad0']);
        setGazeParams('splash');

        //sceneObjs['MagicFabric'].obj3d.visible = false;
        sceneObjs['IntroSplash'].obj3d.visible = true;

        prism.layers['bg'].visible = false;
        prism.layers['origami'].visible = false;
        prism.layers['lines'].visible = false;
        prism.layers['core'].visible = false;

        // reset core
        //prism.layers['core'].resetParams();
        prism.layers['core'].material.uniforms['uTubeParams'].value.x = 0.0;
        prism.layers['core'].material.uniforms['uTubeParams'].value.y = 2.0;
        prism.layers['core'].material.uniforms['uTubeParams'].value.z = 0.0;
        //prism.layers['core'].position.set(0.0,0.0,0.0);
    };

    state.onEnd = function() {

        var core = prism.layers['core'];
        core.scale.set(0,1,0);

        let tween = new TWEEN.Tween(prism.layers['core'].scale).to({
            x: 1.0,
            z: 1.0
        }, 3000).easing(TWEEN.Easing.Cubic.InOut).start();
    },

    state.onEnterNextGazeLevel = function(gazeLevel) {
    };

    return state;
}

function createStateUnlock() {
    let state = createState('unlock');
    let sceneObjs = require('./Scene.js').sceneObjs;
    let prism = sceneObjs['MagicPrism'];

    state.onBegin = function() {

        audiogen.enableSynths(['pad0']);
        setGazeParams('unlock');

        //settings.clearColor = 0x444444;
        //background.fadeTo(0x000000, 1.0);

        //sceneObjs['MagicPrism'].obj3d.visible = false;
        //sceneObjs['MagicFabric'].obj3d.visible = false;

        prism.layers['bg'].visible = false;
        prism.layers['origami'].visible = false;
        prism.layers['lines'].visible = false;
        prism.layers['core'].visible = true;

        //state.signals.push(signal.map("gazeCharge", prism.layers['core'].material.uniforms['uTubeParams'].value, 'x', 10.0, 0.0)); // connect
        state.signals.push(signal.map("gazeCharge", prism.layers['core'].material.uniforms['uSwayParams'].value, 'z', 1.0, 4.6)); // connect
        state.signals.push(signal.map("gazeCharge", prism.layers['core'].material.uniforms['uTubeParams'].value, 'y', 0.0, 2.0)); // connect
        state.signals.push(signal.map("soothingLight", prism.layers['core'].position, 'z', 0.0, 20.0));
        //prism.layers['core'].position.z = 10.0;
    };

    state.onEnterNextGazeLevel = function(gazeLevel) {

        //let tween = new TWEEN.Tween(prism.layers['core'].position).to({z:0.0}, 1000).easing(TWEEN.Easing.Elastic.Out).start();

        state.clearSignalsTweens();
        fsm.changeTo("baby");
    };

    return state;
}

function setPrismBaseColor() {
    let sceneObjs = require('./Scene.js').sceneObjs;
    let prism = sceneObjs['MagicPrism'];

    // fade color
    let hue = Math.random();

    //  prism colo tint
    let prismColorTint = new THREE.Color();
    prismColorTint.setHSL(hue, 0.4, 0.8);

    prism.layers['bg'].material.uniforms['uColorTint'].value.set(prismColorTint.r, prismColorTint.g, prismColorTint.b, 1.0);
    prism.layers['origami'].material.uniforms['uColorTint'].value.set(prismColorTint.r, prismColorTint.g, prismColorTint.b, 1.0);
    prism.layers['core'].material.uniforms['uColorTint'].value.set(prismColorTint.r, prismColorTint.g, prismColorTint.b, 1.0);
}

function createStateBaby() {
    let state = createState('baby');
    let sceneObjs = require('./Scene.js').sceneObjs;
    let prism = sceneObjs['MagicPrism'];

    state.onBegin = function() {

        audiogen.enableSynths(['pad0', 'lead']);

        setPrismBaseColor();

        setGazeParams('baby');
        //settings.clearColor = 0x111111;
        //background.fadeTo(0x000000, 1.0);

        //sceneObjs['MagicPrism'].obj3d.visible = false;
        //sceneObjs['MagicFabric'].obj3d.visible = false;

        prism.layers['bg'].visible = false;
        prism.layers['origami'].visible = false;
        prism.layers['lines'].visible = false;
        prism.layers['core'].visible = true;

        state.signals.push(signal.map("soothingLight", prism.layers['core'].material.uniforms['uSwayParams'].value, 'y', 0.05, 0.13));
        state.signals.push(signal.map("gazeCharge", prism.layers['core'].material.uniforms['uTubeParams'].value, 'y', 2.0, 0.2)); // connect
        state.signals.push(signal.map("soothingLight", prism.layers['core'].position, 'z', 0.0, 20.0));
    };

    state.onUpdate = function(dt) {

        let core = prism.layers['core'];
        let coreMat = core.material;
    };

    state.onEnterNextGazeLevel = function(gazeLevel) {

        let tween = new TWEEN.Tween(prism.layers['core'].position).to({
            z: 0.0
        }, 1000).start();

        state.clearSignalsTweens();
        fsm.changeTo("tunnel");
    };

    return state;
}

function createStateTunnel() {
    let state = createState('tunnel');
    let sceneObjs = require('./Scene.js').sceneObjs;
    let prism = sceneObjs['MagicPrism'];

    state.onBegin = function() {

        audiogen.enableSynths(['pad0', 'pad1']);

        setGazeParams('tunnel');
        //settings.clearColor = 0x111111;
        //background.fadeTo(0x000000, 1.0);

        function onCompleteTween(event) {
            fsm.changeTo("prism");
            window.removeEventListener("hit_4m", onCompleteTween);
        };

        // expand forward
        makePrismTweenUniformVecComponent(state, 'core', 'uTubeParams', {
            x: 8.0,
            z: 200.0
        }, 8000).easing(TWEEN.Easing.Cubic.InOut).start();

        // speed up
        makePrismTweenUniformVecComponent(state, 'core', 'uSwayParams', {
            y: 0.1
        }, 4000).easing(TWEEN.Easing.Quintic.In).start().onComplete(() => {
            //window.addEventListener("hit_4m", onCompleteTween);
        });
    };

    state.onEnterNextGazeLevel = function(gazeLevel) {

        let fadeOutTime = 2500;

        // fade out
        makePrismTweenUniform(state, 'core', 'uGlobalAlpha', {
            value: 0.0
        }, fadeOutTime).start().onComplete(() => {

            prism.layers['core'].material.uniforms['uGlobalAlpha'].value = 1.0;
            prism.layers['core'].material.uniforms['uTubeParams'].value.z = 0.0;

            //state.clearSignalsTweens();
            fsm.changeTo("prism");
        });
    };

    return state;
}

function createStatePrism() {
    let state = createState('prism');
    let sceneObjs = require('./Scene.js').sceneObjs;
    let prism = sceneObjs['MagicPrism'];

    state.onBegin = function() {

        audiogen.enableSynths(['pad0', 'piano', 'bell']);

        setGazeParams('prism');
        sceneObjs['MagicGlitter'].obj3d.visible = true;

        prism.layers['bg'].visible = true;
        prism.layers['origami'].visible = true;
        prism.layers['lines'].visible = true;
        prism.layers['core'].visible = false;
        //sceneObjs['MagicFabric'].obj3d.visible = false;

        // random index
        var geoIndex = mathext.randBetweenInt(0, 100);
        prism.layers['origami'].setGeoIndex(geoIndex);
        prism.layers['lines'].setGeoIndex(geoIndex);

        let pulsateSignal = "hit_4m";
        let pulsateSpeedMin = 0.05;
        let pulsateSpeedMax = 0.4;

        // fade color
        let hue = Math.random();

        // main chunk
        state.signals.push(signal.map(pulsateSignal, prism.layers['origami'].material.uniforms['uSwayParams'].value, 'y', pulsateSpeedMin, pulsateSpeedMax));
        state.signals.push(signal.map(pulsateSignal, prism.layers['lines'].material.uniforms['uSwayParams'].value, 'y', pulsateSpeedMin, pulsateSpeedMax));
        state.signals.push(signal.map(pulsateSignal, prism.layers['bg'].material.uniforms['uSwayParams'].value, 'y', pulsateSpeedMin, pulsateSpeedMax));

        // sway dist
        let swayDist = mathext.randBetween(0.9, 1.4);
        prism.layers['origami'].material.uniforms['uSwayParams'].value.z = swayDist;
        prism.layers['lines'].material.uniforms['uSwayParams'].value.z = swayDist;

        let fadeInTime = 3000;

        // shirnk down
        prism.layers['origami'].material.uniforms['uTubeParams'].value.x = 5.0;
        prism.layers['lines'].material.uniforms['uTubeParams'].value.x = 5.0;
        
        makePrismTweenUniformVecComponent(state, 'origami', 'uTubeParams', {
            x: 0.83
        }, fadeInTime).easing(TWEEN.Easing.Cubic.Out).start();

        makePrismTweenUniformVecComponent(state, 'lines', 'uTubeParams', {
            x: 0.83
        }, fadeInTime).easing(TWEEN.Easing.Cubic.Out).start();

        // alpha set
        prism.layers['origami'].material.uniforms['uGlobalAlpha'].value = 0.0;
        prism.layers['lines'].material.uniforms['uGlobalAlpha'].value = 0.0;
        prism.layers['bg'].material.uniforms['uGlobalAlpha'].value = 0.0;

        // fade in
        makePrismTweenUniform(state, 'origami', 'uGlobalAlpha', {
            value: 1.0
        }, fadeInTime).start();

        makePrismTweenUniform(state, 'lines', 'uGlobalAlpha', {
            value: 1.0
        }, fadeInTime).start();

        makePrismTweenUniform(state, 'bg', 'uGlobalAlpha', {
            value: 1.0
        }, fadeInTime).start().onComplete(() => {
            state.signals.push(signal.map(pulsateSignal, prism.layers['origami'].material.uniforms['uGlobalAlpha'], 'value', 0.5, 2.0));
            state.signals.push(signal.map(pulsateSignal, prism.layers['lines'].material.uniforms['uGlobalAlpha'], 'value', 0.12, 0.4));
            state.signals.push(signal.map(pulsateSignal, prism.layers['bg'].material.uniforms['uGlobalAlpha'], 'value', 0.0, 0.5));

        });
    };
    
    state.onUpdate = function(dt) {};

    state.onEnterNextGazeLevel = function(gazeLevel) {

        state.clearSignalsTweens();

        let fadeOutTimeMs = 3500;
        prism.layers['core'].material.uniforms['uGlobalAlpha'].value = 0.0;

        makePrismTweenUniformVecComponent(state, 'origami', 'uTubeParams', {
            x: 4.0
        }, fadeOutTimeMs).easing(TWEEN.Easing.Cubic.In).start();

        makePrismTweenUniformVecComponent(state, 'lines', 'uTubeParams', {
            x: 4.0
        }, fadeOutTimeMs).easing(TWEEN.Easing.Cubic.In).start().onComplete(() => {
            fsm.changeTo('baby');

            // core - shrink
            makePrismTweenUniformVecComponent(state, 'core', 'uTubeParams', {
                x: 0.0,
                z: 0.0
            }, fadeOutTimeMs).easing(TWEEN.Easing.Cubic.InOut).start();

            // core - fade in
            makePrismTweenUniform(state, 'core', 'uGlobalAlpha', {
                value: 1.0
            }, fadeOutTimeMs).start();
        });

        makePrismTweenUniform(state, 'origami', 'uGlobalAlpha', {
            value: 0.0
        }, fadeOutTimeMs).start();
        makePrismTweenUniform(state, 'lines', 'uGlobalAlpha', {
            value: 0.0
        }, fadeOutTimeMs).start();
        makePrismTweenUniform(state, 'bg', 'uGlobalAlpha', {
            value: 0.0
        }, fadeOutTimeMs).start();


    };

    return state;
}

function doPulsate() {

    let glitter = require('./MagicGlitter.js');
    let prism = require('./MagicPrism.js');

    let loopPulse = animitter(function(deltaTime, elapsedTime, frameCount) {
        let time = elapsedTime * 0.001;
        //material.uniforms['uBaseSpeed'].value = signal.get('base', 0.5, 1.5);
        //material.uniforms['uEyeDepth'].value = signal.get('eyeDepth', -1.0, 100.0);

        //material.uniforms['uEyeCurveCoeff'].value = mathext.lerp(20.0, 100.0, Math.sin(time * 0.1) * 0.5 + 0.5);
        //material.uniforms['uPulsePosZ'].value = mathext.wrap(time * 8.0, -20.0, 80.0);

        //material.uniforms['uSoothingLight'].value.w = mathext.lerp( 500.0, 600.0, Math.sin(time*0.7)*0.5+0.5);
        //material.uniforms['uFreq0'].value = baseFreq0.clone().add(new THREE.Vector4(Math.sin(time*0.1)*0.5, 0.0, Math.sin(time*1.5)*2.0, 0.0));
        //material.uniforms['uFreq1'].value = baseFreq1.clone().add(new THREE.Vector4(Math.cos(time*0.37)*0.5, 0.0, Math.cos(time*0.2)*2.0, 0.0));
        //material.uniforms['uFreq2'].value = baseFreq2.clone().add(new THREE.Vector4(Math.sin(time*0.77)*1.5, 0.0, Math.cos(time*0.5)*2.0, 0.0));
        //material.uniforms['uSoothingLightSpeed'].value = mathext.lerp( 1.0, 2.5, Math.sin(time*1.0)*0.5+0.5);

        glitter.setPulsePosZ(signal.get('ringPulse', -20.0, 100.0));
        prism.setPulsePosZ(signal.get('ringPulse', -20.0, 100.0));
    });

    loopPulse.start();
}

module.exports = {

    onHitNote: function(noteId) {
        if (fsm !== null) {
            fsm.onHitNote(noteId);
        }
    },

    init: function() {

        var app = require('./../App.js');

        fsm = createFSM();
        fsm.init();

        if (settings.showGui) {
            let guiParams = guihelper.createGuiParamObj("Director");
            //let guiFolder = app.addGuiFolder("Director");
            guiParams.folder.open();

            guihelper.addGuiFloat(guiParams, "Gaze Charge", params, "gazeCharge");
            guihelper.addGuiFloat(guiParams, "Gaze Level", params, "gazeLevel");
            guihelper.addGuiFloat(guiParams, "Gaze Locked", params, "gazeLocked");
            guihelper.addGuiBool(guiParams, "Gaze Paused", params, "gazeChargePaused");

            guiParams.folder.add(params, 'currState').listen();
            //guihelper.addGuiFloat(guiParams, "Gaze Time", params, "gazeLockTime", 0.0, 100.0);
        }

    },

    start: function() {

        let lookDirGoal = new THREE.Vector3(0.0, 0.0, -1.0);
        var controlVR = require("./../CameraControlVR.js");

        // run all data!
        let loop = animitter(function(deltaTime, elapsedTime, frameCount) {
            let camDir = controlVR.getCamForwardDir();
            let dt = deltaTime * 0.001;

            if (params.gazeChargePaused) {
                return;
            }

            let dotProd = camDir.dot(lookDirGoal);
            let gazeDot = mathext.saturate(dotProd);

            let gazeChargeParam = gazeChargeParamsCurr;
            let gazeThreshold = gazeChargeParam.gazeThreshold;
            let gazeChargeUpSpeed = gazeChargeParam.gazeChargeUpSpeed;
            let gazeChargeDownSpeed = gazeChargeParam.gazeChargeDownSpeed;

            if (gazeDot >= gazeThreshold) {
                params.gazeLocked = 1.0;
                params.gazeCharge = mathext.saturate(params.gazeCharge + gazeChargeUpSpeed * dt);
            } else {
                params.gazeLocked = 0.0;
                params.gazeCharge = mathext.saturate(params.gazeCharge - gazeChargeDownSpeed * dt);
            }

            if (params.gazeCharge == 1.0) {
                //params.gazeLockTime += dt;
                params.gazeLevel += 1;
                params.gazeCharge = 0.0;

                fsm.onEnterNextGazeLevel(params.gazeLevel);
            } else {
                params.gazeLockTime = 0.0;
            }

            signal.set("gazeCharge", params.gazeCharge);
        });
        loop.start();

        fsm.start();

        doPulsate();
    },

    beginUnlockSeq : function() {

        if (fsm.getStateName() === 'splash') {
            fsm.changeTo('unlock');
        }
    },

    restartToBeginning : function() {

        fsm.getCurrState().clearSignalsTweens();
        fsm.changeTo('splash');
    },
};