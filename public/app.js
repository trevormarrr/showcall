let CFG = null;
let composition = null;
let gridEl = null;
let indexByKey = new Map();
let deckByKey = new Map();
let resolumeConnected = false;
let lastStatusState = null; // Track previous status to prevent unnecessary updates

// Debug function for video preview
function debugLog(message) {
  console.log(message);
  const debugDiv = document.getElementById('debugLog');
  if (debugDiv) {
    debugDiv.innerHTML += '<br>' + message;
  }
}

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
    
    // Setup auto-updater notifications (Electron only)
    if (window.electronAPI) {
      setupUpdateNotifications();
    } else {
      // In web mode, show a demo update indicator after 10 seconds
      setTimeout(() => {
        const updateIndicator = document.getElementById('updateIndicator');
        const updateText = updateIndicator?.querySelector('.update-text');
        if (updateIndicator && updateText) {
          updateText.textContent = 'v1.3.7 Available!';
          updateIndicator.className = 'update-indicator';
          updateIndicator.style.display = 'block';
          updateIndicator.title = 'Demo: Update available (this is just for testing)';
          updateIndicator.onclick = () => {
            alert('This is a demo update indicator. In the real app, this would trigger the update process.');
          };
        }
      }, 10000);
    }
    
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
    const response = await fetch("/api/composition");
    composition = await response.json();
    
    if (composition.connected) {
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

  // Test button for highlighting
  const testHighlightBtn = document.createElement("button");
  testHighlightBtn.className = "quick-cue-btn";
  testHighlightBtn.textContent = "🎨 Test Highlight";
  testHighlightBtn.onclick = () => {
    // Force highlight column 1 and layer 1
    document.querySelectorAll('.grid .hdr').forEach(h => { 
      if (h.textContent.trim() === 'Col 1') {
        h.classList.add('active-col-prog'); 
        h.style.background = 'red !important'; // Emergency override
      }
    });
    // Test if we can find any cell
    const testKey = 'L1-C1';
    const testEl = indexByKey.get(testKey);
    if (testEl) {
      testEl.classList.add('active-prog');
      testEl.style.border = '5px solid red'; // Emergency override
    }
    showNotification("Force highlighted Col 1 / L1C1", "info");
  };
  testHighlightBtn.style.backgroundColor = "#e11d48";
  quickCues.appendChild(testHighlightBtn);
}

