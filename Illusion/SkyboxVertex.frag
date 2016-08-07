#version 330 core
layout (location=0) in vec3 vertexPosition_modelspace;
out vec3 UV;

uniform mat4 MVP;   //TODO: this is just ViewProjectionMartix
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 viewInverseMat;
uniform mat4 normalMatrix;

void main() {
    vec4 vertWorldSpace = modelMatrix * vec4(vertexPosition_modelspace, 1.0);
    vec4 position = MVP * vertWorldSpace;
    gl_Position = position.xyww;
    
    UV = normalize(vertexPosition_modelspace.xyz);
}