import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeFreightLogisticsProps {
  shipmentStatus?: string;
  temperature?: number;
}

export const ThreeFreightLogistics: React.FC<ThreeFreightLogisticsProps> = ({
  shipmentStatus = 'IN_TRANSIT',
  temperature = 4.1,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x141516, 0.05); // Charcoal fog from Freight reference

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5.0, 9.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Palette: Charcoal (#141516), Warm White (#F7F5EF), Signal Red (#EE503B)
    const isExcursion = temperature > 8.0 || shipmentStatus === 'UNDER_REVIEW';
    const routeColor = isExcursion ? 0xee503b : 0xf59e0b; // Amber / Signal Red

    // 3. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xf7f5ef, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 10, 6);
    scene.add(keyLight);

    const accentLight = new THREE.PointLight(routeColor, 2.5, 15);
    accentLight.position.set(0, 2, 0);
    scene.add(accentLight);

    // 4. Ground Grid Surface (Charcoal Minimalist Runway)
    const gridHelper = new THREE.GridHelper(20, 24, 0xee503b, 0x27272a);
    gridHelper.position.y = -1.0;
    scene.add(gridHelper);

    // 5. Depot Beacon Towers (Origin: Mayaganj, Destination: JLNMCH, Regional: Sadar, Siliguri)
    const beaconGroup = new THREE.Group();
    scene.add(beaconGroup);

    const beaconData = [
      { name: 'Mayaganj Central Blood Depot', x: -4.0, z: 0.0, color: 0x10b981 },
      { name: 'JLNMCH Emergency Trauma Bay', x: 4.0, z: 0.0, color: 0x06b6d4 },
      { name: 'Sadar Regional Hospital', x: -1.0, z: -2.8, color: 0xee503b },
      { name: 'Siliguri North Bengal Depot', x: 1.5, z: 2.8, color: 0xa855f7 },
    ];

    beaconData.forEach((b) => {
      // Beacon Pillar
      const towerGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.0, 16);
      const towerMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(b.x, 0.0, b.z);
      beaconGroup.add(tower);

      // Glowing Beacon Top Cap
      const capGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const capMat = new THREE.MeshBasicMaterial({ color: b.color });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(b.x, 1.1, b.z);
      beaconGroup.add(cap);

      // Light beam vertical cylinder
      const beamGeo = new THREE.CylinderGeometry(0.04, 0.08, 4.0, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: 0.35 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(b.x, 3.1, b.z);
      beaconGroup.add(beam);
    });

    // 6. Illuminated Transit Corridor (Curved Spline Route)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.0, -0.6, 0.0),
      new THREE.Vector3(-2.0, -0.4, 1.2),
      new THREE.Vector3(0.0, -0.3, 0.4),
      new THREE.Vector3(2.0, -0.4, -0.8),
      new THREE.Vector3(4.0, -0.6, 0.0),
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: routeColor,
      emissive: routeColor,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const routeTube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(routeTube);

    // 7. 3D Medical Convoy Vehicle (Moving along curve)
    const convoyGroup = new THREE.Group();
    scene.add(convoyGroup);

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(0.9, 0.35, 0.5);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xf7f5ef, metalness: 0.6, roughness: 0.3 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.25;
    convoyGroup.add(chassis);

    // Red Cross / Signal stripe
    const stripeGeo = new THREE.BoxGeometry(0.92, 0.08, 0.52);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xee503b });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.25;
    convoyGroup.add(stripe);

    // Cryo-Insulated Container on Convoy
    const containerGeo = new THREE.BoxGeometry(0.5, 0.4, 0.45);
    const containerMat = new THREE.MeshPhysicalMaterial({
      color: isExcursion ? 0xee503b : 0x06b6d4,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const cryoBox = new THREE.Mesh(containerGeo, containerMat);
    cryoBox.position.set(-0.15, 0.55, 0.0);
    convoyGroup.add(cryoBox);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    wheelGeo.rotateZ(Math.PI / 2);

    [
      [-0.3, 0.1, 0.28],
      [0.3, 0.1, 0.28],
      [-0.3, 0.1, -0.28],
      [0.3, 0.1, -0.28],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      convoyGroup.add(wheel);
    });

    // 8. Cold-Chain Vapor / Thermal Particles
    const vaporCount = 40;
    const vaporGeo = new THREE.BufferGeometry();
    const vaporPos = new Float32Array(vaporCount * 3);
    for (let i = 0; i < vaporCount * 3; i += 3) {
      vaporPos[i] = (Math.random() - 0.5) * 0.4;
      vaporPos[i + 1] = 0.5 + Math.random() * 0.5;
      vaporPos[i + 2] = (Math.random() - 0.5) * 0.4;
    }
    vaporGeo.setAttribute('position', new THREE.BufferAttribute(vaporPos, 3));
    const vaporMat = new THREE.PointsMaterial({
      color: isExcursion ? 0xee503b : 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
    });
    const vapor = new THREE.Points(vaporGeo, vaporMat);
    convoyGroup.add(vapor);

    // 9. Interactive Drag / Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let rotationSpeed = 0.005;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      scene.rotation.y += deltaX * rotationSpeed;
      prevMouseX = e.clientX;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 10. Animation Loop
    let animId: number;
    let progress = 0;

    const animate = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(animate);
        return;
      }

      // Progress along spline
      progress = (progress + 0.0025) % 1.0;
      const point = curve.getPointAt(progress);
      const tangent = curve.getTangentAt(progress);

      convoyGroup.position.copy(point);
      convoyGroup.position.y += 0.2; // Sit on top of corridor
      convoyGroup.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);

      // Light pulses
      accentLight.position.copy(point);
      accentLight.position.y += 0.8;

      // Vapor drift
      const vArr = vaporGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < vaporCount * 3; i += 3) {
        vArr[i] += 0.008;
        if (vArr[i] > 1.2) vArr[i] = 0.5;
      }
      vaporGeo.attributes.position.needsUpdate = true;

      // Slow idle rotation when not dragging
      if (!isDragging) {
        scene.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // 11. Resize
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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      tubeGeo.dispose();
      tubeMat.dispose();
      chassisGeo.dispose();
      chassisMat.dispose();
      stripeGeo.dispose();
      stripeMat.dispose();
      containerGeo.dispose();
      containerMat.dispose();
      wheelGeo.dispose();
      wheelMat.dispose();
      vaporGeo.dispose();
      vaporMat.dispose();
      gridHelper.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [shipmentStatus, temperature]);

  return (
    <div className="relative w-full h-72 rounded-2xl bg-[#141516] border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Cinematic Tagline from Freight Reference */}
      <div className="absolute top-3 left-4 flex items-center space-x-2 text-[10px] font-mono text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#ee503b] animate-ping" />
        <span className="font-bold text-white uppercase tracking-wider">FREIGHT // FORWARD MEDICAL TRANSIT</span>
        <span className="text-slate-500">• 3D CONVOY VECTOR</span>
      </div>
      <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 pointer-events-none">
        DRAG TO ORBIT CONVOY
      </div>
    </div>
  );
};
