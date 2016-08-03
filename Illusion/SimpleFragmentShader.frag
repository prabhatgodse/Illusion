#version 330 core
layout(location=0) out vec3 color;
in vec3 vertWorldSpace;
in vec3 transformedNormal;
in vec2 uvs;
in vec4 fragPosLightSpace;
in vec3 eyePos;

uniform vec3 dirLightVec;
uniform vec3 dirLightColor;
uniform vec3 baseColor;

uniform sampler2D myTexture;
uniform sampler2D depthTexture;

float getShadowFactor() {
    vec3 projCoord = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoord = projCoord * 0.5 + 0.5;
    float depthFromTex = texture(depthTexture, projCoord.xy).r;
    float currentDepth = projCoord.z;
    
    float bias = 0.005;
    float shadow = currentDepth - bias > depthFromTex ? 0.0 : 1.0;
    
    return shadow;
}

#define PI 3.1415926535897932384626433832795

float ComputeScattering(float lightDotView)
{
    float G_SCATTERING = 0.2;
    float result = 1.0f - G_SCATTERING;
    result *= result;
    result /= (4.0f * PI * pow(1.0f + G_SCATTERING * G_SCATTERING - (2.0f * G_SCATTERING) *      lightDotView, 1.5f));
    return result;
}

//Compute volumetric lights using raymarching
vec3 computeVolumetric() {
    int NB_STEPS = 5;
    
    vec3 rayVector = eyePos - vertWorldSpace;
    float rayLength = length(rayVector);
    vec3 rayDir = rayVector / rayLength;
    
    float stepLength = rayLength / NB_STEPS;
    
    vec3 stepRay = rayDir * stepLength;
    vec3 currentPos = vertWorldSpace;
    
    vec3 lightFog = vec3(0.0);
    for(int i = 0; i < NB_STEPS; i++) {
        //Shadow:1 indicates the light is visible
        float shadow = getShadowFactor();
        if(shadow == 1.0) {
            //Compute the scattering from light
            float scatter = ComputeScattering(dot(rayDir, dirLightVec));
            lightFog += dirLightColor * scatter;
        }
        currentPos += stepRay;
    }
    lightFog /= NB_STEPS;
    return lightFog;
}

void main()
{
    float shadow = getShadowFactor();
    
    float lightVal = max(dot(dirLightVec, transformedNormal), 0);
    
    color = baseColor * dirLightColor * lightVal; //texture(myTexture, uvs).rgb * ; //+ dirLightColor * lightVal * vertWorldSpace;
//    color *= shadow;
    color += vec3(0.15, 0.01, 0.09);
//    color += computeVolumetric();
}