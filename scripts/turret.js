const
  uranium = global.uranium;

let
  sounds = {
    '12-shot': Vars.mods.scripts.loadSound('12-shot'),
    'big_shot': Vars.mods.scripts.loadSound('big_shot')
  }

//-------------1 тир турелей
uranium//------Турель жук
  .createItemTurret("11_auto_turret", '9x18', {
    tier: 1,
    expShoot: 4,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 1,
    health: 260,
    size: 1,
    maxAmmo: 10,
    recoil: 1,
    _shield: 0
  })
  .setTurretTarget('all')
  .setTurretShot(35, 1)
  .setTurretOther(130, 2, 5)
  .setBuildTurret({});

uranium//------Турель зверь
  .createItemTurret("12_auto_turret_zver", '9x18', {
    tier: 1,
    expShoot: 2,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 2,
    health: 600,
    size: 2,
    cooldown: 0.1,
    recoil: 0.5,
    recoilAmount: 2,
    maxAmmo: 20,
    _shield: 0
  })
  .setTurretTarget('all')
  .setTurretShot(17, 3)
  .setTurretOther(152, 3, 3)
  .customSetting({
    alternate: true,
    spread: 3
  })
  .setBuildTurret({});

uranium//------Санайперская турель гадюка
  .createItemTurret("13_snap_turret", '12x108', {
    tier: 1,
    expShoot: 14,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 1,
    health: 500,
    size: 2,
    maxAmmo: 2,
    _shield: 0
  })
  .setTurretTarget('all')
  .setTurretShot(194, 1)
  .setTurretOther(290, 1)
  .customSetting({
    shootSound: sounds['12-shot']
  })
  .setBuildTurret({});

//-------------2 тир турелей
uranium//------Турель мустанг
  .createItemTurret("21_auto_turret_mustang", '9x18', {
    tier: 2,
    expShoot: 0.9,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 2,
    health: 900,
    size: 2,
    maxAmmo: 20,
    cooldown: 0.1,
    recoil: 1.5,
    shootShake: 1,
    updateMap: {
      5: [4, 9],
      10: [5, 5]
    }
  })
  .setTurretTarget('all')
  .setTurretShot(155, 10, 4)
  .setTurretOther(175, 2, 14)
  .setBuildTurret({});

uranium//------Противовоздушная рельса
  .createItemTurret("22_air_turret_rels", 'relsa', {
    tier: 2,
    expShoot: 2,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 1,
    health: 700,
    size: 2,
    maxAmmo: 27,
    cooldown: 0.1,
    recoil: 2,
    shootShake: 1,
    updateMap: {
      5: [4, 11],
      10: [5, 8]
    }
  })
  .setTurretTarget('air')
  .setTurretShot(110, 9, 0.2)
  .setTurretOther(290, 4, 0)
  .customSetting({
    shootSound: Sounds.boom
  })
  .setBuildTurret({});

uranium//------Снайперская турель удав
  .createItemTurret("23_auto_turret_udav", '9x18', {
    tier: 2,
    expShoot: 1,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 3,
    health: 600,
    size: 2,
    maxAmmo: 20,
    cooldown: 0.1,
    recoil: 4,
    shootShake: 1,
    updateMap: {
      5: [4, 21],
      10: [5, 20]
    }
  })
  .setTurretTarget('ground')
  .setTurretShot(165, 10, 0.1)
  .setTurretOther(270, 1.2, 0)
  .setBuildTurret({});

uranium//------Крупнокалиберная турель крот
  .createItemTurret("24_hard_auto_turret", '12x108', {
    tier: 2,
    expShoot: 5,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 2,
    health: 1000,
    size: 2,
    maxAmmo: 10,
    shootShake: 1,
    fastShots: 10,
    reloadFastShots: 15,
    updateMap: {
      5: [4, 23],
      10: [5, 22]
    }
  })
  .setTurretTarget('ground')
  .setTurretShot(90)
  .setTurretOther(130, 1.2, 22)
  .customSetting({
    xRand: 3,
    shootSound: sounds['12-shot']
  })
  .setBuildTurret({});

