precision mediump float;

uniform sampler2D uTexRainbow;
uniform sampler2D uTexPerlin;
uniform sampler2D uTexMask;
uniform float uGlobalAlpha;
uniform vec4 uAlphaFadeDist;
uniform vec4 uPerlinParams;
uniform vec3 uCamPos;

varying vec2 vUv;
varying float vTime;
varying vec3 vNormal;
varying vec3 vPosBase;
varying vec3 vPosWorld;
varying float vNoise;
varying vec4 vColorTint;
varying vec4 vColorParams;
 
vec3 getRainbowColor(float val) {
  vec3 color = texture2D(uTexRainbow, vec2(val, 0.0)).xyz;
  return color;
}

void main() {
  float rainbowFreq = vColorParams.x;
  float rainbowSpeed = vColorParams.y;
  float fadeFreq = vColorParams.z;
  float fadeSpeed = vColorParams.w;

  float perlin = texture2D(uTexPerlin, vec2(vUv.x*uPerlinParams.z, vTime*1.0)).x;

  vec3 color = getRainbowColor((vPosBase.y+vPosBase.z)*0.1 + vNoise*0.2 + perlin*uPerlinParams.x + vUv.x*rainbowFreq - vTime*rainbowSpeed );
  color *= vColorTint.xyz;

  float distAlphaMin = uAlphaFadeDist.x*uAlphaFadeDist.x;
  float distAlphaMax = uAlphaFadeDist.y*uAlphaFadeDist.y;
  vec3 dirToCam = vPosWorld-uCamPos;
  float distToCamSqr = dot(dirToCam,dirToCam);

  // alpha
  float alpha = vColorTint.w * vColorTint.w;
  alpha -= perlin*uPerlinParams.y;
  alpha *= smoothstep(distAlphaMin, distAlphaMax, distToCamSqr);
  alpha *= uGlobalAlpha;

  gl_FragColor = vec4(color, alpha);
}