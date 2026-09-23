# CV digital — Bruno Rodríguez

Página estática (HTML/CSS/JS, sin build) publicada en GitHub Pages: https://brunorod631-byte.github.io/cv/

- `data.js`: todo el contenido (proyectos, demos de RA, PR, trayectoria, contacto). Para cambiar algo, se edita solo este archivo.
- `index.html` + `app.js` + `style.css`: la página.
- `qr.html`: tarjetas con QR para imprimir (CV y demo para restaurantes).
- `#ra-<rubro>` en la URL abre directo esa demo (`#ra-restaurantes`, `#ra-automotoras`, `#ra-interactivo`, `#ra-tiendas`).
- `img/prs/`: capturas de GitHub. Se agregan en `capturas` de `data.js` como `{ src: 'img/prs/x.png', texto: '...' }`.
- Al publicar cambios, subir el `?v=` de `style.css`, `data.js` y `app.js` en `index.html` para que el celular no muestre la versión vieja.

Modelos 3D de terceros: ver créditos al pie de la página.

## Tarjetas para imprimir

- `tarjetas.html?tipo=cv` y `tarjetas.html?tipo=socio`: hoja A4 con 10 tarjetas de 85 × 55 mm.
- PDF listos en `imprimir/` (se regeneran con Chrome headless `--print-to-pdf` si cambia el diseño).
