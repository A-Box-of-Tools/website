# Cómo crear un código QR y demostrar que escanea

El error caro del QR no es hacer el código: es descubrir en el local que los carteles escanean hacia una errata. Generar y verificar son aquí dos herramientas, y correr la segunda antes de la tirada cuesta un minuto y atrapa casi todo lo que la tirada habría repartido.

[Abrir Lector de códigos QR y de barras](https://abox.tools/es/escanear-codigo-qr/): Apúntale con la cámara o suelta una imagen. Se lee aquí, y en ningún otro sitio.

Última actualización 13 de octubre de 2026

## La respuesta corta

1. **Créalo.** Abre el [Generador de QR y códigos de barras](https://abox.tools/es/generar-codigo-qr/), elige el trabajo — un enlace, una red Wi-Fi, una tarjeta de contacto — y comprueba la cadena exacta que llevará el código, que la página enseña en vez de esconder. Exporta el SVG para imprenta, el PNG para pantallas.
2. **Imprime uno.** Al tamaño real, en el papel real, antes de la tirada de doscientos.
3. **Compruébalo.** Fotografía la prueba impresa con un teléfono, en ángulo y con la luz del lugar, y añádela al [Lector QR y de códigos de barras](https://abox.tools/es/escanear-codigo-qr/). Muestra el contenido y, en enlaces, el servidor de esa dirección codificada. Si coincide, prueba con los teléfonos que lo usarán y comprueba aparte el destino.

Ambas herramientas funcionan en el navegador sin enviar nada. En un código Wi-Fi, el procesamiento no transmite la contraseña para crearlo o leerlo.

![El generador de QR con una dirección escrita, mostrando el código terminado y sus datos: su versión, su nivel de corrección de errores y cuánto espacio le queda.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

El código, hecho.

## Comprueba el destino además de la impresión

Para un menú, inscripción o manual, pega la URL HTTPS completa, conserva cuatro módulos de margen e incorpora el SVG al diseño final. Imprime al tamaño previsto, monta en la superficie prevista y escanea desde donde estará el visitante. Lee la dirección y abre conscientemente en un teléfono para completar la acción: leer el menú, llegar al formulario o al manual correcto. Una cadena correcta aún puede llevar a una página inaccesible o que pida una sesión inesperada.

Las tarjetas de contacto requieren otro paso: tras leer el código impreso, guarda el contacto en un teléfono y revisa nombre, número y correo. En hojas de etiquetas, fotografía cada código aparte: el lector encuentra uno por imagen. Repite la prueba al cambiar URL, colores, tamaño o diseño y usa varios teléfonos antes de una tirada grande.

## Qué atrapa de verdad la verificación

- **La errata.** El fallo más común no es el código: es la URL de dentro. Leerlo de vuelta es la única comprobación que prueba lo que de verdad quedó codificado, y no lo que creías haber pegado.
- **El tamaño y la distancia.** Un código que se escanea desde el otro lado de una sala necesita módulos más grandes que uno en una tarjeta de visita. Fotografiar la prueba desde donde estará la gente es el test honesto; los niveles de corrección de errores del generador dicen en voz alta lo que cuesta cada uno en densidad.
- **Los colores.** Este lector lee códigos invertidos, pero eso no prueba que todos los teléfonos lo hagan. Empieza con módulos oscuros sobre fondo claro y prueba los colores reales de la marca tras imprimir.
- **Pliegues y reflejos.** Reed–Solomon repara parte de los datos dañados, pero el porcentaje no es un área garantizada que puedas cubrir. Los patrones de detección deben ser legibles. Un cartel a la intemperie merece el nivel mayor y el código algo más denso que supone.

![El lector, al que se ha dado esa misma imagen: informa de la dirección que contiene el código, la simbología y dónde lo ha encontrado dentro de la imagen.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

Y la misma imagen leída por otra herramienta, que es la única prueba que pilla un código que salió mal. El lector enseña lo que encontró y no lo abre.

## El mismo lector, para códigos que no son tuyos

Verificar también permite abrir con más cuidado un QR ajeno. El lector muestra la dirección completa y su servidor *antes de abrir nada* y señala cosas que revisar: usuario antes de @, letras parecidas o acortador conocido. No sigue redirecciones ni descubre el destino final de un enlace corto. Merece revisarse una pegatina de parquímetro o acreditación de congreso. Nada se abre por ti ni se envía lo escaneado.

## Si haces esto cada semana

Crear y comprobar viven en dos páginas a propósito: cada una hace un trabajo, y cada una puede demostrar por sí sola que nada sale de tu equipo. Pero las dos son código abierto: licencia MIT, módulos ES sin dependencias — el codificador del generador y el decodificador Reed-Solomon del lector, cada uno con un README que lo explica.

Si de tu mesa salen códigos cada semana, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele una página que genere y haga pasar al momento el código dibujado por el decodificador: un autotest en cada exportación. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
