const
  uranium = global.uranium,
  uraniumOreHalo = Color.valueOf('3E6410'),
  uraniumOreHaloEdge = Color.valueOf('3E641000'),
  uraniumOreHaloInner = Color.valueOf('527D16'),
  uraniumOreHaloInnerEdge = Color.valueOf('527D1600');


// Compatibility-safe uranium ore ambient VFX. Spawned from OreBlock.renderUpdate(),
// never from drawBase(), so a cosmetic effect cannot abort save/map cache rebuild.
// 3.75: keep the established 132-tick lifetime, but halve internal motion/pulsation speed.
// This makes the animation calmer without increasing the number of simultaneously visible motes.
uranium
  .createEffect('uranium-ore-radiation-mote', 132, (e) => {
    const fin = e.fin(),
      introT = Math.min(1, fin / 0.18),
      // Smooth cubic fade-in avoids a hard flash on the first frame.
      appear = introT * introT * (3 - 2 * introT),
      fade = appear * e.fout(),
      pulse = 0.5 + 0.5 * Math.sin(e.time * 0.0315 + (e.id % 23)),
      // 3.77: each mote gets a different light/body intensity. Combined with the
      // randomised spawn reset in ores.js this removes repetitive synchronized glow.
      variation = 0.76 + ((Math.abs(e.id * 37) % 25) / 100),
      travel = fin * 0.8,
      side = Math.sin(e.time * 0.02575 + e.id) * 0.55,
      px = e.x + Angles.trnsx(e.rotation, travel) + Angles.trnsx(e.rotation + 90, side),
      py = e.y + Angles.trnsy(e.rotation, travel) + Angles.trnsy(e.rotation + 90, side);

    // Saturated particle body stays on a normal world layer; the optical halo is
    // rendered later in this effect with additive Fill.light, so hue is not washed by light-map.
    Draw.z(Layer.debris + 0.08);

    // Palette sampled from the uranium ore sprite itself; deliberately restrained.
    Draw.color(uranium.getRuntimeColor('598121'), uranium.getRuntimeColor('A3D63B'), 0.40 + 0.38 * pulse);
    Draw.alpha((0.40 + 0.25 * pulse) * fade * variation);
    Fill.circle(px, py, 0.24 + 0.12 * pulse);
    Draw.color(uranium.getRuntimeColor('B5DE55'));
    Draw.alpha((0.40 + 0.22 * pulse) * fade * variation);
    Fill.circle(px, py, 0.075 + 0.045 * pulse);

    const tx = e.x + Angles.trnsx(e.rotation, Math.max(0, travel - 0.8)),
      ty = e.y + Angles.trnsy(e.rotation, Math.max(0, travel - 0.8));
    Draw.color(uranium.getRuntimeColor('7EB829'));
    Draw.alpha(0.18 * fade * variation);
    Fill.circle(tx, ty, 0.11);

    if ((e.id % 5) == 0) {
      Draw.color(uranium.getRuntimeColor('91C934'));
      Draw.alpha(0.11 * e.fslope() * appear * variation);
      Draw.rect(Core.atlas.find('uranium-mod-radiation'), e.x, e.y, 1.40 + 0.20 * pulse, 1.40 + 0.20 * pulse, e.rotation + e.time * 0.045);
    }

    // 4.06: wider, darker and more saturated ore-matched halo with higher opacity.
    // Native scene light stays unchanged; only the colored visual footprint changes.
    Draw.blend(Blending.additive);
    uraniumOreHalo.set(uraniumOreHalo.r, uraniumOreHalo.g, uraniumOreHalo.b, (0.70 + 0.24 * pulse) * fade * variation);
    Fill.light(px, py, 18, 5.40 + 2.00 * pulse, uraniumOreHalo, uraniumOreHaloEdge);
    uraniumOreHaloInner.set(uraniumOreHaloInner.r, uraniumOreHaloInner.g, uraniumOreHaloInner.b, (0.72 + 0.22 * pulse) * fade * variation);
    Fill.light(px, py, 14, 2.25 + 0.82 * pulse, uraniumOreHaloInner, uraniumOreHaloInnerEdge);

    uraniumOreHalo.set(uraniumOreHalo.r, uraniumOreHalo.g, uraniumOreHalo.b, 0.43 * fade * variation);
    Fill.light(tx, ty, 12, 2.65 + 0.65 * pulse, uraniumOreHalo, uraniumOreHaloEdge);

    // Real scene light for dark maps: keep it weaker than the optical halo so the
    // hue still reads green, but strong enough to outline the ore in darkness.
    Drawf.light(px, py, 8.8 + 3.0 * pulse, uranium.getRuntimeColor('8FD13A'), (0.11 + 0.06 * pulse) * fade * variation);
    Drawf.light(tx, ty, 4.8 + 1.4 * pulse, uranium.getRuntimeColor('7EB829'), 0.05 * fade * variation);
    Draw.blend();
    Draw.reset();
  });

uranium
  .createEffect('9x18-shot', 10, (e) => {
    const lod = uranium.vfxBudget.registerEffect(e, 55, 1, 0.30);
    if (lod > 0) uranium.vfxBudget.profileLifetime(e, 10, 1, 4);
    const detailCount = uranium.vfxBudget.count(7, 2);
    let
      rot1 = e.rotation - 90;
    Draw.color(uranium.getRuntimeColor("dd0134"), e.color, e.fslope());
    Draw.alpha(0.55);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 5);
    Draw.color(uranium.getRuntimeColor("ffFFFF"), uranium.getRuntimeColor("ffcccc"), e.color, e.fin());
    Draw.alpha(0.7);
    Angles.randLenVectors(e.id, detailCount, e.finpow() * 20, e.rotation, 15, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.35 + e.fout() * 0.35);
    })
  })

uranium
  .createEffect('12x108-shot', 15, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(uranium.getRuntimeColor("dd0134"), uranium.getRuntimeColor("ffD7CA"), e.fslope());
    Draw.alpha(0.60);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 5);
    Draw.color(uranium.getRuntimeColor("ffffff"), uranium.getRuntimeColor("ffcccc"), uranium.getRuntimeColor("ff0000"), e.fin());
    Draw.alpha(0.7);
    Angles.randLenVectors(e.id, 14, e.finpow() * 20, e.rotation, 20, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.37 + e.fout() * 0.37);
    })
  })

uranium
  .createEffect('ammo-loader', 50, (e) => {
    let
      f = 2.6 - (e.fin() * 2.6);
    Draw.color(e.color);
    Fill.square(e.x + f, e.y - f, 0.5, e.fin() * 90);
    Fill.square(e.x + f, e.y + f, 0.5, e.fin() * 90);
    Fill.square(e.x - f, e.y + f, 0.5, -e.fin() * 90);
    Fill.square(e.x - f, e.y - f, 0.5, -e.fin() * 90);
  });

uranium
  .createEffect('ammo-factory-9x18', 100, (e) => {
    Draw.color(e.color, e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 3);
    Draw.color(e.color, uranium.getRuntimeColor("ffcc55"), e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 2);
    Draw.color(e.color, uranium.getRuntimeColor("ffcd33"), e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 1);
  })

uranium
  .createEffect('ammo-factory-12x108', 200, (e) => {

    let
      f = 5,
      d = 1.5;
    Draw.color(e.color, e.fin());
    Fill.circle(e.x + f, e.y + f, e.fslope() * d);
    Fill.circle(e.x + f, e.y - f, e.fslope() * d);
    Fill.circle(e.x - f, e.y + f, e.fslope() * d);
    Fill.circle(e.x - f, e.y - f, e.fslope() * d);

    d = 1;

    Draw.color(e.color, uranium.getRuntimeColor("ffcd33"), e.fin());
    Fill.circle(e.x + f, e.y + f, e.fslope() * d);
    Fill.circle(e.x + f, e.y - f, e.fslope() * d);
    Fill.circle(e.x - f, e.y + f, e.fslope() * d);
    Fill.circle(e.x - f, e.y - f, e.fslope() * d);

    //Drawf.tri(e.x, e.y, 10 * e.fout(), 10, e.fslope());

    Draw.color(e.color, e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 2.5);
    Draw.color(e.color, uranium.getRuntimeColor("ffcc55"), e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 1.5);
    Draw.color(e.color, uranium.getRuntimeColor("ffcd33"), e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 1);
  })

uranium
  .createEffect('ammo-factory-ART', 200, (e) => {

    let
      f = 6.6,
      d = 4;
    Draw.color(e.color, e.fin());
    Fill.circle(e.x + f, e.y + f, e.fslope() * d);
    Fill.circle(e.x + f, e.y - f, e.fslope() * d);
    Fill.circle(e.x - f, e.y + f, e.fslope() * d);
    Fill.circle(e.x - f, e.y - f, e.fslope() * d);

    d = 2;

    Draw.color(e.color, uranium.getRuntimeColor("ffcd33"), e.fin());
    Fill.circle(e.x + f, e.y + f, e.fslope() * d);
    Fill.circle(e.x + f, e.y - f, e.fslope() * d);
    Fill.circle(e.x - f, e.y + f, e.fslope() * d);
    Fill.circle(e.x - f, e.y - f, e.fslope() * d);

    //Drawf.tri(e.x, e.y, 10 * e.fout(), 10, e.fslope());
  })

uranium
  .createEffect('thorium-ammo-blaze', 100, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(uranium.getRuntimeColor("00FFFF"), uranium.getRuntimeColor("00FFFF"), e.fslope());
    Draw.alpha(0.55);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 1);
    Draw.color(uranium.getRuntimeColor("00FFFF"), uranium.getRuntimeColor("00FFFF"), uranium.getRuntimeColor("FFFFFF"), e.fin());
    Draw.alpha(0.7);
    Angles.randLenVectors(e.id, 7, e.finpow() * 20, e.rotation, 15, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.35 + e.fout() * 0.35);
    })
  })

uranium
  .createEffect('thorium-ammo-blaze-big', 150, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(uranium.getRuntimeColor("00FFFF"), uranium.getRuntimeColor("00FFFF"), e.fslope());
    Draw.alpha(0.55);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 1.3);
    Draw.color(uranium.getRuntimeColor("00FFFF"), uranium.getRuntimeColor("00FFFF"), uranium.getRuntimeColor("FFFFFF"), e.fin());
    Draw.alpha(0.7);
    Angles.randLenVectors(e.id, 15, e.finpow() * 30, e.rotation, 20, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.35 + e.fout() * 0.4);
    })
  })

