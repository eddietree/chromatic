var TWEEN = require("tween.js");
var animitter = require('animitter');

var mathext = require("../MathExt.js");
var settings = require('./../Settings.js');

let tween = null;
let baseColor = new THREE.Color();
baseColor.set(settings.clearColor);

function killExistingTween() {
    if (tween != null) {
        tween.stop();
        tween = null;
    }
}

function makeTweenFromTo(colorHexFrom, colorHexTo, timeSecs) {
    let colorObj = {
        color: new THREE.Color(colorHexFrom),
    };

    let colorGoal = new THREE.Color(colorHexTo);

    return new TWEEN.Tween(colorObj.color).to(colorGoal, timeSecs * 1000.0).onUpdate(() => {
        settings.clearColor = colorObj.color.getHex();
    });
}

module.exports = {

    fadeTo: function(colorHex, timeSecs) {
        killExistingTween();

        baseColor = new THREE.Color(colorHex);
        tween = makeTweenFromTo(settings.clearColor, colorHex, timeSecs);
        tween.start();
    },

    pingColor: function(colorHex, timeSecs) {
        killExistingTween();

        tween = makeTweenFromTo(colorHex, baseColor, timeSecs);
        tween.start();
    },

    setRGB : function(r,g,b,a = 1.0) {
        baseColor.setRGB(r,g,b);
        settings.clearColor = baseColor.getHex();
    },

    init: function() {},

    start: function() {},
};