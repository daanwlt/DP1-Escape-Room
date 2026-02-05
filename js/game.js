// ============================================
// GAME STATE & CONFIGURATION
// ============================================
const GAME = {
  // Error log puzzle: find error codes in sequence
  errorSequence: ["ERR_404", "ERR_500", "ERR_TIMEOUT"],
  errorCode: "404500TIMEOUT", // Combined code for safe
  
  // Code fix puzzle: fix syntax errors (simplified for beginners)
  codeErrors: [
    { line: 3, original: "const status = 'active'", fixed: "const status = 'active';" },
    { line: 4, original: "if (status == 'active')", fixed: "if (status === 'active')" },
    { line: 9, original: "console.log('Error:', err)", fixed: "console.error('Error:', err);" },
    { line: 10, original: "console.log('Error:', err)", fixed: "console.error('Error:', err)" }
  ],
  safeCode: "404500TIMEOUT", // From error codes
  
  // System config: dials for restart sequence
  restartSequence: [4, 0, 2], // Hours, minutes, seconds
  
  // Final restart: button sequence
  restartButtons: ["INIT", "VERIFY", "RESTART"]
};

const state = {
  // Progress flags
  errorLogsRead: false,
  codeFixed: false,
  safeOpen: false,
  hasAccessKey: false,
  configSet: false,
  systemRestarted: false,
  
  // Puzzle states
  errorLogSequence: [],
  codeFixAttempts: 0,
  safeInput: "",
  dialValues: [0, 0, 0],
  restartButtonSequence: []
};

// ============================================
// DOM REFERENCES
// ============================================
let terminalLog, puzzleArea, systemBanner, inventory;
let statusAI, statusLogs, statusCode, statusRestart;
let btnErrorLogs, btnCodeEditor, btnSystemConfig, btnRestart;

