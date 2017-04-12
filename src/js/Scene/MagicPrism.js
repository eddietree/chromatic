var TWEEN = require("tween.js");
var animitter = require("animitter");
var mathext = require("./../MathExt.js");
var guihelper = require("../GuiHelper.js");
var settings = require("../Settings.js");
var signal = require("./Signal.js");

let prismSolidParams = {
    constructor: THREE.Mesh,
    numTubes: 2,
    tubeRadiusSegs: 8,
    tubeHeightSegs: 4,

    matUniforms: {
        uGlobalAlpha : 0.6,
        uSwayParams: new THREE.Vector4(2.0, 0.15, 1.4, 0.1), // [freq, speed, amplitude, amplitude-height]
        uColorParams: new THREE.Vector4(0.1, 1.0, 7.0, -10.0), // [rainbow-freq, rainbow-speed, fade-freq, fade-speed]
        uAlphaFadeDist: new THREE.Vector4(1.6, 3.5, 0.0, 0.0), // [alpha z-min,alpha z-max, ?, ?]
        uTubeParams: new THREE.Vector4(0.83, 1.4, 30.0, -12.0), // [tube-radius, tube-spread, tube-y-height, tube-y-offset]
        uInfiniteScalar : 100.0,
    },
};

let prismLineParams = {
    constructor: THREE.LineSegments,
    numTubes: 2,
    tubeRadiusSegs: 8,
    tubeHeightSegs: 4,

    matUniforms: {
        uGlobalAlpha : 0.1,
        uSwayParams: new THREE.Vector4(2.0, 0.15, 1.4, 0.1), // [freq, speed, amplitude, amplitude-height]
        uColorParams: new THREE.Vector4(0.3, 1.0, 6.0, -8.0), // [rainbow-freq, rainbow-speed, fade-freq, fade-speed]
        uAlphaFadeDist: new THREE.Vector4(2.0, 3.0, 0.0, 0.0),
        uTubeParams: new THREE.Vector4(0.83, 1.4, 30.0, -12.0), // [tube-radius, tube-spread, tube-y-height, tube-y-offset]
        uInfiniteScalar : 100.0,
    },
};

let prismSolidBGParams = {
    constructor: THREE.Mesh,
    numTubes: 1,
    tubeRadiusSegs: 6,
    tubeHeightSegs: 5,

    matUniforms: {
        uGlobalAlpha : 0.1,
        uSwayParams: new THREE.Vector4(10.0, 0.15, 1.5, 0.05), // [freq, speed, amplitude, amplitude-height]
        uColorParams: new THREE.Vector4(0.7, 1.0, 7.0, -10.0), // [rainbow-freq, rainbow-speed, fade-freq, fade-speed]
        uAlphaFadeDist: new THREE.Vector4(1.5, 6.0, 0.0, 0.0), // [alpha z-min,alpha z-max, ?, ?]
        uTubeParams: new THREE.Vector4(7.0, 0.0, 100.0, -50.0), // [tube-radius, tube-spread, tube-y-height, tube-y-offset]
    },
};

let prismSolidCoreParams = {
    constructor: THREE.Mesh,
    numTubes: 3,
    tubeRadiusSegs: 3,
    tubeHeightSegs: 2,

    matUniforms: {
        uGlobalAlpha : 1.0,
        uSwayParams: new THREE.Vector4(10.0, 0.15, 4.6, 0.1), // [freq, speed, amplitude, amplitude-height]
        uColorParams: new THREE.Vector4(0.5, 1.0, 7.0, -10.0), // [rainbow-freq, rainbow-speed, fade-freq, fade-speed]
        uAlphaFadeDist: new THREE.Vector4(1.5, 6.0, 0.0, 0.0), // [alpha z-min,alpha z-max, ?, ?]
        uTubeParams: new THREE.Vector4(0.0, 2.0, 0.0, -40.0), // [tube-radius, tube-spread, tube-y-height, tube-y-offset]
    },
};

let obj3d = new THREE.Object3D();
let matPrismSolid = null;
let matPrismLine = null;
let matPrismBG = null;

function resetMaterialParams(material, params) {
    for (var key in params.matUniforms) {
        if (params.matUniforms.hasOwnProperty(key)) {

            var val =  params.matUniforms[key];
            //material.uniforms[key].value = val;

            if( typeof(val) === 'number') {
                material.uniforms[key].value = val;
            } else {
                material.uniforms[key].value.copy(val);
            }
        }
    }
}

