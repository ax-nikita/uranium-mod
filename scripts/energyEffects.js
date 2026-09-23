const uranium = global.uranium;

// -----------------------------------------------------------------------------
// Curated energy-weapon VFX for Uranium Mod 3.61.
// These helpers are visual/audio-facing only. Damage, projectile speed, lifetime,
// status, piercing and the custom 6-tick laser damage cadence remain untouched.
// -----------------------------------------------------------------------------

const energyFx = {
  profiles: {
    // Dalh: compact thermal cutter. Thin beam, hot yellow-green sheath.
    'dalh': {
      outer: Color.valueOf('6E7E36'), mid: Color.valueOf('D7E86B'), core: Color.valueOf('FFF8C8'), spark: Color.valueOf('F5FF9C'),
      halo: 5.6, midWidth: 2.65, coreWidth: 0.92, sparkCount: 5, light: 33, pathEffect: 'laser-path-dalh',
      pulseVolume: 0.16, pulsePitchRange: 0.018
    },
    // Frost Dalh: ion-cold beam, crystalline micro-fractures instead of heat sparks.
    'dalh-frost': {
      outer: Color.valueOf('4C7796'), mid: Color.valueOf('8ED8FF'), core: Color.valueOf('EAFBFF'), spark: Color.valueOf('BDEEFF'),
      halo: 5.2, midWidth: 2.45, coreWidth: 0.82, sparkCount: 6, light: 36, pathEffect: 'laser-path-frost',
      pulseVolume: 0.15, pulsePitchRange: 0.012
    },
    // Radiation Dalh: unstable green ion beam; lingering motes communicate status.
    'dalh-rad': {
      outer: Color.valueOf('316D36'), mid: Color.valueOf('65FF6A'), core: Color.valueOf('D9FFD0'), spark: Color.valueOf('8DFF73'),
      halo: 5.8, midWidth: 2.62, coreWidth: 0.88, sparkCount: 7, light: 38, pathEffect: 'laser-path-rad',
      pulseVolume: 0.16, pulsePitchRange: 0.016
    },
    // Spartan: heavier overfilled beam. The core stays wide through the actual
    // recurring damage window and only collapses at the very end of lifetime.
    'spartan': {
      outer: Color.valueOf('946D22'), mid: Color.valueOf('FFD45C'), core: Color.valueOf('FFF7D5'), spark: Color.valueOf('FFE994'),
      halo: 8.4, midWidth: 4.25, coreWidth: 1.42, sparkCount: 9, light: 51, pathEffect: 'laser-path-spartan',
      pulseVolume: 0.22, pulsePitchRange: 0.014
    },
    'spartan-frost': {
      outer: Color.valueOf('365E7D'), mid: Color.valueOf('74D7FF'), core: Color.valueOf('F2FDFF'), spark: Color.valueOf('B2EEFF'),
      halo: 8.0, midWidth: 4.05, coreWidth: 1.35, sparkCount: 10, light: 54, pathEffect: 'laser-path-frost-heavy',
      pulseVolume: 0.21, pulsePitchRange: 0.010
    },
    'spartan-rad': {
      outer: Color.valueOf('286730'), mid: Color.valueOf('54F75D'), core: Color.valueOf('E0FFD8'), spark: Color.valueOf('A3FF7D'),
      halo: 8.8, midWidth: 4.35, coreWidth: 1.48, sparkCount: 11, light: 56, pathEffect: 'laser-path-rad-heavy',
      pulseVolume: 0.22, pulsePitchRange: 0.013
    },

    // Plasma projectile identities.
    'zvezda': {
      outer: Color.valueOf('2A6E39'), mid: Color.valueOf('65E96A'), core: Color.valueOf('E9FFD9'), accent: Color.valueOf('FFF090'),
      radius: 3.15, length: 10.0, light: 29, orbit: 1.0
    },
    'zvezda-charged': {
      outer: Color.valueOf('34783A'), mid: Color.valueOf('7CFF75'), core: Color.valueOf('FFFBD9'), accent: Color.valueOf('FFE875'),
      radius: 4.05, length: 13.8, light: 40, orbit: 1.35
    },
    'pure-plasma': {
      outer: Color.valueOf('496EAD'), mid: Color.valueOf('94C6FF'), core: Color.valueOf('F4FCFF'), accent: Color.valueOf('BFDFFF'),
      radius: 3.35, length: 11.4, light: 34, orbit: 0.72
    },
    'pure-plasma-charged': {
      outer: Color.valueOf('496BBD'), mid: Color.valueOf('9DD1FF'), core: Color.valueOf('FFFFFF'), accent: Color.valueOf('CBE8FF'),
      radius: 4.25, length: 15.0, light: 45, orbit: 0.92
    },
    'legend-plasma': {
      outer: Color.valueOf('4E347F'), mid: Color.valueOf('77FF87'), core: Color.valueOf('F3FFE4'), accent: Color.valueOf('8EA2FF'),
      radius: 3.5, length: 11.8, light: 37, orbit: 1.18
    },
    'legend-plasma-charged': {
      outer: Color.valueOf('56348D'), mid: Color.valueOf('80FF8D'), core: Color.valueOf('FFFFFF'), accent: Color.valueOf('9FAEFF'),
      radius: 4.5, length: 15.8, light: 48, orbit: 1.55
    }
  }
};

