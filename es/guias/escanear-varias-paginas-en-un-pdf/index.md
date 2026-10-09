# Cómo escanear varias páginas en un PDF pequeño

El recado rara vez es una página. Es un contrato con su hoja de firmas, o un año de recibos, y al final un buzón que rechaza lo que pase de unos pocos megas. Tres herramientas cubren el camino entero, y el papeleo se queda en tu propio equipo durante todo él.

Última actualización 26 de agosto de 2026

## La respuesta corta

Fotografía cada página y suelta después todas las fotos de una vez en el [Escáner de documentos](https://abox.tools/es/escanear-documentos/). Encuentra las esquinas de cada página, endereza cada foto y escribe *un PDF con una página por foto*: no hay paso aparte de combinar, y las páginas quedan en el orden en que las añadiste.

Dos herramientas siguen donde el escáner se detiene. Si parte del documento ya *es* un PDF — el contrato que te mandaron por correo, alrededor de tu hoja de firmas escaneada — entrelázalos con el [Combinador de PDF](https://abox.tools/es/unir-pdf/). Y si el archivo final sigue pesando más de lo que el buzón admite, el [Compresor de PDF](https://abox.tools/es/comprimir-pdf/) lo deja bajo el límite.

Los dos relevos están a un clic: cuando el escáner ha escrito su PDF, una fila bajo el botón de descarga ofrece llevar el resultado directamente al combinador o al compresor, ya cargado — y el combinador pasa su propio resultado al compresor de la misma manera.

Nada en la cadena sube nada. Eso importa aquí más que en casi ningún otro sitio: lo que se escanea son contratos, documentos de identidad y papeles médicos, y las aplicaciones habituales para esto pasan cada página por sus servidores.

## Hacer bien las fotos

El escáner recupera muchísimo — tomas en ángulo, luz desigual, una sombra cruzando la página — pero no puede recuperar lo que la cámara nunca captó. Tres costumbres cubren casi todo:

- **Llena el encuadre**, con un margen de mesa visible alrededor de cada borde. Las esquinas se encuentran buscando la página contra el fondo; una página que se sale de la foto no tiene esquina que encontrar.
- **Dispara desde arriba**, más o menos en perpendicular. La perspectiva se corrige, pero el borde lejano de una toma rasante tiene menos píxeles, y la corrección no puede inventarlos.
- **Una página por foto**, en orden de lectura. Reordenar después funciona, pero el orden en que disparas es el orden que obtienes, y disparar en orden es gratis.

La [guía de escaneo](https://abox.tools/es/guias/escanear-un-documento-con-el-telefono/) cubre el resto: cómo se encuentran las esquinas, cuándo arrastrarlas tú mismo y qué hace el modo blanco y negro con el tamaño del archivo.

![El escáner con tres páginas fotografiadas en una tira, la primera abierta y con las esquinas marcadas.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/pages.webp)

Tres páginas, fotografiadas y enderezadas juntas. Cada una conserva sus esquinas, así que una foto mala no estropea el conjunto.

## Cuándo se gana su sitio el combinador

El escáner combina *fotos*. El combinador combina *PDF*, y el centro de un recado real suele ser ambas cosas: una hoja firmada fotografiada ahora mismo, dentro de un documento que llegó como archivo. Escanea primero tus páginas, suelta después el escaneo y el PDF original juntos en el combinador, arrastra las páginas a su sitio y exporta un solo documento. Los marcadores y los enlaces internos del original se reconstruyen sobre las páginas que quedan, y los campos de formulario rellenos vienen con ellas.

Lo mismo vale para escaneos de días distintos: el PDF de cada sesión cae como un bloque de páginas, y el combinador es donde los bloques se vuelven un archivo.

![El creador de PDF con las tres páginas limpias en la lista, encima de los ajustes de tamaño de página, orientación y margen.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/document.webp)

Y después esas mismas tres páginas como un solo documento, que es el paso en el que el unificador se gana su sitio.

## Quedar bajo el límite de tamaño

Prueba primero la palanca barata, y está dentro del escáner: para páginas que son tinta sobre papel — texto, formularios, recibos — el modo blanco y negro guarda cada página a un bit por píxel, y el PDF suele quedar muy por debajo del mega por página sin comprimir nada. El color solo vale su coste donde el color significa algo.

Cuando el archivo sigue sin querer salir — páginas en color, o una combinación que trajo el escaneo de otra persona — el compresor empieza enseñando dónde vive de verdad el tamaño, y recodifica después las imágenes de página contra la resolución a la que se muestran. También comprueba que el resultado se abre antes de ofrecerlo, que se agradece cuando el archivo es un contrato con plazo.

## Si haces esto cada semana

Que los pasos vivan aquí en tres páginas es a propósito: cada página hace un trabajo, y cada una demuestra por sí sola que el papeleo nunca salió de tu equipo. Pero todo es código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias con README que explican el buscador de esquinas, la copia de páginas del combinador y el presupuesto del compresor.

Si el mismo recado aterriza en tu mesa cada semana, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele que componga esos módulos en una página hecha para él: escanear directo a un documento combinado y comprimido, con tu portada ya en su sitio. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