function makeMaterial(params) {
    let material = new THREE.ShaderMaterial({

        uniforms: {
            uTime: {
                value: 0.0
            },

            uPulsePosZ: {
                value: 0.0
            },

            uGlobalAlpha: {
                value: 1.0
            },

            uInfiniteScalar: {
                value: 0.0
            },

            // [perlin-colorize, perlin-fade, perlin-freq]
            uPerlinParams: {
                value: new THREE.Vector4(0.3, 0.2, 0.4, 0.0),
            },

            // [tube-radius, tube-spread, tube-y-height, tube-y-offset]
            uTubeParams: {
                value: new THREE.Vector4(0.83, 1.4, 30.0, -15.0),
            },

            uAlphaFadeDist: {
                value: new THREE.Vector4(1.0, 7.0, 0.0, 0.0)
            },

            uColorTint: {
                value: new THREE.Vector4(1.0, 0.9, 1.0, 1.0),
            },

            uCamPos: {
                value: new THREE.Vector3()
            },

            uSwayParams: {
                // [freq, speed, amplitude, tubeRadius]
                value: new THREE.Vector4(),
            },

            uColorParams: {
                // [rainbow-freq, rainbow-speed, fade-freq, fade-speed]
                value: new THREE.Vector4(),
            },

            uTexRainbow: {
                value: require('../Textures.js').get('rainbow')
            },

            uTexMask: {
                value: require('../Textures.js').get('white')
            },
            uTexPerlin: {
                value: require('../Textures.js').get('white')
            },
        },
        vertexShader: require('../Shaders.js').get('magicPrism.vp'),
        fragmentShader: require('../Shaders.js').get('magicPrism.fp'),
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending : THREE.AdditiveBlending
        //side: THREE.DoubleSide
    });

    resetMaterialParams(material, params);

    var loader = new THREE.TextureLoader();
    loader.load('res/img/perlin.png', function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        //texture.anisotropy = renderer.getMaxAnisotropy();

        material.uniforms.uTexPerlin.value = texture;
        material.needsUpdate = true;
    });

    var loader = new THREE.TextureLoader();
    loader.load('res/img/prism-mask.png', function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        //texture.anisotropy = renderer.getMaxAnisotropy();

        material.uniforms.uTexMask.value = texture;
        material.needsUpdate = true;
    });

    return material;
}

