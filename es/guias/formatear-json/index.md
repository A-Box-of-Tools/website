# Cómo formatear JSON sin entregárselo a nadie

Formatear JSON debería cambiar los espacios y nada más. La mayoría de las herramientas que se ofrecen a hacerlo cambian más que eso, y ninguna lo menciona. Esto es en qué fijarse, cómo leer el error cuando el archivo no se deja analizar, y por qué merece la pena pensarse la casilla en la que pegas un archivo de configuración.

[Abrir Formateador de JSON](https://abox.tools/es/formatear-json/): JSON, XML, HTML, CSS y YAML, formateados o convertidos. Nada se pega en el servidor de nadie.

Última actualización 13 de octubre de 2026

## La respuesta corta

Abre [Texto y código](https://abox.tools/es/formatear-json/), pega el JSON en la casilla, y léelo. La disposición ocurre mientras escribes, el lenguaje se deduce del texto, y la sangría son dos espacios salvo que digas otra cosa. No se sube nada, porque no hay adónde: el analizador son unos cientos de líneas de JavaScript ejecutándose en la pestaña que ya tienes abierta.

Lo siguiente conviene saberlo antes de pegar una configuración en cualquier alternativa: qué puede cambiar un formateador, qué podría cambiar una implementación descuidada y cómo leer el error cuando el archivo ni siquiera se analiza.

![Dos paneles: una sola línea de JSON a la izquierda y el mismo documento formateado con dos espacios de sangría a la derecha.](https://abox.tools/screens/format-json-without-uploading-it/panes.webp)

Una línea entra, algo legible sale. Para eso no se envió nada a ningún sitio.

## Revisa una respuesta de API o un archivo de configuración

Pega el cuerpo de la respuesta sin las cabeceras HTTP, elige JSON y sangría de dos espacios. Al revisar por primera vez, deja las claves sin ordenar para seguir la fuente. Si falla, usa *Ir al error*, corrige la coma, comilla o escape indicado y revisa antes de copiar. Analizar correctamente no valida el esquema de la API: compara claves obligatorias, tipos e identificadores largos con lo que espera la aplicación receptora.

Para un contenido compacto en una etiqueta sin conexión o campo con límite de bytes, conserva una copia legible y entrega la versión minimizada. Revisa el tamaño indicado y vuelve a leer o decodificar lo entregado. Minimizar elimina espacios de presentación; no acorta valores largos ni quita campos privados. Si compartes una respuesta formateada con soporte, elimina credenciales y datos personales de esa copia.

## Qué es formatear y qué no

JSON casi no tiene sintaxis. Un objeto, un array, una cadena, un número, y las tres palabras `true`, `false` y `null`. Entre esas piezas, los espacios no significan nada: el archivo

```
{"name":"thing","tags":["local","offline"]}
```

y el archivo

```
{
  "name": "thing",
  "tags": [
    "local",
    "offline"
  ]
}
```

son el mismo documento. Formatear es el trabajo de pasar del primero al segundo, y *ese es todo el trabajo*. Cualquier otra cosa que un formateador le haga a tu archivo — reordenar, redondear, tirar cosas — es un cambio en lo que el documento dice, hecho sin que nadie lo pidiera.

Tres de esos cambios son bastante comunes como para nombrarlos, porque son silenciosos y porque son lo que hace por defecto un formateador escrito en una tarde.

## Las tres cosas que un formateador no debe cambiar

### El orden de tus claves

Esta es la que pilla a la gente. La forma obvia de escribir un formateador de JSON en JavaScript es llamar a `JSON.parse` y luego a `JSON.stringify` con una sangría, y esa pareja no conserva el orden de las claves que parecen enteros:

```
Object.keys(JSON.parse('{"10":"a","2":"b","x":"c"}'))
// ['2', '10', 'x']
```

No es un fallo del código de nadie. Los objetos de JavaScript están especificados para poner primero las claves parecidas a enteros, en orden numérico ascendente, y todo valor que pasa por `JSON.parse` se convierte en un objeto de JavaScript. Un formateador construido así reordenará un archivo indexado por id, por número de puerto, por año o por código de estado HTTP, y lo hará sin decir palabra.

Que importe o no depende del archivo. Los objetos JSON no tienen orden en principio, así que técnicamente no se rompe nada — pero el diff contra la versión de tu repositorio será enorme, la revisión será ilegible, y si algo más abajo lee el archivo en orden, el comportamiento cambia.

### Los dígitos de tus números

JSON no dice cuán grande puede ser un número, y JavaScript sí: todo número es un doble. Así que un formateador que analiza a doble y lo vuelve a imprimir pierde todo lo que un doble no puede contener.

```
JSON.stringify(JSON.parse('{"id":123456789012345678901}'))
// {"id":123456789012345680000}

JSON.stringify(JSON.parse('{"size":1e999}'))
// {"size":null}
```

Un id de veintiún dígitos — un id de Twitter, un id Snowflake, una referencia bancaria — vuelve como un número distinto, y un valor demasiado grande para un doble vuelve como `null`. Los dos archivos siguen analizándose, y ninguno de los dos es el archivo con el que empezaste.

La salida es no analizar los números en absoluto. A un formateador solo le hace falta saber dónde empieza y dónde acaba un número para colocar el documento; nunca necesita su valor, así que lo seguro es copiar los dígitos exactamente como estaban escritos. Eso es lo que hace la herramienta de aquí.

### Tus claves repetidas

`{"a": 1, "a": 2}` es JSON válido, y el estándar se niega a decir cuál de las dos gana. En la práctica los analizadores discrepan: casi todos se quedan con la última, algunos con la primera, unos pocos rechazan el documento. Un formateador que emite una de ellas en silencio ha tomado esa decisión por ti, y ha escondido el hecho mucho más útil de que había dos — que casi siempre es un error del archivo, y uno que querrías ver.

## Cuando el archivo no se deja analizar

Casi todo el JSON que falla no es exótico. Es una de unas seis cosas, y el error te dice cuál si te dice dónde está en términos que puedas encontrar. Un desplazamiento como `posición 4193` no lo es; una línea y una columna sí.

- **Una coma de más al final.** `{"a": 1,}` es legal en JavaScript y no en JSON. La causa suelta más común, normalmente heredada de borrar la última entrada de una lista.
- **Comillas simples.** `{'a': 1}` es un literal de objeto de JavaScript, no JSON. Las cadenas y las claves llevan comillas dobles, y las claves llevan comillas siempre.
- **Una clave sin comillas.** `{a: 1}`, el mismo error desde el otro lado — normalmente de pegar algo sacado de código en vez de sacado de un archivo.
- **Comentarios.** `// así` tampoco es JSON. Es JSONC, que usan los ajustes de VS Code y `tsconfig.json`, y no se analiza en ninguna otra parte. Si un comentario tiene que sobrevivir, la convención es una clave: `"_comment": "..."`.
- **Un salto de línea o un tabulador de verdad dentro de una cadena.** Tienen que escribirse como `\n` y `\t`. Es lo que suele torcerse cuando se ha pegado a mano un comando de consola o un certificado dentro de un valor.
- **Un número que JSON no permite.** Ceros a la izquierda (`01`), un punto decimal suelto (`.5`), `NaN`, `Infinity` y `+1` son cosas que la gente escribe y ninguna de ellas es JSON.

Uno que no es un error y lo parece: un archivo que empieza con una marca de orden de bytes. Es invisible en casi todos los editores, no es espacio en blanco, y hace que el primerísimo carácter del documento sea inesperado. Si el error está en la línea 1, columna 1 de un archivo que se ve perfecto, es eso.

![La misma herramienta con un documento roto: un error que da la línea y la columna de una coma sobrante, y el panel de entrada mostrando la línea culpable.](https://abox.tools/screens/format-json-without-uploading-it/error.webp)

Cuando no se puede leer, el mensaje dice dónde. Una coma sobrante es la causa más común y la más difícil de ver a simple vista.

## Minificar, y lo poco que suele ganar

Exprimir los espacios es la misma operación al revés, y conviene ser realista sobre lo que te compra. Los espacios se repiten muchísimo, y todo servidor y todo navegador entre tú y quien lee ya comprime la respuesta con gzip o Brotli, que son muy buenos precisamente con ese tipo de repetición.

Así que el JSON minificado suele ser un treinta por ciento más pequeño como archivo y solo un pequeño porcentaje más pequeño por el cable. Donde sí se gana el sueldo es en los sitios sin compresión delante: un valor en una columna de base de datos, un campo en una línea de registro, una carga dentro de un código QR, o un documento que vas a meter en Base64 dentro de una cabecera.

Lo que cuesta es legibilidad, y si el archivo está en un repositorio te cuesta también los diffs — un archivo de una línea cambia entero cada vez que cambia cualquier cosa dentro. Minifica al salir de tu editor, no al entrar.

## Ordenar las claves, y cuándo no

Ordenar las claves de cada objeto se ofrece aquí como opción en vez de aplicarse por defecto, porque es un cambio real en el archivo y su valor depende por completo de qué vas a hacer después.

Ayuda cuando comparas dos documentos que deberían decir lo mismo — la configuración de dos entornos, una respuesta de una API antes y después de un cambio — y uno de ellos lista sus claves en otro orden. Ordenar los dos antes convierte un diff de todo en un diff de las dos líneas que realmente difieren.

Estorba cuando el orden estaba haciendo algo. Un `package.json` tiene convenciones sobre qué va primero; una configuración escrita a mano suele agrupar ajustes relacionados; y un archivo cuyas claves ordenó una herramienta y luego se confirmó produce un único commit enorme y sin sentido. Ordena una copia, no el original.

Un detalle que conviene saber: aquí se ordena por cómo se leen las claves y no por sus puntos de código, así que `item2` va antes que `item10` y no después. Ordenar por punto de código es lo que pone `item10` en medio de los que empiezan por uno, lo cual es técnicamente correcto e inútil para quien lee.

## Comparar dos archivos JSON

La forma fiable es formatear los dos igual primero. Dos documentos que dicen lo mismo pueden diferir en todas las líneas si uno estaba minificado y el otro no, y no hay diff que vea más allá de eso.

Formatea ambos archivos y pega los resultados en [Comparador de texto](https://abox.tools/es/comparar-textos/). La comparación tiene su propia página. Si las claves de objetos aparecen en distinto orden, ordénalas en ambas copias al formatear. La [guía de comparación](https://abox.tools/es/guias/comparar-dos-archivos-json/) explica el procedimiento completo y qué diferencias no elimina ordenar.

## La parte que nadie pone en la página

Buscar un formateador JSON devuelve decenas de sitios con un cuadro. Si envía la entrada a un servidor, pegar y formatear entrega lo que había en el portapapeles: una respuesta con la dirección de un cliente, una cadena de conexión o un token. Algunos trabajan localmente: inspecciona el que usas, sin deducir dónde funciona por la forma del cuadro.

No hace falta mala intención. Un servicio puede conservar entradas en registros, informes de errores o copias de seguridad aunque su responsable tenga buenas intenciones. Los datos más seguros son los que nunca salieron. Una tarea que solo manipula cadenas no tiene por qué enviarlos.

Dos comprobaciones, y sirven para cualquier sitio que haga esta afirmación, no solo para este:

1. **Abre las DevTools, mira la pestaña de red y formatea algo.** Si tu texto se está enviando, hay una petición que lo lleva. Ninguna otra cosa puede ser cierta al mismo tiempo.
2. **Desconéctate de internet y prueba otra vez.** A una herramienta que hace el trabajo en tu navegador no le afecta. Una herramienta que manda tu texto a algún sitio deja de funcionar, de inmediato y del todo.

Hay una versión más larga de las dos, con otras dos comprobaciones, en [¿es seguro subir archivos?](https://abox.tools/es/guias/es-seguro-subir-archivos/)

## ¿Y el YAML, el XML y los demás?

La misma página lee XML, HTML, CSS y YAML y convierte entre JSON y XML o YAML. La [guía de XML](https://abox.tools/es/guides/format-and-check-xml/) y la [guía de conversión YAML](https://abox.tools/es/guides/convert-yaml-and-json/) explican esos procesos. Conviene conservar dos ideas anteriores, porque el argumento es el mismo:

- **Convertir YAML a JSON pierde los comentarios**, porque JSON no tiene dónde meter uno. Las anclas y los alias — la manera que tiene YAML de decir «el mismo nodo dos veces» — tampoco se pueden expresar, y aquí se rechazan en lugar de adivinarse.
- **`no` es una cadena.** En YAML 1.1, `yes`, `no`, `on` y `off` eran booleanos, y por eso una lista de códigos de país que incluyera Noruega volvía con un `false` dentro. YAML 1.2 tiró eso y aquí también — pero esas palabras se siguen escribiendo entre comillas, porque lo que abra el archivo después puede ser un lector de 1.1.