uranium
  .createEffect('iritrium-despawn', 10, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(uranium.getRuntimeColor("E9FE31"), uranium.getRuntimeColor("FFFFFF"), e.fslope());
    Draw.alpha(0.30);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 25);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 15);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 5);
    Draw.color(uranium.getRuntimeColor("E9FE31"));
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 1);
  })

uranium
  .createEffect('iritrium-despawn-big', 15, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(uranium.getRuntimeColor("E9FE31"), uranium.getRuntimeColor("FFFFFF"), e.fslope());
    Draw.alpha(0.30);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 45);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 25);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 15);
    Draw.color(uranium.getRuntimeColor("E9FE31"));
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 3);
  })

uranium
  .createEffect('laser-track', 20, (e) => {
    Draw.z(50);
    Draw.color(uranium.getRuntimeColor("CCCCCC"), e.color, e.fout());
    Draw.alpha(0.04 * e.fout());
    Fill.circle(e.x, e.y, 5 * e.fout());
    Fill.circle(e.x, e.y, 3 * e.fout());
    Draw.color(e.color, uranium.getRuntimeColor("CCCCCC"), e.fout());
    Fill.circle(e.x, e.y, 1.5 * e.fout());
  })

uranium
  .createEffect('sheald_up', 120, (e) => {
    Draw.color(e.color);
    Draw.alpha(e.fout());
    Draw.rect(Core.atlas.find('uranium-mod-sheald_up'), e.x, e.y);
  })

uranium
  .createEffect('sheald_down', 180, (e) => {
    Draw.color(uranium.getRuntimeColor("FF0000"));
    Draw.alpha(e.fout() * 10 % 2 - 0.3);
    Draw.rect(Core.atlas.find('uranium-mod-sheald_down'), e.x, e.y);
  })


uranium
  .createEffect('level_up', 120, (e) => {
    Draw.color(e.color);
    Draw.alpha(e.fout());
    Draw.rect(Core.atlas.find('uranium-mod-level_up'), e.x, e.y - 1 + e.fin() * 8);
  })

uranium
  .createEffect('exploz_30x173', 70, (e) => {
    Draw.color(e.color, uranium.getRuntimeColor("FF9d36"), e.finpow());
    Draw.alpha(1 - e.finpow());
    Fill.circle(e.x, e.y, 5 * e.finpow() + 3);
    Fill.circle(e.x, e.y, 7 * e.finpow());
    Angles.randLenVectors(e.id, 17, 5 + 35 * e.finpow(), (x, y) => {
      Draw.color(e.color, uranium.getRuntimeColor("FFdd66"), e.fout());
      Draw.alpha(e.fout() + 0.5);
      Fill.circle(e.x + x, e.y + y, 0.2 + e.fout() * 1.5);
    });
  })

uranium
  .createEffect('napalm_30x173', 70, (e) => {
    Draw.color(uranium.getRuntimeColor("FF5536"), uranium.getRuntimeColor("FF9d36"), e.finpow());
    Draw.alpha(1 - e.finpow());
    Fill.circle(e.x, e.y, 8 * e.finpow() + 3);
    Fill.circle(e.x, e.y, 13 * e.finpow());
    Angles.randLenVectors(e.id, 19, 5 + 35 * e.finpow(), (x, y) => {
      Draw.color(uranium.getRuntimeColor("FF9d36"), uranium.getRuntimeColor("FF5536"), e.fout());
      Draw.alpha(e.fout() + 0.5);
      Fill.circle(e.x + x, e.y + y, 0.2 + e.fout() * 1.5);
    });
  })

uranium
  .createEffect('radiation_effect', 90, (e) => {
    Angles.randLenVectors(e.id, 2, 1 + 4 * e.finpow(), (x, y) => {
      Draw.color(uranium.getRuntimeColor("2Ffd36"), uranium.getRuntimeColor("9Ff536"), e.fout());
      Draw.alpha(e.fout() + 0.5);
      Fill.circle(e.x + x, e.y + y, 0.3 + e.fout() * 0.3);
    });
    Angles.randLenVectors(e.id, 3, 2 + 7 * e.finpow(), (x, y) => {
      Draw.color(uranium.getRuntimeColor("0Fff06"), uranium.getRuntimeColor("9Ff526"), e.fout());
      Draw.alpha(e.fout() + 0.5);
      Fill.circle(e.x + x, e.y + y, 0.4 + e.fout() * 0.5);
    });
  })

uranium
  .createEffect('Cursed_effect', 120, (e) => {
    Angles.randLenVectors(e.id, 2, 1 + 1 * e.finpow(), (x, y) => {
      Draw.color(uranium.getRuntimeColor("D51700"), uranium.getRuntimeColor("F50700"), e.fout());
      Draw.alpha(e.fout() + 0.1);
      Fill.circle(e.x + x, e.y + y, 0.1 + e.fout() * 0.2);
    });
    Angles.randLenVectors(e.id, 3, 2 + 4 * e.finpow(), (x, y) => {
      Draw.color(uranium.getRuntimeColor("F50710"), uranium.getRuntimeColor("D51700"), e.fout());
      Draw.alpha(e.fout() + 0.15);
      Fill.circle(e.x + x, e.y + y, 0.2 + e.fout() * 0.3);
    });
  })

uranium
  .createEffect('Legend_effect', 160, (e) => {
    Angles.randLenVectors(e.id, 1, 1 + 1 * e.finpow(), (x, y) => {
      Draw.color(uranium.getRuntimeColor("FEC424"), uranium.getRuntimeColor("FFFFFF"), e.fout());
      Draw.alpha(e.fout());
      Fill.circle(e.x + x, e.y + y, 0.1 + e.fout() * 0.1);
    });
    Angles.randLenVectors(e.id, 2, 2 + 2 * e.finpow(), (x, y) => {
      Draw.color(uranium.getRuntimeColor("FFFFFF"), uranium.getRuntimeColor("FEC424"), e.fout());
      Draw.alpha(e.fout());
      Fill.circle(e.x + x, e.y + y, e.fout() * 0.3);
    });
  })

uranium
  .createEffect('nanobots', 180, (e) => {
    const fade = e.fslope(),
      pulse = 0.5 + 0.5 * Math.sin(e.time * 0.24 + e.id * 0.13);

    // Ordinary nanobots: subdued green-grey shells with clearly emissive working cores.
    Angles.randLenVectors(e.id, 3, 1.6 + 3.8 * e.fout(), (x, y) => {
      const px = e.x + x, py = e.y + y;
      Draw.color(uranium.getRuntimeColor('718278'), uranium.getRuntimeColor('91A99A'), e.fin());
      Draw.alpha(0.62 * fade);
      Fill.circle(px, py, 0.20 + e.fout() * 0.18);
      Draw.color(uranium.getRuntimeColor('9BFFA8'));
      Draw.alpha((0.62 + 0.25 * pulse) * fade);
      Fill.circle(px, py, 0.085 + 0.045 * pulse);
      Drawf.light(px, py, 5.5 + 2.0 * pulse, uranium.getRuntimeColor('73FF83'), 0.085 * fade);
    });

    Drawf.light(e.x, e.y, 12 + 4 * pulse, uranium.getRuntimeColor('67E879'), 0.035 * fade);
    Draw.reset();
  });

uranium
  .createEffect('nanobots-improved', 190, (e) => {
    const fade = e.fslope(),
      pulse = 0.5 + 0.5 * Math.sin(e.time * 0.30 + e.id * 0.17),
      spin = e.time * 2.1 + (e.id % 360);

    // Improved nanobots form a controlled micro-swarm: brighter cyan/emerald cores,
    // diamond shells and short synchronized links make the upgrade immediately readable.
    for (let i = 0; i < 4; i++) {
      const a = spin + i * 90,
        r = 1.8 + 1.6 * (0.45 + 0.55 * Math.sin(e.time * 0.09 + i * 1.7)),
        px = e.x + Angles.trnsx(a, r),
        py = e.y + Angles.trnsy(a, r),
        nx = e.x + Angles.trnsx(a + 90, r),
        ny = e.y + Angles.trnsy(a + 90, r);

      Draw.color(uranium.getRuntimeColor('D6FFF1'), uranium.getRuntimeColor('54FFD0'), 0.45 + 0.35 * pulse);
      Draw.alpha(0.78 * fade);
      Fill.square(px, py, 0.25 + 0.06 * pulse, a + 45);
      Draw.color(Color.white);
      Draw.alpha(0.75 * fade);
      Fill.circle(px, py, 0.075 + 0.035 * pulse);

      Draw.color(uranium.getRuntimeColor('68FFC2'));
      Draw.alpha(0.16 * fade);
      Lines.stroke(0.28);
      Lines.line(px, py, nx, ny);
      Drawf.light(px, py, 8.5 + 3.0 * pulse, uranium.getRuntimeColor('5DFFD1'), 0.12 * fade);
    }

    // Central processing pulse: thin, luminous and visibly more advanced than standard bots.
    Draw.color(uranium.getRuntimeColor('A7FFE8'));
    Draw.alpha(0.24 * fade);
    Lines.stroke(0.42 + 0.12 * pulse);
    Lines.circle(e.x, e.y, 2.2 + 0.7 * pulse);
    Drawf.light(e.x, e.y, 18 + 5 * pulse, uranium.getRuntimeColor('69FFD0'), 0.075 * fade);
    Draw.reset();
  });

uranium
  .createEffect('teach', 180, (e) => {
    Angles.randLenVectors(e.id, 2, 2 + 3 * e.fout(), (x, y) => {
      Draw.color(uranium.getRuntimeColor("64F964"));
      Draw.alpha(e.fslope());
      Fill.square(e.x + x, e.y - y, 0.4 * e.fslope());
      Fill.square(e.x + x, e.y - y, 0.2 * e.fslope());
    });
  });

