# Formateador de JSON — ordénalo, apriétalo o conviértelo

JSON, XML, HTML, CSS y YAML, formateados o convertidos. Nada se pega en el servidor de nadie.

> Formatea y minifica JSON, XML, HTML, CSS y YAML, y convierte JSON a YAML o XML y al revés. Los analizadores corren en tu navegador y no se sube nada: un token o un archivo de configuración nunca sale de tu equipo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/formatear-json/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus textos y códigos **nunca se suben**. No hay ningún servidor.

Formatear y convertir son aritmética sobre una cadena de texto, hecha aquí, en esta página. Los analizadores están escritos a mano y viven en `src/`: `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js`; y no hay nada más. Esta herramienta no tiene ninguna función de red, nada que pedir y nada que enviar, lo cual importa aquí más que en casi ningún otro sitio de esta web: lo que la gente pega en un formateador son tokens de acceso, cookies de sesión, fichas de clientes y código sin publicar.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo formatear o convertir JSON sin subirlo

1. **Elige el trabajo.** Dos pestañas, una misma caja: *Formatear* ordena o aprieta JSON, XML, HTML, CSS y YAML; *Convertir* pasa JSON a YAML o XML y al revés. El texto que acabas de formatear es el texto que conviertes, sin pegarlo dos veces.
2. **Pégalo, o suelta el archivo.** Vale cualquier cosa que puedas seleccionar y copiar. Un archivo soltado sobre el selector lo lee tu propio navegador y lo pone en la caja: aquí no hay ningún paso de subida que omitir.
3. **Deja que averigüe el lenguaje, o díselo.** El menú dice como qué ha leído el texto, y corregirlo es un clic. Una suposición no es más que un punto de partida, y por eso se enseña en vez de aplicarse en silencio.
4. **Elige la indentación, o apriétalo todo.** Dos espacios, cuatro o un tabulador. Apretarlo es el mismo documento con todos los espacios que solo estaban ahí para leerlo quitados, y el resultado dice cuántos bytes ha ahorrado eso.
5. **Lee el error donde está el error.** Un analizador que falla aquí dice qué encontró y en qué línea y columna, en vez de «token inesperado en la posición 4193». Eso suele bastar para arreglar un archivo de configuración sin abrir nada más.
6. **Llévate el resultado.** Cópialo, o descárgalo como archivo, con el nombre del lenguaje en el que salió.

## La versión larga

