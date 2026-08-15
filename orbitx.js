/* -------------------------
   Animation & simple physics for atoms
   - modes: "static", "orbit", "attract"
   - orbit: atoms circle around their original pos
   - attract: atoms attracted to demoSink (gravity-like)
   - can tie speed to evaluation arg3te if present
   ------------------------- */

let ANIM = { running:true, mode:'orbit', angle:0, last: performance.now() };
const ROTATION_BASE = 0.8; // base speed factor
const DAMPING = 0.06;      // velocity damping for 'attract' mode

// ensure atoms keep an original backup pos for orbit mode
function ensureAtomOrigins(atoms){
  if(!atoms) return;
  if(!atoms._orig) atoms._orig = atoms.map(a => ({ x: a.pos.x, y: a.pos.y }));
}

// physics update per frame
function updateAtoms(dt){
  if(!lastPayload || !lastPayload.atoms) return;
  const atoms = lastPayload.atoms;
  ensureAtomOrigins(atoms);

  // speed factor optionally driven by eval arg3te
  let speedFactor = ROTATION_BASE;
  if(lastPayload.eval && typeof lastPayload.eval.arg3te === 'number'){
    // map arg3te [0..1] to factor [0.5 .. 2.0]
    speedFactor = 0.5 + lastPayload.eval.arg3te * 1.5;
  }

  if(ANIM.mode === 'orbit'){
    ANIM.angle += dt * speedFactor;
    atoms.forEach((a, idx) => {
      const o = atoms._orig[idx] || a.pos;
      const amp = 3 + (a.mass || 0) * 3;
      const phase = idx * 0.37;
      a.pos.x = o.x + Math.cos(ANIM.angle * (1 + (idx%5)*0.03) + phase) * amp;
      a.pos.y = o.y + Math.sin(ANIM.angle * (0.9 + (idx%7)*0.02) + phase*1.2) * (amp * 0.6);
    });
  } else if(ANIM.mode === 'attract'){
    // simple sink attraction (inverse-square softened)
    const s = demoSink;
    atoms.forEach(a=>{
      a.vel = a.vel || { x:0, y:0 };
      const dx = s.pos.x - a.pos.x;
      const dy = s.pos.y - a.pos.y;
      const r2 = dx*dx + dy*dy + 0.01;
      const r = Math.sqrt(r2);
      const strength = (s.strength || 100); // tune
      // inverse-square-like acceleration
      const acc = (strength / r2) * dt * 0.5;
      a.vel.x += (dx / r) * acc;
      a.vel.y += (dy / r) * acc;
      // damping to avoid runaway
      a.vel.x *= (1 - DAMPING);
      a.vel.y *= (1 - DAMPING);
      // integrate
      a.pos.x += a.vel.x * 60 * dt;
      a.pos.y += a.vel.y * 60 * dt;
      // if very close, absorb (optional visual)
      if(r < Math.max(2, s.radius*0.05)){
        // small bounce / energy transfer
        a.pos.x = s.pos.x + (Math.random()-0.5)*2;
        a.pos.y = s.pos.y + (Math.random()-0.5)*2;
        // optionally accumulate sink.energy
        s.energy = (s.energy||0) + (a.mass||0);
      }
    });
  } else if(ANIM.mode === 'static'){
    // do nothing
  }
}

// main RAF loop (start once)
function animateScene(now){
  if(!ANIM.running){ ANIM.last = now; requestAnimationFrame(animateScene); return; }
  const dt = Math.min(0.05, (now - (ANIM.last || now)) / 1000);
  ANIM.last = now;
  updateAtoms(dt);
  // animate sink/source as well for liveliness
  // small elliptic motion for demo sink/source:
  const t = now * 0.001;
  const cx = canvas.clientWidth * 0.5, cy = canvas.clientHeight * 0.5;
  demoSink.pos.x = cx + Math.cos(t*0.6) * 120;
  demoSink.pos.y = cy + Math.sin(t*0.6) * 60;
  demoSource.pos.x = cx + Math.cos(t*0.9 + 1.2) * 200;
  demoSource.pos.y = cy + Math.sin(t*0.9 + 1.2) * 90;

  // re-render
  renderScene(lastPayload && lastPayload.atoms ? lastPayload.atoms : [], [demoSink], [demoSource], GOLEM_PUBLISHER.list());
  requestAnimationFrame(animateScene);
}
// Start RAF
requestAnimationFrame(animateScene);

/* Controls: switch mode via console or UI:
   ANIM.mode = 'orbit' | 'attract' | 'static';
   ANIM.running = true|false;
   Example: ANIM.mode='attract';
*/
