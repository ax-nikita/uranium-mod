const uranium = global.uranium;

// -----------------------------------------------------------------------------
// Uranium Mod 3.55 - non-uranium ammunition VFX pass.
// Every ammo family keeps its own visual language. These effects are visual only:
// no Damage.*, statuses, bullet creation, velocity, splash, pierce or homing logic.
// -----------------------------------------------------------------------------

const ammoFx = {
  firearmA: Color.valueOf('F1C60F'),
  firearmB: Color.valueOf('FFF1A1'),
  titaniumA: Color.valueOf('2093FF'),
  titaniumB: Color.valueOf('9BE8FF'),
  aluminiumA: Color.valueOf('E8EEF2'),
  aluminiumB: Color.valueOf('FFFFFF'),
  fireA: Color.valueOf('F54C4C'),
  fireB: Color.valueOf('FFB34A'),
  fireC: Color.valueOf('FFD990'),
  thoriumA: Color.valueOf('FF79C3'),
  thoriumB: Color.valueOf('FFD0EE'),
  expA: Color.valueOf('D51D18'),
  expB: Color.valueOf('FF8A48'),
  altitA: Color.valueOf('BDEFFF'),
  altitB: Color.valueOf('FFFFFF'),
  blueThoriumA: Color.valueOf('00DCEB'),
  blueThoriumB: Color.valueOf('B8FFFF'),
  phaseA: Color.valueOf('FC9955'),
  phaseB: Color.valueOf('FFD782'),
  iridiumA: Color.valueOf('EAF7FF'),
  iridiumB: Color.valueOf('FFFFFF'),
  tritiumA: Color.valueOf('CCFF00'),
  tritiumB: Color.valueOf('EEFFB7'),
  iritriumA: Color.valueOf('E9FE31'),
  iritriumB: Color.valueOf('F9FEC1'),
  smoke: Color.valueOf('454A46'),
  darkSmoke: Color.valueOf('242824'),
  scorch: Color.valueOf('151714')
};

function fxNoise(seed) {
  const v = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
}

// Stable per-effect chance. Unlike Math.random() in draw(), this decision does
// not flicker between frames: one impact either keeps its residual tail or not.
function fxKeepResidual(e, chance, salt) {
  if (chance >= 0.999) return true;
  return fxNoise(e.id * 1.731 + e.x * 0.071 + e.y * 0.113 + salt) < chance;
}

function fxFadeAfter(e, start) {
  if (e.time <= start) return 1;
  return 1 - Math.min(1, (e.time - start) / Math.max(1, e.lifetime - start));
}

function createKineticMuzzle(name, lifetime, colorA, colorB, reach, spread, particles, smoke, lightRadius, profileFactor) {
  uranium.createEffect(name, lifetime, e => {
    if (profileFactor && e.time < 1.1) {
      uranium.vfxBudget.addVisible(e.x, e.y, Math.max(40, lightRadius * 1.4), 0.50 * profileFactor);
    }
    const out = e.fout();
    const drawParticles = profileFactor
      ? uranium.vfxBudget.profileCount(particles, 2, profileFactor)
      : particles;
    Draw.z(Layer.effect);
    Draw.color(colorB, colorA, e.fin());
    Draw.alpha(0.88 * out);
    Lines.stroke((0.8 + 0.45 * out) * out);
    Lines.lineAngle(e.x, e.y, e.rotation, 2 + reach * out);

    Angles.randLenVectors(e.id, drawParticles, 2 + reach * e.finpow(), e.rotation, spread, (x, y) => {
      const ang = Mathf.angle(x, y);
      Draw.color(colorB, colorA, e.fin());
      Draw.alpha(0.72 * out);
      Lines.stroke(0.65 * out);
      Lines.lineAngle(e.x + x, e.y + y, ang, 0.9 + 2.7 * out);
    });

    if (smoke) {
      Angles.randLenVectors(e.id + 91, Math.max(2, Math.floor(drawParticles * 0.45)), 1 + reach * 0.55 * e.finpow(), e.rotation + 180, 28, (x, y) => {
        Draw.color(ammoFx.smoke, ammoFx.darkSmoke, e.fin());
        Draw.alpha(0.20 * out);
        Fill.circle(e.x + x, e.y + y, 0.55 + 1.1 * out);
      });
    }

    Drawf.light(e.x, e.y, lightRadius, colorA, 0.35 * out);
    Draw.reset();
  });
}

function createEnergyMuzzle(name, lifetime, colorA, colorB, reach, particles, lightRadius, mode, profileFactor) {
  uranium.createEffect(name, lifetime, e => {
    if (profileFactor && e.time < 1.1) {
      uranium.vfxBudget.addVisible(e.x, e.y, Math.max(40, lightRadius * 1.4), 0.50 * profileFactor);
    }
    const out = e.fout();
    const drawParticles = profileFactor ? uranium.vfxBudget.profileCount(particles, 3, profileFactor) : particles;
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 13) / 3.2);
    Draw.z(Layer.effect);
    Draw.color(colorA, colorB, 0.35 + 0.45 * pulse);
    Draw.alpha(0.80 * out);
    Fill.circle(e.x, e.y, (1.2 + 1.4 * pulse) * (0.65 + 0.35 * out));

    Angles.randLenVectors(e.id, drawParticles, 2 + reach * e.finpow(), e.rotation, mode === 'phase' ? 42 : 24, (x, y) => {
      const ang = Mathf.angle(x, y);
      Draw.color(colorB, colorA, e.fin());
      Draw.alpha((0.55 + 0.25 * pulse) * out);
      Lines.stroke((0.55 + 0.25 * pulse) * out);
      Lines.lineAngle(e.x + x, e.y + y, ang, 1.2 + 3.6 * out);
      if (mode === 'phase') {
        Draw.alpha(0.24 * out);
        Fill.square(e.x + x * 0.78, e.y + y * 0.78, 0.55 + 0.6 * out, ang + 45);
      }
    });

    Drawf.light(e.x, e.y, lightRadius * (0.8 + 0.2 * pulse), colorA, 0.42 * out);
    Draw.reset();
  });
}

