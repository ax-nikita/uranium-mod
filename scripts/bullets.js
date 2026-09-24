const
  uranium = global.uranium;


// Curated energy-weapon audio ------------------------------------------------
// Energy sounds are separate from ballistic impact audio. Laser contact is kept
// silent at the bullet level because collideLine() can hit several targets every
// damage pulse; the brutal release sound stays singular and readable.
const energyWeaponSounds = {
  plasmaDruzhba: Vars.tree.loadSound('energy-plasma-druzhba'),
  plasmaDruzhbaPrepared: Vars.tree.loadSound('energy-plasma-druzhba-prepared'),
  plasmaDruzhbaHit: Vars.tree.loadSound('energy-plasma-druzhba-hit'),
  plasmaDruzhbaHitPrepared: Vars.tree.loadSound('energy-plasma-druzhba-hit-prepared'),
  plasmaLegend: Vars.tree.loadSound('energy-plasma-legend'),
  plasmaLegendPrepared: Vars.tree.loadSound('energy-plasma-legend-prepared'),
  plasmaLegendHit: Vars.tree.loadSound('energy-plasma-legend-hit'),
  plasmaLegendHitPrepared: Vars.tree.loadSound('energy-plasma-legend-hit-prepared'),
  plasmaPure: Vars.tree.loadSound('energy-plasma-pure'),
  plasmaPurePrepared: Vars.tree.loadSound('energy-plasma-pure-prepared'),
  plasmaPureHit: Vars.tree.loadSound('energy-plasma-pure-hit'),
  plasmaPureHitPrepared: Vars.tree.loadSound('energy-plasma-pure-hit-prepared'),
  laserDalh: Vars.tree.loadSound('energy-laser-dalh'),
  laserDalhFrost: Vars.tree.loadSound('energy-laser-dalh-frost'),
  laserDalhRad: Vars.tree.loadSound('energy-laser-dalh-rad'),
  laserSpartan: Vars.tree.loadSound('energy-laser-spartan'),
  laserSpartanFrost: Vars.tree.loadSound('energy-laser-spartan-frost'),
  laserSpartanRad: Vars.tree.loadSound('energy-laser-spartan-rad'),
  laserDalhLoop: Vars.tree.loadSound('energy-laser-dalh-loop'),
  laserDalhFrostLoop: Vars.tree.loadSound('energy-laser-dalh-frost-loop'),
  laserDalhRadLoop: Vars.tree.loadSound('energy-laser-dalh-rad-loop'),
  laserSpartanLoop: Vars.tree.loadSound('energy-laser-spartan-loop'),
  laserSpartanFrostLoop: Vars.tree.loadSound('energy-laser-spartan-frost-loop'),
  laserSpartanRadLoop: Vars.tree.loadSound('energy-laser-spartan-rad-loop')
};

// Keep dense late-game batteries from stacking dozens of identical energy
// transients into one harsh wall. Vanilla applies the same concurrency concept
// to its loud Lancer/Meltdown/plasma sounds through SoundPriority.
[
  energyWeaponSounds.laserDalh,
  energyWeaponSounds.laserDalhFrost,
  energyWeaponSounds.laserDalhRad
].forEach(s => s.setMaxConcurrent(5));
[
  energyWeaponSounds.laserSpartan,
  energyWeaponSounds.laserSpartanFrost,
  energyWeaponSounds.laserSpartanRad
].forEach(s => s.setMaxConcurrent(4));
[
  energyWeaponSounds.laserDalhLoop,
  energyWeaponSounds.laserDalhFrostLoop,
  energyWeaponSounds.laserDalhRadLoop,
  energyWeaponSounds.laserSpartanLoop,
  energyWeaponSounds.laserSpartanFrostLoop,
  energyWeaponSounds.laserSpartanRadLoop
].forEach(s => s.setMaxConcurrent(5));
[
  energyWeaponSounds.plasmaDruzhba,
  energyWeaponSounds.plasmaDruzhbaPrepared,
  energyWeaponSounds.plasmaLegend,
  energyWeaponSounds.plasmaLegendPrepared,
  energyWeaponSounds.plasmaPure,
  energyWeaponSounds.plasmaPurePrepared
].forEach(s => s.setMaxConcurrent(6));
[
  energyWeaponSounds.plasmaDruzhbaHit,
  energyWeaponSounds.plasmaDruzhbaHitPrepared,
  energyWeaponSounds.plasmaLegendHit,
  energyWeaponSounds.plasmaLegendHitPrepared,
  energyWeaponSounds.plasmaPureHit,
  energyWeaponSounds.plasmaPureHitPrepared
].forEach(s => s.setMaxConcurrent(8));

function drawEnergyPlasmaOrb(b, coreColor, shellColor, accentColor, size, turbulence, clean, prepared) {
  let
    pulse = 0.5 + 0.5 * Math.sin((b.time + b.id % 23) / (3.2 + clean * 0.8)),
    pulse2 = 0.5 + 0.5 * Math.sin((b.time + b.id % 31) / 5.6 + 1.4),
    radius = size * (0.91 + 0.09 * pulse),
    rot = b.rotation(),
    preparedGlow = prepared ? 1.34 : 1,
    preparedAlpha = prepared ? 1.18 : 1;

  Draw.z(Layer.bullet);

  // The projectile itself is deliberately spherical. Motion is communicated by
  // detached wake motes/trail effects behind it, never by stretching the orb.
  Draw.color(shellColor, accentColor, 0.30 + 0.36 * pulse2);
  Draw.alpha(Math.min(0.34, (0.18 + 0.10 * pulse) * preparedAlpha));
  Fill.circle(b.x, b.y, radius * (1.52 + turbulence * 0.16));

  Draw.color(coreColor, Color.white, 0.40 + 0.38 * pulse);
  Draw.alpha(0.98);
  Fill.circle(b.x, b.y, radius * (0.78 + 0.06 * pulse2));

  Draw.color(Color.white, coreColor, 0.25 + 0.30 * pulse2);
  Draw.alpha(0.93);
  Fill.circle(b.x, b.y, radius * (0.38 + 0.05 * pulse));

  // Irregular energy shell; still circular in silhouette.
  Lines.stroke((0.72 + prepared * 0.42) * (0.86 + 0.14 * pulse));
  Draw.color(accentColor, coreColor, 0.46 + 0.32 * pulse);
  Draw.alpha(Math.min(0.76, (0.52 + 0.16 * pulse2) * preparedAlpha));
  Lines.circle(b.x, b.y, radius * (1.03 + 0.16 * pulse2));
  Draw.alpha(0.22 + 0.12 * pulse);
  Lines.circle(b.x, b.y, radius * (1.31 + turbulence * 0.10 + 0.07 * pulse));

  // Detached wake motes: they communicate velocity without turning the shot into
  // an elongated missile. The normal trailEffect continues behind these motes.
  const wakeCount = prepared ? 5 : 3;
  for (let i = 0; i < wakeCount; i++) {
    let back = radius * (1.30 + i * (prepared ? 0.78 : 0.68)),
      side = Math.sin(b.time * 0.58 + i * 2.7 + b.id * 0.13) * radius * (0.15 + turbulence * 0.09),
      wx = b.x + Angles.trnsx(rot + 180, back) + Angles.trnsx(rot + 90, side),
      wy = b.y + Angles.trnsy(rot + 180, back) + Angles.trnsy(rot + 90, side),
      wa = (0.23 - i * (prepared ? 0.026 : 0.045)) * (0.78 + 0.22 * pulse2);
    Draw.color(accentColor, coreColor, 0.32 + 0.40 * pulse);
    Draw.alpha(Math.max(0.04, wa));
    Fill.circle(wx, wy, radius * (prepared ? 0.23 : 0.18) * (1 - i / (wakeCount + 1)));
  }

  const satellites = 3 + Math.floor(turbulence * 2) + (prepared ? 2 : 0);
  for (let i = 0; i < satellites; i++) {
    let ang = b.time * (4.0 + turbulence * 1.8) + i * (360 / satellites) + b.id * 11,
      dist = radius * (1.0 + 0.27 * Math.sin(b.time * 0.22 + i * 1.8)),
      sx = b.x + Angles.trnsx(ang, dist),
      sy = b.y + Angles.trnsy(ang, dist);
    Draw.color(accentColor, Color.white, clean * 0.35 + 0.22 * pulse);
    Draw.alpha((0.22 + 0.22 * pulse2) * (0.75 + turbulence * 0.25));
    Fill.circle(sx, sy, 0.22 + size * (0.045 + prepared * 0.015));
    if (turbulence > 0.65) {
      Lines.stroke(0.35 + 0.18 * pulse);
      Lines.lineAngle(sx, sy, ang + 90, 0.8 + 1.5 * pulse);
    }
  }

  if (clean > 0.55) {
    Draw.color(Color.white, accentColor, 0.35 + 0.35 * pulse);
    Draw.alpha((0.24 + 0.12 * pulse2) * preparedGlow);
    Lines.stroke(0.45 + prepared * 0.24);
    Lines.circle(b.x, b.y, radius * (1.32 + 0.08 * pulse));
  }

  Drawf.light(b.x, b.y, radius * (7.0 + prepared * 2.4) * preparedGlow, coreColor, (0.48 + 0.09 * pulse) * preparedGlow);
  Draw.reset();
}