function energyNoise(seed) {
  const n = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return n - Math.floor(n);
}

energyFx.drawLaser = function (b, type) {
  const p = this.profiles[type.energyProfile || 'dalh'];
  const fin = b.time / type.lifetime;
  const fadeIn = Math.min(1, fin / 0.075);
  const fadeOut = fin < 0.88 ? 1 : Math.max(0, 1 - (fin - 0.88) / 0.12);
  const fade = fadeIn * fadeOut;
  const cadence = b.time % 6;
  const damagePulse = 0.78 + 0.22 * Math.pow(0.5 + 0.5 * Math.cos(cadence / 6 * Math.PI * 2), 5);
  const ownerTemp = b.owner && b.owner.getTempCore ? 1 + Math.min(2.5, b.owner.getTempCore()) / 5 : 1.2;
  const beamLength = type.length * fadeIn * (0.998 + 0.002 * damagePulse);
  const rot = b.rotation();
  const midX = b.x + Angles.trnsx(rot, beamLength * 0.5);
  const midY = b.y + Angles.trnsy(rot, beamLength * 0.5);
  const endX = b.x + Angles.trnsx(rot, beamLength);
  const endY = b.y + Angles.trnsy(rot, beamLength);
  const widthScale = fade * damagePulse * ownerTemp;

  // Broad optical overflow, intentionally low alpha.
  Draw.color(p.outer);
  Draw.alpha(0.18 * fade * (0.82 + 0.18 * damagePulse));
  Lines.stroke(p.halo * widthScale);
  Lines.lineAngle(b.x, b.y, rot, beamLength, false);

  // Dense colored body.
  Draw.color(p.mid);
  Draw.alpha(0.78 * fade);
  Lines.stroke(p.midWidth * widthScale);
  Lines.lineAngle(b.x, b.y, rot, beamLength, false);

  // White-hot damage core. The 6-tick brightness surge mirrors the mod's
  // existing Damage.collideLine cadence without changing that cadence.
  Draw.color(p.core);
  Draw.alpha((0.83 + 0.17 * damagePulse) * fade);
  Lines.stroke(p.coreWidth * widthScale);
  Lines.lineAngle(b.x, b.y, rot, beamLength, false);

  // Two very thin edge filaments give the beam depth without turning it into
  // a flat neon rectangle.
  for (let side = -1; side <= 1; side += 2) {
    const offset = side * p.midWidth * 0.55 * ownerTemp;
    const ox = Angles.trnsx(rot + 90, offset);
    const oy = Angles.trnsy(rot + 90, offset);
    Draw.color(p.spark);
    Draw.alpha(0.22 * fade * damagePulse);
    Lines.stroke(Math.max(0.28, p.coreWidth * 0.24) * fade);
    Lines.lineAngle(b.x + ox, b.y + oy, rot, beamLength * 0.985, false);
  }

  // Deterministic micro-arcs distributed across the entire damaging line.
  // They become strongest around actual 6-tick damage pulses.
  for (let i = 0; i < p.sparkCount; i++) {
    const seed = b.id * 1.71 + i * 13.17 + Math.floor(b.time / 2) * 0.91;
    const along = beamLength * (0.10 + 0.84 * energyNoise(seed));
    const lateral = (energyNoise(seed + 2.3) - 0.5) * p.halo * 1.25;
    const sx = b.x + Angles.trnsx(rot, along) + Angles.trnsx(rot + 90, lateral);
    const sy = b.y + Angles.trnsy(rot, along) + Angles.trnsy(rot + 90, lateral);
    const sparkRot = rot + 90 + (energyNoise(seed + 5.8) - 0.5) * 76;
    const sparkLen = (1.2 + energyNoise(seed + 8.4) * 4.0) * damagePulse;
    Draw.color(p.spark, p.core, 0.35 + 0.45 * damagePulse);
    Draw.alpha((0.10 + 0.24 * damagePulse) * fade);
    Lines.stroke((0.28 + 0.38 * damagePulse) * fade);
    Lines.lineAngle(sx, sy, sparkRot, sparkLen, false);
  }

  // Muzzle and terminal overfill knots.
  Draw.color(p.core, p.mid, 0.45);
  Draw.alpha(0.75 * fade);
  Fill.circle(b.x, b.y, p.midWidth * 0.72 * ownerTemp * (0.88 + 0.12 * damagePulse));
  Fill.circle(endX, endY, p.midWidth * 0.58 * ownerTemp * (0.80 + 0.20 * damagePulse));
  Draw.color(p.spark);
  Draw.alpha(0.32 * fade * damagePulse);
  Lines.stroke(0.6 * fade);
  Lines.circle(endX, endY, p.halo * 0.58 * (0.9 + 0.15 * damagePulse));

  Drawf.light(b.x, b.y, endX, endY, p.halo * 2.1 * ownerTemp, p.mid, 0.34 * fade * damagePulse);
  Drawf.light(endX, endY, p.light * (0.78 + 0.22 * damagePulse), p.spark, 0.48 * fade);
  Draw.reset();
};

