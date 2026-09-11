# Cortar vídeo — cortar un vídeo en línea

Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.

> Mira un vídeo y ve marcando cada trozo que valga la pena mientras se reproduce; luego guarda esos trozos en un solo archivo. Todo en el navegador: sin subir nada, sin recodificar nada y también sin conexión.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/cortar-video/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

Tu vídeo lo lee, lo marca, lo corta y lo escribe tu propio navegador, en tu propio hardware. Aquí no hay nada que pueda descargar ni enviar, porque esta herramienta no tiene ninguna función de red. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar un vídeo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Tantos trozos como quieras
- ✓ Sin pérdida de calidad
- ✓ Funciona sin conexión

## Cómo cortar un vídeo

1. **Elige un vídeo.** Arrastra un MP4, MOV, M4V o WebM hasta el selector. El navegador lo lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte. Si sueltas varios, se unen en el orden en que los pusiste.
2. **Reprodúcelo y marca los trozos que quieras.** Pulsa `I` donde tiene que empezar un trozo y `O` donde tiene que terminar, tantas veces como quieras. Cada pareja se convierte en una fila de la tabla de abajo y en una banda de la línea de tiempo. Con `U` deshaces la última, con `Espacio` reproduces y pausas, y las flechas saltan cinco segundos cada vez. Si el momento es difícil de pillar, baja la velocidad de reproducción.
3. **Retoca las marcas.** Cada fila se puede reproducir por su cuenta, retimar escribiendo dentro un tiempo exacto, subir o bajar de orden, o borrar. Los dos extremos del trozo seleccionado también se pueden arrastrar por la línea de tiempo. El total de arriba es lo que va a durar el vídeo terminado.
4. **Consérvalos, o quítalos.** Conservar es lo habitual: el vídeo terminado son los trozos que has marcado, unidos en orden. Quitarlos es el otro trabajo que la gente quiere y casi nunca encuentra: marca los anuncios, los silencios o los arranques en falso, y lo que queda se une sin ellos.
5. **Córtalo y descárgalo.** «Conservar cada byte» traslada los fotogramas intactos: es rápido y no puede costar calidad, pero cada trozo empieza en el fotograma clave anterior a tu marca. «Cortar exactamente aquí» descodifica y vuelve a escribir la imagen para que cada trozo empiece en el fotograma que elegiste. La página te dice cuál de los dos vas a tener, y lo que cuesta, antes de que pulses el botón.

## La versión larga