uranium//------Турель циклон
  .createItemTurret("25_auto_turret_ceklon", '9x18', {
    tier: 2,
    expShoot: 0.7,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 3,
    health: 1200,
    size: 3,
    maxAmmo: 30,
    cooldown: 0.1,
    recoil: 1,
    shootShake: 0.7,
    updateMap: {
      5: [4, 20],
      10: [5, 19]
    }
  })
  .setTurretTarget('all')
  .setTurretShot(150, 5, 25)
  .setTurretOther(170, 1.6, 14)
  .setCustomBuild('ciklon');

uranium//------Снайперская турель кобра
  .createItemTurret("26_snap_turret_cobra", '12x108', {
    tier: 2,
    expShoot: 7,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 3,
    health: 650,
    size: 2,
    _luck: 5,
    maxAmmo: 4,
    shootShake: 1,
    updateMap: {
      5: [4, 22],
      10: [5, 21]
    }
  })
  .setTurretTarget('all')
  .setTurretShot(100)
  .setTurretOther(310, 1.5, 0)
  .customSetting({
    shootSound: sounds['12-shot']
  })
  .setBuildTurret({});

//-------------3 тир турелей

uranium//------Турелька скарабей
  .createItemTurret("31_multi_turret_scarabey", '9x18', {
    tier: 3,
    expShoot: 0.9,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 3,
    health: 400,
    size: 1,
    maxAmmo: 10
  })
  .setTurretTarget('all')
  .setTurretShot(30, 2)
  .setTurretOther(135, 2, 6)
  .setBuildTurret({});

uranium//------Турель скат
  .createItemTurret("32_auto_turret_scat", '9x18', {
    tier: 3,
    expShoot: 0.8,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 4,
    health: 1100,
    size: 2,
    maxAmmo: 30,
    shootShake: 1,
    updateMap: {
      5: [4, 10],
      10: [5, 16]
    }
  })
  .setTurretTarget('all')
  .setTurretShot(35, 4)
  .setTurretOther(170, 3, 12)
  .setBuildTurret({});

uranium//------Турель анаконда
  .createItemTurret("33_snap_turret_anaconda", '12x108', {
    tier: 3,
    expShoot: 6,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 5,
    health: 1200,
    size: 3,
    maxAmmo: 6,
    shootShake: 2,
    updateMap: {
      5: [4, 16],
      10: [5, 14]
    }
  })
  .setTurretTarget('all')
  .setTurretShot(96)
  .setTurretOther(325, 2, 0)
  .customSetting({
    shootSound: sounds['12-shot']
  })
  .setBuildTurret({});

uranium//------Турель Восход
  .createItemTurret("34_hard_auto_turret_voshod", '12x108', {
    tier: 3,
    expShoot: 4,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 4,
    health: 2100,
    size: 4,
    maxAmmo: 16,
    shootShake: 2,
    updateMap: {
      5: [4, 17],
      10: [5, 15]
    }
  })
  .setTurretTarget('all')
  .setTurretShot(30, 2)
  .setTurretOther(220, 2, 6)
  .customSetting({
    alternate: true,
    //shootLength: 10, Отвести выстрел назад
    spread: 4.7,//Отвести в стороны
    xRand: 0.1,
    shootSound: sounds['12-shot']
  })
  .setBuildTurret({});

uranium//------Турель звезда
  .createPowerTurret("35_laser_turret_zvezda", 'zvezda', {
    tier: 3,
    expShoot: 3,
    lvlMap: uranium.turretLvlMap,
    health: 1200,
    size: 2,
    _powerShots: 20,
    shootShake: 0.5,
    _shield: 1.5,
    _extraShield: 50,
    updateMap: {
      5: [4, 15],
      10: [5, 13]
    }
  })
  .setTurretTarget('all')
  .setTurretShot(40, 1)
  .setTurretOther(170, 3, 2)
  .customSetting({
    chargeTime: 30,
    chargeMaxDelay: 30,
    chargeEffects: 1,
    powerUse: 6,
    shootSound: Sounds.laser
  })
  .setBuildPowerTurret({});

