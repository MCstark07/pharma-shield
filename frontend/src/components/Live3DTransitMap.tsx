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
  CheckCircle2
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
  } | null;
  onClose?: () => void;
}

export const Live3DTransitMap: React.FC<Live3DTransitMapProps> = ({
  activeOrder,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [viewPreset, setViewPreset] = useState<'CHASE' | 'ISOMETRIC' | 'TOP_DOWN'>('ISOMETRIC');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0.35);
  const [telemetry, setTelemetry] = useState({
    tempC: 3.8,
    lat: 25.2432,
    lng: 87.0138,
    speedKmh: 34,
    distanceRemainingKm: 1.2,
    etaMinutes: 4,
  });

  const progressRef = useRef(progress);
  const isPlayingRef = useRef(isPlaying);
  const viewPresetRef = useRef(viewPreset);

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
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 32, 42);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x2a3b5c, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xa5c9ff, 2.2);
    sunLight.position.set(40, 60, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Secondary soft teal rim light
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    rimLight.position.set(-30, 20, -30);
    scene.add(rimLight);

    // 3. Ground & Road Network (Bhagalpur Grid)
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090e1a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Floor Overlay
    const grid = new THREE.GridHelper(160, 40, 0x1e293b, 0x0f172a);
    grid.position.y = 0.02;
    scene.add(grid);

    // 4. Procedural City Buildings
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x111927,
      roughness: 0.7,
      metalness: 0.3,
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const buildingGroup = new THREE.Group();
    const cityBlocks = [
      { x: -30, z: -20, w: 10, d: 8, h: 14 },
      { x: -30, z: 0, w: 8, d: 10, h: 20 },
      { x: -30, z: 20, w: 12, d: 8, h: 12 },
      { x: -10, z: -30, w: 12, d: 8, h: 18 },
      { x: 10, z: -30, w: 8, d: 12, h: 22 },
      { x: 30, z: -20, w: 10, d: 10, h: 16 },
      { x: 30, z: 5, w: 8, d: 14, h: 26 },
      { x: 30, z: 25, w: 12, d: 8, h: 15 },
      { x: -5, z: 28, w: 14, d: 8, h: 10 },
      { x: 15, z: 28, w: 10, d: 8, h: 16 },
      { x: -5, z: -5, w: 6, d: 6, h: 12 },
      { x: 12, z: 8, w: 7, d: 7, h: 15 },
    ];

    cityBlocks.forEach((block) => {
      const bGeo = new THREE.BoxGeometry(block.w, block.h, block.d);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);
      bMesh.position.set(block.x, block.h / 2, block.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      buildingGroup.add(bMesh);

      // Glowing rooftop beacon
      const beaconGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff3366 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(block.x, block.h + 0.3, block.z);
      buildingGroup.add(beacon);
    });
    scene.add(buildingGroup);

    // 5. Origin Landmark: Mayaganj Central Cold-Chain Depot
    const depotGroup = new THREE.Group();
    const depotGeo = new THREE.BoxGeometry(10, 6, 12);
    const depotMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.5,
    });
    const depot = new THREE.Mesh(depotGeo, depotMat);
    depot.position.set(-24, 3, 16);
    depot.castShadow = true;
    depot.receiveShadow = true;
    depotGroup.add(depot);

    // Depot Helipad / Landing Pad ring
    const padGeo = new THREE.RingGeometry(2.5, 3.2, 32);
    const padMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = Math.PI / 2;
    pad.position.set(-24, 6.05, 16);
    depotGroup.add(pad);

    // Depot Cyan Beacon Light
    const depotLight = new THREE.PointLight(0x00f0ff, 2.5, 20);
    depotLight.position.set(-24, 8, 16);
    depotGroup.add(depotLight);
    scene.add(depotGroup);

    // 6. Destination Landmark: JLNMCH Hospital Emergency Wing
    const hospGroup = new THREE.Group();
    const hospGeo = new THREE.BoxGeometry(14, 12, 14);
    const hospMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.6,
    });
    const hosp = new THREE.Mesh(hospGeo, hospMat);
    hosp.position.set(22, 6, -18);
    hosp.castShadow = true;
    hosp.receiveShadow = true;
    hospGroup.add(hosp);

    // Hospital Medical Green Beacon
    const hospLight = new THREE.PointLight(0x10b981, 3.0, 25);
    hospLight.position.set(22, 14, -18);
    hospGroup.add(hospLight);

    // Hospital Cross Symbol on Top
    const crossGeoH = new THREE.BoxGeometry(4, 0.8, 1.2);
    const crossGeoV = new THREE.BoxGeometry(1.2, 0.8, 4);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const crossH = new THREE.Mesh(crossGeoH, crossMat);
    const crossV = new THREE.Mesh(crossGeoV, crossMat);
    crossH.position.set(22, 12.5, -18);
    crossV.position.set(22, 12.5, -18);
    hospGroup.add(crossH);
    hospGroup.add(crossV);
    scene.add(hospGroup);

    // 7. Route Spline (Mayaganj Depot -> JLNMCH Hospital)
    const routePoints = [
      new THREE.Vector3(-24, 0.5, 16),
      new THREE.Vector3(-14, 0.5, 16),
      new THREE.Vector3(-14, 0.5, 4),
      new THREE.Vector3(-2, 0.5, 4),
      new THREE.Vector3(-2, 0.5, -8),
      new THREE.Vector3(12, 0.5, -8),
      new THREE.Vector3(12, 0.5, -18),
      new THREE.Vector3(22, 0.5, -18),
    ];
    const routeCurve = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', 0.2);

    // Route Road Surface Ribbon
    const curvePoints = routeCurve.getPoints(120);
    const routeGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const routeMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      linewidth: 3,
    });
    const routeLine = new THREE.Line(routeGeo, routeMat);
    routeLine.position.y = 0.08;
    scene.add(routeLine);

    // Glowing Waypoint Nodes
    routePoints.forEach((pt) => {
      const nodeGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(pt.x, 0.1, pt.z);
      scene.add(node);
    });

    // 8. 3D Medical Courier / Autonomous Transit Pod
    const courierGroup = new THREE.Group();

    // Vehicle Chassis
    const chassisGeo = new THREE.BoxGeometry(2.4, 1.2, 1.4);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.7,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.8;
    chassis.castShadow = true;
    courierGroup.add(chassis);

    // Windshield
    const cabGeo = new THREE.BoxGeometry(1.0, 0.8, 1.3);
    const cabMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0.6, 1.4, 0);
    courierGroup.add(cab);

    // Cold-Chain Thermal Pod Container (with cold cyan glow)
    const podGeo = new THREE.BoxGeometry(1.2, 1.0, 1.36);
    const podMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coldPod = new THREE.Mesh(podGeo, podMat);
    coldPod.position.set(-0.6, 1.4, 0);
    courierGroup.add(coldPod);

    // Headlights
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.3), headlightMat);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.3), headlightMat);
    hl1.position.set(1.22, 0.8, 0.4);
    hl2.position.set(1.22, 0.8, -0.4);
    courierGroup.add(hl1);
    courierGroup.add(hl2);

    // Top Beacon Light (Amber / Cyan pulse)
    const beaconLight = new THREE.PointLight(0x38bdf8, 2, 8);
    beaconLight.position.set(0, 2.2, 0);
    courierGroup.add(beaconLight);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    const w3 = new THREE.Mesh(wheelGeo, wheelMat);
    const w4 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.rotation.x = Math.PI / 2;
    w2.rotation.x = Math.PI / 2;
    w3.rotation.x = Math.PI / 2;
    w4.rotation.x = Math.PI / 2;
    w1.position.set(0.7, 0.35, 0.7);
    w2.position.set(0.7, 0.35, -0.7);
    w3.position.set(-0.7, 0.35, 0.7);
    w4.position.set(-0.7, 0.35, -0.7);
    courierGroup.add(w1);
    courierGroup.add(w2);
    courierGroup.add(w3);
    courierGroup.add(w4);

    scene.add(courierGroup);

    // 9. Interactive Drag Controls (Rotate / Orbit / Zoom)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraAngle = { theta: 0.6, phi: 0.8, radius: 52 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraAngle.theta -= deltaX * 0.008;
      cameraAngle.phi = Math.max(0.2, Math.min(Math.PI / 2.2, cameraAngle.phi - deltaY * 0.008));
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngle.radius = Math.max(15, Math.min(100, cameraAngle.radius + e.deltaY * 0.05));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Progress movement
      if (isPlayingRef.current) {
        let newProg = progressRef.current + delta * 0.035;
        if (newProg > 1.0) newProg = 0.0;
        setProgress(newProg);

        // Update GPS telemetry interpolation
        const lat = 25.2420 + newProg * (25.2445 - 25.2420);
        const lng = 87.0150 + newProg * (87.0125 - 87.0150);
        const dist = Math.max(0.1, Number((2.4 * (1 - newProg)).toFixed(1)));
        const eta = Math.max(1, Math.ceil(dist * 2.5));
        setTelemetry({
          tempC: Number((3.8 + Math.sin(Date.now() * 0.001) * 0.3).toFixed(1)),
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          speedKmh: newProg >= 0.98 ? 0 : 32,
          distanceRemainingKm: dist,
          etaMinutes: eta,
        });
      }

      // Position courier along 3D route
      const t = progressRef.current;
      const pointOnCurve = routeCurve.getPointAt(t);
      courierGroup.position.copy(pointOnCurve);

      // Orient courier facing forward along route
      const tangent = routeCurve.getTangentAt(t).normalize();
      const lookAtPos = pointOnCurve.clone().add(tangent);
      courierGroup.lookAt(lookAtPos);
      courierGroup.rotateY(-Math.PI / 2); // Align vehicle front axis

      // Pulse beacon
      beaconLight.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 1.0;

      // Camera preset positioning
      const preset = viewPresetRef.current;
      if (preset === 'CHASE') {
        const offset = tangent.clone().multiplyScalar(-10);
        camera.position.set(
          pointOnCurve.x + offset.x,
          pointOnCurve.y + 6,
          pointOnCurve.z + offset.z
        );
        camera.lookAt(pointOnCurve.x, pointOnCurve.y + 1, pointOnCurve.z);
      } else if (preset === 'TOP_DOWN') {
        camera.position.set(0, 75, 0.01);
        camera.lookAt(0, 0, 0);
      } else {
        // Isometric Orbit view
        camera.position.x = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
        camera.position.y = cameraAngle.radius * Math.cos(cameraAngle.phi);
        camera.position.z = cameraAngle.radius * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
        camera.lookAt(0, 2, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize Observer
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
  }, []);

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50' : 'w-full h-[460px]'
      }`}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Controls Strip */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 pointer-events-auto shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white">
            3D True-to-Life Route Tracking
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
            {activeOrder?.id || '#REQ-2026-JLNMCH-101'}
          </span>
        </div>

        {/* Right Camera Preset Switchers & Tools */}
        <div className="flex items-center space-x-1.5 pointer-events-auto">
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
            title="Reset to Depot Origin"
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
              ✕ Close Map
            </button>
          )}
        </div>
      </div>

      {/* Floating Telemetry & Landmark Cards (Bottom Overlay) */}
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-1 md:grid-cols-4 gap-2.5 pointer-events-none">
        {/* Origin / Destination Landmarks */}
        <div className="p-3 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800/80 pointer-events-auto text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-blue-400 font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>Transit Corridor: Bhagalpur</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Origin Depot:</span>
              <span className="font-semibold text-white">Mayaganj Depot</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="font-semibold text-emerald-400">JLNMCH Emergency</span>
            </div>
          </div>
        </div>

        {/* Live GPS Telemetry */}
        <div className="p-3 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800/80 pointer-events-auto text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-medium">
            <Navigation className="w-3.5 h-3.5" />
            <span>Courier GPS Coordinates</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Latitude:</span>
              <span className="text-white">{telemetry.lat}° N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Longitude:</span>
              <span className="text-white">{telemetry.lng}° E</span>
            </div>
          </div>
        </div>

        {/* Cold-Chain IoT Sensor Telemetry */}
        <div className="p-3 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800/80 pointer-events-auto text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-teal-400 font-medium">
            <Thermometer className="w-3.5 h-3.5" />
            <span>Cold-Chain IoT Sensor</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Internal Temp:</span>
              <span className="text-emerald-400 font-bold">{telemetry.tempC}°C (Safe)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Safe Band:</span>
              <span className="text-slate-400">2.0°C – 8.0°C</span>
            </div>
          </div>
        </div>

        {/* ETA & Cryptographic Custody */}
        <div className="p-3 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800/80 pointer-events-auto text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>ETA & Delivery Status</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Speed / ETA:</span>
              <span className="text-white font-bold">{telemetry.speedKmh} km/h • ~{telemetry.etaMinutes}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Custody:</span>
              <span className="text-blue-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Ed25519 Sealed</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
