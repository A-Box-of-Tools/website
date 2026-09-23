# Crear un GIF — imágenes a GIF animado

Convierte un puñado de imágenes en una sola animación.

> Convierte imágenes JPG, PNG o WebP en un GIF animado, gratis y enteramente en el navegador. Tú decides el orden, la velocidad y el tamaño. No se sube nada y funciona sin conexión.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/crear-gif/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

Cada fotograma lo dibuja, lo cuantiza y lo comprime tu propio navegador, y el GIF terminado se monta en la memoria de este dispositivo. Al otro lado de esta página no hay ningún servidor al que mandar una imagen, aunque algo de aquí quisiera hacerlo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo hacer un GIF con imágenes

1. **Elige tus imágenes.** Suelta una carpeta sobre el selector o busca los archivos a mano. El navegador los lee directamente de tu disco, y mientras tanto no sale nada a ninguna parte.
2. **Ponlas en el orden en que deben reproducirse.** Arrastra por el asa o usa las flechas. «Ordenar por nombre» cuenta como esperarías, así que `frame_2` queda antes que `frame_10`.
3. **Di cuánto se mantiene cada fotograma.** Medio segundo cada uno es un pase de diapositivas; una veinteava parte es animación. Dale a todos el mismo tiempo de una vez, o deja uno aparte para que se quede más rato.
4. **Elige un tamaño y cómo se escogen los colores.** Un GIF crece con su superficie y con su número de fotogramas, y no hay ningún control de calidad que lo baje de nuevo, así que el tamaño es el ajuste que más importa. 256 colores por fotograma es la opción por defecto y la que mejor se ve; una sola paleta compartida sale más pequeña y más estable.
5. **Haz el GIF y descárgalo.** Se construye en tu propio equipo, así que lo que tarde depende de tu máquina y no de una cola. La animación terminada se reproduce en la página antes de que la guardes.

## La versión larga

[Cómo hacer un GIF animado con imágenes](https://abox.tools/es/guias/hacer-un-gif-con-imagenes/): Convierte un puñado de fotos en un GIF animado: a qué velocidad puede ir de verdad un GIF, qué cambia el ajuste de la paleta, y las tres cosas que de verdad hacen el archivo más pequeño.

## También en la caja

- [Separador de GIF](https://abox.tools/es/separar-gif-en-fotogramas/): Cada fotograma fuera, en su propio PNG.
- [Analizador de GIF](https://abox.tools/es/analizar-gif/): Fotogramas, duraciones, paletas y adónde fue cada byte.
- [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Convierte una carpeta de imágenes en un vídeo.
- [Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.

## Preguntas

### ¿Se suben mis imágenes a alguna parte?

No. Tus imágenes las lee, las dibuja, las cuantiza y las comprime tu propio navegador en tu propio equipo. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar: ninguna es nuestra. Desconéctate de la red y verás que sigue haciendo GIF.

### ¿Qué formatos de imagen puedo usar?

Cualquier formato de imagen fija que tu navegador sepa decodificar, que en la práctica significa JPG, PNG, WebP, GIF, AVIF y, en dispositivos Apple, HEIC. Aquí no hay ninguna lista aparte que mantener al día, porque decodificar es trabajo del navegador y no nuestro.

### ¿Por qué es tan grande mi GIF?

Porque un GIF guarda cada fotograma como píxeles enteros. No hay compensación de movimiento, nada se guarda como «igual que la vez anterior pero desplazado» y no hay mando de calidad: el tamaño es más o menos la superficie por el número de fotogramas, y solo tres cosas lo bajan. \
\
Hazlo más pequeño: reducir el tamaño a la mitad deja el archivo en una cuarta parte. Usa menos fotogramas, o mantén cada uno más tiempo. Baja a 64 o 32 colores y quita el difuminado, que cuesta menos de lo que parece en dibujos planos y muchísimo en fotografías. Si aun así no cabe, la respuesta honesta es que lo que estás haciendo es un vídeo, y un MP4 de lo mismo ocupará quizá una décima parte.

### ¿A qué velocidad puede ir un GIF?

No tan rápido como sugiere el número. El formato guarda la duración de cada fotograma en centésimas de segundo, y los navegadores llevan desde los noventa subiendo a una décima cualquier valor menor de dos centésimas: una regla escrita para los globos giratorios de la época y que nunca se quitó. Así que una duración de 0,01 s no se reproduce a 100 fotogramas por segundo, sino a 10. Por eso esta herramienta no te ofrece nada por debajo de 0,02 s, y 0,05 s (20 fotogramas por segundo) es más o menos lo más rápido que merece la pena pedir.

### ¿Qué cambia el ajuste de la paleta?

Un fotograma de GIF contiene como mucho 256 colores, y alguien tiene que elegirlos. \
\
**Los mejores colores para cada fotograma** escoge 256 para cada imagen por separado, que es lo que mejor se ve y la respuesta correcta para un conjunto de fotografías sin relación entre sí. **Una paleta para todo el GIF** construye una sola tabla a partir de todos los fotogramas a la vez. Da un archivo más pequeño y evita el parpadeo que aparece cuando la paleta da bandazos entre fotogramas de la misma escena, así que es lo que hay que elegir cuando los fotogramas son una secuencia y no una colección.

### ¿Puedo mantener un fondo transparente?

Sí, si tus imágenes lo tienen: pon «Transparencia» en «Mantener las zonas transparentes». Una cosa que conviene saber antes. La transparencia de un GIF es un único bit, un píxel está invisible o pintado del todo y no hay nada en medio, así que los bordes suavizados, las sombras difusas y todo lo que se desvanece acaban con un borde duro. Si tu animación va a ir sobre un fondo cuyo color conoces, aplanarla contra ese color quedará mejor.

### ¿Hay un límite de imágenes que pueda usar?

No hay ningún límite metido en la herramienta. El techo práctico es la memoria de tu propio equipo y tu paciencia con el archivo que salga: las imágenes se leen de una en una, así que cien fotogramas van bien, pero cien fotogramas a 640 px son también un GIF enorme. Mira más arriba, «¿Por qué es tan grande mi GIF?».

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba. En el resultado tampoco hay marca de agua. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus imágenes fuera a procesar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudieran recogerse tus archivos, ni nada en el código que los enviara si lo hubiera. Antes esto decía `connect-src 'none'`, que no admitía excepciones; añadir publicidad costó eso, y decirlo forma parte del trato.
- **El codificador son cuatro archivos de este repositorio.** Un GIF necesita un cuantizador de color y un compresor LZW, y el navegador no trae ninguno de los dos, así que ambos están escritos aquí, en `src/quantize.js` y `src/lzw.js`, con el contenedor en `src/gif.js`. No se descarga nada para hacer uno, ni hay ningún motor que se baje la primera vez.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tus imágenes: ni un archivo, ni una miniatura, ni un nombre, un tamaño o un recuento. Cada línea que lee, decodifica, dibuja o comprime una imagen se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y coge su tipografía de Google Fonts. No es más que un enlace: no informa de tu visita y no se le entrega nada sobre ti ni sobre tus imágenes. No pasa nada mientras no lo pulses, y lo que abrirías entonces es el sitio de otra persona.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tus imágenes fuera para convertirlas en un GIF se pararía en cuanto desenchufaras.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/quantize.js` para la paleta a la que se reduce cada fotograma, y `src/lzw.js` y `src/gif.js` para el compresor y el archivo en el que acaba. En ninguno de ellos hay una línea capaz de llegar a la red.