function makeMaterialGui(guiParams, params, material) {
    if (!settings.showGui) {
        return;
    }

    guihelper.addResetButton(guiParams);

    guihelper.addGuiFloat(guiParams, "Alpha", material.uniforms.uGlobalAlpha, 'value', 0.0, 1.0);
    guihelper.addGuiColor(guiParams, "Color Tint", material.uniforms.uColorTint, 'value');

    guihelper.addGuiFloat(guiParams, "Tube Radius", material.uniforms.uTubeParams.value, 'x', 0.0, 20.0);
    guihelper.addGuiFloat(guiParams, "Tube Spread", material.uniforms.uTubeParams.value, 'y', 0.0, 2.0);
    guihelper.addGuiFloat(guiParams, "Tube Y-Height", material.uniforms.uTubeParams.value, 'z', 0.0, 40.0);
    guihelper.addGuiFloat(guiParams, "Tube Y-Offset", material.uniforms.uTubeParams.value, 'w', -40.0, 40.0);

    guihelper.addGuiFloat(guiParams, "Sway Freq", material.uniforms.uSwayParams.value, 'x', 0.0, 10.0);
    guihelper.addGuiFloat(guiParams, "Sway Speed", material.uniforms.uSwayParams.value, 'y', 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Sway Distance", material.uniforms.uSwayParams.value, 'z', 0.0, 20.0);
    guihelper.addGuiFloat(guiParams, "Sway Height", material.uniforms.uSwayParams.value, 'w', 0.0, 0.2).step(0.05);

    guihelper.addGuiFloat(guiParams, "Rainbow Freq", material.uniforms.uColorParams.value, 'x', 0.0, 1.0).step(0.1);
    guihelper.addGuiFloat(guiParams, "Rainbow Speed", material.uniforms.uColorParams.value, 'y', -10.0, 10.0);
    guihelper.addGuiFloat(guiParams, "Fade Freq", material.uniforms.uColorParams.value, 'z', 0.0, 20.0);
    guihelper.addGuiFloat(guiParams, "Fade Speed", material.uniforms.uColorParams.value, 'w', -20.0, 20.0);

    guihelper.addGuiFloat(guiParams, "Fade Min-Dist", material.uniforms.uAlphaFadeDist.value, 'x', 0.0, 10.0);
    guihelper.addGuiFloat(guiParams, "Fade Max-Dist", material.uniforms.uAlphaFadeDist.value, 'y', 0.0, 10.0);

    guihelper.addGuiFloat(guiParams, "Perlin Colorize", material.uniforms.uPerlinParams.value, 'x', 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Perlin Darken", material.uniforms.uPerlinParams.value, 'y', 0.0, 1.0);
    guihelper.addGuiFloat(guiParams, "Perlin Freq", material.uniforms.uPerlinParams.value, 'z', 0.0, 1.0);
}

function createGeometry(params) {
    //
    function getDir(angle) {
        return new THREE.Vector3(Math.cos(angle), 0.0, Math.sin(angle));
    }

    function pushFloat2(container, x, y) {
        container.push(x);
        container.push(y);
    }

    function pushFloat3(container, x, y, z) {
        container.push(x);
        container.push(y);
        container.push(z);
    }

    function pushFloat4(container, x, y, z, w) {
        container.push(x);
        container.push(y);
        container.push(z);
        container.push(w);
    }

    function pushVec3(container, val) {
        container.push(val.x);
        container.push(val.y);
        container.push(val.z);
    }

    function pushVec4(container, val) {
        container.push(val.x);
        container.push(val.y);
        container.push(val.z);
        container.push(val.w);
    }

    let positions = [];
    let normals = [];
    let centers = [];
    let uvs = [];
    let indices = [];
    let segData = [];

    let tubeHeight = 1.0;
    let deltaHeight = tubeHeight / params.tubeHeightSegs;
    let deltaAngle = (2.0 * Math.PI) / params.tubeRadiusSegs;

    for (let iTube = 0; iTube < params.numTubes; iTube += 1) {

        let tubeAngle = iTube * (2.0 * Math.PI) / params.numTubes + Math.PI*0.5;
        let tubeCenterX = Math.cos(tubeAngle);
        let tubeCenterY = 0.0;
        let tubeCenterZ = Math.sin(tubeAngle);

        for (let iSegment = 0; iSegment < params.tubeHeightSegs; iSegment += 1) {

            for (let iRadiusSeg = 0; iRadiusSeg < params.tubeRadiusSegs; iRadiusSeg += 1) {

                // angles
                let angle0 = iRadiusSeg * deltaAngle;
                let angle1 = angle0 + deltaAngle;

                // normals
                let dir0 = getDir(angle0);
                let dir1 = getDir(angle1);
                let normal = getDir((angle0 + angle1) * 0.5);

                let uvX0 = 0.0;
                let uvX1 = 1.0;
                let uvY0 = iSegment / (params.tubeHeightSegs-1);
                let uvY1 = (iSegment+1) / (params.tubeHeightSegs-1);
                //let uvY0 = 0.0;
                //let uvY1 = 1.0;

                // positions
                let posY0 = tubeHeight * -0.5 + iSegment * deltaHeight;
                let posY1 = posY0 + deltaHeight;
                let posX0 = dir0.x;
                let posX1 = dir1.x;
                let posZ0 = dir0.z;
                let posZ1 = dir1.z;

                let indexOffset = positions.length / 3;

                // centers
                pushFloat4(centers, tubeCenterX, tubeCenterY, tubeCenterZ, tubeAngle);
                pushFloat4(centers, tubeCenterX, tubeCenterY, tubeCenterZ, tubeAngle);
                pushFloat4(centers, tubeCenterX, tubeCenterY, tubeCenterZ, tubeAngle);
                pushFloat4(centers, tubeCenterX, tubeCenterY, tubeCenterZ, tubeAngle);

                // pos
                pushFloat3(positions, posX0, posY0, posZ0);
                pushFloat3(positions, posX1, posY0, posZ1);
                pushFloat3(positions, posX1, posY1, posZ1);
                pushFloat3(positions, posX0, posY1, posZ0);

                // centers
                let segData0 = new THREE.Vector4(posY0, angle1, angle0, Math.random());
                let segData1 = new THREE.Vector4(posY0, angle0, angle1, Math.random());
                let segData2 = new THREE.Vector4(posY1, angle1, angle1, Math.random());
                let segData3 = new THREE.Vector4(posY1, angle0, angle0, Math.random());
                pushVec4(segData, segData0);
                pushVec4(segData, segData1);
                pushVec4(segData, segData2);
                pushVec4(segData, segData3);

                // normal
                /*pushVec3(normals, normal);
                pushVec3(normals, normal);
                pushVec3(normals, normal);
                pushVec3(normals, normal);*/

                pushVec3(normals, dir0);
                pushVec3(normals, dir1);
                pushVec3(normals, dir1);
                pushVec3(normals, dir0);

                // uv
                pushFloat2(uvs, uvX0, uvY0);
                pushFloat2(uvs, uvX1, uvY0);
                pushFloat2(uvs, uvX1, uvY1);
                pushFloat2(uvs, uvX0, uvY1);

                // indices
                indices.push(indexOffset + 0);
                indices.push(indexOffset + 2);
                indices.push(indexOffset + 1);
                indices.push(indexOffset + 0);
                indices.push(indexOffset + 3);
                indices.push(indexOffset + 2);
            }
        }
    }

    let geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute('center', new THREE.BufferAttribute(new Float32Array(centers), 4));
    geometry.addAttribute('data', new THREE.BufferAttribute(new Float32Array(segData), 4));
    geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));

    return geometry;
}

