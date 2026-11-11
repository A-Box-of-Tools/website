# ¿Dónde van las copias de tus archivos?

El procesamiento local describe lo que ocurre dentro de la herramienta. Las copias que guardas, sincronizas y compartes tienen sus propios destinos. Sigue un documento de ejemplo sin datos sensibles para entender esos límites.

Última actualización 22 de octubre de 2026

## Empieza con un archivo sin datos sensibles

El procesamiento local describe dónde trabaja una herramienta con el archivo. La ubicación de guardado del navegador, el software de sincronización en la nube y la configuración de copias de seguridad determinan qué ocurre después con el resultado guardado. Cerrar la herramienta no gestiona esas copias por ti. La [guía sobre el procesamiento de archivos subidos](https://abox.tools/es/guias/es-seguro-subir-archivos/) explica ese primer límite; esta guía sigue los archivos guardados.

Imagina `workshop-handout.pdf`, que contiene un horario ficticio y un dibujo. Exportas una versión más pequeña como `workshop-handout-small.pdf` y copias ese resultado en una carpeta para el evento. Tienes un original, una exportación descargada y otra copia guardada antes de considerar ninguna copia de seguridad.

Usa un archivo similar sin información sensible para conocer tu configuración. El objetivo es saber dónde están las copias útiles, qué cuentas o dispositivos pueden acceder a ellas y qué archivos intermedios han terminado su función.

## Localiza el resultado descargado

Busca el archivo exportado en el gestor de archivos y anota la ruta completa de su carpeta. No deduzcas su ubicación a partir del nombre ni del hecho de que el navegador lo haya abierto.

Chrome permite elegir una carpeta de descarga predeterminada o preguntar por el destino cada vez. Suele usar la carpeta Descargas del usuario, pero la configuración puede cambiarla. La [documentación de descargas de Google](https://support.google.com/chrome/answer/95759?hl=en) distingue el registro del navegador del archivo: quitar una entrada del historial de descargas deja el archivo guardado en el dispositivo.

Para el ejemplo, anota `Downloads/workshop-handout-small.pdf`. Si lo copiaste a otro lugar, registra esa segunda ubicación por separado. Abre ambos archivos antes de decidir si alguno sobra.

## Comprueba si la carpeta de destino se sincroniza

Una carpeta visible en el gestor de archivos también puede estar conectada a una cuenta en la nube. Comprueba su ubicación real y los ajustes de la aplicación de sincronización en lugar de asumir que Documentos significa que un archivo solo existe en este dispositivo.

OneDrive puede hacer copias de seguridad de carpetas seleccionadas y ofrecer su contenido en otros dispositivos. La [documentación de Microsoft sobre copias de seguridad de carpetas](https://support.microsoft.com/en-us/onedrive/back-up-your-folders-with-onedrive) explica cómo ver cuáles están incluidas. Esto se aplica cuando la función está configurada; no significa que todas las carpetas Documentos se sincronicen automáticamente.

Supón que la carpeta del evento está dentro de una carpeta Documentos con copia de seguridad en OneDrive. Añade la cuenta en la nube al inventario. Comprueba también cómo se comparte: saber dónde existe un archivo y quién puede acceder a él son preguntas distintas.

## Prepara un pequeño inventario de copias

Anota lo que realmente hayas encontrado y marca las ubicaciones dudosas para revisarlas. Tu configuración puede tener menos o más entradas que este ejemplo.

| Ubicación y copia | Decisión pendiente |
| --- | --- |
| Carpeta del proyecto: documento original | Conservar si hace falta para cambios posteriores |
| Descargas: exportación más pequeña | Revisar después de comprobar la copia elegida para el evento |
| Carpeta del evento: exportación revisada | Conservar como copia de trabajo del evento |
| Cuenta en la nube: carpeta sincronizada, si está activada | Comprobar la cuenta y los accesos compartidos |
| Copia de seguridad: versiones anteriores, si se guardaron | Comprobar su finalidad y conservación |
| Papelera: exportaciones eliminadas, si se conservan | Revisar solo los elementos pertinentes |

Que los nombres coincidan no demuestra que dos archivos contengan la misma versión. Comprueba el contenido e identifica la copia que piensas usar antes de eliminar una exportación intermedia.

## Incluye las copias de seguridad y las versiones anteriores

Las copias de seguridad existen para que perder o modificar un archivo de trabajo no implique perder su contenido para siempre. Esa protección es útil y significa que una versión anterior puede seguir disponible después de sustituir la actual.

El Historial de archivos de Windows puede guardar versiones en una unidad externa o una ubicación de red cuando está configurado. Microsoft explica qué incluye y cómo funciona la recuperación en [Copia de seguridad y restauración con Historial de archivos](https://support.microsoft.com/en-us/windows/experience/backup-recovery/backup-and-restore-with-file-history).

Comprueba qué carpetas abarca la copia de seguridad y cuánto tiempo conserva las versiones. Anota esa información en lugar de eliminar carpetas de copias de seguridad para ordenar un solo documento. Una copia de seguridad puede contener la única versión recuperable de otros trabajos. En un dispositivo administrado, sigue el procedimiento de la organización para cambiar la conservación o eliminar registros.

## Entiende qué cambia cada acción de eliminación

Distintas acciones afectan a ubicaciones diferentes. En OneDrive, convertir un archivo en solo en línea elimina su contenido descargado del dispositivo y conserva el archivo en la nube. Eliminar un archivo sincronizado puede afectar a la nube y a otros dispositivos sincronizados. La [documentación de Archivos a petición de Microsoft](https://support.microsoft.com/en-us/onedrive/save-disk-space-with-onedrive-files-on-demand-for-windows) explica esas diferencias. Comprueba la acción antes de usarla para gestionar una copia.

Los archivos eliminados pueden seguir siendo recuperables. OneDrive tiene su propia papelera y la conservación depende del tipo de cuenta y de la configuración; un archivo que solo está en la nube no tiene por qué aparecer en la papelera del dispositivo. Consulta la [guía de recuperación de archivos eliminados de Microsoft](https://support.microsoft.com/en-us/onedrive/restore-your-onedrive-files).

Eliminar un archivo de una carpeta visible solo permite saber qué ocurrió en esa ubicación. No demuestra que hayan desaparecido otras exportaciones, copias de seguridad o copias ya compartidas con alguien.

## Decide qué conservar y compruébalo después

En el ejemplo del taller, conserva el original necesario para futuras modificaciones y la copia revisada del evento. Revisa la descarga sobrante después de confirmar que la exportación conservada se abre correctamente. Mantén las copias de seguridad útiles según su política de conservación prevista y deja intactos los elementos dudosos hasta entenderlos.

- Abre el archivo elegido para conservar y confirma su contenido.
- Comprueba su carpeta, la cuenta en la nube y cómo se comparte.
- Elimina solo copias concretas cuya finalidad haya terminado, después de comprobar el efecto de la acción.
- Anota cualquier copia de seguridad u otra ubicación que aún debas investigar.

En la próxima exportación, elige el destino de forma deliberada y usa un nombre de archivo claro. Repite esta comprobación al terminar la tarea, mientras recuerdas qué archivos eran originales, pruebas y resultados finales.
