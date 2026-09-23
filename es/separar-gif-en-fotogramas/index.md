# Separador de GIF — cada fotograma en su propio PNG

Cada fotograma fuera, en su propio PNG.

> Separa un GIF animado en sus fotogramas y guarda cada uno como PNG, gratis y enteramente en el navegador. Conserva la transparencia y los tiempos. No se sube nada y funciona sin conexión.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/separar-gif-en-fotogramas/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus GIF **nunca se suben**. No hay ningún servidor.

El GIF lo lee, lo descomprime y lo dibuja tu propio navegador, y cada PNG se codifica en la memoria de este dispositivo. Al otro lado de esta página no hay ningún servidor al que mandar una animación, aunque algo de aquí quisiera hacerlo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo separar un GIF en fotogramas

1. **Elige el GIF.** Suéltalo sobre el selector o búscalo a mano. El navegador lo lee directamente de tu disco, y la página te cuenta lo que ha encontrado: el tamaño, cuántos fotogramas tiene, cuánto dura y cuántas veces se repite.
2. **Decide qué guarda cada PNG.** **El fotograma tal como aparece** es lo que quiere casi todo el mundo: la imagen entera en ese momento de la animación. **Solo los píxeles que ese fotograma guarda** es el parche que el archivo lleva de verdad, con su propio tamaño y en su propio sitio, que es la razón de que un GIF sea pequeño y no es el aspecto que tiene la animación.
3. **Decide qué pasa con la transparencia.** El PNG la conserva, y esa es la opción honesta. Rellénala con un color si los fotogramas van a parar a algún sitio que ignora la transparencia y la convertiría en negro.
4. **Escoge los fotogramas que quieres.** Por defecto, todos. «Quedarme con uno de cada dos» adelgaza una grabación larga, y las casillas de la cuadrícula mandan por encima de eso. La numeración no cambia nunca, así que el fotograma 42 se sigue llamando fotograma 42 por pocos vecinos suyos que hayas conservado.
5. **Descárgalos.** De uno en uno desde la cuadrícula, o todos juntos en un solo ZIP para que haya una pregunta de guardado en vez de cientos. El ZIP puede llevar un `frames.txt` con cuánto duró cada fotograma, que es lo único que una carpeta de PNG no sabe contar por sí sola.

## La versión larga