async function testConnection() {
  try {
    showNotification("Testing Resolume connection...", "info");
    const response = await fetch("/api/debug");
    const result = await response.json();
    
    if (result.connected) {
      const layerInfo = result.layersInfo?.map(l => `${l.name}(${l.clipCount} clips)`).join(', ') || 'None';
      showNotification(`Connected: ${result.compositionName} - ${result.layerCount} layers`, "success");
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
    showNotification(`Triggering L${layer}C${column}...`, "info");
    
    const response = await fetch("/api/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layer, column })
    });
    
    const result = await response.json();
    
    if (result.ok) {
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
  // Update composition and BPM in header
  const compEl = document.getElementById('comp');
  const bpmEl = document.getElementById('bpm');
  
  if (compEl && status.comp) {
    compEl.textContent = status.comp;
  }
  
  if (bpmEl && status.bpm) {
    bpmEl.textContent = `BPM: ${status.bpm}`;
  }
  
  // Create/update connection indicator
  let indicator = document.getElementById("connectionStatus");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "connectionStatus";
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(indicator);
  }
  
  if (status.connected) {
    const oscStatus = status.osc ? '🎵 OSC' : '⚠️ OSC Off';
    indicator.style.background = '#34C759';
    indicator.style.color = 'white';
    indicator.textContent = `✅ REST ${status.restPort} | ${oscStatus} ${status.oscPort}`;
  } else {
    indicator.style.background = '#FF3B30';
    indicator.style.color = 'white';
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

// Helper function to compare status states for highlighting
function hasHighlightingChanged(newStatus, oldStatus) {
  if (!oldStatus) return true;
  
  // Compare programClips arrays
  const newProgram = newStatus.programClips || [];
  const oldProgram = oldStatus.programClips || [];
  
  if (newProgram.length !== oldProgram.length) return true;
  
  // Check if program clips are different
  const newProgramKeys = newProgram.map(c => `L${c.layer}-C${c.column}`).sort();
  const oldProgramKeys = oldProgram.map(c => `L${c.layer}-C${c.column}`).sort();
  
  if (JSON.stringify(newProgramKeys) !== JSON.stringify(oldProgramKeys)) return true;
  
  // Compare preview
  const newPreview = newStatus.preview;
  const oldPreview = oldStatus.preview;
  
  if (!newPreview && !oldPreview) return false;
  if (!newPreview || !oldPreview) return true;
  
  return newPreview.layer !== oldPreview.layer || newPreview.column !== oldPreview.column;
}

function updateStatus(status) {
  // Only log major changes, not every status update
  const highlightingChanged = hasHighlightingChanged(status, lastStatusState);
  
  if (highlightingChanged) {
    console.log("🔍 Highlighting changed - updating UI");
    console.log("🔍 Program clips:", status.programClips);
    console.log("🔍 Preview:", status.preview);
  }
  
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
  
  // Only update highlights if something actually changed
  if (highlightingChanged) {
    console.log("🎨 Updating highlights due to state change");
    
    // Clear previous highlights (cells, headers, tiles)
    indexByKey.forEach(div => div.classList.remove("active-prog", "active-prev", "active-clip"));
    document.querySelectorAll('.grid .hdr').forEach(h => h.classList.remove('active-col-highlight','active-col-prog','active-col-prev'));
    document.getElementById('programTile')?.classList.remove('active');
    document.getElementById('previewTile')?.classList.remove('active');
    
    // Highlight ALL active program clips
    if (status.programClips && status.programClips.length > 0) {
      console.log("🟢 Highlighting program clips:", status.programClips);
      
      // Mark the program tile as active
      document.getElementById('programTile')?.classList.add('active');
      
      // Get all active columns to highlight headers
      const activeColumns = [...new Set(status.programClips.map(clip => clip.column))];
      
      status.programClips.forEach(clipInfo => {
        const key = `L${clipInfo.layer}-C${clipInfo.column}`;
        const el = indexByKey.get(key);
        if (el) {
          el.classList.add('active-prog','active-clip');
        }
      });
      
      // Highlight column headers for all active columns
      activeColumns.forEach(col => {
        document.querySelectorAll('.grid .hdr').forEach(h => { 
          if (h.textContent.trim() === `Col ${col}`) {
            h.classList.add('active-col-prog'); 
          }
        });
      });
    }
    
    // Highlight preview
    if (status.preview?.layer && status.preview?.column) {
      console.log("🔵 Highlighting preview:", status.preview);
      const key = `L${status.preview.layer}-C${status.preview.column}`;
      const el = indexByKey.get(key);
      if (el) {
        el.classList.add('active-prev','active-clip');
        document.getElementById('previewTile')?.classList.add('active');
        const col = status.preview.column;
        document.querySelectorAll('.grid .hdr').forEach(h => { 
          if (h.textContent.trim() === `Col ${col}`) {
            h.classList.add('active-col-prev'); 
          }
        });
      }
    }
  }
  
  // Store current state for next comparison
  lastStatusState = {
    programClips: status.programClips ? [...status.programClips] : [],
    preview: status.preview ? { ...status.preview } : null
  };
}

// (liveIndicators removed in favor of unified tiles)

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

// ---- NDI Preview System ----
let ndiPreviewEnabled = false;
let ndiStreamUrl = null;
let previewSettings = {
  ndiSource: 'ShowCall_Preview', // Default NDI source name
  streamUrl: '', // HTTP stream URL if using bridge
  autoConnect: false,
  quality: 'medium' // low, medium, high
};

function initNDIPreview() {
  console.log('🎬 Initializing NDI Preview...');
  
  const video = document.getElementById('ndiPreview');
  const overlay = document.querySelector('.preview-overlay');
  const status = document.getElementById('previewStatus');
  const toggleBtn = document.getElementById('previewToggle');
  const settingsBtn = document.getElementById('previewSettings');
  
  console.log('NDI elements found:', { video, overlay, status, toggleBtn, settingsBtn });
  
  // Load saved settings
  loadPreviewSettings();
  
  // Event handlers
  if (toggleBtn) {
    console.log('Adding click listener to toggle button');
    toggleBtn.addEventListener('click', function(e) {
      console.log('🎯 Toggle button clicked!');
      e.preventDefault();
      toggleNDIPreview();
    });
  } else {
    console.error('❌ Toggle button not found!');
  }
  
  if (settingsBtn) {
    console.log('Adding click listener to settings button');
    settingsBtn.addEventListener('click', function(e) {
      console.log('⚙️ Settings button clicked!');
      e.preventDefault();
      openPreviewSettings();
    });
  } else {
    console.error('❌ Settings button not found!');
  }
  
  // Update initial status
  if (status) {
    status.textContent = 'Ready for NDI preview (ensure OBS Virtual Camera is running)';
    console.log('✅ Initial status updated');
  } else {
    console.error('❌ Status element not found!');
  }
  
  // Video event handlers
  video.addEventListener('loadstart', () => {
    updatePreviewStatus('Loading...');
  });
  
  video.addEventListener('loadedmetadata', () => {
    updatePreviewInfo(video);
    overlay.classList.add('hidden');
  });
  
  video.addEventListener('error', (e) => {
    console.error('NDI Preview error:', e);
    updatePreviewStatus('Failed to load NDI stream');
    overlay.classList.remove('hidden');
  });
  
  video.addEventListener('play', () => {
    overlay.classList.add('hidden');
  });
  
  video.addEventListener('pause', () => {
    overlay.classList.remove('hidden');
  });
  
  // Auto-connect if enabled
  if (previewSettings.autoConnect && previewSettings.streamUrl) {
    setTimeout(() => toggleNDIPreview(), 1000);
  }
}

function toggleNDIPreview() {
  console.log('🎬 toggleNDIPreview called, current state:', ndiPreviewEnabled);
  
  const video = document.getElementById('ndiPreview');
  const toggleBtn = document.getElementById('previewToggle');
  
  if (!ndiPreviewEnabled) {
    console.log('📹 Enabling NDI preview via camera access...');
    // Enable preview via OBS Virtual Camera
    updatePreviewStatus('Requesting camera access...');
    
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    }).then(stream => {
      console.log('✅ Camera stream obtained:', stream);
      video.srcObject = stream;
      video.style.display = 'block';
      video.play();
      ndiPreviewEnabled = true;
      toggleBtn.textContent = '⏹️ Stop Preview';
      updatePreviewStatus('NDI Preview Active (via OBS Virtual Camera)');
      console.log('✅ NDI Preview started via Virtual Camera');
    }).catch(error => {
      console.error('❌ Camera access failed:', error);
      updatePreviewStatus('Camera access denied. Start OBS Virtual Camera first.');
    });
  } else {
    // Disable preview
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    video.style.display = 'none';
    ndiPreviewEnabled = false;
    toggleBtn.textContent = '📺 Enable Preview';
    updatePreviewStatus('NDI Preview stopped');
    console.log('🛑 NDI Preview stopped');
  }
}

function updatePreviewStatus(message) {
  document.getElementById('previewStatus').textContent = message;
}

function updatePreviewInfo(video) {
  const resolution = `${video.videoWidth}x${video.videoHeight}`;
  const frameRate = video.getVideoPlaybackQuality ? 
    `${Math.round(video.getVideoPlaybackQuality().totalVideoFrames / video.currentTime)}fps` : '—';
  
  document.getElementById('previewResolution').textContent = resolution;
  document.getElementById('previewFrameRate').textContent = frameRate;
  document.getElementById('previewSource').textContent = previewSettings.ndiSource;
}

function getDefaultStreamUrl() {
  // Default URLs for network setup (Resolume on 10.1.110.72)
  const possibleUrls = [
    `http://10.1.110.72:8080/ndi.mjpg`, // FFmpeg MJPEG bridge on Resolume machine
    `http://10.1.110.72:8888/stream.mjpg`, // OBS HTTP stream on Resolume machine
    `http://10.1.110.72:5000/video`, // Custom NDI bridge on Resolume machine
    `http://localhost:8080/ndi` // Local bridge (fallback)
  ];
  
  return previewSettings.streamUrl || possibleUrls[0];
}

function openPreviewSettings() {
  console.log('⚙️ openPreviewSettings called');
  
  // Simple instructions for OBS Virtual Camera setup
  alert(
    'NDI Preview Setup Instructions:\n\n' +
    '1. Open OBS Studio\n' +
    '2. Add NDI Source (pointing to 10.1.110.72:5960)\n' +
    '3. Go to Tools → Virtual Camera\n' +
    '4. Click "Start Virtual Camera"\n' +
    '5. Return to ShowCall and click "📺 Enable Preview"\n' +
    '6. Grant camera permission when prompted\n\n' +
    'The preview will show your NDI stream via OBS Virtual Camera!'
  );
}

function loadPreviewSettings() {
  try {
    const saved = localStorage.getItem('showcall_preview_settings');
    if (saved) {
      previewSettings = { ...previewSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load preview settings:', e);
  }
}

function savePreviewSettings() {
  try {
    localStorage.setItem('showcall_preview_settings', JSON.stringify(previewSettings));
  } catch (e) {
    console.warn('Failed to save preview settings:', e);
  }
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
  
  // Use fixed widths when expanded to ensure all columns are visible with scroll
  if (gridView.expandedColumns) {
    container.style.gridTemplateColumns = `160px repeat(${displayColumns}, 120px)`;
  } else {
    container.style.gridTemplateColumns = `160px repeat(${displayColumns}, minmax(100px, 1fr))`;
  }

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
      layerLabelEl.dataset.layer = layer.id; // Add data-layer attribute
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
        div.oncontextmenu = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`🔵 Right-click detected on L${layer.id}C${col}`);
          triggerPreview(layer.id, col);
          return false;
        };
        div.setAttribute("title", `${clip.name}\nLayer ${layer.id}, Column ${col}\nLeft-click: Program | Right-click: Preview`);
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

async function triggerPreview(layer, column) {
  if (!resolumeConnected) {
    showNotification("Not connected to Resolume", "error");
    return;
  }
  
  try {
    console.log(`🔵 Preview L${layer}C${column}...`);
    showNotification(`🔵 Preview L${layer}C${column} (right-click detected!)`, "info");
    
    // For now, just show notification with preview styling
    // You can implement actual preview logic here later
    // Preview in Resolume typically means selecting but not connecting
    
  } catch (error) {
    console.error("❌ Preview error:", error);
    showNotification(`Preview error: ${error.message}`, "error");
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
    console.log(`📋 Preset macro:`, JSON.stringify(preset.macro, null, 2));
    
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
      console.log(`📊 Results:`, result.results);
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
  
  // Calculate position based on existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  const topOffset = 20 + (existingNotifications.length * 70); // 70px spacing between notifications
  notification.style.top = `${topOffset}px`;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add("visible"), 10);
  setTimeout(() => {
    notification.classList.remove("visible");
    setTimeout(() => {
      notification.remove();
      // Reposition remaining notifications
      const remainingNotifications = document.querySelectorAll('.notification');
      remainingNotifications.forEach((notif, index) => {
        notif.style.top = `${20 + (index * 70)}px`;
      });
    }, 300);
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

  // Pop-out deck window (Electron only)
  const deckWindowBtn = document.getElementById('deckWindowBtn');
  if (deckWindowBtn) {
    deckWindowBtn.onclick = () => {
      if (window.electronAPI && window.electronAPI.openDeckWindow) {
        window.electronAPI.openDeckWindow();
      } else {
        // Fallback for web browser - open in new tab
        window.open('/deck.html', '_blank', 'width=300,height=600,resizable=yes,scrollbars=yes');
      }
    };
  }

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
    
    // Load NDI settings from localStorage (only if elements exist)
    const ndiStreamUrlEl = document.getElementById('ndiStreamUrl');
    const ndiSourceNameEl = document.getElementById('ndiSourceName');
    const ndiAutoConnectEl = document.getElementById('ndiAutoConnect');
    
    if (ndiStreamUrlEl) ndiStreamUrlEl.value = previewSettings.streamUrl || '';
    if (ndiSourceNameEl) ndiSourceNameEl.value = previewSettings.ndiSource || 'ShowCall_Preview';
    if (ndiAutoConnectEl) ndiAutoConnectEl.checked = previewSettings.autoConnect || false;
  } catch (error) {
    console.error('Failed to load settings:', error);
    // Set defaults
    document.getElementById('resolumeHost').value = '10.1.110.72';
    document.getElementById('resolumeRestPort').value = '8080';
    document.getElementById('resolumeOscPort').value = '7000';
    document.getElementById('serverPort').value = '3200';
    
    // Set NDI defaults (only if elements exist)
    const ndiStreamUrlEl = document.getElementById('ndiStreamUrl');
    const ndiSourceNameEl = document.getElementById('ndiSourceName');
    const ndiAutoConnectEl = document.getElementById('ndiAutoConnect');
    
    if (ndiStreamUrlEl) ndiStreamUrlEl.value = previewSettings.streamUrl || '';
    if (ndiSourceNameEl) ndiSourceNameEl.value = previewSettings.ndiSource || 'ShowCall_Preview';
    if (ndiAutoConnectEl) ndiAutoConnectEl.checked = previewSettings.autoConnect || false;
  }
}

async function saveSettings() {
  const settings = {
    resolumeHost: document.getElementById('resolumeHost').value.trim(),
    resolumeRestPort: parseInt(document.getElementById('resolumeRestPort').value),
    resolumeOscPort: parseInt(document.getElementById('resolumeOscPort').value),
    serverPort: parseInt(document.getElementById('serverPort').value)
  };

  // Save NDI settings to localStorage (only if elements exist)
  const ndiStreamUrlEl = document.getElementById('ndiStreamUrl');
  const ndiSourceNameEl = document.getElementById('ndiSourceName');
  const ndiAutoConnectEl = document.getElementById('ndiAutoConnect');
  
  if (ndiStreamUrlEl) previewSettings.streamUrl = ndiStreamUrlEl.value.trim();
  if (ndiSourceNameEl) previewSettings.ndiSource = ndiSourceNameEl.value.trim() || 'ShowCall_Preview';
  if (ndiAutoConnectEl) previewSettings.autoConnect = ndiAutoConnectEl.checked;
  savePreviewSettings();

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

// Presets editor
function initPresets() {
  const btn = document.getElementById('presetsBtn');
  const modal = document.getElementById('presetsModal');
  if (!btn || !modal) return;
  
  const close = modal.querySelector('.close');
  
  // Views
  const listView = document.getElementById('presetListView');
  const editView = document.getElementById('presetEditView');
  const presetList = document.getElementById('presetList');
  
  // List View Controls
  const addPresetBtn = document.getElementById('addPresetBtn');
  
  // Edit View Controls
  const backToListBtn = document.getElementById('backToListBtn');
  const editPresetTitle = document.getElementById('editPresetTitle');
  const presetIdInput = document.getElementById('presetId');
  const presetLabelInput = document.getElementById('presetLabel');
  const presetHotkeyInput = document.getElementById('presetHotkey');
  const presetColorInput = document.getElementById('presetColor');
  const macroStepsContainer = document.getElementById('macroSteps');
  const stepTypeSelect = document.getElementById('stepTypeSelect');
  const savePresetBtn = document.getElementById('savePresetBtn');
  const deletePresetBtn = document.getElementById('deletePresetBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  let currentPresets = [];
  let editingPresetIndex = -1;
  let currentMacroSteps = [];
  
  // Open modal and show list view
  const openModal = async () => {
    try {
      const data = await fetch('/api/presets').then(r => r.json());
      currentPresets = data.presets || [];
      renderPresetList();
      showListView();
      modal.style.display = 'flex';
    } catch (e) {
      showNotification('Failed to load presets', 'error');
    }
  };
  
  // Close modal
  const closeModal = () => {
    modal.style.display = 'none';
    showListView();
  };
  
  // Show list view
  const showListView = () => {
    listView.style.display = 'block';
    editView.style.display = 'none';
  };
  
  // Show edit view
  const showEditView = () => {
    listView.style.display = 'none';
    editView.style.display = 'block';
  };
  
  // Render preset list
  const renderPresetList = () => {
    if (currentPresets.length === 0) {
      presetList.innerHTML = `
        <div class="preset-list-empty">
          <h4>No Presets Yet</h4>
          <p>Click "Add New Preset" to create your first preset</p>
        </div>
      `;
      return;
    }
    
    presetList.innerHTML = '';
    currentPresets.forEach((preset, index) => {
      const item = document.createElement('div');
      item.className = 'preset-item';
      item.innerHTML = `
        <div class="preset-item-info">
          <div class="preset-item-color" style="background-color: ${preset.color || '#0ea5e9'}"></div>
          <div class="preset-item-details">
            <div class="preset-item-name">${preset.label || preset.id}</div>
            <div class="preset-item-meta">
              <span>🔑 ID: ${preset.id}</span>
              ${preset.hotkey ? `<span>⌨️ Key: ${preset.hotkey.toUpperCase()}</span>` : ''}
              <span>📋 ${preset.macro?.length || 0} steps</span>
            </div>
          </div>
        </div>
        <div class="preset-item-actions">
          <button class="preset-item-edit" data-index="${index}">Edit</button>
          <button class="preset-item-duplicate" data-index="${index}">Duplicate</button>
        </div>
      `;
      presetList.appendChild(item);
    });
    
    // Attach event listeners
    presetList.querySelectorAll('.preset-item-edit').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        editPreset(parseInt(btn.dataset.index));
      };
    });
    
    presetList.querySelectorAll('.preset-item-duplicate').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        duplicatePreset(parseInt(btn.dataset.index));
      };
    });
  };
  
  // Add new preset
  const addNewPreset = () => {
    editingPresetIndex = -1;
    editPresetTitle.textContent = 'Add New Preset';
    deletePresetBtn.style.display = 'none';
    
    // Clear form
    presetIdInput.value = '';
    presetLabelInput.value = '';
    presetHotkeyInput.value = '';
    presetColorInput.value = '#0ea5e9';
    currentMacroSteps = [];
    renderMacroSteps();
    
    showEditView();
  };
  
  // Edit existing preset
  const editPreset = (index) => {
    editingPresetIndex = index;
    const preset = currentPresets[index];
    
    editPresetTitle.textContent = 'Edit Preset';
    deletePresetBtn.style.display = 'block';
    
    // Populate form
    presetIdInput.value = preset.id;
    presetLabelInput.value = preset.label || '';
    presetHotkeyInput.value = preset.hotkey || '';
    presetColorInput.value = preset.color || '#0ea5e9';
    currentMacroSteps = JSON.parse(JSON.stringify(preset.macro || []));
    renderMacroSteps();
    
    showEditView();
  };
  
  // Duplicate preset
  const duplicatePreset = (index) => {
    const original = currentPresets[index];
    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.id = `${original.id}_copy`;
    duplicate.label = `${original.label} (Copy)`;
    duplicate.hotkey = '';
    
    currentPresets.push(duplicate);
    renderPresetList();
    showNotification('Preset duplicated', 'success');
  };
  
  // Render macro steps
  const renderMacroSteps = () => {
    if (currentMacroSteps.length === 0) {
      macroStepsContainer.innerHTML = '<div class="macro-steps-empty">No steps yet. Add steps using the dropdown below.</div>';
      return;
    }
    
    macroStepsContainer.innerHTML = '';
    currentMacroSteps.forEach((step, index) => {
      const stepEl = createMacroStepElement(step, index);
      macroStepsContainer.appendChild(stepEl);
    });
  };
  
  // Create macro step element
  const createMacroStepElement = (step, index) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'macro-step';
    stepEl.dataset.index = index;
    
    const { icon, typeLabel, params } = formatStepDisplay(step);
    
    stepEl.innerHTML = `
      <div class="macro-step-drag">☰</div>
      <div class="macro-step-icon">${icon}</div>
      <div class="macro-step-content">
        <div class="macro-step-type">${typeLabel}</div>
        <div class="macro-step-params">${params}</div>
      </div>
      <div class="macro-step-actions">
        <button class="macro-step-edit" data-index="${index}">Edit</button>
        <button class="macro-step-delete" data-index="${index}">×</button>
      </div>
    `;
    
    // Edit step
    stepEl.querySelector('.macro-step-edit').onclick = (e) => {
      e.stopPropagation();
      editMacroStep(index);
    };
    
    // Delete step
    stepEl.querySelector('.macro-step-delete').onclick = (e) => {
      e.stopPropagation();
      deleteMacroStep(index);
    };
    
    return stepEl;
  };
  
  // Format step display
  const formatStepDisplay = (step) => {
    const icons = {
      trigger: '🎬',
      triggerColumn: '📊',
      cut: '✂️',
      clear: '🧹',
      sleep: '⏱️'
    };
    
    let params = '';
    let typeLabel = step.type.charAt(0).toUpperCase() + step.type.slice(1);
    
    switch (step.type) {
      case 'trigger':
        params = `Layer ${step.layer}, Column ${step.column}`;
        break;
      case 'triggerColumn':
        params = `Column ${step.column}`;
        break;
      case 'sleep':
        params = `Wait ${step.ms}ms`;
        break;
      case 'cut':
        params = 'Preview → Program';
        break;
      case 'clear':
        params = 'Clear all layers';
        break;
    }
    
    return {
      icon: icons[step.type] || '📝',
      typeLabel,
      params
    };
  };
  
  // Add macro step
  const addMacroStep = (type) => {
    let newStep = { type };
    
    switch (type) {
      case 'trigger':
        newStep.layer = 1;
        newStep.column = 1;
        break;
      case 'triggerColumn':
        newStep.column = 1;
        break;
      case 'sleep':
        newStep.ms = 200;
        break;
    }
    
    currentMacroSteps.push(newStep);
    renderMacroSteps();
  };
  
  // Edit macro step
  const editMacroStep = (index) => {
    const step = currentMacroSteps[index];
    const stepEl = macroStepsContainer.querySelector(`[data-index="${index}"]`);
    
    // Create inline edit form
    const formEl = document.createElement('div');
    formEl.className = 'step-edit-form';
    
    switch (step.type) {
      case 'trigger':
        formEl.innerHTML = `
          <label>Layer: <input type="number" id="editLayer" value="${step.layer}" min="1"></label>
          <label>Column: <input type="number" id="editColumn" value="${step.column}" min="1"></label>
          <div class="step-edit-actions">
            <button class="btn-primary" id="saveStepEdit">Save</button>
            <button class="btn-secondary" id="cancelStepEdit">Cancel</button>
          </div>
        `;
        break;
      case 'triggerColumn':
        formEl.innerHTML = `
          <label>Column: <input type="number" id="editColumn" value="${step.column}" min="1"></label>
          <div class="step-edit-actions">
            <button class="btn-primary" id="saveStepEdit">Save</button>
            <button class="btn-secondary" id="cancelStepEdit">Cancel</button>
          </div>
        `;
        break;
      case 'sleep':
        formEl.innerHTML = `
          <label>Wait Time (ms): <input type="number" id="editMs" value="${step.ms}" min="0" step="50"></label>
          <div class="step-edit-actions">
            <button class="btn-primary" id="saveStepEdit">Save</button>
            <button class="btn-secondary" id="cancelStepEdit">Cancel</button>
          </div>
        `;
        break;
      default:
        return; // No params to edit
    }
    
    stepEl.appendChild(formEl);
    
    formEl.querySelector('#saveStepEdit').onclick = () => {
      if (step.type === 'trigger') {
        step.layer = parseInt(formEl.querySelector('#editLayer').value);
        step.column = parseInt(formEl.querySelector('#editColumn').value);
      } else if (step.type === 'triggerColumn') {
        step.column = parseInt(formEl.querySelector('#editColumn').value);
      } else if (step.type === 'sleep') {
        step.ms = parseInt(formEl.querySelector('#editMs').value);
      }
      renderMacroSteps();
    };
    
    formEl.querySelector('#cancelStepEdit').onclick = () => {
      renderMacroSteps();
    };
  };
  
  // Delete macro step
  const deleteMacroStep = (index) => {
    currentMacroSteps.splice(index, 1);
    renderMacroSteps();
  };
  
  // Save preset
  const savePreset = async () => {
    const id = presetIdInput.value.trim();
    const label = presetLabelInput.value.trim();
    const hotkey = presetHotkeyInput.value.trim();
    const color = presetColorInput.value;
    
    if (!id || !label) {
      showNotification('ID and Label are required', 'error');
      return;
    }
    
    // Check for duplicate ID (except when editing)
    const duplicateIndex = currentPresets.findIndex((p, i) => p.id === id && i !== editingPresetIndex);
    if (duplicateIndex !== -1) {
      showNotification('Preset ID already exists', 'error');
      return;
    }
    
    const preset = {
      id,
      label,
      hotkey: hotkey || undefined,
      color,
      macro: currentMacroSteps
    };
    
    if (editingPresetIndex === -1) {
      // Add new
      currentPresets.push(preset);
    } else {
      // Update existing
      currentPresets[editingPresetIndex] = preset;
    }
    
    // Save to server
    try {
      const data = { presets: currentPresets };
      const resp = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!resp.ok) throw new Error('Failed to save');
      
      showNotification('Preset saved successfully', 'success');
      
      // Refresh UI
      CFG = data;
      buildQuickCues(CFG);
      buildDeck(CFG);
      
      // Re-register hotkeys
      deckByKey.clear();
      (CFG.presets || []).forEach(p => {
        if (p.hotkey) deckByKey.set(String(p.hotkey).toLowerCase(), p);
      });
      
      renderPresetList();
      showListView();
    } catch (e) {
      showNotification('Failed to save preset', 'error');
    }
  };
  
  // Delete preset
  const deletePreset = async () => {
    if (editingPresetIndex === -1) return;
    
    if (!confirm('Are you sure you want to delete this preset?')) return;
    
    currentPresets.splice(editingPresetIndex, 1);
    
    // Save to server
    try {
      const data = { presets: currentPresets };
      const resp = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!resp.ok) throw new Error('Failed to save');
      
      showNotification('Preset deleted', 'success');
      
      // Refresh UI
      CFG = data;
      buildQuickCues(CFG);
      buildDeck(CFG);
      
      deckByKey.clear();
      (CFG.presets || []).forEach(p => {
        if (p.hotkey) deckByKey.set(String(p.hotkey).toLowerCase(), p);
      });
      
      renderPresetList();
      showListView();
    } catch (e) {
      showNotification('Failed to delete preset', 'error');
    }
  };
  
  // Event listeners
  btn.onclick = openModal;
  close.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  
  addPresetBtn.onclick = addNewPreset;
  backToListBtn.onclick = showListView;
  cancelEditBtn.onclick = showListView;
  savePresetBtn.onclick = savePreset;
  deletePresetBtn.onclick = deletePreset;
  
  stepTypeSelect.onchange = (e) => {
    const type = e.target.value;
    if (type) {
      addMacroStep(type);
      e.target.value = '';
    }
  };
}


