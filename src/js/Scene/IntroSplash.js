var TWEEN = require("tween.js");
var animitter = require("animitter");

var mathext = require("./../MathExt.js");

let obj3d = new THREE.Object3D();
let objContainer = new THREE.Object3D();

let lineData = {
    lines: [{
        x0: 223.98,
        y0: 1.33,
        x1: 185.73,
        y1: 1.33
    }, {
        x0: 185.73,
        y0: 1.33,
        x1: 186.48,
        y1: 309.33
    }, {
        x0: 756.19,
        y0: 1.66,
        x1: 716.23,
        y1: 1.66
    }, {
        x0: 716.23,
        y0: 1.66,
        x1: 715.55,
        y1: 308.64
    }, {
        x0: 715.55,
        y0: 308.64,
        x1: 753.4,
        y1: 308.47
    }, {
        x0: 436.89,
        y0: 1.68,
        x1: 365.82,
        y1: 1.64
    }, {
        x0: 365.82,
        y0: 1.64,
        x1: 366.4,
        y1: 309.47
    }, {
        x0: 530.46,
        y0: 1.72,
        x1: 492.21,
        y1: 1.72
    }, {
        x0: 492.21,
        y0: 1.72,
        x1: 491.96,
        y1: 309.33
    }, {
        x0: 41.56,
        y0: 1.57,
        x1: 1.7,
        y1: 1.57
    }, {
        x0: 1.7,
        y0: 1.57,
        x1: 2.02,
        y1: 309.41
    }, {
        x0: 2.02,
        y0: 309.41,
        x1: 39.86,
        y1: 309.24
    }, {
        x0: 314.85,
        y0: 1.86,
        x1: 274.7,
        y1: 1.82
    }, {
        x0: 274.7,
        y0: 1.82,
        x1: 274.76,
        y1: 309.07
    }, {
        x0: 274.76,
        y0: 309.07,
        x1: 314.87,
        y1: 308.91
    }, {
        x0: 314.87,
        y0: 308.91,
        x1: 314.85,
        y1: 1.86
    }, {
        x0: 187.31,
        y0: 154.28,
        x1: 224.48,
        y1: 309.33
    }, {
        x0: 223.81,
        y0: 1.49,
        x1: 224.65,
        y1: 154.28
    }, {
        x0: 187.92,
        y0: 154.39,
        x1: 223.34,
        y1: 154.37
    }, {
        x0: 595.44,
        y0: 309.31,
        x1: 595.9,
        y1: 1.52
    }, {
        x0: 530.3,
        y0: 1.49,
        x1: 529.96,
        y1: 309.33
    }, {
        x0: 493.4,
        y0: 154.39,
        x1: 528.74,
        y1: 154.22
    }, {
        x0: 659.96,
        y0: 1.83,
        x1: 659.96,
        y1: 309.33
    }, {
        x0: 94.43,
        y0: 1.33,
        x1: 94.43,
        y1: 309.33
    }, {
        x0: 132.51,
        y0: 1.49,
        x1: 132.43,
        y1: 309.33
    }, {
        x0: 95.87,
        y0: 154.39,
        x1: 131.21,
        y1: 154.22
    }, {
        x0: 400.29,
        y0: 309.47,
        x1: 400.75,
        y1: 1.68
    }, {
        x0: 436.96,
        y0: 309.47,
        x1: 437.42,
        y1: 1.68
    }, {
        x0: 611.9,
        y0: 1.52,
        x1: 577.47,
        y1: 1.47
    }],

    dots: [{
        x: 186.78,
        y: 154.33
    }, {
        x: 224.61,
        y: 154.33
    }, {
        x: 185.61,
        y: 1.66
    }, {
        x: 223.61,
        y: 1.66
    }, {
        x: 186.53,
        y: 309.33
    }, {
        x: 224.61,
        y: 309.33
    }, {
        x: 577.19,
        y: 1.66
    }, {
        x: 612.36,
        y: 1.66
    }, {
        x: 716.19,
        y: 1.66
    }, {
        x: 756.19,
        y: 1.66
    }, {
        x: 365.72,
        y: 1.66
    }, {
        x: 401.05,
        y: 1.66
    }, {
        x: 437.23,
        y: 1.66
    }, {
        x: 492.09,
        y: 154.33
    }, {
        x: 530.09,
        y: 154.33
    }, {
        x: 492.09,
        y: 1.66
    }, {
        x: 530.34,
        y: 1.66
    }, {
        x: 492.01,
        y: 309.33
    }, {
        x: 530.09,
        y: 309.33
    }, {
        x: 660,
        y: 1.66
    }, {
        x: 660,
        y: 309.33
    }, {
        x: 595.56,
        y: 309.33
    }, {
        x: 715.36,
        y: 309.33
    }, {
        x: 753.69,
        y: 309.33
    }, {
        x: 1.66,
        y: 1.66
    }, {
        x: 41.66,
        y: 1.66
    }, {
        x: 94.56,
        y: 154.33
    }, {
        x: 132.56,
        y: 154.33
    }, {
        x: 94.31,
        y: 1.66
    }, {
        x: 132.31,
        y: 1.66
    }, {
        x: 94.48,
        y: 309.33
    }, {
        x: 132.56,
        y: 309.33
    }, {
        x: 1.83,
        y: 309.33
    }, {
        x: 40.16,
        y: 309.33
    }, {
        x: 274.66,
        y: 1.66
    }, {
        x: 314.87,
        y: 1.79
    }, {
        x: 274.81,
        y: 308.91
    }, {
        x: 314.95,
        y: 308.91
    }, {
        x: 366.38,
        y: 309.33
    }, {
        x: 400.22,
        y: 309.33
    }, {
        x: 437.09,
        y: 309.33
    }]
};

