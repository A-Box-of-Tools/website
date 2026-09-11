# Contraseñas y frases — seguras y aleatorias, creadas en tu navegador

Se crean aquí, en tu propio navegador, y no se envían a ninguna parte. No se guarda nada y no hay historial.

> Crea una contraseña aleatoria segura, o una frase de contraseña tipo diceware a partir de una lista de 7.776 palabras incluida en la página. La saca el generador criptográfico de tu navegador, no se envía a ningún sitio y no se guarda. Gratis y sin registro.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/generador-de-contrasenas/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus contraseñas y frases de contraseña **nunca se suben**. No hay ningún servidor.

Cada carácter sale de `crypto.getRandomValues`, el generador criptográfico del propio navegador, y cada palabra de una lista que viaja en esta carpeta como `src/wordlist.js`. No hay ni un `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon` en todo `src/`, así que no existe camino alguno por el que una contraseña creada aquí pueda llegar hasta nosotros ni hasta nadie. Tampoco se guarda nada, de modo que recargar esta página destruye todas las contraseñas que te haya mostrado.

- ✗ Sin subir nada
- ✗ Sin cuenta
- ✗ No se guarda nada
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo crear una contraseña segura sin que ninguna web la vea

1. **Elige contraseña o frase de contraseña.** Una contraseña es una tirada de caracteres aleatorios: corta de guardar, incómoda de teclear y exactamente lo que hace falta para los cientos de cuentas que tu gestor rellena por ti. Una frase de contraseña son palabras sacadas al azar de una lista: más larga, pero recordable y pronunciable, que es lo que necesitas para los pocos secretos que tienes que teclear de memoria, como el del propio gestor de contraseñas, el del portátil o el código de recuperación del móvil.
2. **Fija la longitud, o el número de palabras.** Este es el ajuste que importa y los demás en general no. Veinte caracteres, o seis palabras, es un suelo razonable para cualquier cosa que valga la pena proteger; sube desde ahí para la cuenta que permitiría restablecer todas las demás. La lectura de abajo se mueve mientras arrastras, así que ves lo que aporta cada carácter de más.
3. **Activa las reglas que el formulario va a exigir.** «Al menos uno de cada conjunto», un dígito al final, un símbolo de la lista corta que acepta cualquier sitio. Ninguna de estas cosas hace nada más fuerte, y la primera lo debilita un poco, cosa que la página ya ha restado. Pero son la manera de pasar un formulario de registro sin generar seis contraseñas seguidas.
4. **Lee el número, no el color.** Los bits se cuentan a partir de los ajustes que produjeron la cadena: el tamaño del alfabeto, el número de extracciones y nada más. Eso es una medida de verdad, a diferencia del medidor de una página de registro, que solo puede puntuar los caracteres que tiene delante y no tiene forma de saber si los elegiste tú o un generador.
5. **Cópiala y guárdala en algún sitio antes de irte.** Aquí no hay historial ni manera de recuperarla; recargar la página la destruye. Pégala primero en el gestor de contraseñas y después en el formulario de registro, para que quien tiene que recordarla ya la tenga antes de que algo pueda salir mal.
6. **Llévate un lote si lo necesitas.** El control de abajo crea hasta cien de una vez y las guarda como archivo de texto plano, escrito por esta página con lo que ya está en tu pantalla. Sirve para dar de alta cuentas o repartir credenciales iniciales, y conviene borrarlo en cuanto estén en un sitio mejor: un archivo lleno de contraseñas en el disco sigue siendo un archivo lleno de contraseñas.

## También en la caja

