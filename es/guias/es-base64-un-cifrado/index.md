# ¿Base64 es un cifrado?

No. Base64 es un cambio de vestuario, no un candado: cualquiera que lo reconozca lo deshace en milisegundos, sin clave alguna. Pero la pregunta merece respuesta de verdad, porque codificación, cifrado y hash se parecen en pantalla y no podrían prometer cosas más distintas.

Última actualización 26 de agosto de 2026

## La respuesta corta

No. Base64 es una *codificación*: una manera de escribir cualquier dato usando solo sesenta y cuatro caracteres inofensivos, para que sobreviva al paso por sistemas construidos para texto plano. No tiene clave, no tiene secreto y no tiene propiedad de seguridad de ninguna clase. Descodificarlo exige reconocerlo, y nada más: a una persona le cuesta un vistazo, a una máquina un milisegundo.

Aun así la pregunta merece la pena, porque la confusión es universal y a veces cara. Una cadena base64 *parece* revuelta — `cGFzc3dvcmQ=` no le dice nada al ojo — y lo que parece revuelto se archiva bajo «seguro». Ha habido productos reales que salieron con contraseñas «protegidas» así. La cura es una distinción aprendida una vez: **codificar es para máquinas, cifrar es para secretos, hashear es para huellas.** Tres trabajos, tres herramientas, y solo una protege algo.

## Codificación: reversible por cualquiera

Una codificación cambia cómo se *escriben* los datos, nunca lo que dicen. Adjuntos de correo, imágenes incrustadas en hojas de estilo, tokens en direcciones: en todos esos sitios, bytes arbitrarios necesitan atravesar canales que solo transportan texto con fiabilidad, y base64 es el disfraz estándar: entran tres bytes, salen cuatro caracteres hechos de letras, cifras y dos signos, con `=` rellenando el final. Ese `=` final es la seña, y una vez conocida se ve base64 en todas partes.

La propiedad que lo define: la receta es pública y funciona igual hacia atrás. No hay nada que saber, así que no hay nada que no saber. El porcentaje de las URLs (`%20` para un espacio), las entidades HTML (`&amp;`), el hexadecimal y los escapes con barra invertida son la misma idea con otra ropa, y el [codificador y decodificador base64](https://abox.tools/es/codificar-base64/) de aquí los habla todos, en ambos sentidos, en tu propia máquina. Descodificar una cadena que encontraste es exactamente tan legítimo como leerla, porque una codificación nunca fue un candado.

## Cifrado: reversible para quien tiene la clave

El cifrado es el que de verdad protege un contenido. Transforma los datos con una *clave*, y las matemáticas están dispuestas para que deshacer la transformación sin la clave no sea simplemente difícil sino computacionalmente inalcanzable — mientras que con la clave es instantáneo. El secreto vive por entero en la clave, no en el método: los algoritmos están publicados, normalizados, y son más fuertes precisamente por eso.

Aquí es donde muerde la confusión visual, porque los bytes cifrados se codifican rutinariamente en base64 para poder viajar: revueltos por una clave, y luego disfrazados para el transporte. Dos capas, dos trabajos. El JSON Web Token es el caso de manual: tres trozos de base64 unidos por puntos, de los que los dos primeros se *descodifican* en JSON legible para cualquiera que lo intente. La gente pega tokens en descodificadores web públicos a diario, habiendo supuesto que el conjunto iba sellado; la descripción honrada es que un JWT es una postal con firma a prueba de falsificaciones, no un sobre.

## Hash: reversible para nadie

Un hash corre en una sola dirección. Pasa cualquier cantidad de datos por SHA-256 y sale un número de tamaño fijo: el mismo número cada vez para los mismos datos, un número completamente distinto para datos que difieren en un bit, y ningún camino de vuelta del número a los datos, para nadie, con clave o sin ella. No es disfraz ni candado; es una *huella*.

Eso es lo que lo hace la herramienta correcta para los dos trabajos que le pertenecen. Comprobar que un archivo descargado es exactamente el que publicó su editor — comparar huellas, que es lo que la herramienta de [checksum](https://abox.tools/es/calcular-checksum/) hace en tu máquina, con [guía propia](https://abox.tools/es/guias/verificar-el-checksum-de-una-descarga/). Y guardar contraseñas: un servicio bien llevado conserva solo el hash de la tuya, de modo que ni siquiera su base de datos robada contiene la contraseña. Cuando un sitio puede mandarte por correo tu contraseña olvidada, te ha dicho que nunca la hasheó — y cuando una config «asegura» la suya como `cGFzc3dvcmQ=`, te ha dicho que solo la codificó.

## Distinguirlos en la práctica

Un atajo que funciona para la cadena que tienes delante:

- **¿Se descodifica en algo legible?** Era codificación. Letras, cifras, quizá `+` y `/`, a menudo `=` al final: pásala por un descodificador y mira.
- **¿Se descodifica en ruido binario?** Entonces el base64 era solo el disfraz, y lo de debajo está cifrado, comprimido, o nunca fue texto: la codificación no te dice nada en ningún caso.
- **¿Longitud fija, caracteres hexadecimales, nunca se descodifica?** 64 caracteres hexadecimales es la silueta de SHA-256; 32, la de MD5. Los hashes no se descodifican; solo coinciden o dejan de coincidir.

Y la moraleja práctica de cada uno: nunca confíes el secreto a una codificación; nunca construyas tu propio cifrado cuando tu plataforma lo trae; nunca guardes una contraseña como otra cosa que un hash. La cadena que descodificas para comprobar puede ser, mientras tanto, la parte sensible en sí — un token a medio depurar suele serlo —, y por eso el [descodificador de aquí](https://abox.tools/es/codificar-base64/) corre donde el secreto ya está, en tu máquina, y por eso [lo que hace de verdad pegar en una herramienta web](https://abox.tools/es/guias/es-seguro-pegar-texto-en-una-herramienta-online/) tiene página propia.