uranium
  .createEffect('Emperors Shield', 104, (e) => {
    const gold = uranium.getRuntimeColor('FEC424'),
      pale = uranium.getRuntimeColor('FFF1A8'),
      // createTurret passes the real statsBoost radius through Effect.rotation.
      // Fallback preserves visibility if an addon invokes this effect directly.
      radius = e.rotation > 8 ? e.rotation : 40,
      pulse = 0.5 + 0.5 * Math.sin(Time.time / 14.5),
      // 104 tick lifetime gives ~15 ticks of overlap with the next 89-tick spawn.
      // Fade only the first/last few ticks; overlapping instances keep the field continuous.
      edgeFade = Math.min(1, e.time / 5, (e.lifetime - e.time) / 7);

    Draw.z(Layer.shields);

    // Stable body: clearly readable, but still transparent enough for combat visibility.
    Draw.color(gold, pale, 0.18 + 0.20 * pulse);
    Draw.alpha((0.090 + 0.040 * pulse) * edgeFade);
    Fill.circle(e.x, e.y, radius);

    // Exact gameplay boundary: this line stays at the same radius used by the stats boost.
    Draw.color(pale, gold, 0.22);
    Draw.alpha((0.46 + 0.09 * pulse) * edgeFade);
    Lines.stroke(1.38 + 0.28 * pulse);
    Lines.circle(e.x, e.y, radius);

    // No orbiting/rim-running element: the shield reads as one stable energy field.
    // This avoids moving UI-like accents and keeps the exact gameplay boundary easy to read.

    // Stronger base illumination than 3.69; this is now the dominant light source.
    // The soft halo may extend beyond the boundary, but the visible shield geometry and
    // gameplay effect radius remain exactly radius.
    Drawf.light(e.x, e.y, radius * 1.22, gold, (0.44 + 0.17 * pulse) * edgeFade);
    Draw.reset();
  });
uranium.getEffect('Emperors Shield').clip = 140;

uranium
  .createEffect('holy-explosion', 80, (e) => {
    e.scaled(7, cons(i => {
      Lines.stroke(3 * i.fout());
      Lines.circle(e.x, e.y, 3 + i.fin() * 30);
    }));

    Draw.color(uranium.getRuntimeColor("FEC424"));

    Angles.randLenVectors(e.id, 9, 2 + 40 * e.finpow(), new Floatc2({
      get: (x, y) => {
        Fill.circle(e.x + x, e.y + y, e.fout() * 5 + 0.5);
        Fill.circle(e.x + x / 2, e.y + y / 2, e.fout() * 2);
      }
    }));

    Draw.color(uranium.getRuntimeColor("FEC424"), uranium.getRuntimeColor("FFFFFF"), uranium.getRuntimeColor("FEC424"), e.fin());
    Lines.stroke(1.5 * e.fout());

    Angles.randLenVectors(e.id + 1, 7, 1 + 70 * e.finpow(), new Floatc2({
      get: (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 6);
      }
    }));
  })



// Uranium ammo visual refresh -------------------------------------------------
// Goal: keep gameplay identical while bringing uranium projectile visuals
// closer to vanilla Mindustry readability: layered muzzle flash, luminous
// trails and distinct radioactive impact bursts.
const uraniumFxCore = uranium.getRuntimeColor("F4FFE4");
const uraniumFxFront = uranium.getRuntimeColor("8CFF66");
const uraniumFxMid = uranium.getRuntimeColor("5DDE62");
const uraniumFxSmoke = uranium.getRuntimeColor("426B46");
const uraniumFxDark = uranium.getRuntimeColor("243628");

function createUraniumShotEffect(name, lifetime, frontReach, sideSpread, particleCount, lightRadius, coreSize, profileFactor) {
  uranium.createEffect(name, lifetime, (e) => {
    const backRot = e.rotation + 180;
    const drawParticles = profileFactor ? uranium.vfxBudget.profileCount(particleCount, 3, profileFactor) : particleCount;

    Draw.color(uraniumFxDark, uraniumFxMid, e.fin());
    Draw.alpha(0.32 * e.fout());
    Angles.randLenVectors(e.id + 31, Math.max(2, Math.floor(drawParticles * 0.55)), 1 + sideSpread * e.finpow(), backRot, 38, (x, y) => {
      Fill.circle(e.x + x * 0.65, e.y + y * 0.65, 0.55 + e.fout() * 1.15);
    });

    Draw.color(uraniumFxCore, uraniumFxFront, e.fin());
    Draw.alpha(0.92 * e.fout());
    Fill.circle(e.x, e.y, coreSize * (0.60 + e.fslope() * 0.55));

    Lines.stroke((0.9 + coreSize * 0.18) * e.fout());
    Lines.lineAngle(e.x, e.y, e.rotation, 3 + frontReach * e.fout());

    Angles.randLenVectors(e.id, drawParticles, 2 + frontReach * e.finpow(), e.rotation, sideSpread, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.45 + e.fout() * 0.85);
      Lines.stroke(0.8 * e.fout());
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 0.8 + e.fout() * 3.4);
    });

    Drawf.light(e.x, e.y, lightRadius * (0.72 + e.fout() * 0.28), uraniumFxFront, 0.55 * e.fout());
    Draw.reset();
  });
}

function createUraniumTrailEffect(name, lifetime, particleCount, spread, coreSize, lightRadius, profileFactor) {
  uranium.createEffect(name, lifetime, (e) => {
    const drawParticles = profileFactor ? uranium.vfxBudget.profileCount(particleCount, 1, profileFactor) : particleCount;
    Draw.color(uraniumFxSmoke, uraniumFxMid, e.fin());
    Draw.alpha(0.18 + 0.34 * e.fout());
    Fill.circle(e.x, e.y, coreSize * (0.65 + e.fout() * 0.95));

    Draw.color(uraniumFxFront, uraniumFxCore, e.fin());
    Draw.alpha(0.55 * e.fout());
    Fill.circle(e.x, e.y, coreSize * (0.35 + e.fout() * 0.55));

    Angles.randLenVectors(e.id, drawParticles, 1 + spread * e.finpow(), (x, y) => {
      Draw.color(uraniumFxFront, uraniumFxCore, e.fin());
      Draw.alpha(0.55 * e.fout());
      Fill.circle(e.x + x, e.y + y, 0.28 + e.fout() * 0.65);
    });

    Drawf.light(e.x, e.y, lightRadius * (0.7 + e.fout() * 0.3), uraniumFxFront, 0.20 * e.fout());
    Draw.reset();
  });
}

function createUraniumImpactEffect(name, lifetime, radius, particleCount, smokeCount, ringRadius, lightRadius, coreSize, profileFactor, fragmentVisuals) {
  uranium.createEffect(name, lifetime, (e) => {
    const lod = profileFactor ? uranium.vfxBudget.registerEffect(e, Math.max(70, lightRadius * 1.8), profileFactor, 0.12) : uranium.vfxBudget.getLod();
    if (profileFactor && lod > 0) uranium.vfxBudget.profileLifetime(e, lifetime, profileFactor, 10);
    const drawParticles = profileFactor ? uranium.vfxBudget.profileCount(particleCount, 4, profileFactor) : particleCount;
    const drawSmoke = profileFactor ? uranium.vfxBudget.profileCount(smokeCount, 2, profileFactor) : smokeCount;
    e.scaled(Math.min(18, Math.floor(lifetime * 0.28)), cons(i => {
      Draw.color(uraniumFxCore, uraniumFxFront, i.fin());
      Draw.alpha(0.95 * i.fout());
      Lines.stroke((1.4 + coreSize * 0.10) * i.fout());
      Lines.circle(e.x, e.y, 2 + ringRadius * i.finpow());
    }));

    Draw.color(uraniumFxCore, uraniumFxFront, e.fin());
    Draw.alpha(0.92 * e.fout());
    Fill.circle(e.x, e.y, coreSize * (0.90 + e.fout() * 0.75));

    // 9mm uranium creates six real gameplay fragments. Represent that split in
    // this already-existing EffectState instead of drawing six long-lived fragment
    // sprites for every parent projectile.
    if (fragmentVisuals != undefined && fragmentVisuals > 0 && e.time < 8) {
      const splitFade = 1 - e.time / 8;
      const splitCount = profileFactor
        ? uranium.vfxBudget.profileCount(fragmentVisuals, 2, profileFactor)
        : fragmentVisuals;
      Angles.randLenVectors(e.id + 911, splitCount, 4 + radius * 0.72 * (1 - splitFade), (x, y) => {
        Draw.color(uraniumFxFront, uraniumFxCore, 0.35 + 0.45 * splitFade);
        Draw.alpha(0.72 * splitFade);
        Lines.stroke(0.75 * splitFade);
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 2 + 4.5 * splitFade);
      });
    }

    // Radial particles carry the initial hit beat; keeping them alive through the
    // entire effect only multiplies overdraw in sustained fire.
    if (lod == 0 || e.time < lifetime * 0.58) {
      Angles.randLenVectors(e.id, drawParticles, 4 + radius * e.finpow(), (x, y) => {
        Draw.color(uraniumFxFront, uraniumFxCore, e.fin());
        Draw.alpha(0.88 * e.fout());
        Fill.circle(e.x + x, e.y + y, 0.45 + e.fout() * (0.95 + coreSize * 0.04));
        Lines.stroke(0.95 * e.fout());
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1.1 + e.fout() * 4.4);
      });

      Angles.randLenVectors(e.id + 509, drawSmoke, 2 + radius * 0.80 * e.finpow(), (x, y) => {
        Draw.color(uraniumFxSmoke, uraniumFxDark, e.fin());
        Draw.alpha(0.32 * e.fout());
        Fill.circle(e.x + x, e.y + y, 0.8 + e.fout() * (1.8 + coreSize * 0.08));
      });
    }

    Drawf.light(e.x, e.y, lightRadius * (0.72 + e.fout() * 0.28), uraniumFxFront, 0.62 * e.fout());
    Draw.reset();
  });
}

createUraniumShotEffect('uranium-shot-small', 16, 16, 22, 8, 24, 2.8);
createUraniumShotEffect('uranium-shot-medium', 18, 22, 26, 11, 34, 3.5);
createUraniumShotEffect('uranium-shot-large', 22, 30, 30, 16, 46, 4.3, 10);

createUraniumTrailEffect('uranium-trail-small', 20, 3, 4, 1.6, 16, 15);
createUraniumTrailEffect('uranium-trail-medium', 22, 4, 5, 2.1, 20, 10);
createUraniumTrailEffect('uranium-trail-large', 26, 6, 7, 2.8, 28, 10);

createUraniumImpactEffect('uranium-hit-small', 26, 16, 11, 5, 13, 28, 3.2, 15, 6);
createUraniumImpactEffect('uranium-hit-medium', 34, 24, 17, 8, 20, 40, 4.4, 10, 0);
createUraniumImpactEffect('uranium-hit-large', 46, 36, 28, 14, 29, 60, 6.2, 10, 0);



