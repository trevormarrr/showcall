let CFG = null;
let composition = null;
let gridEl = null;
let indexByKey = new Map();
let deckByKey = new Map();
let resolumeConnected = false;

async function init() {
  try {
    // Load config for presets only
  CFG = await fetch("/api/presets").then(r => r.json());
    gridEl = document.getElementById("grid");
    
    // Build UI elements
    buildQuickCues(CFG);
  buildDeck(CFG);
  addDebugControls();
  initSettings();
  initPresets();
    
  document.addEventListener("keydown", onHotkey);
    
    // Check connection and load composition structure
    await checkConnection();
    await loadComposition();
    setupStatusStream();
    
    // Refresh composition every 10 seconds
    setInterval(loadComposition, 10000);
    
    console.log("🎬 ShowCall initialized");
  } catch (error) {
    console.error("❌ Init failed:", error);
    showNotification("Failed to initialize", "error");
  }
}

async function loadComposition() {
  try {
    console.log("📡 Loading composition from Resolume...");
    const response = await fetch("/api/composition");
    composition = await response.json();
    
    if (composition.connected) {
      console.log(`✅ Loaded: ${composition.compositionName}`);
      console.log(`   Layers: ${composition.layers.length}, Max Columns: ${composition.maxColumns}`);
      buildGridFromComposition(composition);
      resolumeConnected = true;
    } else {
      console.error("❌ Failed to load composition");
      showNotification("Failed to load composition from Resolume", "error");
    }
  } catch (error) {
    console.error("❌ Load composition error:", error);
    showNotification("Cannot connect to Resolume", "error");
  }
}

function addDebugControls() {
  // Add debug section to quick cues
  const quickCues = document.getElementById("quickCues");
  
  // Refresh composition button
  const refreshBtn = document.createElement("button");
  refreshBtn.className = "quick-cue-btn";
  refreshBtn.textContent = "🔄 Refresh Grid";
  refreshBtn.onclick = async () => {
    showNotification("Refreshing composition...", "info");
    await loadComposition();
    showNotification("Grid refreshed!", "success");
  };
  refreshBtn.style.backgroundColor = "#0ea5e9";
  quickCues.appendChild(refreshBtn);
  
  // Debug button
  const debugBtn = document.createElement("button");
  debugBtn.className = "quick-cue-btn";
  debugBtn.textContent = "🔍 Debug Info";
  debugBtn.onclick = testConnection;
  debugBtn.style.backgroundColor = "#6366f1";
  quickCues.appendChild(debugBtn);
  
  // Test clip trigger button
  const testBtn = document.createElement("button");
  testBtn.className = "quick-cue-btn";
  testBtn.textContent = "🎯 Test L1C1";
  testBtn.onclick = () => testTrigger(1, 1);
  testBtn.style.backgroundColor = "#8b5cf6";
  quickCues.appendChild(testBtn);
  
  // Test column trigger button
  const testColumnBtn = document.createElement("button");
  testColumnBtn.className = "quick-cue-btn";
  testColumnBtn.textContent = "🔥 Test Col 1";
  testColumnBtn.onclick = () => testColumnTrigger(1);
  testColumnBtn.style.backgroundColor = "#f59e0b";
  quickCues.appendChild(testColumnBtn);

  // Check updates button
  const updateBtn = document.createElement("button");
  updateBtn.className = "quick-cue-btn";
  updateBtn.textContent = "⬇️ Check Updates";
  updateBtn.onclick = async () => {
    try {
      showNotification('Checking for updates...', 'info');
      const res = await fetch('/api/update/check');
      const data = await res.json();
      if (data.updateAvailable) {
        const assetUrl = data.assets?.mac || data.assets?.win || data.assets?.linux || data.releaseUrl;
        if (confirm(`Update ${data.latestVersion} available (current ${data.currentVersion}). Open download page?`)) {
          window.open(assetUrl, '_blank');
          showNotification('Opening download page...', 'info');
        }
      } else {
        showNotification('You are up to date!', 'success');
      }
    } catch (e) {
      showNotification('Update check failed', 'error');
    }
  };
  updateBtn.style.backgroundColor = "#10b981";
  quickCues.appendChild(updateBtn);
}

