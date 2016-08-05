#version 330 core

// Input vertex data, different for all executions of this shader.
layout(location = 0) in vec3 vertexPosition_modelspace;
layout(location = 1) in vec3 normalVector;
layout(location = 2) in vec2 uvsVector;

uniform mat4 MVP;   //TODO: this is just ViewProjectionMartix
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 viewInverseMat;
uniform mat4 normalMatrix;

out vec3 vertWorldSpace;
out vec3 transformedNormal;
out vec2 uvs;
out vec4 fragPosLightSpace;
out vec3 eyePos;

uniform vec3 dirLightVec;
uniform vec3 dirLightColor;

uniform mat4 uniformLightMat;

void main(){
    mat4 vM = viewMatrix;
    vertWorldSpace = (modelMatrix * vec4(vertexPosition_modelspace, 1.0)).xyz;
    transformedNormal = (normalMatrix * normalize(vec4(normalVector, 1.0))).xyz;
    uvs = uvsVector;
    gl_Position = MVP * vec4(vertWorldSpace, 1);
    
    fragPosLightSpace = uniformLightMat * modelMatrix * vec4(vertexPosition_modelspace, 1.0);
    
    //Get camera vector
    eyePos = viewInverseMat[3].xyz;
}