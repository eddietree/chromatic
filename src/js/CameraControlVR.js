var animitter = require('animitter');
var camera = require('./Camera.js');
var settings = require('./Settings.js');
var guihelper = require('./GuiHelper.js');
var controls = new THREE.VRControls(camera.obj);
var Noise = require('noisejs');

var vrDisplay = null;
var useVRCam = false;

document.getElementById("buttons").style.display = settings.showGui ? "block" : "none";

function onEnterFocus() {
    doResetPoseVR();
    var director = require('./Scene/Director.js');
    director.beginUnlockSeq();

    let sceneObjs = require('./Scene/Scene.js').sceneObjs;
    sceneObjs['IntroSplash'].doFadeAwaySeq();

    useVRCam = true;
};

function onExitFocus() {
    doResetPoseVR();

    var director = require('./Scene/Director.js');
    director.restartToBeginning();

    let sceneObjs = require('./Scene/Scene.js').sceneObjs;
    sceneObjs['IntroSplash'].doFadeInSeq();

    useVRCam = false;
};

function onConnectHMD(hmd) {

    function doVRRequestPresent() {

        if (vrDisplay.isPresenting || (vrDisplay.capabilities.canPresent == false)) {
            console.log("vrDisplay - Unable to present!");
            return;
        }

        // request VR
        var renderer = require('./App.js').renderer;
        vrDisplay.requestPresent([{
            source: renderer.domElement
        }]);

        console.log("doVRRequestPresent");
    }

    function doVRExitPresent() {

        // No sense in exiting presentation if we're not actually presenting.
        // (This may happen if we get an event like vrdisplaydeactivate when
        // we weren't presenting.)
        if (!vrDisplay.isPresenting)
            return;

        vrDisplay.exitPresent().then(function() {
            console.log("doVRExitPresent");
        }, function() {
            console.log("ERROR: doVRExitPresent");
        });
    }

    function doVRTogglePresent() {
        var director = require('./Scene/Director.js');
        director.beginUnlockSeq();

        if (vrDisplay.isPresenting) {
            doVRExitPresent();
        } else {
            doVRRequestPresent();
        }
    }

    console.log(vrDisplay);

    // auto put on?
    //window.addEventListener('vrdisplayactivate', doVRRequestPresent, false);
    //window.addEventListener('vrdisplaydeactivate', doVRExitPresent, false);

    let app = require('./App.js');
    app.addGuiItem('Toggle VR Mode', doVRTogglePresent);

    window.addEventListener('keypress', function(key) {
        if (key.code === "Space" || key.code === "Enter") {

            if (vrDisplay.capabilities.canPresent) {
                doVRTogglePresent();
            } else {
                require('./App.js').onFullscreen();
            }
        }
    }, false);
}

function initStatsVR() {

    let elemStats = document.getElementById("stats");
    let app = require('./App.js');

    function DebugPrintVectorLine(title, data) {
        elemStats.innerHTML += "<strong>" + title + "</strong>: (";

        for (let i = 0; i < data.length; i += 1) {
            elemStats.innerHTML += data[i].toFixed(3);

            if (i < data.length - 1) {
                elemStats.innerHTML += ", ";
            }
        }
        elemStats.innerHTML += ")<br/>";
    }

    let loop = animitter(function(deltaTime, elapsedTime, frameCount) {

        elemStats.innerHTML = "";

        // display vr stats
        if (vrDisplay !== null && typeof VRFrameData !== 'undefined') {
            let frameData = new VRFrameData();
            vrDisplay.getFrameData(frameData);

            var pose = frameData.pose;
            elemStats.innerHTML += "<strong>HMD</strong>: " + vrDisplay.displayName + "<br/>";
            //elemStats.innerHTML += "<strong>isConnected</strong>: " + vrDisplay.isConnected + "<br/>";
            elemStats.innerHTML += "<strong>isPresenting</strong>: " + vrDisplay.isPresenting + "<br/>";
            elemStats.innerHTML += "<strong>timeStamp</strong>: " + frameData.timestamp + "<br/>";

            DebugPrintVectorLine("pos", pose.position);
            DebugPrintVectorLine("orientation", pose.orientation);
            DebugPrintVectorLine("linearVelocity", pose.linearVelocity);
            DebugPrintVectorLine("linearAcceleration", pose.linearAcceleration);
            DebugPrintVectorLine("angularVelocity", pose.angularVelocity);
            DebugPrintVectorLine("angularAcceleration", pose.angularAcceleration);
            elemStats.innerHTML += "<hr/>";
        }

        elemStats.innerHTML += "<strong>Frame Time</strong>: " + app.getFrameTime().toFixed(3) + " (" + (1.0 / app.getFrameTime()).toFixed(3) + ")";
        elemStats.innerHTML += "<br/>";
        elemStats.innerHTML += "<strong>ZenVR Version</strong>: " + settings.version;
    });

    function toggleStats() {
        if (loop.isRunning()) {
            elemStats.style.display = "none";
            loop.stop();
        } else {
            elemStats.style.display = "block";
            loop.start();
        }
    }

    // show stats
    window.addEventListener('keypress', function(key) {
        if (key.code === "KeyS") {
            toggleStats()
        }
    }, false);
    app.addGuiItem('Toggle Stats', toggleStats);

    app.addGuiItem('Capture Cubemap', app.captureCubeMap);
}

