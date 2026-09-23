
//Стены
const
  uranium = global.uranium;

// Wall durability is custom Uranium state. Building write/read keeps it in saves
// and initial world snapshots, but live changes are not synchronized by vanilla
// Building health packets. Broadcast only the durability value after server-side
// damage, coalescing bursts on the same wall into one reliable packet.
uranium.wallDurabilitySynch = (() => {
  const TYPE = 'uranium-mod-wallDurabilitySynch';

  // v2 deliberately avoids the legacy compact-object parser. This packet only
  // needs two numbers, so a fixed numeric format is both cheaper and safer.
  function makePackage(durability, tilePos) {
    return 'v2|' + String(Math.floor(Number(tilePos))) + '|' + String(Number(durability));
  }

  function parsePackage(pack) {
    const text = String(pack == null ? '' : pack);

    if (text.indexOf('v2|') == 0) {
      const parts = text.split('|');
      if (parts.length != 3) return null;

      const tilePos = uranium.netTilePos(parts[1]),
        durability = uranium.netNumber(parts[2]);
      if (tilePos == null || durability == null) return null;
      return { tP: tilePos, d: durability };
    }

    // Accept 4.10.1/older packets during mixed-version reconnects instead of
    // letting a stale packet crash the client. netTilePos can recover the known
    // malformed legacy value shape seen in multiplayer logs.
    const legacy = uranium.JSON.parse(text);
    if (legacy == null) return null;

    const tilePos = uranium.netTilePos(legacy.tP),
      durability = uranium.netNumber(legacy.d);
    if (tilePos == null || durability == null) return null;
    return { tP: tilePos, d: durability };
  }

  let inited = false;
  function init() {
    if (inited) return;
    inited = true;

    if (Vars.netClient) {
      Vars.netClient.addPacketHandler(
        TYPE,
        cons(pack => {
          const raspack = parsePackage(pack);
          if (raspack == null) return;

          const tilePos = uranium.netTilePos(raspack.tP);
          if (tilePos == null) return;

          const tile = Vars.world.tile(tilePos);
          if (tile == null || tile.build == null) return;

          const build = tile.build;
          if (build.getD == undefined || build.getMaxDurability == undefined) return;

          const durability = uranium.netNumber(raspack.d);
          if (durability == null) return;

          build.getD().durability = Math.max(0, Math.min(durability, build.getMaxDurability()));
        })
      );
    }
  }

  Events.on(ClientLoadEvent, cons(e => init()));

  return (durability, tilePos) => {
    if (!Vars.net.server()) return;
    Call.clientPacketReliable(TYPE, makePackage(durability, tilePos));
  };
})();

function drawUraniumWallRemontGlow(build) {
  if (Vars.headless || build == null || build.parent == null || build.maxHealth <= 0) return;

  const healthFrac = Math.max(0, Math.min(1, build.health / build.maxHealth));
  if (healthFrac <= 0.001) return;

  const pulse = 0.5 + 0.5 * Math.sin(Time.time / 18 + build.id * 0.17),
    remont = Core.atlas.find(build.parent.name + "-remont"),
    remontRot = 180 * healthFrac * 100,
    glowColor = uranium.getRuntimeColor('63FF72'),
    coreColor = uranium.getRuntimeColor('B9FFC0');

  // Only the -remont texture receives the emissive overlay; the base wall sprite is untouched.
  Draw.color(glowColor, coreColor, 0.22 + 0.20 * pulse);
  Draw.alpha((0.220 + 0.110 * pulse) * healthFrac);
  Draw.rect(remont, build.x, build.y, remontRot);
  Draw.color();

  // A restrained local light sells the repair material as mildly radioactive without
  // turning the whole wall into a lamp. Large walls receive a slightly larger radius.
  const radius = (build.parent.size <= 1 ? 14.5 : 23) * (0.88 + 0.12 * pulse);
  Drawf.light(build.x, build.y, radius, glowColor, (0.132 + 0.066 * pulse) * healthFrac);
  Draw.reset();
}


