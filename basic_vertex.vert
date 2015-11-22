attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uVMatrix;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;

varying vec3 vVertexNormal;
varying vec2 vUV;

void main (void) {
	vVertexNormal = aVertexNormal;
	vUV = aTextureCoord;

	gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
}