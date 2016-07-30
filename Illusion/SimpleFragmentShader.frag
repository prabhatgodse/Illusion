#version 330 core
layout(location=0) out float color;
in vec3 vertWorldSpace;
in vec3 transformedNormal;
in vec2 uvs;

uniform vec3 dirLightVec;
uniform vec3 dirLightColor;

uniform sampler2D myTexture;

float near = 0.1;
float far  = 100.0;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // Back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}


void main()
{

    float lightVal = max(dot(dirLightVec, transformedNormal), 0);
    
//    color = texture(myTexture, uvs).rgb + dirLightColor * lightVal * vertWorldSpace;
    
    color = gl_FragCoord.z;
}