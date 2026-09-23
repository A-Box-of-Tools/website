# Hash y checksum — MD5, SHA-1, SHA-256, SHA-512

Comprueba una descarga contra el número que publicó quien la distribuye, sin enviársela a nadie.

> Calcula el MD5, SHA-1, SHA-256, SHA-384 o SHA-512 de cualquier archivo y compáralo con el checksum que publicó la página de descarga. El archivo se lee en el navegador y no se sube nunca, sea del tamaño que sea.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/calcular-checksum/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus archivos **nunca se suben**. No hay ningún servidor.

Una suma de verificación es aritmética sobre los bytes del archivo, y aquí se calcula en esta página, con el procesador de este dispositivo. El archivo se lee del disco en trozos de cuatro megabytes y cada trozo se descarta en cuanto entra en la cuenta, así que en ningún momento se arma una copia completa: ni en memoria, y desde luego no en un servidor. Al otro lado de esta página no hay ningún servidor al que mandar un archivo, aunque algo aquí quisiera hacerlo.

- ✗ Sin subir nada
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo comprobar una descarga contra su checksum

1. **Elige el archivo.** Arrástralo al recuadro o selecciónalo a mano. Se lee por partes directamente del disco; mientras lo haces no sale nada hacia ninguna parte, y no hay un tamaño a partir del cual la página se rinda.
2. **Deja que lo lea.** MD5 y SHA-256 se calculan por defecto, en una sola pasada. La barra indica por dónde va y a qué velocidad. Una imagen de disco grande tarda más o menos lo que tardaría en copiarse, porque es la misma cantidad de lectura.
3. **Pega lo que debería dar.** Lo que te haya dado la página de descarga, en la forma que sea: hexadecimal a secas, una línea de salida de `sha256sum`, un archivo `SHA256SUMS` entero o el atributo `integrity` de una etiqueta de script. Qué algoritmo es se deduce de su longitud, y la casilla correcta se marca sola.
4. **Lee la respuesta, no el color.** La página dice en una frase si este es el archivo que describe ese checksum. Si coincide, los bytes son idénticos a los que midió quien lo publicó. Si no coincide, no lo son, y conviene volver a descargarlo antes de abrirlo.
5. **Llévate los checksums si los necesitas.** Copia uno, cópialos todos o guárdalos en un archivo de texto pequeño, en la forma con el algoritmo delante que escriben las herramientas de consola. Así el nombre del algoritmo viaja junto al número.

## La versión larga

