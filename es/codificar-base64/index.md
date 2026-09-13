# Codificador y decodificador Base64 — y URL, entidades HTML, hexadecimal y escapes

Base64, codificación porcentual, entidades HTML, hexadecimal y escapes con barra invertida, en los dos sentidos. Nada se pega en el servidor de nadie.

> Codifica y decodifica Base64 en los dos alfabetos, codifica URL en porcentaje, escapa entidades HTML y lee hexadecimal y escapes con barra invertida. Todo corre en tu navegador y no se sube nada: un token nunca sale de tu equipo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/codificar-base64/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus textos **nunca se suben**. No hay ningún servidor.

Cada codificación de aquí es aritmética sobre una cadena de texto, hecha aquí, en esta página. Los códecs están escritos a mano y viven en `src/encode.js`; y no hay nada más. Esta herramienta no tiene ninguna función de red, nada que pedir y nada que enviar, lo cual importa aquí más que en casi ningún otro sitio: lo que la gente pega en un decodificador de Base64 en línea es un token, y pegar un token en la web de otra persona es entregárselo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo codificar o decodificar Base64 sin subirlo

1. **Elige la codificación.** Base64 en los dos alfabetos, codificación porcentual para un valor suelto o para una URL entera, las cinco entidades HTML, bytes en hexadecimal y los escapes con barra invertida de un literal de cadena. La nota bajo el menú dice para qué sirve cada una.
2. **Elige el sentido.** *Codificar* toma texto plano y produce la forma codificada; *Decodificar* devuelve la forma codificada al texto plano. El resultado sigue tu escritura, así que cambiar de sentido es un clic y nada que volver a teclear.
3. **Pégalo, o suelta el archivo.** Vale cualquier cosa que puedas seleccionar y copiar. Un archivo soltado sobre el selector lo lee tu propio navegador y lo pone en la caja: aquí no hay ningún paso de subida que omitir.
4. **Lee el error, si lo hay.** Un decodificador que falla aquí dice qué encontró — un carácter que el Base64 no usa, relleno donde no toca, bytes que no son texto — en vez de devolver algo plausible y equivocado.
5. **Llévate el resultado.** Cópialo, o descárgalo como archivo de texto. Los contadores bajo la caja dicen cuántos bytes entraron y cuántos salieron.

## También en la caja

- [Compartir texto y archivos](https://abox.tools/es/compartir-texto/): Lo compartido vive en esta pestaña abierta. Los lectores lo reciben cifrado, directamente desde tu navegador, y al cerrar la pestaña se acaba: ningún servidor guarda nada.
- [Generador de QR y códigos de barras](https://abox.tools/es/generar-codigo-qr/): Escríbelo y se convierte en un código. Para hacerlo no se envía nada.
- [Lector de códigos QR y de barras](https://abox.tools/es/escanear-codigo-qr/): Apúntale con la cámara o suelta una imagen. Se lee aquí, y en ningún otro sitio.
- [Hash y suma de verificación](https://abox.tools/es/calcular-checksum/): Comprueba una descarga contra el número que publicó quien la distribuye, sin enviársela a nadie.

## Preguntas

### ¿Se sube mi texto a alguna parte?

No. Cada codificador y cada decodificador de esta página es una función que corre en tu propio navegador, en tu propio equipo. Esta herramienta no tiene ninguna función de red: nunca pide nada y nunca envía nada, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Esa es la razón para usarla con un token de acceso o una cookie de sesión: pegar cualquiera de esas cosas en el decodificador de otra persona es entregársela.

### ¿El Base64 de aquí es el mismo Base64 que en todas partes?

Sí: se comprueba contra los vectores de prueba del RFC 4648 y no contra sí mismo. Los dos alfabetos se decodifican, así que un JWT escrito con `-` y `_` se lee tan bien como uno escrito con `+` y `/`, y la entrada partida a 64 caracteres se junta por ti. La codificación va por bytes UTF-8, así que una letra acentuada o un emoji sobrevive a la ida y vuelta.

### ¿Base64 es un cifrado?

No, y tomarlo por uno es el error clásico. Base64 es una ortografía: los mismos bytes, escritos en un alfabeto que sobrevive a una URL, a un correo o a una cadena JSON. Cualquiera puede leerlo de vuelta — esta página lo hace en un milisegundo —, así que no esconde nada y no protege nada. Si lo que tienes es secreto, necesita cifrado de verdad antes de codificarse, no en su lugar.

### ¿Por qué falló la decodificación?

Porque lo pegado no es exactamente lo que se le dijo al códec que era, y el error dice en qué sentido: un carácter fuera del alfabeto Base64, relleno donde no toca, un signo de porcentaje sin dos dígitos hexadecimales detrás, o bytes que sí se decodifican desde Base64 pero no son texto UTF-8 — lo que suele significar que el original era un archivo y no una cadena. El `atob` del navegador habría devuelto algo plausible en su lugar; que te lo digan es todo el sentido de pegar algo en un decodificador.

### ¿Cuál es la diferencia entre las dos codificaciones de dirección web?

Un valor suelto, o la dirección entera. Codificar *un valor* escapa todo aquello a lo que una URL da significado — las barras, los signos de interrogación, los ampersands —, que es lo que quieres para un solo parámetro de la cadena de consulta. Codificar una *URL entera* deja la dirección funcionando: las barras y el `?` se quedan, y solo se escapan los caracteres que una URL no puede llevar de ninguna manera. Usar lo primero sobre una dirección entera rompe la dirección; usar lo segundo sobre un valor pierde dónde acaba el valor.

### ¿De qué tamaño puede ser el archivo?

Aquí no hay ningún límite puesto, porque no hay ningún servidor pagándolo. El techo práctico es tu propio equipo: unos cuantos megabytes de texto van bien, y con un documento muy largo la página espera una pausa en tu escritura antes de recodificar, en vez de pelearse contigo por el teclado.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni límite de cuánto pegas. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu texto.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tu texto fuera a decodificar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Lo que pegas no tiene por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudiera recogerse un token pegado, ni nada en el código que lo enviara si lo hubiera.
- **Aquí nada pide nada.** En `src/` no hay ningún `fetch`, ningún `XMLHttpRequest` y ningún `sendBeacon`. Cada codificador y cada decodificador son funciones de esta página que reciben una cadena y devuelven una cadena.
- **El decodificador te avisa cuando algo está mal.** El `atob` del navegador acepta entradas que debería rechazar y devuelve algo plausible. El Base64 de aquí está escrito a mano y se comprueba contra los vectores de prueba de la RFC 4648, y cuando lo que pegaste no es Base64, lo dice, y dice por qué. Las pruebas de `tests/js/text-encode.test.js` comprueban exactamente eso.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega un carácter de tu texto. Cada línea que lo lee, lo analiza o lo escribe se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy y `src/encode.js` para el Base64 que se comprueba contra los vectores de prueba de la RFC 4648 en vez de contra sí mismo, y que rechaza las entradas malas en lugar de devolver algo plausible como hace `atob`.
