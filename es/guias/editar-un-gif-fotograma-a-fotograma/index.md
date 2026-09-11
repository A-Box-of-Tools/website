# Cómo editar un GIF fotograma a fotograma

Aquí no hay editor de GIF, y no hace falta: un separador que desarma la animación en fotogramas y un creador que construye una a partir de fotogramas son un editor con una carpeta en medio, y la carpeta es la parte donde editas tú, con lo que ya uses para imágenes.

Última actualización 26 de agosto de 2026

## La respuesta corta

1. **Desármalo.** Abre el [Separador de GIF](https://abox.tools/es/separar-gif-en-fotogramas/) y suelta el GIF. Cada fotograma se vuelve su propio PNG — tal como aparece en pantalla, con la transparencia conservada — y el ZIP incluye una lista de tiempos: los retardos por fotograma apuntados para la reconstrucción.
2. **Edita la carpeta.** Borra los fotogramas que sobren, retoca en cualquier editor de imágenes los que deban cambiar, renombra para reordenar. Una carpeta de PNG es un formato que todo entiende.
3. **Vuélvelo a montar.** Suelta la carpeta en el [Creador de GIF](https://abox.tools/es/crear-gif/), pon los tiempos de cada fotograma — o apóyate en la lista — elige la paleta y exporta.

Los tres pasos corren en tu navegador. Nada se sube en ningún momento, y aquí importa más que de costumbre: los GIF que la gente arregla son tantas veces grabaciones de pantalla con algo sensible a medio ver.

## Lo que el separador puede contarte antes de editar

El separador muestra, para cada fotograma, su retardo, su posición, su tamaño y su regla de borrado — y ese panel merece un vistazo antes de tocar nada, porque explica las dos sorpresas de la mayoría de los GIF.

Primera: no todos los fotogramas son imágenes completas. Muchos GIF guardan solo los píxeles que cambiaron, parcheados sobre el fotograma anterior; el separador ofrece cada fotograma *como aparece* o *como está guardado*, y para editar casi siempre quieres *como aparece*, para que cada PNG se sostenga solo. Segunda: los retardos van por fotograma, no en un único número. La pausa sobre el remate es un retardo real sobre un fotograma real, y la lista de tiempos es lo que lo lleva a través del viaje de ida y vuelta.

Para los cortes corrientes, el paso de la carpeta es incluso opcional: quedarse con un fotograma de cada dos o de cada cinco, o marcar los que quieres, viene incorporado en el separador — y partir los fotogramas por la mitad es el adelgazamiento más eficaz que un GIF puede recibir.

![El separador mostrando doce fotogramas numerados de una animación, cada uno con el tiempo que se mantiene en pantalla.](https://abox.tools/screens/edit-a-gif-frame-by-frame/apart.webp)

Cada fotograma, numerado, con su propia demora. Esta es la mitad que te dice qué estás editando antes de editarlo.

## Lo que cuesta la reconstrucción, con honestidad

Un GIF guarda como mucho 256 colores, elegidos al construirlo. La reconstrucción cuantiza los fotogramas otra vez — una paleta compartida o los mejores colores por fotograma — y en material fotográfico esa segunda cuantización puede notarse. En grabaciones de pantalla y dibujos, la carga habitual, no se nota: nunca usaron 256 colores.

Las otras palancas del creador son las de la [guía del presupuesto GIF](https://abox.tools/es/guias/gif-de-una-parte-de-un-video/): menos colores, el difuminado de Floyd-Steinberg para los degradados, y el comportamiento del bucle: para siempre, una vez o un número.

Para ver si la cirugía funcionó — y dónde viven de verdad los bytes — suelta el resultado en el [Analizador de GIF](https://abox.tools/es/analizar-gif/): dibuja fotogramas contra bytes, y el fotograma pesado suele ser un repintado completo que alguien podría haber recortado.

El creador ofrece el viaje él mismo: tras la exportación, una fila bajo su botón de descarga lleva el GIF recién hecho directamente al analizador, ya cargado.

![El creador de GIF con seis fotogramas en orden, cada uno con un campo de demora, y una fila para fijar todas las demoras a la vez.](https://abox.tools/screens/edit-a-gif-frame-by-frame/together.webp)

Y de vuelta. Las demoras hay que volver a ponerlas a mano, que es la parte del viaje de ida y vuelta que conviene saber de antemano.

## Si haces esto cada semana

Partir, carpeta, reconstruir: los pasos viven en páginas separadas porque cada una hace un trabajo, y cada una puede demostrar por sí sola que nada sale de tu equipo. Pero todo es código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias cuyos README explican el decodificador, las reglas de borrado y el cuantizador.

Si la cirugía de GIF es una tarea recurrente, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele que pliegue la tabla de fotogramas del separador y el codificador del creador en una página donde borrar un fotograma sea un clic. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