function doResetPoseVR() {

    /*if (vrDisplay !== null) {
        vrDisplay.resetPose();
    }*/
    
    controls.update();
    camera.obj.lookAt(new THREE.Vector3(0.0, 0.0, -1.0));
}

function initButtons() {

    var renderer = require('./App.js').renderer;

    // Create WebVR UI Enter 360 Button
    /*var enter360 = new webvrui.Enter360Button(renderer.domElement)
        .on("enter", function() {
            console.log("enter 360");
            onEnterFocus();
        })
        .on("exit", function() {
            console.log("exit 360");
            onExitFocus();
        });

    document.getElementById("fullscreen").appendChild(enter360.domElement);*/

    // Button click handlers.
    //document.querySelector('button#fullscreen').addEventListener('click', () => require('./App.js').onFullscreen());
    document.querySelector('button#resetVR').addEventListener('click', doResetPoseVR);
    window.addEventListener('keypress', function(key) {
        if (key.code === "KeyR") {
            doResetPoseVR()
        }
    }, false);
}

function doHandleHandShakeCamera() {
    if (vrDisplay !== null && typeof VRFrameData !== 'undefined') {
        return;
    }

    let shakeParams = {
        posRadiusX: 0.023,
        posRadiusY: 0.028,

        posRadiusSpeedX: 1.0,
        posRadiusSpeedY: 1.0,

        lookRadiusX: 0.0016,
        lookRadiusY: 0.0016,

        lookRadiusSpeedX: 1.0,
        lookRadiusSpeedY: 1.0,

        globalSpeed: 0.7,
    };

    let noise = new Noise.Noise(Math.random());
    let guiParams = guihelper.createGuiParamObj("Hand Shake Camera");
    guihelper.addResetButton(guiParams);

    guihelper.addGuiFloat(guiParams, "Pos Radius X", shakeParams, "posRadiusX", 0.0, 0.5);
    guihelper.addGuiFloat(guiParams, "Pos Radius Y", shakeParams, "posRadiusY", 0.0, 0.5);

    guihelper.addGuiFloat(guiParams, "Look Radius X", shakeParams, "lookRadiusX", 0.001, 0.01);
    guihelper.addGuiFloat(guiParams, "Look Radius Y", shakeParams, "lookRadiusY", 0.001, 0.01);

    guihelper.addGuiFloat(guiParams, "Global Speed", shakeParams, "globalSpeed", 0.0, 5.0);

    let loop = animitter(function(deltaTime, elapsedTime, frameCount) {

        var dist = 0.007;
        var speed = 0.0004 * shakeParams.globalSpeed;
        var dirX = noise.simplex2(elapsedTime * speed * shakeParams.posRadiusSpeedX, 0.3) * shakeParams.lookRadiusX;
        var dirY = noise.simplex2(elapsedTime * speed * shakeParams.posRadiusSpeedY + 100.0, 40.7) * shakeParams.lookRadiusY;
        var posX = noise.simplex2(elapsedTime * speed * shakeParams.lookRadiusSpeedX + 800.0, 440.7) * shakeParams.posRadiusX;
        var posY = noise.simplex2(elapsedTime * speed * shakeParams.lookRadiusSpeedY + 500.0, 240.7) * shakeParams.posRadiusY;

        var lookDir = new THREE.Vector3(dirX, dirY, -1.0);
        camera.obj.position.x = posX;
        camera.obj.position.y = posY;
        var lookPos = camera.obj.position.clone().add(lookDir);
        camera.obj.lookAt(lookPos);
    }).start();
}

