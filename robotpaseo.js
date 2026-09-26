// Robot amarillo que cruza la pantalla, se para en el medio a saludar y sigue de largo.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js/+esm';

// activo(): si devuelve false (fuera de pantalla) no se dibuja, para ahorrar batería
export function iniciarPaseo(contenedor, activo) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  contenedor.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  const luz = new THREE.DirectionalLight(0xffffff, 0.8);
  luz.position.set(-2, 3, 4);
  scene.add(luz);

  // Cámara ortográfica: 1 unidad = 100 px, así el robot mide lo mismo en PC y en celular
  const PX = 100;
  const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
  let anchoU = 4;
  function encuadrar() {
    const { clientWidth: w, clientHeight: h } = contenedor;
    renderer.setSize(w, h, false);
    anchoU = w / PX;
    const altoU = h / PX;
    camara.left = -anchoU / 2; camara.right = anchoU / 2;
    camara.top = altoU / 2; camara.bottom = -altoU / 2;
    // Piso cerca del borde de abajo, mirando apenas desde arriba para que se vea la sombra
    const centro = altoU / 2 - 0.12;
    camara.position.set(0, centro + 1.5, 10);
    camara.lookAt(0, centro, 0);
    camara.updateProjectionMatrix();
  }
  addEventListener('resize', encuadrar);

  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.45)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.9),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })
  );
  sombra.rotation.x = -Math.PI / 2;

  const personaje = new THREE.Group();
  personaje.add(sombra);
  scene.add(personaje);

  let mixer = null;
  const acciones = {};
  let actuales = [];
  let estadoActual = '';
  function poner(...nombres) {
    const nuevas = nombres.map((n) => acciones[n]);
    for (const a of actuales) if (!nuevas.includes(a)) a.fadeOut(0.25);
    for (const a of nuevas) if (!actuales.includes(a)) a.reset().fadeIn(0.25).play();
    actuales = nuevas;
  }

  new GLTFLoader().load('models/robot-expresivo.glb', (gltf) => {
    const modelo = gltf.scene;
    modelo.scale.setScalar(0.28); // unos 125 px de alto
    personaje.add(modelo);
    mixer = new THREE.AnimationMixer(modelo);
    const clip = (nombre) => gltf.animations.find((a) => a.name === nombre);
    acciones.caminar = mixer.clipAction(clip('Walking'));
    acciones.quieto = mixer.clipAction(clip('Idle'));
    acciones.saludo = mixer.clipAction(clip('Wave'));
    encuadrar();
    contenedor.classList.add('listo');
    requestAnimationFrame(animar);
  });

  // Recorrido: entra por la izquierda, saluda en el medio, sale por la derecha y espera
  const VEL = 1.1;           // unidades por segundo (110 px/s)
  const GIRO = 0.45, SALUDO = 3.6, ESPERA = 3;
  const suave = (t) => t * t * (3 - 2 * t);
  function recorrido(t) {
    const borde = anchoU / 2 + 0.8;
    const tramo = borde / VEL;
    const ciclo = tramo + GIRO + SALUDO + GIRO + tramo + ESPERA;
    let r = t % ciclo;
    if (r < tramo) return { x: -borde + VEL * r, mirada: Math.PI / 2, estado: 'caminar' };
    r -= tramo;
    if (r < GIRO) return { x: 0, mirada: Math.PI / 2 * (1 - suave(r / GIRO)), estado: 'quieto' };
    r -= GIRO;
    if (r < SALUDO) return { x: 0, mirada: 0, estado: 'saludo' };
    r -= SALUDO;
    if (r < GIRO) return { x: 0, mirada: Math.PI / 2 * suave(r / GIRO), estado: 'quieto' };
    r -= GIRO;
    if (r < tramo) return { x: VEL * r, mirada: Math.PI / 2, estado: 'caminar' };
    return { x: borde, mirada: Math.PI / 2, estado: 'quieto' };
  }

  const reloj = new THREE.Clock();
  let tiempo = 0;
  function animar() {
    requestAnimationFrame(animar);
    const dt = Math.min(reloj.getDelta(), 0.1);
    if (!activo()) return; // fuera de pantalla queda en pausa y retoma donde estaba
    tiempo += dt;
    const { x, mirada, estado } = recorrido(tiempo);
    personaje.position.x = x;
    personaje.rotation.y = mirada;
    if (estado !== estadoActual) { estadoActual = estado; poner(estado); }
    mixer.update(dt);
    renderer.render(scene, camara);
  }
}