async function testConnection() {
  try {
    showNotification("Testing Resolume connection...", "info");
    const response = await fetch("/api/debug");
    const result = await response.json();
    
    if (result.connected) {
      console.log("✅ Debug info:", result);
      const layerInfo = result.layersInfo?.map(l => `${l.name}(${l.clipCount} clips)`).join(', ') || 'None';
      showNotification(`Connected: ${result.compositionName} - ${result.layerCount} layers`, "success");
      console.log("Layers:", layerInfo);
    } else {
      console.error("❌ Debug failed:", result);
      showNotification(`Connection failed: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("❌ Debug error:", error);
    showNotification(`Debug error: ${error.message}`, "error");
  }
}

async function testTrigger(layer, column) {
  try {
    showNotification(`Testing L${layer}C${column}...`, "info");
    const response = await fetch("/api/test-trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layer, column })
    });
    
    const result = await response.json();
    console.log("🔍 Test trigger result:", result);
    
    if (result.success) {
      showNotification(`✅ L${layer}C${column} trigger works!`, "success");
    } else {
      showNotification(`❌ L${layer}C${column} failed: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("❌ Test trigger error:", error);
    showNotification(`Test error: ${error.message}`, "error");
  }
}

async function testColumnTrigger(column) {
  try {
    showNotification(`Testing Column ${column}...`, "info");
    const response = await fetch("/api/test-column", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column })
    });
    
    const result = await response.json();
    console.log("🔍 Test column result:", result);
    
    if (result.success) {
      showNotification(`✅ Column ${column} trigger works!`, "success");
    } else {
      showNotification(`❌ Column ${column} failed: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("❌ Test column error:", error);
    showNotification(`Test error: ${error.message}`, "error");
  }
}

// Enhanced trigger function with better error reporting
async function trigger(layer, column) {
  if (!resolumeConnected) {
    showNotification("Not connected to Resolume", "error");
    return;
  }
  
  try {
    console.log(`🎯 Triggering L${layer}C${column}...`);
    showNotification(`Triggering L${layer}C${column}...`, "info");
    
    const response = await fetch("/api/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layer, column })
    });
    
    const result = await response.json();
    console.log("🎯 Trigger result:", result);
    
    if (result.ok) {
      console.log(`✅ Triggered L${layer}C${column} using ${result.method || 'unknown method'}`);
      showNotification(`Triggered L${layer}C${column}`, "success");
    } else {
      console.error("❌ Trigger failed:", result.error);
      showNotification(`Trigger failed: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("❌ Trigger error:", error);
    showNotification(`Trigger error: ${error.message}`, "error");
  }
}

async function checkConnection() {
  try {
    const response = await fetch("/api/connection");
    const status = await response.json();
    resolumeConnected = status.connected;
    updateConnectionStatus(status);
    return status.connected;
  } catch (error) {
    console.error("Connection check failed:", error);
    resolumeConnected = false;
    updateConnectionStatus({ connected: false, error: error.message });
    return false;
  }
}

function updateConnectionStatus(status) {
  let indicator = document.getElementById("connectionStatus");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "connectionStatus";
    document.querySelector(".meta").appendChild(indicator);
  }
  
  if (status.connected) {
    const oscStatus = status.osc ? '🎵 OSC' : '⚠️ OSC Off';
    indicator.className = "connection-status connected";
    indicator.textContent = `✅ REST ${status.restPort} | ${oscStatus} ${status.oscPort}`;
  } else {
    indicator.className = "connection-status disconnected";
    indicator.textContent = `❌ Disconnected: ${status.error || 'Check Resolume'}`;
  }
}

function setupStatusStream() {
  const connectSSE = () => {
    const es = new EventSource("/api/status");
    
    es.onopen = () => {
      console.log("✅ Status stream connected");
    };
    
    es.onmessage = (evt) => {
      try {
        const status = JSON.parse(evt.data);
        updateStatus(status);
        resolumeConnected = status.connected;
      } catch (error) {
        console.error("Failed to parse status:", error);
      }
    };
    
    es.onerror = (error) => {
      console.error("Status stream error:", error);
      es.close();
      setTimeout(connectSSE, 3000);
    };
  };
  
  connectSSE();
}

