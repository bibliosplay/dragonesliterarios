"use strict";

/* ==========================================================================
   DRAGONES LITERARIOS — motor del juego de trivia
   Los datos (niveles, dragones, preguntas) viven en preguntas.json.
   Añadir un nuevo dragón o preguntas NO requiere tocar este archivo.
   ========================================================================== */

// ---- datos de respaldo por si preguntas.json no carga (file:// en algunos navegadores) ----
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

// ---------------------------------------------------------------------------
// estado global
// ---------------------------------------------------------------------------
const state = {
  data: null,
  nivelActual: 0,
  escamas: 3,
  pergaminos: 3,
  preguntaActual: null,
  preguntasUsadas: [], // índices de preguntas ya hechas en este nivel
  respondiendo: false,
  victoriaTotal: false
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ---------------------------------------------------------------------------
// carga de datos
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

function nivelActual() {
  return state.data.niveles[state.nivelActual];
}

function totalNiveles() {
  return state.data.niveles.length;
}

// ---------------------------------------------------------------------------
// arranque
// ---------------------------------------------------------------------------
async function init() {
  state.data = await loadData();
  $("#btn-comenzar").addEventListener("click", comenzarJuego);
}

function setView(view) {
  $$("section.view").forEach((s) => s.classList.toggle("active", s.id === "view-" + view));
}

// ---------------------------------------------------------------------------
// flujo del juego
// ---------------------------------------------------------------------------
function comenzarJuego() {
  state.nivelActual = 0;
  state.victoriaTotal = false;
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
  $("#dragon-glyph").textContent = nivel.glyph;
  $("#dragon-name").textContent = nivel.nombre;
  $("#dragon-genre").textContent = `Nivel ${state.nivelActual + 1} de ${totalNiveles()}`;

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

function siguientePregunta() {
  const nivel = nivelActual();
  const total = nivel.preguntas.length;
  if (state.preguntasUsadas.length >= total) {
    // No debería pasar: el nivel se gana antes. Pero por seguridad:
    return;
  }
  let idx;
  do {
    idx = Math.floor(Math.random() * total);
  } while (state.preguntasUsadas.includes(idx));
  state.preguntasUsadas.push(idx);

  state.preguntaActual = nivel.preguntas[idx];
  state.respondiendo = false;
  renderPregunta();
}

function renderPregunta() {
  const p = state.preguntaActual;
  $("#pregunta-texto").textContent = p.pregunta;

  const cont = $("#opciones");
  cont.innerHTML = "";
  p.opciones.forEach((texto, i) => {
    const btn = document.createElement("button");
    btn.className = "opcion";
    btn.textContent = texto;
    btn.addEventListener("click", () => responder(i, btn));
    cont.appendChild(btn);
  });
}

async function responder(indiceElegido, btnElegido) {
  if (state.respondiendo) return;
  state.respondiendo = true;

  const p = state.preguntaActual;
  const acierto = indiceElegido === p.correcta;

  // Marcar visualmente
  const botones = $$("#opciones .opcion");
  botones.forEach((b, i) => {
    b.disabled = true;
    if (i === p.correcta) b.classList.add("correcta");
    else if (i === indiceElegido) b.classList.add("incorrecta");
  });

  if (acierto) {
    state.escamas--;
    $("#feedback").textContent = "¡Correcto! El dragón pierde una escama.";
    $("#feedback").className = "feedback acierto";
    renderDragonPanel();
  } else {
    state.pergaminos--;
    $("#feedback").textContent = "Incorrecto. Pierdes un pergamino.";
    $("#feedback").className = "feedback fallo";
    renderJugadorPanel();
  }

  await sleep(1400);

  // Comprobar fin de nivel o derrota
  if (state.escamas <= 0) {
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

function nivelSuperado() {
  const nivel = nivelActual();
  const esUltimo = state.nivelActual >= totalNiveles() - 1;

  if (esUltimo) {
    victoriaFinal();
    return;
  }

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

// ---------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", init);