- [Formateador de JSON](https://abox.tools/es/formatear-json/): JSON, XML, HTML, CSS y YAML, formateados o convertidos. Nada se pega en el servidor de nadie.
- [Conversor de YAML a JSON](https://abox.tools/es/convertir-yaml-a-json/): Los dos sentidos, y te dice lo que cuesta cada uno. Nada de esto se pega en el servidor de otro.
- [Formateador de XML](https://abox.tools/es/formatear-xml/): XML ordenado para leerlo o comprimido para publicarlo, y convertido a JSON en los dos sentidos. Nada de esto se pega en el servidor de otro.
- [Comparador de textos](https://abox.tools/es/comparar-textos/): Dos textos dentro, cada diferencia marcada, línea a línea y palabra a palabra. Nada se pega en el servidor de nadie.

## Preguntas

### ¿Las contraseñas se envían a algún sitio o se guardan?

Ni lo uno ni lo otro. Se crean en tu navegador, en tu propio equipo, y esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Tampoco se escribe nada en el almacenamiento: ni localStorage, ni cookie, ni historial. Recarga la página y todas las contraseñas que te haya mostrado desaparecen, de la pantalla y de su propia memoria. La `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar y ninguna es nuestra, así que no hay dónde recoger una contraseña ni aunque algo lo intentara.

### ¿De dónde sale el azar?

De `crypto.getRandomValues`, el generador que los navegadores ofrecen para uso criptográfico, alimentado y realimentado por la reserva de entropía de tu propio sistema operativo. Es la misma fuente de la que el navegador saca el material de claves de TLS. `Math.random` no se usa en ninguna parte de esta herramienta, y la distinción no es pedantería: `Math.random` es un generador aritmético rápido cuyo estado interno completo se puede reconstruir a partir de unas pocas salidas consecutivas, de modo que un generador de contraseñas construido sobre él produce contraseñas que parecen aleatorias y que puede enumerar cualquiera que haya visto una.

### ¿Una contraseña creada en un navegador es tan buena como una de un programa de escritorio?

En cuanto al azar, sí: es la misma fuente del sistema operativo en ambos casos, alcanzada por una puerta distinta. Lo que cambia es qué más hay en la habitación. Una pestaña del navegador convive con tus extensiones, y una extensión con permiso para leer páginas puede leer esta. Eso vale para cualquier generador web, este incluido, y es la razón honesta para usar el generador que trae tu gestor de contraseñas cuando lo tienes a mano: es la misma aritmética, en un proceso con menos cosas al lado. Esta página es para cuando no lo tienes.

### ¿Contraseña o frase de contraseña? ¿Qué uso?

Una contraseña para todo lo que teclee por ti un gestor, porque no vas a mirarla nunca y la longitud te sale gratis. Una frase de contraseña para las pocas cosas que tienes que teclear de memoria o dictar en voz alta: la contraseña maestra del gestor, la clave de cifrado del disco, un equipo que configuras a distancia. Seis palabras de la lista larga son 77 bits, más que una contraseña aleatoria de doce caracteres y muchísimo más fácil de acertar a las cuatro de la mañana.

### ¿De qué longitud debería ser una contraseña?

Veinte caracteres del alfabeto completo son unos 130 bits, ya pasado el punto en el que la longitud deja de ser el problema. Dieciséis está bien. Doce es el suelo para cualquier cosa que te importaría perder, y es el suelo, no el objetivo. Por debajo dependes de que el sitio la haya guardado como es debido, apuesta que los últimos veinte años de avisos de filtraciones desaconsejan. La longitud gana a cualquier otro ajuste de esta página: un carácter más aporta más que cualquier regla sobre qué caracteres tienen que aparecer.

### ¿Cuántas palabras debería tener una frase de contraseña?

Seis de la lista larga, y siete si protege otras contraseñas. La famosa imagen de cuatro palabras se dibujó en 2011, son 51 bits, y hoy está al alcance de un ataque serio fuera de línea. Cinco son 64. Seis son 77, más de lo que nadie va a gastar en una cuenta corriente. Cada palabra de más de la lista larga suma 12,9 bits, y las palabras son lo único que suma: ni los guiones ni las mayúsculas.

### ¿Qué es un «bit» y por qué los cuenta esta página?

Un bit es una duplicación. Sesenta bits significa que había 2^60 resultados igual de probables que esta página podría haber producido, así que quien sepa exactamente cómo funciona todavía tiene esa cantidad que probar. Es una propiedad del *proceso*, no de la cadena: la página puede darla exacta porque fue ella la que eligió y sabe cuántas elecciones hizo. Esa es la diferencia con la barra de colores de un formulario de registro, que lee los caracteres y adivina. En esa barra, `correct horse battery staple` puntúa mal y vale 44 bits, y `P@ssw0rd!` puntúa bien y no vale casi nada.

### ¿Por qué «debe contener un símbolo» debilita la contraseña?

Porque una regla solo puede quitar posibilidades. Exigir al menos un carácter de cada conjunto descarta todas las contraseñas a las que no les tocó ninguno, y un conjunto más pequeño de contraseñas posibles es un conjunto más pequeño que recorrer. El efecto es pequeño, alrededor de medio bit a una longitud normal, y es real, y esta página lo resta en vez de dar la cifra que la favorece. Se calcula exacto contando las contraseñas que la regla permite de verdad, no las que descarta.

### ¿Qué lista de palabras es esta y importa que un atacante pueda descargarla?

Son las listas diceware de la Electronic Frontier Foundation, incluidas sin cambios: 7.776 palabras la larga y 1.296 la corta. Se construyeron justo para esto: nada ofensivo, sin homófonos, sin pares que al juntarse formen una tercera palabra, y en la corta ninguna palabra es el principio de otra. Y no, no importa que la lista sea pública: la fuerza que se indica aquí da por hecho que el atacante la tiene, que está leyendo el código de esta página y que conoce todos los ajustes que usaste. Lo único que no sabe es cuál de las 7.776 salió cada vez. Precisamente esa suposición es lo que hace fiable el número.

### ¿Una frase de contraseña no es un ataque de diccionario esperando a ocurrir?

No cuando las palabras se eligen así. Un ataque de diccionario funciona contra frases que elige una *persona*, porque las personas eligen palabras que pegan entre sí, en un orden con sentido, de entre las pocas miles que usan a diario. Esta página elige cada palabra de forma independiente y uniforme de una lista fija, sin importarle si el resultado se lee bien, que es justo por lo que normalmente no se lee bien. Un atacante que conozca la lista y el número de palabras sigue teniendo delante 7.776 elevado a ese número.

### ¿Puedo recuperar una contraseña después de salir de la página?

No, y es a propósito. No se anota nada en ningún sitio, así que no hay nada que recuperar: ni panel de historial, ni lista de «creadas recientemente», ni caché. Un generador capaz de enseñarte la contraseña del martes pasado sería un generador que la guardó, y guardada donde tú puedes alcanzarla es guardada donde puede alcanzarla otra cosa. Cópiala a un gestor de contraseñas antes de irte.

### ¿Es seguro copiarla al portapapeles?

Es el riesgo de siempre, y conviene conocerlo más que preocuparse por él. El portapapeles lo comparte todo lo que se ejecuta con tu usuario, suele sobrevivir hasta la siguiente copia y en algunas configuraciones se sincroniza entre dispositivos. Eso es un buen motivo para pegarla donde va de inmediato y copiar otra cosa después, y no un motivo para teclear a mano una contraseña más débil. Esta página no puede leer tu portapapeles: solo puede escribir en él, y solo cuando pulsas el botón.

### ¿Puedo usar la misma en más de un sitio?

No, y es el único consejo de esta página que está por encima de todos los demás. Casi todas las cuentas que caen, caen con una contraseña que antes era correcta en otro sitio: se filtra un servicio, se publica la lista, y el mismo correo con la misma contraseña se prueba en todas partes. Una contraseña distinta por sitio convierte una filtración en una cuenta en vez de en todas, y ese es el motivo para tener un gestor de contraseñas, no la fuerza de ninguna contraseña concreta que guarde.

### ¿Es gratis? ¿Hace falta una cuenta?

Es gratis, no hay cuenta, ni registro, ni prueba, ni límite de cuántas generas. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les entrega absolutamente nada de lo que crea esta página, ni siquiera cuánto medía o cómo de fuerte era.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y sigue creando contraseñas. El azar viene de tu propio equipo y la lista de palabras ya está en la página. Es también la forma más sencilla de demostrar que no se descarga ni se envía nada: un generador que le pidiera los números a un servidor se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **La contraseña se crea donde estás leyendo esto.** La saca esta página, dentro de esta página, del azar que tu propio sistema operativo le entrega al navegador. No se pide nada para producirla y no se informa de nada cuando ya existe. La `Content-Security-Policy` nombra todas las direcciones que esta página puede contactar y ninguna es nuestra: aquí no hay ningún punto de recogida donde pudiera acabar una contraseña generada, ni nada en el código que la enviaría si lo hubiera.
- **Aquí nada descarga nada.** No hay ni un `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon` en todo `src/`. La lista de palabras no se descarga: es `src/wordlist.js`, servida desde este mismo origen junto con el resto de la página, y puedes leerla.
- **El azar es el del navegador, y es del tipo correcto.** `crypto.getRandomValues` es el generador que los navegadores ofrecen para claves y tokens, alimentado y realimentado por el sistema operativo. `Math.random` no aparece en ninguna parte de esta carpeta, y sería un fallo de verdad que apareciera: su estado interno se puede reconstruir a partir de un puñado de salidas, con lo que cualquiera que haya visto una de sus contraseñas puede calcular todas las demás.
- **No se guarda nada, así que no hay historial que borrar.** Ni localStorage, ni sessionStorage, ni cookie, ni parámetro en la URL, ni un `<input>` que el navegador se ofrezca a recordar. Lo que está en pantalla vive en un único array en la memoria de esta página, y cerrar la pestaña es toda la limpieza que hace falta. Las únicas copias de lo que se crea aquí son las que te lleves tú.
- **Qué carga Google y qué no se le entrega.** Los scripts de publicidad y medición son de Google, y el botón de donación es de Buy Me a Coffee. A ninguno se le entrega un carácter de lo que crea esta página, ni su longitud, ni su fuerza, ni con qué ajustes salió. Todas las líneas que sacan un carácter o una palabra se sirven desde este origen y están en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo un paso de red dentro de ella. Es la prueba más sencilla de todas: un generador que le pidiera el azar a un servidor se pararía en cuanto desenchufaras.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/random.js` para las cuarenta líneas que hay entre esta página y todas las contraseñas que crea, que tienen una única entrada y esa entrada es el generador del navegador; `src/generate.js` para ver cómo los ajustes se convierten en una cadena; y `src/strength.js` para la aritmética que hay detrás del número, que cuenta en lugar de adivinar.
