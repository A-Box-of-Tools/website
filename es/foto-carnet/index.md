# Foto de carnet — pasaporte y visado según la norma

Elige el país. Aplica esa norma, exactamente.

> Haz una foto de pasaporte o visado según la norma publicada de tu país: milímetros y DPI exactos, una guía en vivo de altura de cabeza y línea de ojos, comprobación del fondo, una hoja de 10x15 lista para imprimir y un archivo ajustado al límite en KB del portal. No se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/foto-carnet/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus fotos **nunca se suben**. No hay ningún servidor.

El recorte, las mediciones, la lectura del fondo y la impresión se hacen todos en tu propio navegador, en tu propio equipo, con el codificador JPEG que ya trae. Esta herramienta no tiene ninguna función de red, nada que pedir y nada que enviar, y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar una fotografía de tu cara.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo hacer una foto de pasaporte que no te devuelvan

1. **Elige la fotografía.** Una foto de móvil contra una pared lisa, con luz de día, hecha a metro y medio más o menos. El navegador la lee directamente de tu disco, y mientras tanto no sale nada a ninguna parte.
2. **Elige el país y el documento.** El panel enseña entonces el tamaño de impresión, la banda de altura de cabeza, la línea de ojos, el color de fondo y los límites de subida de esa norma, junto con la autoridad de la que salió cada cifra y la fecha en que se leyó. Nada de esa lista está supuesto, y cualquier cosa que te hayan mandado y que no esté en ella entra por «En cualquier otro sitio».
3. **Comprueba los cuatro puntos sobre tu cara.** Coronilla, barbilla y cada pupila: esos cuatro puntos son todo lo que mide la norma. Se colocan midiendo la propia foto, y la línea de debajo dice cuáles se lograron y cuáles hubo que deducir. Arrastra el que haya caído mal, o cambia a *Los coloco yo* y hazlos los cuatro a mano. Luego pulsa *Ajustar el recuadro* y el recorte cae donde lo quiere ese país.
4. **Lee las cuatro comprobaciones, y el fondo.** Altura de cabeza, línea de ojos, centrado e inclinación, cada uno medido sobre el recuadro tal como está y cada uno diciendo hacia dónde arrastrar si se sale. El fondo se lee de la parte de arriba y de los lados del recorte y se compara con el color que pide la norma; la falta de uniformidad, que es lo que de verdad hace que rechacen las fotos, se mide aparte del color.
5. **Llévate los tres archivos.** La impresión, a los milímetros exactos y con la resolución escrita dentro del archivo para que una tienda la imprima al tamaño correcto. La hoja, con tantas copias como quepan en un ⁦10 × 15⁩ y marcas de corte en los huecos. Y la subida, al tamaño en píxeles que exige el portal y dentro de la banda de KB que impone por los dos extremos.

## La versión larga

