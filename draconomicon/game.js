"use strict";

/* ==========================================================================
   DRACONOMICON — motor del juego
   Un juego de estrategia por turnos con dragones de la literatura universal.
   Los datos (estadísticas, elementos, habilidades) viven en dragons.json,
   por lo que añadir un nuevo dragón no requiere tocar este archivo.
   ========================================================================== */

// ---- datos de respaldo, por si dragons.json no puede cargarse (p. ej. al
// abrir index.html directamente con doble clic en algunos navegadores) ----
  const FALLBACK_DATA = {
  elementCycle: { order: ["fuego", "tierra", "aire", "agua"], strongMultiplier: 1.4, weakMultiplier: 0.7, chaosOffense: 1.15, chaosDefense: 1.15 },
  elements: {
    fuego: { label: "Fuego", color: "#a5432c", glyph: "🜂" },
    agua: { label: "Agua", color: "#2d6e6e", glyph: "🜄" },
    tierra: { label: "Tierra", color: "#5c6b3a", glyph: "🜃" },
    aire: { label: "Aire", color: "#5b6f96", glyph: "🜁" },
    caos: { label: "Caos", color: "#6c4a8c", glyph: "☯" }
  },
  passives: {
    furia: { label: "Furia", description: "Su ataque aumenta un 25% mientras su vida esté por debajo del 50%." },
    resistencia: { label: "Piel de Piedra", description: "Reduce todo el daño recibido en un 15%." },
    regeneracion: { label: "Regeneración", description: "Recupera el 6% de su vida máxima al inicio de cada uno de sus turnos." },
    vampirismo: { label: "Sed de Vida", description: "Cura el 25% del daño que inflige con ataques y habilidades." },
    contraataque: { label: "Guardián", description: "30% de probabilidad de contraatacar tras recibir un golpe básico." },
    evasion: { label: "Vuelo Élusivo", description: "15% de probabilidad de esquivar por completo cualquier ataque." }
  },
  dragons: [
    { id: "smaug", name: "Smaug", title: "El Desolador de Valle", origin: "«El Hobbit», J. R. R. Tolkien", culture: "Literatura británica del siglo XX", element: "fuego", glyph: "🐉", description: "El último gran dragón de la Tierra Media, dormido sobre una montaña de oro robado bajo la Montaña Solitaria.", stats: { hp: 130, attack: 30, defense: 16, speed: 11 }, ability: { name: "Aliento de Erebor", description: "Una columna de fuego que funde el metal y deja el objetivo ardiendo.", power: 1.5, cooldown: 3, effect: { type: "quemadura", duration: 2, dmg: 10 } }, passive: "furia" },
    { id: "ddraig_goch", name: "Y Ddraig Goch", title: "El Dragón Rojo", origin: "«Mabinogion», relatos galeses medievales", culture: "Mitología celta / gales", element: "fuego", glyph: "🐲", description: "El dragón rojo que combate bajo tierra contra el dragón blanco invasor; hoy emblema de Gales.", stats: { hp: 122, attack: 27, defense: 19, speed: 13 }, ability: { name: "Rugido Escarlata", description: "Un bramido que incendia el terreno alrededor del enemigo.", power: 1.4, cooldown: 2, effect: { type: "quemadura", duration: 2, dmg: 8 } }, passive: "resistencia" },
    { id: "orochi", name: "Yamata no Orochi", title: "La Serpiente de Ocho Cabezas", origin: "«Kojiki», crónicas japonesas del siglo VIII", culture: "Mitología japonesa", element: "agua", glyph: "🐍", description: "Bestia de ocho cabezas y ocho colas que exigía doncellas en tributo, embriagada y vencida con sake.", stats: { hp: 138, attack: 24, defense: 15, speed: 9 }, ability: { name: "Embate de Ocho Cabezas", description: "Todas sus cabezas atacan a la vez, aturdiendo al rival.", power: 1.6, cooldown: 3, effect: { type: "aturdir", duration: 1 } }, passive: "regeneracion" },
    { id: "shenlong", name: "Shenlong", title: "El Dragón Divino de la Lluvia", origin: "Mitología y folclore imperial chino", culture: "Mitología china", element: "agua", glyph: "🌊", description: "Señor de las nubes y la lluvia, venerado por traer las cosechas y castigar la sequía.", stats: { hp: 115, attack: 22, defense: 20, speed: 14 }, ability: { name: "Lluvia Purificadora", description: "Invoca un aguacero sanador que restaura sus fuerzas.", power: 0, cooldown: 3, effect: { type: "curacion", amount: 30 } }, passive: "resistencia" },
    { id: "fafnir", name: "Fafnir", title: "El Guardián de la Codicia", origin: "«Saga Völsunga», Eddas nórdicas", culture: "Mitología nórdica", element: "tierra", glyph: "🐊", description: "Un enano transformado en dragón por su propia avaricia, custodio de un tesoro maldito.", stats: { hp: 125, attack: 26, defense: 22, speed: 8 }, ability: { name: "Aliento Letal", description: "Un vapor tóxico que corroe lentamente a quien lo respira.", power: 1.2, cooldown: 2, effect: { type: "veneno", duration: 3, dmg: 9 } }, passive: "vampirismo" },
    { id: "ladon", name: "Ladón", title: "El de las Cien Cabezas", origin: "Mitología griega (Hesíodo, Apolodoro)", culture: "Mitología griega", element: "tierra", glyph: "🐢", description: "Guardián incansable del jardín de las Hespérides y sus manzanas doradas.", stats: { hp: 128, attack: 23, defense: 24, speed: 10 }, ability: { name: "Guardia de Cien Ojos", description: "Nunca duerme del todo: alza sus escamas en una muralla imposible de romper.", power: 0, cooldown: 3, effect: { type: "escudo", duration: 2, reduction: 0.4 } }, passive: "contraataque" },
    { id: "quetzalcoatl", name: "Quetzalcóatl", title: "La Serpiente Emplumada", origin: "Tradición mesoamericana (náhuatl, maya)", culture: "Mitología mesoamericana", element: "aire", glyph: "🪶", description: "Dios-dragón del viento y el saber, mitad ave mitad serpiente, portador del conocimiento.", stats: { hp: 112, attack: 25, defense: 16, speed: 18 }, ability: { name: "Viento de Plumas Sagradas", description: "Una corriente que desestabiliza al rival y merma su fuerza.", power: 1.3, cooldown: 2, effect: { type: "debilitar", stat: "attack", duration: 2, amount: 0.25 } }, passive: "evasion" },
    { id: "vritra", name: "Vritra", title: "El que Retiene las Aguas", origin: "«Rig Veda», himnos védicos", culture: "Mitología hindú", element: "aire", glyph: "🐫", description: "Serpiente cósmica de la sequía, enemigo eterno de Indra, que aprisiona los ríos del cielo.", stats: { hp: 118, attack: 28, defense: 17, speed: 12 }, ability: { name: "Sequía Eterna", description: "Drena la humedad y la fuerza vital de su presa.", power: 1.4, cooldown: 3, effect: { type: "debilitar", stat: "defense", duration: 2, amount: 0.25 } }, passive: "vampirismo" },
    { id: "tiamat", name: "Tiamat", title: "La Madre del Caos", origin: "«Enuma Elish», poema babilónico", culture: "Mitología mesopotámica", element: "caos", glyph: "🐙", description: "Diosa primigenia del mar y el caos original, madre de monstruos y de los propios dioses.", stats: { hp: 120, attack: 32, defense: 14, speed: 15 }, ability: { name: "Caos Primigenio", description: "Libera la furia sin forma de la creación misma.", power: 1.7, cooldown: 3, effect: { type: "aturdir", duration: 1 } }, passive: "furia" },
    { id: "nidhogg", name: "Nidhogg", title: "El Roedor de Raíces", origin: "«Edda poética», tradición nórdica", culture: "Mitología nórdica", element: "caos", glyph: "💀", description: "Devorador de cadáveres que roe sin descanso las raíces del fresno Yggdrasil.", stats: { hp: 116, attack: 27, defense: 15, speed: 16 }, ability: { name: "Roer las Raíces", description: "Muerde los cimientos vitales del enemigo, pudriéndolo por dentro.", power: 1.3, cooldown: 2, effect: { type: "veneno", duration: 3, dmg: 10 } }, passive: "evasion" }
  ]
};