[Cómo separar un GIF en fotogramas](https://abox.tools/es/guias/separar-un-gif-en-fotogramas/): Saca cada fotograma de un GIF animado como PNG: por qué algunos fotogramas son solo un trozo pequeño de la imagen, qué pasa con la transparencia y cómo conservar los tiempos para volver a montarlo.

## También en la caja

- [Analizador de GIF](https://abox.tools/es/analizar-gif/): Fotogramas, duraciones, paletas y adónde fue cada byte.
- [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Convierte una carpeta de imágenes en un vídeo.
- [Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.
- [Recortador de vídeo](https://abox.tools/es/recortar-video/): Deja el clip en la parte que de verdad importa.

## Preguntas

### ¿Se sube mi GIF a alguna parte?

No. El archivo lo lee, lo descomprime y lo dibuja tu propio navegador en tu propio equipo, y cada PNG se codifica aquí, en memoria. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar: ninguna es nuestra. Desconéctate de la red y verás que sigue separando GIF.

### ¿Por qué un fotograma parece un trocito de la imagen?

Porque es lo que hay en el archivo. Un GIF es una primera imagen seguida de parches: cada fotograma posterior guarda solo el rectángulo que cambió, y todo lo demás en pantalla es lo que dejaron ahí los anteriores. Una cabeza hablando delante de una pared quieta guarda, por tanto, una cara por fotograma y no una imagen por fotograma, que es justamente la razón de que el formato no sea enorme. \
\
Estás viendo eso porque tienes elegido «Solo los píxeles que ese fotograma guarda». Cambia a «El fotograma tal como aparece» y cada PNG será la imagen entera, tal como se ve la animación en ese instante.

### ¿Conserva la transparencia?

Sí. La transparencia de un GIF es un único bit, un píxel está pintado o es invisible y no hay nada en medio, y el PNG guarda exactamente eso, así que los fotogramas salen con sus zonas transparentes intactas. Si prefieres un fondo sólido, pon «Zonas transparentes» en rellenar con un color; eso queda escrito en el PNG y después ya no se puede deshacer.

### ¿Por qué las duraciones no son las que esperaba?

Un GIF guarda cada duración en centésimas de segundo, y los navegadores llevan desde los noventa subiendo a una décima cualquier valor menor de dos centésimas: una regla escrita para los globos giratorios de la época y que nunca se quitó. Un fotograma cuyo archivo dice 0,01 s se reproduce a 0,10 s en todas partes. Esta herramienta muestra la duración tal como se reproduce de verdad, y anota al lado lo que guarda el archivo cuando las dos difieren.

### ¿Puedo volver a montar los fotogramas?

Sí, con el [Creador de GIF](https://abox.tools/es/crear-gif/) de este sitio o con cualquier otra cosa que acepte una carpeta de imágenes. Para eso está el `frames.txt` del ZIP: separar una animación tira los tiempos a la basura, porque un PNG no tiene dónde anotar cuánto se mantuvo en pantalla, así que la lista se lleva fuera la duración y la posición de cada fotograma.

### ¿En qué formatos se pueden guardar los fotogramas?

En PNG, y a propósito solo en PNG. Un fotograma de GIF tiene como mucho 256 colores y un bit de transparencia; el PNG guarda eso exactamente y sin pérdidas, mientras que el JPEG tiraría la transparencia, se inventaría colores que el fotograma nunca tuvo y normalmente haría un archivo *mayor* con un dibujo plano. Si necesitas JPEG, convierte los PNG después con el [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/).

### ¿Hay un límite de fotogramas que pueda leer?

No hay ningún límite fijo. El techo práctico es la memoria de tu propio equipo: un GIF se expande a alrededor de un byte por píxel y fotograma mientras se lee, así que un archivo pequeño puede ser muchísima memoria, y esta página deja de leer antes que dejar morir la pestaña. Si eso pasa lo dice, y te devuelve los fotogramas que sí consiguió.

### ¿Abre un GIF dañado?

Normalmente sí. Las descargas cortadas, la marca de fin que falta y un último fotograma que se interrumpe a media lectura son cosas corrientes, y un lector que las rechace no sirve justo para los archivos que más ganas tiene la gente de desmontar. Vuelven todos los fotogramas que estén completos, con una nota diciendo qué iba mal. Solo se rechaza de entrada lo que no es un GIF en absoluto.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba. Tampoco hay marca de agua en los fotogramas. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus archivos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tu animación fuera a procesar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tu GIF no tiene por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudieran recogerse tus archivos, ni nada en el código que los enviara si lo hubiera. Antes esto decía `connect-src 'none'`, que no admitía excepciones; añadir publicidad costó eso, y decirlo forma parte del trato.
- **El lector de GIF son dos archivos de este repositorio.** Un navegador reproduce un GIF pero no te entrega sus piezas, así que el formato se lee aquí mismo: `src/gif.js` es el contenedor y el descompresor LZW, y `src/compose.js` son las reglas de descarte que deciden qué aspecto tiene cada fotograma una vez que los anteriores quedan debajo. No se descarga nada para abrir un archivo, ni hay ningún motor que se baje la primera vez.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu animación: ni el archivo, ni un fotograma, ni un nombre, ni un tamaño, ni un recuento. Cada línea que lee, descomprime, dibuja o codifica una imagen se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y coge su tipografía de Google Fonts. No es más que un enlace: no informa de tu visita y no se le entrega nada sobre ti ni sobre tus archivos. No pasa nada mientras no lo pulses, y lo que abrirías entonces es el sitio de otra persona.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tu animación fuera para desmontarla se pararía en cuanto desenchufaras.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/gif.js` para el lector que descomprime los fotogramas y `src/compose.js` para las reglas que los van colocando unos encima de otros. En ninguno de los dos hay una línea capaz de llegar a la red.
