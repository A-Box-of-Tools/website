# Comprimir PDF — reducir el tamaño de un PDF

Reduce un documento sin mandarlo a ninguna parte.

> Reduce el tamaño de un PDF sin subirlo. Tu propio navegador lo lee, vuelve a comprimirlo y lo reescribe, y antes de tocar nada te enseña dónde está de verdad el tamaño.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/comprimir-pdf/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus documentos **nunca se suben**. No hay ningún servidor.

El documento se abre, se despieza y se vuelve a escribir en la memoria de este dispositivo, con código servido desde esta misma dirección. Aquí no hay nada capaz de subir un archivo, y al otro lado de esta página tampoco hay ningún servidor que fuera a recibirlo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos se quedan en tu dispositivo

## Cómo reducir el tamaño de un PDF

1. **Elige un PDF.** Arrástralo hasta el selector o búscalo a mano. El navegador lo lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Mira dónde está el tamaño.** El desglose es la razón de ser del segundo paso. Si la barra es casi toda imágenes, esta herramienta tiene con qué trabajar. Si es casi toda tipografías y contenido de página, te lo dirá, y el ahorro honesto será de un pequeño porcentaje. Más vale saberlo antes de dedicarle un minuto.
3. **Di cuánto hay que apretar.** Los ajustes con nombre son resoluciones, no notas vagas: 96 PPP para leer en pantalla, 130 para enviar por correo y 220 para algo que todavía tiene que imprimirse. Cada uno se compara con el tamaño al que se dibuja de verdad la imagen en la página, así que una foto puesta como miniatura no recibe el mismo trato que un escaneo a página completa.
4. **Comprímelo y lee la línea que dice que se ha comprobado.** Cuando termina la reescritura, el mismo lector de esta página vuelve a abrir el archivo terminado y le cuenta las páginas. Si el número no coincide con el del original, la ejecución se da por fallida y no se ofrece ninguna descarga.

## La versión larga

