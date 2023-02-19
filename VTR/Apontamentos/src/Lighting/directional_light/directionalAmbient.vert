#version 330

uniform mat4 m_pvm;
uniform mat4 m_viewModel;
uniform mat4 m_view;
uniform mat3 m_normal; 
uniform vec4 diffuse;
uniform vec4 ambient;

uniform vec4 l_dir; 

in vec4 position; 
in vec3 normal;   

out vec4 color;

void main() {
    // Transformar ambos os vectores para camera space
    vec3 n = normalize(normal * m_normal);
    vec3 l = normalize(vec3(m_view * -l_dir));
    
    float intensity = max(dot(n,l), 0.0);
    
    // Hipótese 1
    // color = intensity * diffuse + ambient;

    // Hipótese 2 - em alguns modelos pode ficar demasiado brilhante
    // color = (intensity + 0.33) * diffuse;

    // Hipótese 3 
    color = max(intensity * diffuse, ambient);

    gl_Position = m_pvm * position;
}