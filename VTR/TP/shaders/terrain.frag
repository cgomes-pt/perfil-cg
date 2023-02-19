#version 330

uniform sampler2D water, grass, water_sand, sand, mountain, snow, snow_mountain, water_ice, terrain_ice, mars, cracks;

uniform	vec4 diffuse;
uniform	vec4 specular;
uniform	float shininess;
uniform float strength;
uniform float minValue;
uniform int planet_mars;

in Data {
	vec3 normal;
	vec3 l_dir;
	vec4 eye;
	float noise;
	vec2 texCoord;
} DataIn;

out vec4 colorOut;

void main() {
	vec4 spec =  vec4(0,0,0,0);

	// normalize
	vec3 n = normalize(DataIn.normal);
	vec3 l = DataIn.l_dir;
	vec3 e = normalize(vec3(DataIn.eye));

	// define intensity 
	float intensity = max(dot(n,l), 0.0);

	// Constant values
	vec4 colorWater = texture(water, DataIn.texCoord);
	vec4 colorCracks = texture(cracks, DataIn.texCoord);
	vec4 colorWaterIce = texture(water_ice, DataIn.texCoord);
	vec4 colorSnowMountain = texture(snow_mountain, DataIn.texCoord);
	vec4 colorTerrainIce = texture(terrain_ice, DataIn.texCoord);	 
	vec4 colorSand = texture(sand, DataIn.texCoord);
	vec4 colorMountain = texture(mountain, DataIn.texCoord);
	vec4 colorGrass = texture(grass, DataIn.texCoord);
	vec4 snow = texture(snow, DataIn.texCoord);


	if (intensity > 0.0) {
		vec3 h = normalize(l + e);
		float inSpecular = max(dot(h,n),0.0);
		spec = specular * pow(inSpecular, shininess);
	}

	if (planet_mars == 0) {

		if (DataIn.noise == 0) {

			colorOut = max(intensity * colorWater * diffuse + spec, colorWater * diffuse * 0.35);
		}
		else if (DataIn.noise < 0.01) {
		 
			float color = smoothstep(0.0,0.01,DataIn.noise);
			colorOut = max(intensity * mix(colorWater,colorSand,color) * diffuse + spec, mix(colorWater,colorSand,color) * diffuse * 0.35);
		}
		else if (DataIn.noise < 0.15) {
 			colorOut = max(intensity * colorSand * diffuse + spec, colorSand * diffuse * 0.35);
		} else if (DataIn.noise < 0.16) {
		 
			float color = smoothstep(0.0,0.01,DataIn.noise);
			colorOut = max(intensity * mix(colorSand,colorGrass,color) * diffuse + spec, mix(colorSand,colorGrass,color) * diffuse * 0.35);
		} else if (DataIn.noise < 0.5) {
		 
			colorOut = max(intensity * colorGrass * diffuse + spec, colorGrass * diffuse * 0.35);
		} else if (DataIn.noise < 0.51) {
			float color = smoothstep(0.0,0.01,DataIn.noise);
			colorOut = max(intensity * mix(colorGrass, colorMountain,color) * diffuse + spec, mix(colorGrass,colorMountain,color) * diffuse * 0.35);
		} else if (DataIn.noise < 0.98) {
		 
			colorOut = max(intensity * colorMountain * diffuse + spec, colorMountain * diffuse * 0.35);
		} else if (DataIn.noise < 0.99) {
		float color = smoothstep(0.0,0.01,DataIn.noise);
			colorOut = max(intensity * mix(colorMountain, snow,color) * diffuse + spec, mix(colorMountain,snow,color) * diffuse * 0.35);

		}else {
			colorOut = max(intensity * snow * diffuse + spec, snow * diffuse * 0.35);
		}
	}
	else {
		vec4 colorTerrain = texture(mars, DataIn.texCoord);
		if (DataIn.noise == 0) {
			colorOut = max(intensity * colorCracks * diffuse + spec, colorCracks * diffuse * 0.35);
		}
		else {
			// Water and sand transition or Water and grass transition
			float color = smoothstep(0.0,0.01,DataIn.noise);
			colorOut = max(intensity * mix(colorCracks,colorTerrain,color) * diffuse + spec, mix(colorCracks,colorTerrain,color) * diffuse * 0.35);
		}

	}

}