// Uranium impact residue refresh ---------------------------------------------
// The uranium ammo's gameplay radius is defined by real damaging frag bullets.
// v159.7 defaults matter here: fragVelocityMax=1 and fragOffsetMax=7.
// Current Uranium values therefore give these conservative maximum radii:
//   small frag: 7 + 0.13 * 125 = 23.25 world units
//   medium->small chain: 7 + 0.20 * 100 + 7 + 0.13 * 125 = 50.25
// Visual radiation grows just beyond those limits; it does not deal damage.

function uraniumFxFadeAfter(e, startTick) {
  if (e.time <= startTick) return 1;
  return 1 - Math.min(1, (e.time - startTick) / Math.max(1, e.lifetime - startTick));
}

function uraniumFxNoise(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

function uraniumFxTailFade(fin, start) {
  if (fin <= start) return 1;
  const t = Math.min(1, (fin - start) / Math.max(0.001, 1 - start));
  return 1 - Math.pow(t, 1.35);
}

function uraniumFxDrawCrackLink(x1, y1, x2, y2, glowStroke, coreStroke, glowAlpha, coreAlpha, pulse, pulse2) {
  Draw.z(Layer.scorch + 0.055);
  Draw.color(uraniumFxSmoke, uraniumFxFront, 0.34 + 0.36 * pulse);
  Draw.alpha(glowAlpha);
  Lines.stroke(glowStroke * (0.9 + 0.22 * pulse2));
  Lines.line(x1, y1, x2, y2);

  Draw.z(Layer.scorch + 0.085);
  Draw.color(uranium.getRuntimeColor('090C09'), uranium.getRuntimeColor('162016'), 0.20 + 0.35 * pulse2);
  Draw.alpha(coreAlpha);
  Lines.stroke(coreStroke * (0.92 + 0.18 * pulse));
  Lines.line(x1, y1, x2, y2);
}

function uraniumFxDrawCrackField(effectId, cx, cy, currentRadius, zoneFade, intensity, branchCount, pulse, pulse2) {
  if (currentRadius <= 0.75) return;

  for (let i = 0; i < branchCount; i++) {
    let seed = effectId * 1.318 + i * 17.173;
    let angle = uraniumFxNoise(seed) * 360;
    let segments = 2 + Math.floor(uraniumFxNoise(seed + 1.27) * 3.2);
    let prevRadius = currentRadius * (0.06 + uraniumFxNoise(seed + 4.2) * 0.08);
    let prevX = cx + Math.cos(angle / 180 * Math.PI) * prevRadius;
    let prevY = cy + Math.sin(angle / 180 * Math.PI) * prevRadius;

    for (let s = 0; s < segments; s++) {
      let segT = (s + 1) / segments;
      angle += (uraniumFxNoise(seed + 10 + s * 1.91) - 0.5) * (30 - segT * 11);
      let reach = currentRadius * (0.20 + segT * (0.58 + 0.18 * uraniumFxNoise(seed + 20 + s * 2.73)));
      let nx = cx + Math.cos(angle / 180 * Math.PI) * reach;
      let ny = cy + Math.sin(angle / 180 * Math.PI) * reach;
      let glowAlpha = (0.050 + 0.040 * pulse) * zoneFade * intensity * (1.04 - segT * 0.32);
      let coreAlpha = (0.17 + 0.12 * pulse2) * zoneFade * (1.0 - segT * 0.22);

      uraniumFxDrawCrackLink(
        prevX, prevY, nx, ny,
        1.65 - segT * 0.40,
        0.65 - segT * 0.08,
        glowAlpha,
        coreAlpha,
        pulse,
        pulse2
      );

      Draw.z(Layer.debris + 0.12);
      Draw.color(uraniumFxFront, uraniumFxCore, 0.42 + 0.38 * pulse);
      Draw.alpha((0.055 + 0.035 * pulse) * zoneFade * intensity);
      Fill.circle(nx, ny, 0.30 + 0.28 * pulse * (1.04 - segT * 0.35));

      if (uraniumFxNoise(seed + 42 + s * 7.11) > 0.43) {
        let bAngle = angle + (uraniumFxNoise(seed + 51 + s * 9.31) - 0.5) * 130;
        let bLen = currentRadius * (0.07 + 0.10 * uraniumFxNoise(seed + 63 + s * 4.7)) * (1.0 - segT * 0.25);
        let bx = nx + Math.cos(bAngle / 180 * Math.PI) * bLen;
        let by = ny + Math.sin(bAngle / 180 * Math.PI) * bLen;
        uraniumFxDrawCrackLink(
          nx, ny, bx, by,
          1.15 - segT * 0.26,
          0.46 - segT * 0.05,
          glowAlpha * 0.82,
          coreAlpha * 0.88,
          pulse,
          pulse2
        );
      }

      prevX = nx;
      prevY = ny;
    }
  }
}

function createUraniumFragDissipateEffect(name, lifetime, symbolSize, particleCount, spread, lightRadius) {
  uranium.createEffect(name, lifetime, (e) => {
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 19) / 5.2);
    const fade = e.fout();
    Draw.z(Layer.effect);

    Draw.color(uraniumFxFront, uraniumFxCore, 0.34 + 0.46 * pulse);
    Draw.alpha(0.38 * fade);
    Draw.rect(Core.atlas.find('uranium-mod-radiation'), e.x, e.y, symbolSize * (0.82 + 0.48 * fade), symbolSize * (0.82 + 0.48 * fade), e.rotation + e.time * 2.2);

    Draw.color(uraniumFxSmoke, uraniumFxFront, 0.40 + 0.30 * pulse);
    Draw.alpha(0.16 * fade);
    Fill.circle(e.x, e.y, 1.1 + 1.0 * pulse * fade);

    Angles.randLenVectors(e.id, particleCount, 2 + spread * e.finpow(), (x, y) => {
      Draw.color(uraniumFxFront, uraniumFxCore, 0.25 + 0.55 * pulse);
      Draw.alpha((0.14 + 0.10 * pulse) * fade);
      Fill.circle(e.x + x, e.y + y, 0.18 + 0.38 * fade);
      if (Math.abs(x) + Math.abs(y) > spread * 0.55) {
        Draw.alpha(0.10 * fade);
        Draw.rect(Core.atlas.find('uranium-mod-radiation'), e.x + x * 0.82, e.y + y * 0.82, symbolSize * 0.22, symbolSize * 0.22, e.rotation - e.time * 1.4 + x * 9);
      }
    });

    Drawf.light(e.x, e.y, lightRadius * (0.70 + 0.30 * fade), uraniumFxFront, 0.22 * fade * (0.65 + 0.35 * pulse));
    Draw.reset();
  });
}

function createUraniumResidueEffect(name, lifetime, growthTicks, zoneRadius, stainRadius, moteCount, lightRadius, clipSize, intensity, residueChance, profileFactor) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const detailMotes = profileFactor ? uranium.vfxBudget.profileCount(moteCount, 4, profileFactor) : moteCount;
    const keepResidue = residueChance == undefined || residueChance >= 0.999 ||
      uraniumFxNoise(e.id * 1.913 + e.x * 0.061 + e.y * 0.097 + 811) < residueChance;
    // Shrink the actual EffectState lifetime, not just the drawing work.
    // This matters enormously for 9mm where hundreds of impacts are created/sec.
    if (!keepResidue) e.lifetime = Math.min(e.lifetime, 20);
    if (e.time >= 20 && !keepResidue) return;
    const growth = Math.min(1, e.time / growthTicks);
    const growthSmooth = 1 - Math.pow(1 - growth, 2.18);
    const zoneFade = uraniumFxFadeAfter(e, growthTicks + (lifetime - growthTicks) * 0.42);
    const stainFade = uraniumFxFadeAfter(e, lifetime * 0.82);
    const pulse = 0.5 + 0.5 * Math.sin((e.time + (e.id % 31)) / 8.5);
    const pulse2 = 0.5 + 0.5 * Math.sin((e.time + (e.id % 17)) / 13.0 + 1.8);
    const currentRadius = zoneRadius * growthSmooth;
    const latePhase = e.time > 120;
    const baseCrackBranches = Math.max(5, Math.floor(5 + currentRadius / 9));
    const profiledCracks = profileFactor
      ? uranium.vfxBudget.profileCount(baseCrackBranches, 4, profileFactor)
      : baseCrackBranches;
    const crackBranches = latePhase ? Math.min(3, profiledCracks) : profiledCracks;

    // Keep the impact beat as a short flash; the user asked to preserve impact.
    if (e.time < 20) {
      const b = 1 - e.time / 20;
      Draw.z(Layer.effect);
      Draw.color(uraniumFxCore, uraniumFxFront, 1 - b);
      Draw.alpha(0.82 * b * intensity);
      Fill.circle(e.x, e.y, (2.2 + stainRadius * 0.42) * (0.8 + 0.45 * b));
      Lines.stroke((0.9 + stainRadius * 0.10) * b);
      Lines.circle(e.x, e.y, 2 + stainRadius * 2.2 * (1 - b));
    }

    // Tiny central scar; for 9x18 this is intentionally very small.
    Draw.z(Layer.scorch + 0.04);
    Draw.color(uranium.getRuntimeColor('171D17'));
    Draw.alpha((0.28 + 0.06 * pulse2) * stainFade);
    Fill.circle(e.x, e.y, stainRadius * (0.95 + 0.03 * pulse));
    Draw.color(uranium.getRuntimeColor('0D110D'));
    Draw.alpha((0.16 + 0.04 * pulse) * stainFade);
    Fill.circle(e.x, e.y, stainRadius * 0.58);

    // Broad radiation field drawn as branching cracks with emissive edges
    // instead of obvious circles.
    uraniumFxDrawCrackField(e.id + 930, e.x, e.y, currentRadius, zoneFade, intensity, crackBranches, pulse, pulse2);

    if (!latePhase) {
      // Localized glow islands and floating motes are useful during the readable
      // growth phase, but are redundant once the residue has settled.
      Angles.randLenVectors(e.id + 1200, Math.max(3, Math.floor(detailMotes * 0.62)), Math.max(2, currentRadius * 0.95), (x, y) => {
        const dist = Math.sqrt(x * x + y * y);
        const reach = currentRadius <= 0.001 ? 0 : dist / currentRadius;
        Draw.z(Layer.scorch + 0.062);
        Draw.color(uraniumFxSmoke, uraniumFxFront, 0.30 + 0.38 * pulse);
        Draw.alpha((0.020 + 0.022 * pulse2) * zoneFade * intensity * (1.0 - Math.min(0.65, reach * 0.40)));
        Fill.circle(e.x + x, e.y + y, 0.7 + 1.4 * pulse * (1.0 - Math.min(1, reach)));
      });

      Draw.z(Layer.debris + 0.14);
      Angles.randLenVectors(e.id + 409, detailMotes, Math.max(2, currentRadius * 0.92), (x, y) => {
        Draw.color(uraniumFxFront, uraniumFxCore, 0.30 + 0.50 * pulse);
        Draw.alpha((0.055 + 0.040 * pulse2) * zoneFade * intensity);
        Fill.circle(e.x + x, e.y + y, 0.10 + 0.22 * pulse);
      });

      Drawf.light(
        e.x,
        e.y,
        Math.max(10, currentRadius * 0.92 + lightRadius * 0.28),
        uraniumFxFront,
        0.12 * zoneFade * intensity * (0.72 + 0.28 * pulse)
      );
    }
    Draw.reset();
  });
  fx.const.clip = clipSize;
}

