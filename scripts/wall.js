const { t } = require("./uranium");

//Стены
const
  uranium = global.uranium;

uranium.createWall = function (name, f) {
  f.setBars = function () {
    this.super$setBars();
    this.bars.add("durability", func(ent => {
      return new Bar(
        Core.bundle.get("uranium-mod.bars.Durability") + ': ' + Math.round(ent.getD().durability / ent.getMaxDurability() * 100) + '%',
        Color.valueOf("17FE31"),
        floatp(() => {
          return ent.getD().durability / ent.getMaxDurability();
        }));
    }));
    if (this.getSheald()) {
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
    }
  };
  f.getSheald = function () {
    return this._sheald;
  };
  f.getDurability = function () {
    return this._durability;
  };
  if (f._sheald || f._healthRegen)
    f.update = true;

  let
    draw;
  if (!f.draw) {
    draw = function () {
      Draw.rect(this.parent.region, this.x, this.y);
    }
  } else {
    draw = f.draw;
  }
  f.draw = undefined;
  let
    wall = uranium.createBuild('Wall', name, f);

  wall.setBuildEntity(() => {
    let
      data = {
        sheald: 0,
        durability: wall.const.getDurability()
      };
    const e = wall.extendBuild({
      parent: wall.const,
      data: data,
      _lastDamage: 0,
      getD() {
        return this.data;
      },
      getP() {
        return this.parent;
      },
      getPO() {
        return wall;
      },
      getMaxSheald() {
        return this.parent.getSheald();
      },
      getMaxDurability() {
        return this.parent.getDurability();
      },
      draw: draw,
      damage(team, d) {
        if (typeof (team) == 'number') {
          d = team;
        };
        if (typeof (d) != 'number') {
          return false
        };
        if (data.durability > 0) {
          let
            durabilityDamage = 0.3 * (data.durability / this.getMaxDurability()) * d;

          data.durability -= durabilityDamage;
          if (data.durability < 0) {
            data.durability = 0;
          }
          d -= durabilityDamage;
        }
        if (this.getMaxSheald() && data.sheald > 0) {
          if (d < data.sheald) {
            data.sheald -= d;
          } else {
            d -= data.sheald;
            data.sheald = 0;
            this.health -= d;
            uranium.getEffect('sheald_down').at(this.x, this.y);
          }
        } else {
          this.health -= d;
        }
        this._lastDamage = 0;
        if (this.health <= 0) {
          this.kill();
        }
      },
      updateTile() {
        this.super$updateTile();
        if (this.parent._healthRegen) {
          if (this.health < this.maxHealth) {
            this.health += this.getP()._healthRegen / 60;
          } else if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
          }
        }

        if (this.getMaxSheald() && data.sheald < this.getMaxSheald()) {
          if (this._lastDamage >= 120) {
            data.sheald += this.parent._shealdRegen / 60;
            if (data.sheald > this.getMaxSheald()) {
              data.sheald = this.getMaxSheald();
            }
          } else {
            this._lastDamage++;
          }
          if (data.sheald >= this.getMaxSheald()) {
            uranium.getEffect('sheald_up').at(this.x, this.y, Color.valueOf('fc9012'));
          }
        }
      },
      write(writer) {
        this.super$write(writer);
        writer.i(data.sheald);
        writer.i(data.durability);
      },
      read(read, revision) {
        data.sheald = read.i();
        data.durability = read.i();
        this.super$read(read, revision);
      }
    });
    return e;
  });
  return wall;
};

uranium
  .createWall("beton_wall", {
    _durability: 6000,
    health: 400
  });

uranium
  .createWall("beton_wall_large", {
    _durability: 24000,
    health: 1600
  });

uranium
  .createWall("titan_beton_wall", {
    _durability: 15000,
    health: 700
  });

uranium
  .createWall("titan_beton_wall_large", {
    _durability: 60000,
    health: 2800
  });


uranium
  .createWall("blue_thorium_wall", {
    _durability: 35000,
    health: 1300
  });

uranium
  .createWall("blue_thorium_wall_large", {
    _durability: 140000,
    health: 5200
  });

uranium
  .createWall("uranium_wall", {
    draw() {
      Draw.rect(this.parent.region, this.x, this.y);
      Draw.alpha(this.health / this.maxHealth);
      Draw.rect(Core.atlas.find(this.parent.name + "-remont"), this.x, this.y, 180 * this.health / this.maxHealth * 100);
    },
    _durability: 45000,
    _sheald: 150,
    _shealdRegen: 100,
    _healthRegen: 20,
    health: 1100
  });

uranium
  .createWall("uranium_wall_large", {
    draw() {
      Draw.rect(this.parent.region, this.x, this.y);
      Draw.alpha(this.health / this.maxHealth);
      Draw.rect(Core.atlas.find(this.parent.name + "-remont"), this.x, this.y, 180 * this.health / this.maxHealth * 100);
    },
    _durability: 180000,
    _sheald: 600,
    _healthRegen: 60,
    _shealdRegen: 300,
    health: 4400
  });