uranium//------Турель даль
  .createLaserTurret("36_laser_turret_dalh", 'dalh', {
    tier: 3,
    expShoot: 9,
    lvlMap: uranium.turretLvlMap,
    health: 1000,
    size: 2,
    shootShake: 1,
    _shield: 2,
    _extraShield: 50,
    updateMap: {
      5: [4, 24],
      10: [5, 23]
    }
  })
  .setTurretTarget('ground')
  .setTurretShot(40)
  .setTurretOther(160, 1, 0)
  .customSetting({
    chargeTime: 60,
    chargeMaxDelay: 60,
    shootSound: Sounds.laser,
    powerUse: 4,
    shootCone: 50
  })
  .setBuildLaserTurret({});

uranium//------Турель клен
  .createItemTurret("37_ART_Clen", '30x173', {
    tier: 3,
    expShoot: 5,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 3,
    health: 1400,
    size: 4,
    maxAmmo: 4,
    shootShake: 5,
    art: true,
    fastShots: 4,
    reloadFastShots: 60,
    updateMap: {
      5: [4, 19],
      10: [5, 18]
    }
  })
  .setTurretTarget('ground')
  .setTurretShot(330, 1, 10)
  .setTurretOther(480, 1, 5)
  .customSetting({
    shootSound: sounds['big_shot']
  })
  .setBuildTurret({});

uranium//------Турель спартанец
  .createLaserTurret("41_laser_turret_spartan", 'spartan', {
    tier: 4,
    expShoot: 5,
    lvlMap: uranium.turretLvlMap,
    _shield: 2,
    _extraShield: 50,
    baseLoadRegion: {
      turret: [
        '',
        '-right_flank',
        "-left_flank",
        "-liquid"
      ],
      base: [
        "tier-4-3-base"
      ]
    },
    icons() {
      return [
        Core.atlas.find("uranium-mod-tier-" + this.tier + "-" + this.size + "-base"),
        Core.atlas.find(this.name + "-right_flank"),
        Core.atlas.find(this.name + "-left_flank"),
        Core.atlas.find(this.name)
      ]
    },
    health: 1200,
    size: 3,
    shootShake: 1
  })
  .setTurretTarget('ground')
  .setTurretShot(10, 1)
  .setTurretOther(175, 1, 0)
  .customSetting({
    chargeTime: 30,
    chargeMaxDelay: 60,
    chargeEffects: 1,
    shootSound: Sounds.laser,
    powerUse: 10
  })
  .setBuildLaserTurret({
    draw() {
      if (this.getQD('reDraw')) {
        this.getQD('reDraw')(this);
        return;
      };
      let
        regions = this.getSmartRegions(),
        turretRegion = regions.turret,
        baseRegion = regions.base,
        rot1 = this.rotation - 90,
        shootOffset = this.recoil * 1.4 - 0.05,
        liquid = this.liquids.total() / this.parent.liquidCapacity,
        turretColor = this.getTurretColor();

      Draw.alpha(1);
      if (turretColor)
        Draw.color(Color.valueOf(turretColor));
      Draw.rect(baseRegion[0], this.x, this.y);
      if (turretColor)
        Draw.reset();
      Draw.z(Layer.turret);
      let
        x = this.x + Math.sin(rot1 / 180 * Math.PI) * shootOffset,
        y = this.y - Math.cos(rot1 / 180 * Math.PI) * shootOffset,
        shootOffsetWind = -liquid * 3.8 - shootOffset + 4.5,
        x_wind_1,
        y_wind_1,
        x_wind_2,
        y_wind_2;
      if (liquid > 0.01) {
        x_wind_1 = this.x + Math.sin(rot1 / 180 * Math.PI) * shootOffset + Math.cos(rot1 / 180 * -Math.PI) * shootOffsetWind;
        y_wind_1 = this.y - Math.cos(rot1 / 180 * Math.PI) * shootOffset - Math.sin(rot1 / 180 * -Math.PI) * shootOffsetWind;
        x_wind_2 = this.x + Math.sin(rot1 / 180 * Math.PI) * shootOffset + Math.cos(rot1 / 180 * -Math.PI) * -shootOffsetWind;
        y_wind_2 = this.y - Math.cos(rot1 / 180 * Math.PI) * shootOffset - Math.sin(rot1 / 180 * -Math.PI) * -shootOffsetWind;
        if (turretColor)
          Draw.color(Color.valueOf(turretColor));
        Draw.rect(turretRegion[1], x_wind_2, y_wind_2, this.rotation - 90);
        Draw.rect(turretRegion[2], x_wind_1, y_wind_1, this.rotation - 90);
        if (turretColor)
          Draw.reset();
      }
      if (turretColor)
        Draw.color(Color.valueOf(turretColor));
      Draw.rect(turretRegion[0], x, y, this.rotation - 90);
      if (turretColor)
        Draw.reset();
      Draw.alpha(liquid);
      Draw.rect(turretRegion[3], x, y, this.rotation - 90);

      uranium.turretDrawInTheEnd(this);
    }
  });