function createUraniumArtilleryAfterglow(name, lifetime, growthTicks, zoneRadius, craterRadius, lightRadius, clipSize, profileFactor) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const growth = Math.min(1, e.time / growthTicks);
    const growthSmooth = 1 - Math.pow(1 - growth, 2.0);
    const zoneFade = uraniumFxFadeAfter(e, growthTicks + (lifetime - growthTicks) * 0.44);
    const craterFade = uraniumFxFadeAfter(e, lifetime * 0.86);
    const shellHeat = uraniumFxFadeAfter(e, lifetime * 0.70);
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 23) / 8.0);
    const pulse2 = 0.5 + 0.5 * Math.sin((e.time + e.id % 37) / 14.0 + 1.3);
    const currentRadius = zoneRadius * growthSmooth;
    const latePhase = e.time > 180;
    const shellX = e.x + Math.cos((e.rotation + 180) / 180 * Math.PI) * 2.2;
    const shellY = e.y + Math.sin((e.rotation + 180) / 180 * Math.PI) * 2.2;
    const baseCrackBranches = Math.max(8, Math.floor(8 + currentRadius / 8.5));
    const profiledCracks = profileFactor
      ? uranium.vfxBudget.profileCount(baseCrackBranches, 5, profileFactor)
      : baseCrackBranches;
    const crackBranches = latePhase ? Math.min(4, profiledCracks) : profiledCracks;

    if (e.time < 30) {
      const b = 1 - e.time / 30;
      Draw.z(Layer.effect);
      Draw.color(uraniumFxCore, uraniumFxFront, 1 - b);
      Draw.alpha(0.95 * b);
      Fill.circle(e.x, e.y, 4.0 + 5.5 * b);
      Lines.stroke(2.2 * b);
      Lines.circle(e.x, e.y, 4 + craterRadius * 1.15 * (1 - b));
      Angles.randLenVectors(e.id + 170, profileFactor ? uranium.vfxBudget.profileCount(24, 5, profileFactor) : 24, 5 + craterRadius * 2.0 * (1 - b), (x, y) => {
        Fill.circle(e.x + x, e.y + y, 0.45 + b * 1.0);
        Lines.stroke(0.85 * b);
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1.4 + b * 4.2);
      });
      Angles.randLenVectors(e.id + 230, 10, 2 + craterRadius * 1.3 * (1 - b), (x, y) => {
        Draw.color(uraniumFxSmoke, uraniumFxDark, 1 - b);
        Draw.alpha(0.30 * b);
        Fill.circle(e.x + x, e.y + y, 0.8 + b * 2.2);
      });
    }

    // Long-lived crater.
    Draw.z(Layer.scorch + 0.03);
    Draw.color(uranium.getRuntimeColor('141713'));
    Draw.alpha((0.48 + 0.06 * pulse2) * craterFade);
    Fill.circle(e.x, e.y, craterRadius);
    Draw.color(uranium.getRuntimeColor('090B09'));
    Draw.alpha((0.31 + 0.05 * pulse) * craterFade);
    Fill.circle(e.x, e.y, craterRadius * 0.70);
    Fill.circle(e.x - craterRadius * 0.18, e.y + craterRadius * 0.12, craterRadius * 0.35);

    uraniumFxDrawCrackField(e.id + 331, e.x, e.y, currentRadius, zoneFade, 1.08, crackBranches, pulse, pulse2);

    if (!latePhase) {
      Angles.randLenVectors(e.id + 361, profileFactor ? uranium.vfxBudget.profileCount(22, 4, profileFactor) : 22, Math.max(2, currentRadius * 0.96), (x, y) => {
        Draw.z(Layer.scorch + 0.061);
        Draw.color(uraniumFxDark, uraniumFxMid, 0.34 + 0.34 * pulse2);
        Draw.alpha((0.022 + 0.024 * pulse2) * zoneFade);
        Fill.circle(e.x + x, e.y + y, 0.8 + 1.7 * pulse);
      });
    }

    // Cooling shell lodged in the crater.
    Draw.z(Layer.debris + 0.22);
    Draw.color(uranium.getRuntimeColor('484B48'));
    Draw.alpha(0.98 * craterFade);
    Draw.rect(Core.atlas.find('uranium-mod-bullet_30x173'), shellX, shellY, e.rotation - 90);
    if (!latePhase) {
      Draw.color(uraniumFxFront, uraniumFxCore, 0.32 + pulse * 0.50);
      Draw.alpha((0.10 + 0.17 * pulse) * shellHeat);
      Fill.circle(shellX, shellY, 1.1 + 0.95 * pulse);
      Drawf.light(shellX, shellY, 11 + 8 * pulse, uraniumFxFront, 0.22 * shellHeat * (0.7 + 0.3 * pulse));

      Draw.z(Layer.effect);
      Angles.randLenVectors(e.id + 670, profileFactor ? uranium.vfxBudget.profileCount(15, 3, profileFactor) : 15, Math.max(3, currentRadius * 0.90), (x, y) => {
        Draw.color(uraniumFxFront, uraniumFxCore, 0.36 + 0.45 * pulse);
        Draw.alpha((0.06 + 0.055 * pulse2) * zoneFade);
        Fill.circle(e.x + x, e.y + y, 0.12 + 0.28 * pulse);
      });
      Angles.randLenVectors(e.id + 700, 7, 2 + craterRadius * 0.72, (x, y) => {
        Draw.color(uraniumFxSmoke, uraniumFxDark, 0.42 + 0.20 * pulse);
        Draw.alpha((0.09 + 0.05 * pulse) * shellHeat);
        Fill.circle(e.x + x, e.y + y, 0.28 + 0.62 * pulse);
      });

      Drawf.light(e.x, e.y, Math.max(lightRadius, currentRadius * 0.93), uraniumFxFront, 0.15 * zoneFade * (0.68 + 0.32 * pulse));
    }
    Draw.reset();
  });
  fx.const.clip = clipSize;
}

createUraniumFragDissipateEffect('uranium-frag-dissipate-small', 20, 3.4, 5, 5, 16);
createUraniumFragDissipateEffect('uranium-frag-dissipate-medium', 10, 4.2, 3, 5.0, 14);

// 9x18 -> six uranium-small-frag bullets. Max spread ~=23.25, zone=25.5.
// Central impact scar intentionally reduced ~5x compared with the earlier pass.
createUraniumResidueEffect('uranium-residue-small', 420, 125, 25.5, 1.0, 10, 28, 70, 0.92, 0.22, 15);
// 12x108 -> three medium frags; each can spawn 15 small frags. Max chain ~=50.25.
// Central bullet scar remains smaller while the radiation field still expands
// beyond the actual damaging fragment radius.
createUraniumResidueEffect('uranium-residue-medium', 600, 225, 54.0, 3.4, 18, 40, 120, 0.82, 1, 10);
// 30x173 -> sixteen medium frags; same radial chain limit, much higher density.
createUraniumArtilleryAfterglow('uranium-residue-artillery', 780, 225, 55.0, 11.5, 58, 140, 10);


// Energy weapon VFX pass -----------------------------------------------------
// Plasma and laser effects are intentionally separated from ballistic VFX.
// The goal is dense, overfilled energy with readable timing: charge -> release
// -> travel/contact -> short ionized aftermath. No gameplay values are touched.
const energyFxWhite = uranium.getRuntimeColor('F8FFFF');
const energyFxGreen = uranium.getRuntimeColor('72FF77');
const energyFxGreenHot = uranium.getRuntimeColor('D8FF9A');
const energyFxGold = uranium.getRuntimeColor('FFD86A');
const energyFxOrange = uranium.getRuntimeColor('FF9E48');
const energyFxCyan = uranium.getRuntimeColor('8EEBFF');
const energyFxIce = uranium.getRuntimeColor('BDEEFF');
const energyFxBlue = uranium.getRuntimeColor('74AFFF');
const energyFxViolet = uranium.getRuntimeColor('B886FF');
const energyFxRad = uranium.getRuntimeColor('83FF59');
const energyFxDark = uranium.getRuntimeColor('17231B');

function createEnergyChargeEffect(name, lifetime, color, accent, radius, particles, lightRadius, heavy) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const fin = e.fin();
    const fout = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 13) / 4.7);
    const converge = radius * (1 - Math.pow(fin, 0.62));

    Draw.z(Layer.effect);
    Draw.color(color, energyFxWhite, 0.22 + 0.42 * fin);
    Draw.alpha((0.22 + 0.34 * fin) * (0.72 + 0.28 * pulse));
    Lines.stroke((0.7 + heavy * 0.55) * (0.45 + 0.55 * fin));
    Lines.circle(e.x, e.y, 2.5 + converge);

    Draw.color(accent, energyFxWhite, 0.30 + 0.35 * fin);
    Angles.randLenVectors(e.id, particles, 2 + converge, (x, y) => {
      const ang = Mathf.angle(-x, -y);
      Draw.alpha((0.18 + 0.62 * fin) * (0.7 + 0.3 * pulse));
      Fill.circle(e.x + x, e.y + y, 0.32 + fin * (0.7 + heavy * 0.25));
      Lines.stroke((0.45 + heavy * 0.22) * (0.4 + 0.6 * fin));
      Lines.lineAngle(e.x + x, e.y + y, ang, 0.8 + fin * (2.3 + heavy * 1.2));
    });

    Draw.color(energyFxWhite, color, 0.34 + 0.50 * fin);
    Draw.alpha(0.46 + 0.40 * fin);
    Fill.circle(e.x, e.y, (0.7 + heavy * 0.45) + fin * (2.0 + heavy * 1.0));

    Drawf.light(e.x, e.y, lightRadius * (0.45 + 0.55 * fin), color, (0.18 + 0.42 * fin) * (0.75 + 0.25 * pulse));
    Draw.reset();
  });
  fx.const.clip = lightRadius * 2.2;
}

