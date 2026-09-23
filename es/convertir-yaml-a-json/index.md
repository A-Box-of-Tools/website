# YAML a JSON — y de JSON de vuelta a YAML

Los dos sentidos, y te dice lo que cuesta cada uno. Nada de esto se pega en el servidor de otro.

> Convierte YAML a JSON y JSON a YAML en tu navegador. Lee YAML 1.2, así que yes y no siguen siendo cadenas, y dice exactamente qué pierde cada sentido. No se sube nada: un archivo de configuración nunca sale de tu dispositivo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-yaml-a-json/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus archivos YAML y JSON **nunca se suben**. No hay ningún servidor.

Convertir es aritmética sobre una cadena de texto, hecha aquí, en esta página. Los dos analizadores están escritos a mano y viven en `src/` — `shared/parse-yaml.js` y `shared/parse-json.js` — y no hay nada más. Esta herramienta no tiene función de red de ninguna clase — nada que descargar, nada que enviar — y aquí eso importa más que casi en ningún otro sitio de esta web: un archivo YAML suele ser una configuración de despliegue, y una configuración de despliegue suele estar llena de nombres de host, nombres de bucket y secretos.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo convertir YAML a JSON sin subirlo

1. **Elige el sentido.** *YAML a JSON* o *JSON a YAML*. La nota bajo el menú dice lo que pierde ese sentido antes de que pegues nada, y no después.
2. **Pégalo, o suelta el archivo.** Vale cualquier cosa que puedas seleccionar y copiar. Un archivo soltado sobre el selector lo lee tu propio navegador y lo pone en la caja — no hay paso de subida que omitir — y una extensión `.json` o `.yaml` te elige el sentido.
3. **Elige la indentación.** Dos espacios, cuatro, o un tabulador. El tabulador se ofrece solo para JSON: YAML está definido en términos de espacios, y un tabulador no es indentación válida en él.
4. **Lee el error donde está el error.** Un analizador que falla aquí dice qué encontró y en qué línea y columna, en lugar de «token inesperado en la posición 4193». Eso suele bastar para arreglar un archivo de configuración sin abrir nada más.
5. **Llévate el resultado.** Cópialo, o descárgalo como archivo, con el nombre del formato en el que salió.

## También en la caja