function createFireMuzzle(name, lifetime, reach, particles, lightRadius) {
  uranium.createEffect(name, lifetime, e => {
    const out = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 11) / 2.8);
    Draw.z(Layer.effect);
    Draw.color(ammoFx.fireC, ammoFx.fireA, e.fin());
    Draw.alpha((0.70 + 0.18 * pulse) * out);
    Fill.circle(e.x, e.y, 1.3 + 1.4 * pulse);
    Angles.randLenVectors(e.id, particles, 2 + reach * e.finpow(), e.rotation, 28, (x, y) => {
      Draw.color(ammoFx.fireC, ammoFx.fireB, ammoFx.fireA, e.fin());
      Draw.alpha(0.72 * out);
      Fill.circle(e.x + x, e.y + y, 0.35 + 0.85 * out);
      Lines.stroke(0.46 * out);
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 0.8 + 2.4 * out);
    });
    Angles.randLenVectors(e.id + 77, Math.max(3, Math.floor(particles * 0.55)), 2 + reach * 0.48 * e.finpow(), e.rotation + 180, 35, (x, y) => {
      Draw.color(ammoFx.darkSmoke, ammoFx.smoke, e.fin());
      Draw.alpha(0.18 * out);
      Fill.circle(e.x + x, e.y + y, 0.65 + 1.25 * e.fin());
    });
    Drawf.light(e.x, e.y, lightRadius * (0.82 + 0.18 * pulse), ammoFx.fireA, 0.44 * out);
    Draw.reset();
  });
}

// Muzzle groups. Kinetic ammo shares a believable gun flash; energy ammo gets a
// distinct emitter-like flash. Identity is reinforced much more strongly in the
// flight/impact effects below.
createKineticMuzzle('ammo-kinetic-shot-small', 12, ammoFx.firearmA, ammoFx.firearmB, 13, 18, 6, true, 20);
createKineticMuzzle('ammo-kinetic-shot-medium', 15, ammoFx.firearmA, ammoFx.firearmB, 19, 20, 9, true, 28);
createKineticMuzzle('ammo-kinetic-shot-large', 20, ammoFx.firearmA, ammoFx.firearmB, 27, 22, 13, true, 40);
createEnergyMuzzle('ammo-electric-shot-small', 15, ammoFx.altitA, ammoFx.altitB, 14, 7, 24, 'electric', 2);
createEnergyMuzzle('ammo-electric-shot-medium', 18, ammoFx.altitA, ammoFx.altitB, 20, 10, 32, 'electric', 1.5);
createEnergyMuzzle('ammo-electric-shot-large', 22, ammoFx.altitA, ammoFx.altitB, 28, 14, 44, 'electric');
createEnergyMuzzle('ammo-phase-shot-small', 12, ammoFx.phaseA, ammoFx.phaseB, 16, 8, 22, 'phase');
createEnergyMuzzle('ammo-phase-shot-medium', 14, ammoFx.phaseA, ammoFx.phaseB, 22, 11, 30, 'phase');
createEnergyMuzzle('ammo-phase-shot-large', 18, ammoFx.phaseA, ammoFx.phaseB, 30, 15, 42, 'phase');

createKineticMuzzle('ammo-titanium-shot-small', 12, ammoFx.titaniumA, ammoFx.titaniumB, 15, 15, 6, false, 21);
createKineticMuzzle('ammo-titanium-shot-medium', 15, ammoFx.titaniumA, ammoFx.titaniumB, 21, 17, 9, false, 29);
createKineticMuzzle('ammo-titanium-shot-large', 20, ammoFx.titaniumA, ammoFx.titaniumB, 29, 19, 13, false, 42);
createKineticMuzzle('ammo-aluminium-shot-small', 11, ammoFx.aluminiumA, ammoFx.aluminiumB, 17, 12, 7, false, 20);
createKineticMuzzle('ammo-aluminium-shot-medium', 14, ammoFx.aluminiumA, ammoFx.aluminiumB, 24, 13, 10, false, 28);
createKineticMuzzle('ammo-aluminium-shot-large', 18, ammoFx.aluminiumA, ammoFx.aluminiumB, 32, 15, 14, false, 39);
createFireMuzzle('ammo-fire-shot-small', 16, 14, 8, 25);
createFireMuzzle('ammo-fire-shot-medium', 19, 20, 11, 34);
createFireMuzzle('ammo-fire-shot-large', 23, 28, 15, 47);
createEnergyMuzzle('ammo-thorium-shot-small', 16, ammoFx.thoriumA, ammoFx.thoriumB, 14, 8, 25, 'energy', 6);
createEnergyMuzzle('ammo-thorium-shot-medium', 19, ammoFx.thoriumA, ammoFx.thoriumB, 20, 11, 34, 'energy', 3);
createEnergyMuzzle('ammo-thorium-shot-large', 23, ammoFx.thoriumA, ammoFx.thoriumB, 28, 15, 47, 'energy');
createKineticMuzzle('ammo-exp-shot-small', 14, ammoFx.expA, ammoFx.expB, 14, 22, 8, true, 24, 2);
createKineticMuzzle('ammo-exp-shot-medium', 17, ammoFx.expA, ammoFx.expB, 20, 24, 11, true, 34, 2.5);
createKineticMuzzle('ammo-exp-shot-large', 22, ammoFx.expA, ammoFx.expB, 28, 26, 16, true, 48);
createEnergyMuzzle('ammo-blue-thorium-shot-small', 16, ammoFx.blueThoriumA, ammoFx.blueThoriumB, 16, 8, 27, 'energy');
createEnergyMuzzle('ammo-blue-thorium-shot-medium', 19, ammoFx.blueThoriumA, ammoFx.blueThoriumB, 23, 11, 37, 'energy');
createEnergyMuzzle('ammo-blue-thorium-shot-large', 24, ammoFx.blueThoriumA, ammoFx.blueThoriumB, 31, 16, 52, 'energy');
createKineticMuzzle('ammo-iridium-shot-small', 10, ammoFx.iridiumA, ammoFx.iridiumB, 20, 9, 6, false, 22);
createKineticMuzzle('ammo-iridium-shot-medium', 13, ammoFx.iridiumA, ammoFx.iridiumB, 28, 10, 9, false, 31);
createKineticMuzzle('ammo-iridium-shot-large', 18, ammoFx.iridiumA, ammoFx.iridiumB, 38, 12, 14, false, 45);
createEnergyMuzzle('ammo-tritium-shot-small', 16, ammoFx.tritiumA, ammoFx.tritiumB, 15, 9, 27, 'electric', 2);
createEnergyMuzzle('ammo-tritium-shot-medium', 20, ammoFx.tritiumA, ammoFx.tritiumB, 22, 12, 38, 'electric', 3);
createEnergyMuzzle('ammo-tritium-shot-large', 25, ammoFx.tritiumA, ammoFx.tritiumB, 30, 17, 54, 'electric');
createEnergyMuzzle('ammo-iritrium-shot-small', 16, ammoFx.iritriumA, ammoFx.iritriumB, 16, 9, 28, 'energy', 1.5);
createEnergyMuzzle('ammo-iritrium-shot-medium', 20, ammoFx.iritriumA, ammoFx.iritriumB, 23, 12, 39, 'energy');
createEnergyMuzzle('ammo-iritrium-shot-large', 25, ammoFx.iritriumA, ammoFx.iritriumB, 32, 17, 55, 'energy');

