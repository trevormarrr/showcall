let CFG = null;
let gridEl = null;
let indexByKey = new Map(); // "Lx-Cy" -> cell div
let deckByKey = new Map(); // hotkey -> preset

async function init() {
  CFG = await fetch("/config.json").then(r => r.json());
  gridEl = document.getElementById("grid");
  buildGrid(CFG);
  buildQuickCues(CFG);
  buildDeck(CFG);       // NEW

  // Live status (SSE)
  const es = new EventSource("/api/status");
  es.onmessage = (evt) => {
    const s = JSON.parse(evt.data);
    document.getElementById("progName").textContent = s.program.clipName ?? "—";
    document.getElementById("prevName").textContent = s.preview.clipName ?? "—";
    document.getElementById("progLayer").textContent = `Layer ${s.program.layer ?? "—"} • Col ${s.program.column ?? "—"}`;
    document.getElementById("prevLayer").textContent = `Layer ${s.preview.layer ?? "—"} • Col ${s.preview.column ?? "—"}`;
    document.getElementById("bpm").textContent = `BPM: ${s.bpm ?? "—"}`;
    document.getElementById("comp").textContent = `Comp: ${s.comp ?? CFG.compositionName ?? "—"}`;

    // clear highlights
    indexByKey.forEach(div => { div.classList.remove("active-prog","active-prev"); });

    // set highlights
    if (s.program?.layer && s.program?.column) {
      const key = `L${s.program.layer}-C${s.program.column}`;
      indexByKey.get(key)?.classList.add("active-prog");
    }
    if (s.preview?.layer && s.preview?.column) {
      const key = `L${s.preview.layer}-C${s.preview.column}`;
      indexByKey.get(key)?.classList.add("active-prev");
    }
  };
}
function buildDeck(cfg) {
  const deck = document.getElementById("deck");
  deck.innerHTML = "";
  deckByKey.clear();

  (cfg.presets || []).forEach(p => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.onclick = () => firePreset(p);

    // color dot
    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.background = p.color || "#7dd3fc";

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = p.label;

    const hk = document.createElement("span");
    hk.className = "hotkey";
    hk.textContent = p.hotkey ? `Key: ${p.hotkey.toUpperCase()}` : "—";

    btn.appendChild(dot);
    btn.appendChild(label);
    btn.appendChild(hk);
    deck.appendChild(btn);

    if (p.hotkey) {
      deckByKey.set(p.hotkey.toLowerCase(), p);
    }
  });
}

function onHotkey(e) {
  const key = e.key.toLowerCase();
  const preset = deckByKey.get(key);
  if (preset) {
    e.preventDefault();
    firePreset(preset);
  }
}

async function firePreset(preset) {
  // Optional: brief visual feedback later
  await fetch("/api/macro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ macro: preset.macro || [], id: preset.id })
  });
}

function buildGrid(cfg) {
  // grid columns = (1 for layer labels) + number of columns
  const cols = 1 + cfg.columns.length;
  const container = document.createElement("div");
  container.className = "grid";
  container.style.gridTemplateColumns = `180px repeat(${cfg.columns.length}, minmax(120px, 1fr))`;

  // header row: empty corner + column headers
  container.appendChild(hdrCell("")); // corner
  cfg.columns.forEach(col => {
    const h = hdrCell(col.name);
    h.onclick = () => triggerColumn(col.id);
    container.appendChild(h);
  });

  // rows for each layer
  cfg.layers.reverse().forEach(layer => {
    container.appendChild(layerLabel(layer.name));
    cfg.columns.forEach(col => {
      const label = findCellLabel(cfg, layer.id, col.id);
      const div = document.createElement("div");
      div.className = "cell" + (label ? "" : " empty");
      div.textContent = label || "";
      div.dataset.layer = layer.id;
      div.dataset.column = col.id;
      if (label) {
        div.onclick = () => trigger(layer.id, col.id);
      }
      const key = `L${layer.id}-C${col.id}`;
      indexByKey.set(key, div);
      container.appendChild(div);
    });
  });

  gridEl.innerHTML = "";
  gridEl.appendChild(container);
}

function buildQuickCues(cfg) {
  const el = document.getElementById("quickCues");
  el.innerHTML = "";
  (cfg.quickCues || []).forEach(q => {
    const b = document.createElement("button");
    b.textContent = q.label;
    b.onclick = () => runQuickCue(q);
    el.appendChild(b);
  });
}

function hdrCell(text) {
  const d = document.createElement("div");
  d.className = "hdr";
  d.textContent = text;
  return d;
}
function layerLabel(text) {
  const d = document.createElement("div");
  d.className = "layer-label";
  d.textContent = text;
  return d;
}
function findCellLabel(cfg, layerId, colId) {
  const c = cfg.cells.find(x => x.layer === layerId && x.column === colId);
  return c?.label || "";
}

async function trigger(layer, column) {
  await fetch("/api/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layer, column })
  });
}
async function triggerColumn(column) {
  // gather all configured cells in this column
  const layers = (CFG.cells || [])
    .filter(c => c.column === column)
    .map(c => ({ layer: c.layer, column }));
  await fetch("/api/triggerColumn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ column, layers })
  });
}
async function runQuickCue(q) {
  if (q.action === "cut") {
    await fetch("/api/cut", { method: "POST" });
  } else if (q.action === "clear") {
    await fetch("/api/clear", { method: "POST" });
  }
}



init();
