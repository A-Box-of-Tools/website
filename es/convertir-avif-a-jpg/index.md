# AVIF a JPG — abre esa imagen que no puedes abrir

El formato que guardan las webs, convertido al que siempre se ha aceptado.

> Convierte AVIF a JPG en el navegador. Ya incluye el decodificador: no se sube nada, no hace falta cuenta y funciona sin conexión. Elige el color que sustituirá la transparencia.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-avif-a-jpg/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

La conversión ocurre en el navegador y en tu dispositivo. No hay que descargar un decodificador ni esperar: el navegador lee AVIF desde 2021, por eso esa imagen que otros programas rechazan se ve bien en una pestaña. Esta página usa ese decodificador, dibuja la imagen y escribe un JPEG. No tiene funciones de red ni un servidor al que enviar una foto.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo convertir AVIF a JPG

1. **Elige los archivos AVIF.** Suéltalos en el selector o búscalos. Se reconocen por sus primeros bytes, no por el nombre: un AVIF renombrado sigue funcionando y un PNG se rechaza con un mensaje que indica su formato real.
2. **Elige la calidad y el color de fondo para la transparencia.** El control empieza en 92, donde una foto resulta difícil de distinguir del original. El campo de color solo aparece si algún archivo tiene transparencia, porque el JPEG debe rellenarla.
3. **Pulsa “Convertir” y descarga.** Cada resultado indica el archivo de origen, su tamaño y la diferencia. Suele pesar bastante más: AVIF comprime mejor y aquí cambias tamaño por compatibilidad. Un archivo tiene botón de descarga; varios también permiten descargar un ZIP.

## La versión larga

