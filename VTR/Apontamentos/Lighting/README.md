
# Lighting 


A Lighting é essêncial em Computação Gráfica. Cenários sem lighting parece "flat", oferecendo assim alguma dificuldade em perceber os objetos. 

Um **lighting model** determina como a luz é refletida num ponto particular. A cor nesse ponto vai depender principalmente da direção da luz, direção do viewer, das propriedades do material, entre outros.

Um **shading model** está relacionado em como os lighting models são usados em iluminar uma superfície. É possível calcular o valor da cor por cada triângulo, também conhecido como **Flat Shading**, ou calcular o valor da cor das vértices de um triângulo e fazer uma interpolação dos valores da cor para os pontos dentro do triângulo, **Gouraud Shading**. Também existe o **Phong Shading** que será calcular a cor para cada ponto da superfície.

## Cor 
Lighting está relacionado com a cor. Quando um objeto é iluminado, conseguimos observar a cor, se não houver iluminação, então será completamente preto.

Portanto, a cor irá consistir em:

 1. Diffuse, luz refletida por um objeto em todas as direções [normalmente é chamado a cor de um objeto]
 2. Ambient, é utilizado para simular iluminação refletida
 3. Specular, é a iluminação que mais reflete numa direção [normalmente é utilizada na reflexão da direção da luz com a normal da superfície] 
 4. Emissive, o objeto emite luz

