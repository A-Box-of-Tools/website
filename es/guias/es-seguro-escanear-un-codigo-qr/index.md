# ¿Es seguro escanear un código QR?

El escaneo en sí, sí. Un código QR es un trozo de texto, y apuntarle con la cámara no hace más que leer ese texto. Todo lo que puede salir mal ocurre un toque después, cuando algo abre lo leído — y ese toque está en tu mano no darlo.

Última actualización 26 de agosto de 2026

## La respuesta corta

Escanear es seguro. Un código QR es un trozo corto de texto dibujado en cuadraditos, y apuntarle con la cámara hace exactamente una cosa: leer ese texto de vuelta. Esa lectura no puede instalar nada, no puede visitar nada y no puede tocar nada de tu teléfono, por la misma razón por la que mirar una dirección escrita no te lleva hasta ella.

El peligro empieza un paso después, cuando algo *abre* lo que se leyó — y todo el truco de cada estafa con códigos QR consiste en que ese paso ocurra antes de que hayas visto adónde vas. El texto del código es una dirección que nadie puede leer a simple vista, y la mayoría de los teléfonos la responden con un único toque impaciente. Mantén separados el leer y el abrir, y a la estafa no le queda nada con que trabajar.

## Qué es realmente un código QR

Debajo de los cuadraditos no hay más que una cadena de caracteres: unos pocos miles como mucho, normalmente bastantes menos. Una dirección web, el nombre y la contraseña de una red Wi-Fi, una tarjeta de contacto, una línea de texto. El formato se diseñó en 1994 para seguir piezas de coche por una fábrica de Toyota, y no contiene instrucciones de ninguna clase. Un código QR no puede «contener un virus», igual que no puede contenerlo una señal de tráfico.

Lo que sí puede contener es un texto que le *pide* algo a tu teléfono: abrir esta dirección, unirse a esta red, guardar este contacto. Cada una de esas cosas es una petición, no una orden. El código propone; decide quien lo escaneó. Un lector que te muestra el texto y espera es completamente seguro. Un lector que actúa por su cuenta sobre el texto le ha entregado la decisión a quien imprimió el código — y esa es toda la diferencia entre un escaneo seguro y uno peligroso.

Una nota a pie de página, por honestidad: el programa que descodifica puede tener fallos, como cualquier programa que analiza una entrada, y los ha habido en lectores a lo largo de los años. Pero ese riesgo pertenece al lector, no al código, y no es en eso en lo que se apoyan las estafas. Se apoyan en el toque.

## El truco de la pegatina

La estafa que se ha vuelto lo bastante común como para ganarse un nombre — quishing — es de una simpleza casi vergonzosa: imprimir un código propio, pegarlo encima de uno de verdad y esperar. En un parquímetro, donde el falso lleva a una página de pago que parece la del ayuntamiento. En la mesa de un restaurante, encima de la carta. En el aviso de paquetería que entra por la puerta, junto a las palabras «no te encontramos en casa».

Fíjate en qué la hace funcionar. No es sofisticación técnica: no hay ninguna. Es que un código QR es la única clase de dirección que una persona no puede leer antes de seguirla. Una dirección web torcida escrita en letras se delata ante cualquiera que la mire; la misma dirección dibujada en cuadraditos parece exactamente una honrada. Para cuando puedes ver adónde iba el código, ya estás allí, en una página construida para parecerse a la que esperabas, pidiéndote el número de tu tarjeta.

La defensa no es dejar de escanear. Es mirar la dirección *entre* el escaneo y la visita, lo que cuesta unos dos segundos y desmonta el truco por completo.

## Tres maneras en que una dirección miente

Dos segundos de mirada bastan, pero solo si sabes qué mirar. Hay tres formas de aspecto honrado que adopta una dirección torcida, y las tres merecen conocerse de vista.

### 1. El nombre antes de la @

