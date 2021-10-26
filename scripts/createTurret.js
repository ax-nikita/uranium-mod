const
  uranium = global.uranium;

uranium.t = {};

uranium.t.updateData = function (data) {
  this.data = data;
  this.updateLvl();
};

uranium.t.serverSynch = (() => {
  const TYPE = 'uranium-mod-turretSynch';

  function makePackage(data, tilePos) {
    let
      pack = {
        tP: tilePos,
        d: data
      };

    return uranium.JSON.stringify(pack);
  }

  var inited = false;
  function init() {
    if (inited) {
      return;
    }
    if (Vars.netClient) {
      Vars.netClient.addPacketHandler(
        TYPE,
        cons(pack => {
          let
            raspack = uranium.JSON.parse(pack);
          let
            tile = Vars.world.tile(raspack.tP);

          if (tile.block()) {
            let
              build = tile.build;
            build.updateData(raspack.d);
          }
        })
      );
    }
  }
  Events.on(ClientLoadEvent, cons(e => {
    init();
  }));
  return (data, tilePos) => {
    const pack = makePackage(data, tilePos);
    Call.clientPacketReliable(TYPE, pack);
  }
})();

uranium.t.serverSynchExp = (() => {
  const TYPE = 'uranium-mod-turretSynchExp';

  function makePackage(data, tilePos) {
    let
      pack = {
        tP: tilePos,
        d: data
      };

    return uranium.JSON.stringify(pack);
  }

  var inited = false;
  function init() {
    if (inited) {
      return;
    }
    if (Vars.netClient) {
      Vars.netClient.addPacketHandler(
        TYPE,
        cons(pack => {
          let
            raspack = uranium.JSON.parse(pack);
          let
            tile = Vars.world.tile(raspack.tP);

          if (tile.block()) {
            let
              build = tile.build;
            if (build == undefined || build.getD == undefined)
              return;
            let
              data = build.getD();
            data.exp = raspack.d.exp;
            data.lvl = raspack.d.lvl;
            if (raspack.d.lvlUp == 1) {
              build.expEffect();
            }
          }
        })
      );
    }
  }
  Events.on(ClientLoadEvent, cons(e => {
    init();
  }));
  return (data, tilePos) => {
    const pack = makePackage(data, tilePos);
    Call.clientPacketReliable(TYPE, pack);
  }
})();

uranium.t.serverSynchShealdAndHealth = (() => {
  const TYPE = 'uranium-mod-SynchShealdAndHealth';

  function makePackage(data, tilePos) {
    let
      pack = {
        tP: tilePos,
        d: data
      };

    return uranium.JSON.stringify(pack);
  }

  var inited = false;
  function init() {
    if (inited) {
      return;
    }
    if (Vars.netClient) {
      Vars.netClient.addPacketHandler(
        TYPE,
        cons(pack => {
          let
            raspack = uranium.JSON.parse(pack);
          let
            tile = Vars.world.tile(raspack.tP);

          if (tile.block()) {
            let
              build = tile.build;
            build.setShealdAndHealth(raspack.d);
          }
        })
      );
    };
  }
  Events.on(ClientLoadEvent, cons(e => {
    init();
  }));
  return (data, tilePos) => {
    const pack = makePackage(data, tilePos);
    Call.clientPacketReliable(TYPE, pack);
  }
})();

uranium.t.setShealdAndHealth = function (obj) {
  this.maxHealth = obj.mh;
  this.health = obj.h;
  this._maxSheald = obj.ms;
  this.getD().sheald = obj.s;
  this.healthUpdate = obj.hu / 100;
};

uranium.t.checkUpdateTurret = function () {
  let
    evo = this.getQD('evo'),
    data = this.getD();

  if (evo != undefined && this.getQD('evoLvl') == data.lvl) {
    if (typeof (evo) == 'object') {
      data.turretQuality = {
        q: evo[0],
        t: evo[1]
      };
    } else {
      let
        newQ = this.getPO().getTurretUpdateMap(data.lvl);
      if (newQ == undefined) {
        newQ = uranium.turretQualityGenerate(this.getP(), evo);
      };
      data.turretQuality = {
        q: newQ[0],
        t: newQ[1]
      };
    }
  }
}