energyFx.emitLaserPulse = function (b, type) {
  const p = this.profiles[type.energyProfile || 'dalh'];
  const count = type.energyProfile && type.energyProfile.indexOf('spartan') === 0 ? 5 : 3;
  const rot = b.rotation();
  for (let i = 0; i < count; i++) {
    const seed = b.id * 2.31 + i * 17.7 + Math.floor(b.time / 6) * 11.3;
    const along = type.length * (0.17 + 0.74 * energyNoise(seed));
    const side = (energyNoise(seed + 3.7) - 0.5) * p.halo * 0.72;
    const x = b.x + Angles.trnsx(rot, along) + Angles.trnsx(rot + 90, side);
    const y = b.y + Angles.trnsy(rot, along) + Angles.trnsy(rot + 90, side);
    uranium.getEffect(p.pathEffect).at(x, y, rot, p.spark);
  }
  if (type.energyPulseSound) {
    const mx = b.x + Angles.trnsx(rot, type.length * 0.52);
    const my = b.y + Angles.trnsy(rot, type.length * 0.52);
    type.energyPulseSound.at(mx, my, 1 + Mathf.range(p.pulsePitchRange), p.pulseVolume);
  }
};

energyFx.drawPlasma = function (b, type) {
  const p = this.profiles[type.energyProfile || 'zvezda'];
  const fin = b.time / type.lifetime;
  const fout = 1 - fin;
  const pulse = 0.5 + 0.5 * Math.sin((b.time + b.id % 19) / 2.9);
  const rot = b.rotation();
  const length = p.length * (0.90 + 0.10 * pulse);
  const radius = p.radius * (0.92 + 0.10 * pulse);

  // Rear corona / ion compression wake.
  Draw.color(p.outer);
  Draw.alpha(0.28 + 0.20 * fout);
  Lines.stroke(radius * 1.65);
  Lines.lineAngle(b.x, b.y, rot + 180, length * 0.72, false);

  // Main plasma body: elongated, not circular "bubble" rings.
  Draw.color(p.mid);
  Draw.alpha(0.88);
  Lines.stroke(radius * 1.05);
  Lines.lineAngle(b.x - Angles.trnsx(rot, length * 0.16), b.y - Angles.trnsy(rot, length * 0.16), rot, length * 0.62, false);
  Fill.circle(b.x, b.y, radius * 0.92);

  Draw.color(p.core);
  Draw.alpha(0.98);
  Lines.stroke(radius * 0.38);
  Lines.lineAngle(b.x, b.y, rot, length * 0.76, false);
  Fill.circle(b.x + Angles.trnsx(rot, radius * 0.35), b.y + Angles.trnsy(rot, radius * 0.35), radius * 0.48);

  // Two orbiting instability fragments; pure plasma keeps these restrained.
  for (let i = 0; i < 2; i++) {
    const phase = b.time * (5.0 + p.orbit) + b.id * 11 + i * 180;
    const ox = Angles.trnsx(phase, radius * (1.25 + 0.20 * pulse));
    const oy = Angles.trnsy(phase, radius * (1.25 + 0.20 * pulse));
    Draw.color(p.accent);
    Draw.alpha(0.42 + 0.20 * pulse);
    Fill.circle(b.x + ox, b.y + oy, 0.42 + 0.30 * pulse * p.orbit);
  }

  Draw.color(p.accent);
  Draw.alpha(0.32 + 0.18 * pulse);
  Lines.stroke(0.55 + 0.25 * pulse);
  Lines.lineAngle(b.x - Angles.trnsx(rot, radius * 0.4), b.y - Angles.trnsy(rot, radius * 0.4), rot + 180, length * (0.55 + 0.20 * pulse), false);

  Drawf.light(b.x, b.y, p.light * (0.82 + 0.22 * pulse), p.mid, 0.58);
  Draw.reset();
};