function hideEnterVRButton() {
    //document.getElementById("toggleVR").style.display = "none";
}

let camPosCached = new THREE.Vector3(0.0, 0.0, 0.0);
let camDirCached = new THREE.Vector3(0.0, 0.0, -1.0);

function cacheCamPos() {

    if (!module.exports.isCameraReady()) {
        return;
    } else {
        let frameData = new VRFrameData();
        vrDisplay.getFrameData(frameData);

        if (frameData.pose.position == null) {
            return;
        }

        let pos = frameData.pose.position;
        camPosCached.setX(pos[0]);
        camPosCached.setY(pos[1]);
        camPosCached.setZ(pos[2]);
        //return new THREE.Vector3(pos[0], pos[1], pos[2]);
    }
}

function cacheCamDir() {

    if (!module.exports.isCameraReady()) {

        if (vrDisplay !== null && vrDisplay.hasOwnProperty('orientation_')) {
            let orientation = vrDisplay.orientation_;
            let quat = new THREE.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w);
            let result = new THREE.Vector3(0.0, 0.0, -1.0);
            result.applyQuaternion(quat);

            camDirCached.copy(result);
            return;
        }
        return;
    } else {
        let frameData = new VRFrameData();
        vrDisplay.getFrameData(frameData);

        if (frameData.pose.orientation == null) {
            return;
        }

        let orientation = frameData.pose.orientation;
        let quat = new THREE.Quaternion(orientation[0], orientation[1], orientation[2], orientation[3]);
        let result = new THREE.Vector3(0.0, 0.0, -1.0);

        result.applyQuaternion(quat);
        camDirCached.copy(result);

        return;
    }
}

module.exports = {
    obj: controls,

    init: function() {
        console.log('CameraControlVR.init()');
        navigator.getVRDisplays().then(function(displays) {

            console.log('Found VR displays, count ' + displays.length);

            if (displays.length > 0) {
                vrDisplay = displays[0];

                console.log("VR display name: " + vrDisplay.displayName);

                ga('send', {
                  hitType: 'event',
                  eventCategory: 'Chromatic',
                  eventAction: 'headset',
                  eventLabel: vrDisplay.displayName
                });

                onConnectHMD(vrDisplay);

                if (typeof VRFrameData !== 'undefined') {
                    let frameData = new VRFrameData();
                    vrDisplay.getFrameData(frameData);
                    console.log(frameData);

                    if (vrDisplay.capabilities.canPresent == false) {
                        hideEnterVRButton();
                    }
                }
            }
        }).catch( reason => {console.error('getVRDisplays failed: ', reason ); });

        initButtons();
        initStatsVR();

        // Create WebVR UI Enter VR Button
        var app = require('./App.js');
        var renderer = app.renderer;

        // hack: ios - on "Enter VR" does not hide the screen, so need to hack this in
        var isIOS = app.getMobileOperatingSystem() === "iOS";

        var enterVR = new webvrui.EnterVRButton(renderer.domElement, {})
            .on("enter", function() {
                console.log("enter VR!!")
                onEnterFocus();

                console.log("Sending google event");
                ga('send', {
                  hitType: 'event',
                  eventCategory: 'Chromatic',
                  eventAction: 'play',
                  eventLabel: 'VRmode'
                });

                app.onResize();

                if (isIOS)
                {
                    document.getElementById("content").style.display = "none";
                } else {
                    document.getElementById("putOnVR").style.display = "block";
                }
            })
            .on("exit", function() {
                console.log("exit VR")
                onExitFocus();

                app.onResize();

                if (isIOS)
                {
                    document.getElementById("content").style.display = "block";
                } else {
                    document.getElementById("putOnVR").style.display = "none";
                }
            });

        document.getElementById("toggleVR").appendChild(enterVR.domElement);

        document.getElementById("enter360").onclick = function () {
            console.log("Entering 360 mode..");

            console.log("Sending google event");
            ga('send', {
              hitType: 'event',
              eventCategory: 'Chromatic',
              eventAction: 'play',
              eventLabel: '360mode'
            });

            enterVR.requestEnterFullscreen();
        }

        //doHandleHandShakeCamera();
    },

    update: function() {

        if (useVRCam) {
            controls.update();
        }

        cacheCamPos();
        cacheCamDir();
    },

    isCameraReady: function() {
        return vrDisplay !== null && typeof VRFrameData !== 'undefined';
    },

    getCamPos: function() {
        return camPosCached;
    },

    getCamForwardDir: function() {
        return camDirCached;
    }
};