// ---- Auto-Update Notifications ----
// ============================================
// ENHANCED AUTO-UPDATER UI
// ============================================

function setupUpdateNotifications() {
  console.log('🔄 Setting up enhanced update notifications...');
  
  if (!window.electronAPI) {
    console.log('⚠️ Electron API not available - running in browser mode');
    return;
  }
  
  const modal = document.getElementById('updateModal');
  const modalClose = modal?.querySelector('.close');
  const updateIndicator = document.getElementById('updateIndicator');
  
  // Views
  const checkingView = document.getElementById('updateCheckingView');
  const availableView = document.getElementById('updateAvailableView');
  const downloadingView = document.getElementById('updateDownloadingView');
  const readyView = document.getElementById('updateReadyView');
  const notAvailableView = document.getElementById('updateNotAvailableView');
  const errorView = document.getElementById('updateErrorView');
  
  let currentUpdateInfo = null;
  
  // Helper to show specific view
  function showUpdateView(viewId) {
    [checkingView, availableView, downloadingView, readyView, notAvailableView, errorView].forEach(v => {
      if (v) v.style.display = 'none';
    });
    const view = document.getElementById(viewId);
    if (view) view.style.display = 'block';
  }
  
  // Helper to open modal
  function openUpdateModal() {
    if (modal) modal.style.display = 'flex';
  }
  
  // Helper to close modal
  function closeUpdateModal() {
    if (modal) modal.style.display = 'none';
  }
  
  // Close button
  if (modalClose) {
    modalClose.onclick = closeUpdateModal;
  }
  
  // Click outside to close
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) closeUpdateModal();
    };
  }
  
  // Get current version
  window.electronAPI.getAppVersion().then(version => {
    const versionElements = document.querySelectorAll('#currentVersion');
    versionElements.forEach(el => el.textContent = version);
  });
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  // Checking for updates
  window.electronAPI.onUpdateChecking(() => {
    console.log('🔍 Checking for updates...');
    showUpdateView('updateCheckingView');
    openUpdateModal();
  });
  
  // Update available
  window.electronAPI.onUpdateAvailable((event, info) => {
    console.log('📦 Update available:', info);
    currentUpdateInfo = info;
    
    // Populate UI
    document.getElementById('updateVersion').textContent = info.version;
    document.getElementById('updateReleaseDate').textContent = info.releaseDate || 'Unknown';
    document.getElementById('updateSize').textContent = info.size || 'Unknown';
    
    // Show release notes if available
    const notesSection = document.getElementById('updateNotes');
    const notesContent = document.getElementById('updateNotesContent');
    if (info.releaseNotes) {
      // Release notes come as HTML from GitHub, no need to parse
      notesContent.innerHTML = info.releaseNotes;
      notesSection.style.display = 'block';
    } else {
      notesSection.style.display = 'none';
    }
    
    // Show indicator in header
    if (updateIndicator) {
      updateIndicator.querySelector('.update-text').textContent = `v${info.version} Available`;
      updateIndicator.className = 'update-indicator';
      updateIndicator.style.display = 'flex';
      updateIndicator.onclick = () => {
        showUpdateView('updateAvailableView');
        openUpdateModal();
      };
    }
    
    showUpdateView('updateAvailableView');
    openUpdateModal();
    showNotification(`Update v${info.version} available!`, 'info', 5000);
  });
  
  // Update not available
  window.electronAPI.onUpdateNotAvailable((event, info) => {
    console.log('✅ No updates available');
    document.getElementById('noUpdateVersion').textContent = info.version;
    showUpdateView('updateNotAvailableView');
    // Only show modal if user manually checked
    if (modal.style.display === 'flex') {
      showNotification('You\'re running the latest version', 'success', 3000);
    }
  });
  
  // Download progress
  window.electronAPI.onDownloadProgress((event, progress) => {
    console.log(`📥 Download progress: ${progress.percent}%`);
    
    // Update progress bar
    document.getElementById('downloadProgressBar').style.width = progress.percent + '%';
    document.getElementById('downloadPercent').textContent = progress.percent + '%';
    document.getElementById('downloadSpeed').textContent = progress.speed;
    document.getElementById('downloadTransferred').textContent = progress.transferred;
    document.getElementById('downloadTotal').textContent = progress.total;
    
    // Update header indicator
    if (updateIndicator) {
      updateIndicator.querySelector('.update-text').textContent = `Downloading ${progress.percent}%`;
      updateIndicator.className = 'update-indicator downloading';
    }
  });
  
  // Update downloaded
  window.electronAPI.onUpdateDownloaded((event, info) => {
    console.log('✅ Update downloaded:', info);
    
    document.getElementById('readyVersion').textContent = info.version;
    showUpdateView('updateReadyView');
    
    // Update header indicator
    if (updateIndicator) {
      updateIndicator.querySelector('.update-text').textContent = `v${info.version} Ready!`;
      updateIndicator.className = 'update-indicator ready';
      updateIndicator.onclick = () => {
        showUpdateView('updateReadyView');
        openUpdateModal();
      };
    }
    
    showNotification(`Update v${info.version} is ready to install!`, 'success', 8000);
  });
  
  // Update error
  window.electronAPI.onUpdateError((event, error) => {
    console.error('❌ Update error:', error);
    
    document.getElementById('updateErrorMessage').textContent = error.message || 'An unknown error occurred';
    document.getElementById('updateErrorStack').textContent = error.stack || 'No stack trace available';
    showUpdateView('updateErrorView');
    
    // Hide indicator
    if (updateIndicator) {
      updateIndicator.style.display = 'none';
    }
    
    showNotification('Update check failed', 'error', 5000);
  });
  
  // ============================================
  // BUTTON HANDLERS
  // ============================================
  
  // Download update button
  document.getElementById('downloadUpdateBtn')?.addEventListener('click', async () => {
    console.log('📥 User initiated download');
    showUpdateView('updateDownloadingView');
    
    const result = await window.electronAPI.downloadUpdate();
    if (!result.success) {
      document.getElementById('updateErrorMessage').textContent = result.error;
      showUpdateView('updateErrorView');
    }
  });
  
  // View release notes button
  document.getElementById('viewReleaseNotesBtn')?.addEventListener('click', () => {
    if (currentUpdateInfo?.version) {
      window.electronAPI.openReleaseNotes(currentUpdateInfo.version);
    }
  });
  
  // Remind later button
  document.getElementById('remindLaterBtn')?.addEventListener('click', () => {
    closeUpdateModal();
    showNotification('We\'ll remind you later', 'info', 3000);
  });
  
  // Install now button
  document.getElementById('installNowBtn')?.addEventListener('click', () => {
    console.log('🔄 User chose to install now');
    window.electronAPI.installUpdate();
  });
  
  // Install later button
  document.getElementById('installLaterBtn')?.addEventListener('click', () => {
    closeUpdateModal();
    showNotification('Update will install on next launch', 'info', 3000);
  });
  
  // Close no update button
  document.getElementById('closeNoUpdateBtn')?.addEventListener('click', () => {
    closeUpdateModal();
  });
  
  // Retry button
  document.getElementById('retryUpdateBtn')?.addEventListener('click', async () => {
    showUpdateView('updateCheckingView');
    await window.electronAPI.checkForUpdates();
  });
  
  // Close error button
  document.getElementById('closeErrorBtn')?.addEventListener('click', () => {
    closeUpdateModal();
  });
  
  // Manual check button in header
  const checkUpdateBtn = document.getElementById('checkUpdateBtn');
  if (checkUpdateBtn) {
    checkUpdateBtn.style.display = 'inline-block';
    checkUpdateBtn.onclick = async () => {
      console.log('🔄 Manual update check by user');
      showUpdateView('updateCheckingView');
      openUpdateModal();
      await window.electronAPI.checkForUpdates();
    };
  }
}

