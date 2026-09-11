# Comparador de textos — compara dos textos, lado a lado

Dos textos dentro, cada diferencia marcada, línea a línea y palabra a palabra. Nada se pega en el servidor de nadie.

> Compara dos textos y mira cada diferencia, línea a línea y palabra a palabra, lado a lado o en una columna. La comparación corre en tu navegador y no se sube nada: el código sin publicar nunca sale de tu equipo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/comparar-textos/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus textos **nunca se suben**. No hay ningún servidor.

Una comparación es aritmética sobre dos cadenas de texto, hecha aquí, en esta página. El algoritmo es el de Myers — el mismo que usa `git diff` —, escrito a mano en `src/diff.js`, donde puedes leerlo. Esta herramienta no tiene ninguna función de red, nada que pedir y nada que enviar, y eso aquí cuenta: lo que la gente compara son contratos, archivos de configuración y código sin publicar, siempre por pares.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo comparar dos textos sin subirlos

1. **Pega los dos textos, o suelta los dos archivos.** El original a la izquierda, la versión cambiada a la derecha. Dos archivos soltados a la vez sobre el selector caen uno a cada lado, en el orden en que los soltaste; cambia los lados si fue al revés.
2. **Elige cómo leerlo.** Lado a lado, o en una columna. Un teléfono empieza en una columna, porque lado a lado hacen falta dos columnas de texto y en un teléfono cabe más o menos una; el menú está ahí mismo de todas formas.
3. **Ignora lo que no importa.** Espacios, mayúsculas y minúsculas, líneas vacías — cada uno se puede ignorar, para que un archivo reformateado no se lea como cien cambios. Por defecto, la parte del medio sin cambios se pliega a un recuento, con tres líneas guardadas a cada lado de cada cambio.
4. **Lee qué cambió.** Las líneas quitadas van marcadas a la izquierda, las añadidas a la derecha, y dentro de una línea cambiada quedan resaltadas las palabras que difieren — así un diff de dos párrafos enseña la palabra que se movió y no dos párrafos enteros.
5. **Llévate el parche.** La descarga es un `.patch` en formato unificado, que es lo que esperan una revisión de código, `git apply` y cualquier visor de diferencias. Copiar pone lo mismo en tu portapapeles.

## La versión larga

[Cómo comparar dos archivos JSON](https://abox.tools/es/guias/comparar-dos-archivos-json/): Formatea los dos archivos igual, ordena las claves y compáralos después. Por qué un diff de JSON en crudo es casi todo ruido, cómo canonizar los dos lados en el navegador, y qué sobrevive hasta el parche.

## También en la caja

- [Codificador y decodificador Base64](https://abox.tools/es/codificar-base64/): Base64, codificación porcentual, entidades HTML, hexadecimal y escapes con barra invertida, en los dos sentidos. Nada se pega en el servidor de nadie.
- [Compartir texto y archivos](https://abox.tools/es/compartir-texto/): Lo compartido vive en esta pestaña abierta. Los lectores lo reciben cifrado, directamente desde tu navegador, y al cerrar la pestaña se acaba: ningún servidor guarda nada.
- [Generador de QR y códigos de barras](https://abox.tools/es/generar-codigo-qr/): Escríbelo y se convierte en un código. Para hacerlo no se envía nada.
- [Lector de códigos QR y de barras](https://abox.tools/es/escanear-codigo-qr/): Apúntale con la cámara o suelta una imagen. Se lee aquí, y en ningún otro sitio.

## Preguntas

### ¿Se suben mis textos a alguna parte?

No. La comparación es una función que corre en tu propio navegador, en tu propio equipo. Esta herramienta no tiene ninguna función de red: nunca pide nada y nunca envía nada, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Esa es la razón para usarla con un contrato, un archivo de configuración o código sin publicar: pegar esas cosas en el comparador de otra persona es entregar las dos versiones a la vez.

### ¿Qué hace exactamente la comparación?

Encuentra el conjunto más corto de cambios que convierte el texto de la izquierda en el de la derecha, con el algoritmo de Myers, el que usa `git diff`. Que sea el más corto es lo que hace legible una comparación: una línea insertada en medio debería aparecer como una inserción y no como si todas las líneas siguientes hubieran cambiado. Dentro de una línea modificada también se marcan las palabras que difieren, así que comparar dos párrafos enseña la palabra que se movió y no dos párrafos enteros.

### ¿Puede comparar dos archivos en vez de dos pegados?

Sí. Suelta los dos a la vez sobre el selector y caen uno a cada lado, en el orden en que los soltaste. Los lee tu navegador y los mete en esta página, que es el único sitio al que van. Cambia los lados si los soltaste al revés.

### ¿Qué sale de una comparación, y puedo aplicarlo?

La descarga es un diff unificado: el formato `@@ -3,5 +3,5 @@` que leen `git apply`, `patch` y cualquier herramienta de revisión de código. Copiar hace lo mismo pero al portapapeles. Lo que hay en pantalla es una vista de eso: en paralelo, o en una columna, con las partes sin cambios plegadas a un número salvo que pidas verlas todas.

### ¿Puede ignorar espacios, mayúsculas o líneas vacías?

Sí, cada uno por separado. Ignorar los espacios hace que un archivo reformateado se compare como sin cambios; ignorar mayúsculas y minúsculas trata `Error` y `error` como la misma palabra; ignorar las líneas vacías salta las líneas que no llevan nada. Los contadores sobre el resultado dicen entonces que los dos son iguales una vez ignoradas las diferencias que pediste ignorar — que no es la misma afirmación que idénticos, y la página mantiene las dos afirmaciones separadas.

### ¿De qué tamaño puede ser la comparación?

Aquí no hay ningún límite puesto, porque no hay ningún servidor pagándolo. Dos textos de veinte mil líneas con un puñado de cambios se comparan al instante, porque el principio y el final comunes se recortan antes de que empiece el trabajo de verdad. La comparación de dos textos que no tienen absolutamente nada en común se detiene pronto y lo dice, en vez de pasarse un minuto demostrando lo que ya era obvio; y una comparación muy larga dibuja las primeras miles de filas y deja el resto para el parche descargado.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni límite de cuánto pegas. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu texto.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus textos fuera a comparar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Lo que pegas no tiene por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudiera recogerse un token pegado, ni nada en el código que lo enviara si lo hubiera.
- **Aquí nada pide nada.** En `src/` no hay ningún `fetch`, ningún `XMLHttpRequest` y ningún `sendBeacon`. La comparación es una función de esta página que recibe dos cadenas y devuelve qué cambió.
- **El algoritmo es el de siempre, legible entero.** El algoritmo del guion de edición más corto de Myers, el mismo que usa `git diff`, escrito a mano en `src/diff.js` con las decisiones comentadas. Las pruebas de `tests/js/text-diff.test.js` demuestran que los borrados reconstruyen el texto de la izquierda y las inserciones el de la derecha, que es lo que significa correcto para un diff.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega un carácter de tu texto. Cada línea que lo lee, lo analiza o lo escribe se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy y `src/diff.js` para el algoritmo de Myers, la pasada palabra a palabra dentro de cada línea cambiada y las tres salvaguardas que impiden que una comparación patológica congele la página.
