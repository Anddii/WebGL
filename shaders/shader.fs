varying lowp vec4 vColor;
varying lowp vec3 vNormal;

varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
      highp vec3 vDir = normalize(vec3(0,1,0));
      highp float directional = max(dot(vDir, vNormal), 0.0);
      highp vec3 vLighting = vec3(vColor*0.5) + (vec3(0.5,0.5,0.54) * directional);
      gl_FragColor=vec4(vNormal, 1);

      // highp vec2 uv = gl_FragCoord.xy/vec2(640,480).xy;
      // highp vec3 col = 0.5 + 0.5*cos(uv.xyx+vec3(0,2,4));
      // gl_FragColor=vec4(col,1.0);
}