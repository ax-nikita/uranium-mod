let
  mindustryVars = this;
let
  uranium = {
    createObj(type, name) {
      let
        newObj = {
          type: type,
          name: name,
          getType() {
            return mindustryVars[this.type];
          }
        },
        methods_keys = Object.keys(uranium.methods);

      for (let i = 0; i < methods_keys.length; i++) {
        let
          key = methods_keys[i];
        newObj[key] = uranium.methods[key];
      };

      return newObj;
    },

    addCustomBuild(name, f) {
      uranium.customBuilds[name] = f;
    },

    'customBuilds': {},

    createBuild(type, name, f) {
      let
        newObj = uranium.createObj(type, name);

      newObj.const = extendContent(newObj.getType(), newObj.name, f);
      newObj.const.getObj = () => {
        return newObj;
      };

      return newObj;
    },

    createLaserBulet(type, cal, f) {
      let
        base = {
          colors: [
            Color.valueOf("#FFdd6677"),
            Color.valueOf("#FFdd66dd"),
            Color.valueOf("#FFcc66"),
            Color.valueOf("#FFdd66")],
          tmpColor: new Color(),
          tscales: [-1, 0.7, 0.5, 0.2],
          strokes: [0.5, 0.8, 1.3, 1.6],
          lenscales: [1.005, 1, 0.9905, 0.99],
          length: 220,
          update(b) {
            if (b.timer.get(1, 6)) {
              Damage.collideLine(b, b.team, this.hitEffect, b.x, b.y, b.rotation(), this.length, true);
            }
          },
          draw(b) {
            let
              colors = this.colors,
              tscales = this.tscales,
              strokes = this.strokes,
              lenscales = this.lenscales,
              length = this.length,
              fin = b.time / this.lifetime,
              fout = 1 - fin,
              baseLen = length * fout;
            Lines.lineAngle(b.x, b.y, b.rotation(), baseLen);
            for (let s = 0; s < colors.length; s++) {
              Draw.color(colors[s]);
              for (let i = 0; i < tscales.length; i++) {
                let
                  rot1 = (b.rotation() + 180) / 180,
                  x_circle_2 = b.x - Math.cos(rot1 * -Math.PI) * baseLen * lenscales[i],
                  y_circle_2 = b.y + Math.sin(rot1 * -Math.PI) * baseLen * lenscales[i],
                  TempCore = 1 + b.owner.getTempCore() / 4;
                if (b.time % 2 < 1)
                  uranium.getEffect('laser-track').at(x_circle_2, y_circle_2, colors[2]);
                Tmp.v1.trns(b.rotation() + 180, (lenscales[i] - 1) * 10);
                Lines.stroke(strokes[i] * fout * 2 * TempCore);
                Lines.circle(b.x, b.y, lenscales[i] * 2 * TempCore);
                Lines.circle(x_circle_2, y_circle_2, lenscales[i] * 0.25 * TempCore);
                Lines.lineAngle(b.x + Tmp.v1.x, b.y + Tmp.v1.y, b.rotation(), baseLen * lenscales[i]);
              }
            }
          }
        },
        keys = Object.keys(base);

      for (let i = 0; i < keys.length; i++) {
        if (f[keys[i]] == undefined) {
          f[keys[i]] = base[keys[i]];
        }
      }
      return uranium.createBullet(type, cal, f);
    },

    createBullet(type, cal, f) {
      let
        newObj = uranium.createObj(type, cal);
      if (cal == '9x18') {
        f.shootEffect = uranium.getEffect('9x18-shot');
      } else if (cal == '12x108') {
        f.shootEffect = uranium.getEffect('12x108-shot');
      }
      f.getQuality = function () {
        return this._quality ? this._quality : 1;
      };
      f.getExpMultiplier = function () {
        return this._expMultiplier != undefined ? this._expMultiplier : 1;
      };
      f.getPO = function () {
        return newObj;
      };
      f.getItemAmmo = function () {
        return this.getPO().shotAmmo;
      };

      newObj.const = extend(newObj.getType(), f);
      if (uranium.bullets[cal] == undefined) {
        uranium.bullets[cal] = [];
      };
      newObj.cal = cal;
      uranium.bullets[cal].push(newObj);
      return newObj;
    },

    createEffect(name, time, f) {
      let
        newObj = uranium.createObj('Effect', name);
      newObj.const = new Effect(time, f);
      uranium.effects[name] = newObj;
      return newObj;
    },

    getEffect(name) {
      return uranium.effects[name].const;
    },

    getBullet(name) {
      return uranium.bullets[name][0].const;
    },

    getAmmo(cal) {
      let
        ammo = [],
        calArray;

      if (typeof (cal) == "string") {
        calArray = uranium.bullets[cal];
        for (let i = 0; i < calArray.length; i++) {
          ammo.push(calArray[i].shotAmmo);
          ammo.push(calArray[i].const);
        }
      } else {
        for (let c = 0; c < cal.length; c++) {
          calArray = uranium.bullets[cal[c]];
          for (let i = 0; i < calArray.length; i++) {
            ammo.push(calArray[i].shotAmmo);
            ammo.push(calArray[i].const);
          }
        }
      }
      return ammo;
    },

    createBaseTurret(f) {
      if (f.baseLoadRegion == undefined) {
        f.baseLoadRegion = {
          turret: [
            '',
            '-liquid'
          ],
          base: [
            'tier-' + f.tier + '-' + f.size + '-base',
            'tier-' + f.tier + '-' + f.size + '-base-liquid'
          ]
        }
      };

      if (f.load == undefined && f.tier != undefined) {
        f.load = uranium.loadTurret;
      }
      if (f.icons == undefined && f.tier != undefined) {
        f.icons = uranium.iconTurret;
      }

      f.setBars = uranium.setTurretBars;

      f.setStats = function () {
        this.super$setStats();
      };

      f.outlineRadius = 2;

      f.getLuck = function () {
        return this._luck ? this._luck : 0;
      }
      f._shield = f._shield != undefined ? f._shield : 1;
      f._extraShield = f._extraShield != undefined ? f._extraShield : 0;
      f._regenShield = f._regenShield != undefined ? f._regenShield : 1;

      return f;
    },

    createLaserTurret(name, shotType, f) {

      uranium.createBaseTurret(f);
      f.shootType = uranium.getBullet(shotType);
      let
        turret = uranium.createBuild('LaserTurret', name, f);

      return turret;
    },

    createPowerTurret(name, shotType, f) {

      uranium.createBaseTurret(f);
      f.shootType = uranium.getBullet(shotType);
      f.getPowerShots = function () {
        return this._powerShots;
      }
      let
        turret = uranium.createBuild('PowerTurret', name, f);

      return turret;
    },

    createItemTurret(name, cal, f) {
      f.init = function () {
        this.ammo(uranium.getAmmo(cal));
        this.super$init();
      };

      uranium.createBaseTurret(f);

      let
        turret = uranium.createBuild('ItemTurret', name, f);

      return turret;
    },

    setTurretBars() {
      this.super$setBars();
      this.bars.add("name", func(entity => {
        return new Bar(
          entity.getQD('name'),
          entity.getQD('color'),
          floatp(() => {
            return 1;
          }));
      }));
      this.bars.add("effect", func(entity => {
        let
          name = entity.getStatusName()[0]
        return new Bar(
          name,
          Color.valueOf(entity.getStatusName()[1]),
          floatp(() => {
            return 1;
          }));
      }));
      this.bars.add("level", func(entity => {
        return new Bar(
          Core.bundle.get("uranium-mod.bars.Level") + ' ' + entity.getD().lvl,
          Color.valueOf("E9FE31"),
          floatp(() => {
            return entity.getD().lvl / uranium.turretLvlMap.length;
          }));
      }));
      this.bars.add("exp", func(entity => {
        return new Bar(
          Core.bundle.get("uranium-mod.bars.Exp") + ': ' + Math.round(entity.getD().exp),
          Color.valueOf("23f023"),
          floatp(() => {
            return entity.getD().exp / entity.getPO().getTurretMap(entity.getD().lvl, 'nextLvlExp');
          }));
      }));
      this.bars.add("stats", func(ent => {
        return new Bar(
          Core.bundle.get("uranium-mod.bars.Stats") + ':',
          Color.valueOf("E9FE31"),
          floatp(() => {
            return 0;
          }));
      }));
      if (this.getObj().type != 'LaserTurret')
        this.bars.add("reload", func(ent => {
          let
            rm = ent.getReloadMulti();
          return new Bar(
            Core.bundle.get("uranium-mod.bars.ReloadMultiplier") + ": " + Math.round(rm * 100) + "%",
            Color.valueOf("70F828"),
            floatp(() => {
              return rm / 2;
            }));
        }));

      this.bars.add("maxHealth", func(ent => {
        let
          Health = ent.maxHealth;
        return new Bar(
          Core.bundle.get("uranium-mod.bars.Health") + ": " + Math.round(Health),
          Color.valueOf("df3434"),
          floatp(() => {
            return Health / 5000;
          }));
      }));

      if (this.getObj().type == 'ItemTurret')
        this.bars.add("ammoQ", func(ent => {
          let
            ammo = ent.getAmmoQuality();
          return new Bar(
            Core.bundle.get("uranium-mod.bars.AmmoQuality") + ": " + ammo,
            Color.valueOf("70F828"),
            floatp(() => {
              return ammo / 5;
            }));
        }));

      this.bars.add("luck", func(ent => {
        let
          luck = ent.getLuck();
        return new Bar(
          Core.bundle.get("uranium-mod.bars.Luck") + ": " + luck,
          Color.valueOf("20F878"),
          floatp(() => {
            return luck / 100;
          }));
      }));

      if (this.getObj().type == 'PowerTurret')
        this.bars.add("prepShot", func(ent => {
          let
            p_shots = ent.getMaxPreparedShots();
          return new Bar(
            Core.bundle.get("uranium-mod.bars.PreparedShots") + ": " + p_shots,
            Color.valueOf("00F888"),
            floatp(() => {
              return ent.getD().preparedShots / p_shots;
            }));
        }));

      if (this.tier > 1)
        this.bars.add("sheald", func(ent => {
          let
            sheald = ent.getMaxSheald();
          return new Bar(
            Core.bundle.get("uranium-mod.bars.Sheald") + ": " + Math.round(sheald),
            Color.valueOf("C79E31"),
            floatp(() => {
              return ent.getD().sheald / sheald;
            }));
        }));

      if (this.fastShots != undefined)
        this.bars.add("fastShots", func(ent => {
          return new Bar(
            Core.bundle.get("uranium-mod.bars.fastShots") + ": " + ent.getMaxFastShots(),
            Color.valueOf("70F828"),
            floatp(() => {
              return ent.getD().fastShots / ent.getMaxFastShots();
            }));
        }));

    },

    createStatusEffect(name, f) {
      let
        newObj = uranium.createObj('StatusEffect', name);
      newObj.const = extend(StatusEffect, name, f);
      uranium.statusEffects[name] = newObj;
      return newObj;
    },

    getSEffects(name) {
      return uranium.statusEffects[name].const;
    },

    'statusEffects': {},

    createItem(name, f) {
      let
        newObj = uranium.createObj('Item', name);
      newObj.const = extendContent(newObj.getType(), newObj.name, f)
      return newObj;
    },

    getI(item, vanila) {
      if (vanila == true)
        return Vars.content.getByName(ContentType.item, item)
      else
        return Vars.content.getByName(ContentType.item, "uranium-mod-" + item)
    },

    getL(liquid, vanila) {
      if (vanila == true)
        return Vars.content.getByName(ContentType.liquid, liquid);
      else
        return Vars.content.getByName(ContentType.liquid, "uranium-mod-" + liquid);
    },

    getB(block) {
      return Vars.content.getByName(ContentType.block, "uranium-mod-" + block);
    },

    turretDrawInTheEnd(t) {
      Draw.z(Layer.turret);
      if (t.getD().lvl > 1) {
        let
          size = t.getP().size
        if (size == 1) {
          Draw.alpha(0.6);
        } else {
          Draw.alpha(0.95);
        }
        Draw.color(Color.valueOf(uranium.tier_colors[t.getP().tier - 1]));
        Draw.rect(t.getP().regionsLvl[t.getD().lvl - 2], t.x + 4 * (size - 1), t.y - 4 * (size - 1));
      }
    },

    drawTurret() {
      if (this.getQD('reDraw')) {
        this.getQD('reDraw')(this);
        return;
      };

      let
        regions = this.getSmartRegions(),
        turretRegion = regions.turret,
        baseRegion = regions.base,
        rot1 = this.rotation - 90,
        shootOffset = this.recoil * 1.5 - 0.05,
        liquid = this.liquids.total() / this.parent.liquidCapacity,
        turretColor = this.getTurretColor();

      if (baseRegion[0] != 'error') {
        if (turretColor)
          Draw.color(Color.valueOf(turretColor));
        Draw.rect(baseRegion[0], this.x, this.y);
        if (turretColor)
          Draw.reset();

        if (baseRegion[1] != 'error' && liquid > 0.1) {
          Draw.alpha(liquid);
          Draw.rect(baseRegion[1], this.x, this.y);
          Draw.alpha(1);
        }
      }

      Draw.z(Layer.turret);
      if (turretRegion[0] != 'error') {
        let
          x = this.x + Math.sin(rot1 / 180 * Math.PI) * shootOffset,
          y = this.y - Math.cos(rot1 / 180 * Math.PI) * shootOffset;
        if (turretColor)
          Draw.color(Color.valueOf(turretColor));
        Draw.rect(turretRegion[0], x, y, rot1);
        if (turretColor)
          Draw.reset();
        if (turretRegion[1] != 'error' && liquid > 0.1) {
          Draw.alpha(liquid);
          Draw.rect(turretRegion[1], x, y, rot1);
        }
      }

      uranium.turretDrawInTheEnd(this);
    },

    loadLvlImg(t) {
      t.regionsLvl = [];
      for (let i = 2; i < uranium.turretLvlMap.length; i++) {
        t.regionsLvl.push(Core.atlas.find('uranium-mod-level-' + i));
      };
    },

    loadTurret() {
      this.super$load();
      let
        turretRegion = this.baseLoadRegion.turret,
        baseRegion = this.baseLoadRegion.base;
      this.regions = {};
      this.regions[''] = {
        turret: [],
        base: []
      };

      for (let i = 0; i < turretRegion.length; i++) {
        this.regions[''].turret.push(Core.atlas.find(this.name + turretRegion[i]));
      };

      for (let i = 0; i < baseRegion.length; i++) {
        this.regions[''].base.push(Core.atlas.find('uranium-mod-' + baseRegion[i]));
      };

      uranium.loadLvlImg(this);
    },

    iconTurret() {
      return [
        Core.atlas.find("uranium-mod-tier-" + this.tier + "-" + this.size + "-base"),
        Core.atlas.find(this.name)
      ];
    },

    getStandartAmmo(name, cal) {
      if (cal == '9x18') {
        cal = '-magazine';
      }
      if (cal == '12x108') {
        cal = '_large_round';
      }
      return uranium.getI(name + cal, false);
    },

    addObjMethod(name, f) {
      uranium.methods[name] = f;
    },

    'turretLvlMap': [
      {//--1 уровень
        nextLvlExp: 500,
        reloadMultiplier: 1,
        maxHealth: 1,
        luck: 0,
        updateAmmoQuality: 0,
        sheald: 0,
        powerShots: 0
      },
      {//--1 уровень
        nextLvlExp: 500,
        reloadMultiplier: 1,
        maxHealth: 1,
        luck: 0,
        updateAmmoQuality: 0,
        sheald: 0,
        powerShots: 0
      },
      {//--2 уровень
        nextLvlExp: 750,
        reloadMultiplier: 1.02,
        maxHealth: 1.1,
        sheald: 0.05
      },
      {//--3 уровень
        nextLvlExp: 1000,
        reloadMultiplier: 1.04,
        maxHealth: 1.2,
        luck: 1
      },
      {//--4 уровень
        nextLvlExp: 1250,
        reloadMultiplier: 1.1,
        maxHealth: 1.3,
        updateAmmoQuality: 1,
        sheald: 0.1,
        powerShots: 5
      },
      {//--5 уровень
        nextLvlExp: 1500,
        reloadMultiplier: 1.15,
        luck: 2
      },
      {//--6 уровень
        nextLvlExp: 2000,
        reloadMultiplier: 1.20,
        maxHealth: 1.4
      },
      {//--7 уровень
        nextLvlExp: 2500,
        reloadMultiplier: 1.25,
        luck: 3
      },
      {//--8 уровень
        nextLvlExp: 3250,
        reloadMultiplier: 1.30,
        sheald: 0.15
      },
      {//--9 уровень
        nextLvlExp: 5000,
        reloadMultiplier: 1.35,
        luck: 4,
        sheald: 0.2
      },
      {//--10 уровень
        nextLvlExp: 7000,
        reloadMultiplier: 1.4,
        maxHealth: 1.5,
        luck: 5,
        updateAmmoQuality: 2,
        powerShots: 10
      },
      {//--11 уровень
        nextLvlExp: 10000,
        reloadMultiplier: 1.5,
        maxHealth: 1.6,
        luck: 6,
        updateAmmoQuality: 2,
        sheald: 0.25
      },
      {//--12 уровень
        nextLvlExp: 12000,
        reloadMultiplier: 1.6,
        maxHealth: 1.7,
        luck: 7,
        powerShots: 15
      },
      {//--13 уровень
        nextLvlExp: 15000,
        reloadMultiplier: 1.7,
        maxHealth: 1.8,
        luck: 8,
        sheald: 0.3
      },
      {//--14 уровень
        nextLvlExp: 2000,
        reloadMultiplier: 1.8,
        maxHealth: 1.9,
        luck: 9,
        sheald: 0.35
      },
      {//--15 уровень
        nextLvlExp: 10000,
        reloadMultiplier: 2,
        maxHealth: 2,
        luck: 10,
        updateAmmoQuality: 3,
        powerShots: 20,
        sheald: 0.4
      }
    ],

    'ammo_types': [
      "firearm",
      "titanium",
      "aluminium",
      "fire",
      "thorium",
      "exp",
      "altit",
      "blue-thorium",
      "ultrafast",
      "uranium",
      "iridium",
      "tritium",
      "iritrium",
    ],

    'ammo_colors': [
      "#F1C60F",
      "#2093FF",
      "#FFFAF0",
      "#F54C4C",
      "#FF79C3",
      "#C90909",
      "#BDEFFF",
      "#00FFFF",
      "#DC5925",
      "#04FF00",
      "#FFFFFF",
      "#CCFF00",
      "#E9FE31"
    ],

    'tier_colors': [
      "F1C60F",
      "00FFFF",
      "04FF00",
      "E9FE31"
    ],

    'effects': {},

    'bullets': {},

    'methods': {
      customSetting(obj) {
        let
          obj_keys = Object.keys(obj);

        for (let i = 0; i < obj_keys.length; i++) {
          let
            key = obj_keys[i];
          this.const[key] = obj[key];
        }
        return this;
      }
    }
  };

