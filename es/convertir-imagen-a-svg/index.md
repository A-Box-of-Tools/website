# Imagen a SVG — vectorizar un logotipo, una plantilla o una silueta en curvas

Una forma, un contorno. Señala lo que no debería estar ahí.

> Vectoriza una imagen en blanco y negro en un contorno SVG de verdad, en tu navegador. Logotipos, plantillas, firmas, dibujos a línea y siluetas se convierten en curvas que puedes escalar a cualquier tamaño. Un clic quita lo que el trazado tomó de más. No se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-imagen-a-svg/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

Tu propio navegador lee la imagen del disco, `src/mask.js` la reduce a un bit por píxel, `src/contour.js` recorre el borde de la forma y `src/fit.js` le ajusta curvas — unas seiscientas líneas que puedes leer, sin ningún motor detrás y sin nada que descargar para ejecutarlas. Esta herramienta no tiene función de red de ningún tipo: nada que traer, nada que enviar, y ningún servidor al otro lado de esta página al que mandar un dibujo aunque la hubiera.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo vectorizar una imagen en SVG sin subirla

1. **Elige la imagen.** Un logotipo, una plantilla, una firma, un sello, un dibujo escaneado, una silueta. Cualquier cosa con una forma clara se vectoriza bien; la foto de una habitación no, y más abajo hay un aviso claro en lugar de una sorpresa al final. El archivo se lee directamente de tu disco y mientras tanto no se envía nada a ninguna parte.
2. **Di qué es la forma.** Un dibujo sobre papel se separa por **claro y oscuro**, y el nivel se calcula por ti. La foto de un objeto no — una figura rojo oscuro sobre piedra gris oscuro es oscuro sobre oscuro, y ninguna luminosidad las separa. Esa quiere **el sujeto**, que aprende qué es el fondo en una franja alrededor del borde de la imagen y se queda con todo lo que no lo es.
3. **Mira la línea roja, no los ajustes.** El contorno se dibuja sobre los píxeles de los que salió, porque es el único sitio donde la cuestión puede zanjarse: un contorno está bien o mal respecto a esos píxeles y a nada más. Arrastra cualquiera de las dos imágenes para mover ambas, y usa la rueda para acercarte lo bastante como para ver qué hace la línea de verdad.
4. **Quita de un clic lo que no debería estar ahí.** Una mota, una grapa, un sello, un pie de foto, una sombra. Un clic toma toda la mancha de ese color y no un píxel, así que estás señalando una forma; vuelve a hacer clic para devolverla. Hacer clic en un trozo de fondo encerrado lo rellena, y así se cierra un agujero que no debería serlo.
5. **Ajusta el suavizado solo si hace falta.** *Detalle* es cuánto puede apartarse la línea de los píxeles al simplificarse, y se calcula por forma salvo que digas lo contrario. *Agudeza de esquinas* decide cuánto tiene que girar el contorno para que ese giro se conserve como esquina en vez de redondearse. La mayoría de las imágenes no necesitan tocar ninguno.
6. **Llévate el SVG.** Un archivo, un solo `<path>`, sin regla de relleno de la que preocuparse: los contornos giran en un sentido y los agujeros en el otro, que es lo que hace de una forma con cuarenta agujeros un solo elemento. Se abre en Illustrator, Inkscape, Figma, un navegador y una máquina de corte.

## La versión larga

