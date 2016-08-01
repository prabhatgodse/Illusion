#version 330 core

in vec2 UV;

layout(location=0) out vec3 color;
uniform sampler2D renderedTexture;

void main() {
    float factor = 0.0007;
    
    vec3 renderColor = texture(renderedTexture, vec2(UV.x - factor, UV.y - factor)).xyz;
    renderColor += texture(renderedTexture, vec2(UV.x + factor, UV.y + factor)).xyz;
    renderColor += texture(renderedTexture, vec2(UV.x - factor, UV.y + factor)).xyz;
    renderColor += texture(renderedTexture, vec2(UV.x + factor, UV.y - factor)).xyz;
    renderColor /= 4.0;
    
    color = renderColor;
}