uranium.addObjMethod('setBuild', function (f) {
  if (typeof (f) == "function") {
    this.const.buildType = prov(f);
  } else {
    f.parent = this.const;
    this.const.buildType = () => extendContent(this.getType()[this.type + 'Build'], this.const, f);
  }
  return this;
});

uranium.addObjMethod('getTurretMap', function (lvl, key) {
  let
    map = this.const.lvlMap,
    value,
    d = lvl;
  if (d >= uranium.turretLvlMap.length) {
    d = uranium.turretLvlMap.length - 1;
  };
  while (value == undefined) {
    if (map[d][key] != undefined) {
      value = map[d][key]
    } else {
      d--;
    }
  };
  return value;
});

uranium.addObjMethod('getTurretUpdateMap', function (lvl) {
  let
    map = this.const.updateMap;
  if (map == undefined) {
    return map;
  } else {
    return map[lvl];
  }
});

uranium.addObjMethod('extendBuild', function (f) {
  return extendContent(this.getType()[this.type + 'Build'], this.const, f);
});

uranium.addObjMethod('setBuildEntity', function (f) {
  this.const.buildType = prov(f);
  return this;
});

uranium.addObjMethod('setTurretOther', function (range, rotateSpeed, inaccuracy, liquid, liquidAmount, liquidBust) {
  this.const.range = range;
  if (inaccuracy != undefined) {
    this.const.inaccuracy = inaccuracy;
  }
  if (rotateSpeed != undefined) {
    this.const.rotateSpeed = rotateSpeed;
  }
  if (liquid != undefined) {
    this.const.consumes.add(new ConsumeLiquidFilter(boolf(l => l == liquid), liquidAmount)).update(false);
    if (liquidBust != undefined) {
      this.const.coolantMultiplier = liquidBust;
    }
  }
  return this;
});