[Cómo hacerse una foto de pasaporte que no te devuelvan](https://abox.tools/es/guias/hacer-una-foto-de-carnet/): Qué se mide de verdad en una foto de pasaporte — altura de la cabeza, línea de los ojos, fondo —, qué números quiere cada país, y cómo cumplir los límites de píxeles y de KB que impone un formulario en línea.

## También en la caja

- [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.
- [Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.
- [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/): Mira lo que una foto cuenta de ti. Y luego quítaselo.
- [Visor DICOM](https://abox.tools/es/visor-dicom/): TC, resonancia, radiografía y ecografía, con la ventana, la cabecera y las medidas.

## Preguntas

### ¿Se sube mi foto a alguna parte?

No. La imagen la decodifica, la recorta, la mide y la escribe tu propio navegador en tu propio equipo, con el codificador JPEG que el navegador ya trae. Esta herramienta no tiene ninguna función de red: nunca pide nada y nunca envía nada, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Aquí eso vale más que en casi cualquier otra herramienta: el archivo es una fotografía de tu cara.

### ¿Qué países están cubiertos?

Las especificaciones transcritas hasta ahora son la propia norma de la OACI, Estados Unidos (pasaporte y la inscripción en la lotería de visados, que tienen reglas de subida distintas), el Reino Unido, el visado Schengen, Alemania, Canadá, Australia, la India (pasaporte, la copia de ⁦35 × 45⁩ mm y la foto y la firma de los formularios SSC y UPSC), China y Japón. Cada entrada nombra la autoridad de la que salió y la fecha en que se leyó. Todo lo demás entra por «En cualquier otro sitio», donde cada cifra la escribes tú; y como casi todo el mundo emite siguiendo la geometría de la OACI, esa entrada arranca con ella.

### ¿Cómo encuentra la coronilla, la barbilla y los ojos sin un modelo de caras?

Dando por hecho algo que un detector de caras general no puede dar por hecho y esta herramienta sí: todas estas normas exigen la misma escena — una persona, de frente a la cámara, contra una pared lisa e iluminada por igual. Así que el color de la pared se lee en el borde de la foto, todo lo que no es ese color es la persona, y lo más alto de ella es la coronilla, con el pelo incluido. Las pupilas se buscan como el mejor par de manchas más oscuras que su propio entorno, a la misma altura y una a cada lado del centro de la cabeza: una comparación local, así que nada en ella depende del color que tenga una cara. La barbilla es la única que no se puede encontrar así, porque una mandíbula contra un cuello es un borde suave sin cambio de color; se deduce de las pupilas, que están un poco por debajo de la mitad de la cabeza una vez contado el pelo que tiene encima, y luego se contrasta con el contorno. Todo ello son cuentas en `src/detect.js`: sin pesos, sin motor de inferencia, sin descargar nada, y las mismas cuentas para cualquier cara. Eso último es lo que importa, porque un detector empaquetado se equivoca de forma desigual — peor con unas caras que con otras — y quienes ya ven rechazadas sus fotos más a menudo son justo a quienes dejaría tirados.

### ¿Cuánto debo fiarme de los puntos que coloca?

Lo bastante para partir de ahí, no tanto como para no mirarlos. Cada uno de los cuatro tiene una foto en la que falla: una pared estampada o una estantería no deja contorno contra el que recortar una cabeza, una cabeza cortada por arriba no tiene coronilla en la foto, y unas gafas, un flequillo espeso o los ojos cerrados pueden poner las pupilas sobre el rasgo equivocado. Por eso la herramienta dice en voz alta cuáles de los cuatro midió y cuáles tuvo que deducir, se niega en redondo ante una foto sin fondo liso en vez de inventarse una respuesta, y deja todos los puntos arrastrables. El recorte sale de donde acaben quedando, nunca de donde empezaron. Si prefieres colocar los cuatro tú, el interruptor sobre la foto dice *Los coloco yo*, y mover cualquier punto a mano cambia solo a esa opción: desde ese momento son tuyos y nada los va a mover.

### ¿Qué es la regla de la altura de cabeza, y por qué la mía no la cumple nunca?

Todas estas especificaciones dicen cuánto del encuadre tiene que ocupar la cabeza, medida desde la base de la barbilla hasta lo más alto de la cabeza, pelo incluido; suele ser entre el 70 y el 80 por ciento, que para una foto de 45 mm son de 31,5 a 36 mm. El motivo habitual del fallo es el selfi: un brazo mide unos 60 cm, lo que deforma la cara y deja la cabeza demasiado grande en el encuadre. El segundo motivo habitual es la coronilla: es lo más alto del pelo, no el nacimiento del pelo, y marcar el nacimiento hace que todas las cabezas salgan pequeñas.

### ¿Por qué el archivo tiene que pesar al menos 20 KB, y cómo se puede rellenar?

Los portales de exámenes de la India, el formulario de visado chino y la subida del pasaporte británico indican un tamaño mínimo además de un máximo, porque un archivo por debajo suele ser una miniatura que alguien subió por error. Una fotografía de ⁦200 × 230⁩ tiene 46.000 píxeles, y con la mejor calidad que un navegador vaya a escribir todavía puede quedarse en 15 KB, sin forma de hacerla más grande comprimiendo menos. Así que la herramienta añade un segmento de comentario JPEG lleno de espacios. Eso forma parte del estándar JPEG, cualquier decodificador se lo salta y la imagen es bit a bit la misma imagen: lo único más largo es el archivo. El relleno dice exactamente eso, en inglés, dentro del propio archivo.

### ¿Comprueba el fondo, y puede sustituirlo?

Lo comprueba y no lo sustituye. El color se lee de una franja a lo ancho de la parte superior del recorte y por cada lado, por encima de los hombros, y se compara con el color de la norma en CIE Lab y no en RGB: dos grises separados por cuarenta unidades RGB son indistinguibles, y cuarenta unidades de azul son otro color. La falta de uniformidad se mide aparte, porque una sombra en una pared blanca es lo que de verdad hace que rechacen fotografías, y eso no es un problema de color. Sustituir un fondo significa recortar a una persona de una imagen, que es un modelo de segmentación, y uno malo se come el pelo. Ponerte medio metro más lejos de la pared arregla más de estos casos que cualquier filtro.

### ¿Para qué es la hoja de ⁦10 x 15⁩?

Una cabina cobra varios euros por seis fotografías. Un mostrador de fotos imprime un ⁦10 × 15⁩ por céntimos, y eso lo hace cualquiera. Así que la herramienta coloca tantas copias de tu foto como quepan en el papel — ocho, para un ⁦35 × 45⁩ en un ⁦10 × 15⁩ — con marcas de corte en los huecos y sin imprimir nada encima de una imagen. No se escala nada: cada copia tiene exactamente el tamaño que pide la norma, porque una hoja que las encogiera un dos por ciento para meter una más serían ocho fotografías del tamaño equivocado. Imprímela al 100 por cien; «ajustar a la página» es lo que hace que una hoja salga mal.

### ¿Por qué importan los DPI si los píxeles son los mismos?

Porque un JPEG puede decir de qué tamaño es, y si no lo dice, lo que lo imprima se lo inventa. La resolución vive en la cabecera JFIF, y un lienzo de navegador escribe esa cabecera con el campo de unidades puesto en «esto es una proporción, no una resolución». Esta herramienta reescribe esos pocos bytes para que el archivo diga 300 dpi, que es lo que convierte ⁦413 × 531⁩ píxeles en una fotografía de ⁦35 × 45⁩ mm y no en una imagen sin tamaño determinado. Para eso no se decodifica nada y no se gasta calidad.

### ¿Puede hacer también el archivo de la firma?

Sí: los formularios SSC y UPSC la quieren a ⁦140 × 60⁩ píxeles y entre 10 y 20 KB, y está en la lista como especificación propia. La guía de la cara se apaga para ella, porque una firma no tiene línea de ojos, y lo que se comprueba en su lugar es que el papel sea claro, que haya tinta encima y que el recorte no se haya llevado una raya del cuaderno o el borde de la página. Llegar a los 10 KB es la parte difícil de esa regla, no quedarse por debajo de 20.

### ¿Esto garantiza que me acepten la solicitud?

No, y ninguna herramienta puede garantizarlo con honestidad. Lo que hace es aplicar las cifras publicadas exactamente y enseñarte cada medición que ha hecho, para que lo que un formulario mide automáticamente — tamaño en píxeles, tamaño de archivo, formato — esté bien, y lo que mide una persona — altura de cabeza, línea de ojos, el fondo — lo tengas delante con números. Las normas además cambian: cada especificación de aquí dice de qué autoridad salió y cuándo se leyó, para que puedas contrastarla con el formulario que tienes delante en vez de fiarte de una tabla.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua impresa sobre tu cara. Tampoco hay límite de cuántas fotografías hagas, porque no hay ningún servidor pagándolas. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu fotografía.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando: el reglamento es un archivo servido con la página, no una consulta. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tu fotografía fuera a recortar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Una fotografía de tu cara no sale nunca de este equipo.** Aquí eso pesa más que en casi cualquier otra herramienta: el archivo que maneja esta página es una imagen de tu cara, y lo que estás a punto de hacer con ella nombra además el país cuyo documento estás solicitando. La `Content-Security-Policy` nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudiera recogerse tu fotografía.
- **Aquí nada pide nada.** En `src/` no hay ningún `fetch`, ningún `XMLHttpRequest` y ningún `sendBeacon`. El reglamento es una tabla en `src/specs.js`, servida con la página y guardada en caché con ella: no hay ninguna lista de países que consultar ni nada contra lo que comprobar tu foto en remoto.
- **La cara se encuentra sin ningún modelo de caras.** No hay pesos que descargar, ni motor de inferencia que los ejecute, ni nada que se pida a la red: la coronilla sale del contorno de tu cabeza contra la pared que hay detrás, y las pupilas de las zonas de la cara que son más oscuras que lo que las rodea. Nada de eso lee el color de la piel, y esa es justamente la razón de escribirlo así — un modelo que se equivoca se equivoca de forma desigual, peor con unas caras que con otras. Es una posición de partida y no un veredicto: la página dice cuál de los cuatro puntos no ha podido medir, cada punto sigue siendo arrastrable, y con *Los coloco yo* queda apagado del todo.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega nada sobre tu fotografía, tu cara ni el país cuya norma has elegido. Cada línea que lee, recorta, mide o escribe un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/specs.js` para el reglamento, con las cifras publicadas de cada país, la autoridad de la que salen y la fecha en que se leyeron, `src/detect.js` para cómo se encuentran los cuatro puntos — un contorno y dos manchas oscuras, sin modelo alguno —, `src/geometry.js` para las cuentas que convierten cuatro puntos marcados en un recorte, y `src/jpeg.js` para las dos modificaciones de cabecera que meten la resolución de impresión en el archivo y suben una subida demasiado pequeña hasta el tamaño que exige un formulario.
