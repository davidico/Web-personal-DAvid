# Home en Astro: pendientes tras la primera entrega

Estado: los seis pasos del plan están construidos y revisados (56 pruebas en verde). La revisión final dio el visto bueno para enseñar una vista previa. La vista previa no está desplegada: espera el permiso de la propietaria.

## Preguntar a la propietaria al ver la vista previa

- El círculo de la entrada se abre con borde limpio, sin el halo cálido dorado que muestra la maqueta. ¿Lo quiere?
- El borde del campo del chat tiene poco contraste (viene de la maqueta).
- Confirmar las reglas de la entrada: se enciende sola a los 4 s, solo en la primera visita, sin animación con movimiento reducido.

## Contenido que falta (bloquea el lanzamiento público)

- Titular definitivo. Provisional: "You bring your business. I make it live."
- Frases de Jade Energy, com-create y Atalma, y capturas o direcciones de las cuatro webs.
- Destino de "Start a project" y enlaces a redes: hoy no hay forma de contactar con David desde la web.
- Textos del Impressum y de privacidad. El de privacidad debe mencionar que se guarda `dc-intro-seen` en el navegador.
- Los clips de Higgsfield (plan aparte).

## Técnico, antes del lanzamiento público

- `SITE_URL` real y `PUBLIC_INDEXABLE=true` al publicar.
- Icono de la web: la "D" como trazado, más versiones PNG y apple-touch.
- Etiquetas para compartir en redes (Open Graph).
- Sin JavaScript, Enter en el chat recarga con `?q=`.
- Estilo al pasar el ratón y al enfocar los atajos del chat.
- El botón atrás no desplaza entre anclas.
- La cabecera ocupa mucho alto en móvil.
- En servicios, el número y la línea no se animan como el título.
- Pruebas que faltan: contenido inerte mientras está oscuro, `touchmove`, enlaces con ancla.
- Puerto libre en el ayudante de pruebas antes de montar integración continua.
- Tamaños en `rem`, coste de Inter para dos palabras y precarga de Geist.
- Enlace "saltar al contenido".
- Script `astro check`.
- Devolver el titular a texto normal al acabar la animación.
- Región de aviso del chat: algunos lectores de pantalla no la anuncian (`.notice:empty`).
- Avisos de GSAP en consola cuando no hay letras que animar.
- Registrar el temporizador de respaldo antes de `animate` en la entrada.
- Si el código de movimiento tarda más de 5 s en una primera visita, las secciones reaparecen animadas.
- Comprobación manual en Safari, Firefox y móviles reales.

## Decisiones tomadas durante la construcción

- El contenedor usa 48 px de margen lateral y 1344 px de contenido a 1440 px, como la maqueta.
- Las pruebas corren de una en una, porque comparten puerto.
- El titular se oculta con una clase que pone JavaScript y con CSS, para que no parpadee; sin JavaScript sigue visible.
- Las tarjetas de proyecto no son enlaces hasta que tengan dirección.
- Se descartó reservar hueco para la barra de desplazamiento: dejaba una franja blanca junto a la entrada oscura.
- Las etiquetas pequeñas en letra de código nunca son párrafos, para cumplir la regla de 18 px en el texto.