const SELF_TARGET_EFFECTS = ["curacion", "escudo"];

// ---------------------------------------------------------------------------
// estado global
// ---------------------------------------------------------------------------
const state = {
  data: null,
  view: "bestiary",
  teamSelection: [],   // ids elegidos por el jugador (máx 3)
  battle: null         // objeto de batalla en curso
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ---------------------------------------------------------------------------
// carga de datos
// ---------------------------------------------------------------------------
async function loadData() {
  try {
    const res = await fetch("dragons.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    if (!json.dragons || !json.dragons.length) throw new Error("JSON vacío");
    const ids = json.dragons.map((d) => d.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) {
      console.warn("IDs duplicados en dragons.json:", [...new Set(dupes)]);
      throw new Error("IDs duplicados");
    }
    return json;
  } catch (err) {
    console.warn("No se pudo cargar dragons.json, usando datos incorporados:", err.message);
    return FALLBACK_DATA;
  }
}

function dragonById(id) {
  return state.data.dragons.find((d) => d.id === id);
}

// ---------------------------------------------------------------------------
// utilidades de combate
// ---------------------------------------------------------------------------
function elementMultiplier(atkElement, defElement) {
  const cycle = state.data.elementCycle;
  let mult = 1;
  if (atkElement === "caos") mult *= cycle.chaosOffense;
  if (defElement === "caos") mult *= cycle.chaosDefense;
  if (atkElement !== "caos" && defElement !== "caos") {
    const order = cycle.order;
    const ai = order.indexOf(atkElement);
    const di = order.indexOf(defElement);
    if (ai >= 0 && di >= 0) {
      if (order[(ai + 1) % order.length] === defElement) mult *= cycle.strongMultiplier;
      else if (order[(di + 1) % order.length] === atkElement) mult *= cycle.weakMultiplier;
    }
  }
  return mult;
}

function makeUnit(template, side) {
  return {
    id: template.id,
    side,
    template,
    name: template.name,
    glyph: template.glyph,
    element: template.element,
    hp: template.stats.hp,
    maxHp: template.stats.hp,
    baseAtk: template.stats.attack,
    baseDef: template.stats.defense,
    baseSpd: template.stats.speed,
    abilityCooldown: 0,
    statuses: {}, // { burn:{dmg,duration}, poison:{dmg,duration}, stun:{duration}, weakenAttack:{amount,duration}, weakenDefense:{amount,duration}, shield:{reduction,duration} }
    alive: true
  };
}

function effectiveAtk(u) {
  let v = u.baseAtk;
  if (u.statuses.weakenAttack) v *= (1 - u.statuses.weakenAttack.amount);
  if (u.template.passive === "furia" && u.hp / u.maxHp <= 0.5) v *= 1.25;
  return v;
}

function effectiveDef(u) {
  let v = u.baseDef;
  if (u.statuses.weakenDefense) v *= (1 - u.statuses.weakenDefense.amount);
  return v;
}

function effectiveSpd(u) {
  return u.baseSpd;
}

// calcula daño de un golpe. devuelve {dmg, crit, evaded}
function computeDamage(attacker, defender, power) {
  if (defender.template.passive === "evasion" && Math.random() < 0.15) {
    return { dmg: 0, crit: false, evaded: true };
  }
  const base = effectiveAtk(attacker) * power;
  const mult = elementMultiplier(attacker.element, defender.element);
  const variance = 0.9 + Math.random() * 0.2;
  let raw = base * mult * variance;
  const mitigated = raw * (100 / (100 + effectiveDef(defender) * 1.3));
  let dmg = Math.max(4, Math.round(mitigated));

  const crit = Math.random() < 0.1;
  if (crit) dmg = Math.round(dmg * 1.5);

  if (defender.template.passive === "resistencia") dmg = Math.round(dmg * 0.85);
  if (defender.statuses.shield) dmg = Math.round(dmg * (1 - defender.statuses.shield.reduction));

  return { dmg: Math.max(1, dmg), crit, evaded: false };
}

function applyDamage(unit, dmg) {
  unit.hp = Math.max(0, unit.hp - dmg);
  if (unit.hp === 0) unit.alive = false;
}

function heal(unit, amount) {
  unit.hp = Math.min(unit.maxHp, unit.hp + Math.round(amount));
}

// ---------------------------------------------------------------------------
// arranque
// ---------------------------------------------------------------------------
async function init() {
  state.data = await loadData();
  renderBestiary();
  renderTeamBuilder();
  wireTabs();
  setView("bestiary");
}

function wireTabs() {
  $$("nav.tabs button").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });
}

