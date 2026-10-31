"""
PharmaShield — Flow Wave WebGL (Three.js r0.143.0) + Matter.js 3D Interactive Documentation Engine
Renders a cyber-medical documentation portal with exact Flow Wave shaders, 3-stage EffectComposer pipeline,
zero-gravity Matter.js physics badges, scroll-driven camera dive, and integrated OpenAPI explorer.
"""

def get_custom_docs_html(title: str = "PharmaShield Cyber-Logistics | 3D Interactive API Studio", openapi_url: str = "/openapi.json") -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230aff7f'><path d='M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 4.5l5 2.8v3.7c0 3.12-2.16 6.04-5 6.84-2.84-.8-5-3.72-5-6.84V9.3l5-2.8z'/></svg>">

  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Swagger UI CSS & Bundle for Live API Explorer -->
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>

  <!-- ES Module Importmap for Three.js r0.143.0 -->
  <script type="importmap">
  {{
    "imports": {{
      "three": "https://unpkg.com/three@0.143.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.143.0/examples/jsm/"
    }}
  }}
  </script>

  <!-- Matter.js 0.19.0 (2D Physics Engine) -->
  <script src="https://unpkg.com/matter-js@0.19.0/build/matter.min.js"></script>

  <style>
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    html, body {{
      margin: 0;
      padding: 0;
      background: #000000;
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      scroll-behavior: smooth;
    }}

    /* Fixed WebGL Canvas */
    #scene {{
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
    }}

    /* 620vh Scroll Container */
    #scroll-host {{
      position: relative;
      height: 620vh;
      z-index: 10;
      pointer-events: auto;
    }}

    /* Scroll Hint */
    #scroll-hint {{
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #7affbf;
      opacity: 0.85;
      z-index: 50;
      pointer-events: none;
      animation: pulseHint 2.4s infinite ease-in-out;
      background: rgba(2, 22, 12, 0.6);
      padding: 6px 16px;
      border-radius: 9999px;
      border: 1px solid rgba(122, 255, 191, 0.25);
      backdrop-filter: blur(8px);
    }}

    @keyframes pulseHint {{
      0%, 100% {{ opacity: 0.45; transform: translate(-50%, 0); }}
      50% {{ opacity: 1.0; transform: translate(-50%, 6px); }}
    }}

    /* Top Navigation Bar */
    header.glass-nav {{
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: rgba(2, 22, 12, 0.75);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(52, 232, 154, 0.18);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      z-index: 60;
    }}

    .nav-brand {{
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #f8fafc;
      font-weight: 800;
      font-size: 16px;
      letter-spacing: -0.02em;
    }}

    .nav-badge {{
      background: rgba(10, 255, 127, 0.12);
      border: 1px solid rgba(10, 255, 127, 0.35);
      color: #0aff7f;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }}

    .nav-links {{
      display: flex;
      align-items: center;
      gap: 20px;
    }}

    .nav-links a {{
      color: #94a3b8;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }}

    .nav-links a:hover {{
      color: #7affbf;
      text-shadow: 0 0 8px rgba(122, 255, 191, 0.4);
    }}

    .nav-actions {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .cmd-btn {{
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(52, 232, 154, 0.3);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }}

    .cmd-btn:hover {{
      border-color: #0aff7f;
      color: #ffffff;
      background: rgba(10, 255, 127, 0.1);
    }}

    /* Minimal Top-Right HUD Telemetry & Comfort Controls */
    #telemetry-hud {{
      position: fixed;
      top: 76px;
      right: 32px;
      background: rgba(2, 22, 12, 0.82);
      border: 1px solid rgba(52, 232, 154, 0.28);
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(52, 232, 154, 0.1);
      padding: 8px 16px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 18px;
      z-index: 55;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #aef0c0;
    }}

    .hud-item {{
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .hud-val {{
      color: #0aff7f;
      font-weight: 700;
    }}

    .focus-toggle {{
      background: rgba(10, 255, 127, 0.15);
      border: 1px solid rgba(10, 255, 127, 0.4);
      color: #7affbf;
      padding: 3px 10px;
      border-radius: 9999px;
      cursor: pointer;
      font-size: 10px;
      transition: all 0.2s;
    }}

    .focus-toggle.active {{
      background: #0aff7f;
      color: #02160c;
      font-weight: 800;
    }}

    /* Zero-Gravity Matter.js Physics Belt (Floating Nodes) */
    #physics-arena {{
      position: fixed;
      top: 130px;
      left: 0;
      right: 0;
      height: 90px;
      pointer-events: none;
      z-index: 45;
      overflow: visible;
    }}

    .physics-token {{
      position: absolute;
      top: 0;
      left: 0;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(4, 18, 12, 0.8);
      border: 1px solid rgba(52, 232, 154, 0.35);
      backdrop-filter: blur(10px);
      color: #aef0c0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      cursor: grab;
      user-select: none;
      pointer-events: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(52, 232, 154, 0.15);
      transition: border-color 0.2s, box-shadow 0.2s;
      white-space: nowrap;
      will-change: transform;
    }}

    .physics-token:hover {{
      border-color: #0aff7f;
      color: #ffffff;
      box-shadow: 0 0 18px rgba(10, 255, 127, 0.4);
    }}

    /* Documentation Scroll Chapters */
    .docs-viewport {{
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
      padding: 160px 24px 100px;
      display: flex;
      flex-direction: column;
      gap: 40vh; /* Spaced across the 620vh height */
    }}

    .doc-section {{
      background: rgba(2, 22, 12, 0.72);
      border: 1px solid rgba(52, 232, 154, 0.28);
      border-radius: 20px;
      backdrop-filter: blur(16px);
      padding: 40px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(10, 255, 127, 0.05);
      transition: all 0.3s ease;
    }}

    .doc-section:hover {{
      border-color: rgba(52, 232, 154, 0.5);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(52, 232, 154, 0.15);
    }}

    .hero-eyebrow {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #0aff7f;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }}

    .doc-title {{
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.15;
      background: linear-gradient(135deg, #ffffff 40%, #7affbf 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }}

    .doc-desc {{
      color: #94a3b8;
      font-size: 16px;
      line-height: 1.6;
      max-width: 820px;
      margin-bottom: 28px;
    }}

    /* Grid cards inside sections */
    .cards-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }}

    .glass-card {{
      background: rgba(9, 30, 18, 0.6);
      border: 1px solid rgba(52, 232, 154, 0.18);
      border-radius: 14px;
      padding: 24px;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }}

    .glass-card:hover {{
      transform: translateY(-4px);
      border-color: #0aff7f;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(10, 255, 127, 0.12);
    }}

    .card-title {{
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }}

    .card-body {{
      color: #94a3b8;
      font-size: 13px;
      line-height: 1.6;
    }}

    /* Interactive Live Probe Cards */
    .probe-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }}

    .probe-card {{
      background: rgba(4, 18, 12, 0.85);
      border: 1px solid rgba(52, 232, 154, 0.25);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
    }}

    .probe-btn {{
      background: #0aff7f;
      color: #02160c;
      font-weight: 700;
      font-size: 12px;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }}

    .probe-btn:hover {{
      background: #7affbf;
      box-shadow: 0 0 15px rgba(10, 255, 127, 0.5);
    }}

    .probe-out {{
      background: #000000;
      border: 1px solid rgba(52, 232, 154, 0.15);
      border-radius: 6px;
      padding: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #34e89a;
      max-height: 140px;
      overflow-y: auto;
      white-space: pre-wrap;
    }}

    /* Code Block styling */
    pre.code-block {{
      background: #010c06;
      border: 1px solid rgba(52, 232, 154, 0.2);
      border-radius: 10px;
      padding: 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #aef0c0;
      overflow-x: auto;
      position: relative;
      margin: 16px 0;
    }}

    .copy-pill {{
      position: absolute;
      top: 10px;
      right: 12px;
      background: rgba(10, 255, 127, 0.15);
      border: 1px solid rgba(10, 255, 127, 0.3);
      color: #0aff7f;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }}

    .copy-pill:hover {{
      background: #0aff7f;
      color: #02160c;
    }}

    /* Swagger Dark Theme Scoped Overrides */
    #swagger-wrapper {{
      margin-top: 30px;
      background: rgba(2, 22, 12, 0.85);
      border: 1px solid rgba(52, 232, 154, 0.28);
      border-radius: 16px;
      padding: 24px;
      overflow: hidden;
    }}

    .swagger-ui {{
      filter: invert(88%) hue-rotate(180deg) contrast(110%);
    }}
    .swagger-ui .topbar {{ display: none !important; }}
    .swagger-ui .info {{ margin: 10px 0 !important; }}

    /* Command Palette Modal */
    #cmd-palette {{
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(12px);
      z-index: 100;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding-top: 120px;
    }}

    #cmd-palette.open {{
      display: flex;
    }}

    .palette-box {{
      width: 600px;
      max-width: 90vw;
      background: #02160c;
      border: 1px solid #0aff7f;
      box-shadow: 0 0 50px rgba(10, 255, 127, 0.25);
      border-radius: 16px;
      overflow: hidden;
    }}

    .palette-input {{
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(52, 232, 154, 0.2);
      padding: 18px 24px;
      font-size: 16px;
      color: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
      outline: none;
    }}

    .palette-results {{
      max-height: 340px;
      overflow-y: auto;
      padding: 8px;
    }}

    .palette-item {{
      padding: 12px 16px;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: all 0.15s;
    }}

    .palette-item:hover, .palette-item.active {{
      background: rgba(10, 255, 127, 0.12);
      color: #0aff7f;
    }}

    /* Focus Mode dimming */
    body.focus-mode #scene {{
      opacity: 0.35;
      transition: opacity 0.5s ease;
    }}
  </style>
