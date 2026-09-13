# Analizador de GIF — qué hay de verdad dentro de un GIF

Fotogramas, duraciones, paletas y adónde fue cada byte.

> Desmonta un GIF en el navegador: cada fotograma con su duración y su descarte, las tablas de color, las repeticiones y un desglose byte a byte de adónde se fue el tamaño del archivo. No se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/analizar-gif/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus GIF **nunca se suben**. No hay ningún servidor.

El archivo lo abre y lo desmonta tu propio navegador: la estructura de bloques, la descompresión LZW y cada fotograma dibujado en esta página se hacen en este dispositivo. Al otro lado de esta página no hay ningún servidor al que mandar un archivo, aunque algo de aquí quisiera hacerlo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo analizar un GIF

1. **Elige un GIF.** Suéltalo sobre el selector o búscalo a mano. El navegador lo lee directamente de tu disco, y mientras tanto no sale nada a ninguna parte.
2. **Lee primero el resumen.** El tamaño del lienzo, el número de fotogramas, cuánto dice la animación que dura y cuánto dura de verdad. Esas dos últimas cifras se separan más a menudo de lo que la gente espera, y el motivo está en la sección siguiente.
3. **Mira lo que llama la atención.** Cada línea de ahí está medida sobre tu archivo: duraciones que ningún navegador va a respetar, un bloque de repetición que falta, tablas de color a las que no apunta nada, metadatos más grandes que algunos de los fotogramas. Nada es una suposición sobre lo que pretendías hacer.
4. **Mira adónde fueron los bytes.** Cada byte del archivo está en exactamente una fila, y las filas suman el archivo. Si la mayor parte no está en «píxeles comprimidos», el resto de la tabla dice dónde está en su lugar.
5. **Repasa los fotogramas.** Cada uno muestra su duración, su rectángulo, su método de descarte y su tamaño. Cambia entre «el lienzo después de cada fotograma» y «solo lo que guarda cada fotograma»: con lo segundo ves si el archivo está optimizado, porque un GIF bien hecho guarda rectángulos diminutos y uno mal hecho guarda la imagen entera cada vez.
6. **Llévate el informe si lo necesitas.** El análisis completo en texto plano, para pegarlo en un mensaje o guardarlo junto al archivo. Se construye en la página a partir de lo que ya está en tu pantalla.

## La versión larga