Una dirección web puede llevar un nombre de usuario, escrito antes de un signo `@`: todo lo anterior a la `@` es decoración, y el destino real empieza después. `tubanco.es@evil.example` no va a tu banco. Va a `evil.example`, llevando «tubanco.es» como nombre de usuario sin significado alguno. El ojo lee el principio de una dirección; el navegador lee el final.

### 2. Letras que no son las letras que aparentan

Los alfabetos se solapan. Una `а` cirílica se dibuja exactamente igual que una `a` latina, y una dirección escrita con una es otra dirección distinta que en pantalla parece idéntica. El truco tiene nombre — ataque homógrafo — y es la razón de que un destino pueda coincidir letra por letra con el que te fías y aun así estar en otra parte.

### 3. La primera parada honrada

La dirección del código puede ser genuinamente respetable — un acortador de enlaces, una redirección de marketing, el rastreo de clics de un buscador — y limitarse a *reenviarte* a un sitio que no lo es. La primera dirección pasa el examen; el destino lo decide un servidor cuando ya estás en camino. Una dirección acortada en un código impreso no prueba nada malo, pero sí significa que la dirección que puedes comprobar no es la dirección a la que llegarás.

## Cómo escanear uno sin riesgo

La regla cabe en una frase: **leer primero, abrir después, y nunca dejar que un solo gesto haga las dos cosas.** En la práctica:

- Usa un lector que te muestre el texto descodificado y se detenga. La mayoría de las cámaras de teléfono muestran el destino en un pequeño rótulo antes de abrirlo: lee el rótulo en vez de tocarlo por reflejo, y lee el *final* de la dirección, no el principio.
- Desconfía más donde más hay en juego y la superficie es pública: cualquier cosa que acabe en un pago, cualquier cosa que viva a la intemperie. El código de un parquímetro merece más reflexión que el de la cartela de un museo.
- Un código que lleva derecho a una página de inicio de sesión o de datos de tarjeta es el momento de pararse y teclear en su lugar la dirección que ya conoces. La versión legítima de esa página nunca está a más de unas pocas teclas.
- Los códigos de Wi-Fi y las tarjetas de contacto merecen la misma pausa: uno le pide a tu teléfono que recuerde una red, la otra que guarde a una persona. Ambas cosas están bien aceptadas a sabiendas, y ninguna debería ocurrir en silencio.

## Cómo se comporta el lector de aquí

Este sitio tiene un [lector de códigos QR y de barras](https://abox.tools/es/escanear-codigo-qr/), y está construido sobre la regla que esta página lleva defendiendo: **nunca abre nada.** El texto descodificado se muestra entero, el host que la dirección alcanzaría de verdad se extrae a una línea propia, y los tres disfraces de arriba se comprueban y se nombran cuando aparecen. Abrir el enlace es un botón aparte, pulsado después de leer — o nunca.

La lectura en sí ocurre en tu propia máquina. La imagen que escaneas se descodifica en tu navegador y no se envía a ninguna parte, de modo que un código del que sospechas puede examinarse sin que nadie — este sitio incluido — sepa qué decía; la página sigue funcionando con el Wi-Fi apagado, que es la manera más fácil de comprobar esa afirmación. Y una carga abiertamente hostil, como una dirección `javascript:` que ejecutaría código en quien la abre, se queda sin enlace y se nombra por lo que es.

La otra mitad también existe: un [generador de códigos QR](https://abox.tools/es/generar-codigo-qr/) que dibuja los códigos en tu propia máquina, y una guía compañera sobre [crear un código y comprobar que escanea](https://abox.tools/es/guias/crear-un-codigo-qr-y-comprobar-que-escanea/) antes de mandarlo a imprenta. Y si detrás de tu pregunta estaba la más amplia — qué hace realmente entregarle cualquier cosa a un sitio web —, esa tiene [una página propia](https://abox.tools/es/guias/es-seguro-subir-archivos/).
