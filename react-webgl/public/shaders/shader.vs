attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uLightSpaceMatrix;
uniform vec3 aMaterialColor;

varying highp vec4 vColor;
varying highp vec3 vNormal;
varying highp vec3 vFragPos;
varying highp vec4 vFragPosLightSpace;
varying highp vec2 vTextureCoord;

void main(void) {
    vFragPos = vec3(uModelViewMatrix * aVertexPosition);
    vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
    vColor = aVertexColor*vec4(aMaterialColor,1);
    vTextureCoord = aTextureCoord;
    vFragPosLightSpace = uLightSpaceMatrix * vec4(vFragPos, 1.0);
    
    gl_Position = uProjectionMatrix * uViewMatrix * uModelViewMatrix * aVertexPosition;
}