function updateStatus(status) {
  // Update display elements
  document.getElementById("progName").textContent = status.program?.clipName || "—";
  document.getElementById("prevName").textContent = status.preview?.clipName || "—";
  document.getElementById("progLayer").textContent = 
    `${status.program?.layerName || "—"} • Col ${status.program?.column || "—"}`;
  document.getElementById("prevLayer").textContent = 
    `${status.preview?.layerName || "—"} • Col ${status.preview?.column || "—"}`;
  document.getElementById("bpm").textContent = `BPM: ${status.bpm || "—"}`;
  
  // Show composition name prominently
  const compEl = document.getElementById("comp");
  if (status.comp && status.comp !== "—" && status.comp !== "Unknown") {
    compEl.textContent = status.comp;
    compEl.style.color = "#7dd3fc";
  } else {
    compEl.textContent = "No Composition";
    compEl.style.color = "#6b7280";
  }
  
  updateConnectionStatus({ 
    connected: status.connected, 
    osc: status.osc,
    host: status.host, 
    restPort: status.restPort,
    oscPort: status.oscPort
  });
  
  // Clear previous highlights
  indexByKey.forEach(div => {
    div.classList.remove("active-prog", "active-prev", "active-clip");
  });
  
  // Highlight active clips
  if (status.program?.layer && status.program?.column) {
    const key = `L${status.program.layer}-C${status.program.column}`;
    const progDiv = indexByKey.get(key);
    if (progDiv) {
      progDiv.classList.add("active-prog", "active-clip");
    }
  }
  
  if (status.preview?.layer && status.preview?.column) {
    const key = `L${status.preview.layer}-C${status.preview.column}`;
    const prevDiv = indexByKey.get(key);
    if (prevDiv) {
      prevDiv.classList.add("active-prev", "active-clip");
    }
  }
}