uranium//------Турель Томагавк
  .createItemTurret("42_tomahawk", 'relsa', {
    tier: 4,
    expShoot: 1,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 2,
    baseLoadRegion: {
      turret: [
        '',
        '-right_flank',
        "-left_flank",
        "-liquid"
      ],
      base: [
        "tier-4-3-base"
      ]
    },
    icons() {
      return [
        Core.atlas.find("uranium-mod-tier-" + this.tier + "-" + this.size + "-base"),
        Core.atlas.find(this.name + "-right_flank"),
        Core.atlas.find(this.name + "-left_flank"),
        Core.atlas.find(this.name)
      ]
    },
    health: 1500,
    size: 3,
    maxAmmo: 36,
    shootShake: 1
  })
  .setTurretTarget('air')
  .setTurretShot(70, 9, 0.1)
  .setTurretOther(330, 4.5, 2)
  .customSetting({
    shootSound: Sounds.boom
  })
  .setBuildTurret({
    draw() {
      if (this.getQD('reDraw')) {
        this.getQD('reDraw')(this);
        return;
      };
      let
        regions = this.getSmartRegions(),
        turretRegion = regions.turret,
        baseRegion = regions.base,
        rot1 = this.rotation - 90,
        shootOffset = this.recoil * 1.5,
        liquid = this.liquids.total() / this.parent.liquidCapacity,
        turretColor = this.getTurretColor();
      if (turretColor)
        Draw.color(Color.valueOf(turretColor));
      Draw.alpha(1);
      Draw.rect(baseRegion[0], this.x, this.y);
      if (turretColor)
        Draw.reset();
      Draw.z(Layer.turret);
      let
        x = this.x + Math.sin(rot1 / 180 * Math.PI) * shootOffset,
        y = this.y - Math.cos(rot1 / 180 * Math.PI) * shootOffset,
        shootOffsetWind = -liquid * 5 - shootOffset + 4,
        x_wind_1 = this.x + Math.sin(rot1 / 180 * Math.PI) * shootOffset + Math.cos(rot1 / 180 * -Math.PI) * shootOffsetWind,
        y_wind_1 = this.y - Math.cos(rot1 / 180 * Math.PI) * shootOffset - Math.sin(rot1 / 180 * -Math.PI) * shootOffsetWind,
        x_wind_2 = this.x + Math.sin(rot1 / 180 * Math.PI) * shootOffset + Math.cos(rot1 / 180 * -Math.PI) * -shootOffsetWind,
        y_wind_2 = this.y - Math.cos(rot1 / 180 * Math.PI) * shootOffset - Math.sin(rot1 / 180 * -Math.PI) * -shootOffsetWind;
      if (turretColor)
        Draw.color(Color.valueOf(turretColor));
      Draw.rect(turretRegion[1], x_wind_2, y_wind_2, this.rotation - 90);
      Draw.rect(turretRegion[2], x_wind_1, y_wind_1, this.rotation - 90);
      Draw.rect(turretRegion[0], x, y, this.rotation - 90);
      if (turretColor)
        Draw.reset();
      Draw.alpha(liquid);
      Draw.rect(turretRegion[3], x, y, this.rotation - 90);

      uranium.turretDrawInTheEnd(this);
    }
  });

