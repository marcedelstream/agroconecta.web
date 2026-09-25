# Prototipo

- `agroconecta-v2-prototipo.html` → **guardalo acá** (lo descargás del canvas de diseño). Es la referencia de cómo se siente la app.
- `source/Main.dc.html` → código fuente del prototipo iOS navegable (las 5 tabs, detalle, en vivo, publicidad, encuesta/quiz, puntos y canjes). Ahí están el CSS con los valores exactos y la lógica de cada interacción, en el bloque `<script type="text/x-dc">`.
- `source/Android.dc.html` → variante Android (Material You) de la pantalla de Inicio.

Los archivos de `source/` no se abren solos en el navegador (necesitan el runtime del editor de diseño) y las imágenes `/_blob/...` no cargan fuera del canvas. Se usan **como especificación**, no para ejecutarlos. Todo el contenido (organizaciones, precios, premios) es **ficticio**.