[Cómo reducir el tamaño de un PDF, y por qué algunos no encogen](https://abox.tools/es/guias/reducir-el-tamano-de-un-pdf/): Dónde está de verdad el tamaño de un PDF, por qué un escaneo se comprime un 80 % y un contrato apenas se mueve, qué pintan aquí los PPP, y qué no debería hacerle nunca un compresor a tu documento.

## También en la caja

- [Censor de PDF](https://abox.tools/es/censurar-pdf/): Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.
- [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/): Mete tus fotos en un solo documento.
- [Escáner de documentos](https://abox.tools/es/escanear-documentos/): Fotografía la hoja. Te devuelve algo que parece escaneado.
- [Extraer el audio de un vídeo](https://abox.tools/es/extraer-audio-de-video/): Suelta un vídeo y quédate con el sonido. La imagen no se descodifica nunca, y no se sube nada.

## Preguntas

### ¿Se sube mi PDF a alguna parte?

No. Tu propio navegador lee el archivo, lo vuelve a comprimir y lo escribe, todo en tu propio hardware. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Tampoco tiene ninguna función de red, ni siquiera opcional.

### ¿Cuánto se va a reducir mi PDF?

Depende por completo de lo que lleve dentro, y por eso la herramienta lo mide y te lo enseña antes de comprimir nada. Un documento escaneado es casi todo fotografías y suele quedarse entre un 60 y un 90 % más pequeño. Un contrato o una tesis son texto, dibujo vectorial y tipografías incrustadas, y todo eso ya venía comprimido por el programa que lo generó; ahí el ahorro suele ser de un pequeño porcentaje, de reempaquetar el archivo y tirar lo que ya no usa nadie. Cualquier herramienta que te prometa un porcentaje fijo sin mirar tu archivo está adivinando.

### ¿Comprimir un PDF le hace perder calidad?

A las imágenes sí, porque se vuelven a codificar. Lo demás no se toca: el texto sigue siendo texto, seleccionable y buscable, las tipografías se conservan enteras y el dibujo vectorial se copia tal cual. La herramienta tampoco empeora una imagen para nada. Si la recodificación no sale más pequeña que el original, los bytes originales vuelven al documento sin que los haya tocado nadie.

### ¿Qué son aquí los PPP y por qué los pregunta?

Un PDF anota de qué tamaño se dibuja cada imagen en la página, así que la herramienta puede calcular su resolución efectiva. Un escaneo de 4000 píxeles colocado a lo ancho de veinte centímetros de papel lleva unos 500 píxeles por pulgada, y eso no lo aprovecha ninguna pantalla y casi ningún papel. Por eso los primeros píxeles en tirarse son los que sobran por encima del ajuste que elijas: cuestan una calidad que no ve nadie. Esa medición es la razón de que un logotipo puesto pequeño no reciba el mismo trato que un escaneo a página completa.

### ¿Puede abrir un PDF protegido con contraseña?

No, y es a propósito. Un documento cifrado se rechaza con un mensaje que lo dice, incluso cuando la contraseña está en blanco, que es como guardan muchos escáneres y fotocopiadoras. Quitarle la protección a un archivo es un trabajo distinto de comprimirlo, y una herramienta que lo hiciera sin decir nada estaría haciendo algo que tú no le has pedido.

### ¿Hay PDF que no pueda comprimir?

Algunas imágenes de dentro, sí. Las imágenes JPEG 2000, JBIG2 y codificadas para fax (CCITT) no tienen descodificador en ningún navegador, así que pasan intactas y la herramienta lo dice; las dos últimas son códecs de dos niveles y suelen estar ya cerca de su tamaño mínimo. Las imágenes CMYK también se dejan en paz, porque recodificarlas podría desplazar los colores que sacaría una imprenta. Todo lo que la herramienta se salta aparece con su nombre en los resultados, y con el motivo.

### ¿El archivo comprimido se seguirá abriendo en todas partes?

Sí. La salida se escribe como PDF 1.5, que entiende cualquier lector publicado desde 2003, y la herramienta lo demuestra en tu propio dispositivo: vuelve a abrir el archivo terminado y le cuenta las páginas antes de ofrecértelo. Los formularios, los enlaces, los marcadores, la estructura de accesibilidad y los adjuntos incrustados pasan al archivo nuevo. Lo que se queda atrás es el material al que ya no apuntaba nada del documento.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni más límite de tamaño que el que permita la memoria de tu propio dispositivo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu documento.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tu documento fuera para comprimirlo se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tu documento no tiene adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Esta herramienta no añade nada a esa lista, porque no tiene ninguna función de red propia, ni siquiera opcional. Aquí no hay ningún destino donde recoger tu archivo, ni una línea de código que lo mandara si lo hubiera.
- **El formato entero está en este repositorio.** Un PDF es una lista de objetos y una tabla que dice dónde empieza cada uno. `src/objects.js` lee esa sintaxis, `src/reader.js` sigue la tabla y `src/writer.js` escribe una nueva. Ninguno de los tres importa nada capaz de hacer una petición. No se descarga ninguna biblioteca y no se renderiza nada en un servidor.
- **Los archivos cifrados se rechazan en vez de abrirse.** Un PDF con contraseña se rechaza, y también los que guardan los escáneres con la contraseña vacía, que técnicamente sí se abrirían. Quitarle la protección a un documento es un trabajo distinto de hacerlo más pequeño, y quedaría raro que una herramienta lo hiciera por su cuenta y sin decir nada.
- **Quita cosas en lugar de meterlas.** El archivo terminado no lleva fecha de creación, ni línea de productor, ni el nombre de la herramienta que lo hizo. Si marcas la casilla, pierde además el paquete XMP y los bloques privados que dejan atrás los programas de maquetación. Es el mismo argumento de la herramienta de EXIF, aplicado a otro contenedor.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu documento: ni un archivo, ni una página, ni un nombre, ni un tamaño, ni un número de páginas. Cada línea que lee, descodifica o escribe un PDF se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tu documento. Si no lo pulsas no ocurre nada, y lo que hay al otro lado es un sitio ajeno.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tu documento fuera para comprimirlo se pararía en seco.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, y `src/reader.js` y `src/writer.js` para toda la lectura y la reescritura, que no pueden llegar a la red ni uno ni otro.
