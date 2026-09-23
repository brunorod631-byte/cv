// Contenido del CV. Es la única fuente de datos: index.html se arma desde acá.
// Los PR son datos reales de GitHub (gh pr list), repos privados.

window.CV = {
  nombre: 'Bruno Rodríguez',
  titulo: 'Desarrollador freelance · Apps, bots, web y Realidad Aumentada',
  lugar: 'Uruguay',
  resumen:
    'Construyo software que resuelve problemas reales de negocio: apps Android, bots de Telegram, ' +
    'tiendas online y experiencias de Realidad Aumentada que se abren desde el celular, sin instalar nada. ' +
    'Sumo formación en redes (UTEC), ciberseguridad ofensiva y experiencia en ventas y atención al cliente.',

  contacto: {
    whatsapp: 'https://wa.me/59898611824',
    telefono: '098 611 824',
    email: 'brunorod631@gmail.com',
    linkedin: 'https://linkedin.com/in/brunorodriguez-dev',
    github: 'https://github.com/brunorod631-byte',
    cv: 'assets/cv-bruno-rodriguez.pdf',
  },

  // Demos de RA por rubro (restaurantes primero).
  ra: [
    {
      id: 'restaurantes',
      rubro: 'Restaurantes',
      titulo: 'El plato, servido en tu mesa',
      texto:
        'El cliente escanea un QR en la carta y ve el plato en 3D, a tamaño real, sobre su mesa antes de pedirlo. ' +
        'Ideal para promocionar platos del día y aumentar el ticket.',
      src: 'models/pizza-bigboss.glb',
      alt: 'Pizza en 3D',
      scale: '0.5 0.5 0.5',
      orbit: '30deg 55deg auto',
      boton: 'Ver en mi mesa',
    },
    {
      id: 'muebles',
      rubro: 'Mueblerías e inmobiliarias',
      titulo: 'El mueble, en el living del cliente',
      texto:
        'El cliente ve el mueble a tamaño real en su casa antes de comprarlo y comprueba si entra. ' +
        'Para inmobiliarias: amueblar un ambiente vacío durante la visita para que se imaginen viviendo ahí.',
      boton: 'Ver en mi living',
      tamanoReal: true,
      modelos: [
        { nombre: 'Sofá', src: 'models/sofa-terciopelo.glb', alt: 'Sofá de terciopelo en 3D', orbit: '25deg 70deg auto' },
        { nombre: 'Sillón', src: 'models/sillon.glb', alt: 'Sillón en 3D', orbit: '25deg 70deg auto' },
        { nombre: 'Mesa de comedor', src: 'models/mesa-comedor.glb', alt: 'Mesa de comedor de madera en 3D', orbit: '25deg 60deg auto' },
        { nombre: 'Mesa de luz', src: 'models/mesa-de-luz.glb', alt: 'Mesa de luz clásica en 3D', orbit: '25deg 70deg auto' },
      ],
    },
    {
      id: 'automotoras',
      rubro: 'Automotoras',
      titulo: 'El auto, en el garaje del cliente',
      texto:
        'Mirá el auto desde todos los ángulos y proyectalo a escala real en la calle o en el garaje. ' +
        'Sirve para vender unidades que todavía no llegaron al local.',
      src: 'models/porsche-911.glb',
      alt: 'Porsche 911 en 3D',
      scale: '1 1 1',
      orbit: '-35deg 75deg auto',
      boton: 'Ver en mi espacio',
    },
    {
      id: 'interactivo',
      rubro: 'Experiencias',
      titulo: 'Un personaje que reacciona',
      texto:
        'Personaje animado para vidrieras, eventos o cumpleaños infantiles. ' +
        'La versión completa responde al toque y camina por el piso.',
      src: 'models/robot-expresivo.glb',
      alt: 'Robot animado en 3D',
      scale: '0.6 0.6 0.6',
      orbit: '20deg 75deg auto',
      boton: 'Verlo en el piso',
      animado: true,
      extra: { texto: 'Abrir la experiencia interactiva completa', href: 'https://brunorod631-byte.github.io/webar-demo/xr.html' },
    },
    {
      id: 'tiendas',
      rubro: 'Tiendas',
      titulo: 'El producto, antes de comprarlo',
      texto:
        'Cualquier producto con su modelo 3D: decoración, electrodomésticos, juguetes. El cliente ve el tamaño real en su casa.',
      src: 'models/gorila-lowpoly.glb',
      alt: 'Figura de gorila en 3D',
      scale: '0.5 0.5 0.5',
      orbit: '25deg 75deg auto',
      boton: 'Ver en mi casa',
    },
  ],

  proyectos: [
    {
      nombre: 'CamLibre',
      etiqueta: 'App Android',
      texto:
        'App propia para cámaras de seguridad Xiongmai/iCSee, sin publicidad. Video en vivo, PTZ, audio bidireccional ' +
        'y configuración del WiFi de la cámara por Bluetooth (protocolo reconstruido por ingeniería inversa).',
      stack: ['Kotlin', 'Jetpack Compose', 'DVRIP', 'ONVIF', 'RTSP', 'BLE'],
      imagenes: ['img/app/camlibre-inicio.webp', 'img/app/camlibre-video_en_vivo.webp', 'img/app/camlibre-dispositivos.webp'],
    },
    {
      nombre: 'Bot de gestión — Ferretería La Popular',
      etiqueta: 'Bot en producción',
      texto:
        'Bot de Telegram que usa el personal todos los días: pedidos de clientes, facturas de proveedores por mes, ' +
        'faltantes, libreta de crédito, buscador de productos y avisos automáticos a Discord. Más de 800 tests.',
      stack: ['Python', 'Telegram Bot API', 'Discord', 'Docker'],
    },
    {
      nombre: 'Realidad Aumentada web',
      etiqueta: 'Demo comercial',
      texto:
        'Modelos 3D que se proyectan con la cámara del celular desde el navegador, sin instalar apps. ' +
        'Está funcionando más arriba en esta misma página.',
      stack: ['model-viewer', 'three.js', 'WebXR'],
    },
    {
      nombre: 'PambaUy',
      etiqueta: 'App móvil + backend',
      texto:
        'Comunidad privada por invitación: mensajería en tiempo real, historias que se borran a las 24 h, ' +
        'moderación y pagos con Mercado Pago. Privacidad por diseño (se borran los datos GPS de fotos y videos).',
      stack: ['React Native', 'Expo', 'Node.js', 'WebSocket', 'SQLite'],
    },
    {
      nombre: 'Polarizados a Medida',
      etiqueta: 'E-commerce',
      texto:
        'Tienda online de kits de polarizado cortados a medida: el cliente elige marca, modelo y versión de su auto ' +
        'y ve los kits compatibles con stock real.',
      stack: ['Next.js', 'Prisma', 'PostgreSQL'],
    },
    {
      nombre: 'Tienda Shopify + automatización',
      etiqueta: 'E-commerce',
      texto: 'Importador y gestor de catálogo para Shopify, publicación automática en Instagram y SEO local.',
      stack: ['Python', 'Shopify API', 'SEO'],
    },
  ],

  // PR mergeados, datos reales. fecha = día del merge.
  prs: {
    CamLibre: [
      [17, 'Agregar README con capturas de pantalla', '2026-09-22', 36, 0, 6],
      [16, 'Mostrar miniaturas reales de las cámaras DVRIP', '2026-09-17', 189, 17, 10],
      [15, 'Implementar audio bidireccional (OPTalk) en el adaptador DVRIP', '2026-09-17', 503, 7, 12],
      [14, 'Configurar WiFi de cámaras Xiongmai/iCSee por Bluetooth', '2026-09-17', 380, 4, 4],
      [13, 'Autenticar la URL RTSP de cámaras Xiongmai embebiendo user:pass', '2026-09-17', 39, 1, 3],
      [12, 'Mostrar el logo de CamLibre en el header', '2026-09-13', 28, 2, 3],
      [11, 'Renombrar la app a "CamLibre" y aplicar el logo nuevo', '2026-09-13', 23, 7, 10],
      [10, 'Agregar escaneo Bluetooth (BLE) en "Agregar cámara"', '2026-09-13', 298, 1, 4],
      [9, 'Mostrar el control PTZ siempre en el video en vivo', '2026-09-13', 4, 9, 1],
      [8, 'Rediseñar la interfaz de la app (estilo Ring/Arlo)', '2026-09-13', 1353, 178, 17],
      [7, 'Conectar el adaptador ONVIF real en la app (selector de protocolo)', '2026-09-13', 962, 32, 11],
      [6, 'Adaptador ONVIF real (SOAP/HTTP, WS-Security, Media, PTZ)', '2026-09-12', 902, 19, 8],
      [5, 'getCapabilities() real del DVRIP (detección de movimiento verificada)', '2026-09-12', 90, 8, 4],
      [4, 'Video real con media3-exoplayer-rtsp para cámaras reales', '2026-09-12', 136, 11, 5],
      [3, 'Agregar cámaras reales: pantalla, persistencia y adaptador DVRIP', '2026-09-12', 346, 30, 10],
      [2, 'Adaptador DVRIP real (login, keepalive, PTZ, streaming en vivo)', '2026-09-12', 824, 0, 2],
      [1, 'Core de cámaras + MVP de app (lista + video en vivo)', '2026-09-12', 2901, 0, 58],
    ],
    'Bot La Popular': [
      [39, 'fix(crédito): el botón "Crédito" del menú principal nunca abre el padrón', '2026-09-09', 86, 38, 2],
      [38, 'feat(crédito): vista del empleado sin saldos y botones sin emoji', '2026-09-09', 253, 140, 3],
      [36, 'feat: libreta de crédito (fiado) — conversación de Telegram, menú y tests', '2026-09-08', 1321, 3, 7],
      [35, 'Comando /estado y verificación de servicio para uso diario', '2026-09-05', 577, 2, 10],
      [34, 'feat: botones "Editar" en todo lo editable', '2026-09-03', 588, 8, 7],
      [33, 'Sección Clientes, archivar pedido de cliente y acceso para empleados', '2026-09-02', 562, 20, 11],
      [30, 'fix: "Facturas por mes" interactiva + resumen a Discord automático', '2026-09-01', 249, 196, 6],
      [22, 'feat: notificaciones del bot hacia Discord (webhook)', '2026-08-30', 315, 2, 7],
      [18, 'Buscador de productos por nombre desde todos los menús', '2026-08-30', 247, 6, 6],
      [16, 'Clasificación en 22 categorías + taxonomía ferretera uruguaya', '2026-08-30', 371, 344, 25],
      [15, 'feat: candado con PIN para toda acción de borrado', '2026-08-29', 458, 269, 14],
      [10, 'feat: método de pago y comprobante al confirmar pago de factura', '2026-08-28', 268, 26, 7],
      [1, 'feat: elegir empresa de proveedor por botón y depurar catálogo', '2026-08-27', 576, 45, 7],
    ],
    PambaUy: [
      [2, 'Fase 3.5 (app): grabar y ver estados de video', '2026-09-10', 472, 67, 15],
      [1, 'Fase 3.5 (backend): video en estados con ffmpeg', '2026-09-10', 730, 55, 16],
    ],
  },
  // Capturas reales de GitHub (se agregan en img/prs/). Si la lista está vacía, no se muestra el bloque.
  capturas: [
    { src: 'img/prs/camlibre-14-wifi-bluetooth.webp', texto: 'CamLibre #14 — Protocolo WiFi por Bluetooth reconstruido por ingeniería inversa' },
    { src: 'img/prs/lapopular-36-libreta-credito.webp', texto: 'Bot La Popular #36 — Libreta de crédito (fiado) en Telegram, con tests' },
    { src: 'img/prs/camlibre-8-rediseno.webp', texto: 'CamLibre #8 — Rediseño completo de la interfaz' },
    { src: 'img/prs/pambauy-1-video-ffmpeg.webp', texto: 'PambaUy #1 — Video en estados, borrando los datos GPS con ffmpeg' },
  ],

  trayectoria: [
    ['Actualidad · +2 años', 'Desarrollador freelance', 'Apps Android, bots de Telegram, tiendas Shopify, Realidad Aumentada y automatizaciones a medida para clientes reales.'],
    ['', 'Gestión comercial y digital — Ferretería La Popular (San José)', 'Atención al cliente, ventas, asesoramiento técnico y administración de la tienda online.'],
    ['', 'Pasante en elaboración de proyectos — Gobierno de Canarias (España)', 'Proyectos urbanos y rurales durante una pasantía institucional.'],
    ['', 'Vendedor remoto — Empresa española de insumos tecnológicos', 'Venta y asesoramiento a distancia, seguimiento y postventa.'],
    ['', 'Asistente — Ejército Nacional, Batallón de Ingenieros N.º 4 (Maldonado)', 'Apoyo operativo y trabajo en equipo.'],
  ],
  formacion: [
    'Redes — UTEC',
    'Ciberseguridad / Pentesting — TheBigSchool',
    'Instalación de CCTV',
    'Encargado de Establecimientos Rurales — Plan Agropecuario',
  ],
  habilidades: [
    'Kotlin · Jetpack Compose', 'Python', 'React Native · Expo', 'Node.js · TypeScript', 'Next.js',
    'Bots de Telegram', 'Shopify', 'Realidad Aumentada web', 'Git · GitHub', 'Docker',
    'Redes', 'Kali Linux · Nmap · Wireshark', 'Instalación de CCTV', 'SEO',
  ],

  creditos: [
    'Pizza "BigBoss" — ponomarovmax (Sketchfab), CC BY 4.0',
    '"(FREE) Porsche 911 Carrera 4S" — Karol Miklas (Sketchfab), CC BY-SA 4.0',
    'Gorila low poly — iRahulRajput (Sketchfab), CC BY 4.0',
    '"RobotExpressive" — Tomás Laulhé, modificado por Don McCurdy, CC0',
    '"Glam Velvet Sofa" — Eric Chadwick / Wayfair (Khronos glTF Sample Assets), CC BY 4.0',
    '"Sheen Chair" — Eric Chadwick / Wayfair (Khronos glTF Sample Assets), CC0',
    '"Wooden Table 02" y "Classic Nightstand 01" — Poly Haven, CC0',
  ],
};