// ============================================
// UTILITIES
// ============================================
function log(message, type = "muted") {
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.textContent = `> ${message}`;
  terminalLog.appendChild(line);
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

function updateStatus() {
  // Update status dots
  statusAI.className = `status-dot ${state.systemRestarted ? 'success' : 'error'}`;
  statusLogs.className = `status-dot ${state.errorLogsRead ? 'success' : 'error'}`;
  statusCode.className = `status-dot ${state.codeFixed ? 'success' : 'error'}`;
  statusRestart.className = `status-dot ${state.systemRestarted ? 'success' : 'error'}`;
  
  // Update banner
  if (state.systemRestarted) {
    systemBanner.className = "status-banner success";
    systemBanner.innerHTML = '<span>✅</span><span><strong>SYSTEEM STATUS:</strong> AI-systeem online — alle systemen operationeel</span>';
  } else if (state.configSet) {
    systemBanner.className = "status-banner warning";
    systemBanner.innerHTML = '<span>⚠️</span><span><strong>SYSTEEM STATUS:</strong> Configuratie voltooid — klaar voor restart</span>';
  } else {
    systemBanner.className = "status-banner error";
    systemBanner.innerHTML = '<span>⚠️</span><span><strong>SYSTEEM STATUS:</strong> AI-systeem offline — kritieke fouten gedetecteerd</span>';
  }
  
  // Update inventory
  if (state.hasAccessKey) {
    inventory.innerHTML = `
      <div class="inventory-item" style="flex-direction:column; align-items:flex-start; gap:4px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="item-icon"></span>
          <span>Access Key</span>
        </div>
        <div style="font-size:11px; color:var(--accent); font-family:monospace; margin-top:4px;">
          Serienummer: AK-2024-0402
        </div>
      </div>
    `;
  } else {
    inventory.innerHTML = '<span style="color:var(--muted); font-size:12px;">— leeg —</span>';
  }
  
  // Update button states
  btnSystemConfig.disabled = !state.hasAccessKey;
  btnRestart.disabled = !state.configSet;
}

function resetGame() {
  state.errorLogsRead = false;
  state.codeFixed = false;
  state.safeOpen = false;
  state.hasAccessKey = false;
  state.configSet = false;
  state.systemRestarted = false;
  
  state.errorLogSequence = [];
  state.codeFixAttempts = 0;
  state.safeInput = "";
  state.dialValues = [0, 0, 0];
  state.restartButtonSequence = [];
  
  terminalLog.innerHTML = "";
  log("Systeem reset...", "warn");
  log("AI-systeem offline. Begin met Error Logs.", "muted");
  
  puzzleArea.innerHTML = `
    <div class="puzzle-panel">
      <h3>🚀 Welkom, Junior Developer</h3>
      <p class="description">
        Het AI-systeem is vastgelopen. Gebruik de debug tools links om het systeem te repareren.
        Begin met het bekijken van de <strong>Error Logs</strong>.
      </p>
    </div>
  `;
  
  setActiveButton('errorLogs');
  updateStatus();
}

// ============================================
// BUTTON ACTIVE STATE MANAGEMENT
// ============================================
function setActiveButton(activeBtn) {
  // Remove active class from all buttons
  btnErrorLogs.classList.remove('active');
  btnCodeEditor.classList.remove('active');
  btnSystemConfig.classList.remove('active');
  btnRestart.classList.remove('active');
  
  // Add active class to current button
  if (activeBtn === 'errorLogs') btnErrorLogs.classList.add('active');
  if (activeBtn === 'codeEditor') btnCodeEditor.classList.add('active');
  if (activeBtn === 'systemConfig') btnSystemConfig.classList.add('active');
  if (activeBtn === 'restart') btnRestart.classList.add('active');
}

// ============================================
// NOTES MANAGEMENT
// ============================================
function initNotes() {
  const notesTextarea = document.getElementById("notesTextarea");
  if (!notesTextarea) return;
  
  // Load saved notes
  const savedNotes = localStorage.getItem('escapeRoomNotes');
  if (savedNotes) {
    notesTextarea.value = savedNotes;
  }
  
  // Save notes on input
  notesTextarea.addEventListener('input', () => {
    localStorage.setItem('escapeRoomNotes', notesTextarea.value);
  });
}

// ============================================
// PUZZLE 1: ERROR LOGS
// ============================================
function renderErrorLogs() {
  setActiveButton('errorLogs');
  puzzleArea.innerHTML = `
    <div class="puzzle-panel">
      <h3>📋 Error Logs</h3>
      <p class="description">
        Het systeem heeft kritieke fouten gegenereerd. Analyseer de error codes en vind de volgorde.
      </p>
      
      <div class="error-log">
        <div class="error-entry">
          <strong style="color:var(--error);">[ERROR]</strong> AI Core initialization failed
          <br><span style="color:var(--muted);">Error Code: ERR_404</span>
          <br><span style="color:var(--muted); font-size:11px;">Timestamp: 2024-01-15 14:32:11</span>
        </div>
        <div class="error-entry">
          <strong style="color:var(--error);">[ERROR]</strong> Database connection timeout
          <br><span style="color:var(--muted);">Error Code: ERR_500</span>
          <br><span style="color:var(--muted); font-size:11px;">Timestamp: 2024-01-15 14:32:45</span>
        </div>
        <div class="error-entry">
          <strong style="color:var(--error);">[ERROR]</strong> System resource exhaustion
          <br><span style="color:var(--muted);">Error Code: ERR_TIMEOUT</span>
          <br><span style="color:var(--muted); font-size:11px;">Timestamp: 2024-01-15 14:33:02</span>
        </div>
      </div>
      
      <p class="description" style="margin-top:16px; padding:12px; background:rgba(59,130,246,.1); border-left:3px solid var(--accent); border-radius:4px;">
        <strong>💡 Hint:</strong> Noteer de error codes in chronologische volgorde (eerste → laatste).
        Deze codes vormen samen een toegangscode.
      </p>
      
      <div class="action-row">
        <button id="btnContinueCode" ${state.errorLogsRead ? "" : "disabled"}>Ga naar Code Editor</button>
      </div>
    </div>
  `;
  
  if (!state.errorLogsRead) {
    log("Error logs geladen...", "info");
    log("3 kritieke fouten gedetecteerd:", "error");
    log("  - ERR_404: AI Core initialization failed", "error");
    log("  - ERR_500: Database connection timeout", "error");
    log("  - ERR_TIMEOUT: System resource exhaustion", "error");
    log("Error codes genoteerd in chronologische volgorde.", "success");
    state.errorLogsRead = true;
    updateStatus();
  }
  
  document.getElementById("btnContinueCode").onclick = renderCodeEditor;
}

// ============================================
// PUZZLE 2: CODE EDITOR
// ============================================
function renderCodeEditor() {
  setActiveButton('codeEditor');
  
  if (!state.errorLogsRead) {
    puzzleArea.innerHTML = `
      <div class="puzzle-panel">
        <h3>💻 Code Editor</h3>
        <p class="description">
          Je moet eerst de error logs bekijken om de toegangscode te krijgen.
        </p>
        <div class="action-row">
          <button onclick="renderErrorLogs()">Naar Error Logs</button>
        </div>
      </div>
    `;
    return;
  }
  
  puzzleArea.innerHTML = `
    <div class="puzzle-panel">
      <h3>💻 Code Editor</h3>
      <p class="description">
        Er zijn 4 simpele fouten in de code. Kijk goed naar de regels met ❌ en repareer ze.
      </p>
      
      <div class="code-block">
        <div class="code-line comment">// AI Core Initialization Function</div>
        <div class="code-line">function initAI() {</div>
        <div class="code-line error">  const status = 'active'  // ❌ Fout: ontbreekt puntkomma (;) aan het einde</div>
        <div class="code-line error">  if (status == 'active') {  // ❌ Fout: gebruik === in plaats van ==</div>
        <div class="code-line">    console.log('AI initialized');</div>
        <div class="code-line">  }</div>
        <div class="code-line">}</div>
        <div class="code-line comment" style="margin-top:12px;">// Error Handler</div>
        <div class="code-line">function handleError(err) {</div>
        <div class="code-line error">  console.log('Error:', err)  // ❌ Fout: ontbreekt puntkomma (;) aan het einde</div>
        <div class="code-line error">  console.log('Error:', err);  // ❌ Fout: gebruik console.error in plaats van console.log</div>
        <div class="code-line">}</div>
      </div>
      
      <div class="action-row" style="margin-top:16px;">
        <button id="btnShowTips" style="background:rgba(59,130,246,.2); border-color:var(--accent);">
          💡 Tips voor beginners
        </button>
      </div>
      
      <div id="tipsSection" style="display:none; margin-top:16px;">
        <p class="description" style="padding:12px; background:rgba(59,130,246,.1); border-left:3px solid var(--accent); border-radius:4px;">
          <strong>💡 Tip voor beginners:</strong><br>
          • Regel 3: Voeg een puntkomma <code>;</code> toe aan het einde<br>
          • Regel 4: Vervang <code>==</code> door <code>===</code> (3 gelijktekens)<br>
          • Regel 9: Voeg een puntkomma <code>;</code> toe aan het einde<br>
          • Regel 10: Vervang <code>console.log</code> door <code>console.error</code>
        </p>
      </div>
      
      <div style="margin-top:16px;">
        <label style="display:block; margin-bottom:8px; font-size:12px; color:var(--muted);">
          Regel 3: Voeg puntkomma toe aan het einde
        </label>
        <input type="text" id="fixLine3" placeholder="Typ hier je antwoord..." style="margin-bottom:12px;" />
        
        <label style="display:block; margin-bottom:8px; font-size:12px; color:var(--muted);">
          Regel 4: Vervang == door ===
        </label>
        <input type="text" id="fixLine4" placeholder="Typ hier je antwoord..." style="margin-bottom:12px;" />
        
        <label style="display:block; margin-bottom:8px; font-size:12px; color:var(--muted);">
          Regel 9: Voeg puntkomma toe aan het einde
        </label>
        <input type="text" id="fixLine9" placeholder="Typ hier je antwoord..." style="margin-bottom:12px;" />
        
        <label style="display:block; margin-bottom:8px; font-size:12px; color:var(--muted);">
          Regel 10: Vervang console.log door console.error
        </label>
        <input type="text" id="fixLine10" placeholder="Typ hier je antwoord..." />
      </div>
      
      <div class="action-row" style="margin-top:16px;">
        <button id="btnCheckCode" class="primary">✓ Controleer Code</button>
        <button id="btnResetCode">Reset</button>
      </div>
      
      <div id="codeStatus" style="margin-top:12px;"></div>
    </div>
  `;
  
  log("Code editor geopend...", "info");
  log("4 simpele syntaxfouten gevonden op regels 3, 4, 9 en 10.", "warn");
  
  // Tips toggle button
  document.getElementById("btnShowTips").onclick = () => {
    const tipsSection = document.getElementById("tipsSection");
    const btnShowTips = document.getElementById("btnShowTips");
    
    if (tipsSection.style.display === 'none') {
      tipsSection.style.display = 'block';
      btnShowTips.textContent = 'Verberg tips';
    } else {
      tipsSection.style.display = 'none';
      btnShowTips.textContent = '💡 Tips voor beginners';
    }
  };
  
  document.getElementById("btnCheckCode").onclick = checkCodeFix;
  document.getElementById("btnResetCode").onclick = () => {
    document.getElementById("fixLine3").value = "";
    document.getElementById("fixLine4").value = "";
    document.getElementById("fixLine9").value = "";
    document.getElementById("fixLine10").value = "";
    log("Code reset.", "warn");
  };
}

function checkCodeFix() {
  const fix3 = document.getElementById("fixLine3").value.trim();
  const fix4 = document.getElementById("fixLine4").value.trim();
  const fix9 = document.getElementById("fixLine9").value.trim();
  const fix10 = document.getElementById("fixLine10").value.trim();
  
  const statusEl = document.getElementById("codeStatus");
  
  // Check fixes - makkelijker voor beginners
  const correct3 = fix3.includes(";") && fix3.includes("status") && fix3.includes("active");
  const correct4 = fix4.includes("===") && fix4.includes("status") && fix4.includes("active");
  const correct9 = fix9.includes(";") && (fix9.includes("console.error") || fix9.includes("console.log"));
  const correct10 = fix10.includes("console.error") && fix10.includes("err");
  
  if (correct3 && correct4 && correct9 && correct10) {
    state.codeFixed = true;
    log("✓ Alle codefouten gerepareerd!", "success");
    log("Toegang tot safe systeem verkregen.", "success");
    statusEl.innerHTML = '<div style="padding:12px; background:rgba(16,185,129,.1); border:1px solid var(--ok); border-radius:8px; color:var(--ok);">✓ Code succesvol gerepareerd!</div>';
    updateStatus();
    
    // Show safe access
    setTimeout(() => {
      puzzleArea.innerHTML += `
        <div class="puzzle-panel" style="margin-top:16px; border-color:var(--ok);">
          <h3>🔐 Safe Access</h3>
          <p class="description">
            De code is gerepareerd. Gebruik de error codes uit de logs als toegangscode voor de safe.
          </p>
          <div style="margin:16px 0;">
            <label style="display:block; margin-bottom:8px; font-size:12px; color:var(--muted);">
              Toegangscode: Alles wat na de 'ERR_' komt!
            </label>
            <input type="text" id="safeCodeInput" placeholder="Voer de toegangscode in" style="font-size:18px; letter-spacing:2px; text-align:center;" maxlength="15" />
          </div>
          <div class="action-row">
            <button id="btnOpenSafe" class="primary">🔓 Open Safe</button>
          </div>
          <div id="safeStatus" style="margin-top:12px;"></div>
        </div>
      `;
      
      document.getElementById("btnOpenSafe").onclick = () => {
        const code = document.getElementById("safeCodeInput").value.trim().toUpperCase();
        const statusEl = document.getElementById("safeStatus");
        
        if (code === GAME.safeCode || code === "404500TIMEOUT") {
          state.safeOpen = true;
          state.hasAccessKey = true;
          log("✓ Safe geopend! Access key verkregen.", "success");
          statusEl.innerHTML = '<div style="padding:12px; background:rgba(16,185,129,.1); border:1px solid var(--ok); border-radius:8px; color:var(--ok);">✓ Access key verkregen!</div>';
          
          // Show access key puzzle
          setTimeout(() => {
            puzzleArea.innerHTML += `
              <div class="puzzle-panel" style="margin-top:16px; border-color:var(--accent);">
                <h3>🔑 Access Key Analyse</h3>
                <p class="description">
                  Op de access key staat een serienummer: <strong style="color:var(--accent); font-family:monospace; font-size:16px;">AK-2024-0402</strong>
                  <br><br>Analyseer dit nummer om de restart timer te vinden.
                </p>
                <div style="padding:16px; background:rgba(15,20,25,.8); border:1px solid var(--border); border-radius:8px; margin:12px 0;">
                  <div style="font-family:monospace; font-size:14px; line-height:1.8;">
                    <div><strong>Serienummer:</strong> AK-2024-0402</div>
                    <div style="margin-top:8px; color:var(--muted); font-size:12px;">
                      💡 Hint: Kijk naar de laatste 4 cijfers. Deze vormen een tijdcode.
                    </div>
                  </div>
                </div>
                <p class="description" style="padding:12px; background:rgba(59,130,246,.1); border-left:3px solid var(--accent); border-radius:4px;">
                  <strong>Puzzel:</strong> De laatste 4 cijfers (0402) vormen een tijdcode in het formaat <code>UU:MM:SS</code>.
                  <br>• Eerste 2 cijfers = Uren
                  <br>• Derde cijfer = Minuten  
                  <br>• Laatste cijfers = Seconden (als één getal)
                  <br><br>Voorbeeld: 0402 = 4 uren, 0 minuten, 2 seconden
                </p>
                <div class="action-row">
                  <button onclick="renderSystemConfig()" class="primary">Ga naar System Config</button>
                </div>
              </div>
            `;
          }, 1000);
          
          updateStatus();
        } else {
          log("✗ Foute code. Probeer opnieuw.", "error");
          statusEl.innerHTML = '<div style="padding:12px; background:rgba(239,68,68,.1); border:1px solid var(--error); border-radius:8px; color:var(--error);">✗ Foute code</div>';
        }
      };
    }, 500);
  } else {
    log("✗ Niet alle fouten zijn correct opgelost.", "error");
    let errorMsg = "✗ Code bevat nog fouten:<br>";
    if (!correct3) errorMsg += "• Regel 3: voeg puntkomma (;) toe aan het einde<br>";
    if (!correct4) errorMsg += "• Regel 4: gebruik === in plaats van ==<br>";
    if (!correct9) errorMsg += "• Regel 9: voeg puntkomma (;) toe aan het einde<br>";
    if (!correct10) errorMsg += "• Regel 10: gebruik console.error in plaats van console.log";
    statusEl.innerHTML = `<div style="padding:12px; background:rgba(239,68,68,.1); border:1px solid var(--error); border-radius:8px; color:var(--error);">${errorMsg}</div>`;
    state.codeFixAttempts++;
  }
}

// ============================================
// PUZZLE 3: SYSTEM CONFIG
// ============================================
function renderSystemConfig() {
  setActiveButton('systemConfig');
  
  if (!state.hasAccessKey) {
    puzzleArea.innerHTML = `
      <div class="puzzle-panel">
        <h3>⚙️ System Config</h3>
        <p class="description">
          Je hebt een access key nodig om de systeemconfiguratie te wijzigen.
          Repareer eerst de code en open de safe.
        </p>
        <div class="action-row">
          <button onclick="renderCodeEditor()">Naar Code Editor</button>
        </div>
      </div>
    `;
    return;
  }
  
  puzzleArea.innerHTML = `
    <div class="puzzle-panel">
      <h3>⚙️ System Config — Restart Sequence</h3>
      <p class="description">
        Stel de restart timer in. Gebruik de tijdcode van de access key serienummer.
      </p>
      
      <div class="action-row" style="margin-top:16px;">
        <button id="btnShowConfigTips" style="background:rgba(59,130,246,.2); border-color:var(--accent);">
          💡 Tip
        </button>
      </div>
      
      <div id="configTipsSection" style="display:none; margin-top:16px;">
        <p class="description" style="padding:12px; background:rgba(59,130,246,.1); border-left:3px solid var(--accent); border-radius:4px;">
          <strong>💡 Tip:</strong><br>
          De access key serienummer was: <strong style="color:var(--accent); font-family:monospace;">AK-2024-0402</strong>
          <br>De laatste 4 cijfers (0402) vormen de tijdcode: <strong class="t-accent">4 uren, 0 minuten, 2 seconden</strong>
        </p>
      </div>
      
      <div class="dials-container" style="margin-top:16px;">
        <div class="dial">
          <div class="dial-label">Uren</div>
          <div class="dial-value" id="dial0">${state.dialValues[0]}</div>
          <div class="dial-controls">
            <button class="dial-btn" id="up0">+</button>
            <button class="dial-btn" id="down0">-</button>
          </div>
        </div>
        <div class="dial">
          <div class="dial-label">Minuten</div>
          <div class="dial-value" id="dial1">${state.dialValues[1]}</div>
          <div class="dial-controls">
            <button class="dial-btn" id="up1">+</button>
            <button class="dial-btn" id="down1">-</button>
          </div>
        </div>
        <div class="dial">
          <div class="dial-label">Seconden</div>
          <div class="dial-value" id="dial2">${state.dialValues[2]}</div>
          <div class="dial-controls">
            <button class="dial-btn" id="up2">+</button>
            <button class="dial-btn" id="down2">-</button>
          </div>
        </div>
      </div>
      
      <div class="action-row" style="margin-top:16px;">
        <button id="btnCheckConfig" class="primary">✓ Verifieer Config</button>
        <button id="btnResetConfig">Reset</button>
      </div>
      
      <div id="configStatus" style="margin-top:12px;"></div>
      </div>
    `;
  
  log("System config geopend...", "info");
  log("Restart timer moet worden ingesteld.", "muted");
  
  // Tips toggle button
  document.getElementById("btnShowConfigTips").onclick = () => {
    const tipsSection = document.getElementById("configTipsSection");
    const btnShowTips = document.getElementById("btnShowConfigTips");
    
    if (tipsSection.style.display === 'none') {
      tipsSection.style.display = 'block';
      btnShowTips.textContent = 'Verberg tip';
    } else {
      tipsSection.style.display = 'none';
      btnShowTips.textContent = '💡 Tip';
    }
  };
  
  // Dial controls
  for (let i = 0; i < 3; i++) {
    document.getElementById(`up${i}`).onclick = () => {
      state.dialValues[i] = (state.dialValues[i] + 1) % 10;
      document.getElementById(`dial${i}`).textContent = state.dialValues[i];
      log(`Timer ${i === 0 ? 'uren' : i === 1 ? 'minuten' : 'seconden'}: ${state.dialValues[i]}`, "muted");
    };
    document.getElementById(`down${i}`).onclick = () => {
      state.dialValues[i] = (state.dialValues[i] + 9) % 10;
      document.getElementById(`dial${i}`).textContent = state.dialValues[i];
      log(`Timer ${i === 0 ? 'uren' : i === 1 ? 'minuten' : 'seconden'}: ${state.dialValues[i]}`, "muted");
    };
  }
  
  document.getElementById("btnCheckConfig").onclick = () => {
    const correct = state.dialValues.every((v, i) => v === GAME.restartSequence[i]);
    const statusEl = document.getElementById("configStatus");
    
    if (correct) {
      state.configSet = true;
      log("✓ Configuratie correct ingesteld!", "success");
      log("Systeem klaar voor restart.", "success");
      statusEl.innerHTML = '<div style="padding:12px; background:rgba(16,185,129,.1); border:1px solid var(--ok); border-radius:8px; color:var(--ok);">✓ Configuratie voltooid</div>';
      updateStatus();
    } else {
      log("✗ Configuratie incorrect. Check de hint op de access key.", "error");
      statusEl.innerHTML = '<div style="padding:12px; background:rgba(239,68,68,.1); border:1px solid var(--error); border-radius:8px; color:var(--error);">✗ Verkeerde configuratie</div>';
    }
  };
  
  document.getElementById("btnResetConfig").onclick = () => {
    state.dialValues = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      document.getElementById(`dial${i}`).textContent = "0";
    }
    log("Configuratie gereset.", "warn");
  };
}

