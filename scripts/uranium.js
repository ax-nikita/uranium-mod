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

    // Read-only runtime color cache. Use only for colors passed to drawing/light APIs;
    // mutable Color instances must still be created explicitly with Color.valueOf/new Color.
    '_runtimeColorCache': {},

    // Shared client-side ammunition VFX budget. Pressure is accumulated only for
    // visual work inside the current camera clip, matching Mindustry Effect.create().
    // This object never gates damage, status, fragments, collision or bullet logic.
    'vfxBudget': {
      pressure: 0,
      lod: 0,
      lastTime: -1,
      lastLodChange: -9999,
      decayPerTick: 0.32,
      maxPressure: 110,
      detailScale: [1.0, 0.38, 0.18, 0.09],
      trailDivisor: [1, 4, 8, 14],
      residueDivisor: [1, 2, 5, 10],

      update() {
        if (Vars.headless) return 0;

        const now = Time.time;
        if (this.lastTime < 0 || now < this.lastTime) {
          this.lastTime = now;
          this.pressure = 0;
          this.lod = 0;
          return 0;
        }

        const dt = Math.min(600, Math.max(0, now - this.lastTime));
        this.lastTime = now;
        this.pressure = Math.max(0, this.pressure - dt * this.decayPerTick);

        // Escalation is immediate. Recovery uses hysteresis and may step down only
        // once every 30 ticks so borderline fire cannot flicker between LODs.
        let next = this.lod;

        if (this.pressure >= 44) next = 3;
        else if (this.pressure >= 24 && next < 2) next = 2;
        else if (this.pressure >= 10 && next < 1) next = 1;
        else if (now - this.lastLodChange >= 30) {
          if (next == 3 && this.pressure < 32) next = 2;
          else if (next == 2 && this.pressure < 16) next = 1;
          else if (next == 1 && this.pressure < 6) next = 0;
        }

        if (next != this.lod) {
          this.lod = next;
          this.lastLodChange = now;
        }

        return this.lod;
      },

      isVisible(x, y, clip) {
        if (Vars.headless || Core.camera == null || Vars.renderer == null || !Vars.renderer.enableEffects) return false;
        return Core.camera.bounds(Tmp.r1).overlaps(
          Tmp.r2.setCentered(x, y, clip == undefined ? 50 : clip)
        );
      },

      addVisible(x, y, clip, weight) {
        if (!this.isVisible(x, y, clip)) return this.update();

        this.update();
        this.pressure = Math.min(
          this.maxPressure,
          this.pressure + (weight == undefined ? 1 : weight)
        );
        return this.update();
      },

      getLod() {
        return this.update();
      },

      count(base, minCount) {
        const lod = this.getLod();
        const min = minCount == undefined ? 1 : minCount;
        return Math.max(min, Math.floor(base * this.detailScale[lod] + 0.5));
      },

      profileCount(base, minCount, profileFactor) {
        const lod = this.getLod();
        const min = minCount == undefined ? 1 : minCount;
        if (lod == 0 || profileFactor == undefined || profileFactor <= 1) {
          return Math.max(min, Math.floor(base * this.detailScale[lod] + 0.5));
        }

        const attenuation = 1 + (profileFactor - 1) * 0.08 * lod;
        return Math.max(
          min,
          Math.floor(base * this.detailScale[lod] / attenuation + 0.5)
        );
      },

      profileSpawnExtra(profileFactor, lod) {
        if (lod <= 0 || profileFactor == undefined || profileFactor < 2) return 1;
        const gain = lod == 1 ? 0.18 : lod == 2 ? 0.30 : 0.42;
        return Math.max(1, Math.ceil(1 + (profileFactor - 1) * gain));
      },

      registerEffect(e, clip, profileFactor, baseWeight) {
        const factor = profileFactor == undefined ? 1 : Math.max(1, profileFactor);
        // EffectState starts at time 0; charge pressure exactly once per effect.
        if (e.time < 0.5) {
          this.addVisible(
            e.x, e.y,
            clip == undefined ? 70 : clip,
            (baseWeight == undefined ? 0.12 : baseWeight) * factor
          );
        }
        return this.getLod();
      },

      profileLifetime(e, baseLifetime, profileFactor, minTicks) {
        const lod = this.getLod();
        if (lod <= 0) return baseLifetime;

        const factor = profileFactor == undefined ? 1 : Math.max(1, profileFactor);
        const lodScale = [1, 0.58, 0.34, 0.20][lod];
        const attenuation = 1 + (factor - 1) * 0.05 * lod;
        const target = Math.max(
          minTicks == undefined ? 6 : minTicks,
          baseLifetime * lodScale / attenuation
        );
        e.lifetime = Math.min(e.lifetime, target);
        return target;
      },

      stableModulo(seed, divisor, salt) {
        if (divisor <= 1) return true;
        const value = Math.abs(
          Math.floor((seed + 1) * 1103515245 + (salt + 17) * 12345)
        );
        return (value % divisor) == 0;
      },

      allowVisible(x, y, clip, weight, seed, kind, salt, profileFactor) {
        if (!this.isVisible(x, y, clip)) return false;

        this.update();
        const factor = profileFactor == undefined ? 1 : Math.max(1, profileFactor);
        this.pressure = Math.min(
          this.maxPressure,
          this.pressure + (weight == undefined ? 1 : weight) * factor
        );
        const lod = this.update();

        const table = kind == 'residue'
          ? this.residueDivisor
          : this.trailDivisor;
        const divisor = table[lod] * this.profileSpawnExtra(factor, lod);

        return this.stableModulo(
          seed,
          divisor,
          salt == undefined ? 0 : salt
        );
      },

      // Replacement for BulletType.updateTrailEffects() used by VFX-budgeted
      // ammunition. Built-in Trail geometry remains untouched; only optional
      // Effect entities are thinned.
      updateBulletTrail(type, b, weight, salt, profileFactor) {
        if (Vars.headless) return;

        const canSpawn =
          type.trailMinVelocity <= 0 ||
          b.vel.len2() >= type.trailMinVelocity * type.trailMinVelocity;

        if (!canSpawn) return;

        if (type.trailChance > 0 && Mathf.chanceDelta(type.trailChance)) {
          const slot = Math.floor(b.time * 4);

          if (this.allowVisible(
            b.x, b.y, 55, weight,
            b.id * 4099 + slot,
            'trail',
            salt,
            profileFactor
          )) {
            if (type.trailSpread > 0) Tmp.v1.rnd(Mathf.random(type.trailSpread));
            else Tmp.v1.setZero();

            type.trailEffect.at(
              b.x + Tmp.v1.x,
              b.y + Tmp.v1.y,
              type.trailRotation ? b.rotation() : type.trailParam,
              type.trailColor
            );
          }
        }

        if (type.trailInterval > 0 && b.timer.get(0, type.trailInterval)) {
          const slot = Math.floor(
            b.time / Math.max(0.001, type.trailInterval)
          );

          if (this.allowVisible(
            b.x, b.y, 55, weight,
            b.id * 4099 + slot,
            'trail',
            salt + 31,
            profileFactor
          )) {
            if (type.trailSpread > 0) Tmp.v1.rnd(Mathf.random(type.trailSpread));
            else Tmp.v1.setZero();

            type.trailEffect.at(
              b.x + Tmp.v1.x,
              b.y + Tmp.v1.y,
              type.trailRotation ? b.rotation() : type.trailParam,
              type.trailColor
            );
          }
        }
      }
    },

    getRuntimeColor(value) {
      if (value == null || typeof value != 'string') return value;
      let color = this._runtimeColorCache[value];
      if (color == undefined) {
        color = Color.valueOf(value);
        this._runtimeColorCache[value] = color;
      }
      return color;
    },

    createBuild(type, name, f) {
      let
        newObj = uranium.createObj(type, name);

      newObj.const = extend(newObj.getType(), newObj.name, f);
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
          beamWidthFactor: 1,
          beamSparkCount: 6,
          beamSparkSpeed: 0.055,
          beamJitter: 1.25,
          beamOverflow: 0.35,
          beamStyle: 'laser',
          beamAccentColor: Color.valueOf('#FFFFFF'),
          beamLayerAlpha: [0.16, 0.30, 0.68, 0.94],
          update(b) {
            // Damage mechanics intentionally unchanged: Damage.collideLine still
            // runs once every 6 ticks. The API stores the ACTUAL post-absorption
            // beam length in b.fdata; endpoint VFX use that exact same value.
            if (b.timer.get(1, 6)) {
              Damage.collideLine(b, b.team, b.x, b.y, b.rotation(), this.length, true);

              if (this.endpointLiveEffect != undefined && this.endpointLiveEffect != Fx.none) {
                let endLen = b.fdata > 0 ? b.fdata : this.length,
                  ex = b.x + Angles.trnsx(b.rotation(), endLen),
                  ey = b.y + Angles.trnsy(b.rotation(), endLen);
                this.endpointLiveEffect.at(ex, ey, b.rotation(), this.beamAccentColor);
              }
            }

            // A lower-frequency residue pass leaves a swept path if the turret turns
            // while firing. It is purely visual and never applies status/damage.
            if (this.endpointResidueEffect != undefined && this.endpointResidueEffect != Fx.none &&
              b.timer.get(2, this.endpointResidueInterval != undefined ? this.endpointResidueInterval : 24)) {
              let endLen = b.fdata > 0 ? b.fdata : this.length,
                ex = b.x + Angles.trnsx(b.rotation(), endLen),
                ey = b.y + Angles.trnsy(b.rotation(), endLen);
              this.endpointResidueEffect.at(ex, ey, b.rotation(), this.beamAccentColor);
            }
          },
          draw(b) {
            let
              colors = this.colors,
              strokes = this.strokes,
              // b.fdata is updated by Damage.collideLine() with the real beam length
              // after laser-absorbing blocks are accounted for. Keep visuals exact.
              length = b.fdata > 0 ? b.fdata : this.length,
              fin = b.time / this.lifetime,
              fout = 1 - fin,
              fade = Math.pow(Math.max(0, fout), 0.24),
              ownerTemp = (b.owner != null && b.owner.getTempCore != undefined) ? b.owner.getTempCore() : 1,
              tempCore = 1 + ownerTemp / 4,
              widthFactor = this.beamWidthFactor != undefined ? this.beamWidthFactor : 1,
              sparkCount = this.beamSparkCount != undefined ? this.beamSparkCount : 6,
              sparkSpeed = this.beamSparkSpeed != undefined ? this.beamSparkSpeed : 0.055,
              jitter = this.beamJitter != undefined ? this.beamJitter : 1.25,
              overflow = this.beamOverflow != undefined ? this.beamOverflow : 0.35,
              style = this.beamStyle != undefined ? this.beamStyle : 'laser',
              accent = this.beamAccentColor != undefined ? this.beamAccentColor : colors[colors.length - 1],
              alphas = this.beamLayerAlpha != undefined ? this.beamLayerAlpha : [0.16, 0.30, 0.68, 0.94],
              rot = b.rotation(),
              endX = b.x + Angles.trnsx(rot, length),
              endY = b.y + Angles.trnsy(rot, length),
              pulse = 0.5 + 0.5 * Math.sin((b.time + b.id % 23) / 3.9);

            Draw.z(Layer.bullet);

            // The visible beam stays full-length while damage is active. The old
            // implementation shortened it every frame even though collideLine()
            // still damaged the full line, which visually understated late ticks.
            for (let s = 0; s < colors.length; s++) {
              let widthIndex = colors.length - 1 - Math.min(s, strokes.length - 1);
              if (widthIndex < 0) widthIndex = 0;
              Draw.color(colors[s]);
              Draw.alpha(Math.min(1, alphas[Math.min(s, alphas.length - 1)] * fade * (0.88 + 0.12 * pulse)));
              Lines.stroke(strokes[widthIndex] * 2.35 * tempCore * widthFactor * (0.92 + 0.08 * pulse));
              Lines.lineAngle(b.x, b.y, rot, length);
            }

            // Overfilled energy escapes as short traveling side filaments rather
            // than a second geometric beam. Their motion also communicates that
            // the whole line remains energized for the bullet lifetime.
            for (let i = 0; i < sparkCount; i++) {
              let travel = ((i + 1) / (sparkCount + 1) + b.time * sparkSpeed + (b.id % 17) * 0.013) % 1,
                along = length * travel,
                side = Math.sin(b.time * 0.55 + i * 2.17 + b.id * 0.07) * jitter * tempCore * (0.55 + overflow),
                px = b.x + Angles.trnsx(rot, along) + Angles.trnsx(rot + 90, side),
                py = b.y + Angles.trnsy(rot, along) + Angles.trnsy(rot + 90, side),
                sparkAlpha = (0.20 + 0.34 * pulse) * fade;

              Draw.color(accent, colors[Math.min(2, colors.length - 1)], 0.24 + 0.52 * pulse);
              Draw.alpha(sparkAlpha);
              Lines.stroke((0.42 + overflow * 0.34) * fade * tempCore);

              if (style == 'frost') {
                Fill.square(px, py, (0.30 + 0.28 * pulse) * tempCore, rot + 45 + i * 19);
                Lines.lineAngle(px, py, rot + 90, (1.0 + 1.6 * pulse) * tempCore);
              } else if (style == 'rad') {
                Fill.circle(px, py, (0.23 + 0.34 * pulse) * tempCore);
                Lines.lineAngle(px, py, rot + (i % 2 == 0 ? 18 : -18), (1.4 + 2.5 * pulse) * tempCore);
                if (i % 3 == 0) {
                  Draw.alpha(0.055 * fade);
                  Draw.rect(Core.atlas.find('uranium-mod-radiation'), px, py, 2.0 * tempCore, 2.0 * tempCore, b.time * 2 + i * 31);
                }
              } else {
                Fill.circle(px, py, (0.18 + 0.30 * pulse) * tempCore);
                Lines.lineAngle(px, py, rot, (1.2 + 3.0 * pulse) * tempCore * (0.8 + overflow));
              }
            }

            // Small muzzle-side corona sparks. They originate at the turret end of
            // the beam and peel backwards/sideways, so the emitter feels overloaded
            // without obscuring the coherent beam itself. This is draw-only VFX.
            let sourceSparkCount = Math.max(3, Math.round(3 + overflow * 2.2));
            for (let i = 0; i < sourceSparkCount; i++) {
              let phase = ((b.time * (0.085 + i * 0.007)) + i * 0.193 + (b.id % 29) * 0.021) % 1,
                back = 0.8 + phase * (2.6 + overflow * 2.0),
                sideSign = (i % 2 == 0 ? 1 : -1),
                side = sideSign * (0.35 + 1.10 * Math.sin((phase + i * 0.17) * Math.PI)) * tempCore,
                sx = b.x + Angles.trnsx(rot + 180, back) + Angles.trnsx(rot + 90, side),
                sy = b.y + Angles.trnsy(rot + 180, back) + Angles.trnsy(rot + 90, side),
                sparkFade = (1 - phase) * fade,
                sparkRot = rot + 180 + sideSign * (16 + i * 7);

              Draw.color(accent, Color.white, 0.38 + 0.42 * pulse);
              Draw.alpha((0.18 + 0.28 * pulse) * sparkFade);
              Lines.stroke((0.30 + 0.18 * overflow) * sparkFade * tempCore);
              if (style == 'frost') {
                Fill.square(sx, sy, (0.18 + 0.16 * pulse) * tempCore, sparkRot + 45);
                Lines.lineAngle(sx, sy, sparkRot, (0.7 + 1.1 * pulse) * tempCore);
              } else if (style == 'rad') {
                Fill.circle(sx, sy, (0.14 + 0.18 * pulse) * tempCore);
                Lines.lineAngle(sx, sy, sparkRot, (0.8 + 1.5 * pulse) * tempCore);
              } else {
                Lines.lineAngle(sx, sy, sparkRot, (0.9 + 1.6 * pulse) * tempCore);
              }
            }

            // Muzzle/terminus glow. These are not fake impacts; the small endpoint
            // marker simply makes the configured damage length readable.
            Draw.color(accent, Color.white, 0.30 + 0.48 * pulse);
            Draw.alpha(0.30 * fade);
            Fill.circle(b.x, b.y, (1.7 + overflow * 1.2) * tempCore * (0.85 + 0.15 * pulse));
            Draw.alpha(0.20 * fade);
            Fill.circle(endX, endY, (0.65 + overflow * 0.45) * tempCore * (0.85 + 0.15 * pulse));

            // Real line-light along the entire damage beam. Vanilla LaserBulletType
            // uses the same Drawf.light(x1,y1,x2,y2,stroke,...) pattern; this makes
            // the visible illumination match the actual collideLine length.
            Drawf.light(
              b.x, b.y, endX, endY,
              (7.5 + overflow * 4.5) * tempCore * widthFactor,
              accent,
              (0.42 + overflow * 0.12) * fade
            );
            Drawf.light(b.x, b.y, 24 * tempCore * widthFactor, accent, 0.34 * fade);
            Drawf.light(endX, endY, 16 * tempCore * widthFactor, accent, 0.18 * fade);
            Draw.reset();
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

    bindTurretCoolant(block) {
      // v126 turret liquids were dedicated coolant/fuel consumers with update(false):
      // turret reload logic owned liquid removal. On v159.7 a parsed HJSON
      // `consumes.liquid` would otherwise also drain through generic Building consumption,
      // and LaserTurret would then remove the same liquid again in its own reload loop.
      let legacyCoolant = block.findConsumer(boolf(c => c instanceof ConsumeLiquid));
      if (legacyCoolant != null) {
        legacyCoolant.update = false;
        if (block.coolant == null) {
          block.coolant = legacyCoolant;
        }
      }
    },

    createBaseTurret(f) {
      // v6 -> v8 Turret field compatibility. Keep Uranium's own fields untouched.
      // cooldown used to be an approach-per-tick value; cooldownTime is a duration in ticks.
      if (f.cooldown != undefined && f.cooldownTime == undefined) {
        f.cooldownTime = f.cooldown > 0 ? 1 / f.cooldown : 20;
        delete f.cooldown;
      }
      if (f.shootShake != undefined && f.shake == undefined) {
        f.shake = f.shootShake;
        delete f.shootShake;
      }
      if (f.recoilAmount != undefined) {
        // recoilAmount was the v6 visual recoil amplitude. v8 calls this field recoil.
        f.recoil = f.recoilAmount;
        delete f.recoilAmount;
      }
      if (f.shootLength != undefined && f.shootY == undefined) {
        f.shootY = f.shootLength;
        delete f.shootLength;
      }

      if (f.baseLoadRegion == undefined) {
        f.baseLoadRegion = {
          turret: [
            '',
            '-liquid',
            '-heat'
          ],
          base: [
            'tier-' + f.tier + '-' + f.size + '-base',
            'tier-' + f.tier + '-' + f.size + '-base-liquid'
          ]
        }
      };

      if (f.mod_turret == undefined) {
        f.mod_turret = 'uranium-mod';
      }

      if (f.mod_base == undefined) {
        f.mod_base = 'uranium-mod';
      }

      if (f.load == undefined && f.tier != undefined) {
        f.load = uranium.loadTurret;
      }
      if (f.icons == undefined && f.tier != undefined) {
        f.icons = uranium.iconTurret;
      }
      // v159.7 Turret.drawPlanRegion delegates to DrawTurret, whose base fallback is
      // <mod>-block-<size>. Uranium uses its own tier-X-size-base atlas instead.
      // Draw the same base/primary turret regions used by the installed Uranium turret.
      if (f.drawPlanRegion == undefined && f.tier != undefined) {
        f.drawPlanRegion = uranium.drawTurretPlan;
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

      // Idle optimization: Mindustry uses targetInterval only while no target is
      // present, and newTargetInterval while tracking an existing target. Keep
      // active combat responsiveness at vanilla 20 ticks, but halve target scans
      // for sleeping/no-target Uranium turrets.
      f.targetInterval = 40;
      f.newTargetInterval = 20;

      return f;
    },

    createLaserTurret(name, shotType, f) {

      uranium.createBaseTurret(f);
      f.init = function () {
        uranium.bindTurretCoolant(this);
        this.super$init();
      };
      f.shootType = uranium.getBullet(shotType);
      let
        turret = uranium.createBuild('LaserTurret', name, f);

      return turret;
    },

    createPowerTurret(name, shotType, f) {

      uranium.createBaseTurret(f);
      f.init = function () {
        uranium.bindTurretCoolant(this);
        this.super$init();
      };
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
        uranium.bindTurretCoolant(this);
        this.super$init();
      };

      uranium.createBaseTurret(f);

      let
        turret = uranium.createBuild('ItemTurret', name, f);

      return turret;
    },

    qualityUiText(key, fallback) {
      return Core.bundle.get('uranium-mod.ui.quality.' + key, fallback);
    },

    qualityUiLocalizedValue(group, value) {
      if (value == undefined || value == null) return '';
      let raw = '' + value,
        key = 'uranium-mod.ui.quality.' + group + '.' + raw,
        missing = '__uranium_ui_missing__',
        localized = Core.bundle.get(key, missing);
      return localized == missing ? raw : localized;
    },

    qualityUiRoleText(qd, statusMode, entity) {
      if (qd == null || qd._uiQ == undefined || qd._uiT == undefined) return null;
      let key = 'uranium-mod.ui.quality.' + (statusMode ? 'statusRole.' : 'role.') + qd._uiQ + '.' + qd._uiT,
        missing = '__uranium_ui_missing__',
        localized = Core.bundle.get(key, missing);
      return localized == missing ? null : localized;
    },

    qualityUiNumber(value, digits) {
      let d = digits == undefined ? 1 : digits,
        p = Math.pow(10, d),
        n = Math.round(value * p) / p;
      if (Math.abs(n - Math.round(n)) < 0.0001) return '' + Math.round(n);
      return '' + n;
    },

    qualityUiSigned(value, suffix, digits) {
      let sign = value > 0 ? '+' : '';
      return sign + this.qualityUiNumber(value, digits) + (suffix || '');
    },

    qualityUiFactor(value) {
      return this.qualityUiSigned((value - 1) * 100, '%', 1);
    },

    qualityUiMultiplier(value) {
      return 'x' + this.qualityUiNumber(value, 2);
    },

    qualityUiAddLine(lines, labelKey, fallback, value) {
      lines.push('[lightgray]• ' + this.qualityUiText(labelKey, fallback) + ':[] ' + value);
    },

    qualityUiAddShort(list, score, key, fallback) {
      let k = ('' + key).toLowerCase(),
        tone = 1;

      // Tone is only used to build the compact two-part summary. Numeric values
      // in the detailed tooltip still come directly from the actual roll.
      if (k.indexOf('down') >= 0 || k.indexOf('off') >= 0 ||
        k.indexOf('selfdamage') >= 0 || k.indexOf('shothurt') >= 0 ||
        k.indexOf('infection') >= 0 || k.indexOf('disabled') >= 0) {
        tone = -1;
      } else if (k.indexOf('evolution') >= 0 || k.indexOf('specialweapon') >= 0 ||
        k.indexOf('special') >= 0) {
        tone = 0;
      }

      list.push({score: score, key: key, tone: tone, text: this.qualityUiText('short.' + key, fallback)});
    },

    qualityUiShortText(qd, statusMode, short, entity) {
      const text = (key, fallback) => this.qualityUiText('short.' + key, fallback);

      // Built-in qualities use reviewed descriptions tied to the exact q/t roll.
      // The heuristic below remains only as a fallback for addons/future qualities.
      let reviewedRole = this.qualityUiRoleText(qd, statusMode, entity);
      if (reviewedRole != null) return reviewedRole;

      // A single stat can be expressed by both a flat and multiplicative field
      // (e.g. health or shield). Keep only the strongest copy of each semantic
      // trait so it cannot dominate the summary or inflate the "complex" count.
      let unique = {};
      short.forEach(v => {
        if (unique[v.key] == undefined || unique[v.key].score < v.score) unique[v.key] = v;
      });
      short = Object.keys(unique).map(k => unique[k]);
      const has = key => short.some(v => v.key == key);

      // Distinctive mechanics are described first. This avoids generic summaries
      // such as "more health" for qualities whose identity is an aura, infection,
      // self-damage, special projectile or complete weapon disable.
      if (!statusMode) {
        if (qd.reloadMultiplier <= 0.001 && qd.rotateSpeedFactor <= 0.001)
          return text('immobileFortress', 'Не стреляет и не поворачивается');

        if (qd.maxHealth <= 0.2 && qd.extraSheald > 0)
          return text('shieldCore', 'Почти без корпуса, выживает щитом');

        if (qd.shotHealth > 0 && qd.healthRegen < 0)
          return text('predatorRole', 'Лечится выстрелами, но слабеет без стрельбы');

        if ((qd.shotDamage > 0 || qd.shotDamageFactor > 0) && qd.reloadMultiplier > 1)
          return text('selfDamageRole', 'Быстрее перезаряжается, но ранит себя выстрелами');

        if (qd.statsBoostInfection)
          return text('infectionRole', 'Заражает соседей, ослабляя их прочность');

        if (qd.statsBoostResistType == 'bad' && qd.healthRegen > 0)
          return text('pureBloodRole', 'Саморемонт и иммунитет к негативным эффектам');

        if (qd.laserType != undefined) {
          if (qd.laserType == 'frost') return text('frostLaserRole', 'Замораживающий лазер с усиленной защитой');
          if (qd.laserType == 'rad') return text('radLaserRole', 'Лазер накладывает радиацию на цели');
          if (qd.laserType == 'random') return text('randomLaserRole', 'Лазер случайно меняет тип воздействия');
          if (qd.laserType == 'pure_plasm') return text('purePlasmaRole', 'Переводит турель на чистую плазму');
          if (qd.laserType == 'zvezda_legend') return text('legendLaserRole', 'Легендарный плазменный режим турели');
        }

        if (qd.shotHealth > 0 && qd.healthRegenFactor > 0)
          return text('eternalRole', 'Регенерирует корпус и лечится выстрелами');

        if (qd.expBoost >= 1.5 && qd.expUpdate > 0)
          return text('experienceRole', 'Очень быстро набирает опыт и уровни');

        if (qd.armor > 0 && qd.rotateSpeedFactor < 1)
          return text('armoredRole', 'Усилена броня, но медленнее наводится');

        if (qd.statsBoost && qd.statsBoostShieldFactor > 1 && qd.statsBoostShieldRegen > 1)
          return text('shieldAuraRole', 'Создаёт мощную ауру усиления щитов');

        if (qd.statsBoost && qd.healthRegen > 0 && qd.statsBoostHealthRegen > 0)
          return text('nanobotsRole', 'Ремонтирует себя и соседние турели');

        if (qd.statsBoost && (qd.statsBoostExp > 1 || qd.statsBoostExpUpdate > 0) &&
          qd.statsBoostReloadMultiplier == 1 && qd.statsBoostAmmoQuality == 0 && qd.statsBoostShieldFactor == 1)
          return text('teacherRole', 'Ускоряет прокачку соседних турелей');

        if (qd.extraBulet != undefined && qd.reloadMultiplier < 0.6)
          return text('heavySpecialShot', 'Мощные спецснаряды, но редкие выстрелы');

        if (qd.extraBulet != undefined && qd.reloadMultiplier < 1)
          return text('specialProjectileSlowRole', 'Особые снаряды ценой темпа стрельбы');

        if (qd.extraBulet != undefined)
          return text('specialProjectileRole', 'Выстрелы создают дополнительные спецснаряды');

        if (qd.reloadMultiplier >= 1.25 && qd.rotateSpeedFactor >= 1.3)
          return text('speedRole', 'Быстрее перезаряжается и быстрее наводится');

        if (qd.statsBoost && (qd.statsBoostAmmoQuality != 0 || qd.statsBoostReloadMultiplier != 1 || qd.statsBoostShieldFactor != 1))
          return text('supportRole', 'Командная аура усиливает соседние турели');
      } else {
        if (qd.statsBoostInfection && qd.statsBoostHealthFactor < 1)
          return text('status.infectionWeakens', 'Снижает прочность и заражает качеством');

        let shieldChanges = 0, otherChanges = 0;
        if (qd.statsBoostShieldFactor != 1) shieldChanges++;
        if (qd.statsBoostShieldExtra != 0) shieldChanges++;
        if (qd.statsBoostShieldDelay != 1) shieldChanges++;
        if (qd.statsBoostReloadMultiplier != 1) otherChanges++;
        if (qd.statsBoostHealthFactor != 1 || qd.statsBoostHealthExtra != 0 || qd.statsBoostHealthRegen != 0 || qd.statsBoostHealthRegenFactor != 0) otherChanges++;
        if (qd.statsBoostExp != 1 || qd.statsBoostExpUpdate != 0) otherChanges++;
        if (qd.statsBoostAmmoQuality != 0) otherChanges++;

        if (shieldChanges >= 2 && otherChanges == 0)
          return text('status.shieldComplex', 'Сильно усиливает щит и его регенерацию');
        if (otherChanges >= 3)
          return text('status.complex', 'Комплексно усиливает боевые характеристики');
      }

      let positives = short.filter(v => v.tone > 0).sort((a, b) => b.score - a.score),
        negatives = short.filter(v => v.tone < 0).sort((a, b) => b.score - a.score),
        neutral = short.filter(v => v.tone == 0).sort((a, b) => b.score - a.score);

      if (!statusMode && positives.length >= 4) {
        let complex = text('complexUp', 'Комплексно усилены стрельба и защита');
        if (negatives.length > 0) return complex + ', ' + text('but', 'но') + ' ' + negatives[0].text;
        return complex;
      }

      let first = null, second = null, connector = ' ' + text('and', 'и') + ' ';

      // Prefer showing a trade-off when the roll contains one: it explains the
      // character of the quality much better than listing two unrelated bonuses.
      if (positives.length > 0 && negatives.length > 0) {
        first = positives[0];
        second = negatives[0];
        connector = ', ' + text('but', 'но') + ' ';
      } else {
        let all = positives.concat(negatives).concat(neutral).sort((a, b) => b.score - a.score);
        if (all.length > 0) first = all[0];
        if (all.length > 1) second = all[1];
      }

      if (first == null) return text('special', 'Особое качество без прямых бонусов');
      if (second == null || first.key == second.key) return first.text;
      return first.text + connector + second.text;
    },

    qualityUiGetData(entity, statusMode) {
      if (entity == null || entity.getD == undefined) return null;
      if (entity._uraniumQualityReady === false) return null;
      let data = entity.getD(), q, t;

      if (statusMode) {
        if (data.turretStatusIsset == undefined || !data.turretStatusIsset) return null;
        q = data.turretStatusQ;
        t = data.turretStatusT;
      } else {
        if (data.turretQuality == undefined) return null;
        q = data.turretQuality.q;
        t = data.turretQuality.t;
      }

      let qd = uranium.turretQualityGet(q, t);
      qd._uiQ = q;
      qd._uiT = t;
      return qd;
    },

    qualityUiBuild(entity, statusMode) {
      let qd = this.qualityUiGetData(entity, statusMode);
      if (qd == null) return null;

      let lines = [], short = [],
        turretType = entity != null && entity.getPO != undefined ? entity.getPO().type : null,
        baseHasShield = entity != null && entity.getP != undefined && entity.getP()._shield > 0,
        activeHasShield = entity != null && entity.hasShield != undefined ? entity.hasShield() : baseHasShield,
        hasFastShots = entity != null && entity.getP != undefined && entity.getP().fastShots != undefined;
      const add = (key, fallback, value) => this.qualityUiAddLine(lines, key, fallback, value);
      const addShort = (score, key, fallback) => this.qualityUiAddShort(short, score, key, fallback);

      if (statusMode) {
        if (qd.statsBoostReloadMultiplier != 1) {
          add('reload', 'Reload speed', this.qualityUiFactor(qd.statsBoostReloadMultiplier));
          addShort(90 + Math.abs(qd.statsBoostReloadMultiplier - 1) * 100, qd.statsBoostReloadMultiplier > 1 ? 'status.reloadUp' : 'status.reloadDown', qd.statsBoostReloadMultiplier > 1 ? 'Эффект ускоряет перезарядку турели' : 'Эффект замедляет перезарядку турели');
        }
        if (qd.statsBoostHealthFactor != 1) {
          add('healthFactor', 'Maximum health', this.qualityUiFactor(qd.statsBoostHealthFactor));
          addShort(85 + Math.abs(qd.statsBoostHealthFactor - 1) * 100, qd.statsBoostHealthFactor > 1 ? 'status.healthUp' : 'status.healthDown', qd.statsBoostHealthFactor > 1 ? 'Эффект повышает прочность турели' : 'Эффект снижает прочность турели');
        }
        if (qd.statsBoostHealthExtra != 0) {
          add('healthFlat', 'Maximum health', this.qualityUiSigned(qd.statsBoostHealthExtra, '', 1));
          addShort(75 + Math.abs(qd.statsBoostHealthExtra) / 10, qd.statsBoostHealthExtra > 0 ? 'status.healthUp' : 'status.healthDown', qd.statsBoostHealthExtra > 0 ? 'Эффект повышает прочность турели' : 'Эффект снижает прочность турели');
        }
        if (activeHasShield && qd.statsBoostShieldFactor != 1) {
          add('shieldFactor', 'Maximum shield', this.qualityUiFactor(qd.statsBoostShieldFactor));
          addShort(82 + Math.abs(qd.statsBoostShieldFactor - 1) * 100, qd.statsBoostShieldFactor > 1 ? 'status.shieldUp' : 'status.shieldDown', qd.statsBoostShieldFactor > 1 ? 'Эффект усиливает защитный щит' : 'Эффект ослабляет защитный щит');
        }
        if (activeHasShield && qd.statsBoostShieldExtra != 0) {
          add('shieldFlat', 'Shield', this.qualityUiSigned(qd.statsBoostShieldExtra, '', 1));
          addShort(70 + Math.abs(qd.statsBoostShieldExtra) / 10, qd.statsBoostShieldExtra > 0 ? 'status.shieldUp' : 'status.shieldDown', qd.statsBoostShieldExtra > 0 ? 'Эффект усиливает защитный щит' : 'Эффект ослабляет защитный щит');
        }
        // _shieldBoostRegen is currently stored but not consumed by updateShield().
        // Keep the UI aligned with actual gameplay and do not report it as active.
        if (activeHasShield && qd.statsBoostShieldDelay != 1) {
          add('shieldDelay', 'Shield regeneration delay', this.qualityUiMultiplier(qd.statsBoostShieldDelay));
        }
        if (qd.statsBoostHealthRegen != 0) {
          add('healthRegenFlat', 'Health regeneration', this.qualityUiSigned(qd.statsBoostHealthRegen, this.qualityUiText('perSecond', '/с'), 2));
          addShort(72, qd.statsBoostHealthRegen > 0 ? 'status.regenUp' : 'status.regenDown', qd.statsBoostHealthRegen > 0 ? 'Эффект восстанавливает прочность турели' : 'Эффект постепенно повреждает турель');
        }
        if (qd.statsBoostHealthRegenFactor != 0) {
          add('healthRegenPercent', 'Health regeneration from maximum', this.qualityUiSigned(qd.statsBoostHealthRegenFactor * 100, '%' + this.qualityUiText('perSecond', '/с'), 2));
          addShort(74, qd.statsBoostHealthRegenFactor > 0 ? 'status.regenUp' : 'status.regenDown', qd.statsBoostHealthRegenFactor > 0 ? 'Эффект восстанавливает прочность турели' : 'Эффект постепенно повреждает турель');
        }
        if (qd.statsBoostExp != 1) {
          add('expMultiplier', 'Experience multiplier', this.qualityUiMultiplier(qd.statsBoostExp));
          addShort(65, qd.statsBoostExp > 1 ? 'status.expUp' : 'status.expDown', qd.statsBoostExp > 1 ? 'Эффект ускоряет прокачку турели' : 'Эффект замедляет прокачку турели');
        }
        if (qd.statsBoostExpUpdate != 0) {
          add('passiveExp', 'Passive experience', this.qualityUiSigned(qd.statsBoostExpUpdate, '', 2));
          addShort(62, qd.statsBoostExpUpdate > 0 ? 'status.expUp' : 'status.expDown', qd.statsBoostExpUpdate > 0 ? 'Эффект ускоряет прокачку турели' : 'Эффект замедляет прокачку турели');
        }
        if (turretType == 'ItemTurret' && qd.statsBoostAmmoQuality != 0) {
          add('ammoQuality', 'Ammo quality', this.qualityUiSigned(qd.statsBoostAmmoQuality, '', 0));
          addShort(80, qd.statsBoostAmmoQuality > 0 ? 'status.ammoUp' : 'status.ammoDown', qd.statsBoostAmmoQuality > 0 ? 'Эффект повышает качество боеприпасов' : 'Эффект снижает качество боеприпасов');
        }
        if (qd.statsBoostInfection) {
          add('infection', 'Quality infection', this.qualityUiText('enabled', 'enabled'));
          addShort(120, 'status.infection', 'Эффект заменяет качество турели');
        }
      } else {
        if (qd.reloadMultiplier != 1) {
          add('reload', 'Reload speed', this.qualityUiFactor(qd.reloadMultiplier));
          if (qd.reloadMultiplier <= 0.001)
            addShort(220, 'disabledFire', 'не может стрелять');
          else
            addShort(95 + Math.abs(qd.reloadMultiplier - 1) * 100, qd.reloadMultiplier > 1 ? 'reloadUp' : 'reloadDown', qd.reloadMultiplier > 1 ? 'быстрее стреляет' : 'медленнее стреляет');
        }
        if (qd.maxHealth != 1) {
          add('healthFactor', 'Maximum health', this.qualityUiFactor(qd.maxHealth));
          addShort(90 + Math.abs(qd.maxHealth - 1) * 100, qd.maxHealth > 1 ? 'healthUp' : 'healthDown', qd.maxHealth > 1 ? 'Повышена максимальная прочность турели' : 'Снижена максимальная прочность турели');
        }
        if (qd.extraHealth != 0) {
          add('healthFlat', 'Maximum health', this.qualityUiSigned(qd.extraHealth, '', 1));
          addShort(82 + Math.abs(qd.extraHealth) / 10, qd.extraHealth > 0 ? 'healthUp' : 'healthDown', qd.extraHealth > 0 ? 'Повышена максимальная прочность турели' : 'Снижена максимальная прочность турели');
        }
        if (baseHasShield && qd.shield != 1) {
          add('shieldFactor', 'Maximum shield', this.qualityUiFactor(qd.shield));
          if (qd.shield <= 0) addShort(115, 'shieldOff', 'Полностью отключен защитный щит турели');
          else addShort(88 + Math.abs(qd.shield - 1) * 100, qd.shield > 1 ? 'shieldUp' : 'shieldDown', qd.shield > 1 ? 'Усилен максимальный щит турели' : 'Ослаблен максимальный щит турели');
        }
        if (baseHasShield && qd.shield > 0 && qd.extraSheald != 0) {
          add('shieldFlat', 'Shield', this.qualityUiSigned(qd.extraSheald, '', 1));
          addShort(80 + Math.abs(qd.extraSheald) / 10, qd.extraSheald > 0 ? 'shieldUp' : 'shieldDown', qd.extraSheald > 0 ? 'Усилен максимальный щит турели' : 'Ослаблен максимальный щит турели');
        }
        if (baseHasShield && qd.shield > 0 && qd.shieldRegen != 1) {
          add('shieldRegen', 'Shield regeneration', this.qualityUiFactor(qd.shieldRegen));
          addShort(67, qd.shieldRegen > 1 ? 'shieldRegenUp' : 'shieldRegenDown', qd.shieldRegen > 1 ? 'Ускорено восстановление щита турели' : 'Замедлено восстановление щита турели');
        }
        if (baseHasShield && qd.shield > 0 && qd.shieldRegenDelay != 1) add('shieldDelay', 'Shield regeneration delay', this.qualityUiMultiplier(qd.shieldRegenDelay));
        if (qd.healthRegen != 0) {
          add('healthRegenFlat', 'Health regeneration', this.qualityUiSigned(qd.healthRegen, this.qualityUiText('perSecond', '/с'), 2));
          addShort(76, qd.healthRegen > 0 ? 'regenUp' : 'regenDown', qd.healthRegen > 0 ? 'Усилено восстановление прочности турели' : 'Турель постепенно теряет свою прочность');
        }
        if (qd.healthRegenFactor != 0) {
          add('healthRegenPercent', 'Health regeneration from maximum', this.qualityUiSigned(qd.healthRegenFactor * 100, '%' + this.qualityUiText('perSecond', '/с'), 2));
          addShort(78, qd.healthRegenFactor > 0 ? 'regenUp' : 'regenDown', qd.healthRegenFactor > 0 ? 'Усилено восстановление прочности турели' : 'Турель постепенно теряет свою прочность');
        }
        if (qd.armor != 0) {
          add('armor', 'Armor', this.qualityUiSigned(qd.armor, '', 1));
          addShort(86, qd.armor > 0 ? 'armorUp' : 'armorDown', qd.armor > 0 ? 'Добавлена постоянная броня турели' : 'Снижена постоянная броня турели');
        }
        if (qd.inaccuracy != 0) {
          add('inaccuracyFlat', 'Inaccuracy', this.qualityUiSigned(qd.inaccuracy, '°', 1));
          addShort(83, qd.inaccuracy < 0 ? 'accuracyUp' : 'accuracyDown', qd.inaccuracy < 0 ? 'Повышена точность наведения турели' : 'Снижена точность наведения турели');
        }
        if (qd.inaccuracyFactor != 1) {
          add('inaccuracyFactor', 'Inaccuracy', this.qualityUiMultiplier(qd.inaccuracyFactor));
          addShort(84 + Math.abs(qd.inaccuracyFactor - 1) * 100, qd.inaccuracyFactor < 1 ? 'accuracyUp' : 'accuracyDown', qd.inaccuracyFactor < 1 ? 'Повышена точность наведения турели' : 'Снижена точность наведения турели');
        }
        if (qd.rotateSpeed != 0) {
          add('rotationFlat', 'Rotation speed', this.qualityUiSigned(qd.rotateSpeed, '', 2));
          addShort(64, qd.rotateSpeed > 0 ? 'rotationUp' : 'rotationDown', qd.rotateSpeed > 0 ? 'Ускорен поворот корпуса турели' : 'Замедлен поворот корпуса турели');
        }
        if (qd.rotateSpeedFactor != 1) {
          add('rotationFactor', 'Rotation speed', this.qualityUiFactor(qd.rotateSpeedFactor));
          if (qd.rotateSpeedFactor <= 0.001)
            addShort(210, 'rotationOff', 'не может поворачиваться');
          else
            addShort(66 + Math.abs(qd.rotateSpeedFactor - 1) * 100, qd.rotateSpeedFactor > 1 ? 'rotationUp' : 'rotationDown', qd.rotateSpeedFactor > 1 ? 'быстрее наводится' : 'медленнее наводится');
        }
        if (qd.luck != 0) {
          add('luck', 'Luck', this.qualityUiSigned(qd.luck, '', 0));
          addShort(89 + Math.abs(qd.luck) / 5, qd.luck > 0 ? 'luckUp' : 'luckDown', qd.luck > 0 ? 'Повышена удача при стрельбе' : 'Снижена удача при стрельбе');
        }
        if (turretType == 'ItemTurret' && qd.upAmmoQuality != 0) {
          add('ammoQuality', 'Ammo quality', this.qualityUiSigned(qd.upAmmoQuality, '', 0));
          addShort(85, qd.upAmmoQuality > 0 ? 'ammoUp' : 'ammoDown', qd.upAmmoQuality > 0 ? 'Повышено качество доступных боеприпасов' : 'Снижено качество доступных боеприпасов');
        }
        if (qd.expBoost != 1) {
          add('expMultiplier', 'Experience multiplier', this.qualityUiMultiplier(qd.expBoost));
          addShort(72, qd.expBoost > 1 ? 'expUp' : 'expDown', qd.expBoost > 1 ? 'Ускорена прокачка уровня турели' : 'Замедлена прокачка уровня турели');
        }
        if (qd.expUpdate != 0) {
          add('passiveExp', 'Passive experience', this.qualityUiSigned(qd.expUpdate, '', 2));
          addShort(70, qd.expUpdate > 0 ? 'expUp' : 'expDown', qd.expUpdate > 0 ? 'Ускорена прокачка уровня турели' : 'Замедлена прокачка уровня турели');
        }
        if (qd.shotHealth != 0) {
          add('shotHeal', 'Health per shot', this.qualityUiSigned(qd.shotHealth, '', 2));
          addShort(87, qd.shotHealth > 0 ? 'shotHeal' : 'shotHurt', qd.shotHealth > 0 ? 'Выстрелы восстанавливают прочность турели' : 'Выстрелы уменьшают прочность турели');
        }
        if (qd.shotDamage != 0) {
          add('selfDamageFlat', 'Self-damage per shot', this.qualityUiSigned(qd.shotDamage, '', 2));
          addShort(105, 'selfDamage', 'Выстрелы повреждают саму турель');
        }
        if (qd.shotDamageFactor != 0) {
          add('selfDamagePercent', 'Self-damage from maximum health', this.qualityUiSigned(qd.shotDamageFactor * 100, '%', 2));
          addShort(110, 'selfDamage', 'Выстрелы повреждают саму турель');
        }
        if (turretType == 'PowerTurret' && qd.powerShots != 0) {
          add('preparedShotsFlat', 'Prepared shots', this.qualityUiSigned(qd.powerShots, '', 0));
          addShort(68, qd.powerShots > 0 ? 'preparedUp' : 'preparedDown', qd.powerShots > 0 ? 'Увеличен запас усиленных выстрелов' : 'Уменьшен запас усиленных выстрелов');
        }
        if (turretType == 'PowerTurret' && qd.powerShotsFactor != 1) {
          add('preparedShotsFactor', 'Prepared shots', this.qualityUiFactor(qd.powerShotsFactor));
          addShort(69, qd.powerShotsFactor > 1 ? 'preparedUp' : 'preparedDown', qd.powerShotsFactor > 1 ? 'Увеличен запас усиленных выстрелов' : 'Уменьшен запас усиленных выстрелов');
        }
        if (hasFastShots && qd.fastShots != 0) {
          add('fastShotsFlat', 'First-burst ammunition', this.qualityUiSigned(qd.fastShots, '', 0));
          addShort(68, qd.fastShots > 0 ? 'fastShotsUp' : 'fastShotsDown', qd.fastShots > 0 ? 'Увеличен боезапас первой очереди' : 'Уменьшен боезапас первой очереди');
        }
        if (hasFastShots && qd.fastShotsFactor != 1) {
          add('fastShotsFactor', 'First-burst ammunition', this.qualityUiFactor(qd.fastShotsFactor));
          addShort(69, qd.fastShotsFactor > 1 ? 'fastShotsUp' : 'fastShotsDown', qd.fastShotsFactor > 1 ? 'Увеличен боезапас первой очереди' : 'Уменьшен боезапас первой очереди');
        }
        if (hasFastShots && qd.fastShotsDelay != 1) add('fastShotsDelay', 'First-burst delay', this.qualityUiMultiplier(qd.fastShotsDelay));
        if (qd.extraBulet != undefined) {
          add('extraProjectile', 'Extra projectiles / base chance', this.qualityUiNumber(qd.extraBulets, 0) + ' / ' + this.qualityUiNumber(qd.extraBuletChance * 100, 1) + '%');
          addShort(92, 'extraProjectile', 'Добавлены дополнительные снаряды при стрельбе');
        }
        if (qd.evo != undefined) {
          let evoText = this.qualityUiText('level', 'level') + ' ' + qd.evoLvl;
          if (typeof qd.evo == 'object' && qd.evo.length >= 2) {
            try { evoText += ' -> ' + uranium.turretQualityGet(qd.evo[0], qd.evo[1]).name; } catch (e) {}
          }
          add('evolution', 'Quality evolution', evoText);
          addShort(63, 'evolution', 'Качество изменится после прокачки');
        }
        if (qd.laserType != undefined) {
          add('laserMode', 'Firing mode', this.qualityUiLocalizedValue('laserMode', qd.laserType));
          addShort(77, 'specialWeapon', 'Изменена боевая конфигурация турели');
        }
        if (qd.statsBoost) {
          let range = qd.statsBoostRange;
          if (entity != null && entity.getP != undefined) range += entity.getP().size * 8;
          add('auraRange', 'Support aura radius', this.qualityUiNumber(range / 8, 1) + ' ' + this.qualityUiText('tiles', 'tiles'));
          add('auraPriority', 'Aura effect strength', this.qualityUiNumber(qd.statsBoostStrong, 0));
          add('auraType', 'Aura effect type', this.qualityUiLocalizedValue('effectType', qd.statsBoostType));

          if (qd.statsBoostReloadMultiplier != 1)
            add('auraReload', 'Aura: reload speed', this.qualityUiFactor(qd.statsBoostReloadMultiplier));
          if (qd.statsBoostHealthFactor != 1)
            add('auraHealthFactor', 'Aura: maximum health', this.qualityUiFactor(qd.statsBoostHealthFactor));
          if (qd.statsBoostHealthExtra != 0)
            add('auraHealthFlat', 'Aura: maximum health', this.qualityUiSigned(qd.statsBoostHealthExtra, '', 1));
          if (qd.statsBoostShieldFactor != 1)
            add('auraShieldFactor', 'Aura: maximum shield (if available)', this.qualityUiFactor(qd.statsBoostShieldFactor));
          if (qd.statsBoostShieldExtra != 0)
            add('auraShieldFlat', 'Aura: shield (if available)', this.qualityUiSigned(qd.statsBoostShieldExtra, '', 1));
          // statsBoostShieldRegen is intentionally omitted: _shieldBoostRegen is
          // not consumed by the current updateShield() implementation.
          if (qd.statsBoostShieldDelay != 1)
            add('auraShieldDelay', 'Aura: shield regeneration delay', this.qualityUiMultiplier(qd.statsBoostShieldDelay));
          if (qd.statsBoostHealthRegen != 0)
            add('auraHealthRegenFlat', 'Aura: health regeneration', this.qualityUiSigned(qd.statsBoostHealthRegen, this.qualityUiText('perSecond', '/s'), 2));
          if (qd.statsBoostHealthRegenFactor != 0)
            add('auraHealthRegenPercent', 'Aura: health regeneration from maximum', this.qualityUiSigned(qd.statsBoostHealthRegenFactor * 100, '%' + this.qualityUiText('perSecond', '/s'), 2));
          if (qd.statsBoostExp != 1)
            add('auraExpMultiplier', 'Aura: experience gain multiplier', this.qualityUiMultiplier(qd.statsBoostExp));
          if (qd.statsBoostExpUpdate != 0)
            add('auraPassiveExp', 'Aura: passive experience', this.qualityUiSigned(qd.statsBoostExpUpdate, '', 2));
          if (qd.statsBoostAmmoQuality != 0)
            add('auraAmmoQuality', 'Aura: item-turret ammo class', this.qualityUiSigned(qd.statsBoostAmmoQuality, '', 0));
          if (qd.statsBoostInfection)
            add('auraInfection', 'Aura: quality infection', this.qualityUiText('enabled', 'enabled'));

          addShort(100, qd.statsBoostInfection ? 'infectionAura' : 'supportAura', qd.statsBoostInfection ? 'Передаёт своё качество соседним турелям' : 'Усиливает соседние урановые турели');
        }
        if (qd.statsBoostResistStrong != 0) {
          add('resistance', 'Effect resistance threshold', this.qualityUiNumber(qd.statsBoostResistStrong, 0));
          addShort(74, 'resistance', 'сопротивляется внешним эффектам');
        }
        if (qd.statsBoostResistType != undefined) {
          add('resistanceType', 'Effect type immunity', this.qualityUiLocalizedValue('effectType', qd.statsBoostResistType));
          addShort(91, 'resistanceType', 'игнорирует указанный тип эффектов');
        }
      }

      short.sort((a, b) => b.score - a.score);
      let shortText = this.qualityUiShortText(qd, statusMode, short, entity);

      return {name: qd.name, color: qd.color, shortText: shortText, lines: lines};
    },

    qualityUiTooltipText(entity, statusMode) {
      let ui = this.qualityUiBuild(entity, statusMode);
      if (ui == null) return '';
      let title = statusMode ? this.qualityUiText('effectTitle', 'Active effect') : this.qualityUiText('qualityTitle', 'Turret quality'),
        body = '[accent]' + title + ':[] ' + ui.name + '\n[lightgray]' + ui.shortText + '[]';
      if (ui.lines.length > 0) body += '\n\n' + ui.lines.join('\n');
      else body += '\n\n[lightgray]' + this.qualityUiText('noNumeric', 'No numeric modifiers') + '[]';
      return body;
    },

    qualityUiAddTooltip(actor, entity, statusMode) {
      // Scene2D bars in the world-hover HUD are not reliable hover targets: the
      // cursor is physically over the world turret, not over those HUD rows.
      // Detailed information is therefore handled by qualityUiInitHoverTooltip().
      return actor;
    },

    qualityUiWorldTooltipText(entity) {
      let quality = this.qualityUiTooltipText(entity, false),
        status = this.qualityUiBuild(entity, true);
      if (status != null) quality += '\n\n' + this.qualityUiTooltipText(entity, true);
      return quality;
    },

    qualityUiInitHoverTooltip() {
      if (Vars.headless || Vars.mobile || this._qualityWorldTooltipInit) return;
      this._qualityWorldTooltipInit = true;
      this._qualityWorldHoverBuild = null;
      this._qualityWorldHoverId = -1;
      this._qualityWorldHoverTime = 0;
      this._qualityWorldTooltip = null;
      this._qualityWorldTooltipText = null;
      this._qualityWorldTooltipPos = new Vec2();

      const hide = () => {
        if (uranium._qualityWorldTooltip != null) {
          uranium._qualityWorldTooltip.remove();
          uranium._qualityWorldTooltip = null;
          uranium._qualityWorldTooltipText = null;
        }
      };

      const validTurret = build => build != null && build.getD != undefined &&
        build.getQD != undefined && build.getPO != undefined && build.block != null;

      Events.run(Trigger.update, () => {
        if (!Vars.state.isGame() || Core.scene.hasDialog()) {
          uranium._qualityWorldHoverBuild = null;
          uranium._qualityWorldHoverId = -1;
          uranium._qualityWorldHoverTime = 0;
          hide();
          return;
        }

        let build = Vars.world.buildWorld(Core.input.mouseWorldX(), Core.input.mouseWorldY());
        if (!validTurret(build)) {
          uranium._qualityWorldHoverBuild = null;
          uranium._qualityWorldHoverId = -1;
          uranium._qualityWorldHoverTime = 0;
          hide();
          return;
        }

        if (uranium._qualityWorldHoverId != build.id) {
          uranium._qualityWorldHoverBuild = build;
          uranium._qualityWorldHoverId = build.id;
          uranium._qualityWorldHoverTime = 0;
          hide();
          return;
        }

        uranium._qualityWorldHoverTime += Time.delta;
        if (uranium._qualityWorldHoverTime < 60 * 1) {
          hide();
          return;
        }

        let detailText = uranium.qualityUiWorldTooltipText(build);
        if (uranium._qualityWorldTooltip == null) {
          let popup = new Table();
          popup.background(Styles.black8);
          popup.touchable = Touchable.disabled;
          popup.margin(7);
          uranium._qualityWorldTooltip = popup;
          Core.scene.add(popup);
        }

        if (uranium._qualityWorldTooltipText != detailText) {
          let popup = uranium._qualityWorldTooltip;
          popup.clearChildren();
          let label = popup.add(detailText).width(340).left().wrap().get();
          label.setFontScale(0.86);
          popup.pack();
          uranium._qualityWorldTooltipText = detailText;
        }

        let popup = uranium._qualityWorldTooltip,
          pos = Core.scene.screenToStageCoordinates(uranium._qualityWorldTooltipPos.set(Core.input.mouseX(), Core.input.mouseY())),
          gap = 18,
          x = pos.x + gap,
          y = pos.y - popup.getHeight() - gap,
          sw = Core.scene.getWidth(),
          sh = Core.scene.getHeight();

        if (x + popup.getWidth() > sw - 6) x = pos.x - popup.getWidth() - gap;
        if (y < 6) y = pos.y + gap;
        x = Math.max(6, Math.min(x, sw - popup.getWidth() - 6));
        y = Math.max(6, Math.min(y, sh - popup.getHeight() - 6));
        popup.setPosition(x, y);
        popup.toFront();
      });
    },

    setTurretBars() {
      this.super$setBars();
      if (this.getObj == undefined) {
        return;
      };
      this.addBar("name", func(entity => {
        let bar = new Bar(
          entity.getQD('name'),
          entity.getQD('color'),
          floatp(() => {
            return 1;
          }));
        return bar;
      }));
      this.addBar("effect", func(entity => {
        let data = entity.getD();
        if (data.turretStatusIsset == undefined || !data.turretStatusIsset) return null;

        let name = entity.getStatusName()[0],
          bar = new Bar(
            name,
            Color.valueOf(entity.getStatusName()[1]),
            floatp(() => {
              return 1;
            }));
        return bar;
      }));
      this.addBar("level", func(entity => {
        return new Bar(
          Core.bundle.get("uranium-mod.bars.Level") + ' ' + entity.getD().lvl,
          Color.valueOf("E9FE31"),
          floatp(() => {
            return entity.getD().lvl / uranium.turretLvlMap.length;
          }));
      }));
      this.addBar("exp", func(entity => {
        return new Bar(
          Core.bundle.get("uranium-mod.bars.Exp") + ': ' + Math.round(entity.getD().exp),
          Color.valueOf("23f023"),
          floatp(() => {
            return entity.getD().exp / entity.getPO().getTurretMap(entity.getD().lvl, 'nextLvlExp');
          }));
      }));
      this.addBar("stats", func(ent => {
        return new Bar(
          Core.bundle.get("uranium-mod.bars.Stats") + ':',
          Color.valueOf("E9FE31"),
          floatp(() => {
            return 0;
          }));
      }));
      if (this.getObj().type != 'LaserTurret')
        this.addBar("reload", func(ent => {
          let
            rm = ent.getReloadMulti();
          return new Bar(
            Core.bundle.get("uranium-mod.bars.ReloadMultiplier") + ": " + Math.round(rm * 100) + "%",
            Color.valueOf("70F828"),
            floatp(() => {
              return rm / 2;
            }));
        }));
      this.addBar("dps", func(ent => {
        let dpsColor = Color.valueOf("F6A53A");
        return new Bar(
          prov(() => {
            let dps = ent.getDps();
            return Core.bundle.get("uranium-mod.bars.DPS") + ": " + uranium.qualityUiNumber(dps, dps < 100 ? 1 : 0);
          }),
          prov(() => dpsColor),
          floatp(() => {
            let dps = ent.getDps(),
              tier = ent.getP != undefined && ent.getP().tier != undefined ? ent.getP().tier : 1,
              tierMax = tier <= 1 ? 2000 : tier == 2 ? 4000 : tier == 3 ? 6000 : 7000;
            return dps <= 0 ? 0 : Math.min(1, dps / tierMax);
          })
        );
      }));
      this.addBar("maxHealth", func(ent => {
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
        this.addBar("ammoQ", func(ent => {
          let
            ammo = ent.getAmmoQuality();
          return new Bar(
            Core.bundle.get("uranium-mod.bars.AmmoQuality") + ": " + ammo,
            Color.valueOf("70F828"),
            floatp(() => {
              return ammo / 5;
            }));
        }));
      this.addBar("luck", func(ent => {
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
        this.addBar("prepShot", func(ent => {
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
        this.addBar("sheald", func(ent => {
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
        this.addBar("fastShots", func(ent => {
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
      newObj.const = extend(newObj.getType(), newObj.name, f)
      return newObj;
    },

    createLiquid(name, f) {
      let
        newObj = uranium.createObj('Liquid', name);

      newObj.const = Liquid(name);
      if (typeof (f) == 'object') {
        let
          keys = Object.keys(f);

        for (let i = 0; i < keys.length; i++) {
          newObj.const[keys[i]] = f[keys[i]];
        }
      }

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

    // Fuel-dependent emissive lighting for the three Uranium turret fuel tiers.
    // This is deliberately visual-only: liquid consumption/coolant mechanics are untouched.
    // 4.09: colors and the result container are reused; no per-frame JS object/Color allocation.
    '_turretFuelGlowConfigs': {
      'uranium-mod-thorium_oil': {color: Color.valueOf('00D7F2'), alpha: 0.40},
      'uranium-mod-uranium_oil': {color: Color.valueOf('35FF3F'), alpha: 0.53},
      'uranium-mod-iridium_oil': {color: Color.valueOf('F0F7FF'), alpha: 0.53}
    },
    '_turretFuelGlowScratch': {level: 0, eased: 0, pulse: 0, color: null, alpha: 0},
    getTurretFuelGlow(t) {
      if (t == null || t.liquids == null || t.parent == null || t.parent.liquidCapacity <= 0) return null;

      const amount = t.liquids.currentAmount();
      if (amount <= 0.001) return null;

      const liquid = t.liquids.current();
      if (liquid == null) return null;

      const config = this._turretFuelGlowConfigs[liquid.name];
      if (config == undefined) return null;

      const level = Mathf.clamp(amount / t.parent.liquidCapacity),
        seed = (t.tile != null ? t.tile.pos() : (t.x * 13 + t.y * 7)),
        scratch = this._turretFuelGlowScratch;

      scratch.level = level;
      scratch.eased = Math.pow(level, 0.62);
      scratch.pulse = 0.90 + 0.10 * Math.sin(Time.time / 11.5 + seed * 0.031);
      scratch.color = config.color;
      scratch.alpha = config.alpha;
      return scratch;
    },

    drawTurretFuelGlow(t, x, y) {
      let glow = uranium.getTurretFuelGlow(t);
      if (glow == null) return;

      let size = t.parent.size != undefined ? t.parent.size : 2,
        radius = (11 + size * 7.2) * (0.42 + glow.eased * 0.58) * (0.97 + 0.03 * glow.pulse),
        lightAlpha = glow.alpha * (0.13 + 0.87 * glow.eased) * glow.pulse,
        coreRadius = radius * (0.48 + 0.08 * glow.eased);

      // Diffuse halo at roughly the same apparent intensity as the liquid itself.
      Drawf.light(x, y, radius, glow.color, lightAlpha);
      // Small brighter inner emission makes a full fuel chamber visibly energized rather than merely tinted.
      Drawf.light(x, y, coreRadius, glow.color, lightAlpha * 0.42);
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
        Draw.color(uranium.getRuntimeColor(uranium.tier_colors[t.getP().tier - 1]));
        Draw.rect(t.getP().regionsLvl[t.getD().lvl - 2], t.x + 4 * (size - 1), t.y - 4 * (size - 1));
      }
    },

    drawTurretPlan(plan, list) {
      let
        baseRegion = Core.atlas.find(this.mod_base + '-' + this.baseLoadRegion.base[0]),
        turretRegion = Core.atlas.find(this.mod_turret + '-' + this.getObj().name + this.baseLoadRegion.turret[0]),
        rotation = this.rotate ? plan.rotation * 90 - 90 : 0;

      Draw.rect(baseRegion, plan.drawx(), plan.drawy());
      Draw.rect(turretRegion, plan.drawx(), plan.drawy(), rotation);
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
        shootOffset = this.curRecoil * this.block.recoil * 1.5 - 0.05,
        liquid = this.liquids.currentAmount() / this.parent.liquidCapacity,
        turretColor = this.getTurretColor();

      if (turretColor)
        Draw.color(uranium.getRuntimeColor(turretColor));
      Draw.rect(baseRegion[0], this.x, this.y);
      if (turretColor)
        Draw.reset();




      if (baseRegion[1] != 'error' && liquid > 0.1) {
        Draw.alpha(liquid);
        Draw.rect(baseRegion[1], this.x, this.y);
        Draw.alpha(1);
      }

      Draw.z(Layer.turret);
      const rotRad = rot1 * Math.PI / 180,
        rotSin = Math.sin(rotRad),
        rotCos = Math.cos(rotRad);
      let
        x = this.x + rotSin * shootOffset,
        y = this.y - rotCos * shootOffset;
      if (turretColor)
        Draw.color(uranium.getRuntimeColor(turretColor));
      Draw.rect(turretRegion[0], x, y, rot1);
      if (turretColor)
        Draw.reset();
      if (turretRegion[1] != 'error' && liquid > 0.1) {
        Draw.alpha(liquid);
        Draw.rect(turretRegion[1], x, y, rot1);
      }

      if (turretRegion[2] != 'error' && this.heat > 0.01) {
        if (this.parent.heatColor != undefined)
          Draw.color(this.parent.heatColor);
        Draw.alpha(this.heat);
        Draw.rect(turretRegion[2], x, y, rot1);
      }

      uranium.drawTurretFuelGlow(this, x, y);
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
      if (this.getObj == undefined) {
        return;
      }

      for (let i = 0; i < turretRegion.length; i++) {
        this.regions[''].turret.push(Core.atlas.find(this.mod_turret + '-' + this.getObj().name + turretRegion[i]));
      };

      for (let i = 0; i < baseRegion.length; i++) {
        this.regions[''].base.push(Core.atlas.find(this.mod_base + '-' + baseRegion[i]));
      };

      uranium.loadLvlImg(this);
    },

    iconTurret() {
      return [
        Core.atlas.find(this.mod_base + "-tier-" + this.tier + "-" + this.size + "-base"),
        Core.atlas.find(this.mod_turret + '-' + this.getObj().name)
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
        extraShotsFactor: 0
      },
      {//--1 уровень
        nextLvlExp: 500,
        reloadMultiplier: 1,
        maxHealth: 1,
        luck: 0,
        updateAmmoQuality: 0,
        sheald: 0,
        extraShotsFactor: 0
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
        extraShotsFactor: 0.25
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
        extraShotsFactor: 0.5
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
        extraShotsFactor: 0.75
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
        extraShotsFactor: 1,
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
            key = obj_keys[i],
            value = obj[key];

          // Current Turret API equivalents for fields removed after v6.
          if (this.const.shoot != undefined) {
            if (key == 'chargeTime') {
              this.const.shoot.firstShotDelay = value;
            } else if (key == 'powerUse') {
              // PowerTurret no longer has powerUse; create the same conditional consumer explicitly.
              this.const.consumePowerCond(value, boolf(build => build.isActive()));
            } else if (key == 'shootShake') {
              this.const.shake = value;
            } else if (key == 'recoilAmount') {
              this.const.recoil = value;
            } else if (key == 'cooldown') {
              this.const.cooldownTime = value > 0 ? 1 / value : 20;
            } else if (key == 'shootLength') {
              this.const.shootY = value;
            } else if (key == 'reloadTime') {
              this.const.reload = value;
            } else if (key == 'shots') {
              this.const.shoot.shots = value;
            } else if (key == 'burstSpacing') {
              this.const.shoot.shotDelay = value;
            }
          }

          // Uranium-specific metadata (alternate/spread/tier/etc.) remains available on the adapter.
          this.const[key] = value;
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
    this.const.buildType = prov(() => extend(this.getType()[this.type + 'Build'], this.const, f));
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
  return extend(this.getType()[this.type + 'Build'], this.const, f);
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
    this.const.coolant = new ConsumeLiquidFilter(boolf(l => l == liquid), liquidAmount);
    if (liquidBust != undefined) {
      this.const.coolantMultiplier = liquidBust;
    }
  }
  return this;
});

uranium.addObjMethod('setTurretShot', function (reload, shots, burstSpace) {
  // v8: Turret.reloadTime -> ReloadTurret.reload; burst settings live in ShootPattern.
  this.const.reload = reload;
  if (shots != undefined) {
    this.const.shoot.shots = shots;
    if (burstSpace != undefined) {
      this.const.shoot.shotDelay = burstSpace;
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
