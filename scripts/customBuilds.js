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
      tq = uranium.turretQualityGenerate(parent),
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
      _qualityData: uranium.turretQualityGet(data.turretQuality.q, data.turretQuality.t),
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
        if (this.reload >= this.block.reloadTime) {
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
          this.reload -= this.block.reloadTime * reloadBoost;
        }
      },
      draw: uranium.drawTurret,
      updateTile() {
        this.super$updateTile();

        this.baseUpdateTile();

        if (this.hasAmmo() && this.reload < this.block.reloadTime) {
          this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed() * this.getReloadMulti();
        }
      },
      bullet: uranium.t.baseBullet,
      shoot: uranium.t.baseShot,
      write(writer) {
        uranium.tileMap = {};
        writer.i(data.lvl);
        writer.i(data.exp);
        writer.i(data.sheald);
        writer.i(this.rotation);
        writer.i(data.turretQuality.q);
        writer.i(data.turretQuality.t);
        writer.i(data.turretStatusIsset);
        writer.i(data.turretStatusQ);
        writer.i(data.turretStatusT);
      },
      read(read, revision) {
        data.lvl = read.i();
        data.exp = read.i();
        data.sheald = read.i();
        this.rotation = read.i();
        data.turretQuality.q = read.i();
        data.turretQuality.t = read.i();
        data.turretStatusIsset = read.i();
        data.turretStatusQ = read.i();
        data.turretStatusT = read.i();
        if (data.turretStatusIsset) {
          this.allResetBoost();
          this.setStatusBoost(data.turretStatusQ, data.turretStatusT);
        } else {
          this.updateLvl();
        };
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
      tq = uranium.turretQualityGenerate(parent),
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
      _qualityData: uranium.turretQualityGet(data.turretQuality.q, data.turretQuality.t),
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
        if (this.reload >= this.block.reloadTime) {
          let
            type = this.peekAmmo();

          this.shoot(type);
          if (this.checkLuck()) {
            this.shoot(type);
          };
          this.reload -= this.block.reloadTime;
          this._lastShoot = 0;
          data.booster += 0.03;
          if (data.booster > 3) {
            this.damage(1 * data.booster);
          }

        }
      },
      updateTile() {
        this.super$updateTile();

        this.baseUpdateTile();

        if (this.hasAmmo() && this.reload < this.block.reloadTime) {
          this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed() * this.getReloadMulti() * data.booster;
        }
        this._lastShoot++;
        if (data.booster > 1 && this._lastShoot > 30) {
          data.booster -= 0.06;
        }
      },
      bullet: uranium.t.baseBullet,
      shoot: uranium.t.baseShot,
      write(writer) {
        uranium.tileMap = {};
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
      },
      read(read, revision) {
        data.lvl = read.i();
        data.exp = read.i();
        data.sheald = read.i();
        data.booster = read.f();
        this.rotation = read.f();
        data.turretQuality.q = read.i();
        data.turretQuality.t = read.i();
        data.turretStatusIsset = read.i();
        data.turretStatusQ = read.i();
        data.turretStatusT = read.i();
        if (data.turretStatusIsset) {
          this.allResetBoost();
          this.setStatusBoost(data.turretStatusQ, data.turretStatusT);
        } else {
          this.updateLvl();
        };
      }
    });
    return e;
  };

  return f_r;
});