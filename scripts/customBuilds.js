const
  uranium = global.uranium;


uranium.addCustomBuild('ciklon', function () {
  let
    f_r;

  let
    obj = this,
    parent = this.const;

  f_r = () => {
    let
      tq = [4, 0],
      data = {
        exp: 0,
        lvl: 1,
        sheald: 0,
        turretStatusIsset: 0,
        turretStatusQ: 0,
        turretStatusT: 0,
        turretQuality: {
          q: tq[0],
          t: tq[1]
        }
      };
    const e = obj.extendTurret({
      parent: parent,
      data: data,
      _maxSheald: 0,
      _lastDamage: 0,
      _uraniumQualityReady: false,
      _qualityData: uranium.turretQualityPendingData(),
      getQD(name) {
        return this._qualityData[name];
      },
      getD() {
        return this.data;
      },
      getP() {
        return this.parent;
      },
      getPO() {
        return obj;
      },
      getMaxSheald() {
        return this._maxSheald;
      },
      updateShooting() {
        if (this.reloadCounter >= this.block.reload) {
          let
            type = this.peekAmmo(),
            reloadBoost = 1;
          this.shoot(type);
          if (Math.random() < 0.45) {
            this.shoot(type);
            reloadBoost = reloadBoost * Math.random();
            if (Math.random() < 0.35) {
              this.shoot(type);
              reloadBoost = reloadBoost * Math.random();
              if (Math.random() < 0.3) {
                this.shoot(type);
                reloadBoost = reloadBoost * Math.random();
              }
            }
          }
          if (this.checkLuck()) {
            this.shoot(type);
          };
          this.reloadCounter -= this.block.reload * reloadBoost;
        }
      },
      draw: uranium.drawTurret,
      // Mindustry 159.7 Turret.updateTile() already calls updateReload(). Uranium
      // keeps its v126 quality-aware manual reload below, so suppress only the vanilla
      // base increment; handleReload() still calls updateCooling() for turret fuel.
      updateReload() {
      },
      updateTile() {
        this.super$updateTile();
        this.runAdaptiveBaseUpdate();

        if (this.hasAmmo() && this.reloadCounter < this.block.reload) {
          this.reloadCounter += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed() * this.getReloadMulti();
        }
      },
      bullet: uranium.t.baseBullet,
      shoot: uranium.t.baseShot,
      version() {
        return 3;
      },
      write(writer) {
        uranium.clearLegacyTileMap();
        writer.i(data.lvl);
        writer.i(data.exp);
        writer.i(data.sheald);
        writer.i(this.rotation);
        writer.i(data.turretQuality.q);
        writer.i(data.turretQuality.t);
        writer.i(data.turretStatusIsset);
        writer.i(data.turretStatusQ);
        writer.i(data.turretStatusT);
        writer.f(this.getSavedHealthFraction());
      },
      read(read, revision) {
        data.lvl = read.i();
        data.exp = read.i();
        data.sheald = read.i();
        this.rotation = read.i();
        data.turretQuality.q = read.i();
        data.turretQuality.t = read.i();
        this._uraniumQualityReady = true;
        data.turretStatusIsset = read.i();
        data.turretStatusQ = read.i();
        data.turretStatusT = read.i();
        let savedHealthFraction = revision >= 3 ? read.f() : undefined;
        if (data.turretStatusIsset) {
          this.allResetBoost();
          this.setStatusBoost(data.turretStatusQ, data.turretStatusT);
        } else {
          this.updateLvl();
        };
        this.restoreSavedHealthFraction(savedHealthFraction, revision);
      }
    });
    return e;
  };

  return f_r;
});

uranium.addCustomBuild('inkvizitor', function () {
  let
    f_r;

  let
    obj = this,
    parent = this.const;

  f_r = () => {
    let
      tq = [4, 0],
      data = {
        exp: 0,
        lvl: 1,
        sheald: 0,
        booster: 1,
        turretStatusIsset: 0,
        turretStatusQ: 0,
        turretStatusT: 0,
        turretQuality: {
          q: tq[0],
          t: tq[1]
        }
      };
    const e = obj.extendTurret({
      parent: parent,
      data: data,
      _maxSheald: 0,
      _lastDamage: 0,
      _lastShoot: 0,
      _uraniumQualityReady: false,
      _qualityData: uranium.turretQualityPendingData(),
      getQD(name) {
        return this._qualityData[name];
      },
      getD() {
        return this.data;
      },
      getP() {
        return this.parent;
      },
      getPO() {
        return obj;
      },
      getMaxSheald() {
        return this._maxSheald;
      },
      draw: uranium.drawTurret,
      updateShooting() {
        if (this.reloadCounter >= this.block.reload) {
          let
            type = this.peekAmmo();

          this.shoot(type);
          if (this.checkLuck()) {
            this.shoot(type);
          };
          this.reloadCounter -= this.block.reload;
          this._lastShoot = 0;
          data.booster += 0.03;
          if (data.booster > 3) {
            this.damage(1 * data.booster);
          }

        }
      },
      // Mindustry 159.7 Turret.updateTile() already calls updateReload(). Uranium
      // keeps its v126 quality-aware manual reload below, so suppress only the vanilla
      // base increment; handleReload() still calls updateCooling() for turret fuel.
      updateReload() {
      },
      updateTile() {
        this.super$updateTile();
        this.runAdaptiveBaseUpdate();

        if (this.hasAmmo() && this.reloadCounter < this.block.reload) {
          this.reloadCounter += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed() * this.getReloadMulti() * data.booster;
        }
        this._lastShoot++;
        if (data.booster > 1 && this._lastShoot > 30) {
          data.booster -= 0.06;
        }
      },
      bullet: uranium.t.baseBullet,
      shoot: uranium.t.baseShot,
      version() {
        return 3;
      },
      write(writer) {
        uranium.clearLegacyTileMap();
        writer.i(data.lvl);
        writer.i(data.exp);
        writer.i(data.sheald);
        writer.f(data.booster);
        writer.f(this.rotation);
        writer.i(data.turretQuality.q);
        writer.i(data.turretQuality.t);
        writer.i(data.turretStatusIsset);
        writer.i(data.turretStatusQ);
        writer.i(data.turretStatusT);
        writer.f(this.getSavedHealthFraction());
      },
      read(read, revision) {
        data.lvl = read.i();
        data.exp = read.i();
        data.sheald = read.i();
        data.booster = read.f();
        this.rotation = read.f();
        data.turretQuality.q = read.i();
        data.turretQuality.t = read.i();
        this._uraniumQualityReady = true;
        data.turretStatusIsset = read.i();
        data.turretStatusQ = read.i();
        data.turretStatusT = read.i();
        let savedHealthFraction = revision >= 3 ? read.f() : undefined;
        if (data.turretStatusIsset) {
          this.allResetBoost();
          this.setStatusBoost(data.turretStatusQ, data.turretStatusT);
        } else {
          this.updateLvl();
        };
        this.restoreSavedHealthFraction(savedHealthFraction, revision);
      }
    });
    return e;
  };

  return f_r;
});