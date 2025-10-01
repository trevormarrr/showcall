import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const HOST = process.env.RESOLUME_HOST || "10.1.110.72";
const PORT_R = process.env.RESOLUME_PORT || "8080";
const MOCK = process.env.MOCK === "1";

const STATUS_PATH   = process.env.RESOLUME_STATUS_PATH   || "";
const CUT_PATH      = process.env.RESOLUME_CUT_PATH      || "";
const CLEAR_PATH    = process.env.RESOLUME_CLEAR_PATH    || "";
const TRIG_TPL      = process.env.RESOLUME_TRIGGER_TEMPLATE || "";
const TRIG_COL_TPL  = process.env.RESOLUME_TRIGGER_COLUMN_TEMPLATE || "";

// ----- Helpers -----
const baseUrl = () => `http://${HOST}:${PORT_R}`;

function tpl(pathTemplate, params) {
  let out = pathTemplate;
  Object.entries(params || {}).forEach(([k, v]) => {
    out = out.replaceAll(`{${k}}`, String(v));
  });
  return out;
}

function asProgramPreviewFallback(data) {
  // Normalize plugin response → { program:{layer,column,clipName}, preview:{...}, bpm, comp }
  // Update this mapping if your status JSON is different.
  const program = data?.program ?? data?.prog ?? {};
  const preview = data?.preview ?? data?.prev ?? {};
  return {
    program: {
      layer:  program.layer  ?? program.layerIndex ?? program.l ?? "-",
      column: program.column ?? program.columnIndex ?? program.c ?? "-",
      clipName: program.clipName ?? program.name ?? "—",
    },
    preview: {
      layer:  preview.layer  ?? preview.layerIndex ?? preview.l ?? "-",
      column: preview.column ?? preview.columnIndex ?? preview.c ?? "-",
      clipName: preview.clipName ?? preview.name ?? "—",
    },
    bpm:  data?.bpm ?? data?.transport?.bpm ?? "-",
    comp: data?.composition ?? data?.comp ?? "—",
  };
}

// Mock state for demo mode
let mockProg = { layer: 1, column: 1, clipName: "BG_Waves_01" };
let mockPrev = { layer: 1, column: 2, clipName: "BG_Waves_02" };

// ----- HTTP to Resolume -----
async function httpGet(pathname) {
  const url = `${baseUrl()}${pathname}`;
  const { data } = await axios.get(url, { timeout: 1000 });
  return data;
}
async function httpPost(pathname, body = {}) {
  const url = `${baseUrl()}${pathname}`;
  const { data } = await axios.post(url, body, { timeout: 1200 });
  return data;
}

// ----- Status -----
async function fetchStatus() {
  if (MOCK || !STATUS_PATH) {
    return {
      program: mockProg,
      preview: mockPrev,
      bpm: 120,
      comp: "Weekend_Main",
    };
  }
  try {
    const raw = await httpGet(STATUS_PATH);
    return asProgramPreviewFallback(raw);
  } catch (e) {
    console.error("STATUS error:", e.message);
    return { program: mockProg, preview: mockPrev, bpm: "-", comp: "—" };
  }
}

// ----- Actions -----
async function triggerClip({ layer, column }) {
  if (MOCK || !TRIG_TPL) {
    mockPrev = { layer, column, clipName: `L${layer} C${column}` };
    setTimeout(() => { mockProg = { ...mockPrev }; }, 200);
    return { ok: true };
  }
  const path = tpl(TRIG_TPL, { layer, column });
  return await httpPost(path, {}); // body usually not required for trigger
}

async function triggerColumn({ column, layers = [] }) {
  if (MOCK && !TRIG_COL_TPL) {
    // mock: fire each layer serially
    for (const l of layers) {
      await triggerClip({ layer: l.layer, column });
      await new Promise(r => setTimeout(r, 60));
    }
    return { ok: true };
  }
  if (TRIG_COL_TPL) {
    const path = tpl(TRIG_COL_TPL, { column });
    return await httpPost(path, {});
  } else {
    // fallback: no column endpoint – fire per layer with stagger
    for (const l of layers) {
      await triggerClip({ layer: l.layer, column });
      await new Promise(r => setTimeout(r, 60));
    }
    return { ok: true };
  }
}

async function cutToProgram() {
  if (MOCK || !CUT_PATH) {
    mockProg = { ...mockPrev };
    return { ok: true };
  }
  return await httpPost(CUT_PATH, {});
}

async function clearAll() {
  if (MOCK || !CLEAR_PATH) {
    mockProg = { layer: "-", column: "-", clipName: "—" };
    mockPrev = { layer: "-", column: "-", clipName: "—" };
    return { ok: true };
  }
  return await httpPost(CLEAR_PATH, {});
}

// ----- API (UI <-> Bridge) -----
app.post("/api/trigger", async (req, res) => {
  try {
    const out = await triggerClip(req.body || {});
    res.json(out);
  } catch (e) {
    console.error("TRIGGER error:", e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/api/triggerColumn", async (req, res) => {
  try {
    const out = await triggerColumn(req.body || {});
    res.json(out);
  } catch (e) {
    console.error("TRIGGER COLUMN error:", e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/api/cut", async (_req, res) => {
  try {
    const out = await cutToProgram();
    res.json(out);
  } catch (e) {
    console.error("CUT error:", e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/api/clear", async (_req, res) => {
  try {
    const out = await clearAll();
    res.json(out);
  } catch (e) {
    console.error("CLEAR error:", e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// SSE status (push to UI ~2fps)
app.get("/api/status", async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  res.flushHeaders();

  const tick = async () => {
    const snap = await fetchStatus();
    res.write(`data: ${JSON.stringify(snap)}\n\n`);
  };
  await tick();
  const timer = setInterval(tick, 500);
  req.on("close", () => clearInterval(timer));
});

// UI fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3200;
app.listen(PORT, () =>
  console.log(`ShowCall running at http://localhost:${PORT} -> Resolume ${baseUrl()}`)
);


// ---- Macro runner ----
async function runMacro(steps = []) {
  for (const step of steps) {
    const t = (step.type || "").toLowerCase();
    if (t === "sleep") {
      await new Promise(r => setTimeout(r, step.ms || 0));
    } else if (t === "trigger") {
      await triggerClip({ layer: step.layer, column: step.column });
    } else if (t === "triggercolumn") {
      await triggerColumn({ column: step.column });
    } else if (t === "cut") {
      await cutToProgram();
    } else if (t === "clear") {
      await clearAll();
    }
  }
  return { ok: true };
}

app.post("/api/macro", async (req, res) => {
  try {
    const { macro = [], id } = req.body || {};
    const out = await runMacro(macro);
    res.json({ ok: true, id, result: out });
  } catch (e) {
    console.error("MACRO error:", e.message);
    res.status(500).json({ ok:false, error:e.message });
  }
});
