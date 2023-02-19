#version 330

uniform vec4 color1 = vec4(0.0, 0.0, 1.0, 1.0);
uniform vec4 color2 = vec4(1.0, 1.0, 0.5, 1.0);


in vec2 texCoord;
out vec4 colorOut;

void main() {

	vec2 tc = texCoord * 8.0;
	
	if (fract(tc.s) < 0.1) 
        colorOut = color1;
    else 
		colorOut = color2;
}