let material;
let meshLine;
let meshPts;

function createLines() {

    let minX = 100000.0;
    let minY = 100000.0;
    let maxX = -100000.0;
    let maxY = -100000.0;

    for (var i = 0; i < lineData.dots.length; ++i) {
        var pt = lineData.dots[i];

        minX = Math.min(pt.x, minX);
        minY = Math.min(pt.y, minY);
        maxX = Math.max(pt.x, maxX);
        maxY = Math.max(pt.y, maxY);
    }

    let centerX = (minX + maxX) * 0.5;
    let centerY = (minY + maxY) * 0.5;
    let offsetX = minX - centerX;
    let offsetY = minY - centerY;
    
   
    let scale = 0.0007;

    let positions = [];
    let uv = [];

    for (let i = 0; i < lineData.lines.length; ++i) {
        var pair = lineData.lines[i];

        var x0 = (pair.x0 + offsetX) * scale;
        var y0 = (pair.y0 + offsetY) * scale;
        var x1 = (pair.x1 + offsetX) * scale;
        var y1 = (pair.y1 + offsetY) * scale;

        var uv_x0 = (pair.x0 - minX) / (maxX-minX);
        var uv_x1 = (pair.x1 - minX) / (maxX-minX);
        var uv_y0 = (pair.y0 - minY) / (maxY-minY);
        var uv_y1 = (pair.y1 - minY) / (maxY-minY);

        // flip-y
        y0 += -y0*2.0;
        y1 += -y1*2.0;

        // pos-0
        positions.push(x0);
        positions.push(y0);
        positions.push(0.0);
        uv.push(uv_x0);
        uv.push(uv_y0);

        // pos-1
        positions.push(x1);
        positions.push(y1);
        positions.push(0.0);
        uv.push(uv_x1);
        uv.push(uv_y1);
    }

    let geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));

    material = new THREE.ShaderMaterial({

        uniforms: {
            uTime: {
                value: 0.0
            },

            uFadeCoeff: {
                value: 0.0
            },
        },
        vertexShader: require('../Shaders.js').get('splashLines.vp'),
        fragmentShader: require('../Shaders.js').get('splashLines.fp'),
        transparent: true,
        depthWrite: false,
        depthTest: false,
    });

    // mesh
    meshLine = new THREE.LineSegments(geometry, material);
    meshLine.frustumCulled = false;
    objContainer.add(meshLine);

     let loop = animitter(function(deltaTime, elapsedTime, frameCount) {
        let speed = 1.0;
        material.uniforms.uTime.value += speed * deltaTime * 0.001;
    }).start();

    meshPts = new THREE.Points(meshLine.geometry, meshLine.material);
    meshPts.position.copy(meshLine.position);
    objContainer.add(meshPts);

    return meshLine;
}

let tweens = [];

function killTweens() {
    for( let i = 0; i < tweens.length; i+=1) {
        tweens[i].stop();
    }

    tweens.length = 0;
}

module.exports = {
    obj3d: obj3d,

    init: function() {
        let mesh = createLines();

        let globalOffsetZ = -2.0;
        obj3d.position.z = globalOffsetZ;

        function resizeSplash() {

            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            var elemDesc = document.getElementById("desc");
            var elemRect = elemDesc.getBoundingClientRect();
            var pixelsTop = elemRect.top;

            // height offset to fit splash
            var goalPercent = 0.58;
            var percentDiff = mathext.clamp(goalPercent- pixelsTop / windowHeight, 0.0, 1.0);
            objContainer.position.y = percentDiff;
            
            // scale to asepect
            var aspect = windowWidth / windowHeight;
            var aspectClamped = mathext.clamp(aspect, 0.0, 1.0);
            objContainer.scale.x = aspectClamped;
            objContainer.scale.y = aspectClamped;
        }

        // handle resizing on portrait mode
        window.addEventListener('resize', function(e) {
            resizeSplash();
        });

        // annoying ios orientation change
        var app = require('./../App.js');
        var isIOS = app.getMobileOperatingSystem() === "iOS";
        if (isIOS) {
            window.addEventListener('orientationchange', function(e) {
                 setTimeout(function(){
                    resizeSplash();
                },200);
            });
        }

        resizeSplash();
    },

    start: function() {
        var scene = require('./Scene.js');
        scene.obj.add(obj3d);
        obj3d.add(objContainer);

        // fade ins
        this.doFadeInSeq();
    },

    doFadeInSeq: function() {
        
        obj3d.visible = true;

        // fade in
        material.uniforms['uFadeCoeff'].value = 1.0;

        killTweens();

        let globalOffsetY = 0.06;
        let globalOffsetZ = -1.0;

        var tweenFade = new TWEEN.Tween(material.uniforms['uFadeCoeff']).to({value:0.0}, 1500).easing(TWEEN.Easing.Cubic.Out).start();
        var tweenPos = new TWEEN.Tween(obj3d.position).to({y:globalOffsetY, z:globalOffsetZ}, 1000).easing(TWEEN.Easing.Cubic.Out).start();

        tweens.push(tweenFade);
        tweens.push(tweenPos);
    },

    doFadeAwaySeq: function() {

        // fade out
        var tweenFade = new TWEEN.Tween(material.uniforms['uFadeCoeff']).to({value:1.0}, 1300).easing(TWEEN.Easing.Cubic.Out).onComplete( ()=>{
            obj3d.visible = false;
        }).start();

        let globalOffsetY = 0.0;
        let globalOffsetZ = -2.0;

        var tweenPos = new TWEEN.Tween(obj3d.position).to({y:globalOffsetY, z:globalOffsetZ}, 900).easing(TWEEN.Easing.Cubic.InOut).start();

        tweens.push(tweenFade);
        tweens.push(tweenPos);
    }
};