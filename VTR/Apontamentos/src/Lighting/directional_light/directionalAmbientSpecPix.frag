#version 330

uniform	vec4 diffuse;
uniform	vec4 specular;
uniform	float shininess;

in Data {
	vec4 eye;
	vec3 normal;
	vec3 l_dir;
} DataIn;

out vec4 color;

void main() {

	vec4 spec = vec4(0.0);

	vec3 n = normalize(DataIn.normal);
	vec3 e = normalize(vec3(DataIn.eye));
	vec3 l = DataIn.l_dir;
	
	float intensity = max(dot(n,l), 0.0);

	if (intensity > 0.0) {
		vec3 h = normalize(l + e);	
		float intSpec = max(dot(h,n), 0.0);
		spec = specular * pow(intSpec,shininess);
	}

	color = max(intensity *  diffuse + spec, diffuse * 0.35);
}