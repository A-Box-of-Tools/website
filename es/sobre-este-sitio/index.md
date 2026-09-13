# Sobre abox.tools

Una sola persona, en Ontario, construyendo las herramientas que necesitaba una y otra vez y en las que no terminaba de confiar. Todo lo de aquí funciona en tu propio dispositivo, el código es público, y esta página explica el porqué de ambas cosas.

Última actualización 27 de agosto de 2026

## Qué es esto

abox.tools es una colección de herramientas pequeñas que hacen una sola cosa cada una: cambiar el tamaño de una foto, recortar un vídeo, unir dos PDF, leer lo que de verdad contiene un código QR. Ahora mismo hay 44, y también una [colección de guías](https://abox.tools/es/guias/) sobre las tareas para las que sirven.

Lo raro no es lo que hacen, sino dónde lo hacen. Todas y cada una funcionan enteras dentro del navegador, en el equipo de quien las usa, con los decodificadores y codificadores que el navegador ya trae. Nada de lo que abres se transmite a ningún sitio. Detrás de estas páginas tampoco hay un servidor al que pudiera llegar: el sitio entero son archivos estáticos, y las herramientas son módulos de JavaScript servidos junto a ellos.

Eso es el producto. Todo lo demás de esta página explica por qué merece la pena construirlo así y quién está detrás.

## Quién lo hace

Una persona, sola, en Ontario, Canadá. Esto no es una empresa. No hay equipo, ni inversores, ni una matriz detrás, ni ningún plan de que alguien lo compre. El correo va a [hi@abox.tools](mailto:hi@abox.tools) y lo lee quien escribió el código. En la [página de contacto](https://abox.tools/es/contacto/) se explica para qué sirve ese correo y para qué no.

El sitio se publica a propósito sin una firma personal. Es un proyecto pequeño, no una marca personal, y aquí lo que merece confianza no es un nombre al pie de una página, sino [el código](https://github.com/A-Box-of-Tools/website), que cualquiera puede leer, y el comportamiento de las páginas, que cualquiera puede comprobar en unos treinta segundos con las herramientas de desarrollo abiertas. Esas dos cosas se verifican. Una firma no.

## Por qué está hecho así

La forma habitual de construir estas herramientas es subir el archivo, hacer el trabajo en un servidor y devolver el resultado. Es más fácil, funciona en cualquier dispositivo y es lo que hace casi cualquier «conversor online gratis».

También significa entregarle tu archivo a un desconocido. Con un meme da igual. Con el escaneo de un pasaporte, una imagen médica, un contrato firmado o una foto que lleva tu dirección en los metadatos, no da igual. Una vez que el archivo está en el equipo de otro, lo que le ocurra depende de sus políticas y de su competencia, y no tienes forma de auditar ni una cosa ni la otra. La política de privacidad de un sitio así es una promesa, no una restricción.

Los navegadores han mejorado hasta hacer innecesaria esa promesa. Saben leer y escribir JPEG, PNG y WebP; saben abrir y decodificar vídeo; saben calcular el hash de un archivo, leer un código QR y escribir un PDF. Si el trabajo puede hacerse en tu propio equipo, entonces la pregunta «¿se quedarán con mi archivo?» deja de ser una pregunta sobre las intenciones de nadie y pasa a ser una pregunta sobre qué puede hacer el código físicamente. Y esa sí puedes responderla tú.

Ese es el argumento completo, y hay una guía que lo desarrolla como es debido: [¿es seguro subir archivos a una web?](https://abox.tools/es/guias/es-seguro-subir-archivos/)

## Comprobar, en lugar de confiar

Todo lo anterior está pensado para ponerse a prueba. Cuatro maneras, de menos a más esfuerzo:

- **Desconecta internet.** Carga cualquier página de herramienta, desconéctate y úsala igualmente. Sigue funcionando, porque nunca hubo un paso de red dentro. Una herramienta que enviara el archivo fuera para procesarlo se pararía.
- **Mira la red.** Abre las herramientas de desarrollo, ve a la pestaña Red y procesa un archivo. Ni una sola petición lleva tu archivo, ni una miniatura, ni su nombre, ni un byte de su contenido. Lo que se ve es la página, sus scripts, la publicidad y el contador de visitas.
- **Lee la norma que la página se impone a sí misma.** Cada página lleva una `Content-Security-Policy` que enumera todas las direcciones con las que puede contactar, y ninguna es de este sitio. Ni siquiera un error en el código podría enviar un archivo a ningún lado, porque el navegador rechazaría la conexión.
- **Lee el código.** Es [todo público](https://github.com/A-Box-of-Tools/website), sin paso de compilación y sin empaquetador: lo que hay en el repositorio es byte a byte lo que ejecuta el navegador. Cada herramienta tiene un README que explica cómo funciona, y cada página indica qué archivos conviene leer primero.

Hay exactamente una excepción deliberada a lo de «sin red», y está explicada largamente en su propia página: [Compartir texto](https://abox.tools/es/compartir-texto/) mueve texto entre dos dispositivos tuyos, cosa que no puede hacerse sin red. Abre una única conexión con un intermediario que no guarda nada y al que solo se le dice que dos navegadores quieren presentarse.

## Cómo se construyen y se comprueban las herramientas

Una herramienta se publica cuando funciona con archivos reales, no cuando funciona con el archivo contra el que se escribió. En la práctica eso significa manejarla a mano en un navegador con entradas incómodas: el vídeo sin fotograma clave justo donde quieres cortar, el HEIC de un teléfono que escribe el contenedor un poco mal, el PDF con una fuente incrustada solo en parte. Eso es lo que la gente tiene de verdad, y es justo lo que no encuentra una prueba escrita por la misma persona que escribió el fallo.

Debajo hay una batería de pruebas automáticas que cubre las dos mitades: el generador que construye el sitio y los módulos que ejecuta el navegador. Se ejecuta con cada cambio, y nada se publica después de un fallo. Cuando un mismo trabajo aparece en varias herramientas (unas cuantas leen archivos MP4), una prueba comprueba que las copias siguen coincidiendo, de modo que arreglar una no deja las otras mal en silencio.

Las guías se escriben con el mismo criterio. Sus capturas las toma un script del sitio ya construido, en lugar de dibujarlas o simularlas, así que una imagen de una guía es una imagen de la página tal y como está hoy.

## Cómo se paga esto

Con publicidad y con donaciones de quienes encuentran útiles las herramientas. Ese es todo el modelo de negocio, y conviene ser preciso sobre qué implica y qué no.

**No hay nada que comprar.** Ni cuenta, ni registro, ni un plan gratuito con otro de pago encima, ni marca de agua que quitar, ni límite de tamaño, ni límite diario, ni funciones reservadas. Lo que hay en el sitio es todo.

**Tus archivos no forman parte del trato.** La publicidad es de Google y el recuento de visitas es Google Analytics, y a ninguno de los dos se le dice qué abres, qué produces, cómo se llamaba ni cuánto pesaba, porque ninguno de los dos scripts llega a verlo, y la política de seguridad de la página rechazaría el envío si alguno lo intentara. Qué recogen exactamente esos dos, y cómo desactivar cada uno, está en la [página de privacidad](https://abox.tools/es/privacidad/). Todas las herramientas siguen funcionando con ambos bloqueados.

**Las herramientas no se escriben para la publicidad.** Ninguna existe porque una palabra clave valiera dinero, y ninguna se ha hecho más lenta, más engorrosa o más larga para vender más impresiones. Qué se construye después se discute a la vista de todos, en [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), un párrafo por idea, incluidas las razones por las que varias propuestas aparentemente obvias se han rechazado.

## Idiomas

El sitio se publica en quince idiomas. Cada uno es una traducción de verdad, no una pasada automática dejada donde cayó: los nombres de las herramientas, las explicaciones, las guías y las propias direcciones están traducidos, y una página solo aparece listada en un idioma cuando ese idioma se ha escrito de verdad. Un idioma en el que todavía se trabaja se puede leer, pero queda fuera del sitemap y del selector de idioma, de modo que a nadie se le invita a una página medio en inglés.

El correo se responde en inglés, que es lo único honesto que puede decirse de un proyecto de este tamaño.

## Lo que este sitio no va a hacer

- Pedirte que crees una cuenta ni pedirte tu correo.
- Subir, guardar, inspeccionar ni conservar un archivo que abras aquí.
- Poner una marca de agua en un resultado ni reservar una función para un plan de pago.
- Añadir un paso de red a una herramienta que no lo necesita.
- Afirmar en la página de una herramienta algo que el código del repositorio no hace.

Si ves que ocurre cualquiera de esas cosas, es a la vez un fallo y una promesa rota, y merece la pena avisar. La [página de contacto](https://abox.tools/es/contacto/) es la vía más rápida.