uranium.t.updateLvl = function () {
  if (!Vars.net.client()) {
    this.serverSynch(this.getD(), this.tile.pos());
  };

  this._qualityData = uranium.turretQualityGet(this.getD().turretQuality.q, this.getD().turretQuality.t);

  if (!Vars.net.client()) {
    if (isNaN(this.health)) {
      this.health = this.getP().health;
    };
    let
      health = (this.getP().health + this.getQD('extraHealth') + this._statsBoostHealthExtra)
        * this.getPO().getTurretMap(this.getD().lvl, 'maxHealth')
        * this.getQD('maxHealth')
        * this._statsBoostHealthFactor;
    if (health < 1) {
      health = 1;
    };
    if (this.maxHealth == this.health) {
      this.maxHealth = health;
      this.health = this.maxHealth;
    } else {
      this.maxHealth = health;
      if (this.health > this.maxHealth) {
        this.health = this.maxHealth;
      };
    }

    if (this.hasShield()) {
      let
        _maxSheald = this.getPO().getTurretMap(this.getD().lvl, 'sheald')
          * this.parent._shield
          * this.getQD('shield')
          * this.maxHealth
          * this._shieldBoostFactor
          + this.parent._extraShield
          + this.getQD('extraSheald')
          + this._shieldBoostExtra;
      if (_maxSheald < 0) {
        _maxSheald = 0;
      };
      this._maxSheald = _maxSheald;
      if (this.getD().sheald >= this._maxSheald) {
        this.getD().sheald = this._maxSheald;
      }
    }

    this.healthUpdate = (
      this.getQD('healthRegen')
      + this._statsBoostHealthRegen
      + this.maxHealth *
      (this.getQD('healthRegenFactor') + this._statsBoostHealthRegenFactor)
    ) / 3;

    this.serverSynchShealdAndHealth({
      h: parseInt(this.health),
      mh: parseInt(this.maxHealth),
      s: parseInt(this.getD().sheald),
      ms: parseInt(this._maxSheald),
      hu: parseInt(this.healthUpdate * 100)
    }, this.tile.pos());

  }

  if (this.getPO().type == 'ItemTurret') {
    this._ammoQuality = this.parent.ammoQuality
      + this.getPO().getTurretMap(this.getD().lvl, 'updateAmmoQuality')
      + this.getQD('upAmmoQuality')
      + this._statsBoostAmmoQuality;

    if (this._ammoQuality < 1) {
      this._ammoQuality = 1
    } else if (this._ammoQuality > 5) {
      this._ammoQuality = 5;
    }
  } else if (this.getPO().type == 'PowerTurret') {
    let
      _maxPreparedShots = this.parent._powerShots + this.getPO().getTurretMap(this.getD().lvl, 'powerShots') + this.getQD('powerShots');
    if (_maxPreparedShots < 0) {
      _maxPreparedShots = 0;
    }
    this._maxPreparedShots = _maxPreparedShots;
  }
}

uranium.t.damage = function (team, d) {
  if (typeof (team) == 'number') {
    d = team;
  };
  if (d < this.getQD('armor')) {
    return;
  } else {
    d -= this.getQD('armor');
  };
  if (this.hasShield() && this.getD().sheald > 0) {
    if (d < this.getD().sheald) {
      this.getD().sheald -= d;
    } else {
      d -= this.getD().sheald;
      this.getD().sheald = 0;
      this.health -= d;
      uranium.getEffect('sheald_down').at(this.x, this.y);
    }
  } else {
    this.health -= d;
  };
  this._lastDamage = 0;
  if (this.health <= 0) {
    this.kill();
  };
};

uranium.t.getReloadMulti = function () {
  return this.getPO().getTurretMap(this.getD().lvl, 'reloadMultiplier') * this.getQD('reloadMultiplier') * this._reloadMultiplierBoost;
}

uranium.t.uraniumTurret = function () { return true };

