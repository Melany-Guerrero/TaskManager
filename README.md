# TaskManager 

## Descripción
TaskManager es una aplicación web desarrollada con JavaScript Vanilla (ES6+) que permite organizar y administrar tareas de forma sencilla. Su interfaz utiliza HTML y CSS, con un diseño en tonos celestes pastel.

## Funcionalidades
- Crear nuevas tareas con título, descripción y prioridad.
- Consultar la lista de tareas.
- Editar y eliminar tareas existentes.
- Marcar tareas como pendientes o completadas.
- Buscar tareas por título.
- Filtrar tareas según su estado.
- Ordenar tareas por fecha de creación o prioridad.
- Visualizar estadísticas de tareas totales, pendientes y completadas.
- Importar tareas desde la API pública JSONPlaceholder.
- Guardar las tareas en localStorage para conservarlas al volver a abrir la página.
- Utilizar eventos personalizados (Custom Events) para actualizar la interfaz cuando cambian las tareas.

## Tecnologías utilizadas
- HTML5
- CSS3
- JavaScript Vanilla (ES6+)
- localStorage
- Fetch API
- JSONPlaceholder API
- Git y GitHub

## Archivos del proyecto
- `index.html`: estructura de la aplicación.
- `styles.css`: estilos y diseño visual.
- `script.js`: lógica, funcionalidades y gestión de tareas.
- `AI_DECLARATION.md`: declaración del uso de inteligencia artificial.

## Cómo utilizar la aplicación
1. Abre la página publicada de TaskManager.
2. Escribe el título de una tarea y, si deseas, añade una descripción y una prioridad.
3. Pulsa **Agregar tarea**.
4. Utiliza los controles disponibles para buscar, filtrar, ordenar, editar, completar o eliminar tareas.

## Persistencia de datos
La aplicación utiliza localStorage para guardar las tareas en el navegador. De esta manera, las tareas almacenadas pueden mantenerse después de cerrar o actualizar la página en el mismo navegador.

## API externa
La aplicación utiliza JSONPlaceholder para importar tareas de ejemplo cuando no existen tareas guardadas previamente en el almacenamiento local.

## Proyecto académico
Desarrollado como proyecto académico para practicar JavaScript moderno, manipulación del DOM, eventos personalizados, consumo de API y persistencia de datos en el navegador.