// -----------------------------------------------------------------------------
// Flight trails
// -----------------------------------------------------------------------------

uranium.createEffect('firearm-trail', 14, e => {
  const out = e.fout();
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.firearmB, ammoFx.firearmA, e.fin());
  Draw.alpha(0.32 * out);
  Lines.stroke(0.45 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 2.2 + 2.8 * out);
  Draw.color(ammoFx.smoke);
  Draw.alpha(0.09 * out);
  Fill.circle(e.x, e.y, 0.45 + 0.45 * out);
  Draw.reset();
});

uranium.createEffect('titanium-trail', 18, e => {
  const out = e.fout();
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.titaniumB, ammoFx.titaniumA, e.fin());
  Draw.alpha(0.46 * out);
  Lines.stroke((0.55 + 0.18 * e.fslope()) * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 3.5 + 4.0 * out);
  Draw.alpha(0.24 * out);
  Fill.circle(e.x, e.y, 0.45 + 0.55 * out);
  Drawf.light(e.x, e.y, 9, ammoFx.titaniumA, 0.12 * out);
  Draw.reset();
});

uranium.createEffect('aluminium-trail', 13, e => {
  const out = e.fout();
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.aluminiumB, ammoFx.aluminiumA, e.fin());
  Draw.alpha(0.44 * out);
  Lines.stroke(0.42 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 4 + 5 * out);
  Draw.alpha(0.16 * out);
  Lines.stroke(0.28 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 7 + 5 * out);
  Draw.reset();
});

uranium.createEffect('fire-trail', 26, e => {
  const out = e.fout();
  const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 11) / 3.5);
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.fireB, ammoFx.fireA, e.fin());
  Draw.alpha((0.36 + 0.18 * pulse) * out);
  Fill.circle(e.x, e.y, 0.65 + 1.15 * out);
  Draw.color(ammoFx.darkSmoke, ammoFx.smoke, e.fin());
  Draw.alpha(0.13 * out);
  Fill.circle(e.x - Math.cos(e.rotation / 180 * Math.PI) * 1.4, e.y - Math.sin(e.rotation / 180 * Math.PI) * 1.4, 0.8 + 1.2 * e.fin());
  Drawf.light(e.x, e.y, 12, ammoFx.fireA, 0.16 * out);
  Draw.reset();
});

uranium.createEffect('thorium-trail', 22, e => {
  const out = e.fout();
  const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 17) / 4.8);
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.thoriumA, ammoFx.thoriumB, 0.35 + 0.45 * pulse);
  Draw.alpha((0.26 + 0.14 * pulse) * out);
  Fill.circle(e.x, e.y, 0.7 + 0.8 * pulse);
  Draw.alpha(0.22 * out);
  Lines.stroke(0.50 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 2.4 + 3.0 * out);
  Drawf.light(e.x, e.y, 12, ammoFx.thoriumA, 0.13 * out);
  Draw.reset();
});

uranium.createEffect('exp-trail', 26, e => {
  const out = e.fout();
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.expB, ammoFx.expA, e.fin());
  Draw.alpha(0.38 * out);
  Fill.circle(e.x, e.y, 0.48 + 0.70 * out);
  Draw.color(ammoFx.darkSmoke, ammoFx.smoke, e.fin());
  Draw.alpha(0.16 * out);
  Fill.circle(e.x, e.y, 0.8 + 1.4 * e.fin());
  Draw.reset();
});

uranium.createEffect('altit-trail', 18, e => {
  const out = e.fout();
  const side = (e.id % 2 === 0 ? 1 : -1);
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.altitB, ammoFx.altitA, e.fin());
  Draw.alpha(0.45 * out);
  Lines.stroke(0.52 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180 + side * 14, 2.4 + 3.4 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180 - side * 9, 1.2 + 2.0 * out);
  Draw.alpha(0.20 * out);
  Fill.circle(e.x, e.y, 0.55 + 0.55 * out);
  Drawf.light(e.x, e.y, 11, ammoFx.altitA, 0.15 * out);
  Draw.reset();
});

uranium.createEffect('blue-thorium-trail', 34, e => {
  const out = e.fout();
  const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 19) / 5.5);
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.blueThoriumB, ammoFx.blueThoriumA, e.fin());
  Draw.alpha((0.28 + 0.12 * pulse) * out);
  Lines.stroke(0.48 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 3 + 5.2 * out);
  Draw.alpha(0.18 * out);
  Fill.circle(e.x, e.y, 0.55 + 0.75 * pulse);
  Drawf.light(e.x, e.y, 13, ammoFx.blueThoriumA, 0.14 * out);
  Draw.reset();
});

uranium.createEffect('phase-trail', 20, e => {
  const out = e.fout();
  const flip = e.id % 2 === 0 ? 1 : -1;
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.phaseB, ammoFx.phaseA, e.fin());
  Draw.alpha(0.28 * out);
  Lines.stroke(0.44 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180 + flip * 8, 4 + 6 * out);
  Draw.alpha(0.14 * out);
  Fill.square(e.x, e.y, 0.7 + 0.8 * out, e.rotation + 45 + flip * 12);
  Draw.reset();
});

uranium.createEffect('iridium-trail', 18, e => {
  const out = e.fout();
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.iridiumB, ammoFx.iridiumA, e.fin());
  Draw.alpha(0.58 * out);
  Lines.stroke(0.38 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 6 + 8 * out);
  Draw.alpha(0.20 * out);
  Lines.stroke(0.18 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 10 + 10 * out);
  Drawf.light(e.x, e.y, 10, ammoFx.iridiumA, 0.11 * out);
  Draw.reset();
});

uranium.createEffect('tritium-trail', 22, e => {
  const out = e.fout();
  const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 23) / 4.2);
  const side = (e.id % 3 - 1) * 14;
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.tritiumB, ammoFx.tritiumA, e.fin());
  Draw.alpha((0.34 + 0.12 * pulse) * out);
  Lines.stroke((0.48 + 0.18 * pulse) * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180 + side, 2.0 + 3.6 * out);
  Draw.alpha(0.24 * out);
  Fill.circle(e.x, e.y, 0.5 + 0.75 * pulse);
  Drawf.light(e.x, e.y, 13, ammoFx.tritiumA, 0.17 * out);
  Draw.reset();
});