[Cómo formatear JSON sin entregárselo a nadie](https://abox.tools/es/guias/formatear-json/): Cómo ordenar, comprobar y minificar JSON en tu propio navegador: qué no debe cambiar nunca un formateador de tu archivo, cómo leer el mensaje de error, y por qué importa el sitio en el que lo pegas.

## También en la caja

- [Conversor de YAML a JSON](https://abox.tools/es/convertir-yaml-a-json/): Los dos sentidos, y te dice lo que cuesta cada uno. Nada de esto se pega en el servidor de otro.
- [Formateador de XML](https://abox.tools/es/formatear-xml/): XML ordenado para leerlo o comprimido para publicarlo, y convertido a JSON en los dos sentidos. Nada de esto se pega en el servidor de otro.
- [Comparador de textos](https://abox.tools/es/comparar-textos/): Dos textos dentro, cada diferencia marcada, línea a línea y palabra a palabra. Nada se pega en el servidor de nadie.
- [Codificador y decodificador Base64](https://abox.tools/es/codificar-base64/): Base64, codificación porcentual, entidades HTML, hexadecimal y escapes con barra invertida, en los dos sentidos. Nada se pega en el servidor de nadie.

## Preguntas

### ¿Se sube mi texto a alguna parte?

No. Cada analizador y cada escritor de esta página es una función que corre en tu propio navegador, en tu propio equipo. Esta herramienta no tiene ninguna función de red: nunca pide nada y nunca envía nada, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Esa es la razón para usarla con un token de acceso, una cookie de sesión o una ficha de cliente: pegar cualquiera de esas cosas en el formateador de otra persona es entregársela.

### ¿Formatear JSON cambia algo aparte de la disposición?

No, y es más difícil de lo que suena. Las claves conservan el orden en que las escribiste: un formateador construido sobre `JSON.parse` mueve en silencio al principio las claves que parecen enteros, así que `{"10":a,"2":b}` vuelve como `{"2":b,"10":a}`. Los números conservan las cifras que tecleaste, así que un identificador de veinte dígitos no pierde las tres últimas por culpa de un doble y `1e999` no se vuelve `null`. Las claves duplicadas se conservan las dos, porque el estándar no dice cuál gana y descartar una sería decidir por ti.

### ¿Qué lenguajes puede formatear?

JSON, XML, HTML, CSS y YAML. JSON, XML, HTML y CSS también se pueden apretar; YAML no, porque su forma corta es el estilo de flujo, que es ilegible, y lo ilegible es lo contrario del motivo por el que se mantiene un archivo en YAML. JavaScript no está en la lista a propósito: mira la pregunta de más abajo.

### ¿Por qué no formatea JavaScript, Python o SQL?

Porque ordenar un lenguaje de programación significa analizarlo como es debido, y un formateador que casi acierta es peor que ninguno: produce código que se ve bien y hace otra cosa. JSON, XML, CSS y YAML tienen gramáticas lo bastante pequeñas como para leerlas a mano y comprobarlas con pruebas que puedes ejecutar. Un formateador de JavaScript es Prettier, que es un megabyte de analizador, y su sitio es tu editor y no una página web.

### Mi YAML dice no y el JSON ha salido como cadena. ¿Por qué?

Porque es una cadena, y aquí se lee YAML 1.2 y no 1.1. En YAML 1.1, `yes`, `no`, `on` y `off` eran booleanos, que es el famoso fallo que convierte el código de país de Noruega en `false`. YAML 1.2 lo quitó, y esto también: solo `true`, `false`, `null` y `~` se leen como algo que no sea texto. En el otro sentido, esas palabras se escriben *entrecomilladas*, aunque aquí se leerían como texto sin las comillas, porque lo que abra el archivo después quizá no. PyYAML sigue usando 1.1 por defecto. Leer con rigor y escribir con prudencia es la única combinación que acierta en los dos sentidos.

### ¿Qué se pierde al convertir YAML a JSON?

Los comentarios, porque JSON no tiene dónde ponerlos. Las anclas, los alias y las etiquetas se rechazan de plano en vez de adivinarlas: cada una de ellas dice algo que JSON no puede decir, y un conversor que eligiera una interpretación en silencio te daría un documento que no es lo que decía el archivo. En el otro sentido no se pierde nada: todo documento JSON ya es un documento YAML.

### ¿Qué se pierde al convertir JSON a XML?

La diferencia entre un objeto vacío, un array vacío y una cadena vacía, que se vuelven todos un elemento vacío, y el tipo de cada valor, porque XML no tiene tipos, que es por lo que la conversión inversa deja todo como cadena en vez de decidir que `8080` era un número. Un array se vuelve un elemento repetido, que es la única forma que se puede volver a leer, y a una clave que un nombre de elemento no puede contener se le sustituyen los caracteres incómodos en vez de emitir un documento que ningún analizador va a leer.

### ¿Reindentar HTML cambia cómo se ve la página?

Puede cambiarlo, y esto es honesto al respecto. El espacio en blanco entre dos elementos en línea es un espacio entre dos palabras, así que moverlo no sale gratis. Hay dos cosas que lo mantienen a raya: `<pre>` y `<textarea>` se copian tal cual estaban, y un elemento que solo contiene texto se queda en una línea. Todo lo demás se ordena.

### ¿De qué tamaño puede ser el archivo?

Aquí no hay ningún límite puesto, porque no hay ningún servidor pagándolo. El techo práctico es tu propio equipo: unos cuantos megabytes de JSON van bien, y con un documento muy largo la página espera una pausa en tu escritura antes de reformatear, en vez de pelearse contigo por el teclado.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni límite de cuánto pegas. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu texto.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tu texto fuera a formatear se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Lo que pegas no tiene por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudiera recogerse un token pegado, ni nada en el código que lo enviara si lo hubiera.
- **Aquí nada pide nada.** En `src/` no hay ningún `fetch`, ningún `XMLHttpRequest` y ningún `sendBeacon`. Cada analizador y cada escritor son funciones de esta página que reciben una cadena y devuelven una cadena.
- **Los formateadores conservan lo que se les dio.** Un objeto JSON vuelve con sus claves en el orden en que las escribiste y sus números escritos como los escribiste tú, porque `src/shared/parse-json.js` es un analizador y no una llamada a `JSON.parse`, que reordena las claves que parecen enteros y convierte un identificador de veinte cifras en el doble más cercano. Las pruebas de `tests/js/text-format.test.js` comprueban exactamente eso.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega un carácter de tu texto. Cada línea que lo lee, lo analiza o lo escribe se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/parse-json.js` para el analizador que mantiene tus claves en el orden en que las escribiste, y `src/convert.js` para ver por qué una conversión es un analizador y un escritor, sin nada en medio que conozca los dos formatos a la vez.