function createEnergyMuzzleEffect(name, lifetime, color, accent, reach, spread, particles, lightRadius, heavy) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const fin = e.fin();
    const fout = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 11) / 3.2);

    Draw.z(Layer.effect);
    Draw.color(color, energyFxWhite, 0.45 + 0.35 * fout);
    Draw.alpha(0.84 * fout);
    Fill.circle(e.x, e.y, (2.0 + heavy * 1.25) * (0.72 + 0.28 * pulse) * (0.65 + 0.35 * fout));

    Draw.color(accent, energyFxWhite, 0.38 + 0.44 * fout);
    Draw.alpha(0.72 * fout);
    Drawf.tri(e.x, e.y, 2.8 + heavy * 1.8, reach * (0.45 + 0.55 * fout), e.rotation);
    Draw.alpha(0.34 * fout);
    Drawf.tri(e.x, e.y, 1.6 + heavy * 1.1, reach * 0.48 * fout, e.rotation + 180);

    Angles.randLenVectors(e.id, particles, 2 + spread * fin, e.rotation, 50 + heavy * 8, (x, y) => {
      const ang = Mathf.angle(x, y);
      Draw.color(color, accent, 0.25 + 0.55 * fin);
      Draw.alpha((0.28 + 0.52 * fout) * (0.75 + 0.25 * pulse));
      Lines.stroke((0.55 + heavy * 0.30) * fout);
      Lines.lineAngle(e.x + x, e.y + y, ang, 1.2 + fout * (3.8 + heavy * 2.0));
      Fill.circle(e.x + x, e.y + y, 0.22 + 0.45 * fout);
    });

    Drawf.light(e.x, e.y, lightRadius * (0.72 + 0.28 * fout), color, 0.58 * fout);
    Draw.reset();
  });
  fx.const.clip = lightRadius * 2.0;
}

function createPlasmaTrailEffect(name, lifetime, color, accent, radius, particles, backward, lightRadius, turbulent) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const fin = e.fin();
    const fout = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 19) / 4.3);
    const backRot = e.rotation + 180;

    Draw.z(Layer.bullet - 0.02);
    Draw.color(color, accent, 0.25 + 0.50 * fin);
    Draw.alpha((0.16 + 0.34 * fout) * (0.75 + 0.25 * pulse));
    Fill.circle(e.x, e.y, radius * (0.46 + 0.62 * fout));

    Angles.randLenVectors(e.id, particles, 1 + backward * fin, backRot, 30 + turbulent * 18, (x, y) => {
      Draw.color(accent, energyFxWhite, 0.18 + 0.46 * fout);
      Draw.alpha((0.12 + 0.34 * fout) * (0.72 + 0.28 * pulse));
      Fill.circle(e.x + x, e.y + y, 0.18 + radius * 0.18 * fout);
      Lines.stroke((0.35 + turbulent * 0.18) * fout);
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 0.6 + 2.2 * fout);
    });

    if (turbulent > 0.45) {
      Draw.color(color, energyFxWhite, 0.35 + 0.25 * pulse);
      Draw.alpha(0.12 * fout * turbulent);
      Lines.stroke(0.55 * fout);
      Lines.circle(e.x, e.y, radius * (0.8 + 0.32 * pulse));
    }

    Drawf.light(e.x, e.y, lightRadius * (0.60 + 0.40 * fout), color, 0.20 * fout);
    Draw.reset();
  });
  fx.const.clip = Math.max(32, lightRadius * 1.6);
}

function createPlasmaImpactEffect(name, lifetime, color, accent, radius, sparks, afterglowRadius, lightRadius, heavy, unstable, clean) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const fin = e.fin();
    const fout = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 29) / 5.8);
    const burstLife = Math.min(18 + heavy * 4, lifetime * 0.34);
    const burstFin = Math.min(1, e.time / burstLife);
    const burstOut = 1 - burstFin;

    Draw.z(Layer.effect);
    if (e.time <= burstLife) {
      Draw.color(energyFxWhite, color, 0.42 + 0.40 * burstFin);
      Draw.alpha(0.96 * burstOut);
      Fill.circle(e.x, e.y, (2.6 + heavy * 2.0) * (0.72 + 0.48 * burstOut));

      Draw.color(color, accent, 0.35 + 0.44 * burstFin);
      Lines.stroke((1.4 + heavy * 0.85) * burstOut);
      Lines.circle(e.x, e.y, 2 + radius * Math.pow(burstFin, 0.62));

      Angles.randLenVectors(e.id, sparks, 3 + radius * Math.pow(burstFin, 0.72), (x, y) => {
        const ang = Mathf.angle(x, y);
        Draw.color(accent, energyFxWhite, 0.25 + 0.55 * burstOut);
        Draw.alpha((0.46 + 0.48 * burstOut) * (0.75 + 0.25 * pulse));
        Lines.stroke((0.6 + heavy * 0.34) * burstOut);
        Lines.lineAngle(e.x + x, e.y + y, ang, 1.2 + burstOut * (4.5 + heavy * 2.3));
        Fill.circle(e.x + x, e.y + y, 0.25 + 0.62 * burstOut);
      });
    }

    // Ionized aftermath: emissive gas and tiny charged motes, not a physical crater.
    Draw.z(Layer.debris + 0.22);
    Draw.color(color, accent, 0.34 + 0.34 * pulse);
    Draw.alpha((0.035 + 0.095 * pulse) * fout * (0.85 + 0.15 * heavy));
    Fill.circle(e.x, e.y, afterglowRadius * (0.62 + 0.12 * pulse) * (0.88 + 0.12 * fout));

    Angles.randLenVectors(e.id + 501, 5 + Math.floor(sparks * 0.32), afterglowRadius * (0.55 + 0.35 * fin), (x, y) => {
      Draw.color(accent, energyFxWhite, 0.18 + 0.58 * pulse);
      Draw.alpha((0.07 + 0.10 * pulse) * fout);
      Fill.circle(e.x + x, e.y + y, 0.13 + 0.34 * fout);
    });

    if (unstable > 0) {
      Draw.color(energyFxViolet, color, 0.45 + 0.35 * pulse);
      Draw.alpha(0.10 * fout * unstable);
      Lines.stroke((0.42 + 0.22 * pulse) * fout);
      for (let i = 0; i < 3 + Math.floor(unstable * 2); i++) {
        const ang = (e.id * 23 + i * 97 + e.time * (1.2 + i * 0.12)) % 360;
        const len = afterglowRadius * (0.35 + 0.24 * ((i + 1) / 5));
        Lines.lineAngle(e.x, e.y, ang, len * (0.45 + 0.55 * fout));
      }
    }

    if (clean > 0) {
      Draw.color(energyFxWhite, energyFxCyan, 0.45 + 0.35 * pulse);
      Draw.alpha(0.09 * fout * clean);
      Lines.stroke(0.55 * fout);
      Lines.circle(e.x, e.y, afterglowRadius * (0.32 + 0.12 * pulse));
    }

    Drawf.light(e.x, e.y, lightRadius * (0.70 + 0.30 * pulse), color, (0.18 + 0.34 * burstOut) * Math.max(fout, burstOut));
    Draw.reset();
  });
  fx.const.clip = Math.max(radius, lightRadius) * 2.3;
}

function createPlasmaDissipateEffect(name, lifetime, color, accent, radius, particles, lightRadius) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const fout = e.fout();
    const fin = e.fin();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 17) / 4.1);
    Draw.z(Layer.effect);
    Draw.color(color, energyFxWhite, 0.25 + 0.42 * fin);
    Draw.alpha(0.28 * fout);
    Lines.stroke((0.8 + 0.35 * pulse) * fout);
    Lines.circle(e.x, e.y, radius * (0.42 + 0.58 * fin));
    Angles.randLenVectors(e.id, particles, 2 + radius * 0.75 * fin, (x, y) => {
      Draw.color(accent, color, 0.38 + 0.30 * pulse);
      Draw.alpha((0.12 + 0.20 * pulse) * fout);
      Fill.circle(e.x + x, e.y + y, 0.18 + 0.36 * fout);
    });
    Drawf.light(e.x, e.y, lightRadius * (0.62 + 0.38 * fout), color, 0.16 * fout);
    Draw.reset();
  });
  fx.const.clip = lightRadius * 1.8;
}

function createLaserContactEffect(name, lifetime, color, accent, radius, sparks, lightRadius, style, heavy) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const fin = e.fin();
    const fout = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 13) / 3.8);

    Draw.z(Layer.effect);
    Draw.color(energyFxWhite, color, 0.42 + 0.42 * fin);
    Draw.alpha((0.55 + 0.34 * fout) * fout);
    Fill.circle(e.x, e.y, (0.8 + heavy * 0.7) * (0.72 + 0.42 * pulse));

    Angles.randLenVectors(e.id, sparks, 1.5 + radius * fin, (x, y) => {
      const ang = Mathf.angle(x, y);
      Draw.color(color, accent, 0.30 + 0.48 * fin);
      Draw.alpha((0.32 + 0.55 * fout) * fout);
      Lines.stroke((0.45 + heavy * 0.28) * fout);
      if (style == 'frost') {
        Fill.square(e.x + x, e.y + y, 0.25 + 0.48 * fout, ang);
      } else {
        Lines.lineAngle(e.x + x, e.y + y, ang, 0.8 + fout * (2.8 + heavy * 1.8));
      }
    });

    if (style == 'rad') {
      Draw.color(energyFxRad, energyFxWhite, 0.30 + 0.45 * pulse);
      Draw.alpha(0.10 * fout);
      Draw.rect(Core.atlas.find('uranium-mod-radiation'), e.x, e.y, 2.8 + heavy * 1.4, 2.8 + heavy * 1.4, e.time * 2.4 + e.id % 180);
    }

    Drawf.light(e.x, e.y, lightRadius * (0.65 + 0.35 * pulse), color, 0.28 * fout);
    Draw.reset();
  });
  fx.const.clip = lightRadius * 1.8;
}