uranium.createEffect('iritrium-trail', 25, e => {
  const out = e.fout();
  const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 29) / 5.8);
  Draw.z(Layer.bullet - 0.02);
  Draw.color(ammoFx.iritriumA, ammoFx.iritriumB, 0.25 + 0.55 * pulse);
  Draw.alpha((0.30 + 0.13 * pulse) * out);
  Fill.square(e.x, e.y, 0.65 + 0.55 * pulse, e.rotation + e.time * 1.8);
  Draw.alpha(0.24 * out);
  Lines.stroke(0.44 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 2.5 + 4.4 * out);
  Drawf.light(e.x, e.y, 14, ammoFx.iritriumA, 0.16 * out);
  Draw.reset();
});

// -----------------------------------------------------------------------------
// Impact families
// -----------------------------------------------------------------------------

function createFirearmHit(name, lifetime, scale) {
  uranium.createEffect(name, lifetime, e => {
    const out = e.fout();
    Draw.z(Layer.effect);
    Draw.color(ammoFx.firearmB, ammoFx.firearmA, e.fin());
    Lines.stroke((0.55 + 0.45 * scale) * out);
    Angles.randLenVectors(e.id, Math.floor(4 + 4 * scale), 2 + 11 * scale * e.finpow(), (x, y) => {
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 0.8 + 2.4 * scale * out);
    });
    Draw.color(ammoFx.smoke);
    Draw.alpha(0.12 * out);
    Angles.randLenVectors(e.id + 31, Math.floor(2 + 3 * scale), 2 + 6 * scale * e.finpow(), (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.4 + 0.9 * scale * out);
    });
    if (scale > 1.3) {
      Draw.color(ammoFx.darkSmoke, ammoFx.smoke, e.fin());
      Draw.alpha(0.18 * out);
      Angles.randLenVectors(e.id + 131, 8, 5 + 19 * scale * e.finpow(), (x, y) => {
        Fill.circle(e.x + x, e.y + y, 0.9 + 1.6 * out);
      });
      Drawf.light(e.x, e.y, 42, ammoFx.firearmA, 0.22 * out);
    }
    Draw.reset();
  });
}

function createTitaniumHit(name, lifetime, scale) {
  uranium.createEffect(name, lifetime, e => {
    const out = e.fout();
    Draw.z(Layer.effect);
    Draw.color(ammoFx.titaniumB, ammoFx.titaniumA, e.fin());
    Lines.stroke((0.65 + 0.42 * scale) * out);
    Angles.randLenVectors(e.id, Math.floor(5 + 6 * scale), 3 + 15 * scale * e.finpow(), (x, y) => {
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1.0 + 3.6 * scale * out);
    });
    Draw.alpha(0.36 * out);
    Fill.circle(e.x, e.y, 1.0 + 1.8 * scale * out);
    if (scale > 1.3) {
      Draw.color(ammoFx.smoke);
      Draw.alpha(0.15 * out);
      Angles.randLenVectors(e.id + 170, 9, 4 + 20 * scale * e.finpow(), (x, y) => {
        Fill.circle(e.x + x, e.y + y, 0.7 + 1.4 * out);
      });
    }
    Drawf.light(e.x, e.y, 18 + 12 * scale, ammoFx.titaniumA, 0.36 * out);
    Draw.reset();
  });
}

function createAluminiumHit(name, lifetime, scale) {
  uranium.createEffect(name, lifetime, e => {
    const out = e.fout();
    Draw.z(Layer.effect);
    Draw.color(ammoFx.aluminiumB, ammoFx.aluminiumA, e.fin());
    Lines.stroke((0.42 + 0.28 * scale) * out);
    Angles.randLenVectors(e.id, Math.floor(7 + 8 * scale), 3 + 17 * scale * e.finpow(), (x, y) => {
      const ang = Mathf.angle(x, y);
      Lines.lineAngle(e.x + x, e.y + y, ang, 1.6 + 4.6 * scale * out);
    });
    Draw.alpha(0.20 * out);
    Fill.circle(e.x, e.y, 0.8 + 1.25 * scale * out);
    if (scale > 1.3) {
      Draw.color(ammoFx.aluminiumA, Color.white, e.fin());
      Draw.alpha(0.13 * out);
      Angles.randLenVectors(e.id + 220, 10, 5 + 22 * scale * e.finpow(), (x, y) => {
        Lines.stroke(0.35 * out);
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 2 + 4 * out);
      });
      Draw.color(ammoFx.smoke);
      Draw.alpha(0.10 * out);
      Angles.randLenVectors(e.id + 240, 6, 3 + 16 * e.finpow(), (x, y) => {
        Fill.circle(e.x + x, e.y + y, 0.6 + 1.0 * out);
      });
    }
    Draw.reset();
  });
}

function createFireHit(name, lifetime, burstTicks, scale, scorchRadius, residueChance) {
  uranium.createEffect(name, lifetime, e => {
    const keepResidue = fxKeepResidual(e, residueChance == undefined ? 1 : residueChance, 417);
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 17) / 7.0);
    const scorchFade = fxFadeAfter(e, lifetime * 0.64);
    if (e.time < burstTicks) {
      const f = 1 - e.time / burstTicks;
      Draw.z(Layer.effect);
      Draw.color(ammoFx.fireC, ammoFx.fireA, 1 - f);
      Draw.alpha(0.78 * f);
      Fill.circle(e.x, e.y, (1.8 + 3.6 * scale) * (0.75 + 0.4 * f));
      Angles.randLenVectors(e.id, Math.floor(7 + 7 * scale), 3 + 17 * scale * (1 - f), (x, y) => {
        Draw.color(ammoFx.fireB, ammoFx.fireA, 1 - f);
        Draw.alpha(0.72 * f);
        Fill.circle(e.x + x, e.y + y, 0.35 + 1.15 * scale * f);
      });
      Drawf.light(e.x, e.y, 24 + 22 * scale, ammoFx.fireA, 0.44 * f);
    }

    if (keepResidue) {
      Draw.z(Layer.scorch + 0.04);
      Draw.color(ammoFx.scorch);
      Draw.alpha((0.28 + 0.05 * pulse) * scorchFade);
      Fill.circle(e.x, e.y, scorchRadius * (0.92 + 0.05 * pulse));
      Fill.circle(e.x + scorchRadius * 0.26, e.y - scorchRadius * 0.12, scorchRadius * 0.47);
      Fill.circle(e.x - scorchRadius * 0.21, e.y + scorchRadius * 0.20, scorchRadius * 0.36);
      Draw.color(ammoFx.fireA, ammoFx.fireB, 0.28 + 0.4 * pulse);
      Draw.alpha((0.055 + 0.035 * pulse) * scorchFade);
      Angles.randLenVectors(e.id + 201, Math.floor(4 + 4 * scale), scorchRadius * 0.86, (x, y) => {
        Fill.circle(e.x + x, e.y + y, 0.35 + 0.5 * pulse);
      });
    }
    Draw.reset();
  });
}