function setView(view) {
  if (state.battle && state.battle.inProgress && view !== "battle") return; // no abandonar la batalla a medias
  state.view = view;
  $$("nav.tabs button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  $$("section.view").forEach((s) => s.classList.toggle("active", s.id === "view-" + view));
}

// ---------------------------------------------------------------------------
// bestiario (solo lectura)
// ---------------------------------------------------------------------------
function dragonCardHTML(d, opts = {}) {
  const el = state.data.elements[d.element];
  const pas = state.data.passives[d.passive];
  return `
    <div class="card-top">
      <div class="card-glyph">${d.glyph}</div>
      <div>
        <div class="card-name">${d.name}</div>
        <div class="card-title">${d.title}</div>
      </div>
    </div>
    <span class="chip" style="border-color:${el.color}; color:${el.color}">${el.glyph} ${el.label}</span>
    <div class="card-origin">${d.origin}</div>
    ${opts.showDesc !== false ? `<div class="card-desc">${d.description}</div>` : ""}
    <div class="stat-row">
      <span>PV <b>${d.stats.hp}</b></span>
      <span>ATQ <b>${d.stats.attack}</b></span>
      <span>DEF <b>${d.stats.defense}</b></span>
      <span>VEL <b>${d.stats.speed}</b></span>
    </div>
    <div class="ability-line"><b>${d.ability.name}</b> · enfría ${d.ability.cooldown} turnos<br>${d.ability.description}</div>
    <div class="ability-line"><b>${pas.label}</b> — ${pas.description}</div>
  `;
}

function renderBestiary() {
  const grid = $("#bestiary-grid");
  grid.innerHTML = "";
  state.data.dragons.forEach((d) => {
    const card = document.createElement("div");
    card.className = "dragon-card";
    card.innerHTML = dragonCardHTML(d);
    grid.appendChild(card);
  });
}

// ---------------------------------------------------------------------------
// selector de equipo
// ---------------------------------------------------------------------------
function renderTeamBuilder() {
  const grid = $("#team-grid");
  grid.innerHTML = "";
  state.data.dragons.forEach((d) => {
    const card = document.createElement("div");
    card.className = "dragon-card";
    card.tabIndex = 0;
    card.innerHTML = dragonCardHTML(d, { showDesc: false });
    card.addEventListener("click", () => toggleTeamSelection(d.id, card));
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); } });
    grid.appendChild(card);
  });
  updateTeamStatus();
}