// Curated impact audio -------------------------------------------------------
// Each primary ammunition family has its own impact transient at three scales.
// Secondary frag bullets intentionally remain silent to avoid polyphonic hiss/
// squeal when dozens of fragments collide during the same frame.
const ammoImpactSounds = {
  firearm: {
    small: Vars.tree.loadSound('impact-firearm-small'),
    medium: Vars.tree.loadSound('impact-firearm-medium'),
    large: Vars.tree.loadSound('impact-firearm-large')
  },
  titanium: {
    small: Vars.tree.loadSound('impact-titanium-small'),
    medium: Vars.tree.loadSound('impact-titanium-medium'),
    large: Vars.tree.loadSound('impact-titanium-large')
  },
  aluminium: {
    small: Vars.tree.loadSound('impact-aluminium-small'),
    medium: Vars.tree.loadSound('impact-aluminium-medium'),
    large: Vars.tree.loadSound('impact-aluminium-large')
  },
  fire: {
    small: Vars.tree.loadSound('impact-fire-small-safe'),
    medium: Vars.tree.loadSound('impact-fire-medium'),
    large: Vars.tree.loadSound('impact-fire-large')
  },
  thorium: {
    small: Vars.tree.loadSound('impact-thorium-small'),
    medium: Vars.tree.loadSound('impact-thorium-medium'),
    large: Vars.tree.loadSound('impact-thorium-large')
  },
  exp: {
    small: Vars.tree.loadSound('impact-exp-small-safe'),
    medium: Vars.tree.loadSound('impact-exp-medium'),
    large: Vars.tree.loadSound('impact-exp-large')
  },
  altit: {
    small: Vars.tree.loadSound('impact-altit-small'),
    medium: Vars.tree.loadSound('impact-altit-medium'),
    large: Vars.tree.loadSound('impact-altit-large')
  },
  blueThorium: {
    small: Vars.tree.loadSound('impact-blue_thorium-small'),
    medium: Vars.tree.loadSound('impact-blue_thorium-medium'),
    large: Vars.tree.loadSound('impact-blue_thorium-large')
  },
  ultrafast: {
    small: Vars.tree.loadSound('impact-ultrafast-small'),
    medium: Vars.tree.loadSound('impact-ultrafast-medium'),
    large: Vars.tree.loadSound('impact-ultrafast-large')
  },
  uranium: {
    small: Vars.tree.loadSound('impact-uranium-small'),
    medium: Vars.tree.loadSound('impact-uranium-medium'),
    large: Vars.tree.loadSound('impact-uranium-large')
  },
  iridium: {
    small: Vars.tree.loadSound('impact-iridium-small'),
    medium: Vars.tree.loadSound('impact-iridium-medium'),
    large: Vars.tree.loadSound('impact-iridium-large')
  },
  tritium: {
    small: Vars.tree.loadSound('impact-tritium-small'),
    medium: Vars.tree.loadSound('impact-tritium-medium'),
    large: Vars.tree.loadSound('impact-tritium-large')
  },
  iritrium: {
    small: Vars.tree.loadSound('impact-iritrium-small'),
    medium: Vars.tree.loadSound('impact-iritrium-medium'),
    large: Vars.tree.loadSound('impact-iritrium-large')
  }
};

const ammoPostSounds = {
  blueThoriumSmall: Vars.tree.loadSound('post-blue-thorium-small'),
  blueThoriumMedium: Vars.tree.loadSound('post-blue-thorium-medium')
};

// Small-caliber audio budget -------------------------------------------------
// 9x18 can produce dozens/hundreds of impacts per second in a dense defence.
// These are very short transient sounds; allowing every instance to overlap can
// exhaust the audio voice budget and, on some systems, collapse the whole game
// sound mix. Limit only small impact/post sounds; medium/large impacts stay intact.
Object.keys(ammoImpactSounds).forEach(key => {
  const sound = ammoImpactSounds[key].small;
  const denseFamily = key == 'fire' || key == 'thorium' || key == 'blueThorium' ||
    key == 'uranium' || key == 'tritium' || key == 'iritrium';
  sound.setMaxConcurrent(denseFamily ? 3 : 4);
});
ammoPostSounds.blueThoriumSmall.setMaxConcurrent(2);

// 9x18 incendiary hard rate limit -------------------------------------------
// setMaxConcurrent caps overlapping voices, but does not prevent a new play()
// request every frame. Dense incendiary fire could therefore still overload the
// audio mixer and cause crackling followed by complete loss of game sound.
// Keep this fix specific to the small incendiary impact sound.
ammoImpactSounds.fire.small.setMinInterval(120);
ammoImpactSounds.fire.small.setMaxConcurrent(2);

ammoImpactSounds.exp.small.setMinInterval(120);
ammoImpactSounds.exp.small.setMaxConcurrent(2);

// Dense 9x18 families can issue 50-85+ impact requests/sec per late-game turret.
// These softer limits prevent request storms while keeping individual impacts audible.
ammoImpactSounds.blueThorium.small.setMinInterval(55);
ammoImpactSounds.uranium.small.setMinInterval(60);
ammoImpactSounds.tritium.small.setMinInterval(55);
ammoImpactSounds.iritrium.small.setMinInterval(50);
ammoImpactSounds.altit.small.setMinInterval(50);
ammoPostSounds.blueThoriumSmall.setMinInterval(75);

//FragBullets 
uranium
  .createBullet("BulletType", 'uranium-small-frag', {})
  .setBullet(10, 0.13, 125, 10, 15, 5)
  .customSetting({
    status: uranium.getSEffects('radiation'),
    hitEffect: Fx.none,
    despawnEffect: Fx.none,
    smokeEffect: Fx.none,
    pierceCap: 4,
    lightOpacity: 0
  });

uranium
  .createBullet("BasicBulletType", "uranium-medium-frag", {})
  .setBullet(0, 0.2, 100)
  .customSetting({
    pierce: true,
    hitEffect: Fx.none,
    fragBullets: 15,
    status: uranium.getSEffects('radiation'),
    despawnEffect: uranium.getEffect('uranium-frag-dissipate-medium'),
    smokeEffect: Fx.none,
    fragBullet: uranium.getBullet('uranium-small-frag'),

    // The split into 15 real small fragments is the visible transition itself;
    // no separate JS dissipate effect is needed.
    sprite: 'uranium-mod-radiation',
    frontColor: Color.valueOf('8BFF79'),
    width: 5.8,
    height: 5.8,
    spin: 2.1,
    shrinkX: 1,
    shrinkY: 1,
    lightOpacity: 0
  });

uranium
  .createBullet("LightningBulletType", "lightining-small-frag", {})
  .setBullet(2, 2, 6, 10)
  .setDrawBullet(0, "#EEFFB7", "#CCFF00", 1.4, 2.2)
  .customSetting({
    pierce: true,
    lightining: 2,
    lightningLength: 8,
    status: StatusEffects.shocked,
    lightningColor: Color.valueOf("CCFF00"),
    hitColor: Color.valueOf("CCFF00"),
    lightColor: Color.valueOf("CCFF00"),
    lightRadius: 12,
    lightOpacity: 0,
    hitEffect: uranium.getEffect('tritium-frag-hit-small'),
    despawnEffect: Fx.none,
    smokeEffect: Fx.none
  });

uranium
  .createBullet("BasicBulletType", "lightining-medium-frag", {})
  .setBullet(10, 2, 15, 10)
  .setDrawBullet(0, "#EEFFB7", "#CCFF00", 3, 3)
  .customSetting({
    pierce: true,
    fragBullets: 4,
    status: StatusEffects.shocked,
    fragBullet: uranium.getBullet('lightining-small-frag'),
    hitColor: Color.valueOf("CCFF00"),
    trailColor: Color.valueOf("CCFF00"),
    trailEffect: Fx.none,
    trailInterval: 0,
    trailRotation: true,
    lightColor: Color.valueOf("CCFF00"),
    lightRadius: 14,
    lightOpacity: 0,
    hitEffect: uranium.getEffect('tritium-frag-hit-medium'),
    despawnEffect: Fx.none,
    smokeEffect: Fx.none
  });

uranium
  .createBullet("LightningBulletType", "lightining-big-frag", {})
  .setBullet(30, 2, 15, 10)
  .setDrawBullet(0, "#EEFFB7", "#CCFF00", 3.4, 3.4)
  .customSetting({
    lightining: 5,
    lightningLength: 11,
    lightningColor: Color.valueOf("CCFF00"),
    pierce: true,
    fragBullets: 4,
    status: StatusEffects.shocked,
    fragBullet: uranium.getBullet('lightining-small-frag'),
    hitColor: Color.valueOf("CCFF00"),
    lightColor: Color.valueOf("CCFF00"),
    lightRadius: 16,
    lightOpacity: 0.34,
    hitEffect: uranium.getEffect('tritium-frag-hit'),
    despawnEffect: Fx.none,
    smokeEffect: Fx.none
  });

//---------------------| 9x18
uranium //-------------| firearm
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("firearm")
  .setBullet(70, 8, 19, 10)
  .setDrawBullet(0, 0, 0, 5, 8)
  .customSetting({
    _quality: 1,
    _expMultiplier: 2,
    hitColor: Color.valueOf("F1C60F"),
    shootEffect: uranium.getEffect('ammo-kinetic-shot-small'),
    smokeEffect: Fx.shootSmallSmoke,
    trailColor: Color.valueOf("D6B64A"),
    trailEffect: uranium.getEffect('firearm-trail'),
    trailChance: 0.18,
    trailInterval: 0,
    trailLength: 7,
    trailWidth: 1.05,
    trailRotation: true,
    lightColor: Color.valueOf("F1C60F"),
    lightRadius: 9,
    lightOpacity: 0.12,
    hitEffect: uranium.getEffect('firearm-hit-small'),
    hitSound: ammoImpactSounds.firearm.small,
    hitSoundVolume: 0.524,
    hitSoundPitchRange: 0.040,
    despawnEffect: Fx.none
  });