</head>
<body>

  <!-- WebGL Three.js Fixed Canvas -->
  <canvas id="scene"></canvas>

  <!-- Navigation Bar -->
  <header class="glass-nav">
    <a href="/" class="nav-brand">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0aff7f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"></path>
        <path d="M12 8v8"></path>
        <path d="M8 12h8"></path>
      </svg>
      <span>PharmaShield</span>
      <span class="nav-badge">Flow Wave Engine</span>
    </a>

    <nav class="nav-links">
      <a href="#quickstart">Quickstart</a>
      <a href="#contracts">Contracts &amp; Math</a>
      <a href="#cryptography">Ed25519 Ledger</a>
      <a href="#probes">Live Probes</a>
      <a href="#swagger-wrapper">API Explorer</a>
      <a href="http://localhost:5173" target="_blank" style="color: #0aff7f;">Clinical 5173 ↗</a>
      <a href="http://localhost:5174" target="_blank" style="color: #34e89a;">Pharma Ops 5174 ↗</a>
      <a href="http://localhost:5175" target="_blank" style="color: #7affbf;">Cyber Lab 5175 ↗</a>
    </nav>

    <div class="nav-actions">
      <button class="cmd-btn" id="open-cmd">
        <span>Search</span>
        <kbd>Ctrl+K</kbd>
      </button>
    </div>
  </header>

  <!-- Top-Right HUD Telemetry & Comfort Controls -->
  <div id="telemetry-hud">
    <div class="hud-item">
      <span>FPS</span>
      <span class="hud-val" id="hud-fps">60</span>
    </div>
    <div class="hud-item">
      <span>SCROLL</span>
      <span class="hud-val" id="hud-scroll">0%</span>
    </div>
    <div class="hud-item">
      <span>SWELL</span>
      <span class="hud-val" id="hud-swell">3.00</span>
    </div>
    <button class="focus-toggle" id="focus-btn" title="Dampen waves &amp; focus on text reading">Focus Read Mode</button>
  </div>

  <!-- Zero-Gravity Matter.js Physics Belt -->
  <div id="physics-arena">
    <div class="physics-token" data-idx="0">⚡ GET /health</div>
    <div class="physics-token" data-idx="1">🩸 Blood Compatibility</div>
    <div class="physics-token" data-idx="2">❄️ Cold-Chain 2-8°C</div>
    <div class="physics-token" data-idx="3">🔐 Ed25519 Signatures</div>
    <div class="physics-token" data-idx="4">⛓️ SHA-256 Hash Chain</div>
    <div class="physics-token" data-idx="5">📊 DOS &lt; 2d Forecast</div>
    <div class="physics-token" data-idx="6">🛰️ IoT Telemetry Ingest</div>
  </div>

  <!-- 620vh Scroll Container -->
  <div id="scroll-host">
    <div class="docs-viewport">

      <!-- Section 1: Hero & Architecture -->
      <section class="doc-section" id="quickstart">
        <div class="hero-eyebrow">
          <span>●</span> Autonomous Medical Supply Protection
        </div>
        <h1 class="doc-title">PharmaShield Tripartite Central Engine</h1>
        <p class="doc-desc">
          High-performance FastAPI logistics &amp; cryptographic bus orchestrating emergency supplies across Bhagalpur healthcare networks. Powered by deterministic SHA-256 hash chaining, Ed25519 digital signatures, continuous 2–8°C thermal excursion detection, and real-time WebSockets.
        </p>

        <div class="cards-grid">
          <div class="glass-card">
            <div class="card-title">
              <span>🩺</span> Portal 1: Doctor Requisition
            </div>
            <p class="card-body">
              Emergency multi-step requisition UI with patient-PII redactor and instant AI match ranked by urgency, distance, and stock availability.
            </p>
          </div>
          <div class="glass-card">
            <div class="card-title">
              <span>📦</span> Portal 2: Pharma Ops
            </div>
            <p class="card-body">
              Live inventory tracking across 6 medical categories, automatic Days-of-Stock (DOS) shortage prediction, and PostGIS geo-routing.
            </p>
          </div>
          <div class="glass-card">
            <div class="card-title">
              <span>🛡️</span> Portal 3: Cyber Lab &amp; Trust
            </div>
            <p class="card-body">
              Tamper-evident audit ledger explorer with instant visual signature verification and zero-trust cryptographic chain validation.
            </p>
          </div>
        </div>

        <pre class="code-block"><button class="copy-pill" onclick="copySnippet('curl-start')">Copy</button><code id="curl-start"># Ingest cold-chain IoT telemetry with automated excursion trigger
