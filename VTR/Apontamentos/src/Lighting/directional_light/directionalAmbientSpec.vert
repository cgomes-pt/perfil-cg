#version 330


uniform mat4 m_pvm;
uniform mat4 m_view;
uniform mat4 m_viewModel;
uniform mat3 m_normal;

uniform vec4 diffuse;
uniform vec4 ambient;
uniform vec4 specular;
uniform float shininess;

uniform vec4 l_dir;

in vec4 position;
in vec3 normal;

out vec4 color;

void main() {

    vec4 spec = vec4(0.0);
    
    vec3 n = normalize(normal * m_normal);
    vec3 ld = normalize(vec3(m_view * -l_dir));

    float intensity = max(0.0, dot(n,ld));

    if (intensity > 0.0) {
        vec3 pos = vec3(m_viewModel * position);
        vec3 eye = normalize(-pos);
        vec3 h = normalize(ld + eye);
        
        float inSpec = max(0.0, dot(h,n));
        spec = specular * pow(inSpec, shininess);
    }
    color = max(intensity * diffuse + spec, diffuse * 0.25);

    gl_Position = m_pvm * position;
}