uranium.t.updateShield = function () {
  if (this.hasShield() && this.getD().sheald < this._maxSheald) {
    if (this._lastDamage >= 120 * this.getQD('shieldRegenDelay') * this._shieldBoostDelay) {
      this.getD().sheald += this.parent.tier * this.getQD('shieldRegen') * this.parent._regenShield;
    } else {
      this._lastDamage++;
    }
    if (this.getD().sheald >= this._maxSheald) {
      this.getD().sheald = this._maxSheald;
      uranium.getEffect('sheald_up').at(this.x, this.y, Color.valueOf(uranium.tier_colors[this.parent.tier - 1]));
    }
  }
  if (this.getQD('statsBoost')) {
    if (this._statusBoostP >= 30) {
      let
        thisT = this;
      Vars.indexer.eachBlock(this, this.getQD('statsBoostRange') + this.parent.size * 8, boolf(t => t.uraniumTurret), cons(other => {
        if (other.verefiStatusBoostStronger(
          thisT.getQD('statsBoostStrong'),
          thisT.getQD('statsBoostType'),
          thisT.getQD('name')
        )) {
          other.setStatusBoost(thisT.getD().turretQuality.q, thisT.getD().turretQuality.t);
        };
      }));
      this._statusBoostP = 0;
    } else {
      this._statusBoostP++;
    }
  }
  if (this._statusBoostStronger) {
    if (this._effectBoost && this._effectBoostChance > Math.random()) {
      let
        x = this.x, y = this.y;
      if (this._effectBoostRandomPosition) {
        x = x + Math.random() * this.getP().size * 8 - this.getP().size * 4;
        y = y + Math.random() * this.getP().size * 8 - this.getP().size * 4;
      }
      uranium.getEffect(this._effectBoost).at(x, y);
    }
    this._statusBoostTimer++;
    if (this._statusBoostTimer >= 240) {
      this.resetBoostTimer();
      this.allResetBoost();
      this.updateLvl();
    }
  }
}
uranium.t._statusBoostP = 31;
uranium.t._statusBoost = false;
uranium.t._statusBoostTimer = 0;
uranium.t._statusBoostStronger = 0;
uranium.t._statusType = 0;

uranium.t.setStatusBoost = function (q, t) {
  let
    turretQuality = uranium.turretQualityGet(q, t),
    data = this.getD();

  data.turretStatusIsset = 1;
  data.turretStatusQ = q;
  data.turretStatusT = t;
  this._statusBoostStronger = turretQuality['statsBoostStrong'];
  this._statusType = turretQuality['statsBoostType'];
  this._statusName = turretQuality['name'];

  if (turretQuality['statsBoostInfection']) {
    data.turretQuality = {
      q: q,
      t: t
    };
  };
  this.setStatusName(
    turretQuality['name'],
    turretQuality['color']
  );
  this.setShieldBoost(
    turretQuality['statsBoostShieldExtra'],
    turretQuality['statsBoostShieldFactor'],
    turretQuality['statsBoostShieldDelay'],
    turretQuality['statsBoostShieldRegen']
  );
  this.setReloadMultiplierBoost(
    turretQuality['statsBoostReloadMultiplier']
  );
  this.setEffectBoost(
    turretQuality['statsBoostEffect'],
    turretQuality['statsBoostEffectChance'],
    turretQuality['statsBoostEffectRandomPositione']
  );
  this.setHealthBoost(
    turretQuality['statsBoostHealthExtra'],
    turretQuality['statsBoostHealthFactor'],
    turretQuality['statsBoostHealthRegen'],
    turretQuality['statsBoostHealthRegenFactor']
  );
  this.setExpBoost(
    turretQuality['statsBoostExp'],
    turretQuality['statsBoostExpUpdate']
  );
  this.setAmmoQualityBoost(
    turretQuality['statsBoostAmmoQuality']
  );
  this.resetBoostTimer();
  this.updateLvl();
}

uranium.t.resetBoostTimer = function () {
  this._statusBoostTimer = 0;
};

uranium.t.resetStatusName = function () {
  this._statusName = 'none';
  this._statusColor = '222222';
};

uranium.t.setStatusName = function (name, color) {
  this._statusName = name;
  this._statusColor = color;
}

uranium.t.getStatusName = function () {
  return [
    this._statusName,
    this._statusColor
  ];
}

uranium.t.verefiStatusBoostStronger = function (strong, type, name) {
  if (type != this.getQD('statsBoostResistType')
    && this.getQD('statsBoostResistStrong') < strong) {
    if (this._statusName == name) {
      this.resetBoostTimer();
      return false;
    } else if (this._statusBoostStronger < strong) {
      this._statusBoostStronger = strong;
      this._statusType = type;
      return true;
    } else {
      return false;
    };
  } else {
    return false;
  };
};