function toggleTeamSelection(id, cardEl) {
  const sel = state.teamSelection;
  const idx = sel.indexOf(id);
  if (idx >= 0) {
    sel.splice(idx, 1);
  } else {
    if (sel.length >= 3) return;
    sel.push(id);
  }
  syncTeamCardClasses();
  updateTeamStatus();
}

function syncTeamCardClasses() {
  $$("#team-grid .dragon-card").forEach((card, i) => {
    const d = state.data.dragons[i];
    const selected = state.teamSelection.includes(d.id);
    card.classList.toggle("selected", selected);
    card.classList.toggle("disabled", !selected && state.teamSelection.length >= 3);
  });
}

function updateTeamStatus() {
  const slots = $("#team-slots");
  slots.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const id = state.teamSelection[i];
    const slot = document.createElement("div");
    slot.className = "slot" + (id ? " filled" : "");
    slot.textContent = id ? dragonById(id).glyph : "?";
    slots.appendChild(slot);
  }
  $("#start-battle-btn").disabled = state.teamSelection.length !== 3;
  syncTeamCardClasses();
}

function randomAiTeam(excludeIds) {
  const pool = state.data.dragons.filter((d) => !excludeIds.includes(d.id));
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((d) => d.id);
}

// ---------------------------------------------------------------------------
// batalla
// ---------------------------------------------------------------------------
function logMsg(html) {
  const log = $("#battle-log");
  const p = document.createElement("p");
  p.innerHTML = html;
  log.prepend(p);
  while (log.children.length > 60) log.removeChild(log.lastChild);
}

