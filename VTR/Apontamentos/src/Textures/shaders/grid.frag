#version 330


in vec2 texCoord;
out vec4 colorOut;

void main() {

	vec2 tc = texCoord * 8.0;
	
	if (fract(tc.s) < 0.1 && fract(tc.t) < 0.1) 
        colorOut = vec4(0.0, 0.0, 1.0, 1.0);
    else 
		discard;
}