uranium.t.allResetBoost = function () {
  this.resetShieldBoost();
  this.resetReloadMultiplierBoost();
  this.resetHealthBoost();
  this.resetEffectBoost();
  this.resetExpBoost();
  this.resetAmmoQualityBoost();
  this.resetStatusName();
  this._statusBoostStronger = 0;
  this._statusType = 0;
  let
    data = this.getD();

  data.turretStatusIsset = 0;
  data.turretStatusQ = 0;
  data.turretStatusT = 0;
};

uranium.t.resetShieldBoost = function () {
  this._shieldBoostExtra = 0;
  this._shieldBoostFactor = 1;
  this._shieldBoostDelay = 1;
  this._shieldBoostRegen = 1;
};

uranium.t.setShieldBoost = function (extra, factor, delay, regen) {
  this._shieldBoostExtra = extra;
  this._shieldBoostFactor = factor;
  this._shieldBoostDelay = delay;
  this._shieldBoostRegen = regen;
};

uranium.t.resetReloadMultiplierBoost = function () {
  this._reloadMultiplierBoost = 1;
}

uranium.t.setReloadMultiplierBoost = function (boost) {
  this._reloadMultiplierBoost = boost;
}

uranium.t.resetEffectBoost = function () {
  this._effectBoost = 0;
}

uranium.t.setEffectBoost = function (effect, chance, randomPosition) {
  this._effectBoost = effect;
  this._effectBoostChance = chance;
  this._effectBoostRandomPosition = randomPosition;
}

uranium.t.resetHealthBoost = function () {
  this._statsBoostHealthExtra = 0;
  this._statsBoostHealthFactor = 1;
  this._statsBoostHealthRegen = 0;
  this._statsBoostHealthRegenFactor = 0;
}

uranium.t.setHealthBoost = function (extra, factor, regen, regenFactor) {
  this._statsBoostHealthExtra = extra;
  this._statsBoostHealthFactor = factor;
  this._statsBoostHealthRegen = regen;
  this._statsBoostHealthRegenFactor = regenFactor;
};

uranium.t.resetExpBoost = function () {
  this._statsBoostExp = 1;
  this._statsBoostExpUpdate = 0;
}

uranium.t.setExpBoost = function (v, u) {
  this._statsBoostExp = v;
  this._statsBoostExpUpdate = u;
};

uranium.t.resetAmmoQualityBoost = function () {
  this._statsBoostAmmoQuality = 0;
}

uranium.t.setAmmoQualityBoost = function (v) {
  this._statsBoostAmmoQuality = v;
}

uranium.tileMap = {};

uranium.t.verifiTile = function () {
  let
    tilePos = this.tile.pos(),
    tile = uranium.tileMap[tilePos];
  if (tile == undefined) {
    tile = {};
    tile.turretBildingT = false;
  };
  if (tile.setTurretBilding == undefined) {
    tile.turretBildingTimer = 0;
    tile
      .setTurretBilding = function (v) {
        tile.turretBildingTimer = v;
        if (!tile.turretBildingT)
          Time.run(10, () => { tile.turretBildingTimerRun() });
      };

    tile
      .turretBildingTimerRun = function () {
        tile.turretBildingT = true;
        if (Vars.world.tile(tilePos).build != undefined) {
          if (tile.getTurretBuildingTime() > 1) {
            tile.turretBildingTimer--;
            Time.run(10, () => { tile.turretBildingTimerRun() });
          } else {
            let
              build = Vars.world.tile(tilePos).build;
            if (build.progress < 1 || build.getD != undefined) {
              tile.turretBildingTimer = 24;
              Time.run(10, () => { tile.turretBildingTimerRun() });
            } else {
              tile.turretBildingTimer--;
              tile.turretBildingT = false;
            }
          }
        } else {
          tile.turretBildingTimer = 0;
          tile.turretBildingT = false;
        }
      };
    tile.getTurretBuildingTime = function () {
      return tile.turretBildingTimer;
    }
  }
  uranium.tileMap[tilePos] = tile;
  if (tile.getTurretBuildingTime() > 0) {
    let
      data = this.getD()
    data = tile.data;
  } else {
    tile.data = this.getD();
  }
  tile.setTurretBilding(24);
};