uranium.energyVfx = energyFx;

// -----------------------------------------------------------------------------
// Laser muzzle / real-hit / path afterglow effects.
// -----------------------------------------------------------------------------
function laserMuzzle(name, life, cOuter, cMid, cCore, reach, sparks, light) {
  uranium.createEffect(name, life, (e) => {
    const f = e.fout();
    Draw.color(cOuter, cMid, e.fin());
    Draw.alpha(0.30 * f);
    Lines.stroke(3.2 * f);
    Lines.lineAngle(e.x, e.y, e.rotation, reach * e.finpow(), false);
    Draw.color(cCore);
    Draw.alpha(0.92 * f);
    Lines.stroke(1.0 * f);
    Lines.lineAngle(e.x, e.y, e.rotation, reach * (0.55 + 0.45 * e.fin()), false);
    Fill.circle(e.x, e.y, 2.4 * f + 0.6);
    Angles.randLenVectors(e.id, sparks, 2 + reach * 0.48 * e.finpow(), e.rotation, 46, (x, y) => {
      Draw.color(cMid, cCore, e.fin());
      Draw.alpha(0.70 * f);
      Lines.stroke(0.55 * f);
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1.0 + 3.8 * f, false);
    });
    Drawf.light(e.x, e.y, light * (0.72 + 0.28 * f), cMid, 0.62 * f);
    Draw.reset();
  });
}