curl -X POST "http://localhost:8000/api/v1/shipments/SHP-001/telemetry" \
     -H "Content-Type: application/json" \
     -d '{{"temperature_c": 12.4, "latitude": 25.2445, "longitude": 87.0125, "battery_pct": 98}}'</code></pre>
      </section>

      <!-- Section 2: Core Domain & Mathematical Contracts -->
      <section class="doc-section" id="contracts">
        <div class="hero-eyebrow">
          <span>●</span> Section 02 // Mathematical &amp; Domain Contracts
        </div>
        <h2 class="doc-title">Safety Rules &amp; Matching Engine</h2>
        <p class="doc-desc">
          Strict hard-filter exclusion guarantees patient safety before candidate scoring. Blood matrix rules and cold-chain temperature thresholds are non-negotiable.
        </p>

        <div class="cards-grid">
          <div class="glass-card">
            <div class="card-title">5-Factor Candidate Scoring</div>
            <div class="card-body">
              $$\text{{Score}} = 0.30 U + 0.25 A + 0.20 T + 0.15 S + 0.10 R$$
              <br><br>
              • <strong>U</strong>: Urgency (CRITICAL = 100, URGENT = 85)<br>
              • <strong>A</strong>: Availability % ($$\\min(100, (\\text{{avail}} / \\text{{req}}) \\times 100)$$)<br>
              • <strong>T</strong>: Transport ($$\\max(0, 100 - 2 \\times \\text{{km}})$$)<br>
              • <strong>S</strong>: Safety &amp; cold-chain vehicle rating<br>
              • <strong>R</strong>: Historical fulfillment reliability (85–98%)
            </div>
          </div>

          <div class="glass-card">
            <div class="card-title">Shortage Forecasting (DOS)</div>
            <div class="card-body">
              $$\text{{DOS}} = \frac{{\text{{Current Inventory Units}}}}{{\text{{Average Daily Consumption Units}}}}$$
              <br><br>
              When $$\text{{DOS}} \le \text{{Supplier Lead Time}}$$, the engine triggers <code>CRITICAL_SHORTAGE_PREDICTED</code> and pushes an instant alert to the WebSocket bus (<code>/ws/events</code>).
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Cryptographic Trust Ledger -->
      <section class="doc-section" id="cryptography">
        <div class="hero-eyebrow">
          <span>●</span> Section 03 // Cryptographic Verification
        </div>
        <h2 class="doc-title">Ed25519 &amp; SHA-256 Hash Chain</h2>
        <p class="doc-desc">
          Zero fake blockchain, zero gas fees. 100% deterministic SHA-256 canonical hash chaining combined with asymmetric Ed25519 keypairs provides enterprise-grade tamper evidence.
        </p>

        <pre class="code-block"><button class="copy-pill" onclick="copySnippet('hash-chain-math')">Copy</button><code id="hash-chain-math"># Hash Chain Formula
