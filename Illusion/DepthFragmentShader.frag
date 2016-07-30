#version 330 core

in vec2 UV;

out vec3 color;

uniform sampler2D renderedTexture;

void main() {
    
    float depth = texture(renderedTexture, UV).r;
    color = vec3(depth, depth, depth);
    
//    color += texture(renderedTexture, UV*1.07).xyz * 0.25;
//    color += texture(renderedTexture, UV*(-1.07)).xyz * 0.25;
//    color += texture(renderedTexture, UV*1.01).xyz * 0.25;
}