uranium.t.expEffect = function () {
  this.checkUpdateTurret();
  uranium.getEffect('level_up').at(this.x, this.y, Color.valueOf(uranium.tier_colors[this.parent.tier - 1]));
  this.updateLvl();
};

uranium.t.expCalc = function () {
  if (!Vars.net.client()) {
    if (this.data.lvl < uranium.turretLvlMap.length - 1) {
      if (this.data.exp >= this.getPO().getTurretMap(this.data.lvl, 'nextLvlExp')) {
        this.data.exp = 0;
        this.data.lvl++;
        this.serverSynchExp({
          exp: parseInt(this.data.exp),
          lvl: this.data.lvl,
          lvlUp: 1
        }, this.tile.pos());
        this.SynchTimer = 0;
        this.expEffect();
      }
    } else if (this.data.lvl >= uranium.turretLvlMap.length) {
      this.data.lvl = uranium.turretLvlMap.length - 1;
    };
    if (this.SynchTimer == undefined || this.SynchTimer > 10) {
      this.serverSynchExp({
        exp: parseInt(this.data.exp),
        lvl: this.data.lvl,
        lvlUp: 0
      }, this.tile.pos());
      this.SynchTimer = 0;
    } else {
      this.SynchTimer++;
    };
  };

}

uranium.t.getExpMultiplier = function () {
  return this.getQD('expBoost') * this._statsBoostExp;
};

uranium.t.acceptExp = function (exp) {
  if (!Vars.net.client()) {
    exp = exp * this.getExpMultiplier() * this.getQD('expBoost');
    if (exp < 0) {
      exp = 0;
    };
    this.data.exp += exp;
    this.expCalc();
  };
};
uranium.t._ammoQuality = 1;

uranium.t.getAmmoQuality = function () {
  return this._ammoQuality;
}

uranium.t.verifyAmmoQuality = function () {
  let
    type = this.peekAmmo(),
    ammoQuality = this.getAmmoQuality(),
    burstFactor = 1;
  if (type.getQuality() > ammoQuality) {
    if (!this.parent.alternate) {
      burstFactor = this.parent.shots;
    };
    let
      quality = type.getQuality() - ammoQuality;
    this.damage(this.parent.reloadTime * quality * this.parent.size / burstFactor);
  }
}

uranium.t.getLuck = function () {
  let
    Luck = this.getPO().getTurretMap(this.getD().lvl, 'luck') + this.parent.getLuck() + this.getQD('luck');
  if (Luck < 0) {
    Luck = 0;
  }
  return Luck;
}

uranium.t.checkLuck = function () {
  return this.getLuck() / 100 > Math.random();
}

uranium.t.hasShield = function () {
  return this.parent._shield > 0 && this.getQD('shield') > 0;
}

uranium.t.baseShoting = function () {
  if (!this.hasAmmo())
    return;

  this.updateOneShot();
  this.shotCounter++;
  this.recoil = this.block.recoilAmount;
  this.heat = 1;
  let
    type;

  if (this.getPO().type == 'ItemTurret') {
    this.verifyAmmoQuality();
  }

  if (this.checkLuck()) {
    type = this.peekAmmo();
  } else {
    type = this.useAmmo();
  };

  if (this.getPO().type == 'PowerTurret') {
    let
      QDT = type.getExtraTypes(this.getQD('laserType'));
    if (QDT != undefined) {
      type = QDT;
    };
    if (this.getD().preparedShots > 0) {
      if (!this.checkLuck()) {
        this.getD().preparedShots--;
      };
      type = type.getPreperedBullet();
    }
  };


  let
    inaccuracy = this.getInaccuracy();
  this.bullet(type, this.rotation + (Math.random() * inaccuracy - inaccuracy / 2));
}

uranium.t.getInaccuracy = function () {
  let
    inaccuracy = (this.block.inaccuracy + this.getQD('inaccuracy')) * this.getQD('inaccuracyFactor');
  if (inaccuracy < 0) {
    inaccuracy = 0;
  };
  return inaccuracy;
}