[Cómo cortar un vídeo sin recodificarlo](https://abox.tools/es/guias/cortar-un-video/): Cortar un clip no tiene por qué costarte ni un byte de calidad. Por qué a veces el corte cae antes de donde lo marcaste, qué pinta ahí un fotograma clave, y cuándo conviene aceptar una recodificación.

## También en la caja

- [Recortador de vídeo](https://abox.tools/es/recortar-video/): Deja el clip en la parte que de verdad importa.
- [Invertidor de vídeo](https://abox.tools/es/invertir-video/): El último fotograma primero, con sonido y todo.
- [Creador de timelapse](https://abox.tools/es/crear-timelapse/): Una hora de grabación en veinte segundos.
- [Capturador de fotogramas](https://abox.tools/es/capturar-fotograma-de-video/): Una imagen a máxima calidad, de cualquier punto.

## Preguntas

### ¿Se sube mi vídeo a alguna parte?

No. Tu propio navegador lo lee, lo marca, lo corta y lo escribe, todo en tu propio hardware. Esta herramienta no tiene parte de servidor, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Y si prefieres comprobarlo a que te lo cuenten, desenchúfate de internet y corta un vídeo igualmente.

### ¿Puedo conservar varios trozos del mismo vídeo?

Para eso está esto. Pulsa `I` y `O` tantas veces como quieras mientras se reproduce: cada pareja se convierte en una fila, y el vídeo terminado son todas las filas unidas en orden, con todo lo demás fuera. Casi todos los cortadores en línea te dan una sola pareja de tiradores y te preguntan qué tramo único quieres conservar, cosa que está bien para recortar la entrada y la salida de un clip y no sirve de nada para ver una hora de material una vez y quedarte con los seis momentos que valen.

### ¿Cortar hace perder calidad?

Por la vía normal no, y no en lo que importa. Cortar no le cambia el aspecto a ningún fotograma, así que los fotogramas se mueven al archivo nuevo tal y como estaban: los mismos bytes, los mismos ajustes de codificación, lo mismo en todo. La única vía de aquí que recodifica algo es el corte exacto, y lo pone en el botón.

### ¿Por qué un trozo empieza antes de donde lo marqué?

Por cómo se guarda el vídeo, y solo en reproductores que ignoran una parte estándar del formato. Casi todos los fotogramas se guardan como una descripción de en qué se diferencian de sus vecinos, así que no se pueden descodificar sin ellos; solo un fotograma clave se sostiene solo, y los fotogramas clave suelen ir separados entre uno y diez segundos. Un corte que copia fotogramas tiene que arrastrar por tanto la tirada entera desde el fotograma clave anterior a tu marca, y en el archivo queda escrito *empieza a reproducir en tu marca*, cosa que respeta cualquier reproductor corriente. Si lo necesitas exacto en todos los reproductores, elige «Cortar exactamente aquí», que recodifica. La página te dice en qué caso estás, y por cuánto, antes de exportar.

### ¿Puedo quitar los anuncios en vez de conservarlos?

Sí. Márcalos y elige «Quitarlos»: se une todo lo que *no* has marcado, en orden. La misma lista de marcas responde a las dos preguntas, así que puedes cambiar de una a otra y ver cómo cambia la duración sin marcar nada dos veces.

### ¿Puedo guardar mis marcas y volver a ellas?

Sí. «Guardar marcas» escribe un archivo de texto plano, con una línea por trozo y el inicio y el final separados por una coma, y «Cargar marcas» lee uno de vuelta. Se ofrecen dos formatos, segundos pelados y `HH:MM:SS.mmm`, y los dos respetan la disposición que ya usan otras herramientas que trabajan así, de modo que un archivo escrito aquí se le puede pasar a una de ellas y un archivo escrito allí se puede soltar en esta página. Marcar es un trabajo cuidadoso, y nadie debería tener que hacerlo dos veces.

### ¿Qué formatos de vídeo puedo cortar?

MP4, M4V y MOV se leen directamente, lleven lo que lleven dentro: H.264, HEVC, AV1 o VP9. Copiar fotogramas no implica descodificarlos, así que esta vía funciona incluso con un códec para el que tu navegador no tenga descodificador. Lo demás que el navegador sepa reproducir, y aquí el caso claro es el WebM, se corta reproduciéndolo y grabando el resultado; eso funciona, tarda lo que dure el resultado y solo puede conservar un trozo. Un archivo que el navegador no sabe ni leer ni reproducir, que en la práctica son los AVI, WMV, FLV y casi todos los MKV, se rechaza con un mensaje que lo dice, en lugar de fallar a mitad de camino.

### ¿Hay algún límite de tamaño o de duración?

La herramienta no lleva ningún límite dentro, y por la vía de copia el archivo casi ni se lee: a los fotogramas que conservas se les apunta en vez de cargarlos, así que quedarte con cuatro minutos de una grabación de cuatro gigabytes cuesta más o menos lo que cuesta escribir esos cuatro minutos en disco. El corte exacto sí recorre el archivo de unos megabytes en unos megabytes. En los dos casos, el techo de verdad es el archivo terminado, que se monta en memoria antes de que lo descargues.

### ¿Sobrevive el sonido?

Por las dos vías del MP4 se copia muestra a muestra sin llegar a descodificarse, así que sale byte por byte igual que estaba en el archivo, y una marca de edición mantiene cada trozo alineado con su imagen con una precisión de una milésima de segundo. La única excepción es unir vídeos distintos cuyo sonido esté descrito de otra forma, por ejemplo con frecuencias de muestreo distintas: ahí no hay manera de meter los dos en una sola pista sin descodificarlos, y la página lo dice antes de hacerlo. Por la vía de la grabación se captura de la reproducción y se vuelve a codificar. En los dos casos hay una casilla para dejarlo fuera del todo.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu vídeo.

## Cómo se comprueba la promesa de privacidad

- **Tus vídeos no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tu archivo, ni una línea de código que lo mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** Esta herramienta no tiene ninguna función de red: no hay dirección que pegar, ni nada que descargar, ni ningún motor que se baje la primera vez que la usas. Cada byte que toca tu vídeo llegó desde este origen al cargarse la página.
- **Por la vía normal ni siquiera se descodifica nada.** Cortar no le cambia el aspecto a ningún fotograma, así que los fotogramas codificados de los trozos que has marcado se mueven al archivo nuevo tal y como se encontraron. Cada uno se guarda como un trozo del archivo de tu disco, es decir, como una nota que dice qué bytes son, y no como los bytes en sí, y tu navegador los lee por primera vez mientras escribe la descarga. Aquí no hay nada que convierta tu vídeo de vuelta en una imagen.
- **El archivo de marcas se hace en la página.** Guardar tus marcas escribe un archivo de texto a partir de los números que ya están en pantalla, directo a tus descargas. Cargar uno lo lee aquí. Ninguno de los dos se acerca a una red, y ninguno lleva más que tiempos.
- **El sonido se copia, no se escucha.** Por las dos vías del MP4, las muestras de audio se trasladan sin llegar a descodificarse. Aquí nada las vuelve a convertir en sonido, y aunque lo hiciera, no habría adónde mandarlas.
- **Donde sí se descodifican fotogramas, ocurre aquí.** El corte exacto, y la vista previa de un archivo que este navegador no reproduce, pasan por WebCodecs en tu propio dispositivo. Es el mismo descodificador que te enseñaría el vídeo de todas formas, funcionando en el mismo sitio.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu vídeo: ni un archivo, ni un fotograma, ni un nombre, ni un tamaño, ni una duración, ni por dónde lo has cortado. Cada línea que lee, corta y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tu vídeo.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/segments.js` para las marcas y el archivo en que se guardan, `src/shared/mp4-reader.js` para el lector que encuentra los fotogramas dentro de un MP4, `src/ranges.js` para la aritmética que convierte una marca en una tirada de muestras, y `src/copy.js` para el bucle que mueve esas muestras al archivo nuevo. Ninguno de ellos importa nada capaz de hacer una petición.