function buildDeck(cfg) {
  const deck = document.getElementById("deck");
  deck.innerHTML = "";
  deckByKey.clear();

  (cfg.presets || []).forEach(p => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.onclick = () => firePreset(p);
    btn.setAttribute("data-preset-id", p.id);

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

// Grid view settings
let gridView = {
  maxLayers: 5,
  maxColumns: 8,
  expandedLayers: false,
  expandedColumns: false
};

function buildGridFromComposition(comp) {
  if (!comp || !comp.layers || comp.layers.length === 0) {
    gridEl.innerHTML = '<div class="error">No composition data available</div>';
    return;
  }
  
  const container = document.createElement("div");
  container.className = "grid";
  
  // Determine how many layers/columns to show
  const totalLayers = comp.layers.length;
  const totalColumns = comp.maxColumns || 10;
  const displayLayers = gridView.expandedLayers ? totalLayers : Math.min(gridView.maxLayers, totalLayers);
  const displayColumns = gridView.expandedColumns ? totalColumns : Math.min(gridView.maxColumns, totalColumns);
  
  container.style.gridTemplateColumns = `160px repeat(${displayColumns}, minmax(100px, 1fr))`;

  // Header row with column numbers and expand button
  const cornerCell = hdrCell("");
  cornerCell.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px;">
      <button id="expandCols" style="background: none; border: 1px solid rgba(255,255,255,0.2); color: #7dd3fc; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 10px;">
        ${gridView.expandedColumns ? '◀' : '▶'}
      </button>
    </div>
  `;
  container.appendChild(cornerCell);
  
  for (let col = 1; col <= displayColumns; col++) {
    const h = hdrCell(`Col ${col}`);
    h.onclick = () => triggerColumn(col);
    h.setAttribute("title", `Trigger all clips in Column ${col}`);
    h.style.cursor = "pointer";
    container.appendChild(h);
  }

  // Clear the index
  indexByKey.clear();

  // Get layers to display (first N layers, then reverse so Layer 1 is at bottom)
  const layersToShow = comp.layers.slice(0, displayLayers).reverse();

  // Layer rows (now Layer 1 will be at bottom)
  layersToShow.forEach(layer => {
    const layerLabelEl = layerLabel(`Layer ${layer.id}`);
    layerLabelEl.setAttribute("title", `Layer ${layer.id}: ${layer.name}`);
    container.appendChild(layerLabelEl);
    
    // Create cells for each column
    for (let col = 1; col <= displayColumns; col++) {
      const clip = layer.clips?.find(c => c.column === col);
      const div = document.createElement("div");
      
      // Check if clip has a valid name (not [object Object] or empty)
      const hasValidName = clip && clip.name && 
                          clip.name.trim() !== '' && 
                          !clip.name.includes('[object') &&
                          !clip.isEmpty;
      
      if (hasValidName) {
        // Clip exists with content
        div.className = "cell";
        div.textContent = clip.name;
        div.onclick = () => trigger(layer.id, col);
        div.setAttribute("title", `${clip.name}\nLayer ${layer.id}, Column ${col}\nClick to trigger`);
        div.style.cursor = "pointer";
      } else {
        // Empty slot or invalid name
        div.className = "cell empty";
        div.textContent = "";
        div.setAttribute("title", `Empty slot\nLayer ${layer.id}, Column ${col}`);
      }
      
      div.dataset.layer = layer.id;
      div.dataset.column = col;
      
      const key = `L${layer.id}-C${col}`;
      indexByKey.set(key, div);
      container.appendChild(div);
    }
  });
  
  // Add expand/collapse row at bottom if there are more layers
  if (totalLayers > gridView.maxLayers) {
    const expandLabelEl = document.createElement("div");
    expandLabelEl.className = "layer-label expand-control";
    expandLabelEl.style.cursor = "pointer";
    expandLabelEl.style.textAlign = "center";
    expandLabelEl.style.opacity = "0.7";
    expandLabelEl.innerHTML = gridView.expandedLayers 
      ? `▲ Show Less (${displayLayers}/${totalLayers})`
      : `▼ Show More (${displayLayers}/${totalLayers})`;
    expandLabelEl.onclick = () => {
      gridView.expandedLayers = !gridView.expandedLayers;
      buildGridFromComposition(composition);
    };
    container.appendChild(expandLabelEl);
    
    // Empty cells for this row
    for (let col = 1; col <= displayColumns; col++) {
      container.appendChild(document.createElement("div"));
    }
  }

  gridEl.innerHTML = "";
  gridEl.appendChild(container);
  
  // Add event listener to column expand button
  setTimeout(() => {
    const expandColsBtn = document.getElementById("expandCols");
    if (expandColsBtn) {
      expandColsBtn.onclick = (e) => {
        e.stopPropagation();
        gridView.expandedColumns = !gridView.expandedColumns;
        buildGridFromComposition(composition);
        showNotification(
          gridView.expandedColumns 
            ? `Showing all ${totalColumns} columns` 
            : `Showing ${gridView.maxColumns} columns`,
          "info"
        );
      };
    }
  }, 0);
  
  console.log(`✅ Grid built: ${displayLayers}/${totalLayers} layers × ${displayColumns}/${totalColumns} columns`);
}

function buildQuickCues(cfg) {
  const el = document.getElementById("quickCues");
  el.innerHTML = "";
  (cfg.quickCues || []).forEach(q => {
    const b = document.createElement("button");
    b.className = "quick-cue-btn";
    b.textContent = q.label;
    b.onclick = () => runQuickCue(q);
    b.setAttribute("title", `Execute ${q.action} action`);
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
  if (!resolumeConnected) {
    showNotification("Not connected to Resolume", "error");
    return;
  }
  
  try {
    console.log(`🎯 Triggering L${layer}C${column}...`);
    showNotification(`Triggering L${layer}C${column}...`, "info");
    
    const response = await fetch("/api/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layer, column })
    });
    
    const result = await response.json();
    console.log("🎯 Trigger result:", result);
    
    if (result.ok) {
      console.log(`✅ Triggered L${layer}C${column} using ${result.method || 'unknown method'}`);
      showNotification(`Triggered L${layer}C${column}`, "success");
    } else {
      console.error("❌ Trigger failed:", result.error);
      showNotification(`Trigger failed: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("❌ Trigger error:", error);
    showNotification(`Trigger error: ${error.message}`, "error");
  }
}

async function triggerColumn(column) {
  if (!resolumeConnected) {
    showNotification("Not connected to Resolume", "error");
    return;
  }
  
  try {
    const response = await fetch("/api/triggerColumn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ Triggered column ${column}`);
      showNotification(`Column ${column} triggered`, "success");
    } else {
      console.error("Column trigger failed:", result.error);
      showNotification(`Column trigger failed: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("Column trigger error:", error);
    showNotification(`Error: ${error.message}`, "error");
  }
}

async function firePreset(preset) {
  if (!preset?.macro) {
    showNotification("Invalid preset", "error");
    return;
  }
  
  try {
    console.log(`🎯 Firing preset: ${preset.label}`);
    
    const response = await fetch("/api/macro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        macro: preset.macro,
        id: preset.id,
        name: preset.label
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ Preset "${preset.label}" executed`);
      showNotification(`"${preset.label}" executed`, "success");
    } else {
      console.error(`Preset failed:`, result.error);
      showNotification(`Preset failed: ${result.error}`, "error");
    }
  } catch (error) {
    console.error(`Preset error:`, error);
    showNotification(`Preset error: ${error.message}`, "error");
  }
}

async function runQuickCue(q) {
  if (!resolumeConnected) {
    showNotification("Not connected to Resolume", "error");
    return;
  }
  
  try {
    let response;
    
    if (q.action === "cut") {
      response = await fetch("/api/cut", { method: "POST" });
    } else if (q.action === "clear") {
      response = await fetch("/api/clear", { method: "POST" });
    } else {
      showNotification(`Unknown action: ${q.action}`, "error");
      return;
    }
    
    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ ${q.label} executed`);
      showNotification(`${q.label} executed`, "success");
    } else {
      console.error(`${q.label} failed:`, result.error);
      showNotification(`${q.label} failed: ${result.error}`, "error");
    }
  } catch (error) {
    console.error(`${q.label} error:`, error);
    showNotification(`${q.label} error: ${error.message}`, "error");
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add("visible"), 10);
  setTimeout(() => {
    notification.classList.remove("visible");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function onHotkey(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  const key = e.key.toLowerCase();
  const preset = deckByKey.get(key);
  
  if (preset) {
    e.preventDefault();
    firePreset(preset);
    
    const btn = document.querySelector(`[data-preset-id="${preset.id}"]`);
    if (btn) {
      btn.classList.add("pressed");
      setTimeout(() => btn.classList.remove("pressed"), 150);
    }
  }
}

// Settings functionality
function initSettings() {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeBtn = settingsModal.querySelector('.close');
  const cancelBtn = document.getElementById('cancelSettings');
  const saveBtn = document.getElementById('saveSettings');

  // Load current settings
  loadCurrentSettings();

  // Open modal
  settingsBtn.onclick = () => {
    settingsModal.style.display = 'flex';
    loadCurrentSettings();
  };

  // Close modal
  const closeModal = () => {
    settingsModal.style.display = 'none';
  };

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;

  // Close on backdrop click
  settingsModal.onclick = (e) => {
    if (e.target === settingsModal) closeModal();
  };

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal.style.display === 'flex') {
      closeModal();
    }
  });

  // Save settings
  saveBtn.onclick = async () => {
    await saveSettings();
  };
}

async function loadCurrentSettings() {
  try {
    const response = await fetch('/api/settings');
    const settings = await response.json();
    
    document.getElementById('resolumeHost').value = settings.resolumeHost || '10.1.110.72';
    document.getElementById('resolumeRestPort').value = settings.resolumeRestPort || '8080';
    document.getElementById('resolumeOscPort').value = settings.resolumeOscPort || '7000';
    document.getElementById('serverPort').value = settings.serverPort || '3200';
  } catch (error) {
    console.error('Failed to load settings:', error);
    // Set defaults
    document.getElementById('resolumeHost').value = '10.1.110.72';
    document.getElementById('resolumeRestPort').value = '8080';
    document.getElementById('resolumeOscPort').value = '7000';
    document.getElementById('serverPort').value = '3200';
  }
}

async function saveSettings() {
  const settings = {
    resolumeHost: document.getElementById('resolumeHost').value.trim(),
    resolumeRestPort: parseInt(document.getElementById('resolumeRestPort').value),
    resolumeOscPort: parseInt(document.getElementById('resolumeOscPort').value),
    serverPort: parseInt(document.getElementById('serverPort').value)
  };

  // Basic validation
  if (!settings.resolumeHost) {
    alert('Please enter a valid Resolume IP address');
    return;
  }

  if (settings.resolumeRestPort < 1 || settings.resolumeRestPort > 65535) {
    alert('REST API port must be between 1 and 65535');
    return;
  }

  if (settings.resolumeOscPort < 1 || settings.resolumeOscPort > 65535) {
    alert('OSC port must be between 1 and 65535');
    return;
  }

  if (settings.serverPort < 1024 || settings.serverPort > 65535) {
    alert('Server port must be between 1024 and 65535');
    return;
  }

  try {
    showNotification('Saving settings...', 'info');
    
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });

    if (response.ok) {
      showNotification('Settings saved! Restarting ShowCall...', 'success');
      
      // Close modal
      document.getElementById('settingsModal').style.display = 'none';
      
      // Show restart message
      setTimeout(() => {
        document.body.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; gap: 20px;">
            <h1>🔄 Restarting ShowCall...</h1>
            <p>Settings have been saved. ShowCall is restarting to apply changes.</p>
            <p style="opacity: 0.7;">This page will automatically reload in a few seconds.</p>
          </div>
        `;
        
        // Try to reload after a delay
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }, 1000);
    } else {
      throw new Error('Failed to save settings');
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
    showNotification('Failed to save settings', 'error');
  }
}

