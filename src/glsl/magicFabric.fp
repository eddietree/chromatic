 precision mediump float;

uniform sampler2D uTexRainbow;
uniform float uColorize;
uniform float uGlobalAlpha;

varying vec4 vFreqData0;
varying vec4 vFreqData1;
varying vec4 vFreqData2;

varying vec3 vNormal;
varying vec3 vColor;
varying vec4 vLightData;
varying float vTime;
varying float vRingPulse;
varying vec4 vSoothingLightData;
 
 vec3 getRainbowColor(float val) {
  vec3 color = texture2D(uTexRainbow, vec2(val, 0.0)).xyz;
  return color;
}

void main() {

	float rainbowSpeed = 0.5;

	vec3 color = vColor;
	color += mix( getRainbowColor(vLightData.x * vFreqData0.z + vTime*rainbowSpeed + vLightData.z*0.2), vec3(1.0), vLightData.x) * vLightData.x * vFreqData0.w; // freq0
	color += mix( getRainbowColor(vLightData.y * vFreqData1.z + vTime*rainbowSpeed + vLightData.z*0.2), vec3(1.0), vLightData.y) * vLightData.y * vFreqData1.w; // freq0
	color += mix( getRainbowColor(vLightData.z * vFreqData2.z + vTime*rainbowSpeed + vLightData.z*0.2), vec3(1.0), vLightData.z) * vLightData.z * vFreqData2.w; // freq0

	//color += (getRainbowColor(vLightData.w * 250.0 + vTime*rainbowSpeed* 2.0)+vec3(vLightData.w)*0.2) * vLightData.w * 0.3; // soothing light
	//color += vLightData.w * vec3(0.25, 0.25, 0.55); // soothing light
	//color += vLightData.w * vec3(0.2, vNormal.x*0.5+0.5, vNormal.y*0.5+0.5)*0.6; // soothing light

	// pulse
	color += getRainbowColor(vRingPulse + vTime* 10.0) * vRingPulse * 0.3;

	// random color
	color += vLightData.xyz*uColorize;

	// soothing light
	color += vSoothingLightData.xyz * vSoothingLightData.w;

	gl_FragColor = vec4(color * uGlobalAlpha, 1.0) ;
	//gl_FragColor = vec4(color, 1.0) ;
}