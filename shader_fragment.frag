precision highp float;

struct PointLight {
    vec3 position;
    vec3 diffuseColor;
    vec3 specularColor;
};

struct SpotLight {
    vec3 position;
    vec3 direction;
    float coneAngle;
    vec3 color;
    //Linear attenuation 
    float linearAtt;
};
uniform SpotLight spot_lights[1];
uniform PointLight point_lights[2];
varying vec4 mvPosition;
varying vec4 shadowTexCoord;

varying vec2 vTextureCoord;
varying vec3 transformedNormal;

uniform mat4 uMVMatrix;

uniform sampler2D uSampler;
uniform sampler2D uDepthSampler;

uniform float uAlpha;
uniform bool layerTextures;
uniform bool useTexture;
uniform float uPhongComponent;

uniform vec3 uLightingDirection;
uniform vec3 pointLightPosition;

uniform vec3 pointLightPosition2;

uniform vec3 uAmbientColor;
uniform vec3 uPointLightDiffuseColor;
uniform vec3 uPointLightSpecularColor;

uniform vec3 uMaterialDiffuseColor;
uniform vec3 uMaterialSpecularColor;


//Computes the spot light color for the given position.
//Based on the cone angle.
vec3 calculateSpotlightColor(vec3 pos) {
    float sDistance = distance(pos, spot_lights[0].position);
    vec3 spotPosMV = spot_lights[0].position;
    vec3 sDir = normalize(pos - spotPosMV.xyz );

    vec4 spotDirMV = vec4(0.0, -1.0, 5.0, 1.0);
    float coneVertexAngle = dot( spotDirMV.xyz, sDir);
    if(coneVertexAngle > (1.0 - spot_lights[0].coneAngle) ) {
        return spot_lights[0].color;
    }
    return vec3(0.0, 0.0, 0.0);
}

void main(void) {
    if(uAlpha < 1.0) {
        gl_FragColor = vec4(0.4, 0.4, 0.3, uAlpha);
    } else {
        //Get the specular effects due to light
        vec3 normal = normalize(transformedNormal);
        vec3 eyeDirection = normalize(-mvPosition.xyz);
        vec3 lightDirection = vec3(0.0, 0.0, 0.0);

        float diffuseLightWeighting = 0.0;

        vec3 vLightWeighting = uAmbientColor;
        for(int i = 0; i < 2; i++) {
            lightDirection = normalize(point_lights[i].position - mvPosition.xyz);
             diffuseLightWeighting += max(dot(normal, lightDirection), 0.0);
            vLightWeighting += point_lights[i].diffuseColor * diffuseLightWeighting;
        }
        //Calculate specular light weight
        lightDirection = normalize(point_lights[0].position - mvPosition.xyz);
        vec3 reflectionDirection = reflect(-lightDirection, normal);
        float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uPhongComponent);

        //Calculate final light weighting
        vLightWeighting += point_lights[0].specularColor * specularLightWeighting;

        //Calculate spot light parameters
        vLightWeighting += calculateSpotlightColor(mvPosition.xyz) * diffuseLightWeighting;

        //float distance_attenuation = distance(pointLightPosition, mvPosition.xyz) * 10.0;
        vec4 fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        if(useTexture) {
            vec4 textureColor1 = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            vec4 textureColor2 = texture2D(uDepthSampler, vec2(vTextureCoord.s, vTextureCoord.t));

            vec4 textureColor = vec4(0.0, 0.0, 0.0, 1.0);
            if(layerTextures)
                textureColor = vec4(textureColor1.r + textureColor2.r*0.6, textureColor1.g + textureColor2.g*0.35, textureColor1.b + textureColor2.b*0.7, 1.0);
            else
                textureColor = textureColor1;

            fragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a * uAlpha);
        } else {
            fragColor = vec4( uMaterialDiffuseColor * diffuseLightWeighting + (uMaterialSpecularColor + point_lights[0].specularColor) * specularLightWeighting, uAlpha);
        }
        gl_FragColor = fragColor;
    }
}