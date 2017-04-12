var TWEEN = require('tween.js');
var settings = require('./Settings.js');
var dat = require('dat-gui');

console.log("Shader Vibes " + settings.version);

// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
var renderer = new THREE.WebGLRenderer({
    antialias: settings.antialias
});
renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
renderer.setClearColor(settings.clearColor);
document.body.appendChild(renderer.domElement);

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

var equiManaged = new CubemapToEquirectangular( renderer, true );

var scene;
var camera;
var controls;

var gui = null;
var guiParams = {};

var fpsClock = new THREE.Clock();
var fpsFrameTime = 0.0;

window.oncontextmenu = function(event) {
     event.preventDefault();
     event.stopPropagation();
     return false;
};

var noSleep = new NoSleep();

function enableNoSleep() {
  noSleep.enable();
  document.removeEventListener('touchstart', enableNoSleep, false);
}

document.querySelector('#infobtn').addEventListener('click', function() {
    document.getElementById("infowall").style.display = "block";
});

document.querySelector('#infobtn-quit').addEventListener('click', function() {
    document.getElementById("infowall").style.display = "none";
});

// Enable wake lock.
// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
document.addEventListener('touchstart', enableNoSleep, false);

module.exports = {
    renderer: renderer,    

    init: function() {

        module.exports.initGui();

        scene = require('./Scene/Scene.js');
        camera = require('./Camera.js');
        controls = require('./CameraControlVR.js');

        camera.init();
        controls.init();
        require('./Textures.js').init();
        scene.init();

        module.exports.onResize();
        window.addEventListener('resize', module.exports.onResize);

        var isIOS = module.exports.getMobileOperatingSystem() === "iOS";
        if(isIOS)
        {
             window.onorientationchange = function() { setTimeout(function(){
                module.exports.onResize();

                //document.getElementById("infowall").style.display = document.getElementById("infowall").style.display ==="block"? "none": "block";
             }, 300); };
        }
    },

    getMobileOperatingSystem:function() {
        
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

          // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }

        if (/android/i.test(userAgent)) {
            return "Android";
        }

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "iOS";
        }

        return "unknown";
    },

    initGui: function() {

        if (!settings.showGui) {
            return;
        }

        gui = new dat.GUI();
        //gui.close();

        var appGuiFolder = gui.addFolder("App");
        appGuiFolder.add(settings, 'debug');
        appGuiFolder.add(settings, 'cameraFOV', 10, 180).onChange((value) => { camera.obj.fov = settings.cameraFOV; camera.obj.updateProjectionMatrix(); });
        appGuiFolder.addColor(settings, 'clearColor');
    },

    addGuiItem: function(funcName, func, param0, param1) {
        if( gui === null ) {
            return;
        }

        guiParams[funcName] = func;
        return gui.add(guiParams, funcName, param0, param1);
    },

    addGuiFolder: function(name) {
        if( gui === null ) {
            return null;
        }

        return gui.addFolder(name);
    },

    start: function() {
        scene.start();

        function animate(timestamp) {
            effect.requestAnimationFrame(animate);

            module.exports.update();
            module.exports.draw();
        }

        effect.requestAnimationFrame(animate);
    },

    onResize: function() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        var isIOS = module.exports.getMobileOperatingSystem() === "iOS";
        if(isIOS)
        {
            //width = screen.width;
            //height = screen.height;
        }

        console.log('Resizing to %s x %s.', width, height);
        effect.setSize(width, height);
        camera.obj.aspect = width / height;
        camera.obj.updateProjectionMatrix();
        //camera.obj.lookAt(new THREE.Vector3(0.0, 0.0, -1.0));
    },

    onFullscreen: function() {

        var el = renderer.domElement;

        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    },

    getFrameTime: function() {
        return fpsFrameTime;
    },

    update: function() {
        controls.update();
        TWEEN.update();

        fpsFrameTime = fpsClock.getDelta();
    },

    draw: function() {
        renderer.setClearColor(settings.clearColor);
        effect.render(scene.obj, camera.obj);
    },

    captureCubeMap: function() {
        equiManaged.update( camera.obj, scene.obj );
    }
}