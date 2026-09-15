"use strict";

/* ==========================================================================
   DRAGONES LITERARIOS — motor del juego de trivia (v2.0)
   Mejoras: barajado aleatorio de opciones, animaciones de daño, sonidos.
   ========================================================================== */

const FALLBACK_DATA = {
  niveles: [
    {
      id: "fantasia", nombre: "Dragón de Fantasía", glyph: "🐉", color: "#a5432c",
      preguntas: [
        { pregunta: "¿Quién escribió «El Hobbit»?", opciones: ["J.R.R. Tolkien", "C.S. Lewis", "J.K. Rowling", "George R.R. Martin"], correcta: 0 },
        { pregunta: "¿Cómo se llama el dragón de «El Hobbit»?", opciones: ["Fafnir", "Smaug", "Ancalagon", "Vermithrax"], correcta: 1 },
        { pregunta: "¿En qué libro aparece el león Aslan?", opciones: ["El Señor de los Anillos", "Las Crónicas de Narnia", "Harry Potter", "La Rueda del Tiempo"], correcta: 1 }
      ]
    }
  ]
};

const state = {
  data: null,
  nivelActual: 0,
  escamas: 3,
  pergaminos: 3,
  preguntaActual: null,
  opcionesBarajadas: [],
  indiceCorrectoBarajado: -1,
  preguntasUsadas: [],
  respondiendo: false,
  sonidoActivo: true
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ---------------------------------------------------------------------------
// Audio (generado con Web Audio API, sin archivos externos)
// ---------------------------------------------------------------------------
let audioCtx = null;
function playSound(type) {
  if (!state.sonidoActivo) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === "acierto") {
      osc.type = "square";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === "fallo") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now); osc.stop(now + 0.35);
    } else if (type === "victoria") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.15);
      osc.frequency.setValueAtTime(784, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now); osc.stop(now + 0.6);
    }
  } catch (e) { /* silencio si falla audio */ }
}

// ---------------------------------------------------------------------------
// Carga de datos
// ---------------------------------------------------------------------------
async function loadData() {
  try {
    const res = await fetch("preguntas.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    if (!json.niveles || !json.niveles.length) throw new Error("JSON vacío");
    return json;
  } catch (err) {
    console.warn("No se pudo cargar preguntas.json, usando datos incorporados:", err.message);
    return FALLBACK_DATA;
  }
}

function nivelActual() { return state.data.niveles[state.nivelActual]; }
function totalNiveles() { return state.data.niveles.length; }

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------
async function init() {
  state.data = await loadData();
  $("#btn-comenzar").addEventListener("click", comenzarJuego);

  // Botón de sonido
  const btnSonido = $("#btn-sonido");
  if (btnSonido) {
    btnSonido.addEventListener("click", () => {
      state.sonidoActivo = !state.sonidoActivo;
      btnSonido.textContent = state.sonidoActivo ? "🔊" : "🔇";
      btnSonido.classList.toggle("muted", !state.sonidoActivo);
    });
  }
}

function setView(view) {
  $$("section.view").forEach((s) => s.classList.toggle("active", s.id === "view-" + view));
}

// ---------------------------------------------------------------------------
// Flujo del juego
// ---------------------------------------------------------------------------
function comenzarJuego() {
  state.nivelActual = 0;
  iniciarNivel();
  setView("juego");
}

function iniciarNivel() {
  state.escamas = 3;
  state.pergaminos = 3;
  state.preguntasUsadas = [];
  state.preguntaActual = null;
  state.respondiendo = false;

  $("#end-panel").innerHTML = "";
  $("#feedback").textContent = "";
  $("#feedback").className = "feedback";

  renderDragonPanel();
  renderJugadorPanel();
  siguientePregunta();
}

function renderDragonPanel() {
  const nivel = nivelActual();
  const dragonGlyph = $("#dragon-glyph");
  dragonGlyph.textContent = nivel.glyph;
  $("#dragon-name").textContent = nivel.nombre;
  $("#dragon-genre").textContent = `Nivel ${state.nivelActual + 1} de ${totalNiveles()}`;

  // El dragón cambia de expresión según sus escamas
  if (state.escamas <= 0) dragonGlyph.textContent = "💀";
  else if (state.escamas === 1) dragonGlyph.textContent = "😡";
  else if (state.escamas === 2) dragonGlyph.textContent = "😠";
  else dragonGlyph.textContent = nivel.glyph;

  const escamasEl = $("#escamas");
  escamasEl.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const span = document.createElement("span");
    span.className = "escama" + (i < (3 - state.escamas) ? " perdida" : "");
    span.textContent = "🛡️";
    escamasEl.appendChild(span);
  }
}

function renderJugadorPanel() {
  const pergEl = $("#pergaminos");
  pergEl.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const span = document.createElement("span");
    span.className = "pergamino" + (i < (3 - state.pergaminos) ? " perdido" : "");
    span.textContent = "📜";
    pergEl.appendChild(span);
  }
  $("#progreso").textContent = `Nivel ${state.nivelActual + 1} / ${totalNiveles()}`;
}

