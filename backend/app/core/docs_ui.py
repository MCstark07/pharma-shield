"""
PharmaShield — Flow Wave WebGL (Three.js r0.143.0) + Matter.js 3D Interactive Documentation Engine
Upright zero-gravity physics arena, deduplicated API explorer with live expandable execution drawers,
radar cursor spotlight, and verbatim Flow Wave postprocessing pipeline.
"""

def get_custom_docs_html(title: str = "PharmaShield Cyber-Logistics | 3D Interactive API Studio", openapi_url: str = "/openapi.json") -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230aff7f'><path d='M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 4.5l5 2.8v3.7c0 3.12-2.16 6.04-5 6.84-2.84-.8-5-3.72-5-6.84V9.3l5-2.8z'/></svg>">

  <!-- Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Swagger UI CSS & Bundle -->
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

  <!-- Matter.js 0.19.0 -->
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

    /* Smart Floating Scroll/Top Pill Button */
    #scroll-hint {{
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #7affbf;
      background: rgba(2, 22, 12, 0.92);
      border: 1px solid rgba(52, 232, 154, 0.45);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.75), 0 0 16px rgba(52, 232, 154, 0.2);
      backdrop-filter: blur(14px);
      padding: 9px 22px;
      border-radius: 9999px;
      cursor: pointer !important;
      pointer-events: auto !important;
      z-index: 8500 !important;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      outline: none;
    }}

    #scroll-hint:hover {{
      border-color: #34e89a;
      color: #ffffff;
      background: rgba(4, 30, 16, 0.98);
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.85), 0 0 25px rgba(10, 255, 127, 0.45);
      transform: translate(-50%, -3px);
    }}

    #scroll-hint:active {{
      transform: translate(-50%, 0) scale(0.96);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
    }}

    #scroll-hint.is-top {{
      border-color: rgba(10, 255, 127, 0.7);
      color: #0aff7f;
      background: rgba(4, 32, 18, 0.95);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.8), 0 0 20px rgba(10, 255, 127, 0.35);
    }}

    #scroll-hint #scroll-hint-icon {{
      font-size: 13px;
      font-weight: 900;
      transition: transform 0.2s ease;
    }}

    #scroll-hint.pulse-hint {{
      animation: pulseHint 2.4s infinite ease-in-out;
    }}

    @keyframes pulseHint {{
      0%, 100% {{ box-shadow: 0 4px 24px rgba(0, 0, 0, 0.75), 0 0 16px rgba(52, 232, 154, 0.2); }}
      50% {{ box-shadow: 0 4px 30px rgba(0, 0, 0, 0.9), 0 0 26px rgba(10, 255, 127, 0.45); }}
    }}

    /* Sticky Navigation Bar with Integrated HUD */
    header.glass-nav {{
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 68px;
      background: rgba(2, 22, 12, 0.88);
      backdrop-filter: blur(16px) saturate(140%);
      border-bottom: 1px solid rgba(52, 232, 154, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
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
      border: 1px solid rgba(10, 255, 127, 0.4);
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
      gap: 18px;
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
      text-shadow: 0 0 10px rgba(122, 255, 191, 0.4);
    }}

    .nav-right {{
      display: flex;
      align-items: center;
      gap: 14px;
    }}

    /* Docked Telemetry Pill inside Navbar */
    .docked-hud {{
      background: rgba(4, 18, 12, 0.7);
      border: 1px solid rgba(52, 232, 154, 0.25);
      border-radius: 9999px;
      padding: 5px 14px;
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #aef0c0;
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
      font-weight: 600;
      transition: all 0.2s;
    }}

    .focus-toggle.active {{
      background: #0aff7f;
      color: #02160c;
      font-weight: 800;
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

    /* Documentation Viewport */
    .docs-viewport {{
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
      padding: 120px 24px 100px;
      display: flex;
      flex-direction: column;
      gap: 32vh;
    }}

    .doc-section {{
      position: relative;
      background: rgba(2, 22, 12, 0.68);
      border: 1px solid rgba(52, 232, 154, 0.18);
      border-radius: 24px;
      backdrop-filter: blur(16px) saturate(140%);
      padding: 40px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(10, 255, 127, 0.04);
      transition: border-color 0.3s, box-shadow 0.3s;
      overflow: hidden;
    }}

    .doc-section::before {{
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: radial-gradient(500px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(52, 232, 154, 0.12), transparent 70%);
      pointer-events: none;
      z-index: 1;
    }}

    .doc-section > * {{
      position: relative;
      z-index: 2;
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
      font-size: 40px;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.15;
      background: linear-gradient(135deg, #ffffff 40%, #7affbf 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 14px;
    }}

    .doc-desc {{
      color: #94a3b8;
      font-size: 16px;
      line-height: 1.6;
      max-width: 820px;
      margin-bottom: 24px;
    }}

    /* Dedicated Interactive Hero Physics Playground */
    #hero-physics-container {{
      position: relative;
      background: rgba(4, 18, 12, 0.7);
      border: 1px solid rgba(52, 232, 154, 0.25);
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 28px;
      overflow: hidden;
    }}

    .physics-playground-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }}

    .playground-title {{
      color: #0aff7f;
      font-weight: 700;
      letter-spacing: 0.08em;
    }}

    .playground-hint {{
      color: #64748b;
      font-size: 10px;
    }}

    #hero-physics-arena {{
      position: relative;
      width: 100%;
      height: 160px;
      overflow: hidden;
      border-radius: 12px;
      background: rgba(1, 10, 5, 0.6);
      border: 1px dashed rgba(52, 232, 154, 0.18);
    }}

    .physics-token {{
      position: absolute;
      top: 0;
      left: 0;
      padding: 8px 16px;
      border-radius: 9999px;
      background: rgba(4, 22, 14, 0.9);
      border: 1px solid rgba(52, 232, 154, 0.4);
      backdrop-filter: blur(12px);
      color: #aef0c0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      cursor: grab;
      user-select: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 12px rgba(52, 232, 154, 0.2);
      transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
      white-space: nowrap;
      will-change: transform;
      z-index: 20;
    }}

    .physics-token:hover {{
      border-color: #0aff7f;
      color: #ffffff;
      box-shadow: 0 0 20px rgba(10, 255, 127, 0.5);
    }}

    .physics-token.ripple-pulse {{
      animation: rippleAnim 0.6s ease-out;
    }}

    @keyframes rippleAnim {{
      0% {{ transform: scale(1); box-shadow: 0 0 0 0 rgba(10, 255, 127, 0.8); }}
      50% {{ transform: scale(1.08); box-shadow: 0 0 25px 8px rgba(10, 255, 127, 0.6); }}
      100% {{ transform: scale(1); box-shadow: 0 0 12px rgba(52, 232, 154, 0.2); }}
    }}

    /* Docked badge bar when Focus Mode is ON */
    #hero-physics-arena.docked {{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 10px;
      height: auto;
      padding: 16px;
    }}

    #hero-physics-arena.docked .physics-token {{
      position: static !important;
      transform: none !important;
      cursor: pointer;
    }}

    /* Cards Grid */
    .cards-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }}

    .glass-card {{
      position: relative;
      background: rgba(9, 30, 18, 0.6);
      border: 1px solid rgba(52, 232, 154, 0.18);
      border-radius: 16px;
      padding: 24px;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
      overflow: hidden;
    }}

    .glass-card:hover {{
      transform: translateY(-4px);
      border-color: #0aff7f;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(10, 255, 127, 0.12);
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

    /* -------------------------------------------------------------
       DEDUPLICATED API EXPLORER WITH EXPANDABLE LIVE DRAWERS
       ------------------------------------------------------------- */
    .api-explorer-list {{
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 24px;
    }}

    .api-row-item {{
      background: rgba(4, 18, 12, 0.85);
      border: 1px solid rgba(52, 232, 154, 0.22);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }}

    .api-row-item:hover {{
      border-color: rgba(52, 232, 154, 0.45);
    }}

    .api-row-header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      cursor: pointer;
      user-select: none;
      gap: 16px;
    }}

    .api-row-left {{
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
    }}

    /* Luminous Method Badges */
    .method-badge {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }}

    .method-badge.get {{
      color: #00f5d4;
      background: rgba(0, 245, 212, 0.12);
      border: 1px solid rgba(0, 245, 212, 0.4);
      box-shadow: 0 0 10px rgba(0, 245, 212, 0.15);
    }}

    .method-badge.post {{
      color: #34e89a;
      background: rgba(52, 232, 154, 0.14);
      border: 1px solid rgba(52, 232, 154, 0.45);
      box-shadow: 0 0 10px rgba(52, 232, 154, 0.15);
    }}

    .api-path {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #f8fafc;
    }}

    .api-summary {{
      color: #94a3b8;
      font-size: 12px;
      margin-left: 8px;
    }}

    .api-try-pill {{
      background: rgba(10, 255, 127, 0.12);
      border: 1px solid rgba(10, 255, 127, 0.35);
      color: #0aff7f;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }}

    .api-row-item:hover .api-try-pill {{
      background: #0aff7f;
      color: #02160c;
    }}

    .chevron-icon {{
      transition: transform 0.25s ease;
    }}

    .api-row-item.open .chevron-icon {{
      transform: rotate(180deg);
    }}

    /* Expandable Drawer Body */
    .api-drawer {{
      display: none;
      border-top: 1px solid rgba(52, 232, 154, 0.15);
      background: rgba(1, 12, 7, 0.7);
      padding: 20px;
    }}

    .api-row-item.open .api-drawer {{
      display: block;
    }}

    .drawer-tabs {{
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
      border-bottom: 1px solid rgba(52, 232, 154, 0.15);
      padding-bottom: 8px;
    }}

    .tab-btn {{
      background: transparent;
      border: none;
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }}

    .tab-btn.active {{
      background: rgba(10, 255, 127, 0.15);
      color: #0aff7f;
      font-weight: 700;
    }}

    .drawer-form {{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }}

    .field-label {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #aef0c0;
      margin-bottom: 4px;
    }}

    .payload-input {{
      width: 100%;
      background: #010804;
      border: 1px solid rgba(52, 232, 154, 0.25);
      border-radius: 8px;
      padding: 12px;
      color: #aef0c0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.5;
      resize: vertical;
      min-height: 90px;
    }}

    .payload-input:focus {{
      outline: none;
      border-color: #0aff7f;
      box-shadow: 0 0 12px rgba(10, 255, 127, 0.25);
    }}

    .action-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }}

    .exec-btn {{
      background: #0aff7f;
      color: #02160c;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 800;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }}

    .exec-btn:hover {{
      background: #7affbf;
      box-shadow: 0 0 20px rgba(10, 255, 127, 0.6);
      transform: scale(1.02);
    }}

    .response-container {{
      margin-top: 14px;
      background: #000000;
      border: 1px solid rgba(52, 232, 154, 0.2);
      border-radius: 10px;
      overflow: hidden;
    }}

    .response-toolbar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      background: rgba(4, 22, 14, 0.7);
      border-bottom: 1px solid rgba(52, 232, 154, 0.15);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }}

    .response-status-badge {{
      color: #7affbf;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.05em;
    }}

    .response-actions {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .pill-mini-btn {{
      background: rgba(10, 255, 127, 0.12);
      border: 1px solid rgba(10, 255, 127, 0.3);
      color: #0aff7f;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
    }}

    .pill-mini-btn:hover {{
      background: #0aff7f;
      color: #02160c;
    }}

    .response-box {{
      background: transparent;
      border: none;
      padding: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #34e89a;
      max-height: 240px;
      overflow-y: auto;
      overscroll-behavior: contain; /* Prevents nested scroll trapping */
      white-space: pre-wrap;
      transition: max-height 0.25s ease, opacity 0.2s;
    }}

    .response-box.collapsed {{
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      opacity: 0;
      overflow: hidden;
    }}

    /* Toast Notification */
    #toast {{
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #02160c;
      border: 1px solid #0aff7f;
      color: #0aff7f;
      box-shadow: 0 0 25px rgba(10, 255, 127, 0.35);
      border-radius: 10px;
      padding: 12px 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      z-index: 120;
      opacity: 0;
      transform: translateY(15px);
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
    }}

    #toast.show {{
      opacity: 1;
      transform: translateY(0);
    }}

    /* Code Block styling */
    pre.code-block {{
      background: #010c06;
      border: 1px solid rgba(52, 232, 154, 0.2);
      border-radius: 12px;
      padding: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #aef0c0;
      overflow-x: auto;
      position: relative;
      margin: 16px 0;
    }}

    .copy-pill {{
      position: absolute;
      top: 12px;
      right: 14px;
      background: rgba(10, 255, 127, 0.15);
      border: 1px solid rgba(10, 255, 127, 0.35);
      color: #0aff7f;
      font-size: 10px;
      padding: 4px 10px;
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
      margin-top: 36px;
      background: rgba(2, 22, 12, 0.85);
      border: 1px solid rgba(52, 232, 154, 0.25);
      border-radius: 18px;
      padding: 24px;
      overflow: hidden;
    }}

    .swagger-ui > :not(.dialog-ux) {{
      filter: invert(88%) hue-rotate(180deg) contrast(110%);
    }}
    .swagger-ui .topbar {{ display: none !important; }}
    .swagger-ui .info {{ margin: 10px 0 !important; }}

    /* -------------------------------------------------------------
       SWAGGER UI AUTHENTICATION MODAL (CYBER-EMERALD GLASS REDESIGN)
       ------------------------------------------------------------- */
    .swagger-ui .dialog-ux {{
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 10000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }}

    .swagger-ui .dialog-ux .backdrop-ux {{
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 10000 !important;
      background: rgba(1, 10, 6, 0.82) !important;
      backdrop-filter: blur(14px) saturate(140%) !important;
    }}

    .swagger-ui .dialog-ux .modal-ux {{
      position: fixed !important;
      top: 52% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      z-index: 10001 !important;
      max-height: calc(100vh - 110px) !important;
      width: min(560px, 92vw) !important;
      margin: 0 !important;
      display: flex !important;
      flex-direction: column !important;
      background: linear-gradient(165deg, rgba(4, 28, 16, 0.98) 0%, rgba(2, 14, 8, 0.99) 100%) !important;
      border: 1px solid rgba(52, 232, 154, 0.38) !important;
      border-radius: 16px !important;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9), 0 0 40px rgba(52, 232, 154, 0.15), inset 0 1px 0 rgba(122, 255, 191, 0.2) !important;
      overflow: hidden !important;
      color: #eafff5 !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-header {{
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 18px 24px !important;
      border-bottom: 1px solid rgba(52, 232, 154, 0.18) !important;
      background: rgba(52, 232, 154, 0.06) !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-header h3 {{
      margin: 0 !important;
      font-size: 1.1rem !important;
      font-weight: 700 !important;
      color: #eafff5 !important;
      letter-spacing: 0.02em !important;
      font-family: 'Inter', sans-serif !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-header .close-modal {{
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
      background: rgba(255, 255, 255, 0.06) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      padding: 0 !important;
      transition: all 0.2s !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-header .close-modal svg {{
      fill: #aef0c0 !important;
      stroke: #aef0c0 !important;
      width: 14px !important;
      height: 14px !important;
      transition: fill 0.2s !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-header .close-modal:hover {{
      background: rgba(255, 82, 82, 0.2) !important;
      border-color: rgba(255, 82, 82, 0.4) !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-header .close-modal:hover svg {{
      fill: #ff6b6b !important;
      stroke: #ff6b6b !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content {{
      padding: 20px 24px !important;
      overflow-y: auto !important;
      scrollbar-width: thin !important;
      scrollbar-color: rgba(52, 232, 154, 0.3) transparent !important;
      color: #cbd5e1 !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content::-webkit-scrollbar {{
      width: 6px !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content::-webkit-scrollbar-thumb {{
      background: rgba(52, 232, 154, 0.3) !important;
      border-radius: 999px !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content h4 {{
      color: #7affbf !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      margin: 12px 0 6px !important;
      font-family: 'JetBrains Mono', monospace !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content p {{
      color: #94a3b8 !important;
      font-size: 12px !important;
      margin: 4px 0 12px !important;
      line-height: 1.5 !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content code {{
      background: rgba(52, 232, 154, 0.1) !important;
      color: #7affbf !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 11px !important;
      border: 1px solid rgba(52, 232, 154, 0.22) !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content label {{
      display: block !important;
      font-size: 11px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.08em !important;
      color: #8ecfb0 !important;
      margin-bottom: 6px !important;
      font-weight: 600 !important;
      font-family: 'JetBrains Mono', monospace !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content input[type="text"],
    .swagger-ui .dialog-ux .modal-ux-content input[type="password"],
    .swagger-ui .dialog-ux .modal-ux-content select {{
      width: 100% !important;
      box-sizing: border-box !important;
      background: rgba(1, 12, 7, 0.85) !important;
      border: 1px solid rgba(52, 232, 154, 0.25) !important;
      border-radius: 8px !important;
      padding: 10px 12px !important;
      color: #eafff5 !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 13px !important;
      outline: none !important;
      transition: all 0.2s !important;
      margin-bottom: 12px !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content input[type="text"]:focus,
    .swagger-ui .dialog-ux .modal-ux-content input[type="password"]:focus,
    .swagger-ui .dialog-ux .modal-ux-content select:focus {{
      border-color: #34e89a !important;
      box-shadow: 0 0 0 3px rgba(52, 232, 154, 0.22) !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content .auth-btn-wrapper {{
      display: flex !important;
      justify-content: flex-end !important;
      gap: 12px !important;
      margin-top: 16px !important;
      padding-top: 16px !important;
      border-top: 1px solid rgba(52, 232, 154, 0.15) !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content .btn.modal-btn.auth.authorize {{
      background: linear-gradient(135deg, #34e89a 0%, #0aff7f 100%) !important;
      color: #02160c !important;
      font-weight: 700 !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 10px 24px !important;
      box-shadow: 0 4px 18px rgba(52, 232, 154, 0.35) !important;
      cursor: pointer !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 12px !important;
      transition: all 0.2s !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content .btn.modal-btn.auth.authorize:hover {{
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 24px rgba(52, 232, 154, 0.55) !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content .btn.modal-btn.auth.btn-done {{
      background: rgba(255, 255, 255, 0.05) !important;
      color: #aef0c0 !important;
      border: 1px solid rgba(52, 232, 154, 0.25) !important;
      border-radius: 8px !important;
      padding: 10px 20px !important;
      cursor: pointer !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 12px !important;
      transition: all 0.2s !important;
    }}

    .swagger-ui .dialog-ux .modal-ux-content .btn.modal-btn.auth.btn-done:hover {{
      background: rgba(52, 232, 154, 0.12) !important;
      border-color: #34e89a !important;
    }}

    /* Demo Quick-Fill Chips inside Modal */
    .demo-role-quickfill {{
      margin-bottom: 16px !important;
      padding: 12px 14px !important;
      background: rgba(52, 232, 154, 0.08) !important;
      border: 1px dashed rgba(52, 232, 154, 0.3) !important;
      border-radius: 10px !important;
    }}

    .demo-chip-btn {{
      background: rgba(10, 255, 127, 0.12) !important;
      border: 1px solid rgba(10, 255, 127, 0.35) !important;
      color: #7affbf !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      padding: 5px 12px !important;
      border-radius: 9999px !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
    }}

    .demo-chip-btn:hover {{
      background: #0aff7f !important;
      color: #02160c !important;
      box-shadow: 0 0 15px rgba(10, 255, 127, 0.5) !important;
      transform: translateY(-1px) !important;
    }}

    /* Auto-hide #scroll-hint when modal is open */
    body.swagger-modal-open #scroll-hint,
    body:has(.dialog-ux) #scroll-hint {{
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translate(-50%, 20px) !important;
    }}

    /* Command Palette Modal */
    #cmd-palette {{
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.82);
      backdrop-filter: blur(12px);
      z-index: 100;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding-top: 100px;
    }}

    #cmd-palette.open {{
      display: flex;
    }}

    .palette-box {{
      width: 640px;
      max-width: 90vw;
      background: #02160c;
      border: 1px solid #0aff7f;
      box-shadow: 0 0 50px rgba(10, 255, 127, 0.3);
      border-radius: 16px;
      overflow: hidden;
    }}

    .palette-input {{
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(52, 232, 154, 0.2);
      padding: 18px 24px;
      font-size: 15px;
      color: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
      outline: none;
    }}

    .palette-results {{
      max-height: 360px;
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
      background: rgba(10, 255, 127, 0.14);
      color: #0aff7f;
    }}

    body.focus-mode #scene {{
      opacity: 0.3;
      transition: opacity 0.5s ease;
    }}
  </style>
</head>
<body>

  <!-- WebGL Three.js Fixed Canvas -->
  <canvas id="scene"></canvas>

  <!-- Sticky Glass Navigation with Integrated HUD -->
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
      <a href="#api-explorer">API Console</a>
      <a href="#swagger-wrapper">Full Specs</a>
      <a href="http://localhost:5173" target="_blank" style="color: #0aff7f;">Clinical 5173 ↗</a>
      <a href="http://localhost:5174" target="_blank" style="color: #34e89a;">Pharma Ops 5174 ↗</a>
      <a href="http://localhost:5175" target="_blank" style="color: #7affbf;">Cyber Lab 5175 ↗</a>
    </nav>

    <div class="nav-right">
      <!-- Integrated HUD Pill -->
      <div class="docked-hud">
        <span>FPS <span class="hud-val" id="hud-fps">60</span></span>
        <span>SCROLL <span class="hud-val" id="hud-scroll">0%</span></span>
        <span>SWELL <span class="hud-val" id="hud-swell">3.00</span></span>
        <button class="focus-toggle" id="focus-btn" title="Dampen waves &amp; focus on reading">Focus Read Mode</button>
      </div>

      <button class="cmd-btn" id="open-cmd">
        <span>Search</span>
        <kbd>Ctrl+K</kbd>
      </button>
    </div>
  </header>

  <!-- 620vh Scroll Container -->
  <div id="scroll-host">
    <div class="docs-viewport">

      <!-- Section 1: Hero & Architecture with Dedicated Interactive Physics Playground -->
      <section class="doc-section" id="quickstart">
        <div class="hero-eyebrow">
          <span>●</span> Autonomous Medical Supply Protection
        </div>
        <h1 class="doc-title">PharmaShield Tripartite Central Engine</h1>
        <p class="doc-desc">
          High-performance FastAPI logistics &amp; cryptographic bus orchestrating emergency supplies across Bhagalpur healthcare networks. Powered by deterministic SHA-256 hash chaining, Ed25519 digital signatures, continuous 2–8°C thermal excursion detection, and real-time WebSockets.
        </p>

        <!-- DEDICATED INTERACTIVE HERO PHYSICS PLAYGROUND (MIN-HEIGHT 260px) -->
        <div id="hero-physics-container">
          <div class="physics-playground-header">
            <span class="playground-title">⚡ ZERO-GRAVITY INTERACTIVE PHYSICS BELT</span>
            <span class="playground-hint">Pills locked upright (inertia: ∞) • Grab, toss &amp; fling • Click to jump</span>
          </div>
          <div id="hero-physics-arena">
            <div class="physics-token" data-target="api-health" data-idx="0">⚡ GET /health</div>
            <div class="physics-token" data-target="contracts" data-idx="1">🩸 Blood Compatibility</div>
            <div class="physics-token" data-target="api-telemetry" data-idx="2">❄️ Cold-Chain 2-8°C</div>
            <div class="physics-token" data-target="cryptography" data-idx="3">🔐 Ed25519 Signatures</div>
            <div class="physics-token" data-target="cryptography" data-idx="4">⛓️ SHA-256 Hash Chain</div>
            <div class="physics-token" data-target="api-inventory" data-idx="5">📊 DOS &lt; 2d Forecast</div>
            <div class="physics-token" data-target="api-telemetry" data-idx="6">📡 IoT Telemetry</div>
          </div>
        </div>

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

        <pre class="code-block"><button class="copy-pill" onclick="copySnippet('hash-chain-math')">Copy</button><code id="hash-chain-math"># Canonical Hash Chain Formulation
H_0 = "0000000000000000000000000000000000000000000000000000000000000000"
H_i = SHA-256( H_{{i-1}} || CanonicalJSON(EventPayload_i) )
Signature_i = Ed25519_Sign( PrivateKey_Org, H_i )</code></pre>

        <div class="cards-grid">
          <div class="glass-card">
            <div class="card-title">Deterministic Canonical JSON</div>
            <div class="card-body">
              Keys are strictly sorted with zero whitespace separators (<code>json.dumps(data, sort_keys=True, separators=(',', ':'))</code>). Any whitespace difference invalidates the SHA-256 digest immediately.
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

      <!-- Section 4: Deduplicated Interactive API Explorer with Expandable Drawers -->
      <section class="doc-section" id="api-explorer">
        <div class="hero-eyebrow">
          <span>●</span> Section 04 // Interactive Live API Console
        </div>
        <h2 class="doc-title">Canonical REST Endpoints &amp; Live Drawers</h2>
        <p class="doc-desc">
          Click any endpoint row below to expand its live execution drawer, edit parameters, and test real server responses with instant WebGL wave feedback.
        </p>

        <div class="api-explorer-list">

          <!-- 1. GET /health -->
          <div class="api-row-item" id="api-health">
            <div class="api-row-header" onclick="toggleDrawer(this)">
              <div class="api-row-left">
                <span class="method-badge get">GET</span>
                <span class="api-path">/health</span>
                <span class="api-summary">Server uptime, SQLite/PostgreSQL health &amp; WebSocket bus status</span>
              </div>
              <div class="api-try-pill">
                <span>Try Live</span>
                <span class="chevron-icon">▼</span>
              </div>
            </div>
            <div class="api-drawer">
              <div class="drawer-tabs">
                <button class="tab-btn active">Live Console</button>
                <button class="tab-btn" data-snippet="curl -X GET http://localhost:8000/health" onclick="copySnippetFromAttr(this)">cURL</button>
                <button class="tab-btn" data-snippet="fetch('http://localhost:8000/health').then(r => r.json())" onclick="copySnippetFromAttr(this)">Fetch</button>
                <button class="tab-btn" data-snippet="import requests&#10;res = requests.get('http://localhost:8000/health')" onclick="copySnippetFromAttr(this)">Python</button>
              </div>
              <div class="drawer-form">
                <div class="action-row">
                  <span class="field-label">Target: http://localhost:8000/health</span>
                  <button class="exec-btn" onclick="executeLiveRequest('GET', '/health', null, 'res-health')">
                    <span>⚡ Execute Request</span>
                  </button>
                </div>
                <div class="response-container">
                  <div class="response-toolbar">
                    <span class="response-status-badge" id="badge-health">READY</span>
                    <div class="response-actions">
                      <button class="pill-mini-btn" type="button" onclick="copyResponseText('res-health')">Copy JSON</button>
                      <button class="pill-mini-btn" type="button" onclick="toggleCollapseResponse('res-health', this)">Collapse ▲</button>
                    </div>
                  </div>
                  <pre class="response-box" id="res-health">Click "Execute Request" above to test live endpoint...</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. GET /api/v1/inventory -->
          <div class="api-row-item" id="api-inventory">
            <div class="api-row-header" onclick="toggleDrawer(this)">
              <div class="api-row-left">
                <span class="method-badge get">GET</span>
                <span class="api-path">/api/v1/inventory</span>
                <span class="api-summary">Query 6-category medical supplies, batch numbers, &amp; DOS stock alerts</span>
              </div>
              <div class="api-try-pill">
                <span>Try Live</span>
                <span class="chevron-icon">▼</span>
              </div>
            </div>
            <div class="api-drawer">
              <div class="drawer-tabs">
                <button class="tab-btn active">Live Console</button>
                <button class="tab-btn" data-snippet="curl -X GET 'http://localhost:8000/api/v1/inventory?stock_alert=true'" onclick="copySnippetFromAttr(this)">cURL</button>
              </div>
              <div class="drawer-form">
                <label class="field-label">Query Parameters (URL suffix):</label>
                <input type="text" class="payload-input" style="min-height: auto; height: 38px;" id="query-inventory" value="?stock_alert=true">
                <div class="action-row">
                  <span class="field-label">Target: /api/v1/inventory</span>
                  <button class="exec-btn" onclick="executeLiveRequest('GET', '/api/v1/inventory' + document.getElementById('query-inventory').value, null, 'res-inventory')">
                    <span>⚡ Execute Request</span>
                  </button>
                </div>
                <div class="response-container">
                  <div class="response-toolbar">
                    <span class="response-status-badge" id="badge-inventory">READY</span>
                    <div class="response-actions">
                      <button class="pill-mini-btn" type="button" onclick="copyResponseText('res-inventory')">Copy JSON</button>
                      <button class="pill-mini-btn" type="button" onclick="toggleCollapseResponse('res-inventory', this)">Collapse ▲</button>
                    </div>
                  </div>
                  <pre class="response-box" id="res-inventory">Click "Execute Request" above to query inventory...</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. POST /api/v1/requests -->
          <div class="api-row-item" id="api-requests">
            <div class="api-row-header" onclick="toggleDrawer(this)">
              <div class="api-row-left">
                <span class="method-badge post">POST</span>
                <span class="api-path">/api/v1/requests</span>
                <span class="api-summary">Create an emergency requisition with AI matching trigger</span>
              </div>
              <div class="api-try-pill">
                <span>Try Live</span>
                <span class="chevron-icon">▼</span>
              </div>
            </div>
            <div class="api-drawer">
              <div class="drawer-tabs">
                <button class="tab-btn active">Live Console</button>
                <button class="tab-btn" data-snippet="curl -X POST http://localhost:8000/api/v1/requests -H 'Content-Type: application/json' -d '{{&quot;requesting_facility_id&quot;:&quot;FAC-JLNMCH-01&quot;,&quot;category&quot;:&quot;BLOOD_COMPONENTS&quot;,&quot;resource_code&quot;:&quot;O_POS_RBC&quot;,&quot;quantity&quot;:5,&quot;urgency&quot;:&quot;CRITICAL&quot;}}'" onclick="copySnippetFromAttr(this)">cURL</button>
              </div>
              <div class="drawer-form">
                <label class="field-label">JSON Request Body:</label>
                <textarea class="payload-input" id="body-request">{{"requesting_facility_id": "FAC-JLNMCH-01", "category": "BLOOD_COMPONENTS", "resource_code": "O_POS_RBC", "quantity": 5, "urgency": "CRITICAL", "clinical_note_redacted": "Massive trauma transfusion protocol active"}}</textarea>
                <div class="action-row">
                  <span class="field-label">Target: /api/v1/requests</span>
                  <button class="exec-btn" onclick="executeLiveRequest('POST', '/api/v1/requests', document.getElementById('body-request').value, 'res-request')">
                    <span>⚡ Submit Emergency Request</span>
                  </button>
                </div>
                <div class="response-container">
                  <div class="response-toolbar">
                    <span class="response-status-badge" id="badge-request">READY</span>
                    <div class="response-actions">
                      <button class="pill-mini-btn" type="button" onclick="copyResponseText('res-request')">Copy JSON</button>
                      <button class="pill-mini-btn" type="button" onclick="toggleCollapseResponse('res-request', this)">Collapse ▲</button>
                    </div>
                  </div>
                  <pre class="response-box" id="res-request">Click button above to submit payload...</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. POST /api/v1/shipments/{id}/telemetry -->
          <div class="api-row-item" id="api-telemetry">
            <div class="api-row-header" onclick="toggleDrawer(this)">
              <div class="api-row-left">
                <span class="method-badge post">POST</span>
                <span class="api-path">/api/v1/shipments/SHP-001/telemetry</span>
                <span class="api-summary">Ingest cold-chain sensor reading (triggers UNDER_REVIEW if &lt;2°C or &gt;8°C)</span>
              </div>
              <div class="api-try-pill">
                <span>Try Live</span>
                <span class="chevron-icon">▼</span>
              </div>
            </div>
            <div class="api-drawer">
              <div class="drawer-tabs">
                <button class="tab-btn active">Live Console</button>
                <button class="tab-btn" data-snippet="curl -X POST http://localhost:8000/api/v1/shipments/SHP-001/telemetry -H 'Content-Type: application/json' -d '{{&quot;temperature_c&quot;: 12.8, &quot;latitude&quot;: 25.2445, &quot;longitude&quot;: 87.0125, &quot;battery_pct&quot;: 95}}'" onclick="copySnippetFromAttr(this)">cURL</button>
              </div>
              <div class="drawer-form">
                <label class="field-label">JSON Telemetry Payload (Try 12.8°C for excursion, or 4.5°C for normal):</label>
                <textarea class="payload-input" id="body-telemetry">{{"temperature_c": 12.8, "latitude": 25.2445, "longitude": 87.0125, "battery_pct": 94}}</textarea>
                <div class="action-row">
                  <span class="field-label">Target: /api/v1/shipments/SHP-001/telemetry</span>
                  <button class="exec-btn" onclick="executeLiveRequest('POST', '/api/v1/shipments/SHP-001/telemetry', document.getElementById('body-telemetry').value, 'res-telemetry')">
                    <span>⚡ Send IoT Telemetry</span>
                  </button>
                </div>
                <div class="response-container">
                  <div class="response-toolbar">
                    <span class="response-status-badge" id="badge-telemetry">READY</span>
                    <div class="response-actions">
                      <button class="pill-mini-btn" type="button" onclick="copyResponseText('res-telemetry')">Copy JSON</button>
                      <button class="pill-mini-btn" type="button" onclick="toggleCollapseResponse('res-telemetry', this)">Collapse ▲</button>
                    </div>
                  </div>
                  <pre class="response-box" id="res-telemetry">Click button above to ingest sensor reading...</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. GET /api/v1/security/ledger -->
          <div class="api-row-item" id="api-ledger">
            <div class="api-row-header" onclick="toggleDrawer(this)">
              <div class="api-row-left">
                <span class="method-badge get">GET</span>
                <span class="api-path">/api/v1/security/ledger</span>
                <span class="api-summary">Query immutable SHA-256 hash-chained records with Ed25519 signatures</span>
              </div>
              <div class="api-try-pill">
                <span>Try Live</span>
                <span class="chevron-icon">▼</span>
              </div>
            </div>
            <div class="api-drawer">
              <div class="drawer-tabs">
                <button class="tab-btn active">Live Console</button>
              </div>
              <div class="drawer-form">
                <div class="action-row">
                  <span class="field-label">Target: /api/v1/security/ledger?limit=10</span>
                  <button class="exec-btn" onclick="executeLiveRequest('GET', '/api/v1/security/ledger?limit=10', null, 'res-ledger')">
                    <span>⚡ Inspect Ledger</span>
                  </button>
                </div>
                <div class="response-container">
                  <div class="response-toolbar">
                    <span class="response-status-badge" id="badge-ledger">READY</span>
                    <div class="response-actions">
                      <button class="pill-mini-btn" type="button" onclick="copyResponseText('res-ledger')">Copy JSON</button>
                      <button class="pill-mini-btn" type="button" onclick="toggleCollapseResponse('res-ledger', this)">Collapse ▲</button>
                    </div>
                  </div>
                  <pre class="response-box" id="res-ledger">Click "Inspect Ledger" above to query audit chain...</pre>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Embedded OpenAPI Swagger UI -->
        <div id="swagger-wrapper">
          <div class="card-title" style="margin-bottom: 16px;">
            <span>📘</span> Complete OpenAPI 3.0 Interactive Specification (All 39 Routes)
          </div>
          <div id="swagger-ui"></div>
        </div>
      </section>

    </div>
  </div>

  <!-- Smart Floating Scroll / Top Button -->
  <button id="scroll-hint" class="pulse-hint" type="button" aria-label="Navigate through sections">
    <span id="scroll-hint-text">SCROLL</span>
    <span id="scroll-hint-icon">↓</span>
  </button>

  <!-- Toast Notification -->
  <div id="toast">Copied to clipboard</div>

  <!-- Command Palette Modal -->
  <div id="cmd-palette">
    <div class="palette-box">
      <input type="text" class="palette-input" id="palette-search" placeholder="Type to search endpoints, models, or docs... (Esc to close)">
      <div class="palette-results" id="palette-list">
        <div class="palette-item" onclick="jumpSection('quickstart')"><span>🚀 Quickstart &amp; Architecture</span><span>Section 01</span></div>
        <div class="palette-item" onclick="jumpSection('contracts')"><span>🩸 Medical Contracts &amp; Safety</span><span>Section 02</span></div>
        <div class="palette-item" onclick="jumpSection('cryptography')"><span>🔐 Ed25519 Cryptographic Ledger</span><span>Section 03</span></div>
        <div class="palette-item" onclick="jumpSection('api-explorer')"><span>⚡ Canonical REST API Explorer</span><span>Section 04</span></div>
        <div class="palette-item" onclick="openDrawerById('api-health')"><span>⚡ GET /health</span><span>Endpoint</span></div>
        <div class="palette-item" onclick="openDrawerById('api-inventory')"><span>📦 GET /api/v1/inventory</span><span>Endpoint</span></div>
        <div class="palette-item" onclick="openDrawerById('api-requests')"><span>🚨 POST /api/v1/requests</span><span>Endpoint</span></div>
        <div class="palette-item" onclick="openDrawerById('api-telemetry')"><span>📡 POST /api/v1/shipments/telemetry</span><span>Endpoint</span></div>
        <div class="palette-item" onclick="openDrawerById('api-ledger')"><span>🛡️ GET /api/v1/security/ledger</span><span>Endpoint</span></div>
        <div class="palette-item" onclick="window.open('http://localhost:5173')"><span>🩺 Portal 1: Doctor Clinical</span><span>:5173 ↗</span></div>
        <div class="palette-item" onclick="window.open('http://localhost:5174')"><span>📦 Portal 2: Pharma Ops</span><span>:5174 ↗</span></div>
        <div class="palette-item" onclick="window.open('http://localhost:5175')"><span>🛡️ Portal 3: Cyber Lab</span><span>:5175 ↗</span></div>
      </div>
    </div>
  </div>

  <!-- Three.js Flow Wave (EXACT UNTOUCHED SPECIFICATION) -->
  <script type="module">
    import * as THREE from 'three';
    import {{ EffectComposer }} from 'three/addons/postprocessing/EffectComposer.js';
    import {{ RenderPass }} from 'three/addons/postprocessing/RenderPass.js';
    import {{ UnrealBloomPass }} from 'three/addons/postprocessing/UnrealBloomPass.js';
    import {{ ShaderPass }} from 'three/addons/postprocessing/ShaderPass.js';
    import {{ GammaCorrectionShader }} from 'three/addons/shaders/GammaCorrectionShader.js';
    import {{ CopyShader }} from 'three/addons/shaders/CopyShader.js';

    // -------------------------------------------------------------
    // 1. EXACT FIXED CONSTANTS & HELPERS (DO NOT ALTER)
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
    let   flow            = 1;           // noise scroll speed
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

      // Cursor spotlight tracking on doc cards
      document.querySelectorAll('.doc-section, .glass-card').forEach(card => {{
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${{e.clientX - rect.left}}px`);
        card.style.setProperty('--mouse-y', `${{e.clientY - rect.top}}px`);
      }});
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

    // WebGL Wave Pulse Trigger on API execution
    window.triggerWavePulse = function() {{
      waveUniforms.uActivity.value = 1.0;
      waveUniforms.uWaveHeight.value = waveHeight * 1.5;
      setTimeout(() => {{
        waveUniforms.uWaveHeight.value = waveHeight * (1 + scrollCurrent * scrollRise);
      }}, 600);
    }};

    // -------------------------------------------------------------
    // 8. MATTER.JS BOUNDED ARENA (UPRIGHT PILLS, INERTIA INFINITY)
    // -------------------------------------------------------------
    const {{ Engine, Bodies, Composite, Constraint, Body }} = Matter;
    const physicsEngine = Engine.create({{
      gravity: {{ x: 0, y: 0, scale: 0.001 }}
    }});

    const arenaEl = document.getElementById('hero-physics-arena');
    const tokenEls = Array.from(document.querySelectorAll('#hero-physics-arena .physics-token'));
    const tokenBodies = [];

    function setupPhysicsArena() {{
      const arenaRect = arenaEl.getBoundingClientRect();
      const w = arenaRect.width || 800;
      const h = arenaRect.height || 160;

      // Clear previous bodies if any
      Composite.clear(physicsEngine.world, false);
      tokenBodies.length = 0;

      // Static boundary colliders (Enclosing Arena Walls)
      const wallThickness = 40;
      const topWall = Bodies.rectangle(w / 2, -wallThickness / 2, w + 200, wallThickness, {{ isStatic: true }});
      const bottomFloor = Bodies.rectangle(w / 2, h + wallThickness / 2, w + 200, wallThickness, {{ isStatic: true }});
      const leftWall = Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h + 200, {{ isStatic: true }});
      const rightWall = Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h + 200, {{ isStatic: true }});

      Composite.add(physicsEngine.world, [topWall, bottomFloor, leftWall, rightWall]);

      // Spacing pills inside arena
      const count = tokenEls.length;
      const spacingX = w / (count + 1);

      tokenEls.forEach((el, i) => {{
        const startX = spacingX * (i + 1);
        const startY = h / 2 + (i % 2 === 0 ? -24 : 24);

        // LOCK PILL ORIENTATION (inertia: Infinity, inverseInertia: 0)
        const body = Bodies.rectangle(startX, startY, 150, 36, {{
          inertia: Infinity,
          inverseInertia: 0,
          frictionAir: 0.035,
          restitution: 0.75
        }});

        // Soft anchor constraint tethered to home base in arena
        const anchor = Constraint.create({{
          pointA: {{ x: startX, y: startY }},
          bodyB: body,
          stiffness: 0.015,
          damping: 0.1
        }});

        Composite.add(physicsEngine.world, [body, anchor]);
        tokenBodies.push({{ el, body, anchor, homeX: startX, homeY: startY }});

        // Click and Drag handling
        let isMouseDown = false;
        let startClientX = 0;
        let startClientY = 0;

        el.addEventListener('mousedown', (e) => {{
          isMouseDown = true;
          startClientX = e.clientX;
          startClientY = e.clientY;
          el.style.cursor = 'grabbing';
        }});

        window.addEventListener('mouseup', (e) => {{
          if (isMouseDown) {{
            isMouseDown = false;
            el.style.cursor = 'grab';
            const distMoved = Math.hypot(e.clientX - startClientX, e.clientY - startClientY);
            if (distMoved < 6) {{
              // Click Action: trigger ripple pulse & scroll/inspect target
              el.classList.add('ripple-pulse');
              setTimeout(() => el.classList.remove('ripple-pulse'), 600);

              const targetId = el.getAttribute('data-target');
              if (targetId) {{
                if (targetId.startsWith('api-')) {{
                  openDrawerById(targetId);
                }} else {{
                  jumpSection(targetId);
                }}
              }}
            }}
          }}
        }});

        window.addEventListener('mousemove', (e) => {{
          if (isMouseDown) {{
            const arenaBox = arenaEl.getBoundingClientRect();
            const relX = clamp(e.clientX - arenaBox.left, 40, arenaBox.width - 40);
            const relY = clamp(e.clientY - arenaBox.top, 20, arenaBox.height - 20);
            Body.setPosition(body, {{ x: relX, y: relY }});
          }}
        }});
      }});
    }}

    setupPhysicsArena();
    window.addEventListener('resize', setupPhysicsArena);

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

      // Continuous Scroll Sync across manual & programmatic smooth scrolls
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;

      // Update Scroll Hint Button (SCROLL ↓ vs TOP ↑)
      const scrollBtnEl = document.getElementById('scroll-hint');
      const scrollBtnTextEl = document.getElementById('scroll-hint-text');
      const scrollBtnIconEl = document.getElementById('scroll-hint-icon');
      if (scrollBtnEl && scrollBtnTextEl && scrollBtnIconEl) {{
        if (scrollTarget >= 0.85) {{
          if (!scrollBtnEl.classList.contains('is-top')) {{
            scrollBtnEl.classList.add('is-top');
            scrollBtnEl.classList.remove('pulse-hint');
            scrollBtnTextEl.textContent = 'TOP';
            scrollBtnIconEl.textContent = '↑';
            scrollBtnEl.setAttribute('title', 'Scroll back to top');
          }}
        }} else {{
          if (scrollBtnEl.classList.contains('is-top')) {{
            scrollBtnEl.classList.remove('is-top');
            scrollBtnEl.classList.add('pulse-hint');
            scrollBtnTextEl.textContent = 'SCROLL';
            scrollBtnIconEl.textContent = '↓';
            scrollBtnEl.setAttribute('title', 'Scroll to next section');
          }}
        }}
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

      // Update Matter.js Arena Pills (If not in docked focus mode)
      if (!appState.focusMode) {{
        Engine.update(physicsEngine, dt * 1000);

        const arenaRect = arenaEl.getBoundingClientRect();
        const cursorArenaX = (mouse.x * 0.5 + 0.5) * window.innerWidth - arenaRect.left;
        const cursorArenaY = (-mouse.y * 0.5 + 0.5) * window.innerHeight - arenaRect.top;

        tokenBodies.forEach(({{ el, body }}) => {{
          // Enforce 100% Upright Orientation
          body.angle = clamp(body.angle, -0.08, 0.08) * 0.85;
          body.angularVelocity = 0;

          // Soft cursor repulsion inside arena
          const dx = body.position.x - cursorArenaX;
          const dy = body.position.y - cursorArenaY;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 1) {{
            const force = (1.0 - dist / 120) * 0.001;
            Body.applyForce(body, body.position, {{ x: (dx / dist) * force, y: (dy / dist) * force }});
          }}

          el.style.transform = `translate3d(${{body.position.x - 75}}px, ${{body.position.y - 18}}px, 0px) rotate(${{body.angle}}rad)`;
        }});
      }}

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
      arenaEl.classList.toggle('docked', appState.focusMode);

      if (appState.focusMode) {{
        flow = 0.2;
        waveUniforms.uBrightness.value = 0.22;
        waveUniforms.uOpacity.value = 0.15;
      }} else {{
        flow = 1.0;
        waveUniforms.uBrightness.value = brightness;
        waveUniforms.uOpacity.value = opacity;
        setupPhysicsArena();
      }}
    }});
  </script>

  <!-- Interactive Drawers, Live API Requests, Command Palette & Swagger Loader -->
  <script>
    // Expandable Drawer Toggle
    function toggleDrawer(headerEl) {{
      const rowItem = headerEl.closest('.api-row-item');
      rowItem.classList.toggle('open');
    }}

    function openDrawerById(id) {{
      const target = document.getElementById(id);
      if (target) {{
        target.classList.add('open');
        target.scrollIntoView({{ behavior: 'smooth', block: 'center' }});
      }}
    }}

    // Real-Time API Execution
    async function executeLiveRequest(method, endpoint, bodyJson, outId) {{
      const out = document.getElementById(outId);
      const badgeKey = outId.replace('res-', '');
      const badge = document.getElementById('badge-' + badgeKey);

      out.textContent = `Connecting to ${{endpoint}}...`;
      if (badge) {{
        badge.textContent = 'RUNNING...';
        badge.style.color = '#38bdf8';
      }}

      // Ensure response box is expanded
      out.classList.remove('collapsed');

      // Trigger WebGL wave swell feedback
      if (window.triggerWavePulse) window.triggerWavePulse();

      const startTime = performance.now();
      try {{
        const options = {{
          method: method,
          headers: {{ 'Content-Type': 'application/json' }}
        }};
        if (bodyJson && method !== 'GET') {{
          options.body = typeof bodyJson === 'string' ? bodyJson : JSON.stringify(bodyJson);
        }}

        const res = await fetch(endpoint, options);
        const data = await res.json();
        const latency = (performance.now() - startTime).toFixed(1);

        const statusTag = res.ok ? `[HTTP ${{res.status}} OK — ${{latency}}ms]` : `[HTTP ${{res.status}} ERROR — ${{latency}}ms]`;
        out.textContent = `${{statusTag}}\n\n` + JSON.stringify(data, null, 2);

        if (badge) {{
          badge.textContent = res.ok ? `${{res.status}} OK (${{latency}}ms)` : `${{res.status}} ERROR (${{latency}}ms)`;
          badge.style.color = res.ok ? '#0aff7f' : '#f43f5e';
        }}

        showToast(`Request complete (${{latency}}ms)`);
      }} catch (err) {{
        out.textContent = `[NETWORK / SERVER ERROR]: ${{err.message}}`;
        if (badge) {{
          badge.textContent = 'FAILED';
          badge.style.color = '#f43f5e';
        }}
        showToast('Request failed: ' + err.message);
      }}
    }}

    // Response Box Collapse & Copy Handlers
    function copyResponseText(id) {{
      const el = document.getElementById(id);
      if (el) {{
        navigator.clipboard.writeText(el.innerText);
        showToast("JSON response copied to clipboard");
      }}
    }}

    function toggleCollapseResponse(id, btn) {{
      const el = document.getElementById(id);
      if (el) {{
        const isCollapsed = el.classList.toggle('collapsed');
        btn.textContent = isCollapsed ? 'Expand ▼' : 'Collapse ▲';
      }}
    }}

    // Smart Section-by-Section Smooth Scrolling
    const scrollBtn = document.getElementById('scroll-hint');
    const SECTIONS = ['quickstart', 'contracts', 'cryptography', 'api-explorer', 'swagger-wrapper'];

    function handleScrollButtonClick(e) {{
      if (e) e.preventDefault();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentRatio = maxScroll > 0 ? (window.scrollY / maxScroll) : 0;

      // If near bottom (>= 85%), scroll smoothly back to top
      if (currentRatio >= 0.85) {{
        window.scrollTo({{ top: 0, behavior: 'smooth' }});
        return;
      }}

      // Find next section whose top is > 90px below current viewport top
      let target = null;
      for (const id of SECTIONS) {{
        const el = document.getElementById(id);
        if (el) {{
          const rect = el.getBoundingClientRect();
          if (rect.top > 90) {{
            target = el;
            break;
          }}
        }}
      }}

      if (target) {{
        const yOffset = -76; // header compensation
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({{ top: Math.max(0, y), behavior: 'smooth' }});
      }} else {{
        window.scrollBy({{ top: window.innerHeight * 0.75, behavior: 'smooth' }});
      }}
    }}

    if (scrollBtn) {{
      scrollBtn.addEventListener('click', handleScrollButtonClick);
    }}

    // Toast and Copy Helpers
    function showToast(msg) {{
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2400);
    }}

    function copySnippet(id) {{
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text);
      showToast("Snippet copied to clipboard");
    }}

    function copySnippetFromAttr(btn) {{
      const txt = btn.getAttribute('data-snippet');
      if (txt) {{
        navigator.clipboard.writeText(txt);
        showToast("Code copied to clipboard");
      }}
    }}

    function copySnippetText(txt) {{
      navigator.clipboard.writeText(txt);
      showToast("Code copied to clipboard");
    }}

    // Command Palette Logic
    const palette = document.getElementById('cmd-palette');
    const paletteSearch = document.getElementById('palette-search');
    const openBtn = document.getElementById('open-cmd');
    const paletteList = document.getElementById('palette-list');

    function togglePalette() {{
      palette.classList.toggle('open');
      if (palette.classList.contains('open')) {{
        paletteSearch.focus();
        paletteSearch.value = '';
        filterPalette('');
      }}
    }}

    function filterPalette(query) {{
      const items = Array.from(paletteList.querySelectorAll('.palette-item'));
      const q = query.toLowerCase();
      items.forEach(it => {{
        const text = it.textContent.toLowerCase();
        it.style.display = text.includes(q) ? 'flex' : 'none';
      }});
    }}

    paletteSearch.addEventListener('input', (e) => {{
      filterPalette(e.target.value);
    }});

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
      if (palette.classList.contains('open')) togglePalette();
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

      // MutationObserver for Swagger Auth Modal Styling & Quick-Fill Chips
      const authObserver = new MutationObserver(() => {{
        const dialog = document.querySelector('.swagger-ui .dialog-ux');
        const content = document.querySelector('.swagger-ui .dialog-ux .modal-ux-content');

        if (dialog) {{
          document.body.classList.add('swagger-modal-open');
        }} else {{
          document.body.classList.remove('swagger-modal-open');
        }}

        if (content && !content.querySelector('.demo-role-quickfill')) {{
          const quickfill = document.createElement('div');
          quickfill.className = 'demo-role-quickfill';
          quickfill.innerHTML = `
            <div style="font-size: 11px; font-weight: 700; color: #7affbf; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <span>⚡</span> QUICK-FILL DEMO CREDENTIALS:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button type="button" class="demo-chip-btn" data-user="admin@pharmashield.gov.in" data-pass="admin123">⚡ Admin / Dispatcher</button>
              <button type="button" class="demo-chip-btn" data-user="jlnmch@bhagalpur.gov.in" data-pass="hospital123">🏥 Hospital Node</button>
              <button type="button" class="demo-chip-btn" data-user="operator@mayaganj.gov.in" data-pass="operator123">🚚 Cold-Chain Operator</button>
            </div>
          `;
          content.insertBefore(quickfill, content.firstChild);

          quickfill.querySelectorAll('.demo-chip-btn').forEach(btn => {{
            btn.addEventListener('click', (e) => {{
              e.preventDefault();
              const userInp = content.querySelector('input[name="username"]') || content.querySelector('input[type="text"]');
              const passInp = content.querySelector('input[name="password"]') || content.querySelector('input[type="password"]');

              if (userInp) {{
                userInp.value = btn.getAttribute('data-user');
                userInp.dispatchEvent(new Event('input', {{ bubbles: true }}));
                userInp.dispatchEvent(new Event('change', {{ bubbles: true }}));
                userInp.style.borderColor = '#0aff7f';
                userInp.style.boxShadow = '0 0 15px rgba(10, 255, 127, 0.4)';
                setTimeout(() => {{
                  userInp.style.borderColor = '';
                  userInp.style.boxShadow = '';
                }}, 800);
              }}

              if (passInp) {{
                passInp.value = btn.getAttribute('data-pass');
                passInp.dispatchEvent(new Event('input', {{ bubbles: true }}));
                passInp.dispatchEvent(new Event('change', {{ bubbles: true }}));
                passInp.style.borderColor = '#0aff7f';
                passInp.style.boxShadow = '0 0 15px rgba(10, 255, 127, 0.4)';
                setTimeout(() => {{
                  passInp.style.borderColor = '';
                  passInp.style.boxShadow = '';
                }}, 800);
              }}

              showToast("Populated demo credentials for " + btn.textContent.trim());
            }});
          }});
        }}
      }});

      authObserver.observe(document.body, {{ childList: true, subtree: true }});
    }});
  </script>

</body>
</html>"""
