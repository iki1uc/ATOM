// orbit.js
// ES module: animate atoms, sink and source with modes 'orbit' | 'attract' | 'static'
// Usage example:
//   import { createOrbitController } from './orbit.js';
//   const ctrl = createOrbitController({ canvas, getAtoms: () => lastPayload?.atoms, renderCallback: () => renderScene(...) });
//   ctrl.start();

export function createOrbitController(opts = {}) {
  const canvas = opts.canvas || (typeof document !== 'undefined' && document.querySelector('canvas')) || null;
  const getAtoms = opts.getAtoms || (() => null); // function -> atoms array (may be mutated)
  const renderCallback = opts.renderCallback || (() => {});
  const demoSink = opts.sink || { id: 'A', pos: { x: 200, y: 160 }, radius: 40, strength: 120, energy: 0 };
  const demoSource = opts.source || { id: 'B', pos: { x: 420, y: 120 }, radius: 8, emissionRate: 1.0, energy: 50 };

  // settings
  let mode = opts.mode || 'orbit'; // 'orbit' | 'attract' | 'static'
  let running = false;
  let angle = 0;
  let last = performance.now();
  const ROTATION_BASE = opts.rotationBase || 0.8;
  const DAMPING = opts.damping || 0.06;
  let speedFactor = opts.speedFactor || ROTATION_BASE;
  let rafId = null;

  // internal helpers
  function ensureAtomOrigins(atoms) {
    if (!atoms) return;
    if (!atoms._orig) {
      atoms._orig = atoms.map(a => ({ x: a.pos.x, y: a.pos.y }));
    }
  }

  function updateAtoms(dt, lastEvalArg3te) {
    const atoms = getAtoms();
    if (!atoms || !atoms.length) return;

    ensureAtomOrigins(atoms);
    // map lastEvalArg3te to speed factor if provided
    const speed = typeof lastEvalArg3te === 'number' ? (0.5 + lastEvalArg3te * 1.5) : speedFactor;

    if (mode === 'orbit') {
      angle += dt * speed;
      atoms.forEach((a, idx) => {
        const o = atoms._orig[idx] || a.pos;
        const amp = 3 + (a.mass || 0) * 3;
        const phase = idx * 0.37;
        a.pos.x = o.x + Math.cos(angle * (1 + (idx % 5) * 0.03) + phase) * amp;
        a.pos.y = o.y + Math.sin(angle * (0.9 + (idx % 7) * 0.02) + phase * 1.2) * (amp * 0.6);
      });
    } else if (mode === 'attract') {
      const s = demoSink;
      atoms.forEach(a => {
        a.vel = a.vel || { x: 0, y: 0 };
        const dx = s.pos.x - a.pos.x;
        const dy = s.pos.y - a.pos.y;
        const r2 = dx * dx + dy * dy + 0.01;
        const r = Math.sqrt(r2);
        const strength = (s.strength || 100);
        const acc = (strength / r2) * dt * 0.5;
        a.vel.x += (dx / r) * acc;
        a.vel.y += (dy / r) * acc;
        a.vel.x *= (1 - DAMPING);
        a.vel.y *= (1 - DAMPING);
        a.pos.x += a.vel.x * 60 * dt;
        a.pos.y += a.vel.y * 60 * dt;
        if (r < Math.max(2, s.radius * 0.05)) {
          // absorb-ish behavior
          a.pos.x = s.pos.x + (Math.random() - 0.5) * 2;
          a.pos.y = s.pos.y + (Math.random() - 0.5) * 2;
          s.energy = (s.energy || 0) + (a.mass || 0);
        }
      });
    } else {
      // static: nothing to update for atoms
    }
  }

  function updateSinkSource(now) {
    if (!canvas) return;
    const t = now * 0.001;
    const cx = canvas.clientWidth * 0.5;
    const cy = canvas.clientHeight * 0.5;
    // gentle elliptic motion for appeal
    demoSink.pos.x = cx + Math.cos(t * 0.6) * 120;
    demoSink.pos.y = cy + Math.sin(t * 0.6) * 60;
    demoSource.pos.x = cx + Math.cos(t * 0.9 + 1.2) * 200;
    demoSource.pos.y = cy + Math.sin(t * 0.9 + 1.2) * 90;
  }

  // main RAF loop
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // If consumer exposes an evaluation, try to get arg3te from getAtoms().eval or lastPayload
    let lastEvalArg3te = null;
    const atomsMaybe = getAtoms();
    if (atomsMaybe && atomsMaybe._meta && typeof atomsMaybe._meta.arg3te === 'number') {
      lastEvalArg3te = atomsMaybe._meta.arg3te;
    } else if (atomsMaybe && atomsMaybe._eval && typeof atomsMaybe._eval.arg3te === 'number') {
      lastEvalArg3te = atomsMaybe._eval.arg3te;
    } else if (typeof opts.getLastEval === 'function') {
      try { lastEvalArg3te = opts.getLastEval(); } catch (e) { /* ignore */ }
    }

    // update atoms & sink/source
    updateAtoms(dt, lastEvalArg3te);
    updateSinkSource(now);

    // let consumer render current scene (we do not render ourselves to keep separation of concerns)
    try {
      renderCallback();
    } catch (e) {
      // swallow render errors to avoid breaking loop
      console.warn('orbit.js: renderCallback error', e);
    }

    rafId = running ? requestAnimationFrame(frame) : null;
  }

  // public API
  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    },
    isRunning() { return running; },
    setMode(m) {
      if (['orbit', 'attract', 'static'].includes(m)) mode = m;
      else console.warn('orbit.js: unknown mode', m);
    },
    getMode() { return mode; },
    setSpeedFactor(f) {
      speedFactor = Number(f) || speedFactor;
    },
    setSink(s) {
      if (s && s.pos) {
        demoSink.id = s.id || demoSink.id;
        demoSink.pos = s.pos;
        demoSink.radius = s.radius || demoSink.radius;
        demoSink.strength = s.strength || demoSink.strength;
        demoSink.energy = s.energy || demoSink.energy;
      }
    },
    setSource(s) {
      if (s && s.pos) {
        demoSource.id = s.id || demoSource.id;
        demoSource.pos = s.pos;
        demoSource.radius = s.radius || demoSource.radius;
        demoSource.emissionRate = s.emissionRate || demoSource.emissionRate;
        demoSource.energy = s.energy || demoSource.energy;
      }
    },
    getSink() { return demoSink; },
    getSource() { return demoSource; },
    setGetAtoms(fn) {
      if (typeof fn === 'function') {
        // wrap to allow dynamic getAtoms replacement
        opts.getAtoms = fn;
      }
    },
    setRenderCallback(fn) {
      if (typeof fn === 'function') {
        // allow updating render function
        opts.renderCallback = fn;
      }
    }
  };
}
