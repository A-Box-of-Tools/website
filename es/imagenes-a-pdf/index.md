# Imágenes a PDF — convertir JPG a PDF

Mete tus fotos en un solo documento.

> Une imágenes JPG, PNG o WebP en un solo PDF, gratis y sin salir del navegador. Las fotos entran sin volver a codificarse, y no se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/imagenes-a-pdf/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

El documento se escribe en la memoria de este dispositivo, página a página, con código servido desde esta misma dirección. Aquí no hay nada capaz de subir un archivo, y al otro lado de esta página tampoco hay ningún servidor que fuera a recibirlo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos se quedan en tu dispositivo

## Cómo convertir imágenes en un PDF

1. **Elige tus imágenes.** Arrastra una carpeta entera hasta el selector, o busca los archivos a mano. El navegador los lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Ordena las páginas y gira las que lo necesiten.** Una imagen es una página, en el orden en que se ven. Arrastra una ficha por su asa para moverla, o usa las flechas. Los botones de giro voltean una página un cuarto de vuelta cada vez, que es lo que suele hacer falta con un escaneo que salió de lado.
3. **Elige un tamaño de página.** Con «Ajustar la página a cada imagen», cada página es exactamente su foto, sin recortes y sin bandas blancas. Los tamaños con nombre, o sea, A4, Carta, Oficio y los demás, colocan cada foto dentro de una página fija, con margen si lo quieres.
4. **Crea el PDF y descárgalo.** El documento se escribe en tu propio dispositivo, así que lo que tarde depende de tu hardware y no de una cola. El archivo terminado va directo a las descargas del navegador.

## La versión larga

[Cómo unir imágenes en un solo PDF](https://abox.tools/es/guias/unir-imagenes-en-un-pdf/): Convierte fotos o escaneos en un único PDF: tamaño de página, orden y giro, por qué un JPEG no tiene por qué perder calidad al entrar, y qué le cuenta un PDF a la persona a la que se lo mandas.

## También en la caja

- [Escáner de documentos](https://abox.tools/es/escanear-documentos/): Fotografía la hoja. Te devuelve algo que parece escaneado.
- [Extraer el audio de un vídeo](https://abox.tools/es/extraer-audio-de-video/): Suelta un vídeo y quédate con el sonido. La imagen no se descodifica nunca, y no se sube nada.
- [Cortador de audio](https://abox.tools/es/cortar-audio/): Marca los trozos que valen la pena mientras suena. Te vuelven como un solo archivo, cortado donde dijiste.
- [Editor de audio](https://abox.tools/es/editar-audio/): Ponla del revés, cámbiale la velocidad o levanta una grabación floja, y todo aquí mismo.

## Preguntas

### ¿Se suben mis imágenes a alguna parte?

No. Tu propio navegador lee tus imágenes y escribe el PDF, todo en tu propio hardware. Esta herramienta no tiene parte de servidor, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Y a diferencia de alguna otra herramienta de aquí, esta no tiene ninguna función de red opcional.

### ¿Convertir a PDF hace perder calidad?

Con un JPEG y el ajuste por defecto, no. Un PDF puede llevar datos JPEG directamente, así que una fotografía se copia al documento byte por byte: no se descodifica en ningún momento ni se vuelve a comprimir, y la imagen del PDF es la imagen del archivo. Los demás formatos hay que recodificarlos, porque el PDF no tiene ningún filtro para ellos. La excepción es el ajuste sin pérdidas, que los guarda exactamente a costa de un archivo más grande.

### ¿Qué formatos de imagen puedo usar?

Cualquier imagen fija que el navegador sepa descodificar, que en la práctica son JPG, PNG, WebP, GIF, AVIF y, en dispositivos Apple, HEIC. Aquí no hay otra lista que mantener al día, porque descodificar es trabajo del navegador y no nuestro.

### ¿Puedo elegir el tamaño de página y el orden de las páginas?

Sí. Las páginas pueden ser A4, Carta, Oficio, A3, A5, Tabloide, un tamaño que teclees tú o exactamente el tamaño de cada foto. Arrastra las fichas para reordenarlas, ordénalas por nombre o por fecha, gira la que quieras un cuarto de vuelta y pon un margen en milímetros.

### ¿Cuántas imágenes puedo meter en un PDF?

La herramienta no lleva ningún límite dentro. El techo de verdad es la memoria de tu propio dispositivo, porque el documento terminado se monta ahí antes de que lo descargues. Lo primero que lo nota son unos cientos de fotos de móvil a resolución completa, y reducir el lado más largo, desde los ajustes, mueve ese techo bastante lejos.

### ¿El PDF contiene los nombres de mis archivos o una marca de tiempo?

No, salvo que lo pidas. El bloque de información del documento se deja vacío salvo por el nombre de esta herramienta: ni nombres de archivo, ni nombre de equipo, ni nombre de usuario, ni fecha de creación mientras no marques la casilla. Y es a propósito, porque un PDF es de esas cosas que la gente le manda a otra gente.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus imágenes fuera para convertirlas en un documento se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Esta herramienta no añade nada a esa lista, porque no tiene ninguna función de red propia, ni siquiera opcional. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **El PDF se escribe aquí.** Un PDF es una lista de objetos y una tabla que dice dónde empieza cada uno, y `src/shared/pdf-page-writer.js` escribe las dos. No se descarga ninguna biblioteca, no se renderiza nada en ningún servidor y el archivo terminado sale de la memoria directo a una descarga.
- **Al documento no se le cuenta nada de ti.** Casi todas las herramientas le estampan a un PDF una marca de tiempo y el nombre del programa que lo hizo. Esta escribe un título, un autor y una fecha solo si los tecleas tú. Los nombres de archivo de tus fotos no aparecen en ningún sitio del documento, y de tu dispositivo tampoco aparece nada.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tus imágenes: ni un archivo, ni una miniatura, ni un nombre, ni un tamaño, ni un recuento. Cada línea que lee, descodifica o escribe una imagen se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tus imágenes. Si no lo pulsas no ocurre nada, y lo que hay al otro lado es un sitio ajeno.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tus fotos fuera para convertirlas en un documento se pararía en seco.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, y `src/shared/pdf-page-writer.js` y `src/document.js` para toda la escritura del archivo, que no toca la red en ningún momento.
