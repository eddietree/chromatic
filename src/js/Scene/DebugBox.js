var TWEEN = require("tween.js");
var animitter = require("animitter");

var geometry, material, mesh;

module.exports = {
	init : function() {
		geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
	    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false } );
	    mesh = new THREE.Mesh( geometry, material );

	    var scene = require('./Scene.js');
	    scene.obj.add( mesh );
	},

	start : function() {
	    var tween = new TWEEN.Tween(mesh.position).to({y:1, z: -1}, 1100).easing(TWEEN.Easing.Elastic.Out).start();

	    var loop = animitter(function(deltaTime, elapsedTime, frameCount){
	    	//mesh.rotation.x += 0.01;
    		//mesh.rotation.y += 0.02;
		}).start();
	},
};