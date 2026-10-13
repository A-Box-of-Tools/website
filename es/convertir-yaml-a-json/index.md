# YAML a JSON — y de JSON de vuelta a YAML

Los dos sentidos, y te dice lo que cuesta cada uno. Nada de esto se pega en el servidor de otro.

> Convierte un subconjunto compatible de YAML 1.2 a JSON y de JSON a YAML en el navegador. Rechaza anclas, alias, etiquetas y varios documentos; JSON pierde los comentarios. Nada se sube.

Esta es una herramienta interactiva de navegador en https://abox.tools/es/convertir-yaml-a-json/. Los archivos se procesan en el dispositivo donde se ejecuta ese navegador. La página explica las funciones opcionales de red y los envíos deliberados. Lo que sigue es su explicación escrita; abre la dirección para usarla.

## Tus archivos YAML y JSON se **procesan en tu navegador**. No se suben para procesarlos.

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

## La versión larga

[Cómo convertir entre YAML y JSON](https://abox.tools/es/guides/convert-yaml-and-json/): Convierte un subconjunto de YAML a JSON o JSON a YAML en el navegador. Comprueba pérdida de comentarios, construcciones rechazadas y texto numérico antes de usarlo.

## También en la caja

- [Formateador de XML](https://abox.tools/es/formatear-xml/): XML ordenado para leerlo o comprimido para publicarlo, y convertido a JSON en los dos sentidos. Nada de esto se pega en el servidor de otro.
- [Comparador de textos](https://abox.tools/es/comparar-textos/): Dos textos dentro, cada diferencia marcada, línea a línea y palabra a palabra. Nada se pega en el servidor de nadie.
- [Codificador y decodificador Base64](https://abox.tools/es/codificar-base64/): Base64, codificación porcentual, entidades HTML, hexadecimal y escapes con barra invertida, en los dos sentidos. Nada se pega en el servidor de nadie.
- [Compartir texto y archivos](https://abox.tools/es/compartir-texto/): Lo compartido vive en esta pestaña abierta. Los lectores lo reciben cifrado, directamente desde tu navegador, y al cerrar la pestaña se acaba: ningún servidor guarda nada.

## Preguntas

### ¿Se sube mi YAML a alguna parte?

No. Los dos analizadores y los dos impresores de esta página son funciones que corren en tu propio navegador, en tu propio hardware. Esta herramienta no tiene función de red de ninguna clase — nunca descarga nada y nunca envía nada — y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Esa es la razón para usarlo con una configuración de despliegue: están llenas de nombres de host, nombres de bucket y de vez en cuando algún secreto que alguien pensaba mover, y pegar una en el conversor de otro es entregársela.

### ¿Qué se pierde al convertir YAML a JSON?

JSON elimina los comentarios. Este analizador admite deliberadamente un subconjunto de YAML 1.2 y rechaza anclas, alias y etiquetas en vez de elegir su expansión o conversión de tipos. JSON representa un árbol de valores; YAML admite nodos compartidos y valores tipados. También rechaza varios documentos en vez de inventar una matriz. De JSON a YAML conserva los valores representados. [La especificación YAML](https://yaml.org/spec/1.2.2/) define el formato completo.

### Mi YAML dice no y el JSON salió como cadena. ¿Por qué?

YAML 1.1 trataba `yes`, `no`, `on` y `off` como booleanos y convertía el código de Noruega en `false`. Este subconjunto usa YAML 1.2: esas palabras siguen siendo cadenas, `true` y `false` son booleanos, `null` y `~` son null y los escalares numéricos son números. El escritor YAML entrecomilla las palabras ambiguas para lectores con reglas antiguas.

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

- **El procesamiento se hace en este navegador.** La herramienta procesa entradas y resultados en el navegador. Su código no los sube para procesarlos. Content-Security-Policy limita recursos y destinos, pero los hosts permitidos pueden recibir solicitudes: no inspecciona sus datos ni prueba por sí sola que nada se envíe. Compara código y solicitudes de la operación concreta o complétala desconectado.
- **Aquí nada descarga nada.** No hay ningún `fetch`, ningún `XMLHttpRequest` ni ningún `sendBeacon` en todo `src/`. Los dos analizadores y los dos impresores son funciones de esta página que toman una cadena y devuelven una cadena.
- **El subconjunto admitido usa las reglas escalares de YAML 1.2.** En YAML 1.1, `no` era un booleano, que es el error famoso que convierte el código de país de Noruega en `false`. Esto lee 1.2, donde es la cadena que parece. En el otro sentido esas palabras se escriben de vuelta *entre comillas*, porque lo que abra el archivo después puede seguir siendo un lector de 1.1. `tests/js/text-convert.test.js` comprueba las dos mitades.
- **Una conversión que no puede ser honesta se detiene.** JSON elimina los comentarios. Este analizador admite deliberadamente un subconjunto de YAML 1.2 y rechaza anclas, alias y etiquetas en vez de elegir su expansión o conversión de tipos. JSON representa un árbol de valores; YAML admite nodos compartidos y valores tipados. También rechaza varios documentos en vez de inventar una matriz. De JSON a YAML conserva los valores representados.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación de Buy Me a Coffee. A ninguno se le entrega un carácter de tu texto. Cada línea que lo lee, lo analiza o lo escribe se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconecta la red y la herramienta sigue igual, porque nunca hubo un paso de red en ella. Es la prueba más simple de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/parse-yaml.js` para el lector que rechaza un ancla en lugar de adivinar qué quería decir, y `src/convert.js` para saber por qué una conversión es un analizador y un impresor sin nada en medio que conozca los dos formatos a la vez.
