const
  uranium = global.uranium;

//FragBullets 
uranium
  .createBullet("BasicBulletType", 'uranium-small-frag', {
    draw(b) {
      let
        fin = b.time / this.lifetime,
        fout = 1 - fin;
      Draw.color(Color.valueOf("33dd33"), Color.white);
      Draw.alpha(1 * fout + 0.1);
      Lines.stroke(fout * 1 + 1);
      Fill.circle(b.x, b.y, fin * 4 + 2);
      Draw.alpha(1 * fout + 0.5);
      Draw.color(Color.valueOf("77dd77"), Color.white);
      Fill.circle(b.x, b.y, fout * 2 + 1);
    }
  })
  .setBullet(10, 0.13, 125, 10, 15, 5)
  .customSetting({
    status: uranium.getSEffects('radiation'),
    hitEffect: Fx.none,
    despawnEffect: Fx.none,
    smokeEffect: Fx.none,
    pierceCap: 4
  });

uranium
  .createBullet("BasicBulletType", "uranium-medium-frag", {
    draw(b) {
      let
        fin = b.time / this.lifetime,
        fout = 1 - fin;
      Draw.color(Color.valueOf("33dd33"), Color.white);
      Draw.alpha(0.8);
      Lines.stroke(fout * 1 + 2);
      Fill.circle(b.x, b.y, fin * 4 + 1);
      Draw.color(Color.valueOf("77dd77"), Color.white);
      Fill.circle(b.x, b.y, fout * 2 + 1);
    }
  })
  .setBullet(0, 0.2, 100)
  .customSetting({
    pierce: true,
    hitEffect: Fx.melting,
    fragBullets: 15,
    status: uranium.getSEffects('radiation'),
    despawnEffect: Fx.none,
    smokeEffect: Fx.none,
    fragBullet: uranium.getBullet('uranium-small-frag')
  });

uranium
  .createBullet("LightningBulletType", "lightining-small-frag", {})
  .setBullet(2, 2, 6, 10)
  .setDrawBullet(0, "#ffcc77", "#ffcc77", 1, 1)
  .customSetting({
    pierce: true,
    lightining: 2,
    lightningLength: 8,
    status: StatusEffects.shocked,
    lightningColor: Color.valueOf("CCFF00")
  });

uranium
  .createBullet("BasicBulletType", "lightining-medium-frag", {})
  .setBullet(10, 2, 15, 10)
  .setDrawBullet(0, "#ffcc77", "#ffcc77", 3, 3)
  .customSetting({
    pierce: true,
    fragBullets: 4,
    status: StatusEffects.shocked,
    despawnEffect: Fx.none,
    smokeEffect: Fx.none,
    fragBullet: uranium.getBullet('lightining-small-frag')
  });

uranium
  .createBullet("LightningBulletType", "lightining-big-frag", {})
  .setBullet(30, 2, 15, 10)
  .setDrawBullet(0, "#ffcc77", "#ffcc77", 3, 3)
  .customSetting({
    lightining: 5,
    lightningLength: 11,
    lightningColor: Color.valueOf("CCFF00"),
    pierce: true,
    fragBullets: 4,
    status: StatusEffects.shocked,
    despawnEffect: Fx.none,
    smokeEffect: Fx.none,
    fragBullet: uranium.getBullet('lightining-small-frag')
  });

//---------------------| 9x18
uranium //-------------| firearm
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("firearm")
  .setBullet(70, 8, 19, 10)
  .setDrawBullet(0, 0, 0, 5, 8)
  .customSetting({
    _quality: 1,
    _expMultiplier: 2
  });

uranium //-------------| titanium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("titanium")
  .setBullet(110, 13, 16, 10)
  .setDrawBullet(0, "#2093FF", "#70f3FF", 5, 9)
  .customSetting({
    reloadMultiplier: 1.3,
    _quality: 2
  });

uranium //-------------| aluminium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("aluminium")
  .setBullet(105, 14, 17, 10)
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 5, 10)
  .customSetting({
    _quality: 2,
    reloadMultiplier: 1.8
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
  });

uranium //-------------| thorium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("thorium")
  .setBullet(200, 8, 19, 10)
  .setDrawBullet(0, "#FF79C3", "#FFC9F3", 5, 8)
  .customSetting({
    _quality: 4,
    reloadMultiplier: 0.75,
    knockback: 6
  });