uranium.addObjMethod('setTurretShot', function (reload, shots, burstSpace) {
  this.const.reloadTime = reload;
  if (shots != undefined) {
    this.const.shots = shots;
    if (burstSpace != undefined) {
      this.const.burstSpacing = burstSpace;
    }
  }
  return this;
});

uranium.addObjMethod('setTurretTarget', function (type) {
  if (type == 'all') {
    this.const.targetAir = true;
    this.const.targetGround = true;
  } else if (type == 'ground') {
    this.const.targetAir = false;
    this.const.targetGround = true;
  } else if (type == 'air') {
    this.const.targetAir = true;
    this.const.targetGround = false;
  }
  return this;
});

uranium.addObjMethod('setBullet', function (damage, speed, life, Multiplier, splashDamage, splashDamageRadius) {
  let
    bullet = this.const;
  bullet.speed = speed;
  bullet.lifetime = life;
  bullet.damage = damage;
  if (Multiplier != undefined)
    bullet.ammoMultiplier = Multiplier;
  if (splashDamage != undefined)
    bullet.splashDamage = splashDamage;
  if (splashDamageRadius != undefined)
    bullet.splashDamageRadius = splashDamageRadius;
  return this;
});

uranium.addObjMethod('setAmmo', function (item, vanila) {
  this.shotAmmo = uranium.getI(item, vanila);
  return this;
});

uranium.addObjMethod('ezAmmo', function (name) {
  this.shotAmmo = uranium.getStandartAmmo(name, this.cal);
  return this;
});

uranium.addObjMethod('setDrawBullet', function (type, color1, color2, width, height) {
  let
    bullet = this.const;
  if (color1 != 0)
    bullet.frontColor = Color.valueOf(color1);
  if (color2 != 0)
    bullet.backColor = Color.valueOf(color2);
  if (type != 0) {
    bullet.sprite = type;
  } else if (this.cal == '9x18') {
    bullet.sprite = "uranium-mod-bullet_9x18";
  } else if (this.cal == '12x108') {
    bullet.sprite = "uranium-mod-bullet_12x108";
  } else if (this.cal == '30x173') {
    bullet.sprite = "uranium-mod-bullet_30x173";
  }

  bullet.width = width;
  bullet.height = height;
  return this;
});

uranium.addObjMethod('setCustomBuild', function (name) {
  this.personalBuild = uranium.customBuilds[name];
  this.setBuild(this.personalBuild());
  return this;
});

module.exports = uranium;
global.uranium = uranium;
