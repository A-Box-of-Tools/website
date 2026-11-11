# Cómo formatear y comprobar XML

Reindenta XML sin subirlo, encuentra el origen de un error y entiende qué cambia al convertir el documento a JSON.

[Abrir Formateador de XML](https://abox.tools/es/formatear-xml/): XML ordenado para leerlo o comprimido para publicarlo, y convertido a JSON en los dos sentidos. Nada de esto se pega en el servidor de otro.

Última actualización 13 de octubre de 2026

## Pega o importa el XML

Abre el formateador y pega XML o elige un archivo de texto. Usa dos espacios, cuatro o una tabulación para indentar, o salida minimizada. Copia o descarga el resultado válido. Al escribir, la salida anterior deja de estar disponible mientras se comprueba la entrada nueva.

El analizador funciona localmente. Comprueba la sintaxis; no valida XSD ni DTD, no demuestra que una configuración funcione en tu aplicación ni visita URL mencionadas en el texto.

![Entrada XML y su conversión JSON con atributo, cadena y elementos repetidos.](https://abox.tools/screens/format-and-check-xml/mapping.webp)

El atributo pasa a @region, el puerto sigue como cadena y los elementos feature repetidos se convierten en matriz.

## Revisa una respuesta, un canal o un cambio de configuración

Una respuesta de API o canal RSS en una línea se inspecciona mejor con un elemento por línea. Importa el XML, elige dos espacios y usa Ir al error si el análisis se detiene. Comprueba el elemento exterior, atributos y entradas repetidas. Una dirección con ampersand necesita `&amp;` en texto XML normal o atributos; el ampersand solo no sirve. Valida el documento corregido con la aplicación que lo consume: esta página no comprueba las reglas del canal ni un XSD.

Para migrar configuración XML a JSON, convierte una copia y revisa los atributos `@`, arrays de elementos repetidos y valores de cadena antes de comparar con el JSON propuesto. Primero [formatea ambas copias JSON igual](https://abox.tools/es/guias/comparar-dos-archivos-json/). Úsalo para documentos de datos: la conversión pierde comentarios y orden del contenido mixto, así que no preserva prosa.

## Sigue un error de análisis

Una etiqueta sin cerrar, un cierre incorrecto o una referencia de carácter inválida detienen formato y conversión. Ir al error mueve el cursor a la posición indicada. Se necesita un elemento exterior: rechaza dos raíces o texto fuera de la raíz.

```
<settings>
  <port>8080</port>
</settings>
```

DOCTYPE se conserva literalmente. No resuelve entidades externas; nombrar un archivo o sitio en una declaración no lo carga.

## Comprende los espacios antes de indentar

Conserva valores de texto, CDATA y texto de elementos con contenido mixto. Los espacios solo entre elementos hijos se tratan como diseño salvo que aplique `xml:space="preserve"`. Esto facilita leer configuraciones, pero si la aplicación usa esos espacios como datos, comprueba el resultado antes de reutilizarlo.

## Qué cambia de XML a JSON

Elige la dirección antes de leer el resultado. Los atributos son claves con `@`, elementos repetidos son matrices y el texto junto a otro contenido usa `#text`. Los valores XML siguen como cadenas: `<port>8080</port>` no se infiere como número.

La conversión JSON pierde comentarios y el orden intercalado de texto mixto y elementos hijos. Volver no garantiza recuperar el documento original. Guarda una copia y compara los campos que usa tu aplicación.

Para formatear JSON sin ese cambio, usa el [formateador JSON](https://abox.tools/es/formatear-json/).