uranium.t.baseShot = function (type) {
  if (!this.hasAmmo())
    return;

  if (this.getPO().type == 'LaserTurret') {
    this.super$shoot(type);
    this.updateOneShot();
  } else if (this.getP().art) {
    this.super$shoot(type);
    this.updateOneShot();
  } else if (!this.block.alternate) {
    for (var i = 0; i < this.block.shots; i++) {
      Time.run(this.block.burstSpacing * i, () => { this.baseShoting() });
    };
  } else {
    this.baseShoting();
  };
};

uranium.t.updateOneShot = function () {
  if (!this.hasAmmo())
    return;
  this.acceptExp(this.parent.expShoot * this.peekAmmo().getExpMultiplier());
  if (this.getQD('shotHealth') != 0 && this.health < this.maxHealth) {
    this.health += this.getQD('shotHealth');
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }
  if (this.getQD('shotDamage') > 0 || this.getQD('shotDamageFactor') > 0) {
    this.damage((this.getQD('shotDamage') + this.maxHealth * this.getQD('shotDamageFactor')));
  }
  if (this.getQD('extraBulet') && (this.getQD('extraBuletChance') > Math.random() || this.checkLuck())) {
    for (let i = 0; i < this.getQD('extraBulets'); i++) {
      this.getQD('extraBulet').create(
        this, this.team,
        this.x,
        this.y,
        this.rotation + Mathf.range(this.getP().inaccuracy + i)
      );
    }
  }

};

uranium.t.baseBullet = function (type, angle) {
  let
    tr = new Vec2(),
    xR = this.block.xRand * Math.random() - this.block.xRand / 2,
    baseRot = (this.block.size - 0.5) * (Vars.tilesize) - (this.block.size - 1) * (Vars.tilesize - 1) / 2;

  if (this.block.alternate) {
    if (this.shot_alternate == undefined || this.shot_alternate >= this.block.shots - 1) {
      this.shot_alternate = 0;
    } else {
      this.shot_alternate++;
    }
    xR += this.block.spread / this.block.shots * this.shot_alternate * 2 - this.block.spread / 2;
  };

  tr.trns(angle, baseRot, xR);
  this.getP().shootSound.at(this.x, this.y);
  type.create(this, this.team, this.x + tr.x, this.y + tr.y, angle);
  tr.trns(this.rotation, baseRot, xR);
  uranium.getEffect('9x18-shot').at(this.x + tr.x, this.y + tr.y, this.rotation, type.frontColor);
};

uranium.t.healthUpdate = 0;
uranium.t.healthUpdateTimer = 10;
uranium.t.expTimer = 0;

uranium.t.baseUpdateTile = function () {
  if (!this.firstUpdate) {
    this.allResetBoost();
    this.updateLvl();
    this.verifiTile();
    this.firstUpdate = true;
  };
  if (this.healthUpdate != 0) {
    if (this.healthUpdateTimer >= 20) {
      this.health += this.healthUpdate;
      this.healthUpdateTimer = 0;
      if (this.health <= 0) {
        this.kill();
      } else if (this.health > this.maxHealth) {
        this.health = this.maxHealth;
      }
    } else {
      this.healthUpdateTimer++;
    }
  }
  if (!Vars.net.client() && (this._statsBoostExpUpdate || this.getQD('expUpdate'))) {
    if (this.expTimer >= 20) {
      this.acceptExp((this.getQD('expUpdate') + this._statsBoostExpUpdate) / 3);
      this.expTimer = 0;
    } else {
      this.expTimer++;
    }
  };
  this.updateShield();
  if (this.getQD('effect')) {
    let
      effectPeack;
    if (this.getQD('effectDelayTime')) {
      if (Time.time % this.getQD('effectDelayTime') < 1)
        effectPeack = true;
    } else if (Math.random() < this.getQD('effectChance')) {
      effectPeack = true;
    };
    if (effectPeack) {
      let
        x = this.x, y = this.y;
      if (this.getQD('effectRandomPosition')) {
        let
          size = this.getP().size * 8;
        x = x + Math.random() * size - size / 2;
        y = y + Math.random() * size - size / 2;
      }
      uranium.getEffect(this.getQD('effect')).at(x, y);
    }
  }
};
uranium.t.regionType = '';
uranium.t.getSmartRegions = function () {
  let
    regionType = this.getQD('regionType'),
    regions = this.getP().regions[regionType];
  if (regions == undefined) {
    let
      turretRegion = this.getP().baseLoadRegion.turret,
      baseRegion = this.getP().baseLoadRegion.base,
      name = this.getP().name;

    regions = {
      turret: [],
      base: []
    };

    for (let i = 0; i < turretRegion.length; i++) {
      let
        newRegion = Core.atlas.find(name + '-' + regionType + turretRegion[i]);
      if (newRegion == 'error') {
        regions.turret.push(Core.atlas.find(name + turretRegion[i]));
      } else {
        regions.turret.push(newRegion);
      }
    };

    for (let i = 0; i < baseRegion.length; i++) {
      let
        newRegion = Core.atlas.find('uranium-mod-' + regionType + '-' + baseRegion[i]);
      if (newRegion == 'error') {
        regions.base.push(Core.atlas.find('uranium-mod-' + baseRegion[i]));
      } else {
        regions.base.push(newRegion);
      }
    };
    this.getP().regions[regionType] = regions;
  }
  return regions;
};

