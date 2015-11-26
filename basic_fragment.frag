precision highp float;
varying vec3 vVertexNormal;
varying vec2 vUV0;
uniform sampler2D colorTexture0;

void main(void) {
	//vec3 color = vVertexNormal;
	gl_FragColor =  texture2D(colorTexture0, vUV0.st); //vec4(0.3, 0.6, 0.4, 1.0);
}