function createThoriumHit(name, lifetime, scale, residueChance) {
  uranium.createEffect(name, lifetime, e => {
    const keepResidue = fxKeepResidual(e, residueChance == undefined ? 1 : residueChance, 733);
    if (!keepResidue) e.lifetime = Math.min(e.lifetime, 8);
    if (e.time > 7 && !keepResidue) return;
    const out = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 13) / 4.5);
    Draw.z(Layer.effect);
    Draw.color(ammoFx.thoriumB, ammoFx.thoriumA, e.fin());
    Draw.alpha((0.60 + 0.15 * pulse) * out);
    Fill.circle(e.x, e.y, (1.4 + 2.8 * scale) * (0.65 + 0.35 * out));
    Lines.stroke((0.75 + 0.60 * scale) * out);
    Lines.circle(e.x, e.y, 2 + 10 * scale * e.finpow());
    {
      const rayCount = Math.floor(6 + 8 * scale);
      Angles.randLenVectors(e.id, rayCount, 3 + 18 * scale * e.finpow(), (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + 3.5 * scale * out);
      });
      Drawf.light(e.x, e.y, 24 + 20 * scale, ammoFx.thoriumA, 0.42 * out);
    }
    Draw.reset();
  });
}

function createExplosiveHit(name, lifetime, burstTicks, scale, craterRadius, residueChance, profileFactor) {
  uranium.createEffect(name, lifetime, e => {
    const lod = profileFactor ? uranium.vfxBudget.registerEffect(e, 90, profileFactor, 0.12) : uranium.vfxBudget.getLod();
    if (profileFactor && lod > 0) uranium.vfxBudget.profileLifetime(e, lifetime, profileFactor, burstTicks + 4);
    const keepResidue = fxKeepResidual(e, residueChance == undefined ? 1 : residueChance, 991);
    if (!keepResidue) e.lifetime = Math.min(e.lifetime, burstTicks + 4);
    const craterFade = fxFadeAfter(e, lifetime * 0.72);
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 23) / 9.0);
    if (e.time < burstTicks) {
      const f = 1 - e.time / burstTicks;
      Draw.z(Layer.effect);
      Draw.color(Color.white, ammoFx.expB, 0.35 + 0.55 * (1 - f));
      Draw.alpha(0.90 * f);
      Fill.circle(e.x, e.y, (2 + 4.5 * scale) * (0.85 + 0.45 * f));
      const burstCount = profileFactor
        ? uranium.vfxBudget.profileCount(Math.floor(8 + 12 * scale), 3, profileFactor)
        : Math.floor(8 + 12 * scale);
      const smokeCount = profileFactor
        ? uranium.vfxBudget.profileCount(Math.floor(5 + 7 * scale), 2, profileFactor)
        : Math.floor(5 + 7 * scale);
      Angles.randLenVectors(e.id, burstCount, 4 + 24 * scale * (1 - f), (x, y) => {
        Draw.color(ammoFx.expB, ammoFx.expA, 1 - f);
        Draw.alpha(0.80 * f);
        Lines.stroke((0.7 + 0.3 * scale) * f);
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1.2 + 4.2 * scale * f);
      });
      Angles.randLenVectors(e.id + 77, smokeCount, 3 + 18 * scale * (1 - f), (x, y) => {
        Draw.color(ammoFx.darkSmoke, ammoFx.smoke, 1 - f);
        Draw.alpha(0.25 * f);
        Fill.circle(e.x + x, e.y + y, 0.7 + 2.0 * scale * f);
      });
      Drawf.light(e.x, e.y, 28 + 26 * scale, ammoFx.expB, 0.52 * f);
    }

    if (keepResidue) {
      Draw.z(Layer.scorch + 0.035);
      Draw.color(ammoFx.scorch);
      Draw.alpha((0.30 + 0.05 * pulse) * craterFade);
      Fill.circle(e.x, e.y, craterRadius * (0.96 + 0.04 * pulse));
      Fill.circle(e.x + craterRadius * 0.24, e.y - craterRadius * 0.15, craterRadius * 0.50);
      Fill.circle(e.x - craterRadius * 0.19, e.y + craterRadius * 0.18, craterRadius * 0.42);
      Draw.color(uranium.getRuntimeColor('080908'));
      Draw.alpha(0.16 * craterFade);
      Fill.circle(e.x + craterRadius * 0.13, e.y - craterRadius * 0.11, craterRadius * 0.60);
    }
    Draw.reset();
  });
}

function drawElectricBranches(e, radius, branches, fade, colorA, colorB, thickness) {
  for (let i = 0; i < branches; i++) {
    let seed = e.id * 1.17 + i * 19.31;
    let ang = fxNoise(seed) * 360;
    let px = e.x;
    let py = e.y;
    let segs = 2 + Math.floor(fxNoise(seed + 2.3) * 3);
    for (let s = 0; s < segs; s++) {
      const t = (s + 1) / segs;
      ang += (fxNoise(seed + s * 3.71 + 7) - 0.5) * 65;
      const rr = radius * t * (0.70 + 0.30 * fxNoise(seed + s * 5.1 + 11));
      const nx = e.x + Math.cos(ang / 180 * Math.PI) * rr;
      const ny = e.y + Math.sin(ang / 180 * Math.PI) * rr;
      Draw.color(colorA, colorB, 0.25 + 0.55 * fxNoise(seed + s + 31));
      Draw.alpha((0.25 + 0.18 * fxNoise(seed + s + 49)) * fade);
      Lines.stroke(thickness * fade * (1.0 - t * 0.28));
      Lines.line(px, py, nx, ny);
      px = nx;
      py = ny;
    }
  }
}

