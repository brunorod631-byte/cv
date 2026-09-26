// Sillón 3D de la bienvenida: gira, se desarma y una barrida de luz lo pasa de malla a real.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js/+esm';

// seguir(): mientras devuelva true se sigue dibujando; al cerrarse la bienvenida se libera todo
export function iniciarSillon(contenedor, etapa, seguir) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;
  contenedor.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const luz = new THREE.DirectionalLight(0xffffff, 1.2);
  luz.position.set(-2, 3, 2);
  scene.add(luz);

  const camara = new THREE.PerspectiveCamera(30, 1, 0.01, 50);

  function degradeRadial(interior, exterior) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, interior); grad.addColorStop(1, exterior);
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: degradeRadial('rgba(0,0,0,0.55)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false })
  );
  sombra.rotation.x = -Math.PI / 2;
  scene.add(sombra);

  // Planos de corte: la parte real queda debajo de "altura", la malla arriba
  const corteReal = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const corteMalla = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  // Anillo de luz que marca el frente de la barrida
  const anillo = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: degradeRadial('rgba(120,135,255,0.55)', 'rgba(82,102,235,0)'),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    })
  );
  anillo.rotation.x = -Math.PI / 2;
  scene.add(anillo);

  const giro = new THREE.Group();
  scene.add(giro);

  // Corta una malla en sus partes sueltas (grupos de triángulos conectados)
  function separar(geo) {
    const pos = geo.attributes.position;
    const idx = geo.index ? geo.index.array : [...Array(pos.count).keys()];
    // Soldar vértices en la misma posición (las costuras de UV los duplican)
    const soldado = new Int32Array(pos.count);
    const vistos = new Map();
    for (let i = 0; i < pos.count; i++) {
      const k = Math.round(pos.getX(i) * 1e4) + ',' + Math.round(pos.getY(i) * 1e4) + ',' + Math.round(pos.getZ(i) * 1e4);
      if (!vistos.has(k)) vistos.set(k, vistos.size);
      soldado[i] = vistos.get(k);
    }
    const padre = new Int32Array(vistos.size).map((_, i) => i);
    const raiz = (a) => { while (padre[a] !== a) a = padre[a] = padre[padre[a]]; return a; };
    for (let t = 0; t < idx.length; t += 3) {
      const a = raiz(soldado[idx[t]]);
      padre[raiz(soldado[idx[t + 1]])] = a;
      padre[raiz(soldado[idx[t + 2]])] = raiz(a);
    }
    const grupos = new Map();
    for (let t = 0; t < idx.length; t += 3) {
      const r = raiz(soldado[idx[t]]);
      if (!grupos.has(r)) grupos.set(r, []);
      grupos.get(r).push(idx[t], idx[t + 1], idx[t + 2]);
    }
    return [...grupos.values()].map((tri) => {
      const nuevo = new Map();
      const orden = [];
      const indices = tri.map((v) => {
        if (!nuevo.has(v)) { nuevo.set(v, orden.length); orden.push(v); }
        return nuevo.get(v);
      });
      const parte = new THREE.BufferGeometry();
      for (const [nombre, attr] of Object.entries(geo.attributes)) {
        const n = attr.itemSize;
        const arr = new attr.array.constructor(orden.length * n);
        orden.forEach((v, i) => { for (let c = 0; c < n; c++) arr[i * n + c] = attr.getComponent(v, c); });
        parte.setAttribute(nombre, new THREE.BufferAttribute(arr, n, attr.normalized));
      }
      parte.setIndex(indices);
      return parte;
    });
  }

  const malla = new THREE.MeshBasicMaterial({ color: 0x5266eb, wireframe: true, transparent: true, opacity: 0.55, depthWrite: false, clippingPlanes: [corteMalla] });
  const piezas = [];

  new GLTFLoader().load('models/sillon.glb', (gltf) => {
    const modelo = gltf.scene;
    // Normalizar: 1 unidad de alto, centrado, apoyado en el piso
    const caja = new THREE.Box3().setFromObject(modelo);
    const tam = caja.getSize(new THREE.Vector3());
    const escala = 1 / tam.y;
    modelo.scale.setScalar(escala);
    const centro = caja.getCenter(new THREE.Vector3()).multiplyScalar(escala);
    modelo.position.set(-centro.x, -caja.min.y * escala, -centro.z);
    modelo.updateMatrixWorld(true);

    const centroSillon = new THREE.Vector3(0, 0.45, 0);
    const originales = [];
    modelo.traverse((o) => { if (o.isMesh) originales.push(o); });
    for (const o of originales) {
      o.material = o.material.clone();
      o.material.clippingPlanes = [corteReal];
      for (const geo of separar(o.geometry)) {
        geo.applyMatrix4(o.matrixWorld);
        geo.computeBoundingBox();
        const c = geo.boundingBox.getCenter(new THREE.Vector3());
        geo.translate(-c.x, -c.y, -c.z);
        const pieza = new THREE.Mesh(geo, o.material);
        pieza.add(new THREE.Mesh(geo, malla));
        pieza.position.copy(c);
        // Hacia dónde sale: desde el centro del sillón, un poco hacia arriba
        const dir = c.clone().sub(centroSillon);
        if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
        dir.normalize(); dir.y += 0.15;
        pieza.userData = {
          casa: c.clone(),
          fuera: c.clone().add(dir.multiplyScalar(0.3 + Math.random() * 0.2)),
          eje: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
          angulo: (Math.random() - 0.5) * 0.9,
          demora: (1 - c.y) * 0.35 + Math.random() * 0.15,
        };
        giro.add(pieza);
        piezas.push(pieza);
      }
    }

    const ancho = Math.max(tam.x, tam.z) * escala;
    sombra.scale.setScalar(ancho * 1.6);
    anillo.scale.setScalar(ancho * 1.3);
    encuadrar(ancho);
    contenedor.classList.add('listo');
    requestAnimationFrame(animar);
  });

  function encuadrar(ancho = 1) {
    const { clientWidth: w, clientHeight: h } = contenedor;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    // Con aire alrededor: las piezas salen hacia afuera al desarmarse
    const tamano = Math.max(1.15, ancho / camara.aspect) * (camara.aspect > 1.1 ? 1.7 : 2.2);
    const d = tamano / (2 * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)));
    camara.position.set(0, 0.55 + d * 0.25, d);
    camara.lookAt(0, 0.5, 0);
    camara.updateProjectionMatrix();
    encuadrar.ancho = ancho;
  }
  const alRedimensionar = () => encuadrar(encuadrar.ancho);
  addEventListener('resize', alRedimensionar);

  // Ciclo de 13 s: real → la luz lo baja a malla → se desarma → se arma como malla → la luz lo sube a real
  const CICLO = 13;
  const suave = (t) => t * t * (3 - 2 * t);
  const tramo = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const q = new THREE.Quaternion();

  // 1 = todo real, 0 = todo malla
  function nivel(t) {
    if (t < 1.8) return 1;
    if (t < 3.4) return 1 - suave(tramo(t, 1.8, 3.4));
    if (t < 9) return 0;
    return suave(tramo(t, 9, 11.2));
  }

  const reloj = new THREE.Clock();
  function animar() {
    if (!seguir()) {
      removeEventListener('resize', alRedimensionar);
      renderer.dispose();
      renderer.domElement.remove();
      return;
    }
    const tiempo = reloj.getElapsedTime();
    const t = tiempo % CICLO;
    giro.rotation.y = tiempo * 0.4;

    let abierto = 0;
    for (const p of piezas) {
      const { casa, fuera, eje, angulo, demora } = p.userData;
      // Sale desde los 3 s y vuelve desde los 6.6 s, escalonado por altura
      const n = suave(tramo(t, 3 + demora, 4.6 + demora)) - suave(tramo(t, 6.6 + demora * 0.6, 8.2 + demora * 0.6));
      p.position.lerpVectors(casa, fuera, n);
      p.position.y += Math.sin(tiempo * 1.3 + demora * 20) * 0.012 * n;
      p.quaternion.copy(q.setFromAxisAngle(eje, angulo * n));
      abierto = Math.max(abierto, n);
    }

    const nv = nivel(t);
    const altura = nv * 1.15 - 0.05;
    corteReal.constant = altura;
    corteMalla.constant = -altura;
    anillo.position.y = altura;
    anillo.material.opacity = Math.min(1, Math.sin(Math.PI * nv) * 1.8);
    anillo.visible = nv > 0 && nv < 1;

    const texto = abierto > 0.5 ? 'Cada pieza, en 3D' : nv > 0.5 ? 'Así lo recibe tu cliente' : 'Modelo 3D';
    if (etapa.textContent !== texto) etapa.textContent = texto;

    renderer.render(scene, camara);
    requestAnimationFrame(animar);
  }
}
