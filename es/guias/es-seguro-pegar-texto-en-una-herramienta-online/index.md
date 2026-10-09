# ¿Es seguro pegar texto en una herramienta online?

Pegar no se siente como subir, y esa es la trampa: los mismos bytes salen de tu máquina igualmente si la página los envía. Esto va de lo que de verdad lleva dentro una config o un log pegados — y de cómo saber si la herramienta que tienes delante tiene siquiera adónde mandarlos.

Última actualización 26 de agosto de 2026

## La respuesta corta

Pegar texto en una página web puede tener exactamente las mismas consecuencias que subirle un archivo. Que no lo parezca se debe a que el gesto viene de un lugar seguro: entre dos ventanas tuyas, pegar mueve texto de un sitio que controlas a otro sitio que controlas. En una página web, el segundo sitio es un cuadro de texto que un script puede leer — y lo que pase después depende por entero de la página, no del gesto.

Muchas herramientas con forma de pegado hacen su trabajo en un servidor: la página manda tu texto fuera, el servidor formatea, valida o compara, y el resultado vuelve. Nada en la pantalla te dice cuál de las dos clases estás usando. El cuadro de texto es igual en ambos casos; el botón de «Formatear», también. La diferencia es una petición de red, invisible salvo que la busques.

## Qué lleva de verdad un pegado

Lo que acaba en las herramientas online rara vez es prosa. Es el texto de trabajo del oficio de alguien, y el género importa, porque algunas de las cadenas más sensibles de la informática son precisamente las que se pegan en formateadores a medianoche:

- **Los archivos de configuración** existen para guardar lo que un programa no debe llevar escrito dentro, y esas cosas son contraseñas de bases de datos, claves de API y secretos de firma. Una config pegada entera los lleva todos.
- **Los logs y las trazas de error** llevan tokens de sesión en URLs, direcciones de correo, nombres de máquinas internas y, de vez en cuando, el cuerpo de una petición con los datos personales de alguien dentro.
- **Las respuestas de API** son instantáneas de datos de producción — clientes reales, saldos reales — pegadas en algún sitio cómodo para leerlas.
- **Cualquier cosa con pinta de base64** que se pega en un decodificador se codificó, normalmente, porque importaba: un token a medio depurar, un certificado, una cabecera de autenticación.

Una clave que ha pasado por el servidor de un desconocido hay que darla por expuesta en el momento en que te das cuenta: revocarla y emitir otra, que en un sistema en producción es una tarde que nadie había planeado. La cuestión no es que los sitios de formateo cosechen credenciales. Es que no puedes saber qué registra un servidor, y un secreto cuya exposición no puedes descartar es un secreto que tienes que rotar.

## Por qué la herramienta no necesita que tu texto salga

Este es el hecho técnico que zanja la pregunta: formatear, validar, convertir y comparar texto están entre los trabajos más fáciles de la informática. Analizar JSON, indentar XML, comparar dos archivos, codificar base64: un navegador lo hace en milisegundos, en local, y puede desde hace años. Un servidor no aporta nada al trabajo. Cuando una herramienta de pegar sube tu texto, eso es una herencia de arquitectura o una comodidad del operador, nunca una necesidad del trabajo.

De eso son el contraejemplo las herramientas de texto de este sitio. El [formateador de JSON](https://abox.tools/es/formatear-json/) analiza, formatea y convierte JSON, XML, HTML, CSS y YAML; el [comparador de textos](https://abox.tools/es/comparar-textos/) marca cada diferencia entre dos textos, línea a línea y palabra a palabra; el [codificador y decodificador base64](https://abox.tools/es/codificar-base64/) va en ambos sentidos entre un texto y sus codificaciones. Los tres corren en tu máquina, y lo que pegas no tiene adónde ir: estas páginas no llevan ningún camino de código que pudiera enviarlo.

Dos de ellos ya tienen guía propia: [formatear JSON sin subirlo](https://abox.tools/es/guias/formatear-json/) y [comparar dos archivos JSON](https://abox.tools/es/guias/comparar-dos-archivos-json/).

## Cómo saber cuál de las dos clases usas

Las comprobaciones son las mismas que con una herramienta de archivos, y están escritas enteras en [la guía sobre subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/). La versión corta, en clave de pegado:

- **Tira del cable.** Carga la página, desconéctate, pega, pulsa el botón. Una herramienta local sigue; una de servidor se para. Treinta segundos, cero pericia, imposible de fingir.
- **Mira la pestaña de Red mientras pulsas Formatear.** Una petición que sale en ese momento, más o menos del tamaño de tu pegado, es tu pegado saliendo. Sin petición, no hay subida.
- **Desconfía de los extras serviciales.** Un botón de «compartir este fragmento», un historial de tus pegados sincronizado entre dispositivos, un enlace para mandarle a un colega: cada uno solo es posible si el texto se guardó en un servidor. Las funciones son confesiones: una página que puede enseñarle tu pegado a otra persona se lo ha quedado.

Y un hábito vale más que las tres comprobaciones: pegar menos. Un validador no necesita la contraseña real para validar la forma de una config: `"REDACTED"` se analiza exactamente igual. Y para el pegado que es en sí el secreto, la regla se reduce a algo aún más simple: la única página que debería recibir jamás una contraseña es la página de inicio de sesión a la que pertenece.