uranium.t.getRotationSpeed = function () {
  return (this.getP().rotateSpeed + this.getQD('rotateSpeed')) * this.getQD('rotateSpeedFactor');
}

uranium.t.turnToTarget = function (targetRot) {
  this.rotation = Angles.moveToward(this.rotation, targetRot, this.efficiency() * this.getRotationSpeed() * this.delta());
}

uranium.t.getTurretColor = function () {
  return this.getQD('turretColor');
};

uranium.t.getMaxFastShots = function () {
  return Math.round((this.getP().fastShots + this.getQD('fastShots')) * this.getQD('fastShotsFactor'));
}

uranium.t._lastShot = 0;
uranium.t.fastShotsReload = 0;

uranium.addObjMethod('extendTurret', function (f) {
  let
    keys = Object.keys(uranium.t);
  for (let i = 0; i < keys.length; i++) {
    if (f[keys[i]] == undefined) {
      f[keys[i]] = uranium.t[keys[i]];
    }
  };
  if (f.bullet == undefined && !this.const.art && this.type != 'LaserTurret') {
    f.bullet = uranium.t.baseBullet;
  }
  return this.extendBuild(f);
});


uranium.addObjMethod('setBuildTurret', function (f) {
  let
    f_r;
  if (typeof (f) != "function") {
    let
      obj = this;
    if (this.const.tier != undefined && f.draw == undefined)
      f.draw = uranium.drawTurret;

    f.parent = this.const;
    f_r = () => {
      let
        tq = uranium.turretQualityGenerate(f.parent),
        data = {
          exp: 0,
          lvl: 1,
          sheald: 0,
          fastShots: f.parent.fastShots != undefined ? f.parent.fastShots : 0,
          turretStatusIsset: 0,
          turretStatusQ: 0,
          turretStatusT: 0,
          turretQuality: {
            q: tq[0],
            t: tq[1]
          }
        };

      const e = obj.extendTurret({
        parent: f.parent,
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
        draw: f.draw,
        updateShooting() {
          if (this.reload >= this.block.reloadTime) {
            let
              type = this.peekAmmo();

            this.shoot(type);
            if (this.checkLuck()) {
              this.shoot(type);
            };

            if (f.parent.fastShots != undefined && data.fastShots > 0) {
              data.fastShots--;
              this.reload -= this.block.reloadTime * 0.4 * this.getQD('fastShotsDelay');
            } else {
              this.reload -= this.block.reloadTime;
            }
            this._lastShot = 0;
            this.fastShotsReload = 0;
          }
        },
        updateTile() {
          this.super$updateTile();
          if (this.getP().fastShots != undefined && this.getD().fastShots < this.getMaxFastShots()) {
            this._lastShot++;
            if (this._lastShot > this.getP().reloadTime * 2 && this.fastShotsReload >= this.getP().reloadFastShots) {
              this.fastShotsReload = 0;
              this.getD().fastShots++;
            } else {
              this.fastShotsReload++;
            }
          }
          this.baseUpdateTile();
          if (this.hasAmmo() && this.reload < this.block.reloadTime) {
            this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed() * this.getReloadMulti();
          }
        },
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
          writer.i(data.fastShots);
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
          data.fastShots = read.i();
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
  } else {
    f_r = f;
  }
  this.setBuild(f_r);
  return this;
});

uranium.addObjMethod('setBuildLaserTurret', function (f) {
  let
    f_r;
  if (typeof (f) != "function") {
    let
      obj = this;
    if (this.const.tier != undefined && f.draw == undefined)
      f.draw = uranium.drawTurret;

    f.parent = this.const;
    f_r = () => {
      let
        tq = uranium.turretQualityGenerate(f.parent),
        data = {
          exp: 0,
          lvl: 1,
          sheald: 0,
          turretStatusIsset: 0,
          turretStatusQ: 0,
          turretStatusT: 0,
          tempCore: 1,
          turretQuality: {
            q: tq[0],
            t: tq[1]
          }
        };
      const e = obj.extendTurret({
        parent: f.parent,
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
        draw: f.draw,
        updateTile() {
          this.super$updateTile();
          this.baseUpdateTile();

          this.shootTimer += Time.delta;

          if (this.isShooting()) {

            if (this.shootTimer > this.parent.chargeTime) {
              this.shootTimer = 0;
            }

            data.tempCore = data.tempCore * 1.0008;

          } else if (data.tempCore > 1) {
            data.tempCore = data.tempCore * 0.995;
            if (data.tempCore < 1) {
              data.tempCore = 1;
            }
          }
        },
        getTempCore() {
          return data.tempCore;
        },
        shoot(type) {
          if (this.getQD('laserType')) {
            let
              laserType = this.getQD('laserType');
            if (laserType == 'random') {
              type = type.getRandomType();
            } else if (type.getExtraTypes(laserType)) {
              type = type.getExtraTypes(laserType);
            };
          };
          this.baseShot(type);
          if (this.checkLuck()) {
            this.super$shoot(type);
          };
        },
        write(writer) {
          uranium.tileMap = {};
          writer.i(data.tempCore);
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
          data.tempCore = read.i();
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
  } else {
    f_r = f;
  }
  this.setBuild(f_r);
  return this;
});

uranium.addObjMethod('setBuildPowerTurret', function (f) {
  let
    f_r;
  if (typeof (f) != "function") {
    let
      obj = this;
    if (this.const.tier != undefined && f.draw == undefined)
      f.draw = uranium.drawTurret;

    f.parent = this.const;
    f_r = () => {
      let
        tq = uranium.turretQualityGenerate(f.parent),
        data = {
          exp: 0,
          lvl: 1,
          sheald: 0,
          preparedShots: 0,
          turretStatusIsset: 0,
          turretStatusQ: 0,
          turretStatusT: 0,
          turretQuality: {
            q: tq[0],
            t: tq[1]
          }
        };
      const e = obj.extendTurret({
        parent: f.parent,
        data: data,
        _maxSheald: 0,
        _lastDamage: 0,
        preparedShotTimer: 0,
        _maxPreparedShots: f.parent._powerShots,
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
        getMaxPreparedShots() {
          return this._maxPreparedShots;
        },
        draw: f.draw,
        updateShooting() {
          if (this.reload >= this.block.reloadTime) {

            let
              type = this.peekAmmo();

            this.acceptExp(this.parent.expShoot * this.getQD('expBoost'));

            this.shoot(type);
            this.reload -= this.block.reloadTime;
          }
        },
        updateTile() {
          this.super$updateTile();

          this.baseUpdateTile();

          if (this.hasAmmo() && this.reload < this.block.reloadTime) {
            this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed() * this.getReloadMulti();
          };

          if (this.preparedShotTimer >= 1200 / this._maxPreparedShots && this._maxPreparedShots > data.preparedShots) {
            data.preparedShots++;
            this.preparedShotTimer = 0
          } else {
            this.preparedShotTimer++;
          }
        },
        bullet: uranium.t.baseBullet,
        shoot: uranium.t.baseShot,
        write(writer) {
          uranium.tileMap = {};
          writer.i(data.lvl);
          writer.i(data.exp);
          writer.i(data.sheald);
          writer.i(data.preparedShots);
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
          data.preparedShots = read.i();
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
  } else {
    f_r = f;
  }
  this.setBuild(f_r);
  return this;
});