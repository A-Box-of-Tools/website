# ¿Cómo puede una página web funcionar sin el Wi-Fi?

Porque el navegador guardó una copia completa, y un pequeño programa que viaja con la página sirve esa copia siempre que la red no puede. La maquinaria es estándar y merece entenderse, porque una herramienta que trabaja desconectada te está enseñando algo que ninguna política de privacidad puede enseñar.

Última actualización 26 de agosto de 2026

## La respuesta corta

Una página web normalmente vive y muere con su conexión, porque cada visita vuelve a traerla. Pero una página puede venir con un pequeño programa llamado *service worker*, que el navegador instala a su lado y pone al mando de su tráfico de red. En la primera visita, ese worker guarda una copia completa de todo lo que compone la página — marcado, estilos, scripts — en una caché de tu máquina. Desde entonces, las peticiones se contestan desde esa copia. Cuando el Wi-Fi muere, nada cambia, porque de todos modos no se estaba trayendo nada.

No hay magia ni permiso especial en nada de esto: es maquinaria estándar del navegador, presente en todos los grandes navegadores desde hace como una década. Lo inusual es un sitio que se apoya en ella tan fuerte como este — porque para un sitio cuya promesa entera es que tus archivos nunca salen, el sin-conexión no es una comodidad. Es la prueba.

## Qué demuestra sobrevivir al tirón de cable

La comprobación más fuerte de la guía de subidas es [tirar del cable](https://abox.tools/es/guias/es-seguro-subir-archivos/): cargar la herramienta, desconectar y usarla. Merece la pena precisar por qué funciona. Una herramienta que convierte tu archivo en un servidor necesita la red en el momento exacto en que hace su trabajo — corta el cable y el trabajo se para. Una herramienta que sigue funcionando ha demostrado, no afirmado, que el trabajo ocurre en tu máquina; y una página que no puede alcanzar la red no puede enviar tu archivo a ninguna parte, desee lo que desee su código.

Ninguna política de privacidad puede ofrecer eso. Una política describe intenciones y puede cambiar; una página haciendo su trabajo en modo avión es física. Por eso cada herramienta de este sitio funciona sin conexión y lleva un indicador en vivo que dice si ahora mismo la tienes — para que puedas verlo cambiar al apagar la conexión, y ejecutar la comprobación más fuerte que existe en unos diez segundos.

## Cómo la copia se mantiene honrada

Dos preguntas deciden si lo guardado-para-siempre es regalo o trampa, y la maquinaria responde a ambas:

- **¿Se queda vieja la copia?** El worker busca una versión más nueva cuando hay conexión y la cambia entera. Las versiones van enteras porque la copia debe ser siempre coherente: mitad vieja, mitad nueva es el único estado que jamás debe servirse.
- **¿Qué se copió exactamente?** Todo lo que la página necesita y nada más — y cada herramienta de aquí guarda su copia en su propio compartimento. La caché de una herramienta contiene esa herramienta; instalar una no instala diez en silencio. La copia además puede inspeccionarse: las herramientas de desarrollo de tu navegador listan cada archivo cacheado, y la lista es la misma que la página trajo a la vista de todos.

El resultado es una página que se comporta como una aplicación que instalaste por el hecho de visitarla — cosa que además se ofrece literalmente: la barra de direcciones del navegador instala cualquier herramienta de aquí como aplicación, con el icono propio de la herramienta, abriéndose directa en la herramienta, sin botón en la página y sin script que lo pida. La misma maquinaria, vestida de atajo.

## Qué no prueba el sin-conexión

La comprobación es fuerte, no mágica, y sus límites merecen decirse tan claro como su fuerza:

- **Prueba el momento, no el futuro.** El trabajo hecho sin conexión se quedó en tu máquina, punto. Una página podría en principio retener datos y enviarlos al volver la conexión — así que, con los archivos más delicados, cierra la pestaña antes de reconectar, o comprueba también la otra dirección: mira la pestaña de Red mientras vuelve la conexión.
- **Prueba esta página, no el sitio.** Cada página responde por sí misma. La única de aquí que usa la red lo dice en su propia página: la herramienta de [compartir texto](https://abox.tools/es/compartir-texto/), cuyo oficio entero es mover algo entre dos aparatos, y que explica exactamente qué lleva su única conexión.
- **No te esconde.** Cargar la página ya le contó al sitio tu dirección, como todo cargado de página en la web. El sin-conexión trata de adónde van tus archivos, no de anonimato.

Esos límites son la razón de que la guía de subidas enseñe cuatro comprobaciones y no una: la pestaña de Red, la política de seguridad en el código de la página y el código legible cubren lo que el tirón de cable no puede. Pero como primer filtro no hay ninguno más rápido: si una herramienta no puede hacer su trabajo sin red, ya aprendiste dónde ocurre el trabajo, y no hace falta leer más.
