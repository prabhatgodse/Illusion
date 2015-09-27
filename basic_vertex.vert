attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aUV;

uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

varying vec3 vVertexNormal;
varying vec2 vUV;

void main (void) {
	vVertexNormal = aVertexNormal;
	vUV = aUV;

	gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);
}