uranium //-------------| exp
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("exp")
  .setBullet(82, 10, 17, 10, 95, 30)
  .setDrawBullet(0, "#ff7777", "#ff0000", 5.5, 9)
  .customSetting({
    _quality: 3,
    smokeEffect: Fx.shootSmallSmoke
  });

uranium //-------------| altit
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("altit")
  .setBullet(0, 10, 17, 10, 55, 25)
  .setDrawBullet(0, "#BDEFFF", "#FDEFFF", 5, 9)
  .customSetting({
    _quality: 3,
    status: StatusEffects.shocked,
    pierceCap: 1,
    _expMultiplier: 4
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
    hitEffect: uranium.getEffect('thorium-ammo-blaze'),
    despawnEffect: uranium.getEffect('thorium-ammo-blaze'),
    homingRange: 20,
    knockback: 2,
    pierceCap: 1
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
    _expMultiplier: 0.5
  });

uranium //-------------| uranium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("uranium")
  .setBullet(75, 6, 25, 10, 100, 30)
  .setDrawBullet(0, "#66ff66", "#00ff00", 5.5, 9)
  .customSetting({
    _quality: 4,
    smokeEffect: Fx.none,
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
    smokeEffect: Fx.none
  });

uranium //-------------| tritium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("tritium")
  .setBullet(0, 12, 11, 10, 175, 40)
  .setDrawBullet(0, "#ccff99", "#ccff00", 5.5, 11)
  .customSetting({
    _quality: 5,
    smokeEffect: Fx.none,
    fragBullets: 4,
    fragBullet: uranium.getBullet('lightining-small-frag')
  });

uranium //-------------| iritrium
  .createBullet("BasicBulletType", '9x18', {})
  .ezAmmo("iritrium")
  .setBullet(0, 14, 11, 10, 260, 40)
  .setDrawBullet(0, "#E9FE31", "#F9FEC1", 5.5, 11)
  .customSetting({
    _quality: 5,
    despawnEffect: uranium.getEffect('iritrium-despawn'),
    hitEffect: uranium.getEffect('iritrium-despawn')
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
    pierceCap: 1
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
    pierceCap: 1
    // ammoUseEffect: Fx.shellEjectBig // Fix #1
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
    pierceCap: 2
    // ammoUseEffect: Fx.shellEjectBig // Fix #1
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
    pierceCap: 2
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
    knockback: 12
  });


uranium //-------------| exp
  .createBullet("BasicBulletType", '12x108', {})
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
        })
        .const
  });

uranium //-------------| altit
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("altit")
  .setBullet(0, 19, 20, 1, 105, 30)
  .setDrawBullet(0, "#BDEFFF", "#FDEFFF", 6, 13)
  .customSetting({
    _quality: 3,
    status: StatusEffects.shocked,
    pierceCap: 4
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
    hitEffect: uranium.getEffect('thorium-ammo-blaze-big'),
    despawnEffect: uranium.getEffect('thorium-ammo-blaze-big'),
    homingPower: 42,
    homingRange: 17,
    pierceCap: 3
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
  });

uranium //-------------| uranium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("uranium")
  .setBullet(60, 11, 17, 1, 90, 35)
  .setDrawBullet(0, "#99b979", "#75b870", 6.5, 15)
  .customSetting({
    _quality: 4,
    smokeEffect: Fx.flakExplosion,
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
  });

uranium //-------------| tritium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("tritium")
  .setBullet(0, 12, 12, 1, 222, 50)
  .setDrawBullet(0, "#ccff99", "#ccff00", 6.5, 15)
  .customSetting({
    _quality: 5,
    fragBullets: 4,
    fragBullet: uranium.getBullet('lightining-medium-frag')
  });

uranium //-------------| iritrium
  .createBullet("BasicBulletType", '12x108', {})
  .ezAmmo("iritrium")
  .setBullet(0, 14, 17, 1, 390, 60)
  .setDrawBullet(0, "#E9FE31", "#F9FEC1", 6.5, 15)
  .customSetting({
    _quality: 5,
    despawnEffect: uranium.getEffect('iritrium-despawn-big'),
    hitEffect: uranium.getEffect('iritrium-despawn-big')
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
    _expMultiplier: 2
  });

