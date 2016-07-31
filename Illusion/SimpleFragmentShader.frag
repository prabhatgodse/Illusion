#version 330 core
layout(location=0) out vec3 color;
in vec3 vertWorldSpace;
in vec3 transformedNormal;
in vec2 uvs;
in vec4 fragPosLightSpace;

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

void main()
{
    float shadow = getShadowFactor();
    
    float lightVal = max(dot(dirLightVec, transformedNormal), 0);
    
    float depth = texture(depthTexture, uvs).r;
    color = baseColor * dirLightColor * lightVal; //texture(myTexture, uvs).rgb * ; //+ dirLightColor * lightVal * vertWorldSpace;
    color *= shadow;
    color += vec3(0.15, 0.01, 0.09);
}