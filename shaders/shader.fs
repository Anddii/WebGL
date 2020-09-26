varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;
varying lowp vec4 vColor;

uniform sampler2D uSampler;

void main(void) {
      gl_FragColor = vec4(texture2D(uSampler, vTextureCoord).xyz*vColor.xyz * vLighting, texture2D(uSampler, vTextureCoord).a*vColor.a);
}