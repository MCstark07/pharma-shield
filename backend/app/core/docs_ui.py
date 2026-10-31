def get_custom_docs_html(title: str = "PharmaShield Interactive API Docs", openapi_url: str = "/openapi.json") -> str:
    return f"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2306b6d4'><path d='M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 4.5l5 2.8v3.7c0 3.12-2.16 6.04-5 6.84-2.84-.8-5-3.72-5-6.84V9.3l5-2.8z'/></svg>">

  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Swagger UI CSS -->
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">

  <!-- Three.js (WebGL / OpenGL ES 3D) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <!-- Matter.js (2D Rigid Body Physics Engine) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>

  <style>
    :root {{
      --bg-primary: #040711;
      --bg-secondary: #090e1d;
      --bg-card: #0f172a;
      --accent-cyan: #06b6d4;
      --accent-emerald: #10b981;
      --accent-rose: #f43f5e;
      --accent-amber: #f59e0b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border-color: #1e293b;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      background: var(--bg-primary);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }}

    /* Custom Header & Hero */
    .hero-container {{
      background: radial-gradient(circle at 50% 0%, #0d1b38 0%, #040711 75%);
      border-bottom: 1px solid var(--border-color);
      padding: 2rem 2rem 2.5rem 2rem;
      position: relative;
      overflow: hidden;
    }}

    .header-bar {{
      max-width: 1400px;
      margin: 0 auto 1.5rem auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }}

    .logo-badge {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }}

    .shield-icon {{
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.1));
      border: 1px solid rgba(6, 182, 212, 0.4);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
    }}

    .title-group h1 {{
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #ffffff 40%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}

    .title-group p {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-muted);
    }}

    .badges-row {{
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
    }}

    .badge {{
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(15, 23, 42, 0.8);
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }}

    .badge.cyan {{
      border-color: rgba(6, 182, 212, 0.4);
      background: rgba(6, 182, 212, 0.1);
      color: #38bdf8;
      font-weight: 600;
    }}

    .badge.green {{
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
    }}

    /* 3D & 2D Physics Visualizer Grid */
    .visualizer-grid {{
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }}

    @media (max-width: 960px) {{
      .visualizer-grid {{
        grid-template-columns: 1fr;
      }}
    }}

    .card-panel {{
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      backdrop-filter: blur(12px);
      padding: 1.25rem;
      position: relative;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-col: column;
      justify-content: space-between;
    }}

    .panel-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
    }}

    .panel-header h3 {{
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    .panel-tag {{
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
    }}

    .canvas-container {{
      width: 100%;
      height: 240px;
      border-radius: 12px;
      overflow: hidden;
      background: #02050c;
      border: 1px solid rgba(255, 255, 255, 0.05);
      position: relative;
    }}

    .panel-controls {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      color: var(--text-muted);
    }}

    .btn-action {{
      padding: 0.35rem 0.85rem;
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }}

    .btn-action:hover {{
      background: var(--accent-cyan);
      color: #040711;
      border-color: var(--accent-cyan);
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
    }}

    /* Quick Test Bar */
    .quick-test-bar {{
      max-width: 1400px;
      margin: 1.5rem auto 0 auto;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }}

    .quick-test-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }}

    .quick-test-buttons {{
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }}

    .terminal-output {{
      background: #02050c;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #38bdf8;
      max-height: 120px;
      overflow-y: auto;
      white-space: pre-wrap;
    }}

    /* Portal Navigation Pills */
    .portals-strip {{
      max-width: 1400px;
      margin: 1.5rem auto 0 auto;
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }}

    .portal-link {{
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-color);
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }}

    .portal-link:hover {{
      border-color: var(--accent-cyan);
      color: #ffffff;
      transform: translateY(-1px);
    }}

    /* ========================================================= */
    /* SWAGGER UI DARK CYBER OVERRIDES                           */
    /* ========================================================= */
    #swagger-ui {{
      max-width: 1400px;
      margin: 2rem auto;
      padding: 0 1.5rem 4rem 1.5rem;
    }}

    .swagger-ui {{
      color: #cbd5e1 !important;
      font-family: 'Inter', sans-serif !important;
    }}

    .swagger-ui .info {{
      margin: 1rem 0 !important;
    }}

    .swagger-ui .info .title {{
      color: #ffffff !important;
      font-family: 'Inter', sans-serif !important;
      font-weight: 800 !important;
    }}

    .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info table {{
      color: #94a3b8 !important;
    }}

    .swagger-ui .scheme-container {{
      background: transparent !important;
      box-shadow: none !important;
      border-bottom: 1px solid var(--border-color) !important;
      padding: 1rem 0 !important;
    }}

    .swagger-ui .opblock-tag {{
      color: #ffffff !important;
      font-family: 'Inter', sans-serif !important;
      font-weight: 700 !important;
      border-bottom: 1px solid var(--border-color) !important;
    }}

    .swagger-ui .opblock {{
      background: #090e1d !important;
      border: 1px solid var(--border-color) !important;
      border-radius: 12px !important;
      margin-bottom: 1rem !important;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
    }}

    /* Method Badges */
    .swagger-ui .opblock.opblock-get {{
      border-left: 4px solid var(--accent-cyan) !important;
    }}
    .swagger-ui .opblock.opblock-get .opblock-summary-method {{
      background: linear-gradient(135deg, #06b6d4, #0284c7) !important;
      border-radius: 6px !important;
      font-weight: 700 !important;
    }}

    .swagger-ui .opblock.opblock-post {{
      border-left: 4px solid var(--accent-emerald) !important;
    }}
    .swagger-ui .opblock.opblock-post .opblock-summary-method {{
      background: linear-gradient(135deg, #10b981, #059669) !important;
      border-radius: 6px !important;
      font-weight: 700 !important;
    }}

    .swagger-ui .opblock.opblock-patch {{
      border-left: 4px solid var(--accent-amber) !important;
    }}
    .swagger-ui .opblock.opblock-patch .opblock-summary-method {{
      background: linear-gradient(135deg, #f59e0b, #d97706) !important;
      border-radius: 6px !important;
      font-weight: 700 !important;
    }}

    .swagger-ui .opblock.opblock-delete {{
      border-left: 4px solid var(--accent-rose) !important;
    }}
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {{
      background: linear-gradient(135deg, #f43f5e, #e11d48) !important;
      border-radius: 6px !important;
      font-weight: 700 !important;
    }}

    .swagger-ui .opblock-summary-path {{
      color: #f8fafc !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 0.9rem !important;
    }}

    .swagger-ui .opblock-summary-description {{
      color: #94a3b8 !important;
    }}

    .swagger-ui .opblock-body {{
      background: #060913 !important;
    }}

    .swagger-ui table thead tr th {{
      color: #94a3b8 !important;
      border-bottom: 1px solid var(--border-color) !important;
    }}

    .swagger-ui table tbody tr td {{
      color: #cbd5e1 !important;
    }}

    .swagger-ui .tabli button {{
      color: #94a3b8 !important;
    }}

    .swagger-ui .tabli.active button {{
      color: var(--accent-cyan) !important;
    }}

    .swagger-ui .btn {{
      border-radius: 8px !important;
      font-family: 'JetBrains Mono', monospace !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }}

    .swagger-ui .btn.execute {{
      background: var(--accent-cyan) !important;
      color: #040711 !important;
      font-weight: 700 !important;
      border: none !important;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.4) !important;
    }}

    .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select {{
      background: #02050c !important;
      border: 1px solid #1e293b !important;
      color: #f1f5f9 !important;
      border-radius: 6px !important;
      font-family: 'JetBrains Mono', monospace !important;
    }}

    .swagger-ui .model-box {{
      background: #090e1d !important;
    }}

    .swagger-ui .model {{
      color: #94a3b8 !important;
      font-family: 'JetBrains Mono', monospace !important;
    }}

    .swagger-ui .prop-type {{
      color: var(--accent-cyan) !important;
    }}

    .swagger-ui .prop-format {{
      color: #a855f7 !important;
    }}
  </style>
</head>
<body>

  <!-- HERO SECTION WITH THREE.JS & MATTER.JS -->
  <header class="hero-container">
    <div class="header-bar">
      <div class="logo-badge">
        <div class="shield-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
            <path d="M12 6.5l5 2.8v3.7c0 3.12-2.16 6.04-5 6.84-2.84-.8-5-3.72-5-6.84V9.3l5-2.8z"/>
          </svg>
        </div>
        <div class="title-group">
          <h1>PharmaShield Central API & Live Telemetry Bus</h1>
          <p>Host: http://localhost:8000 &bull; WebSocket: ws://localhost:8000/ws/events</p>
        </div>
      </div>

      <div class="badges-row">
        <div class="badge cyan">
          <span>&#9889; FASTAPI 0.110</span>
        </div>
        <div class="badge green">
          <span>&#10003; ED25519 CIPHER</span>
        </div>
        <div class="badge">
          <span>&#9874; SHA-256 LEDGER</span>
        </div>
        <div class="badge">
          <span>&#9733; 3D WEBGL &bull; MATTER.JS</span>
        </div>
      </div>
    </div>

    <!-- 3D Three.js & 2D Matter.js Visualization Grid -->
    <div class="visualizer-grid">
      <!-- PANEL 1: THREE.JS 3D CRYO DNA / BIO-VIAL -->
      <div class="card-panel">
        <div class="panel-header">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
            </svg>
            Three.js WebGL Hologram
          </h3>
          <span class="panel-tag" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8;">OpenGL ES 3.0</span>
        </div>

        <div id="three-canvas-container" class="canvas-container"></div>

        <div class="panel-controls">
          <span>Drag mouse to rotate 3D Bio-Structure in real time</span>
          <button id="btn-toggle-spin" class="btn-action">Toggle Spin</button>
        </div>
      </div>

      <!-- PANEL 2: MATTER.JS 2D PHYSICS PACKET ARENA -->
      <div class="card-panel">
        <div class="panel-header">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
            </svg>
            Matter.js 2D Rigid-Body Physics
          </h3>
          <span class="panel-tag" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">Interactive Gravity</span>
        </div>

        <div id="matter-canvas-container" class="canvas-container"></div>

        <div class="panel-controls">
          <span>Click &amp; fling HTTP packets with mouse</span>
          <div style="display: flex; gap: 0.5rem;">
            <button id="btn-spawn-packet" class="btn-action">+ Spawn Packet</button>
            <button id="btn-zero-gravity" class="btn-action">Zero-G</button>
          </div>
        </div>
      </div>
    </div>

    <!-- QUICK-TEST INTERACTIVE TERMINAL -->
    <div class="quick-test-bar">
      <div class="quick-test-header">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700; color: #f8fafc; display: flex; align-items: center; gap: 0.5rem;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
          Interactive Live API Probe Console
        </div>
        <div class="quick-test-buttons">
          <button class="btn-action" onclick="runProbe('/health')">Probe Health</button>
          <button class="btn-action" onclick="runProbe('/api/v1/inventory?stock_alert=true')">Stock Alerts (DOS)</button>
          <button class="btn-action" onclick="runProbe('/api/v1/security/ledger?limit=1')">Inspect Hash-Chain</button>
          <button class="btn-action" onclick="runTamperProbe()">Simulate Attack</button>
        </div>
      </div>
      <div id="probe-terminal" class="terminal-output">Ready. Click any probe button above to test live backend routes.</div>
    </div>

    <!-- PORTALS NAVIGATION STRIP -->
    <div class="portals-strip">
      <a href="http://localhost:5173" target="_blank" class="portal-link">
        <span style="color: #38bdf8;">&#9654;</span>
        <span>Command Center UI (:5173)</span>
      </a>
      <a href="http://localhost:5174" target="_blank" class="portal-link">
        <span style="color: #34d399;">&#9654;</span>
        <span>Pharma Ops Portal (:5174)</span>
      </a>
      <a href="http://localhost:5175" target="_blank" class="portal-link">
        <span style="color: #f43f5e;">&#9654;</span>
        <span>Cyber Lab Attack Console (:5175)</span>
      </a>
      <a href="/openapi.json" target="_blank" class="portal-link">
        <span style="color: #fbbf24;">&#123;&#125;</span>
        <span>OpenAPI JSON Schema</span>
      </a>
    </div>
  </header>

  <!-- SWAGGER UI MOUNT CONTAINER -->
  <main>
    <div id="swagger-ui"></div>
  </main>

  <!-- Swagger UI Bundle JS -->
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>

  <script>
    // 1. Initialize Swagger UI
    window.onload = function() {{
      window.ui = SwaggerUIBundle({{
        url: "{openapi_url}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      }});
    }};

    // 2. Interactive Quick Probes
    async function runProbe(endpoint) {{
      const term = document.getElementById('probe-terminal');
      term.innerText = `[PROBE] GET ${{endpoint}} ... requesting`;
      try {{
        const res = await fetch(endpoint);
        const data = await res.json();
        term.innerText = `[HTTP ${{res.status}}] GET ${{endpoint}}\n` + JSON.stringify(data, null, 2);
      }} catch (err) {{
        term.innerText = `[ERROR] Failed to probe ${{endpoint}}: ${{err.message}}`;
      }}
    }}

    async function runTamperProbe() {{
      const term = document.getElementById('probe-terminal');
      term.innerText = `[SECURITY PROBE] Fetching ledger block & injecting tamper payload...`;
      try {{
        const ledgerRes = await fetch('/api/v1/security/ledger?limit=1');
        const ledgerData = await ledgerRes.json();
        if (!ledgerData || ledgerData.length === 0) {{
          term.innerText = `[ERROR] No ledger records available to tamper.`;
          return;
        }}
        const record = ledgerData[0];
        const res = await fetch('/api/v1/security/simulate-tampering', {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{
            audit_record_id: record.id,
            field_to_modify: 'allocated_quantity',
            tampered_value: 99999
          }})
        }});
        const data = await res.json();
        term.innerText = `[SECURITY ATTACK RESULT]\n` +
          `Original Hash:  ${{data.original_hash}}\n` +
          `Tampered Hash:  ${{data.tampered_hash}}\n` +
          `Hash Match:     ${{data.hashes_match ? 'YES' : 'DIVERGED (TAMPER DETECTED)'}}\n` +
          `Ed25519 Valid:  ${{data.signature_verified ? 'VALID' : 'REJECTED (FAIL)'}}\n` +
          `Diagnostic:     ${{data.diagnostic_message}}`;
      }} catch (err) {{
        term.innerText = `[ERROR] Tamper test failed: ${{err.message}}`;
      }}
    }}

    // =========================================================================
    // 3. THREE.JS 3D WEBGL VISUALIZER (ROTATING CRYO DNA DOUBLE HELIX)
    // =========================================================================
    (function initThreeJS() {{
      const container = document.getElementById('three-canvas-container');
      if (!container) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 0, 11);

      const renderer = new THREE.WebGLRenderer({{ antialias: true, alpha: true }});
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const dnaGroup = new THREE.Group();
      scene.add(dnaGroup);

      // Create DNA Double Helix
      const pairsCount = 30;
      const radius = 1.8;
      const heightStep = 0.28;

      const sphereGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const matCyan = new THREE.MeshStandardMaterial({{ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.6, roughness: 0.2 }});
      const matEmerald = new THREE.MeshStandardMaterial({{ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.6, roughness: 0.2 }});
      const matRung = new THREE.MeshBasicMaterial({{ color: 0x334155, transparent: true, opacity: 0.7 }});

      for (let i = 0; i < pairsCount; i++) {{
        const angle = i * 0.45;
        const y = (i - pairsCount / 2) * heightStep;

        // Strand A Node
        const xA = Math.cos(angle) * radius;
        const zA = Math.sin(angle) * radius;
        const sphereA = new THREE.Mesh(sphereGeo, matCyan);
        sphereA.position.set(xA, y, zA);
        dnaGroup.add(sphereA);

        // Strand B Node
        const xB = Math.cos(angle + Math.PI) * radius;
        const zB = Math.sin(angle + Math.PI) * radius;
        const sphereB = new THREE.Mesh(sphereGeo, matEmerald);
        sphereB.position.set(xB, y, zB);
        dnaGroup.add(sphereB);

        // Connecting Rung
        const rungPoints = [new THREE.Vector3(xA, y, zA), new THREE.Vector3(xB, y, zB)];
        const rungGeo = new THREE.BufferGeometry().setFromPoints(rungPoints);
        const rung = new THREE.Line(rungGeo, matRung);
        dnaGroup.add(rung);
      }}

      // Ambient Star particles
      const starGeo = new THREE.BufferGeometry();
      const starCount = 150;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) {{
        starPositions[i] = (Math.random() - 0.5) * 16;
      }}
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMat = new THREE.PointsMaterial({{ color: 0x38bdf8, size: 0.05, transparent: true, opacity: 0.5 }});
      const starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0x06b6d4, 2, 20);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      let spinning = true;
      document.getElementById('btn-toggle-spin')?.addEventListener('click', () => {{
        spinning = !spinning;
      }});

      // Mouse interactive tilt
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;

      container.addEventListener('mousedown', (e) => {{
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }});

      window.addEventListener('mousemove', (e) => {{
        if (!isDragging) return;
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        dnaGroup.rotation.y += dx * 0.01;
        dnaGroup.rotation.x += dy * 0.01;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }});

      window.addEventListener('mouseup', () => {{ isDragging = false; }});

      function animate() {{
        requestAnimationFrame(animate);
        if (spinning && !isDragging) {{
          dnaGroup.rotation.y += 0.015;
          dnaGroup.rotation.z = Math.sin(Date.now() * 0.001) * 0.15;
        }}
        renderer.render(scene, camera);
      }}
      animate();

      window.addEventListener('resize', () => {{
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }});
    }})();

    // =========================================================================
    // 4. MATTER.JS 2D PHYSICS ARENA (BOUNCY HTTP PACKETS)
    // =========================================================================
    (function initMatterJS() {{
      const container = document.getElementById('matter-canvas-container');
      if (!container || !window.Matter) return;

      const {{ Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint }} = Matter;

      const engine = Engine.create();
      const world = engine.world;
      engine.world.gravity.y = 1.0;

      const render = Render.create({{
        element: container,
        engine: engine,
        options: {{
          width: container.clientWidth,
          height: container.clientHeight,
          wireframes: false,
          background: '#02050c',
          showAngleIndicator: false,
        }}
      }});

      Render.run(render);
      const runner = Runner.create();
      Runner.run(runner, engine);

      const w = container.clientWidth;
      const h = container.clientHeight;

      // Arena Boundaries
      const wallOptions = {{ isStatic: true, render: {{ fillStyle: '#1e293b' }} }};
      const ground = Bodies.rectangle(w / 2, h + 20, w * 2, 40, wallOptions);
      const leftWall = Bodies.rectangle(-20, h / 2, 40, h * 2, wallOptions);
      const rightWall = Bodies.rectangle(w + 20, h / 2, 40, h * 2, wallOptions);
      Composite.add(world, [ground, leftWall, rightWall]);

      // HTTP Packet Pill Generator
      const packetTypes = [
        {{ label: 'GET /health', color: '#06b6d4', width: 95 }},
        {{ label: 'POST /allocate', color: '#10b981', width: 110 }},
        {{ label: 'ED25519_SIG', color: '#8b5cf6', width: 100 }},
        {{ label: 'SHA-256_HASH', color: '#38bdf8', width: 105 }},
        {{ label: 'PATCH /quarantine', color: '#f59e0b', width: 120 }},
        {{ label: 'WS /ws/events', color: '#ec4899', width: 100 }},
        {{ label: 'EXCURSION 12°C', color: '#f43f5e', width: 115 }},
      ];

      function spawnPacket() {{
        const item = packetTypes[Math.floor(Math.random() * packetTypes.length)];
        const x = Math.random() * (w - 120) + 60;
        const y = -20;
        const box = Bodies.rectangle(x, y, item.width, 28, {{
          restitution: 0.85,
          friction: 0.05,
          chamfer: {{ radius: 14 }},
          render: {{
            fillStyle: item.color,
            strokeStyle: '#ffffff',
            lineWidth: 1
          }}
        }});
        box.packetLabel = item.label;
        Composite.add(world, box);
      }}

      // Initial Seed Packets
      for (let i = 0; i < 6; i++) {{
        setTimeout(spawnPacket, i * 200);
      }}

      // Interactive Mouse Dragging
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {{
        mouse: mouse,
        constraint: {{
          stiffness: 0.2,
          render: {{ visible: false }}
        }}
      }});
      Composite.add(world, mouseConstraint);
      render.mouse = mouse;

      // Custom Canvas Labels Rendering after each engine tick
      Matter.Events.on(render, 'afterRender', function() {{
        const context = render.context;
        context.font = 'bold 11px JetBrains Mono, monospace';
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const bodies = Composite.allBodies(world);
        bodies.forEach(b => {{
          if (b.packetLabel) {{
            context.save();
            context.translate(b.position.x, b.position.y);
            context.rotate(b.angle);
            context.fillText(b.packetLabel, 0, 0);
            context.restore();
          }}
        }});
      }});

      // Buttons
      document.getElementById('btn-spawn-packet')?.addEventListener('click', spawnPacket);

      let isZeroG = false;
      document.getElementById('btn-zero-gravity')?.addEventListener('click', (e) => {{
        isZeroG = !isZeroG;
        engine.world.gravity.y = isZeroG ? 0 : 1.0;
        e.target.innerText = isZeroG ? 'Gravity: ON' : 'Zero-G';
        e.target.style.background = isZeroG ? '#f59e0b' : '#1e293b';
        if (isZeroG) {{
          Composite.allBodies(world).forEach(b => {{
            if (!b.isStatic) {{
              Matter.Body.applyForce(b, b.position, {{ x: (Math.random() - 0.5) * 0.02, y: -0.02 }});
            }}
          }});
        }}
      }});
    }})();
  </script>
</body>
</html>
"""