uranium //-------------| titanium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("titanium")
  .setBullet(110, 13, 16, 10)
  .setDrawBullet(0, "#2093FF", "#70f3FF", 5, 9)
  .customSetting({
    reloadMultiplier: 1.3,
    _quality: 2,
    hitColor: Color.valueOf("2093FF"),
    shootEffect: uranium.getEffect('ammo-titanium-shot-small'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("2093FF"),
    trailEffect: uranium.getEffect('titanium-trail'),
    trailChance: 0.18,
    trailInterval: 0,
    trailLength: 7,
    trailWidth: 1.05,
    trailRotation: true,
    lightColor: Color.valueOf("2093FF"),
    lightRadius: 13,
    lightOpacity: 0.18,
    hitEffect: uranium.getEffect('titanium-hit-small'),
    hitSound: ammoImpactSounds.titanium.small,
    hitSoundVolume: 0.511,
    hitSoundPitchRange: 0.025,
    despawnEffect: Fx.none
  });

uranium //-------------| aluminium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("aluminium")
  .setBullet(105, 14, 17, 10)
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 5, 10)
  .customSetting({
    _quality: 2,
    reloadMultiplier: 1.8,
    hitColor: Color.valueOf("F4F7F8"),
    shootEffect: uranium.getEffect('ammo-aluminium-shot-small'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("E8EEF2"),
    trailEffect: uranium.getEffect('aluminium-trail'),
    trailChance: 0.18,
    trailInterval: 0,
    trailLength: 7,
    trailWidth: 1.05,
    trailRotation: true,
    lightColor: Color.valueOf("F4F7F8"),
    lightRadius: 10,
    lightOpacity: 0.13,
    hitEffect: uranium.getEffect('aluminium-hit-small'),
    hitSound: ammoImpactSounds.aluminium.small,
    hitSoundVolume: 0.552,
    hitSoundPitchRange: 0.025,
    despawnEffect: Fx.none
  });

uranium //-------------| fire
  .createBullet("BasicBulletType", '9x18', {
    update(b) {
      this.super$update(b);
      if (b.timer.get(2)) {
        let
          rotation = b.rotation() + (b.time % 4 > 1.98 ? 10 : -10);

        b.vel.setAngle(Mathf.slerpDelta(b.rotation(), rotation, 10));
      }
    }
  })
  .ezAmmo("fire")
  .setBullet(135, 6, 22, 10)
  .setDrawBullet(0, "#F54C4C", "#FFFAFA", 5, 8)
  .customSetting({
    _quality: 1,
    status: StatusEffects.burning,
    hitColor: Color.valueOf("F54C4C"),
    shootEffect: uranium.getEffect('ammo-fire-shot-small'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("FF8A48"),
    trailEffect: uranium.getEffect('fire-trail'),
    trailChance: 0.14,
    trailInterval: 0,
    trailRotation: true,
    lightColor: Color.valueOf("F54C4C"),
    lightRadius: 16,
    lightOpacity: 0.24,
    hitEffect: uranium.getEffect('fire-hit-small'),
    // Safe MP3 replacement for the problematic short OGG impact sample.
    hitSound: ammoImpactSounds.fire.small,
    hitSoundVolume: 0.483,
    hitSoundPitchRange: 0.035,
    despawnEffect: Fx.none
  });

uranium //-------------| thorium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("thorium")
  .setBullet(200, 8, 19, 10)
  .setDrawBullet(0, "#FF79C3", "#FFC9F3", 5, 8)
  .customSetting({
    _quality: 4,
    reloadMultiplier: 0.75,
    knockback: 6,
    hitColor: Color.valueOf("FF79C3"),
    shootEffect: uranium.getEffect('ammo-thorium-shot-small'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("FF79C3"),
    trailEffect: uranium.getEffect('thorium-trail'),
    trailChance: 0.14,
    trailInterval: 0,
    trailLength: 7,
    trailWidth: 1.05,
    trailRotation: true,
    lightColor: Color.valueOf("FF79C3"),
    lightRadius: 16,
    lightOpacity: 0.22,
    hitEffect: uranium.getEffect('thorium-hit-small'),
    hitSound: ammoImpactSounds.thorium.small,
    hitSoundVolume: 0.552,
    hitSoundPitchRange: 0.025,
    despawnEffect: Fx.none
  });

uranium //-------------| exp
  .createBullet("BasicBulletType", '9x18', {
  })
  .ezAmmo("exp")
  .setBullet(82, 10, 17, 10, 95, 30)
  .setDrawBullet(0, "#ff7777", "#ff0000", 5.5, 9)
  .customSetting({
    _quality: 3,
    hitColor: Color.valueOf("D51D18"),
    shootEffect: uranium.getEffect('ammo-exp-shot-small'),
    smokeEffect: Fx.shootSmallSmoke,
    trailColor: Color.valueOf("D51D18"),
    trailEffect: Fx.none,
    trailChance: 0,
    trailInterval: 0,
    trailLength: 3,
    trailWidth: 0.75,
    trailRotation: true,
    lightColor: Color.valueOf("FF6C3C"),
    lightRadius: 13,
    lightOpacity: 0.10,
    hitEffect: uranium.getEffect('exp-hit-small'),
    hitSound: ammoImpactSounds.exp.small,
    hitSoundVolume: 0.455,
    hitSoundPitchRange: 0.035,
    despawnEffect: Fx.none
  });

uranium //-------------| altit
  .createBullet("BasicBulletType", '9x18', {
  })
  .ezAmmo("altit")
  .setBullet(0, 10, 17, 10, 55, 25)
  .setDrawBullet(0, "#BDEFFF", "#FDEFFF", 5, 9)
  .customSetting({
    _quality: 3,
    status: StatusEffects.shocked,
    pierceCap: 1,
    _expMultiplier: 4,
    hitColor: Color.valueOf("BDEFFF"),
    shootEffect: uranium.getEffect('ammo-electric-shot-small'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("BDEFFF"),
    trailEffect: Fx.none,
    trailChance: 0,
    trailInterval: 0,
    trailLength: 3,
    trailWidth: 0.70,
    trailRotation: true,
    lightColor: Color.valueOf("BDEFFF"),
    lightRadius: 16,
    lightOpacity: 0.13,
    hitEffect: uranium.getEffect('altit-hit-small'),
    hitSound: ammoImpactSounds.altit.small,
    hitSoundVolume: 0.580,
    hitSoundPitchRange: 0.025,
    despawnEffect: Fx.none
  });

uranium //-------------| blue-thorium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("blue-thorium")
  .setBullet(160, 12, 22, 10)
  .setDrawBullet(0, "#99FFFF", "#00FFFF", 5, 10)
  .customSetting({
    _quality: 3,
    reloadMultiplier: 1.7,
    homingPower: 9,
    homingRange: 20,
    knockback: 2,
    pierceCap: 1,
    hitColor: Color.valueOf("00DCEB"),
    shootEffect: uranium.getEffect('ammo-blue-thorium-shot-small'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("00DCEB"),
    trailEffect: Fx.none,
    trailChance: 0,
    trailInterval: 0,
    trailLength: 7,
    trailWidth: 1.05,
    trailRotation: true,
    lightColor: Color.valueOf("00DCEB"),
    lightRadius: 17,
    lightOpacity: 0.12,
    hitEffect: uranium.getEffect('blue-thorium-hit-small'),
    hitSound: ammoImpactSounds.blueThorium.small,
    hitSoundVolume: 0.497,
    hitSoundPitchRange: 0.020,
    despawnSound: ammoPostSounds.blueThoriumSmall,
    despawnEffect: uranium.getEffect('blue-thorium-hit-small')
  });

uranium //-------------| ultrafast
  .createBullet("BasicBulletType", '9x18', {
    update(b) {
      if (b.timer.get(1)) {
        if (Math.random() > 0.5 && b.time > 3) {
          b.x = b.x + Math.random() * 20 - 10;
          b.y = b.y + Math.random() * 20 - 10;
        }
      }
    }
  })
  .ezAmmo("ultrafast")
  .setBullet(25, 20, 13, 10)
  .setDrawBullet(0, "#FC9955", "#FCD975", 4.5, 13)
  .customSetting({
    _quality: 4,
    reloadMultiplier: 2.4,
    pierce: true,
    _expMultiplier: 0.5,
    hitColor: Color.valueOf("FC9955"),
    shootEffect: uranium.getEffect('ammo-phase-shot-small'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("FC9955"),
    trailEffect: uranium.getEffect('phase-trail'),
    trailChance: 0.12,
    trailInterval: 0,
    trailRotation: true,
    lightColor: Color.valueOf("FC9955"),
    lightRadius: 12,
    lightOpacity: 0.18,
    hitEffect: uranium.getEffect('phase-hit-small'),
    hitSound: ammoImpactSounds.ultrafast.small,
    hitSoundVolume: 0.552,
    hitSoundPitchRange: 0.018,
    despawnEffect: Fx.none
  });

uranium //-------------| uranium
  .createBullet("BasicBulletType", '9x18', {
    despawned(b) {
      this.super$despawned(b);
      uranium.vfxBudget.spawnEffect(
        uranium.getEffect('uranium-residue-small'),
        b.x, b.y, b.rotation(), this.hitColor, null,
        'residue', 4.0 / 15.0,
        b.id, 915, 15, 70
      );
    }
  })
  .ezAmmo("uranium")
  .setBullet(75, 6, 25, 10, 100, 30)
  .setDrawBullet(0, "#66ff66", "#00ff00", 5.5, 9)
  .customSetting({
    _quality: 4,
    shootEffect: uranium.getEffect('uranium-shot-small'),
    smokeEffect: Fx.none,
    hitEffect: uranium.getEffect('uranium-hit-small'),
    hitSound: ammoImpactSounds.uranium.small,
    hitSoundVolume: 0.497,
    hitSoundPitchRange: 0.030,
    despawnEffect: Fx.none,
    hitColor: Color.valueOf('8CFF66'),
    trailColor: Color.valueOf('73F55C'),
    trailEffect: Fx.none,
    trailChance: 0,
    trailInterval: 0,
    trailLength: 7,
    trailWidth: 1.8,
    lightColor: Color.valueOf('8CFF66'),
    lightRadius: 18,
    lightOpacity: 0.15,
    status: uranium.getSEffects('radiation'),
    fragBullets: 6,
    fragBullet: uranium.getBullet('uranium-small-frag')
  });

uranium //-------------| iridium
  .createBullet("BasicBulletType", '9x18', {})
  .setBullet(75, 20, 13, 10)
  .ezAmmo("iridium")
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 5.5, 11)
  .customSetting({
    _quality: 5,
    pierce: true,
    smokeEffect: Fx.none,
    hitColor: Color.valueOf("EAF7FF"),
    shootEffect: uranium.getEffect('ammo-iridium-shot-small'),
    trailColor: Color.valueOf("EAF7FF"),
    trailEffect: uranium.getEffect('iridium-trail'),
    trailChance: 0.16,
    trailInterval: 0,
    trailRotation: true,
    trailLength: 7,
    trailWidth: 1.05,
    lightColor: Color.valueOf("EAF7FF"),
    lightRadius: 11,
    lightOpacity: 0.15,
    hitEffect: uranium.getEffect('iridium-hit-small'),
    hitSound: ammoImpactSounds.iridium.small,
    hitSoundVolume: 0.511,
    hitSoundPitchRange: 0.018,
    despawnEffect: Fx.none
  });

uranium //-------------| tritium
  .createBullet("BasicBulletType", '9x18', {
  })
  .ezAmmo("tritium")
  .setBullet(0, 12, 11, 10, 175, 40)
  .setDrawBullet(0, "#ccff99", "#ccff00", 5.5, 11)
  .customSetting({
    _quality: 5,
    smokeEffect: Fx.none,
    fragBullets: 4,
    fragBullet: uranium.getBullet('lightining-small-frag'),
    hitColor: Color.valueOf("CCFF00"),
    shootEffect: uranium.getEffect('ammo-tritium-shot-small'),
    trailColor: Color.valueOf("CCFF00"),
    trailEffect: Fx.none,
    trailChance: 0,
    trailInterval: 0,
    trailLength: 3,
    trailWidth: 0.80,
    trailRotation: true,
    lightColor: Color.valueOf("CCFF00"),
    lightRadius: 17,
    lightOpacity: 0.14,
    hitEffect: uranium.getEffect('tritium-hit-small'),
    hitSound: ammoImpactSounds.tritium.small,
    hitSoundVolume: 0.552,
    hitSoundPitchRange: 0.025,
    despawnEffect: Fx.none
  });

uranium //-------------| iritrium
  .createBullet("BasicBulletType", '9x18', {
  })
  .ezAmmo("iritrium")
  .setBullet(0, 14, 11, 10, 260, 40)
  .setDrawBullet(0, "#E9FE31", "#F9FEC1", 5.5, 11)
  .customSetting({
    _quality: 5,
    hitColor: Color.valueOf("E9FE31"),
    shootEffect: uranium.getEffect('ammo-iritrium-shot-small'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("E9FE31"),
    trailEffect: Fx.none,
    trailChance: 0,
    trailInterval: 0,
    trailLength: 3,
    trailWidth: 0.75,
    trailRotation: true,
    lightColor: Color.valueOf("E9FE31"),
    lightRadius: 18,
    lightOpacity: 0.16,
    hitEffect: uranium.getEffect('iritrium-hit-small'),
    hitSound: ammoImpactSounds.iritrium.small,
    hitSoundVolume: 0.552,
    hitSoundPitchRange: 0.020,
    despawnEffect: Fx.none
  });
//-----------------------------------------| 12x108

uranium //-------------| firearm
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("firearm")
  .setBullet(220, 17, 18, 1)
  .setDrawBullet(0, "#F9f534", "FFFFFF", 6, 12)
  .customSetting({
    _quality: 1,
    _expMultiplier: 2,
    bulletHeight: 16,
    bulletWidth: 10,
    pierceCap: 1,
    hitColor: Color.valueOf("F1C60F"),
    shootEffect: uranium.getEffect('ammo-kinetic-shot-medium'),
    smokeEffect: Fx.shootSmallSmoke,
    trailColor: Color.valueOf("D6B64A"),
    trailEffect: uranium.getEffect('firearm-trail'),
    trailInterval: 2,
    trailRotation: true,
    lightColor: Color.valueOf("F1C60F"),
    lightRadius: 12,
    lightOpacity: 0.14,
    hitEffect: uranium.getEffect('firearm-hit-medium'),
    hitSound: ammoImpactSounds.firearm.medium,
    hitSoundVolume: 0.635,
    hitSoundPitchRange: 0.030,
    despawnEffect: Fx.none
  });

uranium //-------------| titanium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("titanium")
  .setBullet(260, 16, 22, 1)
  .setDrawBullet(0, "#2093FF", "#70f3FF", 5.5, 13)
  .customSetting({
    _quality: 2,
    reloadMultiplier: 1.3,
    knockback: 5,
    pierceCap: 1,
    hitColor: Color.valueOf("2093FF"),
    shootEffect: uranium.getEffect('ammo-titanium-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("2093FF"),
    trailEffect: uranium.getEffect('titanium-trail'),
    trailInterval: 1,
    trailRotation: true,
    trailLength: 4,
    trailWidth: 1.0,
    lightColor: Color.valueOf("2093FF"),
    lightRadius: 16,
    lightOpacity: 0.21,
    hitEffect: uranium.getEffect('titanium-hit-medium'),
    hitSound: ammoImpactSounds.titanium.medium,
    hitSoundVolume: 0.621,
    hitSoundPitchRange: 0.020,
    despawnEffect: Fx.none
  });

uranium //-------------| aluminium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("aluminium")
  .setBullet(200, 18, 18, 1)
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 5.5, 14)
  .customSetting({
    _quality: 2,
    reloadMultiplier: 1.9,
    knockback: 4,
    pierceCap: 2,
    hitColor: Color.valueOf("F4F7F8"),
    shootEffect: uranium.getEffect('ammo-aluminium-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("E8EEF2"),
    trailEffect: uranium.getEffect('aluminium-trail'),
    trailInterval: 1,
    trailRotation: true,
    trailLength: 5,
    trailWidth: 0.85,
    lightColor: Color.valueOf("F4F7F8"),
    lightRadius: 13,
    lightOpacity: 0.15,
    hitEffect: uranium.getEffect('aluminium-hit-medium'),
    hitSound: ammoImpactSounds.aluminium.medium,
    hitSoundVolume: 0.580,
    hitSoundPitchRange: 0.020,
    despawnEffect: Fx.none
  });

uranium //-------------| fire
  .createBullet("BasicBulletType", '12x108', {
    update(b) {
      this.super$update(b);
      if (b.timer.get(2)) {
        let
          rotation = b.rotation() + (b.time % 4 > 1.95 ? 15 : -15);

        b.vel.setAngle(Mathf.slerpDelta(b.rotation(), rotation, 10));
      }
    }
  })
  .ezAmmo("fire")
  .setBullet(195, 8, 27, 1)
  .setDrawBullet(0, "#F54C4C", "#FFFAFA", 6, 12)
  .customSetting({
    _quality: 1,
    status: StatusEffects.burning,
    pierceCap: 2,
    hitColor: Color.valueOf("F54C4C"),
    shootEffect: uranium.getEffect('ammo-fire-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("FF8A48"),
    trailEffect: uranium.getEffect('fire-trail'),
    trailInterval: 1,
    trailRotation: true,
    lightColor: Color.valueOf("F54C4C"),
    lightRadius: 20,
    lightOpacity: 0.28,
    hitEffect: uranium.getEffect('fire-hit-medium'),
    hitSound: ammoImpactSounds.fire.medium,
    hitSoundVolume: 0.593,
    hitSoundPitchRange: 0.030,
    despawnEffect: Fx.none
  });

uranium //-------------| thorium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("thorium")
  .setBullet(340, 9, 30, 1)
  .setDrawBullet(0, "#FF79C3", "#FFC9F3", 6, 11)
  .customSetting({
    _quality: 4,
    _expMultiplier: 1.5,
    reloadMultiplier: 0.75,
    knockback: 12,
    hitColor: Color.valueOf("FF79C3"),
    shootEffect: uranium.getEffect('ammo-thorium-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("FF79C3"),
    trailEffect: uranium.getEffect('thorium-trail'),
    trailInterval: 2,
    trailRotation: true,
    trailLength: 5,
    trailWidth: 1.25,
    lightColor: Color.valueOf("FF79C3"),
    lightRadius: 21,
    lightOpacity: 0.26,
    hitEffect: uranium.getEffect('thorium-hit-medium'),
    hitSound: ammoImpactSounds.thorium.medium,
    hitSoundVolume: 0.662,
    hitSoundPitchRange: 0.020,
    despawnEffect: Fx.none
  });


uranium //-------------| exp
  .createBullet("BasicBulletType", '12x108', {
  })
  .ezAmmo("exp")
  .setBullet(87, 11, 26, 1, 110, 35)
  .setDrawBullet(0, "#ff9999", "#ff0000", 6, 12)
  .customSetting({
    _quality: 3,
    fragBullets: 20,
    fragBullet:
      uranium
        .createBullet("BasicBulletType", "", {})
        .setBullet(8, 5, 10, 1)
        .setDrawBullet(0, "#ff9999", "#ff0000", 3, 3)
        .customSetting({
          pierce: true,
          hitColor: Color.valueOf("D51D18"),
          trailColor: Color.valueOf("D51D18"),
          trailEffect: Fx.none,
          trailInterval: 0,
          trailRotation: true,
          hitEffect: uranium.getEffect('exp-shrapnel-hit'),
          despawnEffect: Fx.none,
          smokeEffect: Fx.none
        })
        .const,
    hitColor: Color.valueOf("D51D18"),
    shootEffect: uranium.getEffect('ammo-exp-shot-medium'),
    smokeEffect: Fx.shootSmallSmoke,
    trailColor: Color.valueOf("D51D18"),
    trailEffect: Fx.none,
    trailInterval: 0,
    trailLength: 5,
    trailWidth: 1.00,
    trailRotation: true,
    lightColor: Color.valueOf("FF6C3C"),
    lightRadius: 16,
    lightOpacity: 0.15,
    hitEffect: uranium.getEffect('exp-hit-medium'),
    hitSound: ammoImpactSounds.exp.medium,
    hitSoundVolume: 0.552,
    hitSoundPitchRange: 0.025,
    despawnEffect: Fx.none
  });

uranium //-------------| altit
  .createBullet("BasicBulletType", '12x108', {
  })
  .ezAmmo("altit")
  .setBullet(0, 19, 20, 1, 105, 30)
  .setDrawBullet(0, "#BDEFFF", "#FDEFFF", 6, 13)
  .customSetting({
    _quality: 3,
    status: StatusEffects.shocked,
    pierceCap: 4,
    hitColor: Color.valueOf("BDEFFF"),
    shootEffect: uranium.getEffect('ammo-electric-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("BDEFFF"),
    trailEffect: Fx.none,
    trailInterval: 0,
    trailRotation: true,
    trailLength: 4,
    trailWidth: 1.0,
    lightColor: Color.valueOf("BDEFFF"),
    lightRadius: 21,
    lightOpacity: 0.20,
    hitEffect: uranium.getEffect('altit-hit-medium'),
    hitSound: ammoImpactSounds.altit.medium,
    hitSoundVolume: 0.690,
    hitSoundPitchRange: 0.020,
    despawnEffect: Fx.none
  });

uranium //-------------| blue-thorium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("blue-thorium")
  .setBullet(450, 20, 17, 1)
  .setDrawBullet(0, "#99FFFF", "#00FFFF", 5.5, 15)
  .customSetting({
    _quality: 3,
    reloadMultiplier: 1.5,
    knockback: 6,
    bulletShrink: -20,
    homingPower: 42,
    homingRange: 17,
    pierceCap: 3,
    hitColor: Color.valueOf("00DCEB"),
    shootEffect: uranium.getEffect('ammo-blue-thorium-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("00DCEB"),
    trailEffect: Fx.none,
    trailInterval: 0,
    trailRotation: true,
    trailLength: 6,
    trailWidth: 1.15,
    lightColor: Color.valueOf("00DCEB"),
    lightRadius: 22,
    lightOpacity: 0.18,
    hitEffect: uranium.getEffect('blue-thorium-hit-medium'),
    hitSound: ammoImpactSounds.blueThorium.medium,
    hitSoundVolume: 0.607,
    hitSoundPitchRange: 0.018,
    despawnSound: ammoPostSounds.blueThoriumMedium,
    despawnEffect: uranium.getEffect('blue-thorium-hit-medium')
  });

uranium //-------------| ultrafast
  .createBullet("BasicBulletType", '12x108', {
    update(b) {
      if (b.timer.get(1)) {
        if (Math.random() > 0.4 && b.time > 2) {
          b.x = b.x + Math.random() * 40 - 20;
          b.y = b.y + Math.random() * 40 - 20;
        }
      }
    }
  })
  .ezAmmo("ultrafast")
  .setBullet(170, 30, 10, 1)
  .setDrawBullet(0, "#FC9955", "#FCD975", 5, 16)
  .customSetting({
    _quality: 4,
    reloadMultiplier: 2.3,
    pierce: true,
    hitColor: Color.valueOf("FC9955"),
    shootEffect: uranium.getEffect('ammo-phase-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("FC9955"),
    trailEffect: uranium.getEffect('phase-trail'),
    trailInterval: 1,
    trailRotation: true,
    lightColor: Color.valueOf("FC9955"),
    lightRadius: 14,
    lightOpacity: 0.20,
    hitEffect: uranium.getEffect('phase-hit-medium'),
    hitSound: ammoImpactSounds.ultrafast.medium,
    hitSoundVolume: 0.621,
    hitSoundPitchRange: 0.015,
    despawnEffect: Fx.none
  });

uranium //-------------| uranium
  .createBullet("BasicBulletType", '12x108', {
    despawned(b) {
      this.super$despawned(b);
      uranium.vfxBudget.spawnEffect(
        uranium.getEffect('uranium-residue-medium'),
        b.x, b.y, b.rotation(), this.hitColor, null,
        'residue', 5.0 / 10.0,
        b.id, 1271, 10, 120
      );
    }
  })
  .ezAmmo("uranium")
  .setBullet(60, 11, 17, 1, 90, 35)
  .setDrawBullet(0, "#99b979", "#75b870", 6.5, 15)
  .customSetting({
    _quality: 4,
    shootEffect: uranium.getEffect('uranium-shot-medium'),
    smokeEffect: Fx.none,
    hitEffect: uranium.getEffect('uranium-hit-medium'),
    hitSound: ammoImpactSounds.uranium.medium,
    hitSoundVolume: 0.607,
    hitSoundPitchRange: 0.025,
    despawnEffect: Fx.none,
    hitColor: Color.valueOf('8CFF66'),
    trailColor: Color.valueOf('73F55C'),
    trailEffect: Fx.none,
    trailInterval: 0,
    trailLength: 10,
    trailWidth: 2.3,
    lightColor: Color.valueOf('8CFF66'),
    lightRadius: 24,
    lightOpacity: 0.26,
    status: uranium.getSEffects('radiation'),
    fragBullets: 3,
    fragBullet: uranium.getBullet('uranium-medium-frag')
  });

uranium //-------------| iridium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("iridium")
  .setBullet(300, 24, 14, 1)
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 6, 16)
  .customSetting({
    _quality: 5,
    pierce: true,
    hitColor: Color.valueOf("EAF7FF"),
    shootEffect: uranium.getEffect('ammo-iridium-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("EAF7FF"),
    trailEffect: uranium.getEffect('iridium-trail'),
    trailInterval: 1,
    trailRotation: true,
    trailLength: 8,
    trailWidth: 0.9,
    lightColor: Color.valueOf("EAF7FF"),
    lightRadius: 14,
    lightOpacity: 0.18,
    hitEffect: uranium.getEffect('iridium-hit-medium'),
    hitSound: ammoImpactSounds.iridium.medium,
    hitSoundVolume: 0.621,
    hitSoundPitchRange: 0.015,
    despawnEffect: Fx.none
  });

uranium //-------------| tritium
  .createBullet("BasicBulletType", '12x108', {
  })
  .ezAmmo("tritium")
  .setBullet(0, 12, 12, 1, 222, 50)
  .setDrawBullet(0, "#ccff99", "#ccff00", 6.5, 15)
  .customSetting({
    _quality: 5,
    fragBullets: 4,
    fragBullet: uranium.getBullet('lightining-medium-frag'),
    hitColor: Color.valueOf("CCFF00"),
    shootEffect: uranium.getEffect('ammo-tritium-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("CCFF00"),
    trailEffect: Fx.none,
    trailInterval: 0,
    trailRotation: true,
    trailLength: 5,
    trailWidth: 1.2,
    lightColor: Color.valueOf("CCFF00"),
    lightRadius: 22,
    lightOpacity: 0.20,
    hitEffect: uranium.getEffect('tritium-hit-medium'),
    hitSound: ammoImpactSounds.tritium.medium,
    hitSoundVolume: 0.580,
    hitSoundPitchRange: 0.020,
    despawnEffect: Fx.none
  });

uranium //-------------| iritrium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("iritrium")
  .setBullet(0, 14, 17, 1, 390, 60)
  .setDrawBullet(0, "#E9FE31", "#F9FEC1", 6.5, 15)
  .customSetting({
    _quality: 5,
    hitColor: Color.valueOf("E9FE31"),
    shootEffect: uranium.getEffect('ammo-iritrium-shot-medium'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("E9FE31"),
    trailEffect: uranium.getEffect('iritrium-trail'),
    trailInterval: 1,
    trailRotation: true,
    trailLength: 6,
    trailWidth: 1.15,
    lightColor: Color.valueOf("E9FE31"),
    lightRadius: 23,
    lightOpacity: 0.34,
    hitEffect: uranium.getEffect('iritrium-hit-medium'),
    hitSound: ammoImpactSounds.iritrium.medium,
    hitSoundVolume: 0.593,
    hitSoundPitchRange: 0.018,
    despawnEffect: Fx.none
  });

//Другое

// --------------------/ Арта
uranium//-------------| Обычное
  .createBullet("ArtilleryBulletType", '30x173', {
    despawnEffect: uranium.getEffect('exploz_30x173'),
  })
  .setAmmo('firearm_ART_round')
  .setBullet(0, 5, 100, 1, 170, 55)
  .setDrawBullet(0, "#fcfcfc", "#ffe100", 14, 24)
  .customSetting({
    _quality: 1,
    _expMultiplier: 2,
    hitColor: Color.valueOf("F1C60F"),
    shootEffect: uranium.getEffect('ammo-kinetic-shot-large'),
    smokeEffect: Fx.shootBigSmoke2,
    trailColor: Color.valueOf("D6B64A"),
    trailEffect: uranium.getEffect('firearm-trail'),
    trailRotation: true,
    trailMult: 0.95,
    lightColor: Color.valueOf("F1C60F"),
    lightRadius: 18,
    lightOpacity: 0.16,
    hitEffect: uranium.getEffect('firearm-hit-large'),
    hitSound: ammoImpactSounds.firearm.large,
    hitSoundVolume: 0.856,
    hitSoundPitchRange: 0.020,
    despawnEffect: Fx.none
  });

uranium//-------------| Титаниум
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('titanium_ART_round')
  .setBullet(0, 5.5, 1, 1, 200, 60)
  .setDrawBullet(0, "#2093FF", "#70f3FF", 14, 26)
  .customSetting({
    _quality: 2,
    reloadMultiplier: 1.2,
    hitColor: Color.valueOf("2093FF"),
    shootEffect: uranium.getEffect('ammo-titanium-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("2093FF"),
    trailEffect: uranium.getEffect('titanium-trail'),
    trailRotation: true,
    trailLength: 9,
    trailWidth: 1.8,
    trailMult: 0.85,
    lightColor: Color.valueOf("2093FF"),
    lightRadius: 25,
    lightOpacity: 0.25,
    hitEffect: uranium.getEffect('titanium-hit-large'),
    hitSound: ammoImpactSounds.titanium.large,
    hitSoundVolume: 0.856,
    hitSoundPitchRange: 0.015,
    despawnEffect: Fx.none
  });

uranium//-------------| aluminium
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('aluminium_ART_round')
  .setBullet(0, 6, 1, 1, 215, 60)
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 13.5, 27)
  .customSetting({
    _quality: 2,
    reloadMultiplier: 1.3,
    hitColor: Color.valueOf("F4F7F8"),
    shootEffect: uranium.getEffect('ammo-aluminium-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("E8EEF2"),
    trailEffect: uranium.getEffect('aluminium-trail'),
    trailRotation: true,
    trailLength: 10,
    trailWidth: 1.4,
    trailMult: 0.82,
    lightColor: Color.valueOf("F4F7F8"),
    lightRadius: 21,
    lightOpacity: 0.19,
    hitEffect: uranium.getEffect('aluminium-hit-large'),
    hitSound: ammoImpactSounds.aluminium.large,
    hitSoundVolume: 0.787,
    hitSoundPitchRange: 0.015,
    despawnEffect: Fx.none
  });

uranium//-------------| fire
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('fire_ART_round')
  .setBullet(0, 5, 1, 1, 140, 75)
  .setDrawBullet(0, "#F54C4C", "#FFFAFA", 14, 25)
  .customSetting({
    _quality: 1,
    status: StatusEffects.burning,
    hitColor: Color.valueOf("F54C4C"),
    shootEffect: uranium.getEffect('ammo-fire-shot-large'),
    smokeEffect: Fx.shootBigSmoke2,
    trailColor: Color.valueOf("FF8A48"),
    trailEffect: uranium.getEffect('fire-trail'),
    trailRotation: true,
    trailMult: 0.72,
    lightColor: Color.valueOf("F54C4C"),
    lightRadius: 30,
    lightOpacity: 0.35,
    hitEffect: uranium.getEffect('fire-hit-large'),
    hitSound: ammoImpactSounds.fire.large,
    hitSoundVolume: 0.773,
    hitSoundPitchRange: 0.020,
    despawnEffect: Fx.none
  });

uranium//-------------| Thorium
  .createBullet("ArtilleryBulletType", '30x173', {
    despawnEffect: uranium.getEffect('exploz_30x173'),
  })
  .setAmmo('thorium_ART_round')
  .setBullet(0, 4.5, 1, 1, 275, 70)
  .setDrawBullet(0, "#FF79C3", "#FFC9F3", 15, 24)
  .customSetting({
    _quality: 4,
    _expMultiplier: 1.3,
    reloadMultiplier: 0.8,
    hitColor: Color.valueOf("FF79C3"),
    shootEffect: uranium.getEffect('ammo-thorium-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("FF79C3"),
    trailEffect: uranium.getEffect('thorium-trail'),
    trailRotation: true,
    trailLength: 10,
    trailWidth: 2.0,
    trailMult: 0.78,
    lightColor: Color.valueOf("FF79C3"),
    lightRadius: 31,
    lightOpacity: 0.34,
    hitEffect: uranium.getEffect('thorium-hit-large'),
    hitSound: ammoImpactSounds.thorium.large,
    hitSoundVolume: 0.897,
    hitSoundPitchRange: 0.015,
    despawnEffect: Fx.none
  });

uranium//-------------| Взрывные
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('exp_ART_round')
  .setBullet(0, 5, 100, 1, 125, 75)
  .setDrawBullet(0, "#Ff4a2a", "#Ff9191", 13, 24)
  .customSetting({
    _quality: 3,
    fragBullets: 10,
    fragBullet:
      uranium
        .createBullet("BasicBulletType", "", {})
        .setBullet(165, 3, 17)
        .setDrawBullet(0, "#ff0000", "#ff0000", 3, 3)
        .customSetting({
          pierce: true,
          hitColor: Color.valueOf("D51D18"),
          trailColor: Color.valueOf("D51D18"),
          trailEffect: Fx.none,
          trailInterval: 0,
          trailRotation: true,
          hitEffect: uranium.getEffect('exp-shrapnel-hit'),
          despawnEffect: Fx.none,
          smokeEffect: Fx.none
        })
        .const,
    hitColor: Color.valueOf("D51D18"),
    shootEffect: uranium.getEffect('ammo-exp-shot-large'),
    smokeEffect: Fx.shootBigSmoke2,
    trailColor: Color.valueOf("D51D18"),
    trailEffect: uranium.getEffect('exp-trail'),
    trailRotation: true,
    trailMult: 0.75,
    lightColor: Color.valueOf("FF6C3C"),
    lightRadius: 28,
    lightOpacity: 0.30,
    hitEffect: uranium.getEffect('exp-hit-large'),
    hitSound: ammoImpactSounds.exp.large,
    hitSoundVolume: 0.676,
    hitSoundPitchRange: 0.015,
    despawnEffect: Fx.none
  });

uranium//-------------| altit
  .createBullet("ArtilleryBulletType", '30x173', {
    despawnEffect: uranium.getEffect('exploz_30x173'),
  })
  .setAmmo('altit_ART_round')
  .setBullet(0, 4.5, 1, 1, 180, 65)
  .setDrawBullet(0, "#BDEFFF", "#FDEFFF", 16, 25)
  .customSetting({
    _quality: 3,
    _expMultiplier: 4,
    status: StatusEffects.shocked,
    hitColor: Color.valueOf("BDEFFF"),
    shootEffect: uranium.getEffect('ammo-electric-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("BDEFFF"),
    trailEffect: uranium.getEffect('altit-trail'),
    trailRotation: true,
    trailLength: 8,
    trailWidth: 1.7,
    trailMult: 0.78,
    lightColor: Color.valueOf("BDEFFF"),
    lightRadius: 31,
    lightOpacity: 0.36,
    hitEffect: uranium.getEffect('altit-hit-large'),
    hitSound: ammoImpactSounds.altit.large,
    hitSoundVolume: 0.800,
    hitSoundPitchRange: 0.015,
    despawnEffect: Fx.none
  });

uranium//-------------| blue-thorium
  .createBullet("ArtilleryBulletType", '30x173', {
    despawnEffect: uranium.getEffect('exploz_30x173'),
  })
  .setAmmo('blue-thorium_ART_round')
  .setBullet(0, 6, 1, 1, 230, 70)
  .setDrawBullet(0, "#99FFFF", "#00FFFF", 15, 27)
  .customSetting({
    _quality: 3,
    reloadMultiplier: 1.2,
    homingPower: 8,
    homingRange: 70,
    knockback: 6,
    hitColor: Color.valueOf("00DCEB"),
    shootEffect: uranium.getEffect('ammo-blue-thorium-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("00DCEB"),
    trailEffect: uranium.getEffect('blue-thorium-trail'),
    trailRotation: true,
    trailLength: 11,
    trailWidth: 2.0,
    trailMult: 0.76,
    lightColor: Color.valueOf("00DCEB"),
    lightRadius: 32,
    lightOpacity: 0.36,
    hitEffect: uranium.getEffect('blue-thorium-hit-large'),
    hitSound: ammoImpactSounds.blueThorium.large,
    hitSoundVolume: 0.814,
    hitSoundPitchRange: 0.012,
    despawnEffect: Fx.none
  });

uranium//-------------| ultrafast
  .createBullet("ArtilleryBulletType", '30x173', {
    update(b) {
      if (b.timer.get(1)) {
        if (Math.random() > 0.6 && b.time > 2) {
          b.x = b.x + Math.random() * 42 - 21;
          b.y = b.y + Math.random() * 42 - 21;
        }
      }
    },
    despawnEffect: uranium.getEffect('exploz_30x173'),
  })
  .setAmmo('ultrafast_ART_round')
  .setBullet(0, 8, 1, 1, 545, 45)
  .setDrawBullet(0, "#FC9955", "#FCD975", 13, 28)
  .customSetting({
    _quality: 4,
    reloadMultiplier: 1.7,
    pierce: true,
    hitColor: Color.valueOf("FC9955"),
    shootEffect: uranium.getEffect('ammo-phase-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("FC9955"),
    trailEffect: uranium.getEffect('phase-trail'),
    trailRotation: true,
    trailMult: 0.55,
    lightColor: Color.valueOf("FC9955"),
    lightRadius: 24,
    lightOpacity: 0.26,
    hitEffect: uranium.getEffect('phase-hit-large'),
    hitSound: ammoImpactSounds.ultrafast.large,
    hitSoundVolume: 0.800,
    hitSoundPitchRange: 0.012,
    despawnEffect: Fx.none
  });

uranium//-------------| uranium
  .createBullet("ArtilleryBulletType", '30x173', {
    update(b) {
      // Built-in Trail geometry is not an EffectState and therefore is not part
      // of the spawn budget. Keep it rich; spawned trail Effects are proxy-gated.
      this.super$update(b);
    },
    despawned(b) {
      this.super$despawned(b);
      uranium.vfxBudget.spawnEffect(
        uranium.getEffect('uranium-residue-artillery'),
        b.x, b.y, b.rotation(), this.hitColor, null,
        'residue', 8.0 / 10.0,
        b.id, 30173, 10, 150
      );
    }
  })
  .setAmmo('uranium_ART_round')
  .setBullet(480, 4, 80, 1, 85, 80)
  .setDrawBullet(0, "#00ff00", "#66ff66", 15, 28)
  .customSetting({
    status: uranium.getSEffects('radiation'),
    fragBullets: 16,
    _quality: 4,
    reloadMultiplier: 0.9,
    shootEffect: uranium.getEffect('uranium-shot-large'),
    smokeEffect: Fx.none,
    hitEffect: uranium.getEffect('uranium-hit-large'),
    hitSound: ammoImpactSounds.uranium.large,
    hitSoundVolume: 0.787,
    hitSoundPitchRange: 0.018,
    despawnEffect: Fx.none,
    hitColor: Color.valueOf('8CFF66'),
    trailColor: Color.valueOf('73F55C'),
    trailEffect: uranium.getEffect('uranium-trail-large'),
    trailLength: 18,
    trailWidth: 3.2,
    trailMult: 0.9,
    lightColor: Color.valueOf('8CFF66'),
    lightRadius: 42,
    lightOpacity: 0.55,
    fragBullet: uranium.getBullet('uranium-medium-frag')
  });

uranium//-------------| iridium
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('iridium_ART_round')
  .setBullet(480, 7, 80, 1, 1100, 30)
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 14, 27)
  .customSetting({
    _quality: 5,
    pierce: true,
    hitColor: Color.valueOf("EAF7FF"),
    shootEffect: uranium.getEffect('ammo-iridium-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("EAF7FF"),
    trailEffect: uranium.getEffect('iridium-trail'),
    trailRotation: true,
    trailLength: 18,
    trailWidth: 1.4,
    trailMult: 0.60,
    lightColor: Color.valueOf("EAF7FF"),
    lightRadius: 28,
    lightOpacity: 0.28,
    hitEffect: uranium.getEffect('iridium-hit-large'),
    hitSound: ammoImpactSounds.iridium.large,
    hitSoundVolume: 0.883,
    hitSoundPitchRange: 0.010,
    despawnEffect: Fx.none
  });

uranium//-------------| tritium
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('tritium_ART_round')
  .setBullet(480, 4, 80, 1, 320, 70)
  .setDrawBullet(0, "#ccff99", "#ccff00", 15, 28)
  .customSetting({
    _quality: 5,
    fragBullets: 8,
    fragBullet: uranium.getBullet('lightining-big-frag'),
    pierce: true,
    hitColor: Color.valueOf("CCFF00"),
    shootEffect: uranium.getEffect('ammo-tritium-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("CCFF00"),
    trailEffect: uranium.getEffect('tritium-trail'),
    trailRotation: true,
    trailLength: 10,
    trailWidth: 2.1,
    trailMult: 0.72,
    lightColor: Color.valueOf("CCFF00"),
    lightRadius: 34,
    lightOpacity: 0.42,
    hitEffect: uranium.getEffect('tritium-hit-large'),
    hitSound: ammoImpactSounds.tritium.large,
    hitSoundVolume: 0.800,
    hitSoundPitchRange: 0.015,
    despawnEffect: Fx.none
  });

uranium//-------------| iritrium
  .createBullet("ArtilleryBulletType", '30x173', {
    despawnEffect: uranium.getEffect('exploz_30x173')
  })
  .setAmmo('iritrium_ART_round')
  .setBullet(480, 6, 80, 1, 120, 70)
  .setDrawBullet(0, "#E9FE31", "#F9FEC1", 15, 28)
  .customSetting({
    _quality: 5,
    fragBullets: 4,
    fragBullet: uranium
      .createBullet("BasicBulletType", '', {})
      .setBullet(0, 7.5, 3, 1, 160, 50)
      .setDrawBullet(0, "#E9FE31", "#F9FEC1", 6.5, 15)
      .customSetting({
        hitColor: Color.valueOf("E9FE31"),
        trailColor: Color.valueOf("E9FE31"),
        trailEffect: uranium.getEffect('iritrium-frag-trail'),
        trailInterval: 1,
        trailRotation: true,
        lightColor: Color.valueOf("E9FE31"),
        lightRadius: 17,
        lightOpacity: 0.28,
        hitEffect: uranium.getEffect('iritrium-frag-hit'),
        despawnEffect: Fx.none,
        smokeEffect: Fx.none
      }).const,
    pierce: true,
    hitColor: Color.valueOf("E9FE31"),
    shootEffect: uranium.getEffect('ammo-iritrium-shot-large'),
    smokeEffect: Fx.none,
    trailColor: Color.valueOf("E9FE31"),
    trailEffect: uranium.getEffect('iritrium-trail'),
    trailRotation: true,
    trailLength: 11,
    trailWidth: 2.0,
    trailMult: 0.72,
    lightColor: Color.valueOf("E9FE31"),
    lightRadius: 34,
    lightOpacity: 0.40,
    hitEffect: uranium.getEffect('iritrium-hit-large'),
    hitSound: ammoImpactSounds.iritrium.large,
    hitSoundVolume: 0.828,
    hitSoundPitchRange: 0.012,
    despawnEffect: Fx.none
  });



//Другое

uranium //-------------| Рельса
  .createBullet("BasicBulletType", 'relsa', {})
  .setAmmo('armatura')
  .setBullet(380, 19.2, 20)
  .setDrawBullet('uranium-mod-armatura_bullet', "#6b75dc", "#cccccc", 6.5, 45)
  .customSetting({
    pierce: true,
    pierceCap: 3
  });

uranium //-------------| Звезда / Plasma turret "Druzhba"
  .createBullet("BasicBulletType", 'zvezda', {
    draw(b) {
      drawEnergyPlasmaOrb.call(this, b,
        uranium.getRuntimeColor('76FF72'), uranium.getRuntimeColor('32B85D'), uranium.getRuntimeColor('D9FF8C'),
        3.6, 0.72, 0.12, 0);
    },
    getPreperedBullet() {
      return uranium
        .createBullet("BasicBulletType", 'p_zvezda', {
          draw(b) {
            drawEnergyPlasmaOrb.call(this, b,
              uranium.getRuntimeColor('C7FF7A'), uranium.getRuntimeColor('49D965'), uranium.getRuntimeColor('FFF08A'),
              7.2, 0.92, 0.10, 1);
          }
        })
        .setBullet(385, 7, 30)
        .customSetting({
          pierce: true,
          pierceCap: 3,
          shootEffect: uranium.getEffect('energy-plasma-muzzle-green-over'),
          smokeEffect: Fx.none,
          trailEffect: uranium.getEffect('energy-plasma-trail-green-over'),
          trailInterval: 1.4,
          trailRotation: true,
          trailColor: Color.valueOf('A7FF73'),
          trailLength: 18,
          trailWidth: 4.3,
          lightColor: Color.valueOf('A7FF73'),
          lightRadius: 54,
          lightOpacity: 0.82,
          hitColor: Color.valueOf('B7FF78'),
          hitEffect: uranium.getEffect('energy-plasma-hit-green-over'),
          despawnEffect: uranium.getEffect('energy-plasma-dissipate-green-over'),
          shootSound: energyWeaponSounds.plasmaDruzhbaPrepared,
          hitSound: energyWeaponSounds.plasmaDruzhbaHitPrepared,
          hitSoundVolume: 0.94,
          hitSoundPitchRange: 0.025
        }).const;
    },
    getExtraTypes(name) {
      return this.extraType[name];
    },
    extraType: {
      'zvezda_legend': uranium
        .createBullet("BasicBulletType", 'p_p', {
          draw(b) {
            drawEnergyPlasmaOrb.call(this, b,
              uranium.getRuntimeColor('78FF67'), uranium.getRuntimeColor('3BBD62'), uranium.getRuntimeColor('B886FF'),
              3.9, 1.12, 0.02, 0);
          },
          getPreperedBullet() {
            return uranium
              .createBullet("BasicBulletType", 'p_p', {
                draw(b) {
                  drawEnergyPlasmaOrb.call(this, b,
                    uranium.getRuntimeColor('B7FF69'), uranium.getRuntimeColor('45D068'), uranium.getRuntimeColor('C69AFF'),
                    7.8, 1.28, 0.02, 1);
                }
              })
              .setBullet(385, 8, 26)
              .customSetting({
                pierce: true,
                pierceCap: 2,
                status: uranium.getSEffects('radiation'),
                shootEffect: uranium.getEffect('energy-plasma-muzzle-legend-over'),
                smokeEffect: Fx.none,
                trailEffect: uranium.getEffect('energy-plasma-trail-legend-over'),
                trailInterval: 1.25,
                trailRotation: true,
                trailColor: Color.valueOf('95FF69'),
                trailLength: 20,
                trailWidth: 4.7,
                lightColor: Color.valueOf('8EFF70'),
                lightRadius: 58,
                lightOpacity: 0.86,
                hitColor: Color.valueOf('8FFF67'),
                hitEffect: uranium.getEffect('energy-plasma-hit-legend-over'),
                despawnEffect: uranium.getEffect('energy-plasma-dissipate-legend-over'),
                shootSound: energyWeaponSounds.plasmaLegendPrepared,
                hitSound: energyWeaponSounds.plasmaLegendHitPrepared,
                hitSoundVolume: 0.95,
                hitSoundPitchRange: 0.022
              }).const;
          }
        })
        .setBullet(330, 7.5, 28)
        .customSetting({
          pierce: false,
          status: uranium.getSEffects('radiation'),
          shootEffect: uranium.getEffect('energy-plasma-muzzle-legend'),
          smokeEffect: Fx.none,
          chargeEffect: Fx.none,
          trailEffect: uranium.getEffect('energy-plasma-trail-legend'),
          trailInterval: 1.7,
          trailRotation: true,
          trailColor: Color.valueOf('7BFF70'),
          trailLength: 10,
          trailWidth: 2.35,
          lightColor: Color.valueOf('7BFF70'),
          lightRadius: 29,
          lightOpacity: 0.60,
          hitColor: Color.valueOf('83FF65'),
          hitEffect: uranium.getEffect('energy-plasma-hit-legend'),
          despawnEffect: uranium.getEffect('energy-plasma-dissipate-legend'),
          shootSound: energyWeaponSounds.plasmaLegend,
          hitSound: energyWeaponSounds.plasmaLegendHit,
          hitSoundVolume: 0.90,
          hitSoundPitchRange: 0.025
        }).const,
      'pure_plasm': uranium
        .createBullet("BasicBulletType", 'p_p', {
          draw(b) {
            drawEnergyPlasmaOrb.call(this, b,
              uranium.getRuntimeColor('D8FAFF'), uranium.getRuntimeColor('62B8FF'), uranium.getRuntimeColor('FFFFFF'),
              3.7, 0.24, 1.0, 0);
          },
          getPreperedBullet() {
            return uranium
              .createBullet("BasicBulletType", 'p_p', {
                draw(b) {
                  drawEnergyPlasmaOrb.call(this, b,
                    uranium.getRuntimeColor('F2FFFF'), uranium.getRuntimeColor('77CFFF'), uranium.getRuntimeColor('FFFFFF'),
                    7.4, 0.20, 1.0, 1);
                }
              })
              .setBullet(430, 8, 26)
              .customSetting({
                pierce: true,
                pierceCap: 4,
                shootEffect: uranium.getEffect('energy-plasma-muzzle-pure-over'),
                smokeEffect: Fx.none,
                trailEffect: uranium.getEffect('energy-plasma-trail-pure-over'),
                trailInterval: 1.25,
                trailRotation: true,
                trailColor: Color.valueOf('BDEEFF'),
                trailLength: 22,
                trailWidth: 4.4,
                lightColor: Color.valueOf('D8FAFF'),
                lightRadius: 62,
                lightOpacity: 0.90,
                hitColor: Color.valueOf('D9FAFF'),
                hitEffect: uranium.getEffect('energy-plasma-hit-pure-over'),
                despawnEffect: uranium.getEffect('energy-plasma-dissipate-pure-over'),
                shootSound: energyWeaponSounds.plasmaPurePrepared,
                hitSound: energyWeaponSounds.plasmaPureHitPrepared,
                hitSoundVolume: 0.96,
                hitSoundPitchRange: 0.018
              }).const;
          }
        })
        .setBullet(400, 7.5, 28)
        .customSetting({
          pierce: false,
          shootEffect: uranium.getEffect('energy-plasma-muzzle-pure'),
          smokeEffect: Fx.none,
          chargeEffect: Fx.none,
          trailEffect: uranium.getEffect('energy-plasma-trail-pure'),
          trailInterval: 1.6,
          trailRotation: true,
          trailColor: Color.valueOf('A9E8FF'),
          trailLength: 11,
          trailWidth: 2.20,
          lightColor: Color.valueOf('C8F4FF'),
          lightRadius: 31,
          lightOpacity: 0.68,
          hitColor: Color.valueOf('C7F5FF'),
          hitEffect: uranium.getEffect('energy-plasma-hit-pure'),
          despawnEffect: uranium.getEffect('energy-plasma-dissipate-pure'),
          shootSound: energyWeaponSounds.plasmaPure,
          hitSound: energyWeaponSounds.plasmaPureHit,
          hitSoundVolume: 0.92,
          hitSoundPitchRange: 0.020
        }).const
    }
  })
  .setBullet(340, 7, 30)
  .customSetting({
    pierce: false,
    shootEffect: uranium.getEffect('energy-plasma-muzzle-green'),
    smokeEffect: Fx.none,
    chargeEffect: Fx.none,
    trailEffect: uranium.getEffect('energy-plasma-trail-green'),
    trailInterval: 1.8,
    trailRotation: true,
    trailColor: Color.valueOf('77FF71'),
    trailLength: 9,
    trailWidth: 2.15,
    lightColor: Color.valueOf('8BFF75'),
    lightRadius: 27,
    lightOpacity: 0.58,
    hitColor: Color.valueOf('8FFF70'),
    hitEffect: uranium.getEffect('energy-plasma-hit-green'),
    despawnEffect: uranium.getEffect('energy-plasma-dissipate-green'),
    shootSound: energyWeaponSounds.plasmaDruzhba,
    hitSound: energyWeaponSounds.plasmaDruzhbaHit,
    hitSoundVolume: 0.90,
    hitSoundPitchRange: 0.028
  });

uranium //-------------| Даль — coherent laser
  .createLaserBulet("LaserBulletType", 'dalh', {
    colors: [
      Color.valueOf('#4BFF7A55'),
      Color.valueOf('#7CFF9A99'),
      Color.valueOf('#B8FFB7DD'),
      Color.valueOf('#F4FFF2')],
    strokes: [0.30, 0.52, 0.92, 1.28],
    length: 165,
    beamWidthFactor: 1.08,
    beamSparkCount: 6,
    beamSparkSpeed: 0.060,
    beamJitter: 1.05,
    beamOverflow: 0.34,
    beamStyle: 'laser',
    beamAccentColor: Color.valueOf('#C6FFD2'),
    energyLoopSound: energyWeaponSounds.laserDalhLoop,
    energyLoopVolume: 0.66,
    endpointLiveEffect: uranium.getEffect('energy-laser-end-dalh-live'),
    endpointResidueEffect: uranium.getEffect('energy-laser-end-dalh-residue'),
    endpointResidueInterval: 26,
    extraType: {
      'frost': uranium
        .createLaserBulet("LaserBulletType", '_dalh', {
          colors: [
            Color.valueOf('#68CFFF55'),
            Color.valueOf('#9FE7FF99'),
            Color.valueOf('#D5F5FFDD'),
            Color.valueOf('#FFFFFF')],
          length: 170,
          strokes: [0.28, 0.50, 0.88, 1.22],
          status: StatusEffects.freezing,
          beamWidthFactor: 1.06,
          beamSparkCount: 7,
          beamSparkSpeed: 0.052,
          beamJitter: 1.25,
          beamOverflow: 0.38,
          beamStyle: 'frost',
          beamAccentColor: Color.valueOf('#CFF6FF'),
          energyLoopSound: energyWeaponSounds.laserDalhFrostLoop,
          energyLoopVolume: 0.64,
          endpointLiveEffect: uranium.getEffect('energy-laser-end-dalh-frost-live'),
          endpointResidueEffect: uranium.getEffect('energy-laser-end-dalh-frost-residue'),
          endpointResidueInterval: 26
        })
        .setBullet(90, 0.01, 16)
        .customSetting({
          pierce: true,
          shootEffect: uranium.getEffect('energy-laser-muzzle-dalh-frost'),
          smokeEffect: Fx.none,
          hitEffect: uranium.getEffect('energy-laser-contact-frost'),
          despawnEffect: Fx.none,
          hitColor: Color.valueOf('#BDEEFF'),
          shootSound: energyWeaponSounds.laserDalhFrost,
          lightColor: Color.valueOf('#A8EBFF'),
          lightRadius: 30,
          lightOpacity: 0.55
        })
        .setDrawBullet(0, '#77dd77', '#77dd7733', 17, 17)
        .const,
      'rad': uranium
        .createLaserBulet("LaserBulletType", '_dalh', {
          colors: [
            Color.valueOf('#49FF6555'),
            Color.valueOf('#77FF6A99'),
            Color.valueOf('#B4FF78DD'),
            Color.valueOf('#F2FFD0')],
          length: 163,
          status: uranium.getSEffects('radiation'),
          strokes: [0.30, 0.52, 0.92, 1.28],
          beamWidthFactor: 1.10,
          beamSparkCount: 8,
          beamSparkSpeed: 0.064,
          beamJitter: 1.55,
          beamOverflow: 0.48,
          beamStyle: 'rad',
          beamAccentColor: Color.valueOf('#A6FF64'),
          energyLoopSound: energyWeaponSounds.laserDalhRadLoop,
          energyLoopVolume: 0.69,
          endpointLiveEffect: uranium.getEffect('energy-laser-end-dalh-rad-live'),
          endpointResidueEffect: uranium.getEffect('energy-laser-end-dalh-rad-residue'),
          endpointResidueInterval: 24
        })
        .setBullet(105, 0, 16)
        .customSetting({
          pierce: true,
          shootEffect: uranium.getEffect('energy-laser-muzzle-dalh-rad'),
          smokeEffect: Fx.none,
          hitEffect: uranium.getEffect('energy-laser-contact-rad'),
          despawnEffect: Fx.none,
          hitColor: Color.valueOf('#82FF57'),
          shootSound: energyWeaponSounds.laserDalhRad,
          lightColor: Color.valueOf('#79FF62'),
          lightRadius: 32,
          lightOpacity: 0.58
        })
        .setDrawBullet(0, '#77dd77', '#77dd7733', 17, 17)
        .const
    },
    getExtraTypes(name) {
      return this.extraType[name];
    },
    getRandomType() {
      let keys = Object.keys(this.extraType);
      keys.push('original');
      let key = parseInt(keys.length * Math.random());
      if (keys[key] == 'original') {
        return this;
      } else {
        return this.extraType[keys[key]];
      }
    }
  })
  .setBullet(105, 0, 16)
  .customSetting({
    pierce: true,
    chargeEffect: Fx.none,
    shootEffect: uranium.getEffect('energy-laser-muzzle-dalh'),
    smokeEffect: Fx.none,
    hitEffect: uranium.getEffect('energy-laser-contact-dalh'),
    despawnEffect: Fx.none,
    hitColor: Color.valueOf('#A4FF9C'),
    shootSound: energyWeaponSounds.laserDalh,
    lightColor: Color.valueOf('#98FF9A'),
    lightRadius: 30,
    lightOpacity: 0.54
  })
  .setDrawBullet(0, '#77dd77', '#77dd7733', 17, 17);

uranium //-------------| Spartan — overfilled heavy laser
  .createLaserBulet("LaserBulletType", 'spartan', {
    colors: [
      Color.valueOf('#FF9D3F55'),
      Color.valueOf('#FFC35F99'),
      Color.valueOf('#FFE69BDD'),
      Color.valueOf('#FFFDF0')],
    strokes: [0.52, 0.86, 1.35, 1.72],
    length: 220,
    beamWidthFactor: 1.48,
    beamSparkCount: 10,
    beamSparkSpeed: 0.073,
    beamJitter: 1.85,
    beamOverflow: 0.88,
    beamStyle: 'laser',
    beamAccentColor: Color.valueOf('#FFF0A3'),
    energyLoopSound: energyWeaponSounds.laserSpartanLoop,
    energyLoopVolume: 0.82,
    endpointLiveEffect: uranium.getEffect('energy-laser-end-spartan-live'),
    endpointResidueEffect: uranium.getEffect('energy-laser-end-spartan-residue'),
    endpointResidueInterval: 22,
    extraType: {
      'frost': uranium
        .createLaserBulet("LaserBulletType", '_dalh', {
          colors: [
            Color.valueOf('#5FCFFF55'),
            Color.valueOf('#9FEAFF99'),
            Color.valueOf('#D9F8FFDD'),
            Color.valueOf('#FFFFFF')],
          length: 225,
          strokes: [0.50, 0.82, 1.30, 1.66],
          status: StatusEffects.freezing,
          beamWidthFactor: 1.44,
          beamSparkCount: 11,
          beamSparkSpeed: 0.066,
          beamJitter: 2.05,
          beamOverflow: 0.86,
          beamStyle: 'frost',
          beamAccentColor: Color.valueOf('#D8FAFF'),
          energyLoopSound: energyWeaponSounds.laserSpartanFrostLoop,
          energyLoopVolume: 0.78,
          endpointLiveEffect: uranium.getEffect('energy-laser-end-spartan-frost-live'),
          endpointResidueEffect: uranium.getEffect('energy-laser-end-spartan-frost-residue'),
          endpointResidueInterval: 22
        })
        .setBullet(70, 0.01, 18)
        .customSetting({
          pierce: true,
          shootEffect: uranium.getEffect('energy-laser-muzzle-spartan-frost'),
          smokeEffect: Fx.none,
          hitEffect: uranium.getEffect('energy-laser-contact-spartan-frost'),
          despawnEffect: Fx.none,
          hitColor: Color.valueOf('#C9F4FF'),
          shootSound: energyWeaponSounds.laserSpartanFrost,
          lightColor: Color.valueOf('#B9F0FF'),
          lightRadius: 46,
          lightOpacity: 0.70
        })
        .setDrawBullet(0, '#77dd77', '#77dd7733', 17, 17)
        .const,
      'rad': uranium
        .createLaserBulet("LaserBulletType", '_dalh', {
          colors: [
            Color.valueOf('#55FF4F55'),
            Color.valueOf('#8BFF6099'),
            Color.valueOf('#C7FF78DD'),
            Color.valueOf('#FFF2B0')],
          length: 210,
          status: uranium.getSEffects('radiation'),
          strokes: [0.54, 0.88, 1.38, 1.76],
          beamWidthFactor: 1.52,
          beamSparkCount: 12,
          beamSparkSpeed: 0.080,
          beamJitter: 2.35,
          beamOverflow: 1.0,
          beamStyle: 'rad',
          beamAccentColor: Color.valueOf('#B7FF59'),
          energyLoopSound: energyWeaponSounds.laserSpartanRadLoop,
          energyLoopVolume: 0.85,
          endpointLiveEffect: uranium.getEffect('energy-laser-end-spartan-rad-live'),
          endpointResidueEffect: uranium.getEffect('energy-laser-end-spartan-rad-residue'),
          endpointResidueInterval: 20
        })
        .setBullet(85, 0, 18)
        .customSetting({
          pierce: true,
          shootEffect: uranium.getEffect('energy-laser-muzzle-spartan-rad'),
          smokeEffect: Fx.none,
          hitEffect: uranium.getEffect('energy-laser-contact-spartan-rad'),
          despawnEffect: Fx.none,
          hitColor: Color.valueOf('#A8FF50'),
          shootSound: energyWeaponSounds.laserSpartanRad,
          lightColor: Color.valueOf('#A5FF55'),
          lightRadius: 50,
          lightOpacity: 0.74
        })
        .setDrawBullet(0, '#77dd77', '#77dd7733', 17, 17)
        .const
    },
    getExtraTypes(name) {
      return this.extraType[name];
    },
    getRandomType() {
      let keys = Object.keys(this.extraType);
      keys.push('original');
      let key = parseInt(keys.length * Math.random());
      if (keys[key] == 'original') {
        return this;
      } else {
        return this.extraType[keys[key]];
      }
    }
  })
  .setBullet(85, 0, 18)
  .customSetting({
    pierce: true,
    hitSize: 3,
    chargeEffect: Fx.none,
    shootEffect: uranium.getEffect('energy-laser-muzzle-spartan'),
    smokeEffect: Fx.none,
    hitEffect: uranium.getEffect('energy-laser-contact-spartan'),
    despawnEffect: Fx.none,
    hitColor: Color.valueOf('#FFE486'),
    shootSound: energyWeaponSounds.laserSpartan,
    lightColor: Color.valueOf('#FFD86A'),
    lightRadius: 48,
    lightOpacity: 0.72
  })
  .setDrawBullet(0, '#77dd77', '#77dd7733', 17, 17);


uranium //-------------| Птичка
  .createBullet("BasicBulletType", 'gold-bird', {
    update(b) {
      this.super$update(b);
      if (b.timer.get(2)) {
        let
          rotation = b.rotation() + (b.time % 4 > 1.985 ? 10 : -10);

        b.vel.setAngle(Mathf.slerpDelta(b.rotation(), rotation, 10));
      }

    },
    homingPower: 7,
    homingRange: 200
  })
  .setBullet(100, 6, 110, 9)
  .setDrawBullet('uranium-mod-bird', "#D7A224", "#DFDFDF", 10, 10);

//--Гранаты

uranium //-------------| Обычная Граната
  .createBullet("ArtilleryBulletType", 'turret-granade', {
    despawnEffect: uranium.getEffect('exploz_30x173')
  })
  .setBullet(0, 4, 55, 1, 45, 50)
  .setDrawBullet('uranium-mod-granade', "#F76224", "#FF9256", 9, 9);

uranium //-------------| Святая Граната
  .createBullet("ArtilleryBulletType", 'turret-holy-granade', {
    despawnEffect: uranium.getEffect('holy-explosion')
  })
  .setBullet(0, 3.75, 60, 1, 225, 70)
  .setDrawBullet('uranium-mod-granade', "#D7A224", "#DFDFDF", 15, 15);

uranium //-------------| Птичка смерти
  .createBullet("BasicBulletType", 'dead-bird', {
    update(b) {
      this.super$update(b);
      if (b.timer.get(2)) {
        if (Math.random() < 0.6) {
          uranium.getBullet('dead-bird-child').create(
            b.owner, b.team, b.x, b.y, b.rotation() + Mathf.range(40)
          )
        }
      }
    }
  })
  .setBullet(130, 1.2, 12, 9)
  .setDrawBullet('uranium-mod-bird', "#222222", "#DFDFDF", 10, 10);

uranium //-------------| Птичка смерти - дети
  .createBullet("BasicBulletType", 'dead-bird-child', {
    update(b) {
      this.super$update(b);
      if (b.timer.get(2)) {
        let
          rotation = b.rotation() + (b.time % 4 > 1.985 ? 10 : -10);

        b.vel.setAngle(Mathf.slerpDelta(b.rotation(), rotation, 10));
      }
    },
    homingPower: 5,
    homingRange: 90
  })
  .setBullet(80, 7, 40, 9)
  .setDrawBullet('uranium-mod-bird', "#222222", "#DFDFDF", 7, 7);

//--Проклятые