function startBattle() {
  const playerIds = state.teamSelection.slice();
  const aiIds = randomAiTeam(playerIds);

  state.battle = {
    player: playerIds.map((id) => makeUnit(dragonById(id), "player")),
    ai: aiIds.map((id) => makeUnit(dragonById(id), "ai")),
    queue: [],
    qi: 0,
    inProgress: true,
    pendingResolve: null,
    pendingType: null // 'attack' | 'ability'
  };

  $("#battle-log").innerHTML = "";
  $$("nav.tabs button").forEach((b) => { if (b.dataset.view !== "battle") b.disabled = true; });
  setView("battle");
  renderBattleUnits();
  logMsg(`<span class="turn-of">¡Comienza la batalla!</span> Tu bando se enfrenta a ${state.battle.ai.map((u) => u.name).join(", ")}.`);
  runRound();
}

function allAlive(list) { return list.filter((u) => u.alive); }

function buildQueue() {
  const all = [...allAlive(state.battle.player), ...allAlive(state.battle.ai)];
  all.sort((a, b) => effectiveSpd(b) - effectiveSpd(a) + (Math.random() - 0.5) * 0.01);
  return all;
}

async function runRound() {
  const battle = state.battle;
  battle.queue = buildQueue();
  battle.qi = 0;

  for (; battle.qi < battle.queue.length; battle.qi++) {
    const unit = battle.queue[battle.qi];
    if (!unit.alive) continue;
    if (checkGameOver()) return;

    renderBattleUnits();
    await sleep(450);

    const skip = tickStartOfTurn(unit);
    renderBattleUnits();
    if (checkGameOver()) return;
    if (skip || !unit.alive) { await sleep(500); continue; }

    if (unit.side === "player") {
      await playerTurn(unit);
    } else {
      await sleep(500);
      await aiTurn(unit);
    }
    if (checkGameOver()) return;
  }

  if (!checkGameOver()) runRound();
}

