precision mediump float;

uniform sampler2D uTexRainbow;

varying vec3 vColor;
varying float vTime;
varying vec3 vRandData;
varying float vPulsateCoeff;
 
void main() {

  	vec2 uv = gl_PointCoord.st;
  	vec2 uvNorm = uv*2.0 - vec2(1.0);

  	float len = length(uvNorm);
  	if(len > 1.0)
  		discard;

  	//vec3 color = 
  	float glistenPulsate = sin(vTime*mix(1.0, 3.0, vRandData.y) + vRandData.x * 100.0)*0.5+0.5;
    vec3 rainbowColor = texture2D(uTexRainbow, vec2(len * 1.0 - vTime*0.5 + vRandData.x, 0.0)).xyz;;

    vec3 color = mix(rainbowColor, vec3(1.0), pow(glistenPulsate,2.5));
    color += vPulsateCoeff * 10.0;

  	float alpha = glistenPulsate * smoothstep(0.1,1.5,1.0-len) * mix( 0.2, 0.8, vRandData.z);
    alpha *= smoothstep(0.0,(1.0-glistenPulsate*glistenPulsate),len);

    //alpha = 1.0;
    gl_FragColor = vec4(color, alpha);
  }