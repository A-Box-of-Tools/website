# Apilador de imágenes — combina una ráfaga, con RAW incluido

Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.

> Combina una ráfaga de fotografías en una sola: promédialas para matar el ruido, toma la mediana para quitar a la gente de una escena, aclara para dejar estelas de estrellas o apila el enfoque de una macro. Lee CR2, NEF, ARW, DNG, RAF y CR3 sacando la propia vista previa de la cámara. Funciona entero en el navegador.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/apilar-imagenes/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus fotografías **nunca se suben**. No hay ningún servidor.

El navegador abre, decodifica, alinea, combina y escribe cada toma en tu propio equipo. Una pila de veinte archivos RAW de 60 MB es alrededor de un gigabyte de fotografías, y no se mueve ni un byte: la herramienta no tiene ninguna función de red, y los archivos los lee directamente de tu disco un worker que no tiene adónde mandar nada.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Lee RAW
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo apilar un conjunto de fotografías en el navegador

1. **Elige las tomas.** Una ráfaga, una secuencia de intervalómetro o una carpeta de RAW con vistas previas JPEG utilizables. Espera a que terminen de abrirse los archivos. Cada fila muestra lo encontrado: en un RAW, la cámara y el tamaño real de la vista previa integrada. Los archivos que no se pudieron abrir aparecen en una lista para comprobar cuáles se dejaron fuera.
2. **Elige el método que corresponda a lo que quieres perder.** Ruido: media, o recorte sigma para rechazar valores distintos del resto. Personas, coches o un avión: mediana, siempre que ocupen cada parte de la escena en menos de la mitad de las tomas. Estelas de estrellas: aclarar. Una macro tomada a lo largo del anillo de enfoque: apilado de enfoque. La nota bajo el menú explica el método y sus límites.
3. **Decide si hay que alinear las tomas.** Empieza con Auto: mide desplazamiento, rotación y escala y luego corrige la perspectiva si coinciden regiones fiables de toda la imagen. Es útil para estrellas en un campo amplio. Solo desplazamiento requiere menos mediciones para una ráfaga estable. Elige No si las tomas ya coinciden o para estelas de estrellas que deban conservar el movimiento del cielo. Un trípode fijo no mantiene las estrellas alineadas. Cada toma se mide contra la marcada como referencia, que es la primera hasta que elijas otra. “Usar como referencia” cambia la marca sin cambiar el orden de la lista.
4. **Lee las cuatro cifras y después pulsa el botón.** Antes de empezar, la página muestra el tamaño previsto del resultado, la memoria estimada del apilado, las decodificaciones previstas para apilar y los bytes leídos durante la inspección. El funcionamiento interno del navegador y la liberación de memoria pueden consumir más que los búferes modelados; estas cifras son un plan y no garantizan el uso total. Si hacen falta bandas, se sugiere una resolución de trabajo menor. Al terminar, compara la referencia con el resultado a tamaño real de píxel y revisa los detalles de alineación antes de descargar.

## La versión larga

