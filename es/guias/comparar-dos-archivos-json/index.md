# Cómo comparar dos archivos JSON

Compara dos archivos JSON tal como vienen y casi todo lo que se enciende no es nada: sangría, saltos de línea, claves en otro orden. El arreglo no es un diff más listo — es pasar antes los dos archivos por el mismo formateador, para que solo queden las diferencias reales. Los dos pasos corren en tu navegador, que es donde deben estar los archivos de configuración con secretos dentro.

[Abrir Comparador de textos](https://abox.tools/es/comparar-textos/): Dos textos dentro, cada diferencia marcada, línea a línea y palabra a palabra. Nada se pega en el servidor de nadie.

Última actualización 13 de octubre de 2026

## La respuesta corta

1. Abre el [Formateador de JSON](https://abox.tools/es/formatear-json/), pega el primer archivo, pon la sangría en dos espacios y marca *Ordenar las claves de cada objeto*. Copia el resultado.
2. Abre el [Comparador de textos](https://abox.tools/es/comparar-textos/) y pégalo en la caja izquierda.
3. Haz lo mismo con el segundo archivo, en la caja derecha.

El resultado es mucho más legible: un valor cambiado, una clave nueva, una entrada eliminada. Desaparecen las diferencias de formato y claves reordenadas que ocultarían una comparación normal, porque ambos lados se escribieron de la misma forma antes de compararlos.

Ninguna de las dos páginas tiene función de red alguna, y conviene saberlo: el JSON que la gente compara es tantas veces un archivo de configuración con las credenciales todavía dentro.

## Cambios de configuración y regresiones de API

Para comparar pruebas con producción, conserva los originales y formatea una copia de cada uno con dos espacios y claves ordenadas. Pon pruebas a la izquierda y producción a la derecha, desactiva Ignorar mayúsculas y minúsculas e Ignorar espacios y revisa direcciones de servicio, indicadores de funciones y límites. Los espacios dentro de una cadena y las mayúsculas de una clave pueden importar. Confirma qué entorno está a cada lado antes de descargar el parche.

La misma receta revisa una respuesta de API antes y después de un cambio. Usa las mismas entradas de solicitud y considera aparte las fechas y los identificadores generados. Los arrays conservan su orden: una lista reordenada sigue mostrando diferencias, como corresponde a una secuencia JSON ordenada. También pueden diferir números equivalentes como `1` y `1.0` o cadenas con escapes distintos. Se compara texto formateado; no se valida un esquema ni la equivalencia de todos los valores JSON. [El estándar JSON](https://www.rfc-editor.org/rfc/rfc8259.html#section-1) distingue objetos sin orden de arrays ordenados.

## Por qué un diff de JSON en crudo es casi todo ruido

A JSON el espacio en blanco le da igual, y al orden de las claves no le da significado. El mismo documento puede ser una línea o cuatrocientas, con las claves en el orden en que se teclearon o en el que las soltó alguna biblioteca, y las herramientas reescriben ambas cosas sin preguntar. Un lado minificado y el otro desplegado; uno guardado a mano y el otro por un serializador que ordena alfabéticamente: un diff de líneas ve dos archivos sin parentesco.

Los dos peores casos bastan para verlo. Un archivo **minificado** es una línea, así que un diff contra él es una única línea cambiada y gigantesca: verdadero e inútil. Y dos archivos con **el mismo contenido en otro orden** se comparan como todo-cambió, cuando la respuesta honesta sería «nada».

![Las opciones de comparación: vista en paralelo o en línea, un interruptor para mostrar solo las líneas cambiadas e interruptores para ignorar espacios, mayúsculas y líneas en blanco.](https://abox.tools/screens/compare-two-json-files/options.webp)

Usa con cuidado las opciones para ignorar: afectan a la vista, pero el parche descargado conserva todas las diferencias de entrada, incluidos los finales de línea.

## Qué arregla la forma canónica del formateador

Pasar los dos archivos por el mismo formateador con los mismos ajustes es justo lo que un diff necesita: una escritura por documento.

- **La misma sangría** pone cada clave en su propia línea: el diff trabaja entonces línea a línea, y sus marcas de palabras pueden señalar el único valor que cambió dentro de una.
- **Las claves ordenadas** ponen los dos lados en el mismo orden, y el orden deja de contar como diferencia. Se ordena por cómo se leen las claves, no por puntos de código — `item2` antes que `item10` — y se aplica idéntico a ambos lados.
- **Nada más se mueve.** Este formateador conserva los números con los dígitos que escribiste y conserva las claves duplicadas en vez de resolverlas: canonizar no puede inventar por sí mismo una diferencia. La [guía del formateador](https://abox.tools/es/guias/formatear-json/) explica por qué eso es más raro de lo que debería.

Una salvedad honesta: la salida ordenada es el documento con las claves movidas. Si alguna herramienta posterior atiende al orden de las claves — pocas lo hacen, pero existen — trata las copias ordenadas como lo que se compara, no como sustituto de los originales.

## Leer el resultado, y llevárselo

El comparador marca a la izquierda las líneas quitadas, a la derecha las añadidas, y resalta dentro de una línea cambiada las palabras que difieren: sobre una forma canónica, eso suele ser el único valor que pasó de `false` a `true`. El medio sin cambios se pliega a un recuento, así que una configuración de dos mil líneas con tres retoques se lee como tres pasajes cortos.

La descarga es un parche unificado, un `.patch`: el formato que entiende la revisión de código. Describe las formas canónicas, que suele ser lo que una revisión quiere de todos modos: el cambio, sin el reformateo.

Formatear antes de comparar también facilita revisar YAML o XML, pero sus reglas de espacios y conversión difieren de JSON. Conserva el lenguaje original si solo necesitas cambiar la presentación. Las opciones de ignorar afectan a la vista; el parche compara las cadenas de entrada reales. Aquí son las copias formateadas, por lo que el parche no se aplica a los originales intactos.

![Dos versiones de una configuración JSON una al lado de la otra, con las líneas cambiadas marcadas: un número de versión, un número de reintentos, una opción añadida y una región añadida.](https://abox.tools/screens/compare-two-json-files/diff.webp)

Cuatro diferencias reales y nada más. Leerlas es la mitad fácil; el trabajo lo hicieron los ajustes de arriba.

## Si haces esto cada semana

Formatear dos veces, pegar dos veces: los pasos viven en dos páginas porque cada página hace un trabajo, y cada una puede demostrar por sí sola que nada de lo que pegaste fue a ninguna parte. Pero las dos son código abierto: licencia MIT, módulos ES sin dependencias — el analizador del formateador conserva orden de claves y dígitos, el diff es el algoritmo de Myers — cada uno con un README que lo explica.

Si esto es parte de tu día, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele una página de dos cajas que canonice mientras compara: `parseJson`, `printJson` y `compareText` están a tres imports. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
