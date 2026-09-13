# Cómo crear un código QR y demostrar que escanea

El error caro del QR no es hacer el código: es descubrir en el local que los carteles escanean hacia una errata. Generar y verificar son aquí dos herramientas, y correr la segunda antes de la tirada cuesta un minuto y atrapa casi todo lo que la tirada habría repartido.

[Abrir Lector de códigos QR y de barras](https://abox.tools/es/escanear-codigo-qr/): Apúntale con la cámara o suelta una imagen. Se lee aquí, y en ningún otro sitio.

Última actualización 26 de agosto de 2026

## La respuesta corta

1. **Créalo.** Abre el [Generador de QR y códigos de barras](https://abox.tools/es/generar-codigo-qr/), elige el trabajo — un enlace, una red Wi-Fi, una tarjeta de contacto — y comprueba la cadena exacta que llevará el código, que la página enseña en vez de esconder. Exporta el SVG para imprenta, el PNG para pantallas.
2. **Imprime uno.** Al tamaño real, en el papel real, antes de la tirada de doscientos.
3. **Demuéstralo.** Fotografía la prueba con un móvil — en ángulo, con la luz del sitio — y suelta la foto en el [Lector de QR y códigos de barras](https://abox.tools/es/escanear-codigo-qr/). Muestra la carga decodificada y, si es un enlace, el host que alcanza de verdad. Si eso coincide con lo que querías, la tirada va segura.

Las dos herramientas corren en tu navegador y no mandan nada a ninguna parte, lo que en un código de Wi-Fi significa que la contraseña que lleva dentro nunca se tecleó en la web de nadie.

![El generador de QR con una dirección escrita, mostrando el código terminado y sus datos: su versión, su nivel de corrección de errores y cuánto espacio le queda.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

El código, hecho.

## Qué atrapa de verdad la verificación

- **La errata.** El fallo más común no es el código: es la URL de dentro. Leerlo de vuelta es la única comprobación que prueba lo que de verdad quedó codificado, y no lo que creías haber pegado.
- **El tamaño y la distancia.** Un código que se escanea desde el otro lado de una sala necesita módulos más grandes que uno en una tarjeta de visita. Fotografiar la prueba desde donde estará la gente es el test honesto; los niveles de corrección de errores del generador dicen en voz alta lo que cuesta cada uno en densidad.
- **Los colores.** Los códigos impresos en claro sobre oscuro escanean; las paletas de marca con poco contraste, muchas veces no. El lector aguanta más que la mayoría de los móviles: si a *él* le cuesta con la foto, el móvil más viejo del vestíbulo no tiene ninguna opción.
- **La arruga y el reflejo.** La corrección Reed-Solomon hace que un código a medio tapar siga leyéndose, hasta el nivel que elegiste. Un cartel destinado a la intemperie merece el nivel alto y el código algo más denso que cuesta.

![El lector, al que se ha dado esa misma imagen: informa de la dirección que contiene el código, la simbología y dónde lo ha encontrado dentro de la imagen.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

Y la misma imagen leída por otra herramienta, que es la única prueba que pilla un código que salió mal. El lector enseña lo que encontró y no lo abre.

## El mismo lector, para códigos que no son tuyos

Verificar es también la manera segura de abrir el QR que imprimió otro. El lector enseña la dirección entera y el host que alcanza de verdad *antes de que nada se abra*, y nombra los trucos que disfrazan un enlace: un nombre de usuario delante de la @, un alfabeto gemelo, una redirección. La pegatina del parquímetro merece esa inspección; la acreditación del congreso, también. Nada se abre por ti, y nada de lo que escaneas se manda a ninguna parte.

## Si haces esto cada semana

Crear y comprobar viven en dos páginas a propósito: cada una hace un trabajo, y cada una puede demostrar por sí sola que nada sale de tu equipo. Pero las dos son código abierto: licencia MIT, módulos ES sin dependencias — el codificador del generador y el decodificador Reed-Solomon del lector, cada uno con un README que lo explica.

Si de tu mesa salen códigos cada semana, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele una página que genere y haga pasar al momento el código dibujado por el decodificador: un autotest en cada exportación. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
