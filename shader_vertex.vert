attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform float uMaterialShininess;
uniform bool uShowSpecularHighlights;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform mat4 lightMVMatrix;

varying vec2 vTextureCoord;
varying vec4 mvPosition;
varying vec4 shadowTexCoord;
varying vec3 transformedNormal;

uniform mat4 uMVMatrix;

uniform bool isLighting;
uniform bool layerTextures;

void main(void) {
    mvPosition =  uMMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uVMatrix * mvPosition;
    vTextureCoord = aTextureCoord;

    //Transform the point normal due to rotation
    transformedNormal = uNMatrix * normalize(aVertexNormal);
}