# Texturas

Texturas não são apenas imagens, também podem ser vistas como um array de data,  por exemplo, podem ser utilizadas para colorizar um modelo.

### Coordenadas de textura

  Vertex Shader 
    
    #version 330
    uniform mat4 pvm;
    
    in vec4 position;
    in vec2 texCoord;
    
    out vec2 texCoordV;
    
    void main() {
	    texCoordV = texCoord;
	    gl_Position = pvm * position;
    }
Fragment Shader

    #version 330
    
    in vec2 texCoordV;
    
    out vec4 color;
    
    void main() {
	    color = vec4(texCoord,0.0,0.0);
    }

### Grid Effect
![Grid Effect](https://i.imgur.com/ezCJvcg.png)

Para conseguir este efeito, será necessário em alguns pixeis terem a cor azul e dar discard nos pixeis restantes, para isto iremos utilizar `discard`.
O fragment shader irá então escolher os pixeis que tiverem as coordenadas da textura com valor fract acima de 0.1 e irá pintar com cor azul. Relativamente ao vertex shader, não será necessário nenhuma mudança.

    #version 330
    
    uniform int multFactor = 8;
    uniform float threshold = 0.1;
    
    in vec2 texCoordV;
    
    out vec4 color;
    
    void main() {
	    vec2 t = texCoordV * multFactor;
	    if (fract(t.s) < threshold || fract(t.t) < threshold)
		    color = vec4(0.0,0.0,1.0,1.0);
		else
			discard; 
    }

### Strip Effect

![strip effect](https://i.imgur.com/xKrJCEP.png)

Para fazer o efeito de strip, o procedimento é praticamente igual, só que em vez de fazer discard, escolhe outra cor.

    #version 330
    
    uniform int multFactor = 8;
    uniform float threshold = 0.1;
    
    in vec2 texCoordV;
    
    out vec4 color;
    
    void main(){
	    vect t = texCoordV * multFactor;
	    
	    if (fract(t.s) < 0.5) 
		    color = vec4(0.0, 0.0, 1.0, 1.0);
		else
			color = vec4(1.0, 1.0, 0.5, 1.0); 
    }

Apesar de termos conseguido o efeito que era pretendido, é possível melhorar o resultado com a utilização da interpolação das cores.
`mix(color1, color2, f) = color2 * f + color1 * (1-f)`

![interpolation](https://i.imgur.com/qKBQ9x3.png)

    #version 330
    
    uniform vec4 color1 = vec(0.0,0.0,1.0,1.0);
    uniform vec4 color2 = vec(1.0,1.0,0.5,1.0);
    
    in vec2 texCoordV;
    
    out vec4 color;
    
    void main() {
	    vec2 t = texCoordV * multFactor;
	  
	    if(fract(t.s) < 0.4) 
		    color = color1;
	    else if (fract(t.s) < 0.5)
		    color = mix(color1, color2, (f-0.4) * 10.0);
	    else if (fract(t.s) < 0.9)
		    color = color2;
	    else 
		    color = mix(color1, color2, (f-0.9) * 10.0);	
    }