var scene = new THREE.Scene();

var sceneObjs = {
	Signal : require("./Signal.js"),
	AudioGen : require("./AudioGen.js"),
	IntroSplash : require("./IntroSplash.js"),
	//DebugBox : require("./DebugBox.js"),
	//DebugPlane : require("./DebugPlane.js"),
	//DebugArrows : require("./DebugArrows.js"),
	//DebugRoom : require("./DebugRoom.js"),
	//MagicRings : require("./MagicRings.js"),
	//MagicSphere : require("./MagicSphere.js"),
	MagicPrism : require("./MagicPrism.js"),
	//MagicFabric : require("./MagicFabric.js"),
	MagicGlitter : require("./MagicGlitter.js"),
	//MagicEye : require("./MagicEye.js"),
	//BounceSpheres : require("./BounceSpheres.js"),
	Background : require("./Background.js"),
	Director : require("./Director.js"),
};

module.exports = {
	obj : scene,

	sceneObjs: sceneObjs,

	init : function() {
		for (var key in sceneObjs) {
			if(!sceneObjs.hasOwnProperty(key)) 
				continue;

			var obj = sceneObjs[key];
			if (obj.hasOwnProperty('init'))
				obj.init();
		}
	},

	start : function() {
		for (var key in sceneObjs) {
			if(!sceneObjs.hasOwnProperty(key)) 
				continue;

			var obj = sceneObjs[key];
			if (obj.hasOwnProperty('start'))
				obj.start();
		}
	},
};