var TWEEN = require("tween.js");
var animitter = require('animitter');

var mathext = require("../MathExt.js");
var settings = require('./../Settings.js');

let TYPE_SINE = 0;
let TYPE_LINEAR = 1;
let TYPE_HIT = 2;
let TYPE_RAW = 3;

var signals = {
    base: {
        freq: 0.1,
        type: TYPE_SINE,
        power: 1.0,
    },

    waveDistort: {
        freq: 0.03,
        type: TYPE_SINE,
        power: 1.0,
    },

    eyeDepth: {
        freq: 0.02,
        type: TYPE_SINE,
        power: 1.0,
    },

    soothingLight: {
        freq: 0.4 / Math.PI,
        type: TYPE_SINE,
        power: 1.0,
    },

    soothingLightZFreq: {
        freq: 0.1,
        type: TYPE_SINE,
        power: 1.0,
    },

    ringPulse: {
        freq: 0.075,
        type: TYPE_LINEAR
    },

    hit_piano: {
        fadeOutLerp: 0.05,
        type: TYPE_HIT,
    },

    /*hit_1n: {
        fadeOutLerp: 0.05,
        type: TYPE_HIT,
    },

    hit_2n: {
        fadeOutLerp: 0.05,
        type: TYPE_HIT,
    },

    hit_4n: {
        fadeOutLerp: 0.05,
        type: TYPE_HIT,
    },

    hit_8n: {
        fadeOutLerp: 0.05,
        type: TYPE_HIT,
    },

    hit_2m: {
        fadeOutLerp: 0.04,
        type: TYPE_HIT,
    },

    hit_3m: {
        fadeOutLerp: 0.04,
        type: TYPE_HIT,
    },*/

    hit_4m: {
        fadeOutLerp: 0.009,
        type: TYPE_HIT,
    },

    hit_touchStart: {
        fadeOutLerp: 0.045,
        type: TYPE_HIT,
    },

    meter_piano: {
        type: TYPE_RAW,
    },

    gazeCharge: {
        type: TYPE_RAW,
    },
};

let params = {
    gui: {},
    layers: {},
    maps: [],
};

let mapIndex = 0;

module.exports = {
    init: function() {

        var app = require('./../App.js');
        let guiFolder = app.addGuiFolder("Signals / Events");
        //guiFolder.open();

        // gui data
        for (let key in signals) {
            if (signals.hasOwnProperty(key)) {

                let signalData = signals[key];

                params.layers[key] = {
                    'val': 0.0,
                    'data': signalData,
                };

                if (settings.showGui) {

                    let guiTitleVal = key + ' (' + signalData.type + ')';
                    Object.defineProperty(params.layers[key], guiTitleVal, {
                        get: function() {
                            return params.layers[key].val;
                        },
                    });

                    //guiFolder.add(signalData, 'type');
                    guiFolder.add(params.layers[key], guiTitleVal, 0.0, 1.0).listen();

                    if (signalData.hasOwnProperty('freq')) {
                        let guiTitleHz = key + ' - Freq';
                        Object.defineProperty(params.layers[key], guiTitleHz, {
                            get: function() {
                                return params.layers[key].data.freq;
                            },
                            set: function(val) {
                                params.layers[key].data.freq = val;
                            },
                        });
                        guiFolder.add(params.layers[key], guiTitleHz, 0.0, 0.5).listen();
                    }
                }
            }
        }
    },

    get: function(signalName, minVal = 0.0, maxVal = 1.0) {
        return mathext.lerp(minVal, maxVal, params.layers[signalName].val);
    },

    map: function(signalName, obj, objKey, minVal = 0.0, maxVal = 1.0) {

        var newItem = {
            obj: obj,
            objKey: objKey,
            signal: signalName,
            minVal: minVal,
            maxVal: maxVal,
            id: mapIndex,
        }

        params.maps.push(newItem);
        mapIndex += 1;

        return newItem.id;
    },

    removeById: function(id) {
        for (let i = 0; i < params.maps.length; i += 1) {
            let currMap = params.maps[i];

            if (id === currMap.id) {
                params.maps.splice(i, 1);
                return true;
            }
        }

        //console.log("Couldn't find: " + id)

        return false;
    },

    removeByIdArray: function(idArray) {
        for (let i = 0; i < idArray.length; i += 1) {
            module.exports.removeById(idArray[i]);
        }

        idArray.length = 0;
    },

    removeFromMap: function(obj, objKey) {
        for (let i = 0; i < params.maps.length; i += 1) {
            let currMap = params.maps[i];
            let objCurr = currMap.obj;
            let objKeyCurr = currMap.objKey;

            if (objCurr == obj && objKeyCurr == objKey) {

                console.log("Rqemoved: " + objKey);
                params.maps.splice(i, 1);
                return true;
            }
        }

        console.log("Couldn't find: " + objKey)

        return false;
    },

    set: function(signalName, val) {
        let layer = params.layers[signalName];
        layer.val = val;
    },

    pulsate: function(signalName, value = 1.0) {
        let layer = params.layers[signalName];

        if (layer.data.type === TYPE_HIT) {
            layer.val = Math.max(layer.val, value);
        }
    },

    start: function() {

        let paramKeys = Object.keys(params.layers);

        // run all data!
        let loop = animitter(function(deltaTime, elapsedTime, frameCount) {

            let time = elapsedTime * 0.001;

            // update signals
            for (let i = 0; i < paramKeys.length; i += 1) {
                let key = paramKeys[i];
                let param = params.layers[key];
                let data = param.data;
                let dataType = data.type;

                if (dataType === TYPE_SINE) {
                    let power = data.power || 1.0;
                    param.val = Math.pow(Math.sin(data.freq * time * Math.PI * 2.0 - Math.PI * 0.5) * 0.5 + 0.5, power);
                } else if (dataType === TYPE_LINEAR) {
                    let val = data.freq * time;
                    param.val = val - Math.floor(val);
                } else if (dataType === TYPE_HIT) {
                    param.val = mathext.lerp(param.val, 0.0, data.fadeOutLerp);
                }
            }

            // update maps
            for (let i = 0; i < params.maps.length; i += 1) {

                let map = params.maps[i];
                let obj = map.obj;
                let goalVal = module.exports.get(map.signal, map.minVal, map.maxVal);

                obj[map.objKey] = mathext.lerp(obj[map.objKey], goalVal, 0.05);
            }
        });
        loop.start();
    },
};