function laserHit(name, life, cOuter, cMid, cCore, radius, sparks, linger) {
  uranium.createEffect(name, life, (e) => {
    const f = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 13) / 3.0);
    if (e.time < 8) {
      const b = 1 - e.time / 8;
      Draw.color(cCore, cMid, e.fin());
      Draw.alpha(0.95 * b);
      Fill.circle(e.x, e.y, radius * (0.35 + 0.55 * b));
      Lines.stroke((1.3 + radius * 0.08) * b);
      Lines.circle(e.x, e.y, 2 + radius * 1.25 * (1 - b));
    }
    Angles.randLenVectors(e.id + 17, sparks, 2 + radius * 1.4 * e.finpow(), (x, y) => {
      Draw.color(cMid, cCore, 0.30 + 0.55 * pulse);
      Draw.alpha((0.12 + 0.44 * f) * (linger ? 1 : f));
      Lines.stroke(0.55 * f);
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 0.8 + 3.6 * f, false);
      if (linger) Fill.circle(e.x + x * 0.85, e.y + y * 0.85, 0.20 + 0.35 * pulse * f);
    });
    Drawf.light(e.x, e.y, radius * 4.2, cMid, 0.38 * f);
    Draw.reset();
  });
}

function laserPath(name, life, mode) {
  uranium.createEffect(name, life, (e) => {
    const f = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 11) / 3.6);
    Draw.color(e.color, Color.white, 0.18 + 0.25 * pulse);
    Draw.alpha((mode === 'rad' ? 0.34 : 0.26) * f);
    if (mode === 'frost') {
      Lines.stroke(0.55 * f);
      for (let i = 0; i < 3; i++) Lines.lineAngle(e.x, e.y, e.rotation + 60 + i * 60, 1.4 + 2.8 * f, false);
    } else if (mode === 'rad') {
      Fill.circle(e.x, e.y, 0.35 + 0.50 * pulse * f);
      Lines.stroke(0.35 * f);
      Lines.circle(e.x, e.y, 0.8 + 1.8 * e.fin());
    } else {
      Lines.stroke(0.60 * f);
      Lines.lineAngle(e.x, e.y, e.rotation + 90 + Mathf.range(20), 1.0 + 3.4 * f, false);
    }
    Drawf.light(e.x, e.y, 9 + 7 * f, e.color, 0.18 * f);
    Draw.reset();
  });
}

laserMuzzle('energy-laser-dalh-shot', 18, Color.valueOf('6E7E36'), Color.valueOf('D7E86B'), Color.valueOf('FFF8C8'), 24, 8, 32);
laserMuzzle('energy-laser-frost-shot', 18, Color.valueOf('3F6E90'), Color.valueOf('8ED8FF'), Color.valueOf('F4FDFF'), 25, 9, 34);
laserMuzzle('energy-laser-rad-shot', 20, Color.valueOf('2C6934'), Color.valueOf('63FF67'), Color.valueOf('E2FFD9'), 25, 10, 36);
laserMuzzle('energy-laser-spartan-shot', 24, Color.valueOf('8E6420'), Color.valueOf('FFD45C'), Color.valueOf('FFF7D5'), 36, 15, 48);
laserMuzzle('energy-laser-spartan-frost-shot', 24, Color.valueOf('315D7D'), Color.valueOf('78D8FF'), Color.valueOf('F7FEFF'), 37, 16, 51);
laserMuzzle('energy-laser-spartan-rad-shot', 26, Color.valueOf('286830'), Color.valueOf('58F762'), Color.valueOf('E8FFE0'), 37, 17, 54);

