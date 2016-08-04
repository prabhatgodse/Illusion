#version 330 core
layout(location=0) out vec4 color;
in vec3 vertWorldSpace;
in vec3 transformedNormal;
in vec2 uvs;
in vec4 fragPosLightSpace;
in vec3 eyePos;

uniform vec3 dirLightVec;
uniform vec3 dirLightColor;
uniform vec4 baseColor;

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
    float G_SCATTERING = 0.5;
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
    vec3 dirLightVecNorm = normalize(dirLightVec);
    
    for(int i = 0; i < NB_STEPS; i++) {
        //Shadow:1 indicates the light is visible
        float shadow = getShadowFactor();
        if(shadow == 1.0) {
            //Compute the scattering from light
            float scatter = ComputeScattering(dot(rayDir, dirLightVecNorm));
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
    
    float lightVal = max(dot(normalize(dirLightVec), normalize(transformedNormal)), 0);
    
    vec3 matColor = baseColor.rgb;
    vec3 fragColor = matColor * dirLightColor * lightVal; // texture(myTexture, uvs).rgb * ; //+ dirLightColor * lightVal * vertWorldSpace;
    fragColor *= shadow;
    fragColor += vec3(0.10, 0.09, 0.11);
//    color += computeVolumetric();
    color = vec4(fragColor.rgb, baseColor.a);
}