[Cómo comprobar una descarga contra su checksum](https://abox.tools/es/guias/verificar-el-checksum-de-una-descarga/): Cómo comparar un checksum MD5 o SHA-256 en Windows, macOS y Linux o en el navegador, qué demuestra realmente que coincida, y el error que deja toda la operación en nada.

## También en la caja

- [Generador de contraseñas y frases de contraseña](https://abox.tools/es/generador-de-contrasenas/): Se crean aquí, en tu propio navegador, y no se envían a ninguna parte. No se guarda nada y no hay historial.
- [Formateador de JSON](https://abox.tools/es/formatear-json/): JSON, XML, HTML, CSS y YAML, formateados o convertidos. Nada se pega en el servidor de nadie.
- [Conversor de YAML a JSON](https://abox.tools/es/convertir-yaml-a-json/): Los dos sentidos, y te dice lo que cuesta cada uno. Nada de esto se pega en el servidor de otro.
- [Formateador de XML](https://abox.tools/es/formatear-xml/): XML ordenado para leerlo o comprimido para publicarlo, y convertido a JSON en los dos sentidos. Nada de esto se pega en el servidor de otro.

## Preguntas

### ¿Se sube mi archivo a algún sitio?

No. Lo lee tu propio navegador desde tu disco y lo calcula en tu propio procesador, en trozos de cuatro megabytes. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra cada dirección que puede contactar: ninguna es nuestra. Desconéctate de la red y sigue funcionando.

### ¿Hay un límite de tamaño?

No. El archivo nunca está entero en ningún sitio: se lee por partes y cada parte se cuenta y se descarta, así que una imagen de disco de cuarenta gigabytes usa los mismos pocos megabytes de memoria que un archivo de texto. Lo que cuesta es tiempo, y la página te dice cuánto mientras avanza. \
\
Esa es la razón de que los algoritmos estén escritos aquí en lugar de pasárselos al `crypto.subtle.digest` del navegador, que sería más rápido. Esa llamada recibe el mensaje entero en un solo búfer y no hay manera de darle un archivo por partes, así que usarla habría dejado el archivo más grande que puedes comprobar a merced de cuánta memoria le toque a esta pestaña. En un teléfono son unos cientos de megabytes, y lo que la gente más quiere comprobar son imágenes de disco.

### El checksum coincide. ¿Qué queda demostrado exactamente?

Que los bytes que tienes en el disco son los que alguien tenía delante cuando anotó ese número. Nada más, y conviene ser preciso con los límites. \
\
Queda demostrado que la descarga no se cortó, que no la estropeó un disco defectuoso y que no la cambiaron por el camino. **No** queda demostrado que el archivo sea inofensivo, porque quien lo publica puede medir software malicioso con la misma exactitud que cualquier otra cosa. Y queda demostrado muy poco si el checksum venía de la misma página y por la misma conexión que el archivo: quien pudo cambiar una cosa pudo cambiar la otra. Un checksum vale sobre todo cuando llega por otra vía: un archivo `SHA256SUMS` firmado, el anuncio de versión de una distribución, un segundo espejo o un gestor de paquetes que ya lo conoce.

### No coincide. ¿Y ahora qué?

Primero vuelve a descargarlo, del mismo sitio. Una transferencia interrumpida o reanudada es con diferencia la causa más frecuente, y una segunda copia suele resolverlo. \
\
Si la segunda copia da la misma respuesta equivocada, comprueba que estás comparando con la línea correcta: las páginas de versiones listan varios archivos, y el checksum de la compilación para ARM no coincidirá nunca con el de la de x86. Después comprueba la versión. Si todo eso está bien y sigue sin coincidir, no abras el archivo. Descárgalo de otro espejo y compara los dos checksums entre sí.

### ¿Cuál debo usar?

El que haya publicado quien distribuye el archivo. La idea es comparar con su número, y ese no lo eliges tú. \
\
Si lo que haces es generar un checksum en lugar de comprobarlo, usa SHA-256. MD5 y SHA-1 están rotos en el sentido que importa: se pueden construir a propósito dos archivos distintos con el mismo valor, en horas con MD5 y por un gasto moderado con SHA-1. Eso no los deja inútiles frente a los accidentes, porque una descarga cortada no va a coincidir por casualidad con el original, pero sí significa que ninguno de los dos puede decirte que nadie tocó nada. SHA-384 y SHA-512 están bien y en la práctica no son mejores; están aquí porque algunos proyectos los publican.

### ¿Por qué está MD5 si está roto?

Porque sigue siendo lo que está impreso. Espejos, descargas de firmware, páginas de software de universidades y muchísimos sitios de fabricantes publicaron un MD5 hace veinte años y no han vuelto a tocar la página. Una herramienta que se negara a calcularlo se estaría negando a responder la pregunta con la que la gente llega de verdad. \
\
Lo que sí puede hacer es decir cuánto vale la respuesta, y eso es lo que hace la nota junto a la casilla. Un MD5 que coincide sigue descartando una descarga estropeada. No descarta una manipulada a propósito.

### ¿Qué formatos puedo pegar en el cuadro de comparación?

Todos los habituales, y la página distingue sola cuál es. \
\
Hexadecimal a secas, con espacios o sin ellos. Una línea de salida de `md5sum` o `sha256sum`, con el nombre del archivo detrás. Un archivo `SHA256SUMS` entero con cuarenta líneas, en cuyo caso se usa la línea que nombra tu archivo. La forma BSD, `SHA256 (disk.iso) = …`. Una etiqueta delante, como en `SHA-256: …`. Y un atributo de subresource integrity, `sha384-…`, que va en base64 en vez de en hexadecimal y se descodifica antes de comparar. \
\
Qué algoritmo es se deduce de la longitud: 32 caracteres hexadecimales son un MD5, 40 un SHA-1, 64 un SHA-256, 96 un SHA-384 y 128 un SHA-512. No hay dos con la misma longitud, así que no hay nada que elegir ni nada que equivocar.

### ¿Dará lo mismo que sha256sum o certutil?

Sí, byte por byte. Son especificaciones exactas con vectores de prueba publicados, y cada algoritmo de aquí se comprueba en cada compilación contra esos vectores y contra la implementación del sistema operativo. \
\
Lo único que verás distinto es la presentación. El `certutil -hashfile` de Windows escribe en mayúsculas y con espacios; esta página escribe en minúsculas, que es lo que usa casi todo el mundo. La comparación ignora ambas cosas, así que un checksum copiado de certutil coincide con uno en minúsculas pegado aquí.

### ¿Puedo comparar dos archivos entre sí?

Sí, con un paso de más: comprueba el primero, copia su checksum, elige después el segundo y pega ese checksum en el cuadro. Si los dos archivos son idénticos, la página lo dirá. \
\
Vale la pena saberlo para el caso en el que los checksums son discretamente insuperables: decidir si la copia del disco de respaldo es de verdad el mismo archivo que el del portátil, cuando ambos dicen tener el mismo tamaño y la misma fecha.

### ¿Modifica mi archivo?

No. Esta herramienta solo lee. No hay archivo de salida, ni recodificación, ni nada que se escriba de vuelta: lo único que puedes descargar es un archivo de texto pequeño con los checksums. Tu original sigue intacto en el disco, que es también la respuesta honesta a qué pasa si cierras la pestaña.

### ¿Es gratis? ¿Hace falta una cuenta?

Es gratis, y no hay cuenta, ni registro, ni prueba. No hay límite de tamaño de archivo ni límite de cuántos compruebas. El sitio lleva publicidad, que es lo que lo paga; a la publicidad no se le da nada sobre tu archivo.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y sigue funcionando. Es también la manera más sencilla de comprobar que no se sube nada: una herramienta que mandara tu archivo fuera para calcularlo se detendría en el momento de desenchufar.

## Cómo se comprueba la promesa de privacidad

- **Tu archivo no tiene por dónde salir.** En la Content-Security-Policy está cada dirección que esta página puede contactar, y ninguna es nuestra. Aquí no hay ningún punto final donde recoger tu archivo, ni nada en el código que lo enviara si lo hubiera. Antes esto decía `connect-src 'none'`, que era absoluto; la publicidad costó eso, y decirlo forma parte del trato.
- **El archivo nunca está entero en ningún sitio, sea del tamaño que sea.** Se lee en trozos de cuatro megabytes y cada trozo entra en el estado que se lleva y se descarta. La memoria que usa esta página es la misma para una imagen de disco de cuarenta gigabytes que para un archivo de texto, y no hay un tamaño a partir del cual se rinda. Por eso tampoco se usa el `crypto.subtle.digest` que trae el navegador: esa función quiere el archivo entero en memoria a la vez, que es justo el techo que esta herramienta existe para no tener.
- **Cinco algoritmos, cinco archivos en este repositorio.** En `src/md5.js`, `src/sha1.js`, `src/sha256.js` y `src/sha512.js` están las especificaciones publicadas escritas tal cual, unas sesenta líneas cada una, con las tablas de constantes escritas en lugar de calculadas para que nada del resultado dependa del navegador. Cada una se comprueba contra los vectores de prueba oficiales y contra la implementación del propio sistema operativo antes de publicarse.
- **El checksum que pegas tampoco se envía a ningún sitio.** Se compara aquí, en la página, contra el valor calculado aquí. De esa comparación no se entera nadie: ni el valor, ni si coincidió, ni el nombre del archivo. Importa más de lo que parece, porque un checksum junto a un nombre de archivo le dice a quien lo recoja exactamente qué versión de qué programa acabas de descargar.
- **Qué carga Google y qué no recibe.** Los scripts de publicidad y de medición vienen de Google. Ninguno recibe nada sobre tu archivo: ni el archivo, ni su nombre, ni su tamaño, ni ninguno de los valores calculados. Cada línea que lee o procesa un byte se sirve desde este dominio y está en el repositorio.
- **Qué carga el botón de donación y qué no recibe.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y toma sus letras de Google Fonts. Es un enlace y nada más: no informa de la visita y no recibe nada sobre ti ni sobre tus archivos. No pasa nada mientras no lo pulses, y lo que hay al otro lado es el sitio de otra persona.
- **Funciona sin conexión.** Desconéctate de la red y todas las partes de esta página siguen funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tu archivo fuera para calcularlo se detendría en el momento de desenchufar.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/md5.js`, `src/sha1.js`, `src/sha256.js` y `src/sha512.js` para las cuatro funciones de compresión, `src/blocks.js` para el relleno que comparten y `src/hash.js` para el bucle que lee el archivo por partes. En ninguno de ellos hay una línea capaz de llegar a la red.