H_0 = "0000000000000000000000000000000000000000000000000000000000000000"
H_i = SHA-256( H_{{i-1}} || CanonicalJSON(EventPayload_i) )
Signature_i = Ed25519_Sign( PrivateKey_Org, H_i )</code></pre>

        <div class="cards-grid">
          <div class="glass-card">
            <div class="card-title">Deterministic Canonical JSON</div>
            <div class="card-body">
              Keys are strictly sorted with zero whitespace separators (<code>json.dumps(data, sort_keys=True, separators=(',', ':'))</code>). Any space or key reorder invalidates the SHA-256 digest immediately.
            </div>
          </div>
          <div class="glass-card">
            <div class="card-title">Instant Tamper Rejection</div>
            <div class="card-body">
              If an attacker modifies a temperature log or custody timestamp in transit, the recalculated hash fails the Ed25519 public key verification and alerts all connected nodes.
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Live Probes -->
      <section class="doc-section" id="probes">
        <div class="hero-eyebrow">
          <span>●</span> Section 04 // Live Interactive Probes
        </div>
        <h2 class="doc-title">Real-Time Central Bus Probes</h2>
        <p class="doc-desc">
          Execute direct probes against the live running backend on port 8000 and inspect cryptographic ledger responses instantly.
        </p>

        <div class="probe-grid">
          <div class="probe-card">
            <div>
              <div class="card-title">API Health Check</div>
              <div class="card-body">Verifies server uptime, SQLite/Postgres connection, and WebSocket bus status.</div>
            </div>
            <button class="probe-btn" onclick="runProbe('/health', 'out-health')">Probe /health</button>
            <div class="probe-out" id="out-health">Click probe button above...</div>
          </div>

          <div class="probe-card">
            <div>
              <div class="card-title">Inventory &amp; DOS Alerts</div>
              <div class="card-body">Queries active Bhagalpur blood banks &amp; hospital batches for low DOS alerts.</div>
            </div>
            <button class="probe-btn" onclick="runProbe('/api/v1/inventory?stock_alerts_only=true', 'out-inv')">Probe /inventory</button>
            <div class="probe-out" id="out-inv">Click probe button above...</div>
          </div>

          <div class="probe-card">
            <div>
              <div class="card-title">Cryptographic Ledger Head</div>
              <div class="card-body">Fetches latest canonical audit event and validates its Ed25519 signature.</div>
            </div>
            <button class="probe-btn" onclick="runProbe('/api/v1/security/ledger', 'out-ledger')">Inspect Ledger</button>
            <div class="probe-out" id="out-ledger">Click probe button above...</div>
          </div>
        </div>

        <!-- Embedded Swagger UI -->
        <div id="swagger-wrapper">
          <div class="card-title" style="margin-bottom: 16px;">
            <span>📘</span> OpenAPI Specification &amp; Interactive Route Sandbox
          </div>
          <div id="swagger-ui"></div>
        </div>
      </section>

    </div>
  </div>

  <!-- Bottom Scroll Hint -->
  <div id="scroll-hint">SCROLL ↓</div>

  <!-- Command Palette Modal -->
  <div id="cmd-palette">
    <div class="palette-box">
      <input type="text" class="palette-input" id="palette-search" placeholder="Type to search endpoints or docs... (Esc to close)">
      <div class="palette-results" id="palette-list">
        <div class="palette-item" onclick="jumpSection('quickstart')"><span>🚀 Quickstart &amp; Architecture</span><span>Section 01</span></div>
        <div class="palette-item" onclick="jumpSection('contracts')"><span>🩸 Medical Contracts &amp; Safety</span><span>Section 02</span></div>
        <div class="palette-item" onclick="jumpSection('cryptography')"><span>🔐 Ed25519 Cryptographic Ledger</span><span>Section 03</span></div>
        <div class="palette-item" onclick="jumpSection('probes')"><span>⚡ Live Endpoint Probes</span><span>Section 04</span></div>
        <div class="palette-item" onclick="jumpSection('swagger-wrapper')"><span>📘 Swagger Interactive Sandbox</span><span>OpenAPI</span></div>
        <div class="palette-item" onclick="window.open('http://localhost:5173')"><span>🩺 Portal 1: Doctor Clinical</span><span>:5173 ↗</span></div>
        <div class="palette-item" onclick="window.open('http://localhost:5174')"><span>📦 Portal 2: Pharma Ops</span><span>:5174 ↗</span></div>
        <div class="palette-item" onclick="window.open('http://localhost:5175')"><span>🛡️ Portal 3: Cyber Lab</span><span>:5175 ↗</span></div>
      </div>
    </div>
  </div>

  <!-- Three.js Flow Wave & Matter.js Core Engine -->
  <script type="module">
    import * as THREE from 'three';
    import {{ EffectComposer }} from 'three/addons/postprocessing/EffectComposer.js';
    import {{ RenderPass }} from 'three/addons/postprocessing/RenderPass.js';
    import {{ UnrealBloomPass }} from 'three/addons/postprocessing/UnrealBloomPass.js';
    import {{ ShaderPass }} from 'three/addons/postprocessing/ShaderPass.js';
    import {{ GammaCorrectionShader }} from 'three/addons/shaders/GammaCorrectionShader.js';
    import {{ CopyShader }} from 'three/addons/shaders/CopyShader.js';

    // -------------------------------------------------------------
    // 1. EXACT FIXED CONSTANTS & HELPERS (VERBATIM SPECIFICATION)
    // -------------------------------------------------------------
    const bgColor         = '#02160c';   // FinalPass background tint
    const flameColor      = '#0aff7f';   // corner-flame A
    const flameColor2     = '#aef0c0';   // corner-flame B
    const flameAmt        = 0.2;         // corner-flame intensity
    const atmoColor       = '#7affbf';   // ambient motes color
    const atmoCount       = 300;         // mote count
    const atmoSize        = 24;          // mote base size
    const atmoSpeed       = 1.0;         // mote warp speed
    const colorLow        = '#02160c';   // points low color
    const colorHigh       = '#34e89a';   // points high color
    const opacity         = 0.26;        // point opacity
    const pointSize       = 5.5;         // point base size
    const brightness      = 0.45;        // point color multiplier
    const waveHeight      = 3;           // base swell amplitude
    let   flow            = 1;           // noise scroll speed (toggleable)
    const tilt            = 0;           // sheet X rotation (negated)
    const scale           = 0.275;       // shrinks the sheet to frame
    const scrollRise      = 1.0;         // swell amplitude growth on scroll
    const camStartY       = 7,  camStartZ = 16;   // scroll 0 camera
    const camEndY         = 0.8, camEndZ  = -2;   // scroll 1 camera
    const lookStartZ      = 2,  lookEndZ  = -16;  // look-target pan
    const parallax        = 1.2;
    const pointerRadius   = 7.0;
    const pointerStrength = 0.9;

    const Lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    function hexToVec3(hex) {{
      const n = parseInt(hex.slice(1), 16);
      return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
    }}

    // -------------------------------------------------------------
    // 2. RENDERER, CAMERA & SCENE SETUP
    // -------------------------------------------------------------
    const canvas = document.getElementById('scene');
    const renderer = new THREE.WebGL1Renderer({{ canvas, antialias: true }});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 0, 15);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, camStartY, camStartZ);

    const LAYERS = {{ NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 }};
    camera.layers.enable(LAYERS.TORUS_SCENE);
    camera.layers.enable(LAYERS.BLOOM_SCENE);
    camera.layers.enable(LAYERS.ENTIRE_SCENE);
    scene.add(camera);

    // -------------------------------------------------------------
    // 3. 3-STAGE POSTPROCESSING PIPELINE
    // -------------------------------------------------------------
    const renderPass = new RenderPass(scene, camera);

    // Stage 1: torusComposer (renderToScreen = false)
    const torusComposer = new EffectComposer(renderer);
    torusComposer.renderToScreen = false;
    torusComposer.addPass(renderPass);
    torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
    torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.22, 0.2, 0));
    torusComposer.addPass(new ShaderPass(CopyShader));

    // Stage 2: bloomComposer (renderToScreen = false)
    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderPass);
    bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.55, 0));
    bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

    // Stage 3: finalComposer
    const finalPassShader = {{
      uniforms: {{
        tDiffuse: {{ value: null }},
        bloomTexture: {{ value: null }},
        torusTexture: {{ value: null }},
        haloTexture: {{ value: new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat) }},
        iTime: {{ value: 0 }},
        uBg: {{ value: hexToVec3(bgColor) }},
        uFlameA: {{ value: hexToVec3(flameColor) }},
        uFlameB: {{ value: hexToVec3(flameColor2) }},
        uFlameAmt: {{ value: flameAmt }}
      }},
      vertexShader: `
        varying vec2 vUv;
        void main() {{
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }}
      `,
      fragmentShader: `
        uniform float iTime;
        uniform sampler2D tDiffuse;
        uniform sampler2D bloomTexture;
        uniform sampler2D torusTexture;
        uniform sampler2D haloTexture;
        uniform vec3 uBg;
        uniform vec3 uFlameA;
        uniform vec3 uFlameB;
        uniform float uFlameAmt;
        varying vec2 vUv;

        vec3 warp3d(vec3 pos, float t) {{
          float curv = .8, a = 1.9, b = 0.7;
          pos *= 2.;
          pos.x += curv * sin(t + a * pos.y) + t * b;
          pos.y += curv * cos(t + a * pos.x);
          pos.z += curv * sin(t + a * pos.z) + t * b;
          pos.z += curv * cos(t + a * pos.y);
          pos.z += curv * sin(t + a * pos.x) + t * b;
          pos.x += curv * cos(t + a * pos.z);
          return 0.5 + 0.5 * cos(pos.xyz + vec3(1, 2, 4));
        }}

        void main() {{
          vec2 uv = 2. * vUv - 1.;
          vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * 1.5), vec3(1.5));
          vec3 flame = 1.5 * uFlameA * w.x;
          flame *= w.y;
          flame += uFlameB * w.z;
          flame *= smoothstep(0.25, 1., abs(uv.y));
          float md = smoothstep(-0.7, 1., -uv.y * uv.x);
          flame *= md * md;
          vec3 bg = uBg * (1.0 - 0.4 * length(uv));
          vec3 halo = texture2D(haloTexture, vUv).xyz;
          gl_FragColor = vec4(bg + flame * uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
        }}
      `
    }};
    finalPassShader.uniforms.haloTexture.value.needsUpdate = true;

    const finalPass = new ShaderPass(finalPassShader, 'tDiffuse');
    finalPass.needsSwap = true;

    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderPass);
    finalComposer.addPass(finalPass);

    finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture;
    finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture;

    // -------------------------------------------------------------
    // 4. FLOW WAVE CORE (SNOISE & SHADER MATERIAL VERBATIM)
    // -------------------------------------------------------------
    const SNOISE = `
      vec4 permute(vec4 x){{return mod(((x*34.0)+1.0)*x, 289.0);}}
      vec4 taylorInvSqrt(vec4 r){{return 1.79284291400159 - 0.85373472095314 * r;}}
      float snoise(vec3 v){{
        const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }}
    `;

    const waveUniforms = {{
      uTime: {{ value: 0 }},
      uStream: {{ value: 0 }},
      uAppear: {{ value: 0 }},
      uColLow: {{ value: hexToVec3(colorLow) }},
      uColHigh: {{ value: hexToVec3(colorHigh) }},
      uOpacity: {{ value: opacity }},
      uSize: {{ value: pointSize }},
      uBrightness: {{ value: brightness }},
      uWaveHeight: {{ value: waveHeight }},
      uFlow: {{ value: flow }},
      uScale: {{ value: scale }},
      uCursor: {{ value: new THREE.Vector3() }},
      uRepelRadius: {{ value: pointerRadius }},
      uRepelStrength: {{ value: pointerStrength }},
      uActivity: {{ value: 0 }}
    }};

    const waveMaterial = new THREE.ShaderMaterial({{
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: waveUniforms,
      vertexShader: `
        uniform float uTime; uniform float uStream; uniform float uSize; uniform float uWaveHeight; uniform float uFlow; uniform float uScale;
        uniform vec3 uColLow; uniform vec3 uColHigh;
        uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
        varying float vFade; varying vec3 vColor;
        ${{SNOISE}}
        void main() {{
          vec3 wp = vec3(position.x * 13.0, 0.0, position.z * 25.0);
          wp.x += position.y * 6.0;
          float zc = wp.z + uStream;
          float wn = snoise(vec3(wp.x * 0.08, zc * 0.08, uTime * 0.15 * uFlow)) * 2.0;
          wn += snoise(vec3(wp.x * 0.16, zc * 0.16, uTime * 0.3 * uFlow)) * 0.8;
          wp.y += wn * uWaveHeight;

          vec3 finalPos = wp * uScale;
          vec4 modelPosition = modelMatrix * vec4(finalPos, 1.0);
          vec3 toP = modelPosition.xyz - uCursor;
          float cd = length(toP);
          float fall = smoothstep(uRepelRadius, 0.0, cd);
          modelPosition.xyz += normalize(toP + vec3(0.0001)) * fall * uRepelStrength * uActivity;
          vec4 mvPosition = viewMatrix * modelPosition;

          float colMix = smoothstep(-3.0, 3.0, position.y + position.x * 0.5);
          vColor = mix(uColLow, uColHigh, clamp(colMix, 0.0, 1.0));
          vFade = 1.0;

          gl_PointSize = uSize * (10.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 1.5);
          gl_Position = projectionMatrix * mvPosition;
        }}
      `,
      fragmentShader: `
        uniform float uOpacity; uniform float uBrightness; uniform float uAppear;
        varying float vFade; varying vec3 vColor;
        void main() {{
          vec2 xy = gl_PointCoord - 0.5;
          float ll = length(xy);
          if (ll > 0.5) discard;
          float a = smoothstep(0.5, 0.1, ll);
          gl_FragColor = vec4(vColor * uBrightness, vFade * a * uOpacity * uAppear);
        }}
      `
    }});

    const sphereGeometry = new THREE.SphereGeometry(4.2, 200, 600);
    const flowPoints = new THREE.Points(sphereGeometry, waveMaterial);
    flowPoints.frustumCulled = false;
    flowPoints.layers.set(LAYERS.ENTIRE_SCENE);

    const waveGroup = new THREE.Group();
    waveGroup.add(flowPoints);
    scene.add(waveGroup);

    // -------------------------------------------------------------
    // 5. 3D ACCENTS ON TORUS & BLOOM LAYERS
    // -------------------------------------------------------------
    const torusGeo = new THREE.TorusGeometry(3.2, 0.08, 24, 120);
    const torusMat = new THREE.MeshBasicMaterial({{
      color: 0x34e89a,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    }});
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.layers.set(LAYERS.TORUS_SCENE);
    torusMesh.position.set(0, 3.2, 2);
    scene.add(torusMesh);

    const crystalGeo = new THREE.OctahedronGeometry(1.4, 0);
    const crystalMat = new THREE.MeshBasicMaterial({{
      color: 0x0aff7f,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    }});
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.layers.set(LAYERS.BLOOM_SCENE);
    crystalMesh.position.set(0, 3.2, 2);
    scene.add(crystalMesh);

    // -------------------------------------------------------------
    // 6. AMBIENT MOTES (CAMERA-ATTACHED PARTICLES)
    // -------------------------------------------------------------
    const atmoPoints = (() => {{
      const N = Math.round(atmoCount);
      const pos = new Float32Array(N * 3);
      const sizeArr = new Float32Array(N);
      const seedArr = new Float32Array(N);

      for (let i = 0; i < N; i++) {{
        pos[i * 3 + 0] = (Math.random() - 0.5) * 2.0;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
        sizeArr[i] = atmoSize * (0.4 + Math.random());
        seedArr[i] = Math.random();
      }}

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizeArr, 1));
      geo.setAttribute('seed', new THREE.BufferAttribute(seedArr, 1));

      const atmoMat = new THREE.ShaderMaterial({{
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        uniforms: {{
          uTime: {{ value: 0 }},
          uColor: {{ value: hexToVec3(atmoColor) }},
          uRes: {{ value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio) }}
        }},
        vertexShader: `
          attribute float size; attribute float seed; uniform float uTime; uniform vec2 uRes;
          varying float vA;
          vec3 warp(vec3 p, float t){{ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
            p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
            p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
            return cos(p+vec3(1,2,4)); }}
          void main(){{
            vec3 v = position*4.0 + warp(position, uTime)*1.2;
            vec4 mv = modelViewMatrix * vec4(v, 1.0);
            float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
            vA = farF * nearF;
            gl_PointSize = size * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
            gl_Position = projectionMatrix * mv;
          }}
        `,
        fragmentShader: `
          uniform vec3 uColor; varying float vA;
          void main(){{ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
            float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor * tex, tex * vA * 0.6); }}
        `
      }});

      const pts = new THREE.Points(geo, atmoMat);
      pts.layers.set(LAYERS.ENTIRE_SCENE);
      pts.frustumCulled = false;

      pts.onBeforeRender = () => {{
        const t = performance.now() / 1000;
        atmoMat.uniforms.uTime.value = t * atmoSpeed * 8.0;
        pts.position.copy(camera.position);
        finalPass.uniforms.iTime.value = t;
      }};

      scene.add(pts);
      return {{ pts, atmoMat }};
    }})();

    // -------------------------------------------------------------
    // 7. DOUBLE-DAMPED SCROLL & POINTER ENGINE
    // -------------------------------------------------------------
    let scrollTarget = 0;
    let scrollSmooth = 0;
    let scrollCurrent = 0;

    window.addEventListener('scroll', () => {{
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
    }}, {{ passive: true }});

    const mouseTarget = new THREE.Vector2(0, 0);
    const mouse = new THREE.Vector2(0, 0);
    const POINTER = {{
      world: new THREE.Vector3(),
      activity: 0
    }};
    let lastMouseMove = performance.now();

    window.addEventListener('mousemove', (e) => {{
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
      lastMouseMove = performance.now();
      POINTER.activity = 1.0;
    }});

    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    function updatePointerWorld() {{
      raycaster.setFromCamera(mouse, camera);
      const target = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(planeZ, target)) {{
        POINTER.world.copy(target);
      }}
    }}

    // -------------------------------------------------------------
    // 8. MATTER.JS ZERO-GRAVITY INTERACTIVE PHYSICS BELT
    // -------------------------------------------------------------
    const {{ Engine, Bodies, Composite, Constraint, Body, Vector }} = Matter;
    const physicsEngine = Engine.create({{
      gravity: {{ x: 0, y: 0, scale: 0.001 }}
    }});

    const tokenEls = Array.from(document.querySelectorAll('.physics-token'));
    const tokenBodies = [];
    const arenaW = window.innerWidth;
    const spacing = arenaW / (tokenEls.length + 1);

    tokenEls.forEach((el, i) => {{
      const startX = spacing * (i + 1);
      const startY = 35 + (i % 2 === 0 ? -12 : 12);
      const body = Bodies.rectangle(startX, startY, 140, 36, {{
        frictionAir: 0.04,
        restitution: 0.8
      }});

      const anchor = Constraint.create({{
        pointA: {{ x: startX, y: startY }},
        bodyB: body,
        stiffness: 0.018,
        damping: 0.06
      }});

      Composite.add(physicsEngine.world, [body, anchor]);
      tokenBodies.push({{ el, body, anchor, originX: startX, originY: startY }});

      // Drag interaction
      let isDragging = false;
      el.addEventListener('mousedown', (e) => {{
        isDragging = true;
        el.style.cursor = 'grabbing';
      }});
      window.addEventListener('mouseup', () => {{
        isDragging = false;
        el.style.cursor = 'grab';
      }});
      window.addEventListener('mousemove', (e) => {{
        if (isDragging) {{
          Body.setPosition(body, {{ x: e.clientX, y: e.clientY - 120 }});
        }}
      }});
    }});

    // -------------------------------------------------------------
    // 9. ANIMATION LOOP & TELEMETRY HUD
    // -------------------------------------------------------------
    const appState = {{
      t0: performance.now() / 1000,
      stream: 0,
      appearStart: performance.now(),
      fpsFrames: 0,
      fpsLastTime: performance.now(),
      focusMode: false
    }};

    const hudFps = document.getElementById('hud-fps');
    const hudScroll = document.getElementById('hud-scroll');
    const hudSwell = document.getElementById('hud-swell');

    function animate() {{
      requestAnimationFrame(animate);

      const t = performance.now() / 1000;
      const dt = Math.min(0.05, t - appState.t0);
      appState.t0 = t;

      // FPS Calculation
      appState.fpsFrames++;
      if (performance.now() - appState.fpsLastTime >= 500) {{
        const fps = Math.round((appState.fpsFrames * 1000) / (performance.now() - appState.fpsLastTime));
        hudFps.textContent = fps;
        appState.fpsFrames = 0;
        appState.fpsLastTime = performance.now();
      }}

      // Damped Scroll & Pointer
      scrollSmooth = Lerp(scrollSmooth, scrollTarget, 0.08);
      scrollCurrent = Lerp(scrollCurrent, scrollSmooth, 0.1);
      const scroll = scrollCurrent;

      mouse.x = Lerp(mouse.x, mouseTarget.x, 0.08);
      mouse.y = Lerp(mouse.y, mouseTarget.y, 0.08);
      const idleTime = (performance.now() - lastMouseMove) / 1000;
      POINTER.activity = Math.max(0, 1.0 - idleTime * 0.8);

      // Uniform updates
      waveUniforms.uTime.value = t;
      appState.stream += dt * (flow * 2.0) * 4.0;
      waveUniforms.uStream.value = appState.stream;
      const currentWaveHeight = waveHeight * (1 + scroll * scrollRise);
      waveUniforms.uWaveHeight.value = currentWaveHeight;

      // Camera dive through 620vh
      const ea = Math.min(scroll / 0.35, 1.0);
      const e = ea * ea * (3 - 2 * ea);
      const camY = Lerp(camStartY, camEndY, e);
      const camZ = Lerp(camStartZ, camEndZ, e);
      camera.position.set(mouse.x * parallax, camY + mouse.y * parallax * 0.3, camZ);
      camera.lookAt(mouse.x * parallax * 0.5, Lerp(0.0, 0.6, e), Lerp(lookStartZ, lookEndZ, e));

      waveGroup.rotation.x = -tilt;
      waveGroup.rotation.y = 0;
      updatePointerWorld();

      waveUniforms.uCursor.value.copy(POINTER.world);
      waveUniforms.uActivity.value = POINTER.activity;
      const elapsed = (performance.now() - appState.appearStart) / 1000;
      waveUniforms.uAppear.value = Math.max(0, Math.min(1, (elapsed - 0.2) / 1.4));

      // Rotate 3D Torus & Crystal
      torusMesh.rotation.x += 0.007;
      torusMesh.rotation.y += 0.012;
      crystalMesh.rotation.x -= 0.009;
      crystalMesh.rotation.y += 0.014;

      // Update Matter.js Physics Belt
      Engine.update(physicsEngine, dt * 1000);
      const screenPointerX = (mouse.x * 0.5 + 0.5) * window.innerWidth;
      const screenPointerY = (-mouse.y * 0.5 + 0.5) * 120;

      tokenBodies.forEach(({{ el, body }}) => {{
        // Soft mouse repulsion
        const dx = body.position.x - screenPointerX;
        const dy = body.position.y - screenPointerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 1) {{
          const force = (1.0 - dist / 140) * 0.0012;
          Body.applyForce(body, body.position, {{ x: (dx / dist) * force, y: (dy / dist) * force }});
        }}
        el.style.transform = `translate3d(${{body.position.x - 70}}px, ${{body.position.y - 18}}px, 0px) rotate(${{body.angle}}rad)`;
      }});

      // Update HUD
      hudScroll.textContent = `${{Math.round(scroll * 100)}}%`;
      hudSwell.textContent = currentWaveHeight.toFixed(2);

      // -------------------------------------------------------------
      // 10. VERBATIM COMPOSER RENDER SEQUENCE
      // -------------------------------------------------------------
      camera.layers.set(LAYERS.TORUS_SCENE);
      torusComposer.render();

      camera.layers.set(LAYERS.BLOOM_SCENE);
      bloomComposer.render();

      camera.layers.set(LAYERS.ENTIRE_SCENE);
      finalComposer.render();
    }}

    animate();

    // -------------------------------------------------------------
    // 11. RESIZE HANDLER
    // -------------------------------------------------------------
    window.addEventListener('resize', () => {{
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      torusComposer.setSize(w, h);
      bloomComposer.setSize(w, h);
      finalComposer.setSize(w, h);

      atmoPoints.atmoMat.uniforms.uRes.value.set(w * window.devicePixelRatio, h * window.devicePixelRatio);
    }});

    // -------------------------------------------------------------
    // 12. FOCUS READ MODE TOGGLE
    // -------------------------------------------------------------
    const focusBtn = document.getElementById('focus-btn');
    focusBtn.addEventListener('click', () => {{
      appState.focusMode = !appState.focusMode;
      document.body.classList.toggle('focus-mode', appState.focusMode);
      focusBtn.classList.toggle('active', appState.focusMode);

      if (appState.focusMode) {{
        flow = 0.2;
        waveUniforms.uBrightness.value = 0.22;
        waveUniforms.uOpacity.value = 0.15;
      }} else {{
        flow = 1.0;
        waveUniforms.uBrightness.value = brightness;
        waveUniforms.uOpacity.value = opacity;
      }}
    }});
  </script>

  <!-- Interactive Probes, Command Palette & Swagger Loader -->
  <script>
    // Live Probe Execution against FastAPI
    async function runProbe(endpoint, outId) {{
      const out = document.getElementById(outId);
      out.textContent = "Connecting to " + endpoint + "...";
      const start = performance.now();
      try {{
        const res = await fetch(endpoint);
        const data = await res.json();
        const latency = (performance.now() - start).toFixed(1);
        out.textContent = `[HTTP ${{res.status}} OK — ${{latency}}ms]\n` + JSON.stringify(data, null, 2);
      }} catch (err) {{
        out.textContent = "[PROBE ERROR]: " + err.message;
      }}
    }}

    function copySnippet(id) {{
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text);
      alert("Code copied to clipboard!");
    }}

    // Command Palette Logic
    const palette = document.getElementById('cmd-palette');
    const paletteSearch = document.getElementById('palette-search');
    const openBtn = document.getElementById('open-cmd');

    function togglePalette() {{
      palette.classList.toggle('open');
      if (palette.classList.contains('open')) {{
        paletteSearch.focus();
        paletteSearch.value = '';
      }}
    }}

    openBtn.addEventListener('click', togglePalette);
    window.addEventListener('keydown', (e) => {{
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {{
        e.preventDefault();
        togglePalette();
      }} else if (e.key === 'Escape' && palette.classList.contains('open')) {{
        togglePalette();
      }}
    }});

    palette.addEventListener('click', (e) => {{
      if (e.target === palette) togglePalette();
    }});

    function jumpSection(id) {{
      togglePalette();
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({{ behavior: 'smooth' }});
    }}

    // Mount Swagger UI
    window.addEventListener('load', () => {{
      SwaggerUIBundle({{
        url: '{openapi_url}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        docExpansion: 'list',
        syntaxHighlight: {{
          activated: true,
          theme: 'monokai'
        }}
      }});
    }});
  </script>

</body>
</html>"""
