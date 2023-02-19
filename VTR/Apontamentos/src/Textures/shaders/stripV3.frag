#version 330

uniform sampler2D tex;
uniform float div;

in vec2 texCoordV;

out vec4 colorOut;

void main() {
    vec2 t = texCoordV * div;
    colorOut = texture(tex, t);
}