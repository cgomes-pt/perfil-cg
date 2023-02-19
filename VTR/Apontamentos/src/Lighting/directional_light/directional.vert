#version 330

uniform mat4 m_pvm;
uniform mat4 m_viewModel;
uniform mat4 m_view;
uniform mat3 m_normal; 
uniform vec4 diffuse;
uniform vec4 ambient;

uniform vec4 l_dir; // Camera Space

in vec4 position; // Local Space
in vec3 normal;   // Local Space

out vec4 color;
void main() {
    // Transformar ambos os vectores para camera space
    vec3 n = normalize(normal * m_normal);
    vec3 l = normalize(vec3(m_view * -l_dir));
    
    float intensity = max(dot(n,l), 0.0);
    
    // Calcular as cores
    color = intensity * diffuse;

    gl_Position = m_pvm * position;
}