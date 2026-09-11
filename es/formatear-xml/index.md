# Formateador de XML — ordénalo, comprímelo o conviértelo en JSON

XML ordenado para leerlo o comprimido para publicarlo, y convertido a JSON en los dos sentidos. Nada de esto se pega en el servidor de otro.

> Formatea, indenta y comprime XML, y convierte XML a JSON o JSON a XML. El analizador corre en tu navegador y no se sube nada, así que un feed, una factura o un archivo de configuración nunca sale de tu dispositivo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/formatear-xml/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus archivos XML y JSON **nunca se suben**. No hay ningún servidor.

Formatear y convertir son aritmética sobre una cadena de texto, hecha aquí, en esta página. El analizador está escrito a mano y vive en `src/shared/parse-xml.js`, y no hay nada más. Esta herramienta no tiene función de red de ninguna clase — nada que descargar, nada que enviar — y eso pesa aquí más de lo que la palabra «XML» sugiere: lo que llega en este formato suele ser una factura, un extracto bancario, un historial médico o una petición SOAP con las credenciales de alguien en la cabecera.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo formatear XML sin subirlo

1. **Elige el trabajo.** Dos pestañas, una caja: *Formatear* ordena el XML o lo comprime; *Convertir* lo vuelve JSON, o el JSON otra vez XML. El XML que acabas de ordenar es el XML que conviertes, sin pegarlo dos veces.
2. **Pégalo, o suelta el archivo.** Vale cualquier cosa que puedas seleccionar y copiar, y un archivo `.xml`, `.svg`, `.rss` o `.xsd` soltado sobre el selector lo lee tu propio navegador y lo pone en la caja — no hay paso de subida que omitir.
3. **Elige la indentación, o comprímelo.** Dos espacios, cuatro, o un tabulador. Comprimirlo es el mismo documento sin ninguno de los espacios que solo estaban ahí para leerlo, y el resultado dice cuántos bytes ha ahorrado eso.
4. **Lee el error donde está el error.** Un analizador que falla aquí dice *qué etiqueta* no se cerró nunca y en qué línea y columna, en lugar de «error en la línea 1», que es lo que dice un navegador sobre un documento que leyó de golpe.
5. **Llévate el resultado.** Cópialo, o descárgalo como archivo, con el nombre del formato en el que salió.

## También en la caja

