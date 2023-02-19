#version 330

uniform sampler2D texUnit;

in vec4 color;
out vec4 colorOut;

void main() {
    colorOut = vec4(color);
}