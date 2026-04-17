# Documentación Técnica y Preguntas Frecuentes - Palmas Street

Este documento resuelve las consultas técnicas e inquietudes conceptuales sobre el desarrollo del proyecto web "Palmas Street", estructuradas de forma clara para el entendimiento académico y profesional.

---

## Índice de Contenidos

* [Fundamentos de la Web](#fundamentos-de-la-web)
* [Estructura y HTML](#estructura-y-html)
* [Diseño y CSS](#diseño-y-css)
* [Lógica y JavaScript](#lógica-y-javascript)
* [Herramientas y Despliegue](#herramientas-y-despliegue)
* [Lógica Específica del Proyecto](#lógica-específica-del-proyecto)

---

## Preguntas y Respuestas

### Fundamentos de la Web

**1. ¿Qué es un lenguaje de programación, cuál es la estructura del html?**
Un lenguaje de programación es un sistema formal que permite dictar instrucciones lógicas a una computadora (como JavaScript). HTML, por su parte, no es un lenguaje de programación sino de marcado; su función es estructurar contenido. La estructura fundamental de un archivo HTML incluye la declaración `<!DOCTYPE html>`, el contenedor principal `<html>`, una cabecera `<head>` (para metadatos) y el cuerpo `<body>` (para el contenido visible).

**2. ¿Qué es una estructura de programación?**
Es la manera en la que se organiza el flujo de ejecución del código. Involucra estructuras secuenciales (instrucciones paso a paso), condicionales (tomas de decisión) e iterativas (bucles o repeticiones).

**3. ¿Qué son las clases en la programación? ¿La clase y el objeto son lo mismo?**
En la Programación Orientada a Objetos (POO), una clase es una "plantilla" o molde abstracto, mientras que un objeto es la materialización o instancia concreta de ese molde. (Nota: En HTML/CSS, el concepto de "clase" es distinto; funciona simplemente como un identificador para agrupar elementos visuales).

**4. ¿Qué es un código DRY? ¿y un código vibe coding?**
DRY (*Don't Repeat Yourself*) es un principio de diseño de software que busca reducir la redundancia, promoviendo la reutilización de código. "Vibe coding" es un término moderno e informal que describe un flujo de trabajo intuitivo, donde el desarrollador se apoya fuertemente en herramientas de inteligencia artificial para alcanzar un resultado visual o funcional sin detenerse excesivamente en planificar la sintaxis estricta.

**5. ¿Para qué sirve tener una estructura ordenada en la programación web?**
Garantiza la escalabilidad, facilita el mantenimiento del sistema, optimiza el trabajo colaborativo entre desarrolladores y mejora factores técnicos como el posicionamiento en buscadores (SEO) y la accesibilidad para los usuarios.

---

### Estructura y HTML

**6. ¿Cuáles son las etiquetas empleadas en HTML en este proyecto?**
Se emplearon etiquetas semánticas y multimedia como: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<video>`, `<img>`, `<a>` (enlaces), y `<form>` (formularios).

**7. ¿Qué son los atributos? ¿y menciona los que se están usando?**
Los atributos son propiedades adicionales incrustadas en las etiquetas HTML que configuran su comportamiento o identidad. En el proyecto se usan: `src` (fuente de medios), `href` (destino de enlaces), `alt` (texto alternativo), `class` e `id` (identificadores para CSS/JS), `type`, `placeholder` y `required` (para formularios), además de `autoplay`, `loop`, `controls` y `muted` (para el video).

**8. ¿Cómo se importó el mapa a la página web?**
Se utilizó la etiqueta `<iframe>`, la cual permite incrustar un documento HTML externo dentro de la página actual; en este caso, se enlazó el servicio de mapas de Google.

**9. ¿Cómo se puso el video en la página web? ¿y cuáles son sus atributos?**
Se empleó la etiqueta `<video>`. Se configuró con los atributos `autoplay` (inicio automático), `loop` (reproducción en bucle), `controls` (muestra controles de pausa/reproducción) y `muted` (silenciado por defecto para permitir el autoplay en navegadores modernos).

**10. ¿Cómo se ponen las imágenes y cuáles son sus atributos?**
Se incrustan con la etiqueta `<img>`. Sus atributos principales son `src` (la ruta del archivo), `alt` (descripción para accesibilidad) y `loading="lazy"` (optimización que retrasa la carga de la imagen hasta que aparece en pantalla).

**11. ¿Cuáles son los contenedores de HTML? ¿Cuáles usaste y por qué?**
Los contenedores agrupan otros elementos. Se usaron contenedores genéricos como `<div>` y contenedores semánticos como `<section>` (para secciones temáticas), `<article>` (para tarjetas de productos), `<main>` (contenido principal) y `<nav>` (navegación). Se usan semánticos porque ayudan a los motores de búsqueda y lectores de pantalla a entender la jerarquía de la página.

**12. ¿Qué son las etiquetas en HTML? ¿Hay atributos y clases en CSS?**
Las etiquetas construyen el esqueleto del documento HTML. CSS no posee "etiquetas" ni "atributos" de la misma forma; CSS utiliza "selectores" (que apuntan a etiquetas, clases o IDs de HTML) y "declaraciones" (pares de propiedad-valor) para aplicar diseño.

**13. ¿La parte del header es lo mismo que el head?**
No. El `<head>` es una sección oculta del documento que contiene metadatos, configuración y enlaces a estilos. El `<header>` es una etiqueta estructural visible que suele contener el logotipo y el menú principal de la interfaz de usuario.

**14. ¿Para qué se usa el header y el head en programación web?**
El `<head>` configura la página para el navegador (título, codificación de caracteres, SEO, importación de CSS). El `<header>` define la cabecera visual del sitio web, facilitando la identificación de la marca y la navegación.

**15. ¿Cómo se setearon los links mediante los nombres o texto en HTML?**
Envolviendo el texto deseado dentro de una etiqueta de anclaje `<a>` y asignando la ruta de destino al atributo `href` (ej. `<a href="ruta.html">Texto</a>`).

**16. ¿Qué es un footer? ¿Es importante?**
Es el pie de página del sitio web. Es vital porque cierra la jerarquía visual, ofrece navegación secundaria, presenta información legal, datos de contacto y enlaces a redes sociales.

**17. ¿Cómo se pusieron los links en las imágenes en el footer?**
Se envolvió cada etiqueta `<img>` (logotipos de empresas afiliadas) dentro de una etiqueta `<a>` que contiene la URL externa en su atributo `href`.

**18. ¿Cómo se logró el redireccionamiento en la página web mediante el navegador del header?**
Usando enlaces relativos. Para secciones en la misma página se usaron identificadores de ancla (ej. `href="#catalogo"`), y para distintas páginas se indicaron las rutas de los archivos (ej. `href="web/us.html"`).

**19. ¿Cómo se puso el navegador en el header? ¿Cuáles son sus atributos y por qué cambia de color el logo en modo oscuro?**
Se estructuró con la etiqueta `<nav>` envolviendo una lista `<ul>`. El logo cambia de color en modo oscuro debido a la propiedad CSS `filter: invert(1)`, la cual se activa cuando el contenedor principal adquiere la clase `.dark`, invirtiendo matemáticamente los píxeles de la imagen.

**20. ¿Cómo se desarrolló el formulario? ¿y cuáles son sus componentes?**
Se desarrolló en `contact.html` usando la etiqueta principal `<form>`. Contiene componentes `<label>` (títulos de campo), `<input>` (campos de entrada para texto, teléfono, email, fecha), `<textarea>` (campos de mensajes extensos) y un `<button type="submit">` para enviar la información.

---

### Diseño y CSS

**21. ¿Cómo se llama al CSS desde un archivo HTML?**
Se vincula insertando la etiqueta `<link rel="stylesheet" href="ruta/del/archivo.css">` dentro del bloque `<head>`.

**22. ¿CSS tiene alguna estructura de programación? ¿Cuáles usaste?**
CSS es un lenguaje declarativo, por lo que no tiene condicionales ni bucles tradicionales. Sin embargo, usa jerarquías lógicas. En este proyecto se implementaron variables nativas (`:root` para paletas de color) y pseudo-clases (`:hover` para interacciones).

**23. ¿Qué es grid y flexbox y cuáles son sus diferencias? ¿En qué parte las aplicas?**
Son sistemas de maquetación de CSS. Flexbox es unidimensional (organiza elementos en una fila o en una columna) y se aplicó en la barra de navegación y el pie de página. Grid es bidimensional (organiza en filas y columnas simultáneamente) y se aplicó en la cuadrícula del catálogo de productos (`.products-grid`).

**24. ¿Cuándo es bueno usar Flexbox, Grid o ambos al mismo tiempo?**
Flexbox es ideal para alinear elementos pequeños o distribuir espacio en un solo eje. Grid es perfecto para definir arquitecturas completas de páginas o galerías. Se usan juntos frecuentemente: Grid define la cuadrícula externa y Flexbox alinea el contenido interno de cada tarjeta.

**25. ¿Cómo se tiene ese efecto hover en las cartas?**
Aplicando la pseudo-clase CSS `:hover` a la tarjeta. Al pasar el cursor, se modifica la propiedad `transform: scale(1.05)` (para agrandar ligeramente el elemento) y se aumenta la sombra con `box-shadow`, acompañado de un `transition` suave.

**26. ¿Cómo se hizo responsive la página? ¿Qué se usó?**
Se hizo adaptable a dispositivos móviles mediante el uso de "Media Queries" (`@media (max-width: ...)`). Estas instrucciones condicionales en CSS reconfiguran la maquetación (ej. pasando de columnas a filas) y ajustan tamaños tipográficos según el ancho de la pantalla.

**27. Qué estilos se suelen usar o usaste para cada elemento multimedia, nómbrame 10:**
Para imágenes y videos se usaron: `width`, `height`, `max-width`, `object-fit` (para encuadre), `border-radius` (bordes curvos), `box-shadow` (sombras), `display`, `margin`, `filter` (inversión de colores), y `transform`.

**28. Qué estilos se suelen usar o usaste para cada elemento de formulario, nómbrame 15:**
Para los campos de entrada: `padding`, `margin`, `border`, `border-radius`, `background-color`, `color` (color de texto), `font-size`, `outline` (quitar borde de enfoque por defecto), `box-sizing`, `display`, `width`, `transition`, `cursor` (para el botón), `text-align`, y `opacity`.

---

### Lógica y JavaScript

**29. ¿Cómo se conectó el JS con el HTML?**
Mediante la inserción de la etiqueta `<script src="ruta/del/archivo.js"></script>` justo antes del cierre de la etiqueta `</body>`, garantizando que la estructura visual cargue antes de ejecutar la lógica.

**30. ¿Qué estructura de programación se empleó en el archivo Javascript?**
Se utilizó el paradigma de programación imperativa y programación orientada a eventos, estructurada mediante la declaración de variables (`const`, `let`), funciones, manejadores de eventos (`addEventListener`) y el objeto `localStorage`.

**31. ¿Qué tipo de estructura de programación se usó en el formulario?**
Para el formulario se usó programación orientada a eventos. El script "escucha" el evento `submit`, detiene la recarga de la página con `e.preventDefault()`, extrae los valores ingresados y despliega una alerta con la información estructurada.

**32. JS tiene alguna estructura de programación? ¿Y si sí, cuáles usaste?**
Sí, es un lenguaje completo. Se usaron condicionales (`if` para evaluar el tema guardado), bucles (`forEach` para recorrer indicadores del banner), y funciones anónimas y declaradas para la gestión visual.

**33. ¿Cómo funciona el JS del modo oscuro y por qué lo usaste?**
Funciona evaluando primero si existe un registro llamado "tema" en el almacenamiento local del navegador (`localStorage`). Si el usuario hace clic en el botón, JS intercala (`toggle`) la clase `.dark` en la etiqueta `<body>` y guarda la preferencia. Se implementó para brindar una mejor experiencia de usuario (UX), reduciendo la fatiga visual según la preferencia personal y manteniéndola activa al navegar entre páginas.

**34. ¿Cómo funciona el JS del slider del banner y por qué lo usaste?**
Opera mediante un contador (`counter`) que se incrementa de forma automática usando la función de temporizador `setInterval`. Al cambiar el contador, JS modifica la propiedad `transform: translateX` del contenedor principal del banner para desplazar visualmente las imágenes. Se prefirió escribir la lógica desde cero en lugar de instalar librerías pesadas, garantizando un rendimiento óptimo de la web.

---

### Herramientas y Despliegue

**35. ¿Qué es Visual Studio Code? ¿Y por qué es importante en este proyecto?**
Es un editor de código fuente altamente versátil desarrollado por Microsoft. Su importancia radica en su amplio ecosistema de extensiones, formateadores y resaltado de sintaxis, lo que agiliza la escritura y depuración del código HTML, CSS y JS.

**36. ¿Qué es Cursor? ¿Y por qué es importante en este proyecto?**
Cursor es un editor de código (construido sobre la arquitectura de VS Code) que integra inteligencia artificial de manera nativa. Permite autocompletado inteligente y asistencia generativa, optimizando significativamente la velocidad de desarrollo.

**37. ¿Qué es Github & Git? ¿Y por qué es importante en este proyecto?**
Git es un sistema de control de versiones que registra el historial de cambios del código, mientras que GitHub es la plataforma en la nube que aloja dichos repositorios. Son cruciales para salvaguardar el proyecto, permitir la colaboración sin sobreescribir el trabajo y facilitar el despliegue a producción.

**38. ¿Qué es Vercel? ¿Y por qué es importante en este proyecto?**
Vercel es una plataforma de alojamiento en la nube (cloud hosting) optimizada para frameworks frontend y sitios estáticos. Es importante porque se integra directamente con GitHub, permitiendo desplegar la página web de Palmas Street al mundo entero en segundos y de forma automatizada cada vez que se actualiza el código.