function createAltitHit(name, lifetime, scale, profileFactor, detailFraction) {
  uranium.createEffect(name, lifetime, e => {
    const lod = profileFactor ? uranium.vfxBudget.registerEffect(e, 80, profileFactor, 0.12) : uranium.vfxBudget.getLod();
    if (profileFactor && lod > 0) uranium.vfxBudget.profileLifetime(e, lifetime, profileFactor, 8);
    const out = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 19) / 4.0);
    Draw.z(Layer.effect);
    Draw.color(ammoFx.altitB, ammoFx.altitA, 0.35 + 0.45 * pulse);
    Draw.alpha(0.48 * out);
    Fill.circle(e.x, e.y, 1.2 + 2.4 * scale * out);
    const detailActive = lod == 0 || detailFraction == undefined || e.time < lifetime * detailFraction;
    if (detailActive) {
      const branches = profileFactor
        ? uranium.vfxBudget.profileCount(Math.floor(4 + 4 * scale), 2, profileFactor)
        : Math.floor(4 + 4 * scale);
      drawElectricBranches(e, 10 + 14 * scale * e.finpow(), branches, out, ammoFx.altitB, ammoFx.altitA, 0.75 + 0.35 * scale);
      Drawf.light(e.x, e.y, 24 + 24 * scale, ammoFx.altitA, 0.43 * out);
    }
    Draw.reset();
  });
}

// Blue thorium preserves the original idea: particles continue *forward* after
// impact. They now have layered brightness, length variation and slow decay.
function createBlueThoriumHit(name, lifetime, scale, profileFactor) {
  uranium.createEffect(name, lifetime, e => {
    const lod = profileFactor ? uranium.vfxBudget.registerEffect(e, 110, profileFactor, 0.12) : uranium.vfxBudget.getLod();
    if (profileFactor && lod > 0) uranium.vfxBudget.profileLifetime(e, lifetime, profileFactor, 12);
    const out = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 17) / 5.0);
    Draw.z(Layer.effect);
    Draw.color(ammoFx.blueThoriumB, ammoFx.blueThoriumA, e.fin());
    Draw.alpha((0.48 + 0.18 * pulse) * out);
    Fill.circle(e.x, e.y, 1.4 + 2.2 * scale * out);

    Angles.randLenVectors(e.id, profileFactor ? uranium.vfxBudget.profileCount(Math.floor(8 + 10 * scale), 3, profileFactor) : Math.floor(8 + 10 * scale), 4 + 34 * scale * e.finpow(), e.rotation, 17 + 4 * scale, (x, y) => {
      const ang = Mathf.angle(x, y);
      const long = 1.2 + 6.0 * scale * out * (0.55 + 0.45 * fxNoise(e.id + x * 0.71 + y * 0.33));
      Draw.color(ammoFx.blueThoriumB, ammoFx.blueThoriumA, e.fin());
      Draw.alpha((0.34 + 0.22 * pulse) * out);
      Lines.stroke((0.46 + 0.28 * scale) * out);
      Lines.lineAngle(e.x + x, e.y + y, ang, long);
      Draw.alpha(0.16 * out);
      Fill.circle(e.x + x * 0.82, e.y + y * 0.82, 0.25 + 0.65 * scale * out);
    });

    Angles.randLenVectors(e.id + 501, profileFactor ? uranium.vfxBudget.profileCount(Math.floor(3 + 4 * scale), 2, profileFactor) : Math.floor(3 + 4 * scale), 3 + 18 * scale * e.finpow(), e.rotation, 26, (x, y) => {
      Draw.color(ammoFx.blueThoriumA);
      Draw.alpha(0.12 * out);
      Fill.circle(e.x + x, e.y + y, 0.5 + 0.8 * scale * out);
    });
    Drawf.light(e.x, e.y, 28 + 26 * scale, ammoFx.blueThoriumA, 0.40 * out);
    Draw.reset();
  });
}

function createPhaseHit(name, lifetime, scale) {
  uranium.createEffect(name, lifetime, e => {
    const out = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 29) / 3.8);
    Draw.z(Layer.effect);
    Draw.color(ammoFx.phaseB, ammoFx.phaseA, e.fin());
    Draw.alpha((0.48 + 0.15 * pulse) * out);
    for (let i = 0; i < 4; i++) {
      const ang = e.rotation + i * 90 + (fxNoise(e.id + i * 9.1) - 0.5) * 20;
      Lines.stroke((0.45 + 0.25 * scale) * out);
      Lines.lineAngle(e.x, e.y, ang, 2 + 8 * scale * e.finpow());
      Draw.alpha(0.16 * out);
      Fill.square(
        e.x + Math.cos(ang / 180 * Math.PI) * (2 + 7 * scale * e.finpow()),
        e.y + Math.sin(ang / 180 * Math.PI) * (2 + 7 * scale * e.finpow()),
        0.5 + 0.7 * scale * out,
        ang + 45
      );
      Draw.alpha((0.48 + 0.15 * pulse) * out);
    }
    Drawf.light(e.x, e.y, 18 + 16 * scale, ammoFx.phaseA, 0.30 * out);
    Draw.reset();
  });
}

function createIridiumHit(name, lifetime, scale) {
  uranium.createEffect(name, lifetime, e => {
    const out = e.fout();
    Draw.z(Layer.effect);
    Draw.color(ammoFx.iridiumB, ammoFx.iridiumA, e.fin());
    Draw.alpha(0.88 * out);
    Lines.stroke((0.48 + 0.30 * scale) * out);
    Lines.lineAngle(e.x, e.y, e.rotation, 2 + 8 * scale * out);
    Lines.lineAngle(e.x, e.y, e.rotation + 180, 1 + 5 * scale * out);
    Angles.randLenVectors(e.id, Math.floor(4 + 5 * scale), 2 + 11 * scale * e.finpow(), e.rotation, 70, (x, y) => {
      Lines.stroke(0.45 * out);
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + 3.0 * scale * out);
    });
    Drawf.light(e.x, e.y, 20 + 20 * scale, ammoFx.iridiumA, 0.34 * out);
    Draw.reset();
  });
}

function createIridiumArtHit(name, lifetime, scale, craterRadius) {
  uranium.createEffect(name, lifetime, e => {
    const burst = e.time < 34 ? 1 - e.time / 34 : 0;
    const fade = fxFadeAfter(e, lifetime * 0.72);
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 13) / 7.0);
    if (burst > 0) {
      Draw.z(Layer.effect);
      Draw.color(Color.white, ammoFx.iridiumA, 1 - burst);
      Draw.alpha(0.95 * burst);
      Fill.circle(e.x, e.y, 4 + 7 * scale * burst);
      Angles.randLenVectors(e.id, 24, 5 + 32 * scale * (1 - burst), (x, y) => {
        Lines.stroke(0.8 * burst);
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 2 + 6 * scale * burst);
      });
      Drawf.light(e.x, e.y, 58 + 28 * scale, ammoFx.iridiumA, 0.62 * burst);
    }
    Draw.z(Layer.scorch + 0.04);
    Draw.color(uranium.getRuntimeColor('2B3032'));
    Draw.alpha((0.23 + 0.05 * pulse) * fade);
    Fill.circle(e.x, e.y, craterRadius * (0.95 + 0.04 * pulse));
    Draw.color(ammoFx.iridiumA, Color.white, 0.5 + 0.3 * pulse);
    Draw.alpha((0.035 + 0.025 * pulse) * fade);
    Lines.stroke(0.55 * fade);
    Lines.circle(e.x, e.y, craterRadius * (0.55 + 0.10 * pulse));
    Draw.reset();
  });
}