// Initialize when DOM is ready
// === VIDEO PREVIEW - Simple Implementation ===
let currentStream = null;

function initVideoPreview() {
  debugLog('🔥 VIDEO DEBUG: initVideoPreview() called');
  
  const videoSource = document.getElementById('videoSource');
  const permissionBtn = document.getElementById('requestPermission');
  const refreshBtn = document.getElementById('refreshSources');
  const videoDisplay = document.getElementById('videoDisplay');
  
  debugLog('🔥 VIDEO DEBUG: Elements found: ' + JSON.stringify({
    videoSource: !!videoSource,
    permissionBtn: !!permissionBtn,
    refreshBtn: !!refreshBtn,
    videoDisplay: !!videoDisplay
  }));
  
  if (!videoSource || !permissionBtn || !refreshBtn || !videoDisplay) {
    debugLog('🔥 VIDEO DEBUG: Missing elements!');
    console.log('🔥 VIDEO DEBUG: videoSource:', videoSource);
    console.log('🔥 VIDEO DEBUG: permissionBtn:', permissionBtn);
    console.log('🔥 VIDEO DEBUG: refreshBtn:', refreshBtn);
    console.log('🔥 VIDEO DEBUG: videoDisplay:', videoDisplay);
    return;
  }
  
  // Check API support
  debugLog('🔥 VIDEO DEBUG: Checking APIs...');
  debugLog('🔥 VIDEO DEBUG: navigator.mediaDevices: ' + !!navigator.mediaDevices);
  debugLog('🔥 VIDEO DEBUG: enumerateDevices: ' + !!navigator.mediaDevices?.enumerateDevices);
  debugLog('🔥 VIDEO DEBUG: getUserMedia: ' + !!navigator.mediaDevices?.getUserMedia);
  
  if (!navigator.mediaDevices?.enumerateDevices) {
    debugLog("🔥 VIDEO DEBUG: enumerateDevices() not supported.");
    return;
  }
  
  debugLog('🔥 VIDEO DEBUG: Adding event listeners...');
  // Event listeners
  permissionBtn.addEventListener('click', function() {
    debugLog('🔥 VIDEO DEBUG: Permission button clicked!');
    requestVideoPermission();
  });
  
  refreshBtn.addEventListener('click', function() {
    debugLog('🔥 VIDEO DEBUG: Refresh button clicked!');
    loadVideoSources();
  });
  
  videoSource.addEventListener('change', function() {
    debugLog('🔥 VIDEO DEBUG: Video source changed to: ' + videoSource.value);
    selectSource();
  });
  
  debugLog('🔥 VIDEO DEBUG: Event listeners added, loading initial sources...');
  // Load sources on init
  loadVideoSources();
  debugLog('🔥 VIDEO DEBUG: initVideoPreview() complete');
}