[El archivo que casi nada abre, salvo el navegador donde lees esto](https://abox.tools/es/guias/convertir-avif-a-jpg/): ¿Guardaste una imagen y recibiste un .avif que ningún programa abre? El navegador sí lo lee. Qué es AVIF, qué no puede conservar un JPEG, por qué ocupa más y cómo convertirlo sin subirlo.

## También en la caja

- [Creador de fotos de carnet](https://abox.tools/es/foto-carnet/): Elige el país. Aplica esa norma, exactamente.
- [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.
- [Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.
- [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/): Mira lo que una foto cuenta de ti. Y luego quítaselo.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. El navegador lee, decodifica y escribe el archivo en tu dispositivo. La herramienta no pide ni envía nada por la red. La `Content-Security-Policy` enumera todas las direcciones permitidas y ninguna pertenece a este sitio. Ni siquiera hay un decodificador que cargar: ya está en el navegador.

### ¿Por qué ningún programa de mi dispositivo abre este archivo?

Porque AVIF es reciente para muchos programas. Las webs lo usan porque pesa mucho menos que JPEG a igual calidad. Al guardar una imagen recibes un `.avif`, pero el programa donde intentas abrirlo puede ser anterior al formato. Windows necesita una extensión; algunos editores, lectores electrónicos, impresoras y formularios no lo admiten. El navegador sí lo lee, por eso la imagen pudo llegar a ti y esta página puede convertirla.

### ¿El JPG pesará más que el AVIF?

Casi siempre, a menudo varias veces más. El resultado muestra cuánto. AVIF es un códec moderno y eficiente; JPEG es mucho más antiguo. Un AVIF de 40 KB puede convertirse en un JPEG de 200 KB con calidad visible similar. Cambias tamaño por compatibilidad. Si necesitas reducirlo después, el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/) permite fijar un tamaño objetivo.

### ¿Qué pasa con la transparencia?

Se rellena con el color que elijas, y la página lo avisa antes de convertir. AVIF tiene canal alfa y JPEG no, así que no puede conservarse: decides qué color poner debajo. La mayoría de los AVIF son fotos opacas y el campo no aparece. Para conservar transparencia, conviértelo a PNG o WebP con el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/), que lee AVIF y escribe ambos formatos.

### ¿Qué pasa con HDR y el color de diez bits?

Se pierden porque JPEG no puede almacenarlos. AVIF admite diez o doce bits por canal y luces más brillantes que las de una pantalla habitual; JPEG usa ocho bits y rango normal. Un AVIF HDR se convierte en una imagen convencional: útil para compatibilidad, pero una pérdida real para un archivo de conservación. Casi ninguna imagen de una web corriente es HDR, así que normalmente no afecta.

### ¿Se vuelve a comprimir la imagen?

Sí, es inevitable. AVIF y JPEG son códecs distintos: hay que decodificar y volver a codificar. Todos los conversores lo hacen, también los que exigen subir el archivo. Puedes elegir la calidad; el valor inicial de 92 hace que una foto sea difícil de distinguir del original.

### ¿Se puede convertir al revés, de JPG a AVIF?

Aquí no. Ningún navegador escribe AVIF mediante el lienzo: si se lo pides, devuelve un PNG en silencio con un tipo incorrecto. Una página que lo prometa necesita otro codificador o un servidor. Hacerlo bien sin servidor exige incluir un codificador, un trabajo pendiente en la [hoja de ruta](https://abox.tools/es/hoja-de-ruta/).

### ¿Conserva la fecha, la cámara y la ubicación?

No. La imagen se dibuja en un lienzo que solo guarda píxeles; EXIF, GPS, perfiles de color y XMP quedan fuera. Las imágenes de una web no suelen tener esos datos. Para verlos o editarlos sin recomprimir la imagen, usa el [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/).

### ¿Puedo convertir una carpeta entera?

Sí. Añade los archivos que quieras. No hay límite de cantidad ni de tamaño porque no hay un servidor que los procese. Cada archivo tiene su fila y su descarga; con dos o más también puedes llevarte un ZIP.

### ¿Es gratis y funciona sin conexión?

Sí: sin cuenta, inicio de sesión, prueba ni marca de agua. La publicidad paga el sitio y no recibe información sobre tus imágenes. Carga la página una vez y desconéctate: seguirá funcionando igual. También es una comprobación directa de que no se sube nada.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **El decodificador ya está en el navegador.** Un AVIF que no se abre en el visor de fotos sí se abre en una pestaña: Chrome y Firefox lo leen desde 2021 y Safari desde 2023. Esta página añade un botón para guardar a ese decodificador: abre el archivo, lo dibuja y escribe un JPEG. No hay motor que descargar ni espera en la primera conversión, y no hace falta un servidor. Es lo que no explican los conversores que te piden subirlo.
- **Las partes transparentes y el color que las sustituye.** AVIF admite un canal alfa; JPEG no. Hay que colocar un color debajo. Aquí eliges cuál, con blanco como valor inicial. El campo solo aparece si se detecta transparencia en los píxeles decodificados de algún archivo. La mayoría de los AVIF guardados de webs son fotos opacas, por eso normalmente no hace falta mostrarlo.
- **Lo que un JPEG no puede conservar de un AVIF.** AVIF admite más colores y luces más intensas: diez o doce bits por canal y HDR. JPEG tiene ocho bits y no admite HDR, así que esas imágenes pasan al rango habitual. En la gran mayoría no hay nada que reducir y no notarás diferencias; en una captura de una foto HDR sí podrías notarlas. Conviene saberlo antes de convertir.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google, y el botón de donación, de Buy Me a Coffee. No reciben información sobre tus imágenes. Todo el código que lee, decodifica o escribe un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Carga la página una vez y desconéctate: funciona igual. Es la comprobación más sencilla. Un conversor que enviara tus imágenes a otro lugar no podría hacerlo.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, y `src/shared/image-convert.js` para la conversión: identifica el formato real, decodifica la imagen y la dibuja en el lienzo del que sale el JPEG. Es el mismo archivo que usan los otros dos conversores y no contiene ningún códec.