function drawPureThoriumWallGlow(build) {
  if (Vars.headless || build == null || build.parent == null || build.maxHealth <= 0) return;

  const healthFrac = Math.max(0, Math.min(1, build.health / build.maxHealth));
  if (healthFrac <= 0.001) return;

  const pulse = 0.5 + 0.5 * Math.sin(Time.time / 20 + build.id * 0.13),
    glowColor = uranium.getRuntimeColor('7E83D9'),
    coreColor = uranium.getRuntimeColor('B9C0FF');

  // Pure thorium has no -remont sprite. Use a restrained emissive pass over the existing
  // wall texture at exactly 60% of the uranium-wall brightness requested for 3.74.
  Draw.color(glowColor, coreColor, 0.20 + 0.18 * pulse);
  Draw.alpha((0.132 + 0.066 * pulse) * healthFrac);
  Draw.rect(build.parent.region, build.x, build.y);
  Draw.color();

  const radius = (build.parent.size <= 1 ? 13.5 : 21.5) * (0.90 + 0.10 * pulse);
  Drawf.light(build.x, build.y, radius, glowColor, (0.0792 + 0.0396 * pulse) * healthFrac);
  Draw.reset();
}

uranium.createWall = function (name, f) {
  f.setBars = function () {
    this.super$setBars();
    this.addBar("durability", func(ent => {
      return new Bar(
        Core.bundle.get("uranium-mod.bars.Durability") + ': ' + Math.round(ent.getD().durability / ent.getMaxDurability() * 100) + '%',
        Color.valueOf("17FE31"),
        floatp(() => {
          return ent.getD().durability / ent.getMaxDurability();
        }));
    }));
    if (this.getSheald()) {
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
    hasCustomDraw = f.draw != undefined,
    draw;
  if (!f.draw) {
    draw = function () {
      Draw.rect(this.parent.region, this.x, this.y);
    }
  } else {
    draw = f.draw;
  }
  f.draw = undefined;

  // v159.7 Wall.init() caches normal walls and disables dynamic draw. Uranium walls
  // with their own repair/health overlay must stay dynamic or that overlay never runs.
  if (hasCustomDraw) {
    f.init = function () {
      this.super$init();
      this.drawCached = false;
      this.drawDynamic = true;
    };
  }

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
      handleDamage(d) {
        d = Number(d);
        if (!isFinite(d) || d <= 0) {
          return 0;
        }

        if (data.durability > 0) {
          let durabilityDamage = 0.3 * (data.durability / this.getMaxDurability()) * d;

          data.durability -= durabilityDamage;
          if (data.durability < 0) {
            data.durability = 0;
          }
          d -= durabilityDamage;

          // Durability is not part of Mindustry's standard health synchronization.
          // Coalesce rapid hits on the same wall into one server -> client update.
          if (Vars.net.server() && !this._durabilitySyncQueued) {
            this._durabilitySyncQueued = true;
            const build = this;
            Time.run(5, () => {
              build._durabilitySyncQueued = false;
              if (build.tile == null || build.tile.build != build) return;
              uranium.wallDurabilitySynch(build.getD().durability, build.tile.pos());
            });
          }
        }

        if (this.getMaxSheald() && data.sheald > 0) {
          let shieldBefore = data.sheald,
            shieldDamage = Math.min(d, data.sheald);

          data.sheald -= shieldDamage;
          d -= shieldDamage;

          if (shieldBefore > 0 && data.sheald <= 0) {
            uranium.getEffect('sheald_down').at(this.x, this.y);
          }
        }

        this._lastDamage = 0;
        return Math.max(d, 0);
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
        this.super$read(read, revision);
        data.sheald = read.i();
        data.durability = read.i();
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
    draw() {
      Draw.rect(this.parent.region, this.x, this.y);
      drawPureThoriumWallGlow(this);
    },
    _durability: 35000,
    health: 1300
  });

uranium
  .createWall("blue_thorium_wall_large", {
    draw() {
      Draw.rect(this.parent.region, this.x, this.y);
      drawPureThoriumWallGlow(this);
    },
    _durability: 140000,
    health: 5200
  });

uranium
  .createWall("uranium_wall", {
    draw() {
      Draw.rect(this.parent.region, this.x, this.y);
      Draw.alpha(this.health / this.maxHealth);
      Draw.rect(Core.atlas.find(this.parent.name + "-remont"), this.x, this.y, 180 * this.health / this.maxHealth * 100);
      Draw.reset();
      drawUraniumWallRemontGlow(this);
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
      Draw.reset();
      drawUraniumWallRemontGlow(this);
    },
    _durability: 180000,
    _sheald: 600,
    _healthRegen: 60,
    _shealdRegen: 300,
    health: 4400
  });