// Direct from MDN docs
function loadVideoSources() {
  debugLog('🔥 VIDEO DEBUG: loadVideoSources() called');
  const videoSource = document.getElementById('videoSource');
  
  if (!videoSource) {
    debugLog('🔥 VIDEO DEBUG: videoSource element not found in loadVideoSources');
    return;
  }
  
  debugLog('🔥 VIDEO DEBUG: Calling enumerateDevices...');
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      debugLog('🔥 VIDEO DEBUG: enumerateDevices success, found ' + devices.length + ' devices');
      console.log('🔥 VIDEO DEBUG: All devices:', devices);
      
      videoSource.innerHTML = '<option value="">Select video source...</option>';
      
      let videoDeviceCount = 0;
      devices.forEach((device, index) => {
        debugLog(`🔥 VIDEO DEBUG: Device ${index}: ${device.kind} - ${device.label || 'NO LABEL'} - ${device.deviceId.substring(0, 20)}...`);
        
        if (device.kind === 'videoinput') {
          videoDeviceCount++;
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.textContent = device.label || `Camera ${device.deviceId.substring(0, 8)}`;
          videoSource.appendChild(option);
          debugLog(`🔥 VIDEO DEBUG: Added video device: ${option.textContent}`);
        }
      });
      
      debugLog(`🔥 VIDEO DEBUG: Found ${videoDeviceCount} video devices total`);
      
      if (videoDeviceCount === 0) {
        debugLog('🔥 VIDEO DEBUG: No video devices found!');
        videoSource.innerHTML = '<option value="">No cameras found</option>';
      }
    })
    .catch((err) => {
      debugLog('🔥 VIDEO DEBUG: enumerateDevices failed: ' + err.name + ' - ' + err.message);
      console.error('🔥 VIDEO DEBUG: enumerateDevices failed:', err);
    });
}

// Direct from MDN docs  
async function requestVideoPermission() {
  console.log('🔥 VIDEO DEBUG: requestVideoPermission() called');
  try {
    console.log('🔥 VIDEO DEBUG: Requesting camera permission...');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log('🔥 VIDEO DEBUG: Permission granted! Stream:', stream);
    
    // Stop stream immediately, we just needed permission
    stream.getTracks().forEach(track => {
      console.log('🔥 VIDEO DEBUG: Stopping track:', track.label);
      track.stop();
    });
    
    console.log('🔥 VIDEO DEBUG: Reloading video sources after permission...');
    // Reload to get device labels
    loadVideoSources();
    console.log("🔥 VIDEO DEBUG: Permission process complete");
  } catch (err) {
    console.error('🔥 VIDEO DEBUG: Permission request failed:', err);
    console.error(`🔥 VIDEO DEBUG: Error name: ${err.name}, message: ${err.message}`);
  }
}

// Direct from MDN docs
async function selectSource() {
  console.log('🔥 VIDEO DEBUG: selectSource() called');
  const videoSource = document.getElementById('videoSource');
  const videoDisplay = document.getElementById('videoDisplay');
  const deviceId = videoSource.value;
  
  console.log('🔥 VIDEO DEBUG: Selected device ID:', deviceId);
  
  if (!deviceId) {
    console.log('🔥 VIDEO DEBUG: No device selected, returning');
    return;
  }
  
  // Stop current stream
  if (currentStream) {
    console.log('🔥 VIDEO DEBUG: Stopping current stream');
    currentStream.getTracks().forEach(track => track.stop());
  }
  
  try {
    console.log('🔥 VIDEO DEBUG: Requesting video stream for device:', deviceId.substring(0, 20) + '...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } }
    });
    
    console.log('🔥 VIDEO DEBUG: Got video stream:', stream);
    videoDisplay.srcObject = stream;
    currentStream = stream;
    
    videoDisplay.onloadedmetadata = () => {
      console.log('🔥 VIDEO DEBUG: Video metadata loaded, starting playback');
      videoDisplay.play().then(() => {
        console.log('🔥 VIDEO DEBUG: Video playback started successfully');
      }).catch(e => {
        console.error('🔥 VIDEO DEBUG: Video play failed:', e);
      });
    };
    
    console.log("🔥 VIDEO DEBUG: Video setup complete");
  } catch (err) {
    console.error('🔥 VIDEO DEBUG: Video stream failed:', err);
    console.error(`🔥 VIDEO DEBUG: Error name: ${err.name}, message: ${err.message}`);
  }
}


// === END VIDEO PREVIEW ===

// === WORKING VIDEO PREVIEW ===
function initWorkingVideo() {
  console.log('Working video init starting...');
  
  const output = document.getElementById('videoOutput');
  const video = document.getElementById('videoElement');
  const deviceSelect = document.getElementById('deviceSelect');
  const permBtn = document.getElementById('permBtn');
  const listBtn = document.getElementById('listBtn');
  
  if (!output || !video || !deviceSelect || !permBtn || !listBtn) {
    console.error('Video elements missing!');
    return;
  }
  
  function log(msg) {
    console.log(msg);
    output.innerHTML += msg + '<br>';
  }
  
  log('Video preview ready!');
  
  permBtn.onclick = async function() {
    log('Requesting permission...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      log('Permission granted!');
      stream.getTracks().forEach(t => t.stop());
      listDevices();
    } catch(e) {
      log('Permission denied: ' + e.message);
    }
  };
  
  listBtn.onclick = listDevices;
  
  async function listDevices() {
    log('Listing devices...');
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      log('Found ' + devices.length + ' devices');
      
      deviceSelect.innerHTML = '';
      devices.forEach(device => {
        if (device.kind === 'videoinput') {
          log('Video: ' + (device.label || 'Unknown') + ' - ' + device.deviceId.substr(0,10));
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.textContent = device.label || 'Camera';
          deviceSelect.appendChild(option);
        }
      });
    } catch(e) {
      log('Error listing devices: ' + e.message);
    }
  }
  
  deviceSelect.onchange = async function() {
    if (!deviceSelect.value) return;
    log('Starting video for: ' + deviceSelect.value.substr(0,10));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceSelect.value } }
      });
      video.srcObject = stream;
      log('Video started!');
    } catch(e) {
      log('Video failed: ' + e.message);
    }
  };
  
  // Auto-start
  listDevices();
  console.log('Working video init complete!');
}

// ═══════════════════════════════════════════════════════════════════════════
// CUE STACK SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

let cueStack = {
  name: "My Show",
  cues: [],
  currentIndex: -1  // Start at -1 (before cue 0/standby)
};