// ============================================
// PUZZLE 4: SYSTEM RESTART
// ============================================
function renderRestart() {
  setActiveButton('restart');
  
  if (!state.configSet) {
    puzzleArea.innerHTML = `
      <div class="puzzle-panel">
        <h3>🔄 System Restart</h3>
        <p class="description">
          De configuratie moet eerst worden ingesteld voordat het systeem kan worden herstart.
        </p>
        <div class="action-row">
          <button onclick="renderSystemConfig()">Naar System Config</button>
        </div>
      </div>
    `;
    return;
  }
  
  if (state.systemRestarted) {
    puzzleArea.innerHTML = `
      <div class="puzzle-panel" style="border-color:var(--ok);">
        <h3>🎉 SUCCESS!</h3>
        <p class="description">
          Het AI-systeem is succesvol herstart! Alle systemen zijn operationeel.
          Je hebt de escape room voltooid!
        </p>
        <div class="action-row">
          <button onclick="resetGame()" class="primary">🔄 Opnieuw Spelen</button>
        </div>
      </div>
    `;
    return;
  }
  
    puzzleArea.innerHTML = `
      <div class="puzzle-panel">
        <h3>🔄 System Restart</h3>
        <p class="description">
          Voer de restart sequence uit in de juiste volgorde.
        </p>
        
        <div class="panel-grid">
          <div class="panel-btn" data-btn="VERIFY">
            <div class="label">Stap 1</div>
            <div class="value">VERIFY</div>
          </div>
          <div class="panel-btn" data-btn="RESTART">
            <div class="label">Stap 2</div>
            <div class="value">RESTART</div>
          </div>
          <div class="panel-btn" data-btn="INIT">
            <div class="label">Stap 3</div>
            <div class="value">INIT</div>
          </div>
        </div>
      
      <div class="sequence-display" id="restartSequence">
        <span style="color:var(--muted);">Sequence:</span>
        <strong id="seqDisplay">—</strong>
      </div>
      
      <div class="action-row" style="margin-top:16px;">
        <button id="btnCheckRestart" class="primary">✓ Execute Restart</button>
        <button id="btnResetRestart">Reset Sequence</button>
      </div>
      
      <div id="restartStatus" style="margin-top:12px;"></div>
    </div>
  `;
  
  log("Restart panel geopend...", "info");
  log("Voer de restart sequence uit.", "muted");
  
  const seqDisplay = document.getElementById("seqDisplay");
  
  function updateSequence() {
    seqDisplay.textContent = state.restartButtonSequence.length 
      ? state.restartButtonSequence.join(" → ") 
      : "—";
  }
  
  document.querySelectorAll(".panel-btn").forEach(btn => {
    btn.onclick = () => {
      if (state.restartButtonSequence.length >= 3) return;
      const value = btn.getAttribute("data-btn");
      state.restartButtonSequence.push(value);
      log(`Restart sequence: ${value}`, "info");
      updateSequence();
    };
  });
  
  document.getElementById("btnCheckRestart").onclick = () => {
    const correct = state.restartButtonSequence.length === 3 &&
      state.restartButtonSequence.every((v, i) => v === GAME.restartButtons[i]);
    const statusEl = document.getElementById("restartStatus");
    
    if (correct) {
      state.systemRestarted = true;
      log("✓ Restart sequence uitgevoerd!", "success");
      log("AI-systeem wordt herstart...", "info");
      setTimeout(() => {
        log("✓ AI-systeem online!", "success");
        log("✓ Alle systemen operationeel!", "success");
        log("🎉 ESCAPE ROOM VOLTOOID!", "success");
      }, 1000);
      statusEl.innerHTML = '<div style="padding:12px; background:rgba(16,185,129,.1); border:1px solid var(--ok); border-radius:8px; color:var(--ok);">✓ Systeem herstart!</div>';
      updateStatus();
      setTimeout(() => renderRestart(), 2000);
    } else {
      log("✗ Verkeerde sequence. Probeer opnieuw.", "error");
      statusEl.innerHTML = '<div style="padding:12px; background:rgba(239,68,68,.1); border:1px solid var(--error); border-radius:8px; color:var(--error);">✗ Verkeerde volgorde</div>';
    }
  };
  
  document.getElementById("btnResetRestart").onclick = () => {
    state.restartButtonSequence = [];
    log("Restart sequence gereset.", "warn");
    updateSequence();
  };
  
  updateSequence();
}

