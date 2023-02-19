#version 330

uniform vec4 diffuse;
uniform vec4 otherColor;
uniform float div;
uniform float width;
uniform float factor;

in vec2 texCoord;

out vec4 color;

void main() {

	vec2 tc = texCoord * div;

	float fr = fract(tc.s);
	
	vec2 deriv = vec2(dFdx(tc.s), dFdy(tc.s));
	float len = length(deriv);
	
	float actualGap = len * factor;
	
	float f = smoothstep(width - actualGap, width, fr) - smoothstep(1.0 - actualGap, 1.0, fr);	
	color = mix(diffuse, otherColor, f);
}