function initCueStack() {
  // Load cue stack from localStorage
  const saved = localStorage.getItem('showcall_cuestack');
  if (saved) {
    try {
      cueStack = JSON.parse(saved);
      // Ensure currentIndex is -1 if never advanced, for backward compatibility
      if (cueStack.currentIndex === undefined || cueStack.currentIndex === 0) {
        cueStack.currentIndex = -1;
      }
      
      // Ensure every cue stack has a Cue 0 (Standby) at the beginning
      if (!cueStack.cues || cueStack.cues.length === 0) {
        cueStack.cues = [
          {
            custom: {
              label: "Standby",
              color: "#6b7280",
              actions: [] // Does nothing - just a starting point
            }
          }
        ];
        saveCueStackState();
      } else {
        // Check if first cue is the standby cue - if not, prepend it
        const firstCue = cueStack.cues[0];
        const isStandbyCue = firstCue?.custom?.label === "Standby" && 
                            (!firstCue.custom.actions || firstCue.custom.actions.length === 0);
        
        if (!isStandbyCue) {
          // Prepend Cue 0 to existing cue stack
          cueStack.cues.unshift({
            custom: {
              label: "Standby",
              color: "#6b7280",
              actions: []
            }
          });
          // Adjust currentIndex since we inserted a cue at the beginning
          if (cueStack.currentIndex >= 0) {
            cueStack.currentIndex++;
          }
          saveCueStackState();
          console.log('🎭 Added Cue 0 (Standby) to existing cue stack');
        }
      }
    } catch (e) {
      console.error('Failed to load cue stack:', e);
      // Create default with Cue 0
      cueStack.cues = [
        {
          custom: {
            label: "Standby",
            color: "#6b7280",
            actions: []
          }
        }
      ];
      saveCueStackState();
    }
  } else {
    // No saved cue stack - create default with Cue 0 (Standby)
    cueStack.cues = [
      {
        custom: {
          label: "Standby",
          color: "#6b7280",
          actions: []
        }
      }
    ];
    saveCueStackState();
  }
  
  // Elements
  const cueStackList = document.getElementById('cueStackList');
  const executeNextCueBtn = document.getElementById('executeNextCueBtn');
  const resetCueStackBtn = document.getElementById('resetCueStackBtn');
  const manageCuesBtn = document.getElementById('manageCuesBtn');
  const cueStackNameEl = document.getElementById('cueStackName');
  const cueStackStatus = document.getElementById('cueStackStatus');
  const cueProgressText = document.getElementById('cueProgressText');
  const cueProgressFill = document.getElementById('cueProgressFill');
  
  // Modal elements
  const modal = document.getElementById('cueStackModal');
  const closeModal = document.getElementById('closeCueStackModal');
  const cueStackNameInput = document.getElementById('cueStackNameInput');
  const availablePresetsList = document.getElementById('availablePresetsList');
  const cueStackBuilderList = document.getElementById('cueStackBuilderList');
  const saveCueStackBtn = document.getElementById('saveCueStackBtn');
  const cancelCueStackBtn = document.getElementById('cancelCueStackBtn');
  const clearCueStackBtn = document.getElementById('clearCueStackBtn');
  
  // Render the cue stack list
  function renderCueStack() {
    if (!cueStack.cues || cueStack.cues.length === 0) {
      cueStackList.innerHTML = `
        <div class="cuestack-empty">
          <div class="cuestack-empty-icon">🎭</div>
          <div class="cuestack-empty-text">No cues in the stack yet.</div>
          <button onclick="document.getElementById('manageCuesBtn').click()" class="cuestack-btn primary">
            + Add Cues
          </button>
        </div>
      `;
      executeNextCueBtn.disabled = true;
      resetCueStackBtn.disabled = true;
      cueStackStatus.textContent = 'Empty';
      cueStackStatus.className = 'cuestack-status';
      cueProgressText.textContent = 'No cues in stack';
      cueProgressFill.style.width = '0%';
      return;
    }
    
    cueStackList.innerHTML = '';
    cueStack.cues.forEach((cue, index) => {
      // Support both preset-based and custom cues
      let preset = null;
      let isCustom = false;
      
      if (cue.presetId) {
        preset = CFG.presets?.find(p => p.id === cue.presetId);
        if (!preset) return; // Skip if preset not found
      } else if (cue.custom) {
        isCustom = true;
      }
      
      const cueItem = document.createElement('div');
      cueItem.className = 'cue-item';
      
      // Visual state logic:
      // - currentIndex = -1: Nothing executed yet (all cues waiting)
      // - currentIndex = 0: Cue 0 was executed and is ACTIVE, Cue 1 is NEXT
      // - currentIndex = 1: Cue 0 completed, Cue 1 is ACTIVE, Cue 2 is NEXT
      // Active = the cue that was just executed (currentIndex)
      // Next = the cue that will execute on next GO (currentIndex + 1)
      // Completed = all cues before currentIndex
      
      if (cueStack.currentIndex === -1) {
        // Before show starts - Cue 0 is next, nothing active
        if (index === 0) {
          cueItem.classList.add('next');
        }
      } else {
        // Show is running
        if (index === cueStack.currentIndex) {
          cueItem.classList.add('active'); // Currently running cue
        } else if (index === cueStack.currentIndex + 1) {
          cueItem.classList.add('next'); // Next cue to execute
        } else if (index < cueStack.currentIndex) {
          cueItem.classList.add('completed'); // Already executed
        }
      }
      
      // Keyboard shortcuts: 1-9 trigger cues 0-8, 0 triggers cue 9
      const hotkeyNum = index < 9 ? (index + 1) : (index === 9 ? 0 : null);
      const hotkeyBadge = hotkeyNum !== null 
        ? `<div style="min-width: 24px; height: 24px; border-radius: 6px; background: rgba(251, 191, 36, 0.2); border: 1px solid rgba(251, 191, 36, 0.4); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; color: rgb(251, 191, 36); flex-shrink: 0;">${hotkeyNum}</div>` 
        : '<div style="min-width: 24px;"></div>'; // Spacer for alignment
      
      // Cue number is 0-based (0, 1, 2, 3...)
      const cueNumber = index;
      
      if (isCustom) {
        cueItem.innerHTML = `
          ${hotkeyBadge}
          <div class="cue-number">${cueNumber}</div>
          <div class="cue-content">
            <div class="cue-label">${cue.custom.label}</div>
            <div class="cue-details">
              <span class="cue-color-dot" style="background-color: ${cue.custom.color || '#7dd3fc'}"></span>
              <span>${cue.custom.actions?.length || 0} actions</span>
            </div>
          </div>
          <div class="cue-actions">
            <button class="cue-action-btn" onclick="jumpToCue(${index})" title="Jump to this cue">
              ↻ Jump
            </button>
            <button class="cue-action-btn" onclick="executeSpecificCue(${index})" title="Execute this cue">
              ▶ Go
            </button>
          </div>
        `;
      } else {
        cueItem.innerHTML = `
          ${hotkeyBadge}
          <div class="cue-number">${cueNumber}</div>
          <div class="cue-content">
            <div class="cue-label">${preset.label}</div>
            <div class="cue-details">
              <span class="cue-color-dot" style="background-color: ${preset.color}"></span>
              <span>${preset.macro?.length || 0} steps</span>
              ${preset.hotkey ? `<span>Preset Hotkey: <kbd>${preset.hotkey}</kbd></span>` : ''}
            </div>
          </div>
          <div class="cue-actions">
            <button class="cue-action-btn" onclick="jumpToCue(${index})" title="Jump to this cue">
              ↻ Jump
            </button>
            <button class="cue-action-btn" onclick="executeSpecificCue(${index})" title="Execute this cue">
              ▶ Go
            </button>
          </div>
        `;
      }
      
      cueStackList.appendChild(cueItem);
    });
    
    // Update UI state
    cueStackNameEl.textContent = cueStack.name || 'My Show';
    executeNextCueBtn.disabled = cueStack.currentIndex >= cueStack.cues.length;
    resetCueStackBtn.disabled = false;
    
    // Update status
    if (cueStack.currentIndex >= cueStack.cues.length) {
      cueStackStatus.textContent = 'Complete';
      cueStackStatus.className = 'cuestack-status';
    } else {
      cueStackStatus.textContent = 'Ready';
      cueStackStatus.className = 'cuestack-status active';
    }
    
    // Update progress
    const progress = cueStack.cues.length > 0 
      ? ((cueStack.currentIndex + 1) / cueStack.cues.length) * 100 
      : 0;
    cueProgressFill.style.width = `${progress}%`;
    
    // Show which cue is NEXT to execute (0-based numbering)
    if (cueStack.currentIndex >= cueStack.cues.length) {
      cueProgressText.textContent = `Complete - ${cueStack.cues.length} of ${cueStack.cues.length} cues executed`;
    } else if (cueStack.currentIndex === -1) {
      cueProgressText.textContent = `Ready: Press GO to start with Cue 0`;
    } else {
      const nextCueNum = cueStack.currentIndex + 1;
      cueProgressText.textContent = `Ready: Cue ${nextCueNum} of ${cueStack.cues.length - 1}`;
    }
  }
  
  // Execute next cue
  async function executeNextCue() {
    // Increment to next cue first
    cueStack.currentIndex++;
    
    if (cueStack.currentIndex >= cueStack.cues.length) {
      cueStack.currentIndex = cueStack.cues.length; // Cap at length
      showNotification('No more cues in the stack', 'info');
      renderCueStack();
      return;
    }
    
    const cue = cueStack.cues[cueStack.currentIndex];
    const cueNumber = cueStack.currentIndex; // 0-based cue number
    
    console.log(`🎬 GO button pressed - executing cue at index: ${cueStack.currentIndex}`);
    console.log(`📦 Cue data:`, JSON.stringify(cue, null, 2));
    
    try {
      // Handle custom cues
      if (cue.custom) {
        console.log(`🎬 GO: Executing cue #${cueNumber} - ${cue.custom.label}`);
        showNotification(`GO: Cue #${cueNumber} - ${cue.custom.label}`, 'info');
        await executeCustomCue(cue.custom);
      } 
      // Handle preset-based cues
      else if (cue.presetId) {
        const preset = CFG.presets?.find(p => p.id === cue.presetId);
        console.log(`🔍 Looking for preset with ID: ${cue.presetId}`);
        console.log(`📚 Available presets:`, CFG.presets?.map(p => ({ id: p.id, label: p.label })));
        console.log(`✅ Found preset:`, preset ? { id: preset.id, label: preset.label, macroLength: preset.macro?.length } : 'NOT FOUND');
        
        if (!preset) {
          showNotification(`Preset not found: ${cue.presetId}`, 'error');
          return;
        }
        console.log(`🎬 GO: Executing cue #${cueNumber} - ${preset.label}`);
        showNotification(`GO: Cue #${cueNumber} - ${preset.label}`, 'info');
        await firePreset(preset);
      }
      
      // After execution, save and render
      saveCueStackState();
      renderCueStack();
      
      if (cueStack.currentIndex >= cueStack.cues.length - 1) {
        showNotification('🎉 Cue stack complete!', 'success');
      }
    } catch (error) {
      console.error('Failed to execute cue:', error);
      showNotification(`Failed to execute cue: ${error.message}`, 'error');
    }
  }
  
  // Execute custom cue actions
  async function executeCustomCue(custom) {
    if (!custom.actions || custom.actions.length === 0) {
      showNotification('Custom cue has no actions', 'warning');
      return;
    }
    
    // Execute each action like a macro step
    for (const action of custom.actions) {
      try {
        switch (action.type) {
          case 'trigger':
            await fetch('/api/trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ layer: action.layer, column: action.column })
            });
            break;
          
          case 'triggerColumn':
            await fetch('/api/triggerColumn', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ column: action.column })
            });
            break;
          
          case 'cut':
            await fetch('/api/cut', { method: 'POST' });
            break;
          
          case 'clear':
            await fetch('/api/clear', { method: 'POST' });
            break;
          
          case 'sleep':
            await new Promise(resolve => setTimeout(resolve, action.ms));
            break;
        }
      } catch (error) {
        console.error(`Failed to execute custom action:`, action, error);
        throw error;
      }
    }
  }
  
  // Reset cue stack
  function resetCueStack() {
    if (cueStack.currentIndex === -1) return;
    
    if (confirm('Reset cue stack to the beginning?')) {
      cueStack.currentIndex = -1;
      saveCueStackState();
      renderCueStack();
      showNotification('Cue stack reset to standby', 'info');
    }
  }
  
  // Jump to specific cue
  window.jumpToCue = function(index) {
    if (confirm(`Jump to cue ${index}?`)) {
      cueStack.currentIndex = index;
      saveCueStackState();
      renderCueStack();
      showNotification(`Jumped to cue ${index}`, 'info');
    }
  };
  
  // Execute specific cue
  window.executeSpecificCue = async function(index) {
    const cue = cueStack.cues[index];
    
    if (!cue) {
      showNotification('Cue not found', 'error');
      return;
    }
    
    try {
      if (cue.custom) {
        console.log(`🎬 Executing custom cue ${index} directly: ${cue.custom.label}`);
        await executeCustomCue(cue.custom);
        showNotification(`Executed: ${cue.custom.label}`, 'success');
      } else if (cue.presetId) {
        const preset = CFG.presets?.find(p => p.id === cue.presetId);
        if (!preset) {
          showNotification('Preset not found', 'error');
          return;
        }
        console.log(`🎬 Executing cue ${index} directly: ${preset.label}`);
        await firePreset(preset);
        showNotification(`Executed: ${preset.label}`, 'success');
      }
    } catch (error) {
      showNotification(`Failed: ${error.message}`, 'error');
    }
  };
  
  // Save cue stack state to localStorage
  function saveCueStackState() {
    try {
      localStorage.setItem('showcall_cuestack', JSON.stringify(cueStack));
    } catch (e) {
      console.error('Failed to save cue stack:', e);
    }
  }
  
  // Open management modal
  function openManagementModal() {
    cueStackNameInput.value = cueStack.name || 'My Show';
    renderAvailablePresets();
    renderCueStackBuilder();
    modal.style.display = 'flex';
  }
  
  // Close modal
  function closeManagementModal() {
    modal.style.display = 'none';
  }
  
  // Render available presets
  function renderAvailablePresets() {
    availablePresetsList.innerHTML = '';
    
    if (!CFG.presets || CFG.presets.length === 0) {
      availablePresetsList.innerHTML = '<div style="padding: 12px; opacity: 0.6;">No presets available. Create presets first!</div>';
      return;
    }
    
    CFG.presets.forEach(preset => {
      const presetItem = document.createElement('div');
      presetItem.className = 'preset-selector-item';
      presetItem.style.cssText = `
        padding: 8px 12px;
        margin-bottom: 6px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.2s ease;
      `;
      
      presetItem.innerHTML = `
        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${preset.color}"></div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 13px;">${preset.label}</div>
          <div style="font-size: 11px; opacity: 0.6;">${preset.macro?.length || 0} steps${preset.hotkey ? ` • Hotkey: ${preset.hotkey}` : ''}</div>
        </div>
        <button style="background: rgba(125,211,252,0.2); border: 1px solid rgba(125,211,252,0.3); color: var(--accent-light); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
          + Add
        </button>
      `;
      
      presetItem.querySelector('button').onclick = (e) => {
        e.stopPropagation();
        addPresetToCueStack(preset.id);
      };
      
      presetItem.onmouseenter = () => {
        presetItem.style.background = 'rgba(255,255,255,0.08)';
        presetItem.style.borderColor = 'rgba(125,211,252,0.3)';
      };
      
      presetItem.onmouseleave = () => {
        presetItem.style.background = 'rgba(255,255,255,0.05)';
        presetItem.style.borderColor = 'rgba(255,255,255,0.1)';
      };
      
      availablePresetsList.appendChild(presetItem);
    });
  }
  
  // Add preset to cue stack
  function addPresetToCueStack(presetId) {
    const preset = CFG.presets?.find(p => p.id === presetId);
    console.log(`➕ Adding preset to cue stack: ID="${presetId}", Label="${preset?.label}"`);
    cueStack.cues.push({ presetId });
    renderCueStackBuilder();
    showNotification(`Cue added: ${preset?.label || presetId}`, 'success');
  }
  
  // Render cue stack builder
  function renderCueStackBuilder() {
    cueStackBuilderList.innerHTML = '';
    
    if (cueStack.cues.length === 0) {
      cueStackBuilderList.innerHTML = '<div style="padding: 24px; text-align: center; opacity: 0.5;">No cues yet. Add presets from above.</div>';
      return;
    }
    
    cueStack.cues.forEach((cue, index) => {
      const cueItem = document.createElement('div');
      cueItem.style.cssText = `
        padding: 10px 12px;
        margin-bottom: 6px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: move;
      `;
      cueItem.draggable = true;
      cueItem.dataset.index = index;
      
      let label, color, isMissing = false;
      
      // Handle custom cues
      if (cue.custom) {
        label = cue.custom.label || 'Custom Cue';
        color = cue.custom.color || '#8b5cf6';
      } 
      // Handle preset-based cues
      else if (cue.presetId) {
        const preset = CFG.presets?.find(p => p.id === cue.presetId);
        if (preset) {
          label = preset.label;
          color = preset.color;
        } else {
          label = `⚠️ Missing Preset (ID: ${cue.presetId})`;
          color = '#ef4444';
          isMissing = true;
        }
      } else {
        label = '⚠️ Invalid Cue';
        color = '#ef4444';
        isMissing = true;
      }
      
      cueItem.innerHTML = `
        <div style="opacity: 0.5; cursor: move;">☰</div>
        <div style="min-width: 24px; height: 24px; border-radius: 50%; background: rgba(125,211,252,0.2); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: var(--accent-light);">
          ${index}
        </div>
        <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}"></div>
        <div style="flex: 1; font-weight: 600; font-size: 13px; ${isMissing ? 'opacity: 0.6;' : ''}">${label}</div>
        <button class="remove-cue-btn" data-index="${index}" style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); color: var(--red); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
          Remove
        </button>
      `;
      
      // Drag and drop handlers
      cueItem.addEventListener('dragstart', handleDragStart);
      cueItem.addEventListener('dragover', handleDragOver);
      cueItem.addEventListener('drop', handleDrop);
      cueItem.addEventListener('dragend', handleDragEnd);
      
      cueStackBuilderList.appendChild(cueItem);
    });
    
    // Attach remove handlers
    document.querySelectorAll('.remove-cue-btn').forEach(btn => {
      btn.onclick = () => {
        const index = parseInt(btn.dataset.index);
        cueStack.cues.splice(index, 1);
        renderCueStackBuilder();
        showNotification('Cue removed', 'info');
      };
    });
  }
  
  // Drag and drop functionality
  let draggedElement = null;
  
  function handleDragStart(e) {
    draggedElement = this;
    this.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
  }
  
  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }
  
  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    
    if (draggedElement !== this) {
      const fromIndex = parseInt(draggedElement.dataset.index);
      const toIndex = parseInt(this.dataset.index);
      
      // Reorder the cues array
      const [movedCue] = cueStack.cues.splice(fromIndex, 1);
      cueStack.cues.splice(toIndex, 0, movedCue);
      
      renderCueStackBuilder();
    }
    
    return false;
  }
  
  function handleDragEnd(e) {
    this.style.opacity = '1';
    draggedElement = null;
  }
  
  // Save cue stack
  function saveCueStackFromModal() {
    cueStack.name = cueStackNameInput.value.trim() || 'My Show';
    saveCueStackState();
    renderCueStack();
    closeManagementModal();
    showNotification('Cue stack saved', 'success');
  }
  
  // Clear cue stack
  function clearCueStackFromModal() {
    if (confirm('Clear the entire cue stack?')) {
      // Always create a new Cue 0 (Standby) when clearing
      cueStack.cues = [
        {
          custom: {
            label: "Standby",
            color: "#6b7280",
            actions: [] // Does nothing - just a starting point
          }
        }
      ];
      cueStack.currentIndex = -1;
      renderCueStackBuilder();
      showNotification('Cue stack cleared - Cue 0 (Standby) created', 'info');
    }
  }
  
  // Event listeners
  executeNextCueBtn.onclick = executeNextCue;
  resetCueStackBtn.onclick = resetCueStack;
  manageCuesBtn.onclick = openManagementModal;
  closeModal.onclick = closeManagementModal;
  cancelCueStackBtn.onclick = closeManagementModal;
  saveCueStackBtn.onclick = saveCueStackFromModal;
  clearCueStackBtn.onclick = clearCueStackFromModal;
  
  modal.onclick = (e) => {
    if (e.target === modal) closeManagementModal();
  };
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't interfere with inputs or other modals
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (document.getElementById('settingsModal').style.display === 'flex') return;
    if (document.getElementById('presetsModal').style.display === 'flex') return;
    if (document.getElementById('updateModal').style.display === 'flex') return;
    if (modal.style.display === 'flex') return;
    
    // Space = Execute next cue
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      if (!executeNextCueBtn.disabled) {
        executeNextCue();
      }
    }
    
    // R = Reset cue stack
    if (e.code === 'KeyR' && !e.repeat && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      resetCueStack();
    }
    
    // Number keys 1-9 and 0 = Execute specific cues
    // 1-9 triggers cues 1-9, 0 triggers cue 10
    if (!e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
      let cueIndex = -1;
      
      // Check for Digit keys (1-9, 0)
      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        cueIndex = parseInt(e.code.replace('Digit', '')) - 1; // 0-indexed
      } else if (e.code === 'Digit0') {
        cueIndex = 9; // 10th cue (0-indexed)
      }
      // Also check numpad keys
      else if (e.code >= 'Numpad1' && e.code <= 'Numpad9') {
        cueIndex = parseInt(e.code.replace('Numpad', '')) - 1;
      } else if (e.code === 'Numpad0') {
        cueIndex = 9;
      }
      
      // Execute the cue if it exists
      if (cueIndex >= 0 && cueIndex < cueStack.cues.length) {
        e.preventDefault();
        console.log(`🎹 Keyboard shortcut: Executing cue ${cueIndex + 1}`);
        window.executeSpecificCue(cueIndex);
      }
    }
  });
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOM CUE BUILDER
  // ═══════════════════════════════════════════════════════════════════════════
  
  const customCueModal = document.getElementById('customCueModal');
  const closeCustomCueModal = document.getElementById('closeCustomCueModal');
  const addCustomCueBtn = document.getElementById('addCustomCueBtn');
  const cancelCustomCueBtn = document.getElementById('cancelCustomCueBtn');
  const saveCustomCueBtn = document.getElementById('saveCustomCueBtn');
  const customCueLabel = document.getElementById('customCueLabel');
  const customCueColor = document.getElementById('customCueColor');
  const customCueActionsList = document.getElementById('customCueActionsList');
  const addActionBtn = document.getElementById('addActionBtn');
  
  let customCueActions = [];
  
  // Open custom cue modal
  addCustomCueBtn.onclick = () => {
    customCueLabel.value = '';
    customCueColor.value = '#7dd3fc';
    customCueActions = [];
    renderCustomCueActions();
    customCueModal.style.display = 'flex';
  };
  
  // Close custom cue modal
  const closeCustomModal = () => {
    customCueModal.style.display = 'none';
  };
  
  closeCustomCueModal.onclick = closeCustomModal;
  cancelCustomCueBtn.onclick = closeCustomModal;
  customCueModal.onclick = (e) => {
    if (e.target === customCueModal) closeCustomModal();
  };
  
  // Show action type selector dropdown
  addActionBtn.onclick = () => {
    // Create a temporary dropdown to select action type
    const dropdown = document.createElement('select');
    dropdown.style.cssText = `
      width: 100%;
      padding: 8px;
      background: rgba(0,0,0,0.5);
      border: 1px solid rgba(125, 211, 252, 0.5);
      border-radius: 6px;
      color: white;
      font-size: 13px;
      margin-top: 8px;
    `;
    
    dropdown.innerHTML = `
      <option value="">Select Action Type...</option>
      <option value="trigger">🎬 Trigger Clip (Layer + Column)</option>
      <option value="triggerColumn">📊 Trigger Column</option>
      <option value="cut">✂️ Cut to Program</option>
      <option value="clear">🧹 Clear All Layers</option>
      <option value="sleep">⏱️ Wait / Delay</option>
    `;
    
    dropdown.onchange = () => {
      if (dropdown.value) {
        addCustomAction(dropdown.value);
        dropdown.remove();
      }
    };
    
    addActionBtn.after(dropdown);
    dropdown.focus();
  };
  
  // Add custom action based on type
  function addCustomAction(type) {
    let newAction = { type };
    
    switch (type) {
      case 'trigger':
        newAction.layer = 1;
        newAction.column = 1;
        break;
      case 'triggerColumn':
        newAction.column = 1;
        break;
      case 'sleep':
        newAction.ms = 200;
        break;
    }
    
    customCueActions.push(newAction);
    renderCustomCueActions();
  }
  
  // Render custom cue actions (visual builder like presets)
  function renderCustomCueActions() {
    if (customCueActions.length === 0) {
      customCueActionsList.innerHTML = '<div style="text-align: center; padding: 20px; opacity: 0.5;">No actions yet. Click "+ Add Action" below.</div>';
      return;
    }
    
    customCueActionsList.innerHTML = '';
    customCueActions.forEach((action, index) => {
      const actionEl = createCustomActionElement(action, index);
      customCueActionsList.appendChild(actionEl);
    });
  }
  
  // Create custom action element (similar to macro step)
  function createCustomActionElement(action, index) {
    const actionEl = document.createElement('div');
    actionEl.className = 'macro-step'; // Reuse macro-step styling
    actionEl.dataset.index = index;
    actionEl.style.cssText = `
      padding: 12px;
      margin-bottom: 8px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    
    const { icon, typeLabel, params } = formatCustomActionDisplay(action);
    
    actionEl.innerHTML = `
      <div style="opacity: 0.5; cursor: move;">☰</div>
      <div style="font-size: 20px;">${icon}</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 13px; color: var(--accent-light);">${typeLabel}</div>
        <div style="font-size: 12px; opacity: 0.7;">${params}</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="action-edit-btn" data-index="${index}" style="background: rgba(125, 211, 252, 0.2); border: 1px solid rgba(125, 211, 252, 0.3); color: var(--accent-light); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">Edit</button>
        <button class="action-delete-btn" data-index="${index}" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--red); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">×</button>
      </div>
    `;
    
    // Edit action
    actionEl.querySelector('.action-edit-btn').onclick = (e) => {
      e.stopPropagation();
      editCustomAction(index);
    };
    
    // Delete action
    actionEl.querySelector('.action-delete-btn').onclick = (e) => {
      e.stopPropagation();
      customCueActions.splice(index, 1);
      renderCustomCueActions();
    };
    
    return actionEl;
  }
  
  // Format custom action display
  function formatCustomActionDisplay(action) {
    const icons = {
      trigger: '🎬',
      triggerColumn: '📊',
      cut: '✂️',
      clear: '🧹',
      sleep: '⏱️'
    };
    
    let params = '';
    let typeLabel = action.type.charAt(0).toUpperCase() + action.type.slice(1).replace(/([A-Z])/g, ' $1');
    
    switch (action.type) {
      case 'trigger':
        params = `Layer ${action.layer}, Column ${action.column}`;
        break;
      case 'triggerColumn':
        params = `Column ${action.column}`;
        break;
      case 'sleep':
        params = `Wait ${action.ms}ms`;
        break;
      case 'cut':
        params = 'Preview → Program';
        break;
      case 'clear':
        params = 'Clear all layers';
        break;
    }
    
    return {
      icon: icons[action.type] || '📝',
      typeLabel,
      params
    };
  }
  
  // Edit custom action inline
  function editCustomAction(index) {
    const action = customCueActions[index];
    const actionEl = customCueActionsList.querySelector(`[data-index="${index}"]`);
    
    // Create inline edit form
    const formEl = document.createElement('div');
    formEl.style.cssText = `
      padding: 12px;
      margin-top: 8px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(125, 211, 252, 0.3);
      border-radius: 6px;
    `;
    
    switch (action.type) {
      case 'trigger':
        formEl.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div>
              <label style="font-size: 11px; opacity: 0.8; display: block; margin-bottom: 4px;">Layer:</label>
              <input type="number" id="editActionLayer" value="${action.layer}" min="1" style="width: 100%; padding: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: white; font-size: 13px;">
            </div>
            <div>
              <label style="font-size: 11px; opacity: 0.8; display: block; margin-bottom: 4px;">Column:</label>
              <input type="number" id="editActionColumn" value="${action.column}" min="1" style="width: 100%; padding: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: white; font-size: 13px;">
            </div>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button id="saveActionEdit" style="background: var(--accent-light); color: var(--bg-dark); padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px; border: none;">Save</button>
            <button id="cancelActionEdit" style="background: rgba(255,255,255,0.1); color: white; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px; border: 1px solid rgba(255,255,255,0.2);">Cancel</button>
          </div>
        `;
        break;
      case 'triggerColumn':
        formEl.innerHTML = `
          <div style="margin-bottom: 10px;">
            <label style="font-size: 11px; opacity: 0.8; display: block; margin-bottom: 4px;">Column:</label>
            <input type="number" id="editActionColumn" value="${action.column}" min="1" style="width: 100%; padding: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: white; font-size: 13px;">
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button id="saveActionEdit" style="background: var(--accent-light); color: var(--bg-dark); padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px; border: none;">Save</button>
            <button id="cancelActionEdit" style="background: rgba(255,255,255,0.1); color: white; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px; border: 1px solid rgba(255,255,255,0.2);">Cancel</button>
          </div>
        `;
        break;
      case 'sleep':
        formEl.innerHTML = `
          <div style="margin-bottom: 10px;">
            <label style="font-size: 11px; opacity: 0.8; display: block; margin-bottom: 4px;">Wait Time (milliseconds):</label>
            <input type="number" id="editActionMs" value="${action.ms}" min="0" step="50" style="width: 100%; padding: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: white; font-size: 13px;">
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button id="saveActionEdit" style="background: var(--accent-light); color: var(--bg-dark); padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px; border: none;">Save</button>
            <button id="cancelActionEdit" style="background: rgba(255,255,255,0.1); color: white; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px; border: 1px solid rgba(255,255,255,0.2);">Cancel</button>
          </div>
        `;
        break;
      default:
        return; // No params to edit
    }
    
    actionEl.appendChild(formEl);
    
    formEl.querySelector('#saveActionEdit').onclick = () => {
      if (action.type === 'trigger') {
        action.layer = parseInt(formEl.querySelector('#editActionLayer').value);
        action.column = parseInt(formEl.querySelector('#editActionColumn').value);
      } else if (action.type === 'triggerColumn') {
        action.column = parseInt(formEl.querySelector('#editActionColumn').value);
      } else if (action.type === 'sleep') {
        action.ms = parseInt(formEl.querySelector('#editActionMs').value);
      }
      renderCustomCueActions();
    };
    
    formEl.querySelector('#cancelActionEdit').onclick = () => {
      renderCustomCueActions();
    };
  }
  
  // Save custom cue
  saveCustomCueBtn.onclick = () => {
    const label = customCueLabel.value.trim();
    
    if (!label) {
      showNotification('Please enter a cue label', 'warning');
      return;
    }
    
    if (customCueActions.length === 0) {
      showNotification('Please add at least one action', 'warning');
      return;
    }
    
    // Convert actions to macro format for execution
    const macroActions = customCueActions.map(action => {
      // Already in the right format (type, layer, column, ms, etc.)
      return { ...action };
    });
    
    // Add custom cue to the stack
    cueStack.cues.push({
      custom: {
        label,
        color: customCueColor.value,
        actions: macroActions
      }
    });
    
    renderCueStackBuilder();
    closeCustomModal();
    showNotification(`Custom cue "${label}" added`, 'success');
  };
  
  // Initial render
  renderCueStack();
}

console.log('🔥 MAIN DEBUG: Script loaded, checking DOM ready state:', document.readyState);
if (document.readyState === "loading") {
  console.log('🔥 MAIN DEBUG: DOM still loading, adding event listener');
  document.addEventListener("DOMContentLoaded", function() {
    console.log('🔥 MAIN DEBUG: DOMContentLoaded event fired, calling init()');
    init();
    // Initialize cue stack after main app
    setTimeout(() => initCueStack(), 100);
  });
} else {
  console.log('🔥 MAIN DEBUG: DOM already loaded, calling init() immediately');
  init();
  // Initialize cue stack after main app
  setTimeout(() => initCueStack(), 100);
}
