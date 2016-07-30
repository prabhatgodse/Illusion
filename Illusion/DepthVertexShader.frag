#version 330 core

layout(location = 0) in vec3 vertexPosition_modelspace;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 MVP;

void main(){
    vec3 vertWorldSpace = (modelMatrix * vec4(vertexPosition_modelspace, 1.0)).xyz;
    gl_Position =  MVP * vec4(vertWorldSpace, 1);
}