laserHit('energy-laser-dalh-hit', 25, Color.valueOf('677132'), Color.valueOf('DCE96B'), Color.valueOf('FFF7CB'), 4.2, 8, false);
laserHit('energy-laser-frost-hit', 30, Color.valueOf('3E6F92'), Color.valueOf('8EDCFF'), Color.valueOf('F5FEFF'), 4.4, 10, true);
laserHit('energy-laser-rad-hit', 38, Color.valueOf('24662D'), Color.valueOf('66FF6B'), Color.valueOf('E5FFDC'), 4.5, 11, true);
laserHit('energy-laser-spartan-hit', 30, Color.valueOf('8C601E'), Color.valueOf('FFD45C'), Color.valueOf('FFF9DB'), 5.8, 13, false);
laserHit('energy-laser-spartan-frost-hit', 35, Color.valueOf('315D7D'), Color.valueOf('79DBFF'), Color.valueOf('F8FEFF'), 6.0, 15, true);
laserHit('energy-laser-spartan-rad-hit', 44, Color.valueOf('27692F'), Color.valueOf('5CFF65'), Color.valueOf('EAFFE2'), 6.1, 16, true);

laserPath('laser-path-dalh', 18, 'thermal');
laserPath('laser-path-spartan', 22, 'thermal');
laserPath('laser-path-frost', 24, 'frost');
laserPath('laser-path-frost-heavy', 30, 'frost');
laserPath('laser-path-rad', 32, 'rad');
laserPath('laser-path-rad-heavy', 40, 'rad');

// -----------------------------------------------------------------------------
// Plasma muzzle / trail / hit effects.
// -----------------------------------------------------------------------------
function plasmaMuzzle(name, life, cOuter, cMid, cCore, cAccent, reach, sparks, light, charged) {
  uranium.createEffect(name, life, (e) => {
    const f = e.fout();
    Draw.color(cOuter);
    Draw.alpha(0.24 * f);
    Lines.stroke((charged ? 4.6 : 3.2) * f);
    Lines.lineAngle(e.x, e.y, e.rotation, reach * e.finpow(), false);
    Draw.color(cMid, cCore, 0.45 + 0.45 * e.fin());
    Draw.alpha(0.92 * f);
    Fill.circle(e.x, e.y, (charged ? 4.8 : 3.4) * (0.55 + 0.45 * f));
    Lines.stroke((charged ? 1.5 : 1.0) * f);
    Lines.lineAngle(e.x, e.y, e.rotation, reach * (0.62 + 0.38 * e.fin()), false);
    Angles.randLenVectors(e.id + 41, sparks, 3 + reach * 0.60 * e.finpow(), e.rotation, charged ? 70 : 55, (x, y) => {
      Draw.color(cAccent, cCore, e.fin());
      Draw.alpha(0.66 * f);
      Lines.stroke(0.65 * f);
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1.0 + (charged ? 5.4 : 3.8) * f, false);
    });
    Drawf.light(e.x, e.y, light * (0.70 + 0.30 * f), cMid, 0.70 * f);
    Draw.reset();
  });
}

function plasmaTrail(name, life, cOuter, cMid, cCore, length, width, fragments) {
  uranium.createEffect(name, life, (e) => {
    const f = e.fout();
    const rot = e.rotation + 180;
    Draw.color(cOuter, cMid, e.fin());
    Draw.alpha(0.24 * f);
    Lines.stroke(width * 1.8 * f);
    Lines.lineAngle(e.x, e.y, rot, length * (0.42 + 0.58 * f), false);
    Draw.color(cCore, cMid, e.fin());
    Draw.alpha(0.64 * f);
    Lines.stroke(width * 0.55 * f);
    Lines.lineAngle(e.x, e.y, rot, length * (0.55 + 0.45 * f), false);
    Angles.randLenVectors(e.id, fragments, 1 + length * 0.45 * e.finpow(), rot, 42, (x, y) => {
      Draw.color(cMid, cCore, 0.35 + 0.45 * e.fin());
      Draw.alpha(0.32 * f);
      Fill.circle(e.x + x, e.y + y, 0.18 + 0.35 * f);
    });
    Draw.reset();
  });
}