function tickStartOfTurn(unit) {
  let skip = false;
  if (unit.abilityCooldown > 0) unit.abilityCooldown--;

  ["burn", "poison"].forEach((key) => {
    const s = unit.statuses[key];
    if (s) {
      applyDamage(unit, s.dmg);
      spawnFloater(unit, "-" + s.dmg, false);
      logMsg(`${unit.name} sufre ${s.dmg} de daño por ${key === "burn" ? "quemadura" : "veneno"}.`);
      s.duration--;
      if (s.duration <= 0) delete unit.statuses[key];
    }
  });

  if (unit.alive && unit.template.passive === "regeneracion") {
    const amt = Math.round(unit.maxHp * 0.06);
    heal(unit, amt);
    spawnFloater(unit, "+" + amt, true);
  }

  ["weakenAttack", "weakenDefense", "shield"].forEach((key) => {
    const s = unit.statuses[key];
    if (s) {
      s.duration--;
      if (s.duration <= 0) delete unit.statuses[key];
    }
  });

  if (unit.alive && unit.statuses.stun) {
    delete unit.statuses.stun;
    logMsg(`<b>${unit.name}</b> está aturdido y pierde su turno.`);
    skip = true;
  }
  return skip;
}

function opposingTeam(unit) {
  return state.battle[unit.side === "player" ? "ai" : "player"];
}

function playerTurn(unit) {
  return new Promise((resolve) => {
    state.battle.pendingResolve = resolve;
    renderActionBar(unit);
    renderBattleUnits();
  });
}

async function aiTurn(unit) {
  const enemies = allAlive(opposingTeam(unit));
  if (!enemies.length) return;
  const canUseAbility = unit.abilityCooldown === 0;
  const useAbility = canUseAbility && Math.random() < 0.6;

  if (useAbility && SELF_TARGET_EFFECTS.includes(unit.template.ability.effect.type)) {
    await resolveAbilitySelf(unit);
  } else {
    const target = enemies.reduce((low, u) => (u.hp / u.maxHp < low.hp / low.maxHp ? u : low), enemies[0]);
    if (useAbility) await resolveOffensive(unit, target, true);
    else await resolveOffensive(unit, target, false);
  }
  finishTurn(unit);
}

function renderActionBar(unit) {
  const bar = $("#action-bar");
  const ability = unit.template.ability;
  const cdReady = unit.abilityCooldown === 0;
  bar.innerHTML = `
    <button class="action-btn" id="act-attack">⚔ Ataque</button>
    <button class="action-btn ability" id="act-ability" ${cdReady ? "" : "disabled"}>${ability.name}${cdReady ? "" : " (" + unit.abilityCooldown + ")"}</button>
    <button class="action-btn" id="act-defend">🛡 Defender</button>
    <span class="action-hint" id="action-hint">Turno de <b>${unit.name}</b> — elige una acción.</span>
  `;
  $("#act-attack").addEventListener("click", () => beginTargeting(unit, "attack"));
  $("#act-ability").addEventListener("click", () => beginTargeting(unit, "ability"));
  $("#act-defend").addEventListener("click", () => doDefend(unit));
}

function beginTargeting(unit, type) {
  const ability = unit.template.ability;
  if (type === "ability" && SELF_TARGET_EFFECTS.includes(ability.effect.type)) {
    resolveAbilitySelf(unit).then(() => finishTurn(unit));
    return;
  }
  state.battle.pendingType = type;
  $("#action-hint").textContent = "Elige un objetivo enemigo…";
  const enemySide = unit.side === "player" ? "ai" : "player";
  $$(`#col-${enemySide} .unit-card`).forEach((card) => {
    const u = state.battle[enemySide].find((x) => x.id === card.dataset.uid);
    if (u && u.alive) {
      card.classList.add("targetable");
      card.onclick = async () => {
        clearTargetable();
        await resolveOffensive(unit, u, type === "ability");
        finishTurn(unit);
      };
    }
  });
}

function clearTargetable() {
  $$(".unit-card.targetable").forEach((c) => { c.classList.remove("targetable"); c.onclick = null; });
}

async function doDefend(unit) {
  unit.statuses.shield = { reduction: 0.5, duration: 1 };
  const amt = Math.round(unit.maxHp * 0.05);
  heal(unit, amt);
  spawnFloater(unit, "+" + amt, true);
  logMsg(`${unit.name} se cubre tras sus escamas y respira hondo.`);
  finishTurn(unit);
}

