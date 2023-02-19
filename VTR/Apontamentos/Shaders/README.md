#  Vertex and Fragment Shaders

## Vertex
Para começarmos a desenhar algo, precisamos de oferecer ao opengl informação sobre os vértices. Como o opengl é em 3D, todas as coordenadas também irão ser em 3D (x,y,z).
OpenGL não transforma todas as coordenadas em 2D pixeis, apenas processa as coordenadas 3D quando eles estão entre -1.0 e 1.0 [coordenadas normalizadas].

Exemplo:
```
     float vertices[] = {     
	     -0.5f, -0.5f, 0.0f,      
	     0.5f, -0.5f, 0.0f,      
	     0.0f,  0.5f, 0.0f 
     };  
```
Cada vertex normalmente tem:
 1. Position
 2. Texture
 3. Normal Vecture

Exemplo 2:
```
    in vec3 position;
    in vec3 normal;
    in vec3 textCoord;
    
    out VertexData {
	    vec2 textCoord;
	    vec3 normal;
	}
```

## Vertex Shaders 
Um vertex shader é realizado em vertices individuais, um de cada vez. Este shader não irá ter o conhecimento dos outros vértices e também não tem o conhecimento de tipo que primitive o vértice pertence

Estes vertex shader devem ter acesso às uniform variables que irão ser read-only

Um pequeno exemplo de vertex shader:

```
    #version 330
    in vec3 normal;
    in vec4 position;
    in vec2 textCoord;
    
    uniform mat4 m_pvm;
    uniform mat3 m_normal;
    
    out VertexData {
	    vec2 textCoord;
	    vec3 normal;
    }
    
    void main() {
	    VertexOut.textCoord = textCoord;
	    VertexOut.normal = normalize(normal * m_normal);
	    gl_Position = m_pvm * position;
	}
```

Portanto, irá receber atributos[position, normal e textCoord] definidos pelo utilizador e também irá receber duas matrizes que serão utilizadas para vertex e normal transformation.

## Fragment Shader
Basicamente no Fragment Shader é calcular a cor output dos pixeis. 
Há algumas diferenças entre o Fragment Shader e Vertex Shader, como por exemplo, o Fragment Shader requer uma variável  `vec4 color`, uma vez que os shaders precisam de gerar uma cor final output.  

Exemplo: 

```
    #version 330
    
    in vec4 color;
    
    out vec4 vertColor;
    
    void main() {
	    vertColor = color;
	}
```
    
## Pequenos pormenores
- Uniforms são variáveis globais e pode ser acedido por qualquer shader em qualquer altura do programa. Estas variáveis vão manter os valores até serem atualizados ou reseted.
- Cada fragment shader recebe uma **interpolação da cor** com base na posição da surface. 