![Diferenças](https://i.imgur.com/n1yrwEd.png)
## Transformações e Interpolação
### Espaços e Matrizes

 1. **Local Space** - o espaço onde os modelos são criados
 2. **Global/World Space** - onde montamos a cena 3D
 3. **Camera Space** - o espaço onde a câmara está na origem, a olhar na direção do eixo Z negativo

Para fazermos transformações entre espaços, vai ser necessário a existência de 4x4 Matrizes. 

 1. **Model Matrix** - para transformar de **local** para **world space**
 2. **View Matrix** - para transformar de **world space** para **camera space**
 3. Também iremos considerar a matrix **View Model** que será uma composição das duas anteriores: `viewModel = view * model`  

Ambos os modelos são normalmente construidos com base nas translações, rotações e escalas.

Então para transformarmos um ponto (que será um tuple `(x,y,z,1)` entre espaços, iremos utilizar então as matrizes acima: `P' = view * model * P` que é equivalente a `P' = viewModel * P`.

 
Isto aplica-se a todos os vectores que possam ser a diferença entre dois pontos. Portanto, transformar esse vector é equivalente a transformar cada ponto e calcular a diferença do ponto transformado.

`v = P2 - P1`
`v' = M * v = M * (P2 - P1) = M * P2 - M * P1 = P2' - P1'` 

**Isto não se aplica aos vectores normais**, portanto para transformarmos um vector normal iremos ter que utilizar uma matrix que transforma as normais de local space para camera space.
 
 
 No triângulo do lado esquerdo é o triângulo original com o vector normal e no lado direito temos a transformação onde todos os pontos e os vectores foram transformados com uma escala de (1,2,1).
 
O vector T é tangente à aresta do triângulo e pode ser definido como `T = P2 - P1`. A transformação de T' é equivalente à diferença da transformação dos pontos, isto é, `T' = viewModel x T = viewModel x (P2' - P1')`, o vector T' continua a ser tangente à aresta, mas o vector normal não é perpendicular. 

Para resolver este problema, vai ser necessário a existência de uma nova matrix que garante que o vector N'  seja perpendicular a T', esta matrix vai se chamar **normal matrix**. 

[Nota: Matrix G = Normal Matrix, M é uma matriz que transforma a matriz T]
Sabemos que depois de transformarmos ambos os vectores, devem ser perpendiculares, e para isso acontecer o dot product deve ser 0, portanto: `T' . G' = (M*T) . (G*N) = 0`

Passar de dot product para matrix product:
 `(M*T)^T x (G*N) = T^T * M^T * G * N`
 E se assumirmos que `M^T * G = I`, então:
 `T^T * M^T * G * N = T^T * I * N = T^T * N = T.N = 0`
 Sabemos então que a relação entre G e M é `M^T * G = I`, portanto ao multiplicarmos pela inversa da transposta de M em ambos os lados, obtemos:
 `G = (M^T)^-1`
Portanto, a normal matrix deve ser a inversa da transposta de M.


## Directional Lights
Quando estamos a fazer render de um objeto, é preciso variáveis uniformes para definir a luz e material. A directional light é definido pela sua direção, pelo que um `vec4`será suficiente [neste exemplo iremos assumir que a luz é branca, ou seja, (1,1,1,1)]. 

Neste exemplo iremos utilizar valores uniformes para a direção da luz e diffuse do objecto, ambos `vec4`.

Para calcular a intensidade da luz refletida através de **Lambertian diffuse reflection model**, calculamos o coseno entre o vector apontado à luz e o vector normal. Assumindo que ambos os vectores estão normalizados e estão definidos no mesmo espaço, podemos fazer o cálculo utilizando o dot product de ambos os vectores e multiplicar resultado deste mesmo pelo diffuse do material do objeto (Kd). 
A equação será então:  `I = Kd * cos(α) = Kd * (N . L) `

Para os shaders funcionarem com mais que uma luz, o programmer pode assumir que todas as luzes estão definidas no mesmo espaço. 
Portanto, ou transformarmos as propriedades da luz como a direção e a posição na aplicação e mandamos esses valores no common space para o shader, ou será necessário ter em conta onde a luz foi definida e transformar essas propriedades.

Assumindo que iremos trabalhar em Camera Space, as normais devem ser transformadas de Local Space para Camera Space, para isto iremos utilizar a normal matrix. Também iremos assumir que toda a informação que o shader recebe está no World Space, isto implica que o vector que representa a direção da luz deve ser transformado pelo view matrix.


    // Vertex Shader
    #version 330
    uniform mat4 m_pvm;
    uniform mat4 m_viewModel;
    uniform mat4 m_view;
    uniform mat3 m_normal; 
    
    uniform vec4 l_dir; // Camera Space
    
    in vec4 position; // Local Space
    in vec3 normal;   // Local Space
    
    in vec4 diffuse;

    out vec4 color;
    void main() {
	    // Transformar ambos os vectores para camera space
	    vec3 n = normalize(normal * m_normal);
	    vec3 l = normalize(vec3(m_view * l_dir));
	    
	    float intensity = max(dot(n,l), 0.0);
	    color = intensity * diffuse;
	    
	    gl_Position = m_pvm * position;
    }

O Fragment Shader irá ter apenas um trabalho que será receber a cor calculada no vertex shader e mostrar.

    #version 330
    
    in vec4 color;
    
    out vec4 colorOut;
    
    void main() {
	    colorOut = vec4(color);
    }
![resultado](https://i.imgur.com/S1vhQWW.png)

Ao utilizarmos estes shaders, iremos obter este resultado, no entanto é possível observar que há superfícies que estão completamente escuras.

### Adicionando ambiente

Até agora não tivemos em conta o ambiente, este vai ser uma constante que irá ser adicionada à cor calculada. Isto vai evitar que áreas que não estejam iluminadas que fiquem escuras. 
Portanto, a equação será então: `I = Kd * cos(α) + Kα` 

    #version 330
    in vec4 diffuse;
    in vec4 ambient;
    
    in mat4 m_pvm;
    in mat4 viewModel;
    in mat4 m_view;
    in mat3 m_normal;
    
    in vec4 l_dir;
    
    in vec4 position;
    in vec3 normal;
    
    out vec4 color;
    
    void main() {
	    vec3 n = normalize(m_normal * normal);
	    vec3 l = normalize(vec3(m_view * l_dir));
	    
	    float intensity = max(dot(n,l),0.0);
	    color = intensity * diffuse + ambient; 
    }
    
### Adicionando Specular 
Quando usamos materiais brilhantes há uma zona que a cor difere da diffuse, por exemplo, a maça pode ser verde mas a zona da luz é branca. Esta zona varia em tamanho, pode ser mais sharp em objetos metálicos, entre outros. A posição e a intensidade irá variar com a posição do observer.

![Calculo do vector refletido](https://i.imgur.com/sqYK9od.png)

Para calcular R será então: `R = -L + 2(N.L)*N`

**1. Phong**

![Phong](https://i.imgur.com/XfJvkeT.png)

A intensidade da zona deve ser calculada como o coseno de ângulo entre o vector R e o vector Eye. 
Sendo assim, a equação será: `Is = Ks * cos(β)`

**2. Blinn** 	

![Blinn](https://i.imgur.com/CeBfL2H.png)

Blinn propôs uma alternativa à equação utilizando um half-vector que será calculado através de `H = L + Eye`. 

Portanto a equação será: `Is = Ks * cos(N,H)`, conhecida como a equação **Blinn-Phong**. No entanto, o objeto pode ficar muito brilhante pelo que será necessário adicionar um novo termo `shininess` para controlar isso, `Is = Ks * cos(N,H)^shininess`

    // Exemplo de implementação de Blinn-Phong equation per vertex with the fragments getting interpolated colors
    // Gourad Lighting Model
    // vertex shader 
    #version 330
    
    layout uniform Matrices {
	    mat4 pvm;
	    mat4 viewModel;
	    mat3 view;
	    mat3 normal;
	} Matrix;
	
	layout uniform Materials {
		vec4 diffuse;
		vec4 ambient;
		vec4 specular;
		float shininess;
	} Material;
	
	in vec4 l_dir;
	in vec4 position;
	in vec3 normal;
	
	out vec4 color;
	
	void main(){
		vec4 spec = vec4(0.0);
		vec3 n = normalize(Matrix.normal * normal);
		vec3 l = normalize(Matrix.view * l_dir);
		float intensity = max(0.0,dot(n,l));
		
		if (intensity > 0) {
			vec3 pos = vec3(Matrix.viewModel * position);
			vec3 eye = normalize(-pos);
			vec3 h = normalize(l + eye);
			float intSpec = max(0.0,dot(h,n));
			spec = Material.specular + pow(intSpec, Material.shininess);
		}
		
		color = max(intensity * Material.diffuse + spec, Material.ambient);
		
		gl_position = Matrix.pvm * position;
	}
	
### Lighting Per Pixel
Para isto iremos basicamente usar o modelo **Phong Lighting Model**, i.e., calcular a cor por cada fragmento.
Irá ser necessário:

 1. normal
 2. direção da luz
 3. vector eye
 
 O vertex shader deve calcular esses vectores por cada vector para serem então interpolados e passados para o fragment shader.

    #version 330
    layout uniform Matrices {
	    mat4 pvm;
	    mat4 viewModel;
	    mat4 view;
	    mat4 normal;
	} Matrix;
	
	uniform vec4 l_dir;
	
	in vec4 position;
	in vec3 normal;
	
	out Data {
		vec3 normal;
		vec3 eye;
		vec3 l;
	} DataOut;
	
	void main() {
		DataOut.normal = normalize(normal * Matrix.normal);
		DataOut.l = normalize(view * l_dir);
		DataOut.eye = -vec3(Matrix.viewModel * position);
		gl_Position = Matrix.pvm * position;
	}
	    
O fragment shader irá então receber os vectores interpolados e fazer o resto dos cálculos.

    #version 330
  
    layout uniform Materials {
	    vec4 diffuse;
	    vec4 ambient;
	    vec4 specular;
	    float shininess;
	} Material;
	
	in Data {
		vec3 normal;
		vec3 eye;
		vec3 l_dir;
	} DataIn;
	
	out vec4 color;
	
	void main() {
		vec4 spec = vec(0.0);
		vec3 n = normalize(DataIn.normal);
		vec3 l = normalize(DataIn.l_dir);
		vec e = normalize(DataIn.eye);
		
		float intensity = max(0.0,dot(n,l));
	
		if (intensity > 0.0) {
			vec3 h = normalize(l+e);
			float intSpec = max(0.0,dot(h,n));
			spec = Material.specular * pow(intSpec, Material.shininess);
		}
		color = max(intensity * Material.diffuse + spec, Material.ambient);
	}

## Point Lights 

A diferença é que em vez de utilizarmos uma direção, utilizamos uma posição para a luz. 
Portanto, o vertex shader irá receber uma posição de luz e deve calcular a direção da luz para cada vértice. 

    // Vertex Shader
    #version 330
    layout uniform Matrices {
	    mat4 pvm;
	    mat4 view;
	    mat4 viewModel;
	    mat3 normal;
	} Matrix;
	
	in vec4 l_pos;
	in vec4 pos;
	in vec3 normal;
	
	out Data {
		vec3 normal;
		vec3 eye;
		vec3 l;
	} DataOut;
	
	void main() {
		vec4 pos = Matrix.viewModel * position;	
		vec4 l_pos = 	Matrix.view * pos;
		DataOut.normal = normalize(Matrix.normal * normal);
		Data.l = vec(lpos-pos);
		gl_Position = Matrix.pvm * position;
	}
	
	
## Spotlights
O vertex shader utilizado será o mesmo que foi definido para o **Point Light**.

    #version 330
    
    layout uniform Materials {
	    vec3 diffuse;
	    vec3 specular;
	    vec3 spotDir;
	    float angle;
    } Material;
	    
    in Data {
	    vec3 normal;
	    vec3 eye;
	    vec3 l_dir;
    } DataIn;
    
    out vec3 color;
    
    void main() {
	    vec3 sd = normalize(- Material.spotDir);
	    vec3 ld = normalize(DataIn.l_dir);
	    vec3 n = normalize(DataIn.normal);
	    vec3 e = normalize(DataIn.eye);
	    
	    if(acos(dot(sd,ld) < Material.angle) {
		    float intensity = max(0.0,dot(n,ld));
		    vec3 h = normalize(ld + e);
		    float inSpec = max(0.0, dot(h,n));
		    color = (intensity + 0.33) * diffuse + specular * pow(inSpec,100);
	    }
	    else color = 0.33 * diffuse;
    }