function initPrismMesh(params, material, guiTitle) {

    let geometry = createGeometry(params);

    let mesh = new(params.constructor || THREE.Mesh)(geometry, material);
    mesh.frustumCulled = false;
    mesh.rotation.set(Math.PI * 0.5, 0.0, 0.0);

    if (settings.showGui) {
        let guiParams = guihelper.createGuiParamObj(guiTitle);
        makeMaterialGui(guiParams, params, material);
    }

    var controlVR = require("./../CameraControlVR.js");

    let loop = animitter(function(deltaTime, elapsedTime, frameCount) {
        let speed = material.uniforms.uSwayParams.value.y;
        let touchPulsate = signal.get("hit_touchStart");

        material.uniforms.uTime.value += (speed+touchPulsate*1.75) * deltaTime * 0.001;
        material.uniforms.uCamPos.value.copy(controlVR.getCamPos());
    }).start();

    mesh.resetParams = function() {
        resetMaterialParams(material, params);
    };

    return mesh;
}

function createOrigamiGeomtries(mesh, params) {
    mesh.geometries = [];
    mesh.geometries.push(mesh.geometry);

    for( let i = 0; i < 3; i+=1 ) {
        params.numTubes += 1;
        let geo = createGeometry(params);
        mesh.geometries.push(geo);
    }
}

function initPrismOrigami() {
    var params = prismSolidParams;

    // material
    let material = makeMaterial(params);
    matPrismSolid = material;

    let mesh = initPrismMesh(params, material, "PRISM");
    obj3d.add(mesh);

    createOrigamiGeomtries(mesh, params);

    mesh.setGeoIndex = function(index) {
        index = index % mesh.geometries.length;
        mesh.geometry = mesh.geometries[index];
    }

    return mesh;
}

function initPrismLines() {

    var scene = require('./Scene.js');
    var params = prismLineParams;

    let material = makeMaterial(params);
    matPrismLine = material;

    // lines mesh
    let mesh = initPrismMesh(params, material, "PRISM (Lines)");
    obj3d.add(mesh);


    // pts mesh
    let ptsMesh = new THREE.Points(mesh.geometry, mesh.material);
    ptsMesh.frustumCulled = false;
    mesh.add(ptsMesh);

    createOrigamiGeomtries(mesh, params);

    mesh.setGeoIndex = function(index) {
        index = index % mesh.geometries.length;
        mesh.geometry = mesh.geometries[index];
        ptsMesh.geometry = mesh.geometries[index];
    }

    return mesh;
}

function initPrismBG() {

    var scene = require('./Scene.js');
    var params = prismSolidBGParams;

    let material = makeMaterial(params);
    material.side = THREE.BackSide;
    matPrismBG = material;

    // lines mesh
    let mesh = initPrismMesh(params, material, "PRISM (BG)");
    obj3d.add(mesh);

    return mesh;
}

function initPrismCore() {

    var scene = require('./Scene.js');
    var params = prismSolidCoreParams;

    let material = makeMaterial(params);
    material.side = THREE.DoubleSide;
    //material.side = THREE.BackSide;
    //matPrismLine = material;

    // lines mesh
    let mesh = initPrismMesh(params, material, "PRISM (Core)");
    obj3d.add(mesh);

    return mesh;
}

let layers = {};

module.exports = {

    obj3d: obj3d,
    layers : layers,

    setPulsePosZ: function(val) {
        if (matPrismSolid != null) {
            matPrismSolid.uniforms.uPulsePosZ.value = val;
        }

        if (matPrismLine != null) {
            matPrismLine.uniforms.uPulsePosZ.value = val;
        }

        if (matPrismBG != null) {
            matPrismBG.uniforms.uPulsePosZ.value = val;
        }
    },

    init: function() {

        layers['bg'] = initPrismBG();
        layers['core'] = initPrismCore();
        layers['origami'] = initPrismOrigami();
        layers['lines'] = initPrismLines();
    },

    start: function() {
        var scene = require('./Scene.js');
        scene.obj.add(obj3d);
    },
};