var glslify = require('glslify');

var shaders = {
	'default.vp' : glslify('./../glsl/default.vp'),
	'default.fp' : glslify('./../glsl/default.fp'),
	'magicSphere.vp' : glslify('./../glsl/magicSphere.vp'),
	'magicSphere.fp' : glslify('./../glsl/magicSphere.fp'),
	'magicRings.vp' : glslify('./../glsl/magicRings.vp'),
	'magicRings.fp' : glslify('./../glsl/magicRings.fp'),
	'magicFabric.vp' : glslify('./../glsl/magicFabric.vp'),
	'magicFabric.fp' : glslify('./../glsl/magicFabric.fp'),
	'magicGlitter.vp' : glslify('./../glsl/magicGlitter.vp'),
	'magicGlitter.fp' : glslify('./../glsl/magicGlitter.fp'),
	'magicPrism.vp' : glslify('./../glsl/magicPrism.vp'),
	'magicPrism.fp' : glslify('./../glsl/magicPrism.fp'),
	'splashLines.vp' : glslify('./../glsl/splashLines.vp'),
	'splashLines.fp' : glslify('./../glsl/splashLines.fp'),
};

module.exports = {
	get:function(filename) {
		return shaders[filename];
	}
};