// ---------------------------------------------------------------------------
// Barajado aleatorio de opciones
// ---------------------------------------------------------------------------
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function siguientePregunta() {
  const nivel = nivelActual();
  const total = nivel.preguntas.length;
  if (state.preguntasUsadas.length >= total) return;

  let idx;
  do { idx = Math.floor(Math.random() * total); }
  while (state.preguntasUsadas.includes(idx));
  state.preguntasUsadas.push(idx);

  state.preguntaActual = nivel.preguntas[idx];

  // Barajar opciones y recalcular cuál es la correcta
  const originales = state.preguntaActual.opciones;
  const correctaTexto = originales[state.preguntaActual.correcta];
  const barajadas = shuffleArray(originales);
  state.opcionesBarajadas = barajadas;
  state.indiceCorrectoBarajado = barajadas.indexOf(correctaTexto);

  state.respondiendo = false;
  renderPregunta();
}

function renderPregunta() {
  const p = state.preguntaActual;
  $("#pregunta-texto").textContent = p.pregunta;

  const cont = $("#opciones");
  cont.innerHTML = "";
  state.opcionesBarajadas.forEach((texto, i) => {
    const btn = document.createElement("button");
    btn.className = "opcion";
    btn.textContent = texto;
    btn.addEventListener("click", () => responder(i, btn));
    cont.appendChild(btn);
  });
}

// ---------------------------------------------------------------------------
// Responder
// ---------------------------------------------------------------------------
async function responder(indiceElegido, btnElegido) {
  if (state.respondiendo) return;
  state.respondiendo = true;

  const acierto = indiceElegido === state.indiceCorrectoBarajado;

  const botones = $$("#opciones .opcion");
  botones.forEach((b, i) => {
    b.disabled = true;
    if (i === state.indiceCorrectoBarajado) b.classList.add("correcta");
    else if (i === indiceElegido) b.classList.add("incorrecta");
  });

  if (acierto) {
    state.escamas--;
    playSound("acierto");
    shakeDragon();
    spawnFloater("-1 🛡️");
    $("#feedback").textContent = "¡Correcto! El dragón pierde una escama.";
    $("#feedback").className = "feedback acierto";
    renderDragonPanel();
  } else {
    state.pergaminos--;
    playSound("fallo");
    shakeScreen();
    $("#feedback").textContent = "Incorrecto. Pierdes un pergamino.";
    $("#feedback").className = "feedback fallo";
    renderJugadorPanel();
  }

  await sleep(1400);

  if (state.escamas <= 0) {
    playSound("victoria");
    nivelSuperado();
    return;
  }
  if (state.pergaminos <= 0) {
    derrota();
    return;
  }

  $("#feedback").textContent = "";
  $("#feedback").className = "feedback";
  siguientePregunta();
}

// ---------------------------------------------------------------------------
// Efectos visuales
// ---------------------------------------------------------------------------
function shakeDragon() {
  const panel = $("#dragon-panel");
  if (!panel) return;
  panel.classList.remove("shake-dragon");
  void panel.offsetWidth;
  panel.classList.add("shake-dragon");
}

function shakeScreen() {
  const arena = $(".arena");
  if (!arena) return;
  arena.classList.remove("shake-screen");
  void arena.offsetWidth;
  arena.classList.add("shake-screen");
}

function spawnFloater(texto) {
  const panel = $("#dragon-panel");
  if (!panel) return;
  const f = document.createElement("div");
  f.className = "floater-damage";
  f.textContent = texto;
  panel.appendChild(f);
  setTimeout(() => f.remove(), 1100);
}

// ---------------------------------------------------------------------------
// Fin de nivel / derrota / victoria
// ---------------------------------------------------------------------------
function nivelSuperado() {
  const nivel = nivelActual();
  const esUltimo = state.nivelActual >= totalNiveles() - 1;

  if (esUltimo) { victoriaFinal(); return; }

  $("#pregunta-texto").textContent = "";
  $("#opciones").innerHTML = "";
  $("#feedback").textContent = "";
  $("#end-panel").innerHTML = `
    <div class="end-banner">🏆 ¡Has derrotado al ${nivel.nombre}!</div>
    <button class="primary-btn" id="btn-siguiente-nivel">Avanzar al siguiente nivel</button>
  `;
  $("#btn-siguiente-nivel").addEventListener("click", () => {
    state.nivelActual++;
    iniciarNivel();
  });
}

function derrota() {
  $("#pregunta-texto").textContent = "";
  $("#opciones").innerHTML = "";
  $("#feedback").textContent = "";
  $("#end-panel").innerHTML = `
    <div class="end-banner">💀 Has perdido todos tus pergaminos.</div>
    <p class="lede">El ${nivelActual().nombre} te ha vencido. Pero la Biblioteca te permite intentarlo de nuevo.</p>
    <button class="primary-btn" id="btn-reintentar">Reintentar nivel</button>
    <button class="ghost-btn" id="btn-reiniciar">Volver al inicio</button>
  `;
  $("#btn-reintentar").addEventListener("click", iniciarNivel);
  $("#btn-reiniciar").addEventListener("click", () => setView("inicio"));
}

function victoriaFinal() {
  $("#pregunta-texto").textContent = "";
  $("#opciones").innerHTML = "";
  $("#feedback").textContent = "";
  $("#end-panel").innerHTML = `
    <div class="end-banner">🌟 ¡VICTORIA SUPREMA! 🌟</div>
    <p class="lede">Has derrotado a todos los dragones, incluido el Dragón Cósmico. La Biblioteca Prohibida te reconoce como su Guardián Supremo.</p>
    <button class="primary-btn" id="btn-reiniciar-final">Volver a jugar desde el principio</button>
  `;
  $("#btn-reiniciar-final").addEventListener("click", () => {
    state.nivelActual = 0;
    setView("inicio");
  });
}

window.addEventListener("DOMContentLoaded", init);