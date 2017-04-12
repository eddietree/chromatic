module.exports = {
	init : function() {

		let scene = require("./Scene.js");

	    // add arrows
		var origin = new THREE.Vector3( 0, 0, 0 );
		var length = 1;
		var headLength = 0.2;
		var headWidth = 0.1;
		scene.obj.add( new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), origin, length, 0xff0000, headLength, headWidth ));
		scene.obj.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), origin, length, 0x00ff00, headLength, headWidth ));
		scene.obj.add( new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), origin, length, 0x0000ff, headLength, headWidth ));
	},
};