- [Comparador de textos](https://abox.tools/es/comparar-textos/): Dos textos dentro, cada diferencia marcada, línea a línea y palabra a palabra. Nada se pega en el servidor de nadie.
- [Codificador y decodificador Base64](https://abox.tools/es/codificar-base64/): Base64, codificación porcentual, entidades HTML, hexadecimal y escapes con barra invertida, en los dos sentidos. Nada se pega en el servidor de nadie.
- [Compartir texto y archivos](https://abox.tools/es/compartir-texto/): Lo compartido vive en esta pestaña abierta. Los lectores lo reciben cifrado, directamente desde tu navegador, y al cerrar la pestaña se acaba: ningún servidor guarda nada.
- [Generador de QR y códigos de barras](https://abox.tools/es/generar-codigo-qr/): Escríbelo y se convierte en un código. Para hacerlo no se envía nada.

## Preguntas

### ¿Se sube mi XML a alguna parte?

No. El analizador y el impresor de esta página son funciones que corren en tu propio navegador, en tu propio hardware. Esta herramienta no tiene función de red de ninguna clase — nunca descarga nada y nunca envía nada — y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Eso importa más con XML de lo que la fama del formato sugiere: lo que llega en él suele ser una factura, un extracto bancario, un historial médico o una petición SOAP con credenciales en la cabecera.

### ¿Resuelve entidades externas?

No, y no hay nada que desactivar. La resolución de entidades externas es la manera de convencer a un analizador de XML de que lea archivos de la máquina donde corre — el ataque que suele escribirse XXE — y `src/shared/parse-xml.js` es un lector escrito a mano sin resolución de entidades en absoluto. Tu texto tampoco se le entrega nunca al `DOMParser` del propio navegador. Un `DOCTYPE` pasa de largo sin llegar a ejecutarse.

### ¿Qué se pierde al convertir XML a JSON?

El orden del contenido mixto, los comentarios y la diferencia entre un atributo y un elemento hijo — esta última suavizada más que borrada, porque un atributo se convierte en un miembro cuyo nombre empieza por `@`. El texto propio de un elemento se vuelve `#text` cuando tiene que convivir con algo más, y los hijos repetidos se vuelven un array. Todos los valores siguen siendo cadenas: XML no tiene tipos, y decidir que `8080` era un número sería inventar información.

### ¿Qué se pierde al convertir JSON a XML?

La diferencia entre un objeto vacío, un array vacío y una cadena vacía, que se convierten los tres en un elemento vacío, y el tipo de cada valor, porque XML no tiene tipos. Un array se convierte en un elemento repetido, que es la única forma que se lee de vuelta, y a una clave que un nombre de elemento no puede sostener se le sustituyen los caracteres incómodos en lugar de emitir un documento que ningún analizador leerá.

### ¿Puede formatear un SVG, un feed RSS o un archivo POM?

Sí. Los tres son XML, y esto lee XML en lugar de un dialecto concreto de él. Un SVG ordenado así es más fácil de editar a mano; un feed RSS o Atom suele publicarse comprimido y es ilegible hasta que algo lo abre. La disposición no cambia en nada lo que el documento significa.

### ¿Reindentar el XML cambia lo que significa?

En un documento cuyos elementos contienen otros elementos, no. Donde sí puede importar es en el texto: los espacios dentro de un elemento que contiene palabras forman parte de ese texto, así que un elemento que solo contiene texto se deja en una línea en lugar de abrirse. Las secciones `CDATA` se copian tal como estaban.

### ¿Por qué no usar el propio analizador de XML del navegador?

Por lo que dice cuando el documento está roto. El `DOMParser` devuelve un documento de error cuya redacción cambia en cada navegador y que a menudo se reduce a «error en la línea 1». Un lector escrito a mano puede decir qué etiqueta no se cerró nunca, y dónde se abrió, que es lo que realmente necesitabas saber. No resolver entidades externas es la otra razón.

### ¿De qué tamaño puede ser el archivo?

Aquí no hay ningún límite puesto, porque no hay un servidor pagándolo. El techo real es tu propio dispositivo: unos cuantos megabytes de XML van bien, y con un documento muy largo la página espera a que hagas una pausa al escribir antes de volver a formatearlo, en lugar de pelearte el teclado.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni límite de cuánto pegas. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tu texto.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y sigue funcionando. Esa es también la forma más simple de demostrar que no se sube nada: una herramienta que mandara tu XML fuera para formatearlo se pararía en el momento en que te desconectaras.

## Cómo se comprueba la promesa de privacidad

- **Lo que pegas no tiene adónde ir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún punto final donde recoger una factura pegada, ni nada en el código que la enviaría si lo hubiera.
- **Aquí nada descarga nada.** No hay ningún `fetch`, ningún `XMLHttpRequest` ni ningún `sendBeacon` en todo `src/`. El analizador y el impresor son funciones de esta página que toman una cadena y devuelven una cadena.
- **Nunca se resuelve ninguna entidad externa.** Un `DOCTYPE` con una entidad externa dentro es la manera de convencer a un analizador de XML de que lea un archivo de la máquina que está analizando, y es el agujero más antiguo del formato. `src/shared/parse-xml.js` es un lector escrito a mano que no tiene resolución de entidades en absoluto — no desactivada, ausente — y esta página nunca le entrega tu texto al `DOMParser` del propio navegador.
- **Todos los valores que salen del XML son cadenas.** `<port>8080</port>` no dice nada sobre si eso es un número, así que el JSON dice `"8080"`. Decidirlo por ti sería inventar información que después viaja como si hubiera estado en el archivo.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación de Buy Me a Coffee. A ninguno se le entrega un carácter de tu texto. Cada línea que lo lee, lo analiza o lo escribe se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconecta la red y la herramienta sigue igual, porque nunca hubo un paso de red en ella. Es la prueba más simple de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/parse-xml.js` para el analizador que te dice qué etiqueta no se cerró nunca, y `src/convert.js` para saber por qué todos los valores salen del XML como cadenas en lugar de adivinarse.