[Cómo apilar fotografías para reducir el ruido, o quitar gente](https://abox.tools/es/guias/apilar-fotos-para-reducir-el-ruido/): Apilar combina una ráfaga de tomas en una sola imagen. Qué método te hace falta depende de qué quieras perder: el ruido, los transeúntes o la poca profundidad de campo de una macro. Cómo funciona cada uno, qué cuesta y dónde encajan los archivos RAW.

## También en la caja

- [Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.
- [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/): Mira lo que una foto cuenta de ti. Y luego quítaselo.
- [Visor DICOM](https://abox.tools/es/visor-dicom/): TC, resonancia, radiografía y ecografía, con la ventana, la cabecera y las medidas.
- [Imagen a ICO](https://abox.tools/es/crear-favicon/): Entra una imagen. Salen todos los tamaños que piden un navegador, Windows o un Mac.

## Preguntas

### ¿Se suben mis fotografías a alguna parte?

No. Cada toma la abre, decodifica, alinea, apila y escribe tu propio navegador en tu propio equipo. Esta herramienta no tiene ninguna función de red, nunca pide ni envía nada, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Carga la página una vez, desconéctate de internet y sigue funcionando. Aquí eso importa más que en la mayoría de las herramientas simplemente por el volumen: una pila de veinte tomas RAW es alrededor de un gigabyte, y subir un gigabyte de fotografías para que alguien les saque la media es justamente lo que esta herramienta existe para evitar.

### ¿Qué formatos RAW puede leer, y cómo?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL y formatos relacionados son compatibles si contienen una vista previa JPEG utilizable. La herramienta recorre los directorios y usa la mayor que encuentra; puede ser menor que la imagen del sensor o no existir. **No decodifica los datos del sensor.** Los píxeles conservan el balance de blancos y el estilo de imagen de la cámara, con ocho bits por canal. Comprueba las dimensiones de la fila. La lectura de inspección cuenta cabeceras y directorios; la decodificación también lee el fragmento JPEG.

### ¿Y por qué no decodificar bien los datos del sensor?

Decodificar el sensor requeriría un motor RAW como LibRaw o dcraw, con los sistemas de compresión de cada cámara. Usar un JPEG integrado mantiene pequeña la herramienta y permite usar el decodificador del navegador. También implica aceptar el revelado de la cámara y la resolución de la vista previa que incluya el archivo. Para elegir los ajustes de revelado RAW, revela primero las tomas y exporta JPEG o PNG para apilarlas aquí.

### ¿Cuántas tomas admite, y de qué tamaño?

Seis de los siete métodos usan acumuladores cuyo tamaño no crece con el número de tomas. Media, aclarar, oscurecer, sumar y apilado de enfoque necesitan una pasada por banda; recorte sigma necesita dos. Mediana conserva los valores de cada toma para la banda actual, por lo que su memoria sí crece con la cantidad de tomas. Cualquier método puede dividirse en bandas si sus búferes superan el presupuesto de la herramienta, lo que obliga a decodificar de nuevo las tomas para cada banda. La página estima esos búferes y muestra las decodificaciones previstas del apilado. Inspeccionar y alinear añade trabajo, y los procesos internos de códecs y GPU del navegador pueden necesitar más memoria de la estimada.

### ¿Qué hace exactamente alinear las tomas?

La herramienta mide cuánto se desplazó cada toma respecto a la referencia y la recoloca con precisión inferior a un píxel. Usa correlación de fase: el desplazamiento aparece como una diferencia de fase entre los espectros, así que una transformada de Fourier por imagen encuentra un desplazamiento de doscientos píxeles tan fácilmente como uno de dos. Rotación y escala se recuperan con el mismo método sobre el espectro en coordenadas logarítmico-polares. Auto también mide regiones por toda la imagen y corrige la perspectiva si coinciden suficientes mediciones fiables. Esto ayuda a alinear las estrellas de un campo amplio tanto en los bordes como en el centro. Si no se puede medir esa corrección con confianza, mantiene rotación y escala e informa de esa alternativa en Detalles de alineación. La corrección se aplica a toda la imagen; no puede alinear un sujeto que se mueve por su cuenta ni todas las profundidades de una escena fotografiada un paso más a un lado. Una toma desplazada a la izquierda deja de cubrir el borde derecho. Por eso el resultado se recorta al área común y puede ser algo menor, evitando bordes oscuros de zonas sin cobertura.

### ¿Qué método debería usar?

**Media** para ruido cuando nada se movió: el ruido aleatorio independiente baja aproximadamente por la raíz cuadrada del número de tomas. **Mediana** para quitar lo que ocupa una parte de la escena en menos de la mitad de las tomas. **Recorte sigma** promedia los valores cercanos a la media y rechaza los que superan el umbral elegido. Puede conservar objetos móviles en conjuntos pequeños o si aparecen a menudo; si quitarlos es la prioridad, mediana es más segura. **Aclarar** para estelas de estrellas, fuegos artificiales y pintura con luz. **Oscurecer** para quitar elementos brillantes que se movieron. **Sumar** mezcla de forma aditiva las tomas decodificadas. Trabaja con valores de imagen de ocho bits y no reproduce una exposición de cámara más larga. **Apilado de enfoque** para una macro tomada a lo largo del anillo de enfoque.

### ¿Por qué mi resultado tiene ocho bits si mis archivos RAW tienen catorce?

La entrada RAW es la vista previa JPEG de la cámara, y la salida es un PNG o JPEG de ocho bits. Media y recorte sigma usan acumuladores más amplios y redondean al final. Así estiman un valor más limpio a partir de tomas con ruido sin redondear cada paso intermedio. La imagen guardada sigue teniendo ocho bits por canal; no obtiene la profundidad ni el rango dinámico de los datos lineales del sensor.

### ¿Puedo apilar tomas de distinto tamaño, o de cámaras distintas?

Sí, pero comprueba que sea intencionado. La toma más grande define el área de trabajo; las demás se ajustan y centran en ella. El resultado se recorta al área común, por lo que las formas diferentes o la alineación pueden hacerlo menor que el área prevista. Mezclar cámaras mezcla también su interpretación del color. Mantén la exposición y el encuadre constantes y examina el resultado comparándolo con la referencia.

### Dice que la pasada irá por bandas. ¿Qué significa?

La memoria de trabajo que necesita el método supera lo que la herramienta quiere reservar de una vez. La imagen se divide en franjas horizontales y se apila una por una. Se usan la misma geometría de alineación y el mismo método; el remuestreo del navegador puede variar ligeramente en el último bit. Las tomas se leen de nuevo para cada franja, así que tarda más; la página indica cuántas decodificaciones serán. Bajar un nivel la resolución de trabajo divide la memoria entre cuatro y casi siempre permite una sola pasada. La nota indica qué ajuste usar.

### ¿Por qué esta herramienta usa un Worker y ninguna de las otras?

Porque es la única cuyo trabajo se mide en minutos. Cualquier otra herramienta de aquí hace algo que tarda uno o dos segundos, y ahí sacar el trabajo del hilo principal sería ceremonia. Apilar veinte tomas grandes es aritmética sólida sobre cientos de megabytes, y en el hilo principal eso significa una página congelada: ninguna barra de progreso moviéndose, un botón de Cancelar que no responde y, al final, un navegador que ofrece matar la pestaña. El Worker es un segundo hilo dentro de este mismo navegador, ejecutando un archivo de esta misma carpeta, bajo esta misma política. No es un servidor y no es una función de red.

### ¿Es gratis y hace falta cuenta?

Es gratis, sin cuenta, inicio de sesión, prueba ni marca de agua. No hay una cuota del servicio para el número o tamaño de las tomas. Los límites prácticos son la memoria del dispositivo, los límites de lienzo y decodificación del navegador y el tiempo del apilado. La publicidad sostiene la página y no recibe información sobre las fotos.

## Cómo se comprueba la promesa de privacidad

- **Tus fotografías no tienen adónde ir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna es nuestra. Aquí no hay ningún destino donde recoger tus archivos, ni código que los enviaría si lo hubiera: no hay `fetch`, ni `XMLHttpRequest`, ni `sendBeacon`, ni en `src/` ni en el worker.
- **Las vistas previas RAW se leen en este dispositivo.** Muchos archivos RAW contienen una vista previa JPEG creada por la cámara. La herramienta recorre los directorios del archivo y extrae la mayor vista previa utilizable. La cifra de lectura para inspección cuenta las cabeceras y los directorios usados para localizarla y describirla; al decodificar también se lee el fragmento JPEG. Los datos del sensor no se decodifican, y la fila muestra las dimensiones reales de la vista previa.
- **El trabajo ocurre en un Worker de este equipo, no en un servidor.** Es la única herramienta de aquí que usa uno, porque apilar son minutos de aritmética en vez de segundos, y una página congelada no puede enseñar el progreso ni dejarse cancelar. Un Worker es un segundo hilo dentro de este mismo navegador — mira `src/worker.js`. Se le entregan los archivos en sí, lo cual es gratis, porque un descriptor de archivo no son los bytes; y tiene exactamente la misma Content-Security-Policy que la página, es decir, ningún sitio adonde mandarlos.
- **No se informa a ninguna parte de nada sobre el conjunto.** Cuántas tomas has apilado, qué cámara las escribió, cuánto se había movido cada una, qué método has elegido y cuánto ha tardado se quedan en la memoria de esta página hasta que la cierras. En este repositorio no hay ningún evento de analítica que lleve nada de eso, y la única pregunta que hace este sitio después de una descarga manda un pulgar arriba o abajo y el nombre de la herramienta, nada más.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta no cambia, porque nunca hubo un paso de red dentro. El worker y cada módulo que carga los guarda el service worker de esta misma página, así que una copia instalada apila archivos RAW con el cable desenchufado.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/raw.js` explica cómo se localizan las vistas previas RAW integradas sin decodificar el sensor; `src/stack.js`, el cálculo de cada método, y `src/plan.js`, la memoria de trabajo estimada y las decodificaciones previstas del apilado. El funcionamiento interno del navegador y la liberación de memoria pueden consumir más que los búferes modelados.