uranium//------Турель инквизитор
  .createItemTurret("43_inkvizitor", '9x18', {
    tier: 4,
    expShoot: 0.5,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 5,
    health: 1450,
    size: 3,
    _luck: 20,
    alternate: true,
    spread: 2,
    maxAmmo: 30,
    shootShake: 1,
    _extraShield: 250,
    _shield: 2
  })
  .setTurretTarget('all')
  .setTurretShot(12, 3)
  .setTurretOther(175, 3)
  .setCustomBuild('inkvizitor');

uranium//------Турель Император
  .createItemTurret("45_ART_imperator", '30x173', {
    tier: 4,
    expShoot: 4,
    lvlMap: uranium.turretLvlMap,
    ammoQuality: 4,
    maxAmmo: 6,
    shootShake: 6,
    fastShots: 6,
    reloadFastShots: 45,
    baseLoadRegion: {
      turret: [
        '',
        '-right_flank',
        "-left_flank",
        "-liquid",
        "-head",
        "-head-liquid"
      ],
      base: [
        "tier-4-5-base"
      ]
    },
    icons() {
      return [
        Core.atlas.find("uranium-mod-tier-" + this.tier + "-" + this.size + "-base"),
        Core.atlas.find(this.name)
      ]
    },
    health: 2150,
    size: 5,
    art: true
  })
  .setTurretTarget('ground')
  .setTurretShot(240, 1)
  .setTurretOther(520, 1, 2)
  .customSetting({
    shootSound: sounds['big_shot']
  })
  .setBuildTurret({
    draw() {
      if (this.getQD('reDraw')) {
        this.getQD('reDraw')(this);
        return;
      };

      let
        regions = this.getSmartRegions(),
        turretRegion = regions.turret,
        baseRegion = regions.base,
        rot1 = this.rotation - 90,
        shootOffset = this.recoil * 4,
        liquid = this.liquids.total() / this.parent.liquidCapacity,
        turretColor = this.getTurretColor();
      if (turretColor)
        Draw.color(Color.valueOf(turretColor));
      Draw.alpha(1);
      Draw.rect(baseRegion[0], this.x, this.y);
      if (turretColor)
        Draw.reset();
      Draw.z(Layer.turret);
      let
        x = this.x,
        y = this.y,
        x_recoil = x + Math.sin(rot1 / 180 * Math.PI) * shootOffset,
        y_recoil = y - Math.cos(rot1 / 180 * Math.PI) * shootOffset,
        shootOffsetWind = -liquid * 5 + 6,
        x_wind_1 = this.x + Math.cos(rot1 / 180 * -Math.PI) * shootOffsetWind,
        y_wind_1 = this.y - Math.sin(rot1 / 180 * -Math.PI) * shootOffsetWind,
        x_wind_2 = this.x + Math.cos(rot1 / 180 * -Math.PI) * -shootOffsetWind,
        y_wind_2 = this.y - Math.sin(rot1 / 180 * -Math.PI) * -shootOffsetWind;
      if (turretColor)
        Draw.color(Color.valueOf(turretColor));
      Draw.rect(turretRegion[1], x_wind_2, y_wind_2, this.rotation - 90);
      Draw.rect(turretRegion[2], x_wind_1, y_wind_1, this.rotation - 90);
      Draw.rect(turretRegion[0], x, y, this.rotation - 90);
      if (turretColor)
        Draw.reset();
      Draw.alpha(liquid);
      Draw.rect(turretRegion[3], x, y, this.rotation - 90);
      if (turretColor)
        Draw.color(Color.valueOf(turretColor));
      Draw.alpha(1);
      Draw.rect(turretRegion[4], x_recoil, y_recoil, this.rotation - 90);
      if (turretColor)
        Draw.reset();
      Draw.alpha(liquid);
      Draw.rect(turretRegion[5], x_recoil, y_recoil, this.rotation - 90);

      uranium.turretDrawInTheEnd(this);
    }
  });