async function resolveOffensive(actor, target, isAbility) {
  const power = isAbility ? actor.template.ability.power : 1.0;
  const { dmg, crit, evaded } = computeDamage(actor, target, power);

  lunge(actor, target);
  await sleep(180);

  if (evaded) {
    spawnFloater(target, "¡Esquiva!", false, true);
    logMsg(`${target.name} esquiva el ataque de ${actor.name}.`);
  } else {
    applyDamage(target, dmg);
    spawnFloater(target, "-" + dmg, false, crit);
    shakeCard(target);
    logMsg(`${actor.name} ataca a ${target.name} por <b>${dmg}</b> de daño${crit ? " — ¡golpe crítico!" : ""}.`);

    if (actor.template.passive === "vampirismo") {
      const healed = Math.round(dmg * 0.25);
      heal(actor, healed);
      spawnFloater(actor, "+" + healed, true);
    }

    if (!isAbility && target.alive && target.template.passive === "contraataque" && Math.random() < 0.3) {
      const counter = Math.max(1, Math.round(effectiveAtk(target) * 0.4));
      applyDamage(actor, counter);
      spawnFloater(actor, "-" + counter, false);
      shakeCard(actor);
      logMsg(`${target.name} contraataca a ${actor.name} por ${counter}.`);
    }

    if (isAbility && target.alive) {
      applyAbilityEffect(actor, target, actor.template.ability.effect);
    }
  }

  if (isAbility) actor.abilityCooldown = actor.template.ability.cooldown;
  renderBattleUnits();
  await sleep(400);
}

async function resolveAbilitySelf(actor) {
  const effect = actor.template.ability.effect;
  if (effect.type === "curacion") {
    heal(actor, effect.amount);
    spawnFloater(actor, "+" + effect.amount, true);
    logMsg(`${actor.name} usa <b>${actor.template.ability.name}</b> y recupera ${effect.amount} de vida.`);
  } else if (effect.type === "escudo") {
    actor.statuses.shield = { reduction: effect.reduction, duration: effect.duration };
    logMsg(`${actor.name} usa <b>${actor.template.ability.name}</b> y refuerza su defensa.`);
  }
  actor.abilityCooldown = actor.template.ability.cooldown;
  renderBattleUnits();
  await sleep(500);
}

function applyAbilityEffect(actor, target, effect) {
  switch (effect.type) {
    case "quemadura":
      target.statuses.burn = { dmg: effect.dmg, duration: effect.duration };
      logMsg(`${target.name} queda ardiendo.`);
      break;
    case "veneno":
      target.statuses.poison = { dmg: effect.dmg, duration: effect.duration };
      logMsg(`${target.name} queda envenenado.`);
      break;
    case "aturdir":
      target.statuses.stun = { duration: effect.duration };
      logMsg(`${target.name} queda aturdido.`);
      break;
    case "debilitar":
      if (effect.stat === "attack") target.statuses.weakenAttack = { amount: effect.amount, duration: effect.duration };
      else target.statuses.weakenDefense = { amount: effect.amount, duration: effect.duration };
      logMsg(`${target.name} se debilita.`);
      break;
  }
}

function finishTurn(unit) {
  clearTargetable();
  $("#action-bar").innerHTML = "";
  const resolve = state.battle.pendingResolve;
  state.battle.pendingResolve = null;
  if (resolve) resolve();
}