uranium//-------------| Титаниум
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('titanium_ART_round')
  .setBullet(0, 5.5, 1, 1, 200, 60)
  .setDrawBullet(0, "#2093FF", "#70f3FF", 14, 26)
  .customSetting({
    despawnEffect: uranium.getEffect('exploz_30x173'),
    _quality: 2,
    reloadMultiplier: 1.2
  });

uranium//-------------| aluminium
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('aluminium_ART_round')
  .setBullet(0, 6, 1, 1, 215, 60)
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 13.5, 27)
  .customSetting({
    _quality: 2,
    despawnEffect: uranium.getEffect('exploz_30x173'),
    reloadMultiplier: 1.3
  });

uranium//-------------| fire
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('fire_ART_round')
  .setBullet(0, 5, 1, 1, 140, 75)
  .setDrawBullet(0, "#F54C4C", "#FFFAFA", 14, 25)
  .customSetting({
    _quality: 1,
    despawnEffect: uranium.getEffect('napalm_30x173'),
    status: StatusEffects.burning,
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
    reloadMultiplier: 0.8
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
        })
        .const
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
    status: StatusEffects.shocked
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
    knockback: 6
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
    pierce: true
  });

uranium//-------------| uranium
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('uranium_ART_round')
  .setBullet(480, 4, 80, 1, 85, 80)
  .setDrawBullet(0, "#00ff00", "#66ff66", 15, 28)
  .customSetting({
    status: uranium.getSEffects('radiation'),
    fragBullets: 16,
    _quality: 4,
    reloadMultiplier: 0.9,
    fragBullet: uranium.getBullet('uranium-medium-frag'),
    despawnEffect: uranium.getEffect('exploz_30x173')
  });

uranium//-------------| iridium
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('iridium_ART_round')
  .setBullet(480, 7, 80, 1, 1100, 30)
  .setDrawBullet(0, "#ffffff", "#FFFAFA", 14, 27)
  .customSetting({
    _quality: 5,
    pierce: true,
    despawnEffect: uranium.getEffect('exploz_30x173')
  });

uranium//-------------| tritium
  .createBullet("ArtilleryBulletType", '30x173', {})
  .setAmmo('tritium_ART_round')
  .setBullet(480, 4, 80, 1, 320, 70)
  .setDrawBullet(0, "#ccff99", "#ccff00", 15, 28)
  .customSetting({
    fragBullets: 8,
    fragBullet: uranium.getBullet('lightining-big-frag'),
    pierce: true,
    despawnEffect: uranium.getEffect('exploz_30x173')
  });

uranium//-------------| iritrium
  .createBullet("ArtilleryBulletType", '30x173', {
    despawnEffect: uranium.getEffect('exploz_30x173')
  })
  .setAmmo('iritrium_ART_round')
  .setBullet(480, 6, 80, 1, 120, 70)
  .setDrawBullet(0, "#ccff99", "#ccff00", 15, 28)
  .customSetting({
    fragBullets: 4,
    fragBullet: uranium
      .createBullet("BasicBulletType", '', {})
      .setBullet(0, 7.5, 3, 1, 160, 50)
      .setDrawBullet(0, "#E9FE31", "#F9FEC1", 6.5, 15)
      .customSetting({
        despawnEffect: uranium.getEffect('iritrium-despawn-big'),
        hitEffect: uranium.getEffect('iritrium-despawn-big')
      }).const,
    pierce: true
  });



//Другое

uranium //-------------| Рельса
  .createBullet("BasicBulletType", 'relsa', {})
  .setAmmo('armatura')
  .setBullet(26, 12, 30, 9)
  .setDrawBullet(0, "#cccccc", "#3b45dc", 5, 20);

