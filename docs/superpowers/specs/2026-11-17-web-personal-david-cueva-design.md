# Web personal de David Cueva: diseño

Fecha: 2026-11-17
Estado: pendiente de aprobación

Las maquetas visuales están en un lienzo privado de la propietaria. El código fuente de las tres que importan está copiado en `mockups/`: `HomeA.dc.html` (la home elegida), `Intro.dc.html` (la entrada) y `Main.dc.html` (logo, icono y colores). Son la referencia de composición, tamaños y textos; las imágenes que enlazan solo cargan dentro del lienzo.

## 1. Intención

Una web personal de una sola página para que David Cueva, desarrollador web freelance en Berlín, capte clientes en Berlín y el resto de Europa. Vende tres servicios: desarrollo web (el principal, con Webflow y JavaScript), sesiones de fotos y edición de vídeo.

La promesa: el cliente trae su negocio y su estrategia, y David entrega la web y los servicios, todo a medida.

La web debe demostrar el oficio por sí misma: aspecto de premio (referencia: Awwwards, Lando Norris 2025) con la limpieza de Google.

## 2. Objetivos, no objetivos y anti-objetivos

Objetivos de esta primera entrega (la home):

- Que un visitante entienda en la primera pantalla quién es David y qué ofrece.
- Que vea trabajos reales y pueda contactar.
- Que la web impresione por su movimiento y sus imágenes grandes.

No objetivos, por ahora:

- El chat con IA funcionando. En esta entrega solo existe la caja, sin conexión. Se diseñará aparte cuando la página esté definida (irá conectado a la API de Claude y responderá preguntas sobre David).
- Páginas interiores de cada proyecto o servicio.
- Versión en alemán.
- Modo oscuro (salvo la pantalla oscura de la entrada).

Anti-objetivos:

- Textos pequeños y bloques largos de lectura.
- Cortes visibles entre secciones (franjas de color, líneas divisorias).
- Estética oscura tipo "vacío negro" como ambiente general.
- Que un visitante se quede bloqueado en una pantalla oscura sin saber qué hacer.

## 3. Restricciones

- Idioma: inglés.
- Mercado alemán: hacen falta Impressum y política de privacidad (enlaces en el pie; el contenido legal lo aporta la propietaria). Cuando exista el chat, deberá identificarse como IA y tratar los datos según RGPD.
- La red del entorno de trabajo en la nube solo permite ciertos dominios. Para ver webs externas se usó Apify.
- Higgsfield cuesta créditos: no se genera ningún clip hasta que este diseño esté aprobado.

## 4. Enfoques considerados

Se dibujaron tres homes y la propietaria eligió la A.

- **A. La jornada (cinemática). Elegida.** El scroll cuenta una historia: David entra, se sienta, abre el portátil y aparece la web del cliente. Chat en medio, como en el boceto original. Es la que más depende de los clips de Higgsfield.
- **B. Editorial limpia.** Nombre gigante, proyectos numerados con foto grande. Poco Higgsfield. Más sobria y menos memorable.
- **C. Chat primero.** El chat es la primera pantalla y cada sección responde a una pregunta. Descartada por ahora porque el chat aún no está diseñado.

Motivo de la elección: es la más fiel al boceto y a la idea de la propietaria de ver a David sentarse a trabajar.

## 5. Marca (decidido por la propietaria)

Logo: el nombre "David Cueva" en Inter, "David" en peso 500 y "Cueva" en 600 color petróleo, seguido de un punto dorado. Versión en negativo: texto crema sobre degradado petróleo.

Icono de la web: cuadrado redondeado con degradado petróleo, una "D" crema y un círculo dorado ("sol") abajo a la derecha.

Tipografía: Geist para titulares y texto, Geist Mono para etiquetas, numeración y menú. Inter solo en el logo. Todas de Google Fonts.

Colores (los de una app previa de la propietaria):

| Uso | Color |
|---|---|
| Petróleo: botones, enlaces | `#2f5d62` |
| Petróleo al pasar el ratón | `#244a4e` |
| Degradado: icono | `#234a4f` → `#35696f` |
| Fondo | `#ffffff` |
| Fondo petróleo suave | `#edf3f3` |
| Gris claro | `#f3f4f5` |
| Texto | `#1e1f21` |
| Texto secundario | `#6d6e6f` |
| Bordes | `#e4e5e7` |
| Dorado: solo detalles, nunca texto sobre blanco | `#e9b93c` |
| Dorado para texto | `#8a6a12` |
| Crema | `#f7f5ea` |
| Oscuro de la entrada | `#1d1e20` |

## 6. La home (versión A)

Fondo blanco continuo. Titulares muy grandes (del orden de 80 a 124 px en escritorio), texto de cuerpo de 18 px o más, imágenes y vídeos grandes con esquinas redondeadas. De arriba abajo:

1. **Cabecera.** Logo a la izquierda. Enlaces: Services, Work, Ask. Botón "Start a project".
2. **Entrada y hero.** Ver sección 7. Etiqueta "Webflow & JavaScript expert · Berlin" y el titular.
3. **La historia.** Titular "Everything tailored to your needs." y la secuencia de David abriendo el portátil hasta que la pantalla llena la página y aparece una web. Decisión de Claude: en la pantalla se ve un montaje breve de las cuatro webs de clientes, y termina fundiendo a blanco para dar paso al chat.
4. **Chat (solo la caja).** Titular "Ask me anything." Tarjeta con el rótulo "David's AI assistant", la marca "AI · coming soon", un mensaje de saludo, tres atajos (Contact, Portfolio, "What if I need photos?"), un campo "Ask anything" y un botón de enviar. Debajo, "or continue scrolling". No envía nada.
5. **Servicios.** Tres filas numeradas con titular enorme: Web development, Photo shoots, Video editing. Una línea de descripción cada una.
6. **Trabajos.** "Selected work" con cuatro tarjetas grandes: Prezenti, Jade Energy, com-create y Atalma. Cada una con imagen o vídeo de la web, nombre y una frase. Movimiento al pasar el ratón.
7. **Cierre.** Titular enorme de llamada a la acción y dos botones: "Start a project" y "Ask the AI first".
8. **Pie.** Logo, Impressum, Privacy y redes.

Debe funcionar en móvil.

## 7. La entrada: "Enciende la luz"

Idea de la propietaria. Secuencia:

1. La pantalla está oscura. Un punto dorado titila abajo a la izquierda, cerca del centro, con el icono de encender.
2. Al pulsar, el círculo crece desde ese punto hasta llenar la pantalla y se convierte en la luz del lugar.
3. Se ve a David en su estudio.
4. Una hoja de monstera se mete en el encuadre y David la aparta con la mano.
5. La vista se centra en David y entra el titular. Desde ahí continúa la historia de la sección 6.3.

Los pasos 1, 2 y 5 se hacen con código. Los pasos 3 y 4 son vídeo generado.

Reglas propuestas por Claude y aún no confirmadas expresamente por la propietaria:

- Si nadie pulsa, la luz se enciende sola a los pocos segundos o al hacer scroll.
- La entrada sale solo en la primera visita.
- Con la preferencia de movimiento reducido, la web entra ya iluminada.
- Propuesta: que el punto dorado sea la bombilla de una lámpara de mimbre del estudio.

## 8. Los clips de Higgsfield

Herramienta: Seedance 2.0 en Higgsfield, 1080p, 16:9, sin audio, unos 8 segundos por clip. Las fotos reales de David se suben como referencia de identidad en cada generación.

Identidad: David, con barba y pelo oscuro peinado hacia atrás. Vestuario igual en todos los clips: jersey beige claro de punto y cuello redondo, como en las fotos de estudio (decisión de Claude a partir de las fotos; la propietaria rechazó la camiseta negra).

Escenario, decidido por la propietaria: el estudio propio de David, con su escritorio. Madera clara, lámparas colgantes de mimbre con luz cálida, sol entrando por un ventanal y muchas plantas tropicales variadas: monstera, ficus, caladium, heliconia, anturio, espatifilo, platanera y palmas, colgando y en estantes. Ambiente luminoso y cálido.

Clips previstos:

1. **Entrada.** David en el estudio; una hoja de monstera entra en el encuadre y él la aparta. Es el plano con más riesgo de necesitar varios intentos.
2. **Se sienta a trabajar.** David se sienta en su escritorio y abre el portátil; la cámara empuja hacia la pantalla.
3. **Trabajos.** Las webs hechas por David, animadas, para las tarjetas de proyectos. Requiere capturas reales de cada web.

El diseño estático debe verse bien aunque un clip no salga: cada vídeo tiene una imagen fija de respaldo.

Orden de trabajo (decisión de Claude): primero se construye la home completa con las fotos reales de David como imágenes fijas y con huecos marcados donde irán los clips. Después se generan los clips uno a uno, la propietaria da el visto bueno a cada uno y se integran. Las seis fotos de David que entregó la propietaria (cinco de estudio en 16:9 y una vertical pequeña) se guardarán en el repositorio al empezar a construir.

## 9. Cómo se construye

Decidido por la propietaria: código a mano con Astro, no en Webflow.

Decisiones de Claude, que se pueden cambiar:

- GSAP con ScrollTrigger para las animaciones ligadas al scroll y Lenis para el scroll suave.
- Los clips se convierten en secuencias de fotogramas para moverlos con el scroll.
- Alojamiento en Cloudflare Pages, ya conectado al entorno. Astro tiene adaptador para Cloudflare, lo que permitirá añadir después la función de servidor que guarde la clave de la IA del chat.
- Alcance de esta entrega: la home funcionando en local y en una dirección de vista previa para que la propietaria la revise. El lanzamiento público con dominio propio es un paso posterior y queda bloqueado hasta tener los textos del Impressum y de privacidad.

## 10. Pendiente de la propietaria

- Titular definitivo. Provisional: "You bring your business. I make it live."
- Frases de una línea para Prezenti, Jade Energy, com-create y Atalma.
- Capturas o acceso a las cuatro webs para animarlas.
- Enlaces a las redes de David y datos del Impressum.
- Dirección o forma de contacto a la que llevan los botones.
- Confirmar las reglas de la entrada (sección 7).

## 11. Lo que queda a criterio de quien construya

- Tiempos y curvas exactas de las animaciones.
- Número de fotogramas y peso de las secuencias.
- Adaptación concreta a móvil de cada sección.
- Textos de relleno marcados entre corchetes hasta que lleguen los definitivos.