// ============================================
// INITIALIZATION
// ============================================
function initGame() {
  // Get DOM references
  terminalLog = document.getElementById("terminalLog");
  puzzleArea = document.getElementById("puzzleArea");
  systemBanner = document.getElementById("systemBanner");
  inventory = document.getElementById("inventory");
  
  statusAI = document.getElementById("statusAI");
  statusLogs = document.getElementById("statusLogs");
  statusCode = document.getElementById("statusCode");
  statusRestart = document.getElementById("statusRestart");
  
  btnErrorLogs = document.getElementById("btnErrorLogs");
  btnCodeEditor = document.getElementById("btnCodeEditor");
  btnSystemConfig = document.getElementById("btnSystemConfig");
  btnRestart = document.getElementById("btnRestart");
  
  // Set up event handlers
  btnErrorLogs.onclick = renderErrorLogs;
  btnCodeEditor.onclick = renderCodeEditor;
  btnSystemConfig.onclick = renderSystemConfig;
  btnRestart.onclick = renderRestart;
  
  // Make functions globally available for onclick handlers
  window.renderErrorLogs = renderErrorLogs;
  window.renderCodeEditor = renderCodeEditor;
  window.renderSystemConfig = renderSystemConfig;
  window.renderRestart = renderRestart;
  window.resetGame = resetGame;
  
  // Initialize notes
  initNotes();
  
  // Don't set active button initially - only when user clicks
  // setActiveButton('errorLogs');
  
  // Initialize terminal
  log("=== AI SYSTEM DEBUG MODE ===", "info");
  log("Systeem gestart...", "muted");
  log("AI Core: OFFLINE", "error");
  log("Kritieke fouten gedetecteerd.", "error");
  log("Begin met Error Logs om te starten.", "muted");
  
  updateStatus();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