function plasmaHit(name, life, cOuter, cMid, cCore, cAccent, radius, sparks, charged, lingering) {
  uranium.createEffect(name, life, (e) => {
    const f = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 23) / 4.0);
    const burstLife = charged ? 11 : 8;
    if (e.time < burstLife) {
      const b = 1 - e.time / burstLife;
      Draw.color(cCore, cMid, e.fin());
      Draw.alpha(0.98 * b);
      Fill.circle(e.x, e.y, radius * (0.55 + 0.82 * b));
      Lines.stroke((charged ? 2.2 : 1.6) * b);
      Lines.circle(e.x, e.y, 3 + radius * 1.75 * (1 - b));
    }
    Angles.randLenVectors(e.id + 91, sparks, 3 + radius * (charged ? 2.6 : 2.1) * e.finpow(), (x, y) => {
      Draw.color(cAccent, cCore, 0.32 + 0.50 * pulse);
      Draw.alpha((0.16 + 0.52 * f) * (lingering ? 1 : f));
      Lines.stroke((charged ? 0.85 : 0.65) * f);
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1.1 + (charged ? 6.0 : 4.4) * f, false);
      if (lingering) {
        Draw.alpha(0.16 * f);
        Fill.circle(e.x + x * 0.82, e.y + y * 0.82, 0.20 + 0.40 * pulse);
      }
    });
    Draw.color(cOuter, cMid, 0.45 + 0.35 * pulse);
    Draw.alpha((lingering ? 0.12 : 0.07) * f);
    Lines.stroke((charged ? 1.1 : 0.8) * f);
    Lines.circle(e.x, e.y, radius * (1.0 + 0.22 * pulse + e.fin() * 0.35));
    Drawf.light(e.x, e.y, radius * (charged ? 6.4 : 5.0), cMid, 0.54 * f);
    Draw.reset();
  });
}

plasmaMuzzle('plasma-zvezda-shot', 18, Color.valueOf('2B6B39'), Color.valueOf('65E96A'), Color.valueOf('F0FFE1'), Color.valueOf('FFE981'), 23, 9, 34, false);
plasmaMuzzle('plasma-zvezda-charged-shot', 24, Color.valueOf('33773B'), Color.valueOf('7CFF75'), Color.valueOf('FFFDE4'), Color.valueOf('FFE56A'), 31, 14, 45, true);
plasmaMuzzle('plasma-pure-shot', 18, Color.valueOf('456AAB'), Color.valueOf('95C9FF'), Color.valueOf('F7FDFF'), Color.valueOf('CAE7FF'), 24, 9, 37, false);
plasmaMuzzle('plasma-pure-charged-shot', 24, Color.valueOf('486BC0'), Color.valueOf('A2D5FF'), Color.valueOf('FFFFFF'), Color.valueOf('D9EDFF'), 32, 14, 49, true);
plasmaMuzzle('plasma-legend-shot', 20, Color.valueOf('533582'), Color.valueOf('78FF87'), Color.valueOf('F1FFE4'), Color.valueOf('97A9FF'), 25, 11, 40, false);
plasmaMuzzle('plasma-legend-charged-shot', 26, Color.valueOf('5A3490'), Color.valueOf('82FF90'), Color.valueOf('FFFFFF'), Color.valueOf('A8B5FF'), 34, 16, 53, true);

