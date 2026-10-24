# Cómo hacer un GIF de una parte de un video

Un GIF hecho del clip entero es enorme, y casi todo lo que lleva dentro no lo quería ver nadie. El trabajo son en realidad dos decisiones: primero qué segundos, después qué ajustes. Las dos ocurren en tu propio equipo, porque ninguna de las dos herramientas sube nada.

Última actualización 13 de octubre de 2026

## La respuesta corta

Para un solo momento continuo, abre el conversor de [Video a GIF](https://abox.tools/es/convertir-video-a-gif/), suelta el video y marca la sección en su línea de tiempo: solo convierte lo que queda entre las marcas, así que no hay nada que cortar de antemano. Elige ancho y fotogramas por segundo, y exporta.

Para varios momentos, como dos goles o preparación y remate, monta primero el clip con el [Recortador de vídeo](https://abox.tools/es/cortar-video/). Puede unir partes compatibles copiando si los comienzos posteriores caen en fotogramas clave. Otras selecciones necesitan el método exacto indicado, que recodifica la imagen. Revisa esa elección antes de exportar al convertidor.

El traspaso es un clic: en cuanto el cortador exporta, una fila bajo su botón de descarga ofrece llevar el resultado directamente al conversor, y el clip llega allí ya cargado — sin guardar y volver a soltar nada por el camino.

En ambos casos el orden es el mismo: decidir primero los segundos, gastar después los ajustes. El resto de esta página explica por qué ese orden importa mucho más en un GIF que en cualquier otra cosa que haga este sitio.

## Muestra el problema y la acción que lo causó

Para un informe de errores, empieza antes del clic o gesto, no solo en el resultado incorrecto, y termina cuando haya tiempo de reconocerlo. Una captura de tres segundos a 480 píxeles y 12 fotogramas por segundo sirve para empezar; el texto pequeño puede necesitar más ancho. Desactiva tramado para colores planos de interfaz y mira el GIF exportado al tamaño del gestor de incidencias.

El mismo recorte explica un paso artesanal o interacción con un producto que se entiende mejor viendo. Conserva la mano o cursor que da contexto y usa una sola sección del convertidor si basta. Si depende de palabras habladas, usa vídeo corto: GIF no lleva sonido. Para pasos separados, monta primero y revisa todas las uniones antes de convertir.

## Por qué cada segundo de GIF sale tan caro

Un GIF no es video. Es una pila de imágenes completas, cada una sacada de una paleta de 256 colores como mucho, comprimida con un método de 1987 que no sabe nada del movimiento. Un códec moderno describe lo que *cambió* entre fotogramas; un GIF repite en gran parte lo que siguió igual.

La consecuencia práctica: un GIF de diez segundos, 480 píxeles de ancho y 12 fotogramas por segundo pesa normalmente de 5 a 10 MB, diez veces el mismo clip en MP4, con una fracción de la calidad. El conversor no tiene la culpa; el formato es así. La [guía de conversión a GIF](https://abox.tools/es/guias/convertir-un-video-en-gif/) cubre cuándo un GIF sigue mereciendo la pena y cuándo sirve mejor un video mudo en bucle.

Como el tamaño crece con cada fotograma, los megas más baratos de ahorrar son segundos enteros. Bajar el ancho a la mitad divide el tamaño más o menos entre cuatro; bajar los fotogramas a la mitad lo divide más o menos entre dos; pero recortar metraje que nunca debió estar ahí ahorra su coste completo y mejora el resultado: un GIF que empieza en la acción se lee mejor que uno que tarda dos segundos en llegar a ella.

## Cuándo basta la línea de tiempo del conversor

La línea de tiempo del conversor marca una sección: un inicio, un final, y todo lo de en medio se convierte en el GIF. Si el momento que quieres es continuo, dure lo que dure, ese es todo el trabajo, y poner el cortador delante solo le daría una segunda casa a las mismas dos marcas.

Pon las marcas un punto más apretadas que sueltas. Un bucle esconde su costura cuando el último fotograma queda cerca del primero, y cada fotograma que afeitas de los extremos se devuelve en tamaño de archivo.

![La tarjeta de sección: un fotograma de vídeo con código de tiempo, y los puntos de entrada y salida marcados a los once y a los catorce segundos en la barra de debajo.](https://abox.tools/screens/make-a-gif-from-part-of-a-video/marks.webp)

El conversor tiene sus propios puntos de entrada y salida, y para un trozo de tres segundos de un clip más largo se bastan solos.

## Cuándo cortar antes con el Cortador de video

El cortador se gana su sitio en cuanto el GIF necesita más de una pieza:

- **Varios momentos, un GIF.** Marca cada parte con `I` y `O` durante la reproducción, ordénalas si lo mejor debe ir primero y exporta un archivo. Elige Copiar solo si se permiten esos comienzos posteriores; si no, el método exacto y su recodificación.
- **Dos videos, un GIF.** El cortador admite más de un archivo y une partes marcadas de unos y otros: copia cuando los archivos coinciden en su formato, recodifica cuando no, y dice cuál de las dos cosas hizo.
- **Quieres el clip también como video.** El MP4 montado merece guardarse: es más pequeño y más nítido que cualquier GIF que salga de él, y es lo correcto para publicar donde el video se reproduzca.

Añade el clip montado al convertidor sin marcar nada: todo es la secuencia prevista. Si se rechaza por ajustes de reproducción, guarda un vídeo nuevo con ellos aplicados en un editor local. No eludas el rechazo: el material oculto no debe reaparecer en el GIF. Como no lleva audio, omítelo en el recorte intermedio para evitar ajustes de reproducción de sonido.

## Gastar los ajustes

Con los segundos decididos, tres controles fijan el tamaño, por orden de lo que cuestan:

- **Ancho.** La palanca más grande. Con 480 píxeles sobra para un chat o un foro; 320 aún se lee bien en grabaciones de pantalla sin texto. El tamaño cae con el cuadrado del ancho.
- **Fotogramas por segundo.** De 10 a 12 es donde viven casi todos los GIF; el movimiento se sigue leyendo y el archivo se queda en la mitad frente a 25. Por debajo de 8 empieza a parecer un pase de diapositivas.
- **Difuminado.** Con 256 colores, los degradados suaves hacen bandas. El difuminado ordenado cambia esas bandas por un patrón fino; suele verse mejor y comprimir algo peor. Prueba a exportar de las dos maneras: trabaja tu equipo, así que un segundo intento no cuesta nada y no sube nada.

## Si haces esto cada semana

Que los dos pasos vivan aquí en dos páginas es a propósito: cada página hace un trabajo, y cada una puede demostrar por sí sola que nada sale de tu equipo. Pero todo lo que ejecutan las dos es código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias con un README que nombra cada uno.

Así que si esta misma cadena forma parte de tu semana, no hace falta recorrerla a mano cada vez. Apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele que componga la lógica de segmentos del cortador y el codificador de GIF en una sola página hecha para tu caso. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
