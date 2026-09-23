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

  function mostrarDemo(d) {
    visor.setAttribute('src', d.src);
    visor.setAttribute('alt', d.alt);
    visor.setAttribute('scale', d.scale);
    visor.setAttribute('camera-orbit', d.orbit);
    if (d.animado) visor.setAttribute('autoplay', ''); else visor.removeAttribute('autoplay');
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

  visor.addEventListener('progress', (e) => {
    const p = e.detail.totalProgress;
    $('progreso').style.width = p * 100 + '%';
    $('progreso').parentElement.classList.toggle('oculto', p >= 1);
  });

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
        ...p.imagenes.map((src) => el('img', { src, alt: 'Captura de ' + p.nombre, loading: 'lazy', width: '480', height: '1061' }))));
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