// Initialize the application
async function init() {
  try {
    // Load config for presets only
    CFG = await fetch("/api/presets").then(r => r.json());
    gridEl = document.getElementById("grid");
    
    // Build UI elements
    buildQuickCues(CFG);
    buildDeck(CFG);
    addDebugControls();
    initSettings(); // Initialize settings modal
    initPresets(); // Initialize presets editor
    
    document.addEventListener("keydown", onHotkey);
    
    // Check connection and load composition structure
    await checkConnection();
    await loadComposition();
    setupStatusStream();
    
    // Refresh composition every 10 seconds
    setInterval(loadComposition, 10000);
    
    console.log("🎬 ShowCall initialized");
  } catch (error) {
    console.error("❌ Init failed:", error);
    showNotification("Failed to initialize", "error");
  }
}
init();

// Presets editor
function initPresets() {
  const btn = document.getElementById('presetsBtn');
  const modal = document.getElementById('presetsModal');
  if (!btn || !modal) return;
  const close = modal.querySelector('.close');
  const cancel = document.getElementById('cancelPresets');
  const save = document.getElementById('savePresets');
  presetsModal = modal;
  presetsEditor = document.getElementById('presetsEditor');

  const open = async () => {
    try {
      const json = await fetch('/api/presets').then(r => r.json());
      presetsEditor.value = JSON.stringify(json, null, 2);
      modal.style.display = 'flex';
    } catch (e) {
      showNotification('Failed to load presets', 'error');
    }
  };

  const closeModal = () => modal.style.display = 'none';

  btn.onclick = open;
  close.onclick = closeModal;
  cancel.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  save.onclick = async () => {
    try {
      const data = JSON.parse(presetsEditor.value);
      const resp = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!resp.ok) throw new Error('Failed to save');
      showNotification('Presets saved', 'success');
      closeModal();
      // Refresh local CFG + UI
      CFG = data;
      buildQuickCues(CFG);
      buildDeck(CFG);
      // Re-register hotkeys map
      deckByKey.clear();
      (CFG.presets || []).forEach(p => {
        if (p.hotkey) deckByKey.set(String(p.hotkey).toLowerCase(), p);
      });
    } catch (e) {
      showNotification('Invalid JSON or save failed', 'error');
    }
  };
}