- [Formateador de XML](https://abox.tools/es/formatear-xml/): XML ordenado para leerlo o comprimido para publicarlo, y convertido a JSON en los dos sentidos. Nada de esto se pega en el servidor de otro.
- [Comparador de textos](https://abox.tools/es/comparar-textos/): Dos textos dentro, cada diferencia marcada, línea a línea y palabra a palabra. Nada se pega en el servidor de nadie.
- [Codificador y decodificador Base64](https://abox.tools/es/codificar-base64/): Base64, codificación porcentual, entidades HTML, hexadecimal y escapes con barra invertida, en los dos sentidos. Nada se pega en el servidor de nadie.
- [Compartir texto y archivos](https://abox.tools/es/compartir-texto/): Lo compartido vive en esta pestaña abierta. Los lectores lo reciben cifrado, directamente desde tu navegador, y al cerrar la pestaña se acaba: ningún servidor guarda nada.

## Preguntas

### ¿Se sube mi YAML a alguna parte?

No. Los dos analizadores y los dos impresores de esta página son funciones que corren en tu propio navegador, en tu propio hardware. Esta herramienta no tiene función de red de ninguna clase — nunca descarga nada y nunca envía nada — y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Esa es la razón para usarlo con una configuración de despliegue: están llenas de nombres de host, nombres de bucket y de vez en cuando algún secreto que alguien pensaba mover, y pegar una en el conversor de otro es entregársela.

### ¿Qué se pierde al convertir YAML a JSON?

Los comentarios, porque JSON no tiene dónde ponerlos. Las anclas, los alias y las etiquetas se rechazan directamente en lugar de adivinarse — cada una dice algo que JSON no puede decir, y un conversor que en silencio eligiera una interpretación te entregaría un documento que no es lo que decía el archivo. El otro sentido no pierde nada: todo documento JSON ya es un documento YAML.

### Mi YAML dice no y el JSON salió como cadena. ¿Por qué?

Porque es una cadena, y esto lee YAML 1.2 en lugar de 1.1. En YAML 1.1, `yes`, `no`, `on` y `off` eran booleanos, que es el error famoso que convierte el código de país de Noruega en `false`. YAML 1.2 lo dejó caer y esto también: solo `true`, `false`, `null` y `~` se leen como algo que no sea texto. En el otro sentido, esas palabras se escriben de vuelta *entre comillas*, aunque esto las leería como texto sin ellas, porque lo que abra el archivo después quizá no. PyYAML sigue usando 1.1 por defecto. Leer estrictamente y escribir de forma conservadora es la única combinación que acierta en los dos sentidos.

### ¿Mantiene el orden de mis claves?

Sí, en los dos sentidos, y eso es más difícil de lo que parece. Un conversor construido sobre `JSON.parse` mueve en silencio al principio las claves que parecen enteros, así que `{"10":a,"2":b}` vuelve como `{"2":b,"10":a}`. Los números mantienen los dígitos que escribiste, así que un identificador de cuenta de veinte dígitos no pierde los tres últimos por un double. Si *quieres* que se ordenen hay una casilla, y ordena por cómo se leen las claves y no por sus puntos de código.

### ¿Puede convertir varios documentos YAML a la vez?

No, y lo dice en lugar de elegir uno. Un archivo con separadores `---` contiene más de un documento, y JSON no tiene ninguna forma que signifique «varios documentos»: un array sería una afirmación que el archivo nunca hizo. Conviértelos de uno en uno.

### ¿Por qué aquí no hay un formateador de YAML?

Porque YAML no tiene una forma comprimida que valga la pena escribir: la corta es el estilo de flujo, que es ilegible, y lo ilegible es lo contrario de la razón por la que se mantiene un archivo en YAML. Ordenar JSON, XML, HTML y CSS es el trabajo del [formateador de JSON](https://abox.tools/es/formatear-json/), y ese también ordena YAML.

### ¿De qué tamaño puede ser el archivo?

Aquí no hay ningún límite puesto, porque no hay un servidor pagándolo. El techo real es tu propio dispositivo: unos cuantos megabytes de YAML van bien, y con un documento muy largo la página espera a que hagas una pausa al escribir antes de convertirlo, en lugar de pelearte el teclado.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni límite de cuánto pegas. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tu texto.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y sigue funcionando. Esa es también la forma más simple de demostrar que no se sube nada: una herramienta que mandara tu configuración fuera para convertirla se pararía en el momento en que te desconectaras.

## Cómo se comprueba la promesa de privacidad

- **Lo que pegas no tiene adónde ir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún punto final donde recoger una configuración pegada, ni nada en el código que la enviaría si lo hubiera.
- **Aquí nada descarga nada.** No hay ningún `fetch`, ningún `XMLHttpRequest` ni ningún `sendBeacon` en todo `src/`. Los dos analizadores y los dos impresores son funciones de esta página que toman una cadena y devuelven una cadena.
- **Lee YAML 1.2, así que Noruega sigue siendo Noruega.** En YAML 1.1, `no` era un booleano, que es el error famoso que convierte el código de país de Noruega en `false`. Esto lee 1.2, donde es la cadena que parece. En el otro sentido esas palabras se escriben de vuelta *entre comillas*, porque lo que abra el archivo después puede seguir siendo un lector de 1.1. `tests/js/text-convert.test.js` comprueba las dos mitades.
- **Una conversión que no puede ser honesta se detiene.** Un ancla, un alias o una etiqueta en el YAML terminan la conversión con un mensaje que dice en qué línea está, en lugar de un documento JSON que en silencio significa otra cosa. JSON no tiene manera de decir «el mismo nodo dos veces», y elegir una interpretación sería decidir por ti.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación de Buy Me a Coffee. A ninguno se le entrega un carácter de tu texto. Cada línea que lo lee, lo analiza o lo escribe se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconecta la red y la herramienta sigue igual, porque nunca hubo un paso de red en ella. Es la prueba más simple de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/parse-yaml.js` para el lector que rechaza un ancla en lugar de adivinar qué quería decir, y `src/convert.js` para saber por qué una conversión es un analizador y un impresor sin nada en medio que conozca los dos formatos a la vez.