plasmaTrail('plasma-zvezda-trail', 17, Color.valueOf('285F35'), Color.valueOf('5FDD66'), Color.valueOf('EDFFD8'), 13, 1.15, 3);
plasmaTrail('plasma-zvezda-charged-trail', 21, Color.valueOf('2D6E37'), Color.valueOf('72F773'), Color.valueOf('FFF9D6'), 18, 1.45, 5);
plasmaTrail('plasma-pure-trail', 17, Color.valueOf('42659D'), Color.valueOf('88C3FF'), Color.valueOf('F5FCFF'), 14, 1.10, 2);
plasmaTrail('plasma-pure-charged-trail', 21, Color.valueOf('4568B2'), Color.valueOf('9BD0FF'), Color.valueOf('FFFFFF'), 19, 1.35, 3);
plasmaTrail('plasma-legend-trail', 19, Color.valueOf('493172'), Color.valueOf('69E978'), Color.valueOf('EEFFE1'), 15, 1.18, 4);
plasmaTrail('plasma-legend-charged-trail', 23, Color.valueOf('51317F'), Color.valueOf('7CF58A'), Color.valueOf('FFFFFF'), 20, 1.48, 6);

plasmaHit('plasma-zvezda-hit', 36, Color.valueOf('275F34'), Color.valueOf('64E968'), Color.valueOf('EDFFE0'), Color.valueOf('FFE878'), 5.6, 12, false, true);
plasmaHit('plasma-zvezda-charged-hit', 48, Color.valueOf('2E7037'), Color.valueOf('78F975'), Color.valueOf('FFFDE0'), Color.valueOf('FFE36C'), 7.3, 19, true, true);
plasmaHit('plasma-pure-hit', 30, Color.valueOf('42669D'), Color.valueOf('94C9FF'), Color.valueOf('FFFFFF'), Color.valueOf('D7ECFF'), 5.8, 13, false, false);
plasmaHit('plasma-pure-charged-hit', 40, Color.valueOf('456AB4'), Color.valueOf('A3D4FF'), Color.valueOf('FFFFFF'), Color.valueOf('E2F1FF'), 7.6, 20, true, false);
plasmaHit('plasma-legend-hit', 44, Color.valueOf('4B3177'), Color.valueOf('72F783'), Color.valueOf('F4FFE9'), Color.valueOf('94A8FF'), 6.0, 15, false, true);
plasmaHit('plasma-legend-charged-hit', 58, Color.valueOf('533183'), Color.valueOf('82FF91'), Color.valueOf('FFFFFF'), Color.valueOf('A7B4FF'), 8.0, 22, true, true);

function plasmaDissipate(name, life, cOuter, cMid, cCore, radius, fragments) {
  uranium.createEffect(name, life, (e) => {
    const f = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 17) / 3.4);
    Draw.color(cOuter, cMid, e.fin());
    Draw.alpha(0.18 * f);
    Fill.circle(e.x, e.y, radius * (0.62 + 0.22 * pulse) * f);
    Draw.color(cCore, cMid, e.fin());
    Draw.alpha(0.46 * f);
    Lines.stroke(0.65 * f);
    Lines.circle(e.x, e.y, radius * (0.45 + 0.75 * e.fin()));
    Angles.randLenVectors(e.id, fragments, 2 + radius * 1.7 * e.finpow(), (x, y) => {
      Draw.color(cMid, cCore, e.fin());
      Draw.alpha(0.28 * f);
      Lines.stroke(0.42 * f);
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 0.7 + 2.5 * f, false);
    });
    Drawf.light(e.x, e.y, radius * 3.5, cMid, 0.24 * f);
    Draw.reset();
  });
}

plasmaDissipate('plasma-zvezda-dissipate', 23, Color.valueOf('285F35'), Color.valueOf('65E96A'), Color.valueOf('EDFFE0'), 4.5, 7);
plasmaDissipate('plasma-zvezda-charged-dissipate', 28, Color.valueOf('2E7037'), Color.valueOf('78F975'), Color.valueOf('FFFDE0'), 5.8, 10);
plasmaDissipate('plasma-pure-dissipate', 21, Color.valueOf('42669D'), Color.valueOf('94C9FF'), Color.valueOf('FFFFFF'), 4.6, 7);
plasmaDissipate('plasma-pure-charged-dissipate', 27, Color.valueOf('456AB4'), Color.valueOf('A3D4FF'), Color.valueOf('FFFFFF'), 6.0, 10);

module.exports = energyFx;
