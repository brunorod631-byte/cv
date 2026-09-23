// Arma la página desde window.CV (data.js).
(function () {
  const cv = window.CV;
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs = {}, ...hijos) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v);
    }
    for (const h of hijos) if (h != null) n.append(h);
    return n;
  };

  // --- Portada ---
  $('nombre').textContent = cv.nombre;
  $('titulo').textContent = cv.titulo;
  $('resumen').textContent = cv.resumen;
  $('lugar').textContent = cv.lugar;
  $('btn-wa').href = cv.contacto.whatsapp;
  $('btn-cv').href = cv.contacto.cv;

  // --- Realidad Aumentada ---
  const visor = $('visor');
  const esCelular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  $('ra-aviso').hidden = esCelular;

  let demoActual = null;

  // Carga un modelo en el visor. Los rubros con varios modelos (d.modelos) llaman una vez por modelo elegido.
  function cargarModelo(m, d) {
    visor.setAttribute('src', m.src);
    visor.setAttribute('alt', m.alt);
    visor.setAttribute('scale', m.scale || d.scale || '1 1 1');
    visor.setAttribute('camera-orbit', m.orbit);
    // Tamaño real: en RA no se deja achicar/agrandar, así el cliente ve si el mueble entra.
    visor.setAttribute('ar-scale', d.tamanoReal ? 'fixed' : 'auto');
    // Lo que va colgado (aire split) se apoya en la pared en vez del piso.
    visor.setAttribute('ar-placement', m.pared ? 'wall' : 'floor');
    if (d.animado) visor.setAttribute('autoplay', ''); else visor.removeAttribute('autoplay');
    $('ra-medidas').hidden = true;
    for (const b of $('ra-modelos').children) b.setAttribute('aria-pressed', String(b.textContent === m.nombre));
  }

  const medida = (n) => n.toLocaleString('es-UY', { maximumFractionDigits: 2 });
  visor.addEventListener('load', () => {
    const d = demoActual;
    if (!d || !d.tamanoReal) return;
    const t = visor.getDimensions();
    $('ra-medidas').textContent = `Medidas: ${medida(t.x)} × ${medida(t.z)} m · alto ${medida(t.y)} m`;
    $('ra-medidas').hidden = false;
  });

  function mostrarDemo(d, indice = 0) {
    demoActual = d;
    const modelos = $('ra-modelos');
    modelos.replaceChildren();
    modelos.hidden = !d.modelos;
    for (const m of d.modelos || []) {
      const b = el('button', { class: 'modelo', type: 'button', text: m.nombre });
      b.addEventListener('click', () => cargarModelo(m, d));
      modelos.append(b);
    }
    cargarModelo(d.modelos ? d.modelos[indice] : d, d);
    $('ar-btn-texto').textContent = d.boton;
    $('ra-rubro').textContent = d.rubro;
    $('ra-titulo').textContent = d.titulo;
    $('ra-texto').textContent = d.texto;
    const extra = $('ra-extra');
    extra.hidden = !d.extra;
    if (d.extra) { extra.href = d.extra.href; extra.textContent = d.extra.texto + ' →'; }
    for (const b of $('rubros').children) b.setAttribute('aria-selected', String(b.dataset.id === d.id));
  }
  for (const d of cv.ra) {
    const b = el('button', { class: 'rubro', type: 'button', role: 'tab', 'data-id': d.id, text: d.rubro });
    b.addEventListener('click', () => mostrarDemo(d));
    $('rubros').append(b);
  }
  // Permite abrir un rubro directo desde el QR: .../#ra-automotoras
  const inicial = cv.ra.find((d) => location.hash === '#ra-' + d.id) || cv.ra[0];
  mostrarDemo(inicial);
  if (location.hash.startsWith('#ra-')) $('ra').scrollIntoView();

  // --- Intro con carrusel ---
  // Se muestra al entrar por la dirección general. Si el QR trae un #sección, va directo.
  const intro = $('intro');
  const items = cv.ra.flatMap((d) => (d.modelos || [d]).map((m, i) => ({ d, i, m })));
  const poster = (src) => 'img/posters/' + src.split('/').pop().replace('.glb', '.webp');
  function tarjetaCarrusel({ d, i, m }) {
    const b = el('button', { class: 'carrusel-item', type: 'button' },
      el('img', { src: poster(m.src), alt: '', width: '180', height: '180', decoding: 'async' }),
      el('span', { text: m.nombre || d.rubro }));
    b.addEventListener('click', () => { cerrarIntro(); mostrarDemo(d, i); $('ra').scrollIntoView(); });
    return b;
  }
  // La pista lleva la lista dos veces para que la animación dé la vuelta sin salto.
  for (let k = 0; k < 2; k++) for (const it of items) $('carrusel-a').append(tarjetaCarrusel(it));
  function cerrarIntro() {
    intro.classList.add('saliendo');
    document.body.classList.remove('con-intro');
    setTimeout(() => { intro.hidden = true; }, 350);
    try { sessionStorage.setItem('introVista', '1'); } catch {}
  }
  let vista = false;
  try { vista = sessionStorage.getItem('introVista') === '1'; } catch {}
  if (!location.hash && !vista) {
    intro.hidden = false;
    document.body.classList.add('con-intro');
    $('intro-iniciar').focus();
  }
  $('intro-iniciar').addEventListener('click', cerrarIntro);
  $('intro-plan').addEventListener('click', () => { cerrarIntro(); $('mantenimiento').scrollIntoView(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !intro.hidden) cerrarIntro(); });

  visor.addEventListener('progress', (e) => {
    const p = e.detail.totalProgress;
    $('progreso').style.width = p * 100 + '%';
    $('progreso').parentElement.classList.toggle('oculto', p >= 1);
  });

  // --- Plan Socio de Mantenimiento ---
  const plan = cv.plan;
  $('plan-publico').textContent = plan.publico;
  $('plan-nombre').textContent = plan.nombre;
  $('plan-bajada').textContent = plan.bajada;
  $('plan-precio').textContent = plan.precio || 'Consultá el valor';
  $('plan-wa').href = cv.contacto.whatsapp + '?text=' + encodeURIComponent(plan.whatsappTexto);
  plan.pasos.forEach(([t, d], i) => {
    $('plan-pasos').append(el('li', {}, el('span', { class: 'paso-num', text: String(i + 1) }),
      el('div', {}, el('strong', { text: t }), el('p', { text: d }))));
  });
  for (const [icono, t, d] of plan.incluye) {
    $('plan-incluye').append(el('article', { class: 'item' },
      el('span', { class: 'item-icono' }, el('i', { 'data-lucide': icono })),
      el('h4', { text: t }), el('p', { text: d })));
  }
  for (const c of plan.condiciones) $('plan-condiciones').append(el('li', { text: c }));
  if (window.lucide) window.lucide.createIcons();

  // --- Proyectos ---
  for (const p of cv.proyectos) {
    const card = el('article', { class: 'proyecto' + (p.imagenes ? ' con-imagenes' : '') },
      el('p', { class: 'etiqueta', text: p.etiqueta }),
      el('h3', { text: p.nombre }),
      el('p', { text: p.texto }),
      el('ul', { class: 'chips chips-chicos' }, ...p.stack.map((s) => el('li', { text: s }))),
    );
    if (p.imagenes) {
      card.append(el('div', { class: 'galeria' },
        ...p.imagenes.map((img) => {
          const [src, w, h] = Array.isArray(img) ? img : [img, 480, 1061];
          return el('img', { src, alt: 'Captura de ' + p.nombre, loading: 'lazy', width: String(w), height: String(h) });
        })));
    }
    $('lista-proyectos').append(card);
  }

  // --- GitHub ---
  const repos = Object.keys(cv.prs);
  const todos = repos.flatMap((r) => cv.prs[r]);
  const lineas = todos.reduce((a, pr) => a + pr[3], 0);
  const stats = [
    [todos.length, 'PR mostrados'],
    [repos.length, 'repositorios'],
    ['+' + lineas.toLocaleString('es-UY'), 'líneas agregadas'],
  ];
  for (const [n, t] of stats) $('stats').append(el('div', { class: 'stat' }, el('strong', { text: String(n) }), el('span', { text: t })));

  if (cv.capturas.length) {
    $('capturas').hidden = false;
    for (const c of cv.capturas) {
      $('capturas').append(el('figure', {},
        el('a', { href: c.src, target: '_blank', rel: 'noopener' }, el('img', { src: c.src, alt: c.texto, loading: 'lazy' })),
        el('figcaption', { text: c.texto })));
    }
  }

  const fmt = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'short' });
  function mostrarRepo(repo) {
    for (const b of $('repos').children) b.setAttribute('aria-selected', String(b.dataset.id === repo));
    const ul = $('prs');
    ul.replaceChildren();
    for (const [num, titulo, fecha, mas, menos, archivos] of cv.prs[repo]) {
      ul.append(el('li', { class: 'pr' },
        el('span', { class: 'pr-icono', 'aria-hidden': 'true' }),
        el('div', { class: 'pr-cuerpo' },
          el('p', { class: 'pr-titulo', text: titulo }),
          el('p', { class: 'pr-meta' },
            el('span', { class: 'merged', text: 'Merged' }),
            ` #${num} · ${fmt.format(new Date(fecha + 'T12:00:00'))} · ${archivos} archivo${archivos === 1 ? '' : 's'} · `,
            el('span', { class: 'mas', text: '+' + mas }), ' ',
            el('span', { class: 'menos', text: '−' + menos })),
        )));
    }
  }
  for (const r of repos) {
    const b = el('button', { class: 'rubro', type: 'button', role: 'tab', 'data-id': r },
      r, el('span', { class: 'cuenta', text: String(cv.prs[r].length) }));
    b.addEventListener('click', () => mostrarRepo(r));
    $('repos').append(b);
  }
  mostrarRepo(repos[0]);

  // --- Trayectoria ---
  for (const [fecha, titulo, texto] of cv.trayectoria) {
    $('linea').append(el('li', {},
      fecha ? el('p', { class: 'etiqueta', text: fecha }) : null,
      el('h3', { text: titulo }), el('p', { text: texto })));
  }
  for (const f of cv.formacion) $('formacion').append(el('li', { text: f }));
  for (const h of cv.habilidades) $('habilidades').append(el('li', { text: h }));

  // --- Contacto ---
  const c = cv.contacto;
  const tarjetas = [
    ['WhatsApp', c.telefono, c.whatsapp],
    ['Email', c.email, 'mailto:' + c.email],
    ['LinkedIn', 'brunorodriguez-dev', c.linkedin],
    ['GitHub', 'brunorod631-byte', c.github],
    ['CV en PDF', 'Descargar', c.cv],
  ];
  for (const [t, v, href] of tarjetas) {
    const a = el('a', { class: 'contacto-card', href }, el('span', { text: t }), el('strong', { text: v }));
    if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
    if (t === 'CV en PDF') a.setAttribute('download', '');
    $('contacto-grid').append(a);
  }

  for (const cr of cv.creditos) $('creditos').append(el('li', { text: cr }));
  $('anio').textContent = new Date().getFullYear();
})();
