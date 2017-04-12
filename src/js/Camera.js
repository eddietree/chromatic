var settings = require('./Settings.js');

var camera = new THREE.PerspectiveCamera(settings.cameraFOV, window.innerWidth / window.innerHeight, 0.1, 10000);

module.exports = {
	obj: camera,

	init: function() {
	},

	update: function() {
	}
};