function createLaserEndpointLiveEffect(name, lifetime, color, accent, radius, sparks, smokeCount, lightRadius, style, heavy) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const fin = e.fin();
    const fout = e.fout();
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 23) / 3.4);
    const hot = Math.max(0, 1 - fin * 1.45);

    Draw.z(Layer.effect + 0.02);

    // Brighter live contact without increasing the apparent damage radius: a
    // soft emissive corona sits under the compact white-hot interaction core.
    Draw.color(color, accent, 0.34 + 0.40 * pulse);
    Draw.alpha((0.12 + 0.10 * hot) * fout);
    Fill.circle(e.x, e.y, (1.45 + heavy * 1.20) * (0.82 + 0.22 * pulse));

    Draw.color(energyFxWhite, accent, 0.24 + 0.38 * fin);
    Draw.alpha((0.76 + 0.20 * hot) * fout);
    Fill.circle(e.x, e.y, (1.0 + heavy * 0.95) * (0.80 + 0.36 * pulse));

    // The live terminus is violent but compact: sparks reveal continuous energy
    // transfer without pretending the beam has splash damage.
    Angles.randLenVectors(e.id + 17, sparks, 2 + radius * Math.pow(fin, 0.68), (x, y) => {
      const ang = Mathf.angle(x, y);
      Draw.color(style == 'frost' ? energyFxIce : accent, energyFxWhite, 0.20 + 0.54 * hot);
      Draw.alpha((0.26 + 0.54 * hot) * fout);
      Lines.stroke((0.48 + heavy * 0.32) * fout);
      if (style == 'frost') {
        Fill.square(e.x + x, e.y + y, 0.22 + 0.55 * fout, ang + 45);
        Lines.lineAngle(e.x + x, e.y + y, ang, 0.8 + 2.8 * fout * heavy);
      } else {
        Lines.lineAngle(e.x + x, e.y + y, ang, 1.0 + fout * (3.4 + heavy * 2.3));
      }
    });

    // Smoke/vapor is deliberately slower than the sparks so the endpoint feels
    // like material is actually being heated, frozen or irradiated.
    Angles.randLenVectors(e.id + 91, smokeCount, 1 + radius * 0.68 * Math.pow(fin, 0.78), (x, y) => {
      let smokeA = 0.10 + 0.20 * fout;
      if (style == 'frost') {
        Draw.color(uranium.getRuntimeColor('D9F7FF'), uranium.getRuntimeColor('86BCD0'), 0.38 + 0.36 * fin);
        smokeA *= 0.90;
      } else if (style == 'rad') {
        Draw.color(uranium.getRuntimeColor('263829'), uranium.getRuntimeColor('5CA74B'), 0.30 + 0.30 * pulse);
        smokeA *= 0.95;
      } else {
        Draw.color(uranium.getRuntimeColor('343532'), uranium.getRuntimeColor('6A6A62'), 0.28 + 0.28 * fin);
      }
      Draw.alpha(smokeA * fout);
      Fill.circle(e.x + x * 0.78, e.y + y * 0.78, (0.65 + heavy * 0.55) * (0.55 + 0.70 * fin));
    });

    if (style == 'rad') {
      Draw.color(energyFxRad, energyFxWhite, 0.25 + 0.48 * pulse);
      Draw.alpha(0.10 * fout);
      Lines.stroke((0.48 + 0.25 * pulse) * fout);
      for (let i = 0; i < 3 + Math.floor(heavy); i++) {
        const ang = e.id * 17 + i * 117 + e.time * (1.2 + 0.15 * i);
        Lines.lineAngle(e.x, e.y, ang, (2.0 + 2.4 * pulse) * heavy * fout);
      }
    }

    Drawf.light(e.x, e.y, lightRadius * (0.76 + 0.34 * pulse), color, (0.32 + 0.40 * hot) * fout);
    Draw.reset();
  });
  fx.const.clip = lightRadius * 2.0;
}

function createLaserEndpointResidueEffect(name, lifetime, color, accent, radius, crackCount, lightRadius, style, heavy) {
  const fx = uranium.createEffect(name, lifetime, (e) => {
    const fin = e.fin();
    const fout = e.fout();
    const heat = Math.max(0, 1 - fin / (style == 'rad' ? 0.82 : 0.62));
    const glow = Math.pow(heat, 1.35);
    const pulse = 0.5 + 0.5 * Math.sin((e.time + e.id % 31) / 8.0);

    Draw.z(Layer.scorch + 0.055);

    // Irregular physical mark: several deterministic overlapping patches prevent
    // the result from reading as a perfect painted circle.
    for (let i = 0; i < 7; i++) {
      const ang = (e.id * 23.7 + i * 137.3) % 360,
        dst = radius * (0.10 + 0.30 * ((i * 37 + e.id) % 11) / 10),
        px = e.x + Angles.trnsx(ang, dst),
        py = e.y + Angles.trnsy(ang, dst),
        rr = radius * (0.30 + 0.16 * ((i * 17 + e.id) % 9) / 8);

      if (style == 'frost') {
        Draw.color(uranium.getRuntimeColor('6D8990'), uranium.getRuntimeColor('CFF7FF'), 0.18 + 0.54 * glow);
        Draw.alpha((0.15 + 0.16 * glow) * fout);
      } else if (style == 'rad') {
        Draw.color(uranium.getRuntimeColor('111812'), uranium.getRuntimeColor('2B4B28'), 0.18 + 0.32 * glow);
        Draw.alpha((0.26 + 0.12 * glow) * fout);
      } else {
        Draw.color(uranium.getRuntimeColor('151613'), uranium.getRuntimeColor('4A3527'), 0.18 + 0.34 * glow);
        Draw.alpha((0.30 + 0.12 * glow) * fout);
      }
      Fill.circle(px, py, rr);
    }

    // Cooling fissures. Normal/Spartan transition from white-hot -> amber -> dark;
    // Frost transitions from luminous ice -> pale fractured ground; Radiation keeps
    // a weak green afterglow for most of its lifetime.
    Draw.z(Layer.debris + 0.08);
    Angles.randLenVectors(e.id + 401, crackCount, radius * (0.52 + 0.25 * (1 - heat)), (x, y) => {
      const sx = e.x + x * 0.18,
        sy = e.y + y * 0.18,
        mx = e.x + x * 0.58 + Angles.trnsx(Mathf.angle(x, y) + 90, 0.8 * heavy * Math.sin(x + y)),
        my = e.y + y * 0.58 + Angles.trnsy(Mathf.angle(x, y) + 90, 0.8 * heavy * Math.sin(x + y));

      if (style == 'frost') {
        Draw.color(uranium.getRuntimeColor('8EE7FF'), energyFxWhite, 0.34 + 0.55 * glow);
      } else if (style == 'rad') {
        Draw.color(uranium.getRuntimeColor('57D84D'), uranium.getRuntimeColor('DFFF8E'), 0.28 + 0.58 * glow);
      } else {
        Draw.color(uranium.getRuntimeColor('FF8747'), energyFxWhite, 0.18 + 0.72 * glow);
      }
      Draw.alpha((0.045 + 0.34 * glow) * fout);
      Lines.stroke((0.38 + 0.34 * heavy) * (0.35 + 0.65 * glow));
      Lines.line(sx, sy, mx, my);
      Lines.line(mx, my, e.x + x, e.y + y);
    });

    if (style == 'frost') {
      Draw.color(energyFxIce, energyFxWhite, 0.30 + 0.45 * glow);
      Draw.alpha((0.05 + 0.11 * glow) * fout);
      Angles.randLenVectors(e.id + 530, 5 + Math.floor(heavy * 2), radius * 0.72, (x, y) => {
        Fill.square(e.x + x, e.y + y, 0.22 + 0.32 * glow, Mathf.angle(x, y) + 45);
      });
    } else if (style == 'rad') {
      Draw.color(energyFxRad, accent, 0.35 + 0.35 * pulse);
      Draw.alpha((0.025 + 0.070 * glow) * fout);
      Draw.rect(Core.atlas.find('uranium-mod-radiation'), e.x, e.y, radius * 0.46, radius * 0.46, e.id % 360 + e.time * 0.14);
    }

    Drawf.light(e.x, e.y, lightRadius * (0.52 + 0.48 * glow), color, (0.025 + 0.19 * glow) * fout);
    Draw.reset();
  });
  fx.const.clip = Math.max(radius * 3.0, lightRadius * 1.8);
}

// Live terminus interaction + persistent cooling ground marks.
createLaserEndpointLiveEffect('energy-laser-end-dalh-live', 28, energyFxGreen, energyFxCyan, 10, 8, 4, 30, 'laser', 0.70);
createLaserEndpointLiveEffect('energy-laser-end-dalh-frost-live', 34, energyFxCyan, energyFxIce, 11, 9, 5, 32, 'frost', 0.72);
createLaserEndpointLiveEffect('energy-laser-end-dalh-rad-live', 38, energyFxRad, energyFxGreenHot, 12, 10, 5, 34, 'rad', 0.78);
createLaserEndpointLiveEffect('energy-laser-end-spartan-live', 34, energyFxGold, energyFxOrange, 15, 13, 6, 42, 'laser', 1.35);
createLaserEndpointLiveEffect('energy-laser-end-spartan-frost-live', 40, energyFxIce, energyFxCyan, 16, 14, 7, 44, 'frost', 1.32);
createLaserEndpointLiveEffect('energy-laser-end-spartan-rad-live', 46, energyFxRad, energyFxGold, 17, 15, 7, 48, 'rad', 1.42);