function checkGameOver() {
  const battle = state.battle;
  if (!battle || !battle.inProgress) return true;
  const playerDead = allAlive(battle.player).length === 0;
  const aiDead = allAlive(battle.ai).length === 0;
  if (playerDead || aiDead) {
    battle.inProgress = false;
    renderBattleUnits();
    $("#action-bar").innerHTML = "";
    $$("nav.tabs button").forEach((b) => { b.disabled = false; });
    const banner = document.createElement("div");
    banner.className = "end-banner";
    banner.textContent = aiDead && !playerDead ? "🏆 ¡Victoria! Tus dragones dominan el campo." : "💀 Derrota. Tus dragones han caído.";
    $("#battle-end").innerHTML = "";
    $("#battle-end").appendChild(banner);
    const btn = document.createElement("button");
    btn.className = "primary-btn";
    btn.textContent = "Formar un nuevo equipo";
    btn.style.display = "block";
    btn.style.margin = "10px auto 0";
    btn.addEventListener("click", () => {
      state.teamSelection = [];
      $("#battle-end").innerHTML = "";
      renderTeamBuilder();
      setView("team");
    });
    $("#battle-end").appendChild(btn);
    logMsg(aiDead && !playerDead ? "<b>¡Has ganado la batalla!</b>" : "<b>Has perdido la batalla.</b>");
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// render de batalla
// ---------------------------------------------------------------------------
function statusIcons(u) {
  let out = "";
  if (u.statuses.burn) out += "🔥";
  if (u.statuses.poison) out += "☠";
  if (u.statuses.stun) out += "💫";
  if (u.statuses.shield) out += "🛡";
  if (u.statuses.weakenAttack || u.statuses.weakenDefense) out += "⬇";
  return out;
}

function hpColor(ratio) {
  if (ratio > 0.5) return "var(--hp-good)";
  if (ratio > 0.2) return "var(--hp-mid)";
  return "var(--hp-bad)";
}

function unitCardHTML(u) {
  const ratio = u.hp / u.maxHp;
  const el = state.data.elements[u.element];
  return `
    <div class="unit-glyph" style="box-shadow: inset 0 0 0 1px ${el.color}">${u.glyph}</div>
    <div class="unit-info">
      <div class="unit-name-row">
        <span class="unit-name">${u.name}</span>
        <span class="unit-status-icons">${statusIcons(u)}</span>
      </div>
      <div class="hp-track"><div class="hp-fill" style="width:${ratio * 100}%; background:${hpColor(ratio)}"></div></div>
      <div class="hp-text">${u.hp} / ${u.maxHp} PV</div>
    </div>
    <div class="floaters" id="floaters-${u.id}-${u.side}"></div>
  `;
}

function renderBattleUnits() {
  const battle = state.battle;
  if (!battle) return;
  const activeUid = battle.queue[battle.qi] ? battle.queue[battle.qi].id : null;

  ["player", "ai"].forEach((side) => {
    const col = $(`#col-${side}`);
    col.innerHTML = "";
    battle[side].forEach((u) => {
      const card = document.createElement("div");
      card.className = "unit-card" + (u.alive ? "" : " ko") + (u.id === activeUid && u.side === side ? " active-turn" : "");
      card.dataset.uid = u.id;
      card.innerHTML = unitCardHTML(u);
      col.appendChild(card);
    });
  });
}

function spawnFloater(unit, text, isHeal, isCrit) {
  const el = document.getElementById(`floaters-${unit.id}-${unit.side}`);
  if (!el) return;
  const f = document.createElement("div");
  f.className = "floater" + (isHeal ? " heal" : "") + (isCrit ? " crit" : "");
  f.textContent = text;
  el.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}

function shakeCard(unit) {
  const card = document.querySelector(`.unit-card[data-uid="${unit.id}"]`);
  if (!card) return;
  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");
}

function lunge(actor, target) {
  const card = document.querySelector(`.unit-card[data-uid="${actor.id}"]`);
  if (!card) return;
  const cls = actor.side === "player" ? "lunge-right" : "lunge-left";
  card.classList.remove(cls);
  void card.offsetWidth;
  card.classList.add(cls);
}

// ---------------------------------------------------------------------------
// eventos globales
// ---------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  init();
  $("#start-battle-btn").addEventListener("click", startBattle);
});
