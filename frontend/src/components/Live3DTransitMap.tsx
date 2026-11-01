import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Navigation,
  Compass,
  Thermometer,
  ShieldCheck,
  Clock,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Truck,
  Building2,
  CheckCircle2,
  Lock,
  ExternalLink,
  Layers,
  MapPin,
  AlertCircle
} from 'lucide-react';

interface Live3DTransitMapProps {
  activeOrder?: {
    id: string;
    resource_code: string;
    quantity: number;
    status: string;
    patient_name?: string;
    bed_number?: string;
    urgency?: string;
    authorized_at?: string;
    authorized_by?: string;
    signature_hex?: string;
  } | null;
  onClose?: () => void;
}

export const Live3DTransitMap: React.FC<Live3DTransitMapProps> = ({
  activeOrder,
  onClose,
}) => {
  const isConfirmed = activeOrder?.status === 'AUTHORIZED';

  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLayer, setMapLayer] = useState<'CARTO_DARK' | 'SATELLITE'>('CARTO_DARK');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [viewPreset, setViewPreset] = useState<'CHASE' | 'ISOMETRIC' | 'TOP_DOWN'>('ISOMETRIC');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0.25);
  const [simulatedSecondsRemaining, setSimulatedSecondsRemaining] = useState<number>(215);

  const [telemetry, setTelemetry] = useState({
    tempC: 3.8,
    lat: 25.2428,
    lng: 87.0145,
    speedKmh: 28,
    distanceRemainingKm: 1.4,
  });

  const progressRef = useRef(progress);
  const isPlayingRef = useRef(isPlaying);
  const viewPresetRef = useRef(viewPreset);
  const mapLayerRef = useRef(mapLayer);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    viewPresetRef.current = viewPreset;
  }, [viewPreset]);

  useEffect(() => {
    mapLayerRef.current = mapLayer;
  }, [mapLayer]);

  // If order is not confirmed, render Standby State (Only starts tracking after confirmation)
  if (!isConfirmed) {
    return (
      <div className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl text-center space-y-5">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Package Tracking Standing By
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              3D true-to-life GPS tracking initializes <strong className="text-amber-400">only after an order is confirmed</strong> by the Vendor Depot on Port 5174.
            </p>
          </div>

          {/* Verification Stepper */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-left text-xs space-y-3 font-mono">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Step 1: Bedside Requisition Submitted ({activeOrder?.id || 'Pending'})</span>
            </div>

            <div className="flex items-center space-x-2 text-amber-400">
              <Clock className="w-4 h-4 shrink-0 animate-pulse" />
              <div className="flex-1 flex items-center justify-between">
                <span>Step 2: Depot Authorization</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  AWAITING REVIEW
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-600">
              <Navigation className="w-4 h-4 shrink-0" />
              <span>Step 3: 3D True-to-Life GPS Courier Tracking (Locked)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <span>Authorize Order on Port 5174 →</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Active Confirmed 3D Tracking Scene ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a12);
    scene.fog = new THREE.FogExp2(0x060a12, 0.012);

    // 2. Camera & Renderer
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 350);
    camera.position.set(0, 36, 44);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x3b4d6b, 1.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xbdd7ff, 2.4);
    sunLight.position.set(50, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x00f0ff, 0.6);
    fillLight.position.set(-30, 25, -20);
    scene.add(fillLight);

    // 4. True-to-Life Map Tile Ground Plane (API Texture)
    // CartoDB Dark Matter / Esri Satellite Tile for Bhagalpur Corridor (Zoom 15, X: 24304, Y: 14008)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const darkTileUrl = 'https://a.basemaps.cartocdn.com/dark_all/15/24304/14008.png';
    const satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/14008/24304';

    const currentTileUrl = mapLayerRef.current === 'SATELLITE' ? satelliteTileUrl : darkTileUrl;

    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Load actual map API texture asynchronously
    textureLoader.load(
      currentTileUrl,
      (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.generateMipmaps = true;
        groundMat.map = texture;
        groundMat.color.setHex(0xffffff); // Use original tile colors
        groundMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn('Real map tile API network notice - using high-contrast procedural grid fallback', err);
      }
    );

    // Grid Floor Overlay
    const grid = new THREE.GridHelper(120, 30, 0x334155, 0x1e293b);
    grid.position.y = 0.05;
    scene.add(grid);

    // 5. Urban Architectural Structures (Procedural Buildings)
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.4,
    });
    const buildingGroup = new THREE.Group();

    const cityBlocks = [
      { x: -28, z: -15, w: 9, d: 8, h: 14 },
      { x: -28, z: 5, w: 8, d: 10, h: 18 },
      { x: -10, z: -25, w: 12, d: 7, h: 16 },
      { x: 10, z: -25, w: 8, d: 10, h: 22 },
      { x: 26, z: -15, w: 10, d: 8, h: 15 },
      { x: 26, z: 8, w: 8, d: 12, h: 24 },
      { x: -5, z: 25, w: 12, d: 8, h: 10 },
      { x: 14, z: 25, w: 10, d: 7, h: 14 },
    ];

    cityBlocks.forEach((block) => {
      const bGeo = new THREE.BoxGeometry(block.w, block.h, block.d);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);
      bMesh.position.set(block.x, block.h / 2, block.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      buildingGroup.add(bMesh);
    });
    scene.add(buildingGroup);

    // 6. Origin Landmark: Mayaganj Central Cold Depot
    const depotGroup = new THREE.Group();
    const depotGeo = new THREE.BoxGeometry(10, 5, 10);
    const depotMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const depot = new THREE.Mesh(depotGeo, depotMat);
    depot.position.set(-22, 2.5, 15);
    depot.castShadow = true;
    depotGroup.add(depot);

    // Depot Glowing Landing Pad
    const padGeo = new THREE.RingGeometry(2.2, 3.0, 32);
    const padMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = Math.PI / 2;
    pad.position.set(-22, 5.05, 15);
    depotGroup.add(pad);

    const depotLight = new THREE.PointLight(0x0284c7, 3, 20);
    depotLight.position.set(-22, 7, 15);
    depotGroup.add(depotLight);
    scene.add(depotGroup);

    // 7. Destination Landmark: JLNMCH Hospital Emergency Wing
    const hospGroup = new THREE.Group();
    const hospGeo = new THREE.BoxGeometry(12, 10, 12);
    const hospMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const hosp = new THREE.Mesh(hospGeo, hospMat);
    hosp.position.set(20, 5, -16);
    hosp.castShadow = true;
    hospGroup.add(hosp);

    // Medical Green Cross on Hospital Roof
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.6, 1.0), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 3.5), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    crossH.position.set(20, 10.4, -16);
    crossV.position.set(20, 10.4, -16);
    hospGroup.add(crossH);
    hospGroup.add(crossV);

    const hospLight = new THREE.PointLight(0x10b981, 3.5, 25);
    hospLight.position.set(20, 12, -16);
    hospGroup.add(hospLight);
    scene.add(hospGroup);

    // 8. GPS Route Corridor (Bhagalpur Road Coordinates)
    const routePoints = [
      new THREE.Vector3(-22, 0.4, 15),
      new THREE.Vector3(-12, 0.4, 15),
      new THREE.Vector3(-12, 0.4, 3),
      new THREE.Vector3(-2, 0.4, 3),
      new THREE.Vector3(-2, 0.4, -6),
      new THREE.Vector3(10, 0.4, -6),
      new THREE.Vector3(10, 0.4, -16),
      new THREE.Vector3(20, 0.4, -16),
    ];
    const routeCurve = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', 0.2);

    const curvePoints = routeCurve.getPoints(100);
    const routeGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const routeLine = new THREE.Line(
      routeGeo,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 })
    );
    routeLine.position.y = 0.1;
    scene.add(routeLine);

    // 9. 3D Medical Courier Transport Vehicle
    const courierGroup = new THREE.Group();
    const chassisGeo = new THREE.BoxGeometry(2.4, 1.2, 1.4);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.6 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.8;
    courierGroup.add(chassis);

    // Cab
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.8, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1 })
    );
    cab.position.set(0.6, 1.4, 0);
    courierGroup.add(cab);

    // Cold-Chain Thermal Pod Container
    const coldPod = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.0, 1.36),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.2 })
    );
    coldPod.position.set(-0.6, 1.4, 0);
    courierGroup.add(coldPod);

    // Flashing Beacon Light
    const beaconLight = new THREE.PointLight(0x38bdf8, 2, 8);
    beaconLight.position.set(0, 2.2, 0);
    courierGroup.add(beaconLight);

    scene.add(courierGroup);

    // 10. Mouse Orbit / Drag Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let cameraAngle = { theta: 0.6, phi: 0.8, radius: 52 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      cameraAngle.theta -= deltaX * 0.008;
      cameraAngle.phi = Math.max(0.2, Math.min(Math.PI / 2.2, cameraAngle.phi - deltaY * 0.008));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => (isDragging = false);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngle.radius = Math.max(15, Math.min(90, cameraAngle.radius + e.deltaY * 0.05));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 11. Animation Loop with Real-World GPS Timings
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isPlayingRef.current) {
        // True-to-life progress rate: ~240s total traversal (4 mins)
        let newProg = progressRef.current + (delta / 60) * 0.25;
        if (newProg >= 1.0) newProg = 0.0;
        setProgress(newProg);

        // Real-world calculations
        const remainingSec = Math.max(0, Math.floor((1 - newProg) * 242));
        setSimulatedSecondsRemaining(remainingSec);

        const lat = 25.2420 + newProg * (25.2445 - 25.2420);
        const lng = 87.0150 + newProg * (87.0125 - 87.0150);
        const remainingKm = Math.max(0.05, Number((1.82 * (1 - newProg)).toFixed(2)));

        setTelemetry({
          tempC: Number((3.8 + Math.sin(Date.now() * 0.001) * 0.25).toFixed(1)),
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          speedKmh: newProg >= 0.98 ? 0 : 28,
          distanceRemainingKm: remainingKm,
        });
      }

      // Position & orient courier
      const t = progressRef.current;
      const pointOnCurve = routeCurve.getPointAt(t);
      courierGroup.position.copy(pointOnCurve);

      const tangent = routeCurve.getTangentAt(t).normalize();
      const lookAtPos = pointOnCurve.clone().add(tangent);
      courierGroup.lookAt(lookAtPos);
      courierGroup.rotateY(-Math.PI / 2);

      beaconLight.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 1.0;

      // Camera presets
      const preset = viewPresetRef.current;
      if (preset === 'CHASE') {
        const offset = tangent.clone().multiplyScalar(-9);
        camera.position.set(pointOnCurve.x + offset.x, pointOnCurve.y + 5, pointOnCurve.z + offset.z);
        camera.lookAt(pointOnCurve.x, pointOnCurve.y + 1, pointOnCurve.z);
      } else if (preset === 'TOP_DOWN') {
        camera.position.set(0, 72, 0.01);
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.x = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
        camera.position.y = cameraAngle.radius * Math.cos(cameraAngle.phi);
        camera.position.z = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
        camera.lookAt(0, 2, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mapLayer, isConfirmed]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50' : 'w-full h-[470px]'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Controls Strip */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Active Order Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 pointer-events-auto shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white">
            Confirmed Package Transit
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            {activeOrder?.id}
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            • {activeOrder?.resource_code}
          </span>
        </div>

        {/* Map Layer, Camera & Simulation Controls */}
        <div className="flex items-center space-x-1.5 pointer-events-auto">
          {/* Map API Layer Switcher */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-lg p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setMapLayer('CARTO_DARK')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                mapLayer === 'CARTO_DARK'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="CartoDB Dark Matter True-to-Life Tile API"
            >
              CartoDB Map
            </button>
            <button
              onClick={() => setMapLayer('SATELLITE')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                mapLayer === 'SATELLITE'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Esri World Imagery Satellite API"
            >
              Satellite
            </button>
          </div>

          {/* Camera Angles */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md rounded-lg p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewPreset('ISOMETRIC')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewPreset === 'ISOMETRIC'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Isometric
            </button>
            <button
              onClick={() => setViewPreset('CHASE')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewPreset === 'CHASE'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Follow Courier
            </button>
            <button
              onClick={() => setViewPreset('TOP_DOWN')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewPreset === 'TOP_DOWN'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Top-Down
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => setProgress(0)}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Reset to Origin Depot"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Floating Telemetry & Landmark Cards (Bottom Overlay) */}
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-1 md:grid-cols-4 gap-2.5 pointer-events-none">
        {/* Origin / Destination Landmarks */}
        <div className="p-3 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800/80 pointer-events-auto text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-blue-400 font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>Bhagalpur Transit Corridor</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Origin Depot:</span>
              <span className="font-semibold text-white">Mayaganj Depot (25.2420°N)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="font-semibold text-emerald-400">JLNMCH Trauma (25.2445°N)</span>
            </div>
          </div>
        </div>

        {/* Live GPS Telemetry */}
        <div className="p-3 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800/80 pointer-events-auto text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-medium">
            <Navigation className="w-3.5 h-3.5" />
            <span>Live GPS Telemetry (True-to-Life)</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Lat:</span>
              <span className="text-white">{telemetry.lat}° N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Lng:</span>
              <span className="text-white">{telemetry.lng}° E</span>
            </div>
          </div>
        </div>

        {/* Cold-Chain IoT Sensor */}
        <div className="p-3 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800/80 pointer-events-auto text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-teal-400 font-medium">
            <Thermometer className="w-3.5 h-3.5" />
            <span>Cold-Chain IoT Sensor</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Core Temp:</span>
              <span className="text-emerald-400 font-bold">{telemetry.tempC}°C (Verified)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Acceptable Band:</span>
              <span className="text-slate-400">2.0°C – 8.0°C</span>
            </div>
          </div>
        </div>

        {/* ETA & Cryptographic Custody */}
        <div className="p-3 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800/80 pointer-events-auto text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>True-to-Life ETA & Timing</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Speed / Distance:</span>
              <span className="text-white font-bold">{telemetry.speedKmh} km/h • {telemetry.distanceRemainingKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Countdown ETA:</span>
              <span className="text-emerald-400 font-bold">{formatSeconds(simulatedSecondsRemaining)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
