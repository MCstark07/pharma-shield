import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { ShieldAlert, ShieldCheck, Flame, RefreshCw, Zap } from 'lucide-react';

interface MatterPacketArenaProps {
  lastAttack?: any;
}

export const MatterPacketArena: React.FC<MatterPacketArenaProps> = ({ lastAttack }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const [verifiedCount, setVerifiedCount] = useState<number>(142);
  const [quarantinedCount, setQuarantinedCount] = useState<number>(18);
  const [lastAction, setLastAction] = useState<string>('GATE IDLE // CONTINUOUS VERIFICATION');

  const spawnMaliciousRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!sceneRef.current) return;
    const container = sceneRef.current;
    const width = container.clientWidth || 640;
    const height = 320;

    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Composite,
      Events,
      Body,
      Vector,
    } = Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 0.25, scale: 0.001 },
    });
    engineRef.current = engine;

    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#030712',
      },
    });
    renderRef.current = render;

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Arena Boundaries
    const wallOpts = { isStatic: true, render: { fillStyle: '#1e293b' } };
    const floor = Bodies.rectangle(width / 2, height + 10, width, 20, wallOpts);
    const ceiling = Bodies.rectangle(width / 2, -10, width, 20, wallOpts);
    const leftWall = Bodies.rectangle(-10, height / 2, 20, height, wallOpts);
    const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height, wallOpts);

    // Cryptographic Gate Deflector (Angled static barriers in center)
    const gateCenterX = width * 0.5;
    const gateUpper = Bodies.rectangle(gateCenterX, 70, 14, 120, {
      isStatic: true,
      render: { fillStyle: '#06b6d4' },
      label: 'GATE_SENSOR',
    });

    // Angled deflector downward into quarantine
    const deflector = Bodies.rectangle(gateCenterX - 20, 190, 120, 12, {
      isStatic: true,
      angle: Math.PI / 4,
      render: { fillStyle: '#334155' },
    });

    // Quarantine Pit Separator
    const pitWall = Bodies.rectangle(gateCenterX + 80, height - 40, 14, 80, {
      isStatic: true,
      render: { fillStyle: '#e11d48' },
    });

    Composite.add(engine.world, [floor, ceiling, leftWall, rightWall, gateUpper, deflector, pitWall]);

    // Spawner: Legitimate Packets (Emerald, moves Left -> Right)
    const spawnLegitPacket = () => {
      const y = 50 + Math.random() * 80;
      const packet = Bodies.circle(30, y, 9, {
        restitution: 0.6,
        frictionAir: 0.01,
        render: { fillStyle: '#10b981' },
        label: 'LEGIT_PACKET',
      });
      Body.setVelocity(packet, { x: 4.5 + Math.random() * 2, y: (Math.random() - 0.5) * 1.5 });
      Composite.add(engine.world, packet);
    };

    // Spawner: Malicious Payload (Red, hits gate and gets deflected)
    const spawnMaliciousPacket = () => {
      const packet = Bodies.circle(30, 85, 13, {
        restitution: 0.8,
        frictionAir: 0.005,
        render: { fillStyle: '#f43f5e' },
        label: 'MALICIOUS_PACKET',
      });
      Body.setVelocity(packet, { x: 5.5, y: 0.5 });
      Composite.add(engine.world, packet);
      setLastAction('🚨 FORGED PACKET INJECTED — SIGNATURE DIVERGENCE DETECTED');
    };

    spawnMaliciousRef.current = spawnMaliciousPacket;

    // Automatic legit packet stream every 1.5s
    const streamInterval = setInterval(() => {
      spawnLegitPacket();
    }, 1500);

    // Collision Detection: Cryptographic Gate Check
    Events.on(engine, 'collisionStart', (evt) => {
      evt.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const labels = [bodyA.label, bodyB.label];

        if (labels.includes('GATE_SENSOR') && labels.includes('MALICIOUS_PACKET')) {
          const malBody = bodyA.label === 'MALICIOUS_PACKET' ? bodyA : bodyB;
          // Cryptographic Deflection impulse downwards into Quarantine Pit
          Body.applyForce(malBody, malBody.position, { x: -0.015, y: 0.04 });
          setQuarantinedCount((prev) => prev + 1);
          setLastAction('🛡️ MITM PACKET DEFLECTED INTO ISOLATED QUARANTINE');
        } else if (labels.includes('GATE_SENSOR') && labels.includes('LEGIT_PACKET')) {
          setVerifiedCount((prev) => prev + 1);
        }
      });
    });

    // Clean up off-screen bodies
    const cleanupInterval = setInterval(() => {
      const bodies = Composite.allBodies(engine.world);
      bodies.forEach((b) => {
        if (!b.isStatic && (b.position.x > width + 20 || b.position.y > height + 20 || b.position.x < -20)) {
          Composite.remove(engine.world, b);
        }
      });
    }, 3000);

    const handleResize = () => {
      if (!sceneRef.current || !renderRef.current) return;
      const newW = sceneRef.current.clientWidth;
      renderRef.current.canvas.width = newW;
      renderRef.current.options.width = newW;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(streamInterval);
      clearInterval(cleanupInterval);
      window.removeEventListener('resize', handleResize);
      Runner.stop(runner);
      Render.stop(render);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  // When attack occurs via props, trigger physics packet
  useEffect(() => {
    if (lastAttack && spawnMaliciousRef.current) {
      spawnMaliciousRef.current();
    }
  }, [lastAttack]);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-slate-100">Packet Deflection Physics Arena</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Matter.js 2D hardware-accelerated payload collision & quarantine diversion
          </p>
        </div>

        {/* Meters */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Passed: <strong>{verifiedCount}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Quarantined: <strong>{quarantinedCount}</strong></span>
          </div>

          <button
            onClick={() => spawnMaliciousRef.current && spawnMaliciousRef.current()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all text-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Inject Malicious Packet</span>
          </button>
        </div>
      </div>

      {/* Physics Canvas Area */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800">
        <div ref={sceneRef} className="w-full h-[320px]" />

        {/* Floating Arena Labels */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 bg-slate-900/80 px-2 py-1 rounded border border-emerald-500/20">
          ◀ INCOMING TRAFFIC STREAM
        </div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-300 bg-slate-900/90 px-2 py-1 rounded border border-cyan-500/30">
          ED25519 VERIFICATION GATE
        </div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400 bg-slate-900/80 px-2 py-1 rounded border border-emerald-500/20">
          AUTHORIZED BUFFER ▶
        </div>
        <div className="absolute bottom-3 right-8 text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded border border-rose-500/40 animate-pulse">
          ⚠️ QUARANTINE CHAMBER
        </div>
      </div>

      {/* Live Status Action Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
        <span className="truncate">{lastAction}</span>
        <span className="text-[10px] text-slate-500">2D RIGID BODY SIMULATION</span>
      </div>
    </div>
  );
};

