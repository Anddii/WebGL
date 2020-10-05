attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uLightSpaceMatrix;
void main()
{   
    gl_Position = uLightSpaceMatrix * uModelViewMatrix * aVertexPosition;
}