[Cómo vectorizar una imagen en SVG](https://abox.tools/es/guias/convertir-una-imagen-a-svg/): Convierte un logotipo, una plantilla, una firma o una silueta en un contorno vectorial de verdad en tu navegador. Qué imágenes se vectorizan bien, cuáles nunca lo harán, y cómo arreglar las partes que el trazador toma mal.

## También en la caja

- [Comparador de alturas](https://abox.tools/es/comparar-alturas/): Escribe las alturas, llévate la imagen. No se envía nada para dibujarla.
- [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/): Tú dices el tamaño. Del resto se encarga él.
- [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/): Di el tamaño. Dibuja la caja. Elige el formato.
- [HEIC a JPG](https://abox.tools/es/convertir-heic-a-jpg/): Las fotos que hace un iPhone, en un formato que abre todo el mundo.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. Tu propio navegador lee el archivo en tu propio hardware, unos cientos de líneas de JavaScript servidas desde este origen lo vectorizan, y te lo devuelven como descarga. Esta herramienta no tiene función de red de ningún tipo — nunca trae nada y nunca envía nada — y la `Content-Security-Policy` de la página nombra cada dirección con la que puede contactar, ninguna de las cuales pertenece a este sitio.

### ¿Esto convertirá mi fotografía en SVG?

No de forma útil, y la página te lo dirá en vez de dejar que lo descubras después de descargar. Vectorizar convierte cada mancha de color parecido en su propia forma, así que una fotografía vuelve como miles de borrones superpuestos y un archivo muchas veces mayor que el JPEG, que se abre despacio y no se parece a la fotografía. Lo que se vectoriza bien es una imagen con una *forma* dentro: un logotipo, una plantilla, una firma, un dibujo a línea, una silueta. Para la fotografía de un solo objeto, el ajuste *el sujeto* lo recortará como una silueta maciza, que es otra cosa y sí es útil de verdad.

### ¿Cuál es la diferencia entre las dos maneras de encontrar la forma?

La pregunta que hacen. **Claro y oscuro** pregunta si cada píxel es más oscuro que un nivel, que es exactamente lo correcto para tinta sobre papel e inútil cuando el sujeto y el fondo son igual de oscuros. **El sujeto** pregunta qué es el fondo — lo aprende en una franja alrededor del borde de la imagen, mide cada píxel contra él y se queda con lo más grande que no lo es. Eso funciona con la fotografía de un objeto sobre un fondo más o menos liso, y falla con una imagen recortada tan ajustada que el sujeto se sale por tres lados, porque entonces los bordes de los que aprende son el propio sujeto. Cuando pase, puedes señalar tú el fondo en su lugar.

### ¿Por qué la forma vectorizada tiene agujeros o pierde las partes finas?

Porque la imagen ya los tenía en cuanto se convirtió en un bit por píxel. Activa *lo que recibió el trazador* para verlo: por debajo de unos doce píxeles el ojo de una letra ya se ha cerrado y sus astas ya se han fundido, y ninguna vectorización recupera un agujero que no está. Los remedios están antes — mueve el umbral, o parte de un escaneo más grande. En el modo *el sujeto*, *cerrar huecos de hasta* sella los agujeros pequeños y *rellenarlo macizo* cierra cualquier agujero al que el fondo no llegue desde el borde de la imagen.

### ¿Puedo arreglar lo que tomó mal?

Sí, y para eso es casi todo el tercer paso. Haz clic en cualquier cosa que no debería estar en el dibujo y desaparece; vuelve a hacer clic y vuelve. Un clic toma toda la mancha de ese color, así que un clic quita una mota entera o un sello entero y no un píxel. Hacer clic en un trozo de fondo encerrado lo rellena. Las correcciones se guardan aparte del umbral, así que mover el control después no las tira.

### ¿Cómo de grande será el SVG?

Para una forma, menor que la imagen: una silueta vectorizada suele ser de uno a cinco kilobytes, y un logotipo unos pocos más. La página te lo dice exactamente, junto a la descarga. Para una fotografía será enorme, que es la señal más clara de que es la herramienta equivocada para ese archivo — y la página deja de dibujar y lo dice pasadas unas mil formas separadas.

### ¿Vectoriza en color?

No. Esto hace una forma de un solo color, que es el caso que sale pareciendo un dibujo y no una mala fotocopia. Vectorizar en color significa reducir a unos pocos colores y vectorizar cada uno como su propia capa, y el resultado decepciona a la mayoría de quienes lo piden. Si necesitas color, vectoriza la forma aquí y rellénala en tu programa de dibujo.

### ¿Qué puedo hacer con el SVG después?

Escalarlo a cualquier tamaño sin que se ablande, recolorearlo con un solo atributo, animarlo, imprimirlo o mandarlo a una máquina de corte o a un láser. Es un solo `<path>` sin regla de relleno que equivocar, así que Illustrator, Inkscape, Figma, un navegador y la mayoría del software de CNC lo leen todos igual.

### ¿Hay un límite de tamaño para la imagen?

El de tu equipo, no el nuestro. Una página A4 escaneada a 300 ppp — unos nueve megapíxeles — se vectoriza en una fracción de segundo. Las imágenes más grandes funcionan; solo tardan más, y el trabajo ocurre en tu propio procesador y no en una cola en alguna parte.

### ¿Es gratis, y necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni prueba, ni marca de agua. Tampoco hay límite en el número ni en el tamaño de los archivos, porque no hay ningún servidor pagando por ellos — el trabajo ocurre en tu propio equipo. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tus archivos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y sigue funcionando. Es también la manera más sencilla de demostrar que no se sube nada: una herramienta que mandara tu imagen fuera para vectorizarla se pararía en el momento en que desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tu imagen no tiene adónde ir.** La Content-Security-Policy nombra cada dirección con la que esta página puede contactar, y ninguna pertenece a este sitio. Aquí no hay ningún punto donde tus archivos pudieran recogerse, ni nada en el código que los mandara allí si lo hubiera.
- **Nada aquí va a buscar nada.** No hay ningún `fetch`, ningún `XMLHttpRequest` ni ningún `sendBeacon` en ninguna parte de `src/`. La herramienta entera es aritmética sobre los píxeles de una sola imagen: un umbral, un recorrido por el borde de lo que encontró y algo de ajuste de curvas.
- **No hay ningún motor que descargar.** Vectorizar suele ser el programa de otro, y en la web eso significa varios megabytes de código compilado que llegan antes del primer clic. Aquí no hay nada de eso. Todo son unos cientos de líneas de JavaScript corriente servidas desde este origen, que es también por lo que la página funciona en cuanto se abre y no después de una espera.
- **Qué carga Google, y qué no se le da.** Los scripts de anuncios y medición vienen de Google, y el botón de donar de Buy Me a Coffee. A ninguno se le entrega nada sobre tu imagen. Cada línea que la lee, la umbraliza o la vectoriza se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo un paso de red en ella. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/mask.js` para ver cómo una imagen se convierte en un bit por píxel, `src/contour.js` para el recorrido por el borde de la forma, `src/fit.js` para ver cómo una escalera se convierte en curvas, y `src/subject.js` para ver cómo se deduce el fondo cuando no hay claro y oscuro por los que separar.