function createTritiumHit(name, lifetime, scale, profileFactor, detailFraction) {
  uranium.createEffect(name, lifetime, e => {
    const lod = profileFactor ? uranium.vfxBudget.registerEffect(e, 85, profileFactor, 0.12) : uranium.vfxBudget.getLod();
    if (profileFactor && lod > 0) uranium.vfxBudget.profileLifetime(e, lifetime, profileFactor, 8);
    const out = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 31) / 4.0);
    Draw.z(Layer.effect);
    Draw.color(ammoFx.tritiumB, ammoFx.tritiumA, 0.30 + 0.50 * pulse);
    Draw.alpha((0.50 + 0.18 * pulse) * out);
    Fill.circle(e.x, e.y, 1.2 + 2.8 * scale * out);
    const detailActive = lod == 0 || detailFraction == undefined || e.time < lifetime * detailFraction;
    if (detailActive) {
      const detailCount = profileFactor
        ? uranium.vfxBudget.profileCount(Math.floor(5 + 5 * scale), 2, profileFactor)
        : Math.floor(5 + 5 * scale);
      drawElectricBranches(e, 12 + 17 * scale * e.finpow(), detailCount, out, ammoFx.tritiumB, ammoFx.tritiumA, 0.75 + 0.35 * scale);
      Angles.randLenVectors(e.id + 401, detailCount, 2 + 13 * scale * e.finpow(), (x, y) => {
        Draw.color(ammoFx.tritiumA, ammoFx.tritiumB, e.fin());
        Draw.alpha(0.22 * out);
        Fill.circle(e.x + x, e.y + y, 0.25 + 0.50 * scale * out);
      });
      Drawf.light(e.x, e.y, 28 + 26 * scale, ammoFx.tritiumA, 0.46 * out);
    }
    Draw.reset();
  });
}

function createIritriumHit(name, lifetime, scale, profileFactor, detailFraction) {
  uranium.createEffect(name, lifetime, e => {
    const lod = profileFactor ? uranium.vfxBudget.registerEffect(e, 85, profileFactor, 0.12) : uranium.vfxBudget.getLod();
    if (profileFactor && lod > 0) uranium.vfxBudget.profileLifetime(e, lifetime, profileFactor, 8);
    const out = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 37) / 5.2);
    Draw.z(Layer.effect);
    Draw.color(ammoFx.iritriumB, ammoFx.iritriumA, 0.35 + 0.45 * pulse);
    Draw.alpha((0.46 + 0.20 * pulse) * out);
    Fill.square(e.x, e.y, 1.1 + 2.1 * scale * out, e.rotation + 45 + e.time * 1.6);
    const detailActive = lod == 0 || detailFraction == undefined || e.time < lifetime * detailFraction;
    if (detailActive) {
      const rayCount = profileFactor
        ? uranium.vfxBudget.profileCount(Math.floor(7 + 7 * scale), 3, profileFactor)
        : Math.floor(7 + 7 * scale);
      Angles.randLenVectors(e.id, rayCount, 3 + 18 * scale * e.finpow(), (x, y) => {
        const ang = Mathf.angle(x, y);
        Draw.alpha((0.28 + 0.16 * pulse) * out);
        Lines.stroke((0.45 + 0.20 * scale) * out);
        Lines.lineAngle(e.x + x, e.y + y, ang, 1 + 4.2 * scale * out);
        Draw.alpha(0.12 * out);
        Fill.square(e.x + x * 0.82, e.y + y * 0.82, 0.45 + 0.55 * scale * out, ang + 45);
      });
      Drawf.light(e.x, e.y, 26 + 24 * scale, ammoFx.iritriumA, 0.42 * out);
    }
    Draw.reset();
  });
}

function createIritriumArtHit(name, lifetime, scale, residueRadius) {
  uranium.createEffect(name, lifetime, e => {
    const burst = e.time < 42 ? 1 - e.time / 42 : 0;
    const glow = fxFadeAfter(e, lifetime * 0.68);
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 41) / 7.0);
    if (burst > 0) {
      Draw.z(Layer.effect);
      Draw.color(ammoFx.iritriumB, ammoFx.iritriumA, 1 - burst);
      Draw.alpha(0.90 * burst);
      Fill.square(e.x, e.y, 4 + 7 * scale * burst, e.rotation + 45 + e.time * 2.0);
      Angles.randLenVectors(e.id, 22, 5 + 34 * scale * (1 - burst), (x, y) => {
        Lines.stroke(0.75 * burst);
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 2 + 5.5 * scale * burst);
      });
      Drawf.light(e.x, e.y, 55 + 34 * scale, ammoFx.iritriumA, 0.60 * burst);
    }
    Draw.z(Layer.scorch + 0.05);
    Draw.color(ammoFx.iritriumA, ammoFx.iritriumB, 0.28 + 0.55 * pulse);
    Draw.alpha((0.030 + 0.025 * pulse) * glow);
    Fill.circle(e.x, e.y, residueRadius * (0.82 + 0.07 * pulse));
    Draw.z(Layer.debris + 0.08);
    Draw.alpha((0.08 + 0.05 * pulse) * glow);
    Lines.stroke((0.45 + 0.22 * pulse) * glow);
    Lines.circle(e.x, e.y, residueRadius * (0.45 + 0.12 * pulse));
    Draw.reset();
  });
}

