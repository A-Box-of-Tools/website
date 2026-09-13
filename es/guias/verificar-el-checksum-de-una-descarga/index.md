# Cómo comprobar una descarga contra su checksum

La línea de hexadecimal que hay bajo un enlace de descarga está ahí para que puedas demostrar que el archivo llegó intacto. Compararla lleva un minuto. Saber cuánto vale esa comparación, y qué costumbre la deja sin valor, lleva el resto de esta página.

[Abrir Hash y suma de verificación](https://abox.tools/es/calcular-checksum/): Comprueba una descarga contra el número que publicó quien la distribuye, sin enviársela a nadie.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre [Hash y suma de verificación](https://abox.tools/es/calcular-checksum/), arrastra encima el archivo que descargaste y pega en el cuadro de abajo el checksum de la página de descarga. La página deduce de la longitud qué algoritmo es ese número y responde con una frase.

Si coincide, los bytes que tienes en el disco son los que midió quien lo publica. Si no coincide, vuelve a descargar el archivo antes de abrirlo. Todo lo demás es lo que esa frase deja fuera.

## Qué es el número que hay bajo el enlace de descarga

La salida de una función hash: un cálculo que lee todos los bytes de un archivo y produce una respuesta corta y de longitud fija. El mismo archivo da siempre la misma respuesta, y un archivo que se diferencie en un solo bit da una completamente distinta. No una casi igual: una sin relación alguna. Toda la idea se apoya en esa propiedad.

Como la respuesta es corta y el archivo no, el cálculo tira información, y por fuerza hay muchos archivos que comparten cualquier respuesta dada. Encontrar uno a propósito es la parte difícil, y lo difícil que sea es lo que separa entre sí a los algoritmos de más abajo.

Un checksum no tiene nada de secreto y no se puede invertir. Es una huella, publicada para que dos personas puedan ponerse de acuerdo en que tienen lo mismo entre manos.

## Qué algoritmo tienes delante

No tienes que elegir: ya eligió quien lo publica, y tu trabajo es calcular el mismo. Se distingue solo por la longitud:

- **32 caracteres hexadecimales** — MD5.
- **40** — SHA-1.
- **64** — SHA-256, que es el que más verás.
- **96** — SHA-384.
- **128** — SHA-512.

No hay dos con la misma longitud, y por eso la herramienta puede identificar un valor pegado sin que se lo digan. Una cadena de 63 caracteres no es el checksum de nada: es un SHA-256 que perdió un carácter camino del portapapeles.

![La tarjeta de resultados: las sumas MD5, SHA-1, SHA-256 y SHA-512 de un archivo, cada una con un botón de copiar.](https://abox.tools/screens/verify-a-file-checksum/digests.webp)

Todas a la vez, porque cuál usar lo decide quien publicó el archivo y no tú.

## En tu propio dispositivo, sin navegador

Todos los sistemas operativos traen algo que hace esto, y vale la pena conocer el comando aunque uses una página para ello. A la pregunta "¿cómo sé que tu sitio lo calculó con honestidad?" no hay mejor respuesta que pasar el mismo archivo por la herramienta que vino con tu equipo.

**Windows**, en PowerShell:

```
Get-FileHash .\disk.iso -Algorithm SHA256
```

Las máquinas más antiguas tienen en su lugar `certutil -hashfile disk.iso SHA256`, que imprime en mayúsculas y con espacios. En una comparación de checksums las mayúsculas nunca importan: esas letras son dígitos, no palabras.

**macOS**:

```
shasum -a 256 disk.iso
```

**Linux**:

```
sha256sum disk.iso
```

Los tres imprimen la misma cadena para el mismo archivo, y este sitio también. Son especificaciones exactas con vectores de prueba publicados; no hay margen para que una implementación tenga opinión propia.

## Compararlos sin quedarte bizco

No leas sesenta y cuatro caracteres en dos pantallas y decidas que se parecen. La gente mira los cuatro primeros y los cuatro últimos y para ahí, que es exactamente la comparación que un atacante se encargaría de superar, y también la forma en que se cuela un error de buena fe.

Pega los dos en algo que compare por ti. En la línea de comandos, para eso está la opción `-c`:

```
sha256sum -c SHA256SUMS
```

En el navegador es el cuadro de comparación de [Hash y suma de verificación](https://abox.tools/es/calcular-checksum/), que acepta el valor en la forma en que lo haya escrito quien lo publica: hexadecimal a secas, una línea de `sha256sum`, un archivo `SHA256SUMS` entero, la forma `SHA256 (disk.iso) = …` o un `integrity="sha384-…"` sacado de una etiqueta de script. Y responde que sí o que no con una frase.

![La tarjeta de comparación: una suma de verificación pegada en una caja y un veredicto que dice que coincide con el archivo.](https://abox.tools/screens/verify-a-file-checksum/compare.webp)

Pega lo que decía la página de descarga y deja que compare la herramienta. Leer sesenta y cuatro caracteres en una pantalla es el paso que esto viene a quitar.

## Qué demuestra exactamente que coincida

Que los bytes que tienes en el disco son los que alguien tenía delante cuando anotó ese número. Es algo realmente útil de saber y es más estrecho de lo que la mayoría supone, así que vale la pena enumerar qué cubre y qué no.

**Que coincida descarta:**

- una descarga que se cortó antes de tiempo y te dejó un archivo con aspecto de estar completo;
- una corrupción en tránsito, en un disco que falla o por un cable USB malo;
- el archivo equivocado: la compilación para ARM en lugar de la de x86, o la versión del mes pasado;
- un espejo que sirve otra cosa distinta de la que anuncia.

**Que coincida no descarta:**

- **que el archivo sea malicioso.** Quien lo publica puede medir software malicioso con la misma exactitud que cualquier otra cosa. Un checksum dice "esto es lo que enviaron", nunca "esto es seguro";
- **que hayan comprometido a quien lo publica.** Si alguien sustituyó el archivo en el servidor, sustituyó el checksum de debajo en el mismo minuto. Que es de lo que va la sección siguiente.

## El error que deja toda la operación en nada

Tomar el checksum de la misma página, por la misma conexión, que el archivo.

Piensa contra qué te estás defendiendo. Si lo que temes es una descarga corrupta, el checksum puede venir de donde sea y la comprobación funciona. Si lo que temes es que alguien haya manipulado el archivo, entonces quien pudo cambiar el archivo pudo cambiar la línea hexadecimal impresa debajo, porque ambos vinieron del mismo servidor por la misma conexión. Le estarías pidiendo al falsificador que confirme la firma.

Un checksum vale más cuando te llega por una vía que el archivo no tomó:

- un archivo `SHA256SUMS` con una firma GPG separada, comprobada contra una clave que ya tenías. Es lo que publican las distribuciones y es la respuesta de verdad;
- el anuncio de la versión en una lista de correo, o una etiqueta en un repositorio de código, en lugar de la página de descarga;
- un segundo espejo en otro dominio, y los dos comparados entre sí;
- un gestor de paquetes, que hace esto por ti contra claves que vienen con el sistema operativo.

Nada de esto vuelve inútil comprobar un checksum publicado en la misma página. Atrapa la descarga rota, que es el fallo que de verdad le pasa a la gente. Solo que no te digas que atrapó algo más.

## MD5 y SHA-1 están rotos. Úsalos igual, a veces

Los dos están rotos en el sentido más fuerte que importa aquí: se pueden construir *colisiones* a propósito. Dos archivos distintos con el mismo MD5 se pueden fabricar en hardware corriente desde 2004, y en 2017 un equipo produjo dos PDF distintos con el mismo SHA-1. En 2020 la versión de ese ataque con prefijo elegido bajó a unas pocas decenas de miles de dólares de cómputo alquilado.

En la práctica eso significa que un MD5 que coincide ya no te dice que nadie tocó el archivo, porque quien quisiera podría haber construido otro archivo con el mismo número. Te sigue diciendo que la descarga no se cortó ni se corrompió, porque un accidente al azar no va a caer en una colisión: eso tiene una probabilidad que ningún accidente ha tenido nunca.

Así que si quien lo publica imprimió un MD5 y nada más, compruébalo: vale más que no comprobar nada. Y si el que publica eres tú, imprime un SHA-256.

## No coincide. ¿Y ahora qué?

1. **Vuelve a descargarlo**, del mismo sitio. Una transferencia interrumpida o reanudada es con diferencia la causa más frecuente, y una segunda copia suele resolverlo.
2. **Comprueba que estás en la línea correcta.** Las páginas de versiones listan varios archivos: el checksum del instalador no coincidirá nunca con el del comprimido, ni el de ARM con el de x86.
3. **Comprueba la versión.** Una página de checksums guardada en favoritos queda obsoleta el día que sale una revisión.
4. **Prueba otro espejo** y compara entre sí los checksums de los dos archivos. Que dos espejos coincidan entre ellos y discrepen del número publicado es un problema distinto de que un espejo discrepe de los dos.
5. **Mientras tanto, no lo abras.** Un archivo que falla su checksum está en el mejor caso dañado y en el peor no es el archivo que pediste.

## Por qué hacerlo en un navegador

Porque la línea de comandos no es donde está la mayoría de la gente, y porque la alternativa evidente, un sitio web que te pide subir el archivo, es algo extraño de hacer con un instalador del que ya dudas. Enviar un archivo a alguna parte para averiguar si lo manipularon en tránsito añade un sitio más donde pueden manipularlo.

[Hash y suma de verificación](https://abox.tools/es/calcular-checksum/) lee el archivo en trozos de cuatro megabytes en tu propio dispositivo, así que no hay subida, ni límite de tamaño, ni nada en lo que confiar más allá de la propia página, que puedes leer y que sigue funcionando con la red desenchufada. Si prefieres fiarte de tu sistema operativo, ejecuta el comando de la sección de arriba y compara las dos respuestas. Coincidirán.
