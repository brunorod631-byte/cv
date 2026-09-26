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

  // Compartir: menú nativo del celular; si no existe (computadora), abre WhatsApp con el link.
  $('btn-compartir').addEventListener('click', async () => {
    const datos = {
      title: 'Bruno Rodríguez · Desarrollador',
      text: 'Apps, bots, web y Realidad Aumentada. Probá las demos desde tu celular.',
      url: 'https://brunorod.uy/',
    };
    if (navigator.share) {
      try { await navigator.share(datos); } catch { /* el usuario cerró el menú */ }
      return;
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(datos.text + ' ' + datos.url), '_blank', 'noopener');
  });

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

  // --- Intro ---
  // Se muestra al entrar por la dirección general. Si el QR trae un #sección, va directo.
  const intro = $('intro');
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
  if (!intro.hidden) robotQueAsoma($('asoma-intro'), () => intro.hidden);
  if (!intro.hidden) {
    // El 3D se descarga solo si se ve la bienvenida; si falla (sin WebGL) queda el texto solo
    const sillon = $('sillon-intro');
    import('./sillon3d.js?v=2')
      .then((m) => m.iniciarSillon(sillon, () => !intro.hidden))
      .catch(() => { sillon.hidden = true; });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !intro.hidden) cerrarIntro(); });

  // --- Link siempre limpio: brunorod.uy, sin ?v=, ?fbclid= ni #sección en la barra ---
  // Primero se usa lo que trae el link (el QR con #ra-restaurantes abre esa demo) y después se borra.
  const destino = location.hash.slice(1);
  if (location.search || location.hash) history.replaceState(null, '', location.pathname);
  const irA = (id) => {
    if (id === 'inicio') { scrollTo({ top: 0 }); return; }
    const seccion = $(id.startsWith('ra-') ? 'ra' : id);
    if (seccion) seccion.scrollIntoView();
  };
  if (destino) requestAnimationFrame(() => irA(destino));
  // Los links del menú bajan a la sección sin agregar #algo a la dirección
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    e.preventDefault();
    irA(a.getAttribute('href').slice(1));
  });

  // Robot que cruza la pantalla arriba de Realidad Aumentada: se carga al acercarse y solo se mueve a la vista
  const paseo = $('paseo');
  let paseoVisible = false;
  new IntersectionObserver(([e]) => {
    paseoVisible = e.isIntersecting;
    if (paseoVisible && !paseo.dataset.cargado) {
      paseo.dataset.cargado = '1';
      import('./robotpaseo.js?v=1')
        .then((m) => m.iniciarPaseo(paseo, () => paseoVisible && intro.hidden))
        .catch(() => { paseo.hidden = true; });
    }
  }, { rootMargin: '300px' }).observe(paseo);

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

  // --- Formulario de contacto (lo recibe el Worker de Cloudflare en /api/contacto) ---
  const form = $('form-contacto');
  const inicioForm = Date.now();
  const estado = (texto, tipo) => { $('form-estado').textContent = texto; $('form-estado').className = 'form-estado ' + (tipo || ''); };

  // Verificación anti-robots de Cloudflare (Turnstile): se carga al acercarse al formulario
  let widgetTurnstile = null;
  window.alCargarTurnstile = () => {
    widgetTurnstile = window.turnstile.render('#turnstile', {
      sitekey: '0x4AAAAAAFD7TwWAT_sc5wRe', theme: 'dark', language: 'es',
    });
  };
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=alCargarTurnstile';
    s.async = true;
    document.head.append(s);
  }, { rootMargin: '400px' }).observe(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form));
    if (datos.nombre.trim().length < 2 || datos.contacto.trim().length < 6 || datos.mensaje.trim().length < 5) {
      estado('Completá tu nombre, un WhatsApp o email y el mensaje.', 'error');
      return;
    }
    datos.t = Date.now() - inicioForm;
    if (widgetTurnstile !== null) {
      datos.token = window.turnstile.getResponse(widgetTurnstile);
      if (!datos.token) { estado('Esperá un segundo a que se complete la verificación de abajo.', 'error'); return; }
    }
    const boton = form.querySelector('button');
    boton.disabled = true;
    estado('Enviando…');
    try {
      const r = await fetch('/api/contacto', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(datos) });
      if (r.status === 403) { estado('No pudimos verificar que no seas un robot. Probá de nuevo en unos segundos.', 'error'); return; }
      if (!r.ok) throw new Error(r.status);
      form.reset();
      estado('¡Listo! Recibí tu mensaje, te respondo a la brevedad.', 'ok');
    } catch {
      estado('No se pudo enviar. Probá de nuevo o escribime por WhatsApp.', 'error');
    } finally {
      boton.disabled = false;
      // Cada verificación sirve para un solo envío
      if (widgetTurnstile !== null) window.turnstile.reset(widgetTurnstile);
    }
  });

  $('anio').textContent = new Date().getFullYear();
})();

// Barra de navegación: transparente arriba, esmerilada al hacer scroll
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const actualizar = () => nav.classList.toggle('con-fondo', window.scrollY > 8);
  window.addEventListener('scroll', actualizar, { passive: true });
  window.addEventListener('load', actualizar);
  window.addEventListener('hashchange', actualizar);
  actualizar();
})();

// Robots que asoman por detrás de un botón y saludan ("Robot Wave" de Irby Pace y
// "AI bot" de Trình, LottieFiles). La librería se descarga solo si hace falta.
function robotQueAsoma(caja, terminado) {
  if (!caja) return;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js';
  s.onload = async () => {
    const cargar = async (el) => {
      const url = el.dataset.anim;
      const datos = await (await fetch(url)).json();
      const anim = window.lottie.loadAnimation({
        container: el, renderer: 'svg', loop: true, autoplay: false,
        animationData: datos, assetsPath: url.slice(0, url.lastIndexOf('/') + 1),
      });
      await new Promise((ok) => anim.addEventListener('DOMLoaded', ok));
      return anim;
    };
    let anims;
    try { anims = await Promise.all([...caja.querySelectorAll('.asoma-robot[data-anim]')].map(cargar)); } catch { return; }
    let arriba = false, bajar;
    const asomar = () => {
      if (arriba || terminado()) return;
      arriba = true;
      anims.forEach((a) => a.goToAndPlay(0, true));
      caja.classList.add('saluda');
      bajar = setTimeout(esconder, 5200); // dos saludos
    };
    const esconder = () => {
      clearTimeout(bajar);
      caja.classList.remove('saluda');
      setTimeout(() => { arriba = false; if (!caja.classList.contains('saluda')) anims.forEach((a) => a.pause()); }, 500);
    };
    caja.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') asomar(); });
    setTimeout(asomar, 1000);
    const ciclo = setInterval(() => {
      if (terminado()) { clearInterval(ciclo); anims.forEach((a) => a.destroy()); } else asomar();
    }, 9000);
  };
  document.head.append(s);
}