// Instantiate impact scale variants.
createFirearmHit('firearm-hit-small', 20, 0.75);
createFirearmHit('firearm-hit-medium', 25, 1.05);
createFirearmHit('firearm-hit-large', 34, 1.55);
createTitaniumHit('titanium-hit-small', 22, 0.80);
createTitaniumHit('titanium-hit-medium', 28, 1.10);
createTitaniumHit('titanium-hit-large', 38, 1.60);
createAluminiumHit('aluminium-hit-small', 18, 0.75);
createAluminiumHit('aluminium-hit-medium', 23, 1.05);
createAluminiumHit('aluminium-hit-large', 32, 1.55);
createFireHit('fire-hit-small', 150, 20, 0.75, 2.4, 0.28);
createFireHit('fire-hit-medium', 190, 24, 1.05, 3.8, 1);
createFireHit('fire-hit-large', 270, 32, 1.65, 7.8, 1);
createThoriumHit('thorium-hit-small', 30, 0.80, 0.30);
createThoriumHit('thorium-hit-medium', 36, 1.10, 1);
createThoriumHit('thorium-hit-large', 48, 1.65, 1);
createExplosiveHit('exp-hit-small', 170, 22, 0.80, 2.8, 0.32, 2);
createExplosiveHit('exp-hit-medium', 220, 28, 1.15, 4.8, 1, 2.5);
createExplosiveHit('exp-hit-large', 340, 40, 1.80, 10.5, 1);
createAltitHit('altit-hit-small', 34, 0.80, 2, 0.55);
createAltitHit('altit-hit-medium', 44, 1.15, 1.5, 0.70);
createAltitHit('altit-hit-large', 58, 1.70);
createBlueThoriumHit('blue-thorium-hit-small', 110, 0.78, 6);
createBlueThoriumHit('blue-thorium-hit-medium', 150, 1.08, 3);
createBlueThoriumHit('blue-thorium-hit-large', 190, 1.65);
createPhaseHit('phase-hit-small', 24, 0.75);
createPhaseHit('phase-hit-medium', 30, 1.08);
createPhaseHit('phase-hit-large', 40, 1.60);
createIridiumHit('iridium-hit-small', 20, 0.78);
createIridiumHit('iridium-hit-medium', 26, 1.10);
createIridiumArtHit('iridium-hit-large', 230, 1.65, 6.2);
createTritiumHit('tritium-hit-small', 34, 0.82, 2, 0.60);
createTritiumHit('tritium-hit-medium', 44, 1.15, 3, 0.65);
createTritiumHit('tritium-hit-large', 62, 1.75);
createIritriumHit('iritrium-hit-small', 32, 0.82, 1.5, 0.60);
createIritriumHit('iritrium-hit-medium', 42, 1.16);
createIritriumArtHit('iritrium-hit-large', 260, 1.75, 8.5);

// Large effect clip radii: prevent visually long artillery sparks/forward
// particles from being culled when their center is close to the screen edge.
uranium.getEffect('firearm-hit-large').clip = 80;
uranium.getEffect('titanium-hit-large').clip = 90;
uranium.getEffect('aluminium-hit-large').clip = 90;
uranium.getEffect('fire-hit-large').clip = 90;
uranium.getEffect('thorium-hit-large').clip = 100;
uranium.getEffect('exp-hit-large').clip = 110;
uranium.getEffect('altit-hit-large').clip = 100;
uranium.getEffect('blue-thorium-hit-large').clip = 130;
uranium.getEffect('phase-hit-large').clip = 100;
uranium.getEffect('iridium-hit-large').clip = 100;
uranium.getEffect('tritium-hit-large').clip = 100;
uranium.getEffect('iritrium-hit-large').clip = 110;

// -----------------------------------------------------------------------------
// Secondary-fragment visuals: explosive shrapnel, tritium energy fragments and
// iritrium splinters. These are only VFX applied to the existing frag bullets.
// -----------------------------------------------------------------------------

uranium.createEffect('exp-shrapnel-trail', 16, e => {
  const out = e.fout();
  Draw.color(ammoFx.expB, ammoFx.expA, e.fin());
  Draw.alpha(0.32 * out);
  Lines.stroke(0.42 * out);
  Lines.lineAngle(e.x, e.y, e.rotation + 180, 2 + 3.5 * out);
  Draw.reset();
});

uranium.createEffect('exp-shrapnel-hit', 6, e => {
  const out = e.fout();
  Draw.color(ammoFx.expB, ammoFx.expA, e.fin());
  Draw.alpha(0.58 * out);
  Angles.randLenVectors(e.id, 1, 2 + 5 * e.finpow(), (x, y) => {
    Lines.stroke(0.44 * out);
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + 2.0 * out);
  });
  Draw.reset();
});

uranium.createEffect('tritium-frag-hit-small', 5, e => {
  const out = e.fout();
  Draw.color(ammoFx.tritiumB, ammoFx.tritiumA, e.fin());
  Draw.alpha(0.52 * out);
  Lines.stroke(0.42 * out);
  Lines.lineAngle(e.x, e.y, e.rotation, 1.3 + 2.1 * out);
  Draw.reset();
});

uranium.createEffect('tritium-frag-hit-medium', 8, e => {
  const out = e.fout();
  Draw.color(ammoFx.tritiumB, ammoFx.tritiumA, e.fin());
  Draw.alpha(0.56 * out);
  drawElectricBranches(e, 6 * e.finpow(), 2, out, ammoFx.tritiumB, ammoFx.tritiumA, 0.48);
  Draw.reset();
});

uranium.createEffect('tritium-frag-hit', 12, e => {
  const out = e.fout();
  Draw.color(ammoFx.tritiumB, ammoFx.tritiumA, e.fin());
  Draw.alpha(0.60 * out);
  drawElectricBranches(e, 8 * e.finpow(), 2, out, ammoFx.tritiumB, ammoFx.tritiumA, 0.55);
  Draw.reset();
});

uranium.createEffect('tritium-frag-fade', 20, e => {
  const out = e.fout();
  Draw.color(ammoFx.tritiumA, ammoFx.tritiumB, e.fin());
  Draw.alpha(0.30 * out);
  Fill.circle(e.x, e.y, 0.5 + 0.9 * out);
  Angles.randLenVectors(e.id, 3, 2 + 5 * e.finpow(), (x, y) => {
    Fill.circle(e.x + x, e.y + y, 0.18 + 0.30 * out);
  });
  Draw.reset();
});

uranium.createEffect('iritrium-frag-trail', 18, e => {
  const out = e.fout();
  Draw.color(ammoFx.iritriumB, ammoFx.iritriumA, e.fin());
  Draw.alpha(0.34 * out);
  Fill.square(e.x, e.y, 0.45 + 0.55 * out, e.rotation + 45);
  Draw.reset();
});

uranium.createEffect('iritrium-frag-hit', 24, e => {
  const out = e.fout();
  Draw.color(ammoFx.iritriumB, ammoFx.iritriumA, e.fin());
  Draw.alpha(0.56 * out);
  Angles.randLenVectors(e.id, 6, 2 + 10 * e.finpow(), (x, y) => {
    Lines.stroke(0.48 * out);
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + 2.8 * out);
  });
  Drawf.light(e.x, e.y, 20, ammoFx.iritriumA, 0.26 * out);
  Draw.reset();
});