[Qué hay de verdad dentro de un GIF](https://abox.tools/es/guias/que-hay-dentro-de-un-gif/): Fotogramas, retardos, métodos de descarte y tablas de color explicados, por qué los navegadores rechazan los retardos más rápidos, y cómo averiguar adónde se ha ido el tamaño de un GIF.

## También en la caja

- [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Convierte una carpeta de imágenes en un vídeo.
- [Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.
- [Recortador de vídeo](https://abox.tools/es/recortar-video/): Deja el clip en la parte que de verdad importa.
- [Invertidor de vídeo](https://abox.tools/es/invertir-video/): El último fotograma primero, con sonido y todo.

## Preguntas

### ¿Se sube mi GIF a alguna parte?

No. El archivo lo lee, lo descomprime y lo dibuja tu propio navegador en tu propio equipo. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar: ninguna es nuestra. Desconéctate de la red y verás que sigue analizando GIF.

### ¿Por qué mi GIF va más lento de lo que dicen las duraciones?

Porque todos los navegadores se niegan a respetar una duración menor de dos centésimas de segundo y mantienen el fotograma una décima en su lugar. La regla se escribió en Netscape en 1996, para los globos giratorios y los carteles de «en obras» de la época, y se ha copiado a todos los navegadores desde entonces; nadie la ha quitado nunca. \
\
Así que un GIF cuyos fotogramas dicen todos 0,01 s no se reproduce a 100 fotogramas por segundo. Va a 10, que es entre cinco y diez veces más lento de lo que pretendía el programa que lo hizo. Esta página enseña las dos cifras, lo que dice el archivo y lo que va a hacer de verdad, y marca los fotogramas afectados. El arreglo, en el programa que hizo el archivo, es escribir 0,02 en vez de 0,01.

### ¿Qué significa «descarte»?

Qué dejar en pantalla cuando se acaba el tiempo de un fotograma, y es el campo que decide si una animación se ve bien o se emborrona. \
\
**Dejarlo donde está** significa que el siguiente fotograma pinta encima de este, que es lo que quieres cuando los fotogramas son opacos y se tapan unos a otros. **Volver al fondo** borra primero el rectángulo del fotograma, que es lo que necesita la transparencia: sin eso, las partes transparentes del siguiente fotograma enseñan el anterior por debajo. **Restaurar lo que había debajo** devuelve lo que estuviera ahí antes de que este fotograma pintara, que es como se guarda un objeto pequeño en movimiento sobre un fondo quieto. Y **sin especificar** quiere decir que el archivo no dijo nada, y todos los visores lo tratan como «dejarlo donde está».

### ¿Por qué es tan grande mi GIF?

La tabla «Adónde fueron los bytes» responde a eso para tu archivo concreto en vez de en general, y solo hay unas pocas respuestas posibles. \
\
Si casi todo está en **píxeles comprimidos**, el archivo es sencillamente mucha imagen: un GIF guarda cada fotograma como píxeles enteros, sin compensación de movimiento y sin mando de calidad, así que el tamaño es más o menos el área por el número de fotogramas. Menos fotogramas, un tamaño menor o menos colores son las únicas palancas. \
\
Si una parte grande está en **tablas de color**, el archivo escribe una paleta por fotograma a 768 bytes cada una. Si una parte grande está en **metadatos**, un editor se dejó ahí un paquete XMP y se puede quitar sin tocar la imagen. Y si todos los fotogramas cubren el lienzo entero, el codificador nunca averiguó qué parte cambió de verdad, y en cualquier cosa filmada o grabada eso es casi todo el archivo.

### ¿Cuál es la diferencia entre las dos vistas de fotograma?

**El lienzo después de cada fotograma** es lo que enseña un visor en ese momento: este fotograma dibujado encima de lo que dejaron los anteriores. **Solo lo que guarda cada fotograma** es el rectángulo que el archivo tiene de verdad para ese fotograma, por sí solo y sin nada debajo. \
\
La segunda es la interesante. Un GIF puede guardar un fotograma como solo la parte de la imagen que cambió, y por eso una grabación de pantalla de una ventana casi quieta puede ser pequeña. Si todos los fotogramas de tu archivo son el lienzo completo, nadie hizo ese trabajo, y mirando la animación no te enteras: solo mirando lo que hay guardado.

### Dice que mi archivo tiene un comentario o XMP. ¿Qué es eso?

Texto que viaja junto a la imagen y que ningún visor dibuja. Un bloque de comentario suele ser el nombre del programa que escribió el archivo. Un paquete XMP es el XML que un editor de imágenes escribe para dejar constancia de lo que hizo, y puede llevar el historial de ediciones, la versión del programa y a veces el nombre del autor. \
\
Esta página imprime los dos enteros, porque la pregunta interesante sobre los metadatos es qué dicen, no que existan. Se te enseñan a ti y a nadie más: nada en este repositorio se los lee a nadie.

### ¿Puede abrir un GIF roto?

Lo intenta, y te dice dónde se rindió. Un archivo que acaba a mitad de un bloque, que tiene un byte donde debería ir un marcador o que lleva un fotograma cuyos datos comprimidos se acaban antes de tiempo seguirá enseñando todo lo que era legible hasta ese punto, con el problema nombrado arriba. Ese es justo el caso en el que más se quiere un analizador, así que tirar el archivo entero por un byte malo sería equivocarse.

### ¿Cambia mi archivo?

No. Esta herramienta solo lee. No hay archivo de salida, ni recodificación, ni ningún botón aquí que escriba un GIF: lo único que puedes descargar es una copia en texto plano del análisis. Tu original sigue intacto en tu disco, que es también la respuesta honesta a qué pasa si cierras la pestaña.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba. No hay límite de tamaño de archivo más allá de la memoria de tu propio equipo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu archivo.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tu GIF fuera a analizar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tu GIF no tiene por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudiera recogerse tu archivo, ni nada en el código que lo enviara si lo hubiera. Antes esto decía `connect-src 'none'`, que no admitía excepciones; añadir publicidad costó eso, y decirlo forma parte del trato.
- **El lector son cuatro archivos de este repositorio.** Aquí nada usa el decodificador de GIF del navegador para averiguar qué hay en el archivo, porque ese decodificador no dice adónde fue un byte. Así que el formato se lee a mano: `src/gif.js` recorre los bloques, `src/lzw.js` expande los píxeles, `src/frames.js` los apila y `src/budget.js` vuelve a sumar las partes y comprueba que dan el tamaño del archivo.
- **Los comentarios y los metadatos se te enseñan a ti, y a nadie más.** Un GIF puede llevar un bloque de comentario, un paquete XMP que describe una edición o un perfil de color, y esta página los imprime todos. Se ponen en la pantalla delante de ti y no van a ninguna otra parte: en este repositorio no hay ningún evento de analítica que lleve nada de eso, y la página no podría enviarlo aunque lo hubiera.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu archivo: ni el archivo, ni una miniatura, ni un nombre, un tamaño, un recuento de fotogramas o un comentario. Cada línea que lee, descomprime o dibuja un GIF se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y coge su tipografía de Google Fonts. No es más que un enlace: no informa de tu visita y no se le entrega nada sobre ti ni sobre tus archivos. No pasa nada mientras no lo pulses, y lo que abrirías entonces es el sitio de otra persona.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tu GIF fuera para analizarlo se pararía en cuanto desenchufaras.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/gif.js` para el lector de bloques que recorre el archivo, `src/lzw.js` para el descompresor y `src/budget.js` para la contabilidad de bytes. En ninguno de ellos hay una línea capaz de llegar a la red.