createLaserEndpointResidueEffect('energy-laser-end-dalh-residue', 320, energyFxGreen, energyFxCyan, 5.1, 6, 22, 'laser', 0.70);
createLaserEndpointResidueEffect('energy-laser-end-dalh-frost-residue', 300, energyFxCyan, energyFxIce, 5.3, 7, 23, 'frost', 0.72);
createLaserEndpointResidueEffect('energy-laser-end-dalh-rad-residue', 420, energyFxRad, energyFxGreenHot, 5.7, 7, 25, 'rad', 0.80);
createLaserEndpointResidueEffect('energy-laser-end-spartan-residue', 480, energyFxGold, energyFxOrange, 10.5, 10, 34, 'laser', 1.35);
createLaserEndpointResidueEffect('energy-laser-end-spartan-frost-residue', 430, energyFxIce, energyFxCyan, 11.0, 11, 36, 'frost', 1.32);
createLaserEndpointResidueEffect('energy-laser-end-spartan-rad-residue', 560, energyFxRad, energyFxGold, 11.8, 12, 40, 'rad', 1.45);

// Charge effects. These match the actual firstShotDelay values: Druzhba/Spartan
// are short charges, Dalh has the long deliberate one-second build-up.
createEnergyChargeEffect('energy-charge-druzhba-vfx', 30, energyFxGreen, energyFxGreenHot, 13, 12, 34, 0.75);
createEnergyChargeEffect('energy-charge-dalh-vfx', 60, energyFxGreen, energyFxCyan, 15, 14, 38, 0.65);
createEnergyChargeEffect('energy-charge-spartan-vfx', 30, energyFxGold, energyFxOrange, 18, 18, 50, 1.25);

// Plasma release/travel/impact identities.
createEnergyMuzzleEffect('energy-plasma-muzzle-green', 18, energyFxGreen, energyFxGreenHot, 19, 20, 12, 36, 0.75);
createEnergyMuzzleEffect('energy-plasma-muzzle-green-over', 32, energyFxGreenHot, energyFxGold, 38, 36, 24, 72, 1.55);
createEnergyMuzzleEffect('energy-plasma-muzzle-legend', 20, energyFxGreen, energyFxViolet, 22, 22, 15, 42, 0.95);
createEnergyMuzzleEffect('energy-plasma-muzzle-legend-over', 35, energyFxGreenHot, energyFxViolet, 44, 40, 28, 82, 1.70);
createEnergyMuzzleEffect('energy-plasma-muzzle-pure', 18, energyFxCyan, energyFxWhite, 22, 18, 12, 42, 0.85);
createEnergyMuzzleEffect('energy-plasma-muzzle-pure-over', 31, energyFxIce, energyFxWhite, 44, 31, 24, 84, 1.55);

createPlasmaTrailEffect('energy-plasma-trail-green', 24, energyFxGreen, energyFxGreenHot, 2.2, 4, 8, 22, 0.65);
createPlasmaTrailEffect('energy-plasma-trail-green-over', 38, energyFxGreenHot, energyFxGold, 4.4, 9, 17, 48, 1.05);
createPlasmaTrailEffect('energy-plasma-trail-legend', 27, energyFxGreen, energyFxViolet, 2.5, 6, 10, 27, 1.0);
createPlasmaTrailEffect('energy-plasma-trail-legend-over', 42, energyFxGreenHot, energyFxViolet, 5.0, 12, 19, 56, 1.35);
createPlasmaTrailEffect('energy-plasma-trail-pure', 22, energyFxCyan, energyFxWhite, 2.1, 3, 7, 25, 0.25);
createPlasmaTrailEffect('energy-plasma-trail-pure-over', 36, energyFxIce, energyFxWhite, 4.2, 7, 15, 52, 0.42);

createPlasmaImpactEffect('energy-plasma-hit-green', 66, energyFxGreen, energyFxGreenHot, 19, 15, 10, 40, 0.75, 0.2, 0);
createPlasmaImpactEffect('energy-plasma-hit-green-over', 122, energyFxGreenHot, energyFxGold, 26, 32, 20, 82, 1.75, 0.4, 0);
createPlasmaImpactEffect('energy-plasma-hit-legend', 76, energyFxGreen, energyFxViolet, 22, 18, 12, 46, 0.90, 1.0, 0);
createPlasmaImpactEffect('energy-plasma-hit-legend-over', 142, energyFxGreenHot, energyFxViolet, 30, 38, 24, 92, 1.90, 1.35, 0);
createPlasmaImpactEffect('energy-plasma-hit-pure', 58, energyFxCyan, energyFxWhite, 20, 14, 9, 44, 0.85, 0, 1.0);
createPlasmaImpactEffect('energy-plasma-hit-pure-over', 112, energyFxIce, energyFxWhite, 27, 30, 18, 88, 1.75, 0, 1.15);

createPlasmaDissipateEffect('energy-plasma-dissipate-green', 26, energyFxGreen, energyFxGreenHot, 9, 8, 24);
createPlasmaDissipateEffect('energy-plasma-dissipate-legend', 30, energyFxGreen, energyFxViolet, 10, 10, 28);
createPlasmaDissipateEffect('energy-plasma-dissipate-pure', 24, energyFxCyan, energyFxWhite, 8, 7, 26);
createPlasmaDissipateEffect('energy-plasma-dissipate-green-over', 58, energyFxGreenHot, energyFxGold, 18, 15, 52);
createPlasmaDissipateEffect('energy-plasma-dissipate-legend-over', 66, energyFxGreenHot, energyFxViolet, 20, 18, 60);
createPlasmaDissipateEffect('energy-plasma-dissipate-pure-over', 54, energyFxIce, energyFxWhite, 16, 14, 52);

// Laser release/contact effects. Contact VFX are intentionally short because
// collideLine can contact multiple targets in one damage pulse; audio remains at
// the weapon release, avoiding a dense squeal from repeated hit sounds.
createEnergyMuzzleEffect('energy-laser-muzzle-dalh', 16, energyFxGreen, energyFxCyan, 24, 17, 10, 34, 0.55);
createEnergyMuzzleEffect('energy-laser-muzzle-dalh-frost', 17, energyFxCyan, energyFxIce, 24, 17, 11, 36, 0.55);
createEnergyMuzzleEffect('energy-laser-muzzle-dalh-rad', 17, energyFxRad, energyFxGreenHot, 25, 19, 12, 38, 0.65);
createEnergyMuzzleEffect('energy-laser-muzzle-spartan', 20, energyFxGold, energyFxOrange, 34, 26, 18, 52, 1.35);
createEnergyMuzzleEffect('energy-laser-muzzle-spartan-frost', 20, energyFxIce, energyFxCyan, 34, 25, 18, 52, 1.30);
createEnergyMuzzleEffect('energy-laser-muzzle-spartan-rad', 21, energyFxRad, energyFxGold, 35, 27, 20, 56, 1.40);

createLaserContactEffect('energy-laser-contact-dalh', 22, energyFxGreen, energyFxCyan, 10, 7, 25, 'laser', 0.55);
createLaserContactEffect('energy-laser-contact-frost', 30, energyFxCyan, energyFxIce, 11, 8, 28, 'frost', 0.60);
createLaserContactEffect('energy-laser-contact-rad', 38, energyFxRad, energyFxGreenHot, 12, 9, 30, 'rad', 0.70);
createLaserContactEffect('energy-laser-contact-spartan', 28, energyFxGold, energyFxOrange, 14, 11, 36, 'laser', 1.25);
createLaserContactEffect('energy-laser-contact-spartan-frost', 36, energyFxIce, energyFxCyan, 15, 12, 38, 'frost', 1.20);
createLaserContactEffect('energy-laser-contact-spartan-rad', 44, energyFxRad, energyFxGold, 16, 13, 42, 'rad', 1.30);

// Quality roll feedback ------------------------------------------------------
// Built from the same primitives used by vanilla Mindustry Fx: deterministic
// radial vectors, fading particles and Drawf lights. Each rarity has its own
// density/lifetime profile while the effect colour is supplied by the quality.
function createTurretQualitySmokeEffect(name, lifetime, particleCount, spread, particleSize, lightCount, lightRadius, lightAlpha, ringCount, twist) {
  uranium.createEffect(name, lifetime, (e) => {
    const blockScale = 0.82 + Math.max(1, e.rotation) * 0.14;
    const travel = spread * blockScale;
    const turn = e.fin() * twist * Math.PI / 180;
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);

    // A broad light anchors the cloud to the turret while the smaller lights
    // travel with a subset of the smoke, making the smoke itself look emissive.
    Drawf.light(
      e.x,
      e.y,
      lightRadius * blockScale * (0.72 + e.fout() * 0.28),
      e.color,
      lightAlpha * e.fout()
    );

    Angles.randLenVectors(e.id, particleCount, 2 + travel * e.finpow(), (x, y) => {
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      const smokeGrow = 0.70 + e.fin() * 0.80;

      Draw.color(e.color);
      Draw.alpha(0.72 * e.fout());
      Fill.circle(e.x + rx, e.y + ry, particleSize * smokeGrow);
    });

    Angles.randLenVectors(e.id + 1709, lightCount, 1 + travel * 0.78 * e.finpow(), (x, y) => {
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      Drawf.light(
        e.x + rx,
        e.y + ry,
        (4 + particleSize * 4.5) * blockScale,
        e.color,
        0.18 * e.fout()
      );
    });

    if (ringCount > 0) {
      Draw.color(e.color);
      for (let i = 0; i < ringCount; i++) {
        Draw.alpha((0.48 - i * 0.10) * e.fout());
        Lines.stroke((1.25 + i * 0.45) * e.fout());
        Lines.circle(e.x, e.y, (3 + i * 5) * blockScale + travel * (0.42 + i * 0.10) * e.finpow());
      }
    }

    Draw.reset();
  });
}

// Very bad: short, sparse, heavy-looking cloud.
createTurretQualitySmokeEffect('turret-quality-very-bad', 34, 5, 13, 1.45, 2, 18, 0.26, 0, -8);
// Good: similarly restrained, but cleaner and slightly wider.
createTurretQualitySmokeEffect('turret-quality-good', 38, 7, 17, 1.35, 2, 22, 0.32, 1, 5);
// Quality: clearly noticeable medium rarity burst.
createTurretQualitySmokeEffect('turret-quality-quality', 50, 14, 25, 1.55, 4, 30, 0.42, 1, 10);
// Masterpiece: broad golden cloud with a double rarity pulse.
createTurretQualitySmokeEffect('turret-quality-masterpiece', 68, 25, 36, 1.75, 7, 42, 0.58, 2, 16);
// Cursed: the densest cloud, rotating the opposite way for an ominous profile.
createTurretQualitySmokeEffect('turret-quality-cursed', 72, 28, 34, 1.85, 7, 40, 0.56, 1, -34);

