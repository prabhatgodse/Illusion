#version 330 core

in vec2 UV;

layout(location=0) out vec4 color;
uniform sampler2D quadTexture;

void main() {
    float factor = 0.001;
    
    vec3 renderColor = texture(quadTexture, vec2(UV.x - factor, UV.y - factor)).xyz;
    renderColor += texture(quadTexture, vec2(UV.x + factor, UV.y + factor)).xyz;
    renderColor += texture(quadTexture, vec2(UV.x - factor, UV.y + factor)).xyz;
    renderColor += texture(quadTexture, vec2(UV.x + factor, UV.y - factor)).xyz;
    renderColor /= 4.0;
    
    color = texture(quadTexture, UV).rgba;
}