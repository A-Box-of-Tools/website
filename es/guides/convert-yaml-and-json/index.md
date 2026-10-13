# Cómo convertir entre YAML y JSON

Convierte un documento localmente y comprueba los valores antes de usarlo. JSON pierde comentarios YAML y este lector rechaza deliberadamente construcciones no admitidas.

[Abrir Conversor de YAML a JSON](https://abox.tools/es/convertir-yaml-a-json/): Los dos sentidos, y te dice lo que cuesta cada uno. Nada de esto se pega en el servidor de otro.

Última actualización 12 de octubre de 2026

## Elige la dirección y añade el texto

Pega un documento o elige un archivo. El menú selecciona YAML a JSON o JSON a YAML; importar un archivo `.json`, `.yaml` o `.yml` elige la dirección correspondiente. Revisa antes de Copiar o Descargar.

La conversión funciona en el navegador sin subir la configuración. Conserva el original: formato y comentarios pueden importar a quien la mantiene aunque los datos no cambien.

![Entrada YAML y salida JSON con el número de comentarios descartados.](https://abox.tools/screens/convert-yaml-and-json/values.webp)

El comentario desaparece; no sigue como cadena y el entero grande conserva sus dígitos.

## Usa el subconjunto de YAML admitido

El lector maneja mapas, secuencias y valores escalares comunes con resolución de estilo YAML 1.2. No implementa todo YAML 1.2. Anclas, alias, etiquetas personalizadas y flujos de varios documentos detienen la conversión. Si la configuración los necesita, usa otro analizador que los admita; quitar un alias sin conservar su significado cambia la configuración.

Un error ofrece Ir al error. Corrige la entrada indicada en vez de usar la salida anterior, que deja de estar disponible al editar.

## Comprueba comentarios, cadenas y números

```
enabled: true
country: no
account: 12345678901234567890
```

Aquí `no` sigue como cadena `"no"`, sin convertirse en false como puede pasar con YAML 1.1. El conversor conserva el texto numérico sin redondear esa cuenta larga mediante coma flotante de JavaScript. La aplicación receptora puede imponer sus propios límites numéricos.

JSON no tiene comentarios: descarta los de YAML y la herramienta informa de los que leyó. Un `#` dentro de una cadena entrecomillada o escalar de bloque es contenido, no comentario.

## Convertir JSON de vuelta a YAML

El modelo de datos se conserva, pero el resultado es YAML recién escrito, no una recuperación de comentarios o formato anteriores. Las palabras ambiguas se entrecomillan para lectores YAML 1.1. Comprueba versión y esquema de la aplicación receptora, sobre todo en configuraciones de despliegue.

La [especificación YAML](https://yaml.org/spec/1.2.2/) describe el lenguaje completo. Para comprobar o minimizar solo JSON, usa el [formateador JSON](https://abox.tools/es/formatear-json/).