uranium //-------------| Звезда
  .createBullet("BasicBulletType", 'zvezda', {
    draw(b) {
      let
        fin = b.time / this.lifetime,
        fout = 1 - fin;
      Draw.color(Color.valueOf("77dd77"), Color.white);
      Draw.alpha(1);
      Lines.stroke(fout * 1 + 3);
      Lines.circle(b.x, b.y, fin * 3);
      Lines.circle(b.x, b.y, fout * 1);
    },
    getPreperedBullet() {
      return uranium
        .createBullet("BasicBulletType", 'p_zvezda', {
          draw(b) {
            let
              fin = b.time / this.lifetime,
              fout = 1 - fin;
            Draw.color(Color.valueOf("87Fd87"), Color.valueOf("FFFd87"));
            Draw.alpha(1);
            Lines.stroke(fout * 1 + 3);
            Lines.circle(b.x, b.y, fin * 3 + 1);
            Lines.circle(b.x, b.y, fout * 1);
            Draw.alpha(0.55);
            Lines.circle(b.x, b.y, fin * 3.5 + 4);
            Lines.circle(b.x, b.y, fin * 3.5 + 3);
          }
        })
        .setBullet(385, 7, 30)
        .customSetting({
          pierce: true,
          pierceCap: 3
        }).const;
    },
    getExtraTypes(name) {
      return this.extraType[name];
    },
    extraType: {
      'zvezda_legend': uranium
        .createBullet("BasicBulletType", 'p_p', {
          draw(b) {
            let
              fin = b.time / this.lifetime,
              fout = 1 - fin;
            Draw.color(Color.valueOf("87FF87"));
            Draw.alpha(1);
            Lines.stroke(fout * 1.5 + 3);
            Lines.circle(b.x, b.y, fin * 3.5 + 1);
            Draw.color(Color.valueOf("87FF87"), Color.white);
            Lines.circle(b.x, b.y, fout * 1.5);
          },
          getPreperedBullet() {
            return uranium
              .createBullet("BasicBulletType", 'p_p', {
                draw(b) {
                  let
                    fin = b.time / this.lifetime,
                    fout = 1 - fin;
                  Draw.color(Color.valueOf("87FF87"));
                  Draw.alpha(1);
                  Lines.stroke(fout * 1 + 3);
                  Lines.circle(b.x, b.y, fin * 3 + 1);
                  Lines.circle(b.x, b.y, fout * 1 + 0.5);
                  Draw.color(Color.valueOf("87FF87"), Color.white);
                  Draw.alpha(0.55);
                  Lines.circle(b.x, b.y, fin * 3.5 + 6);
                  Draw.color(Color.valueOf("7777FF"), Color.valueOf("87FF87"));
                  Lines.circle(b.x, b.y, fin * 3.5 + 5);
                }
              })
              .setBullet(385, 8, 26)
              .customSetting({
                pierce: true,
                pierceCap: 2,
                status: uranium.getSEffects('radiation')
              }).const;
          }
        })
        .setBullet(330, 7.5, 28)
        .customSetting({
          pierce: false,
          status: uranium.getSEffects('radiation')
        }).const,
      'pure_plasm': uranium
        .createBullet("BasicBulletType", 'p_p', {
          draw(b) {
            let
              fin = b.time / this.lifetime,
              fout = 1 - fin;
            Draw.color(Color.valueOf("DDddFF"));
            Draw.alpha(1);
            Lines.stroke(fout * 1 + 3);
            Lines.circle(b.x, b.y, fin * 3);
            Draw.color(Color.valueOf("9DadFF"), Color.white);
            Lines.circle(b.x, b.y, fout * 1);
          },
          getPreperedBullet() {
            return uranium
              .createBullet("BasicBulletType", 'p_p', {
                draw(b) {
                  let
                    fin = b.time / this.lifetime,
                    fout = 1 - fin;
                  Draw.color(Color.valueOf("DDddFF"));
                  Draw.alpha(1);
                  Lines.stroke(fout * 1 + 3);
                  Lines.circle(b.x, b.y, fin * 3 + 1);
                  Lines.circle(b.x, b.y, fout * 1);
                  Draw.color(Color.valueOf("9DadFF"), Color.white);
                  Draw.alpha(0.55);
                  Lines.circle(b.x, b.y, fin * 3.5 + 5);
                  Lines.circle(b.x, b.y, fin * 3.5 + 4);
                }
              })
              .setBullet(430, 8, 26)
              .customSetting({
                pierce: true,
                pierceCap: 4
              }).const;
          }
        })
        .setBullet(400, 7.5, 28)
        .customSetting({
          pierce: false
        }).const
    }
  })
  .setBullet(340, 7, 30)
  .customSetting({
    pierce: false
  })

uranium //-------------| Даль
  .createLaserBulet("LaserBulletType", 'dalh', {
    colors: [
      Color.valueOf("#87aF6677"),
      Color.valueOf("#87aF66dd"),
      Color.valueOf("#87aF66"),
      Color.valueOf("#87aF66")],
    strokes: [0.3, 0.5, 0.9, 1.2],
    length: 165,
    extraType: {
      'frost': uranium.
        createLaserBulet("LaserBulletType", '_dalh', {
          colors: [
            Color.valueOf("#9FCFF077"),
            Color.valueOf("#9FCFF0dd"),
            Color.valueOf("#9FCFF0"),
            Color.valueOf("#9FCFF0")],
          length: 170,
          strokes: [0.25, 0.5, 0.9, 1.2],
          status: StatusEffects.freezing
        })
        .setBullet(65, 0.01, 16)
        .customSetting({
          pierce: true
        })
        .setDrawBullet(0, "#77dd77", "#77dd7733", 17, 17)
        .const,
      'rad': uranium.
        createLaserBulet("LaserBulletType", '_dalh', {
          colors: [
            Color.valueOf("#87FF6677"),
            Color.valueOf("#87FF66dd"),
            Color.valueOf("#87FF66"),
            Color.valueOf("#87FF66")],
          length: 163,
          status: uranium.getSEffects('radiation'),
          strokes: [0.3, 0.5, 0.9, 1.2]
        })
        .setBullet(75, 0, 16)
        .customSetting({
          pierce: true
        })
        .setDrawBullet(0, "#77dd77", "#77dd7733", 17, 17)
        .const
    },
    getExtraTypes(name) {
      return this.extraType[name];
    },
    getRandomType() {
      let
        keys = Object.keys(this.extraType);
      keys.push('original');
      let
        key = parseInt(keys.length * Math.random());
      if (keys[key] == 'original') {
        return this;
      } else {
        return this.extraType[keys[key]];
      }
    }
  })
  .setBullet(75, 0, 16)
  .customSetting({
    pierce: true
  })
  .setDrawBullet(0, "#77dd77", "#77dd7733", 17, 17);

uranium //-------------| Spartan
  .createLaserBulet("LaserBulletType", 'spartan', {
    colors: [
      Color.valueOf("#FFdd6677"),
      Color.valueOf("#FFdd66dd"),
      Color.valueOf("#FFcc66"),
      Color.valueOf("#FFdd66")],
    strokes: [0.5, 0.8, 1.3, 1.6],
    length: 220,
    extraType: {
      'frost': uranium.
        createLaserBulet("LaserBulletType", '_dalh', {
          colors: [
            Color.valueOf("#9FCFF077"),
            Color.valueOf("#9FCFF0dd"),
            Color.valueOf("#9FCFF0"),
            Color.valueOf("#9FCFF0")],
          length: 225,
          strokes: [0.5, 0.8, 1.3, 1.6],
          status: StatusEffects.freezing
        })
        .setBullet(70, 0.01, 18)
        .customSetting({
          pierce: true
        })
        .setDrawBullet(0, "#77dd77", "#77dd7733", 17, 17)
        .const,
      'rad': uranium.
        createLaserBulet("LaserBulletType", '_dalh', {
          colors: [
            Color.valueOf("#87FF6677"),
            Color.valueOf("#87FF66dd"),
            Color.valueOf("#87FF66"),
            Color.valueOf("#87FF66")],
          length: 210,
          status: uranium.getSEffects('radiation'),
          strokes: [0.5, 0.8, 1.3, 1.6]
        })
        .setBullet(85, 0, 18)
        .customSetting({
          pierce: true
        })
        .setDrawBullet(0, "#77dd77", "#77dd7733", 17, 17)
        .const
    },
    getExtraTypes(name) {
      return this.extraType[name];
    },
    getRandomType() {
      let
        keys = Object.keys(this.extraType);
      keys.push('original');
      let
        key = parseInt(keys.length * Math.random());
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
    hitSize: 3
  })
  .setDrawBullet(0, "#77dd77", "#77dd7733", 17, 17);


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

