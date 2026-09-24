const
  uranium = global.uranium;

uranium.t = {};




// Draw the energy charge directly from the current turret muzzle each frame.
// The old Effect.at(...) charge point was world-space and stayed behind when the
// turret rotated during firstShotDelay. This visual helper follows rotation only;
// it does not change aiming, charge time, reload or damage.
uranium.t.drawAnchoredEnergyCharge = function (build) {
  if (build == null || build.block == null || build.block._energyChargeFamily == undefined) return;

  let delay = build.block.shoot != null ? build.block.shoot.firstShotDelay : 0,
    explicitCharge = delay > 0 && build._energyChargeStartTime != undefined && build._energyChargeStartTime >= 0 &&
      build._energyChargeEndTime != undefined && Time.time <= build._energyChargeEndTime + 0.5,
    nativeCharge = delay > 0 && build.queuedBullets > 0,
    chargingNow = explicitCharge || nativeCharge;
  if (!chargingNow) return;

  let family = build.block._energyChargeFamily,
    qType = build.getQD != undefined ? build.getQD('laserType') : null,
    heavy = build.block._energyChargeStrength != undefined ? build.block._energyChargeStrength : 1,
    visualTicks = explicitCharge ? Math.max(0, Time.time - build._energyChargeStartTime) :
      (build._energyChargeVisualTicks != undefined ? build._energyChargeVisualTicks : 0),
    p = Mathf.clamp(visualTicks / Math.max(1, delay), 0.035, 1),
    pulse = 0.5 + 0.5 * Math.sin((Time.time + build.id * 0.17) / (4.2 - Math.min(1.4, heavy * 0.35))),
    pulse2 = 0.5 + 0.5 * Math.sin((Time.time + build.id * 0.31) / 7.1 + 1.4),
    rot = build.rotation,
    mx = build.x + Angles.trnsx(rot - 90, build.block.shootX, build.block.shootY),
    my = build.y + Angles.trnsy(rot - 90, build.block.shootX, build.block.shootY),
    core, shell, accent;

  if (family == 'plasma') {
    core = uranium.getRuntimeColor('8EFF78');
    shell = uranium.getRuntimeColor('36C764');
    accent = uranium.getRuntimeColor('E4FF9A');
    if (qType == 'zvezda_legend') {
      core = uranium.getRuntimeColor('91FF72'); shell = uranium.getRuntimeColor('50D26B'); accent = uranium.getRuntimeColor('C28FFF');
    } else if (qType == 'pure_plasm') {
      core = uranium.getRuntimeColor('D8FAFF'); shell = uranium.getRuntimeColor('6DC7FF'); accent = Color.white;
    }
  } else {
    let spartan = build.getPO != undefined && build.getPO().name == '41_laser_turret_spartan';
    core = spartan ? Color.valueOf('FFE69B') : Color.valueOf('A5FFB2');
    shell = spartan ? Color.valueOf('FF9C3F') : Color.valueOf('51E878');
    accent = spartan ? Color.valueOf('FFF7D2') : Color.valueOf('DFFFF0');
    if (qType == 'frost') {
      core = uranium.getRuntimeColor('D9FAFF'); shell = uranium.getRuntimeColor('6CD7FF'); accent = Color.white;
    } else if (qType == 'rad') {
      core = uranium.getRuntimeColor('B7FF61'); shell = uranium.getRuntimeColor('63E64F'); accent = uranium.getRuntimeColor('FFF0A0');
    }
  }

  // Laser charge is intentionally much more visible than the plasma pre-orb:
  // it has to read as a distinct stored-energy point before the beam exists.
  let baseRad = (family == 'plasma' ? 4.0 : 6.2) * heavy,
    rad = baseRad * (0.32 + 0.68 * Math.pow(p, 0.68)) * (0.90 + 0.10 * pulse),
    corona = rad * (family == 'laser' ? (1.78 + 0.24 * pulse2) : (1.55 + 0.20 * pulse2));

  Draw.z(Layer.effect + 0.02);
  Draw.color(shell, accent, 0.28 + 0.42 * pulse2);
  Draw.alpha((0.10 + 0.20 * p) * (0.75 + 0.25 * pulse));
  Fill.circle(mx, my, corona);

  Draw.color(core, Color.white, 0.35 + 0.42 * p);
  Draw.alpha(0.84 + 0.12 * p);
  Fill.circle(mx, my, rad * 0.62);
  Draw.color(Color.white, core, 0.32 + 0.32 * pulse);
  Draw.alpha(0.90);
  Fill.circle(mx, my, rad * 0.27);

  Lines.stroke((0.55 + 0.65 * p) * heavy * (0.85 + 0.15 * pulse));
  Draw.color(accent, core, 0.35 + 0.40 * pulse);
  Draw.alpha(0.46 + 0.22 * p);
  Lines.circle(mx, my, rad * (1.02 + 0.18 * pulse2));
  Draw.alpha(0.22 + 0.15 * p);
  Lines.circle(mx, my, rad * (1.42 + 0.14 * pulse));

  if (family == 'laser') {
    let arms = 6 + Math.floor(heavy * 2);
    for (let i = 0; i < arms; i++) {
      let ang = i * (360 / arms) + Time.time * (0.55 + heavy * 0.08) + build.id * 9.7,
        outer = rad * (1.72 + 0.18 * Math.sin(Time.time * 0.11 + i * 1.7)),
        inner = rad * (0.72 + 0.08 * pulse),
        x1 = mx + Angles.trnsx(ang, outer),
        y1 = my + Angles.trnsy(ang, outer),
        x2 = mx + Angles.trnsx(ang + 5 * Math.sin(i + Time.time * 0.04), inner),
        y2 = my + Angles.trnsy(ang + 5 * Math.sin(i + Time.time * 0.04), inner);
      Draw.color(shell, accent, 0.34 + 0.36 * pulse2);
      Draw.alpha((0.16 + 0.28 * p) * (0.72 + 0.28 * pulse));
      Lines.stroke((0.42 + 0.34 * p) * heavy);
      Lines.line(x1, y1, x2, y2);
    }
  }

  let sparks = family == 'plasma' ? 7 + Math.floor(heavy * 2) : 5 + Math.floor(heavy * 3);
  for (let i = 0; i < sparks; i++) {
    let ang = Time.time * (2.0 + heavy * 0.35) + i * (360 / sparks) + build.id * 13.7,
      dst = rad * (1.0 + 0.55 * ((i % 3) / 2) + 0.16 * Math.sin(Time.time * 0.14 + i)),
      sx = mx + Angles.trnsx(ang, dst),
      sy = my + Angles.trnsy(ang, dst);
    Draw.color(shell, accent, 0.32 + 0.44 * pulse2);
    Draw.alpha((0.20 + 0.28 * p) * (0.75 + 0.25 * pulse));
    Fill.circle(sx, sy, 0.18 + 0.34 * p * heavy);
    Lines.stroke((0.35 + 0.25 * p) * heavy);
    Lines.lineAngle(sx, sy, ang + 90, (0.6 + 2.0 * p) * heavy);
  }

  Drawf.light(mx, my, (18 + 20 * p) * heavy, core, (0.24 + 0.34 * p) * (0.82 + 0.18 * pulse));
  Draw.reset();
};

// Prevent quality reroll abuse when the same turret type is rebuilt on the same tile.
// Rolls are cached independently per tile + turret type: replacing a Mustang with
// a Cobra must never transfer the Mustang roll to the Cobra. Each type keeps its
// own 15-second anti-reroll entry on that tile. The cache is runtime-only.
uranium.turretQualityTileCache = uranium.turretQualityTileCache || {};
uranium.turretQualityTileCacheTTL = 15000;

// A build is born without a real roll. Only the server/singleplayer may create
// a new random quality; remote clients wait for server data.
uranium.t.setAuthoritativeTurretQuality = function (q, t, refreshDerived) {
  if (q == undefined || t == undefined) return false;

  const data = this.getD();
  data.turretQuality = {q: q, t: t};
  this._qualityData = uranium.turretQualityGet(q, t);
  this._uraniumQualityReady = true;
  this._rtCacheReady = false;

  if (refreshDerived) {
    this.applySyncedStatusState();
    this.updateLvl();
  }
  return true;
};

uranium.t.ensureAuthoritativeTurretQuality = function () {
  if (this._uraniumQualityReady) return true;
  if (Vars.net.client()) return false;

  const tq = uranium.turretQualityGenerate(this.getP());
  return this.setAuthoritativeTurretQuality(tq[0], tq[1], false);
};

// Original quality-roll audio cues. They are loaded through the same mod asset
// pipeline as Uranium's existing custom turret sounds.
uranium.turretQualityApplySounds = {
  0: Vars.tree.loadSound('turret-quality-cursed'),
  5: Vars.tree.loadSound('turret-quality-quality'),
  6: Vars.tree.loadSound('turret-quality-masterpiece')
};

uranium.turretQualityApplyEffects = {
  0: 'turret-quality-cursed',
  1: 'turret-quality-very-bad',
  4: 'turret-quality-good',
  5: 'turret-quality-quality',
  6: 'turret-quality-masterpiece'
};

uranium.t.getTurretQualityTileCacheKey = function () {
  let planet = 'none';
  if (Vars.state != null && Vars.state.rules != null && Vars.state.rules.planet != null) {
    planet = Vars.state.rules.planet.name;
  }

  // block.name is the registered content name and is unique for every turret
  // type, unlike the tile position which is shared when one turret replaces
  // another. Fall back to the Uranium wrapper name only for defensive safety.
  let turretType = this.block != null && this.block.name != null ? this.block.name :
    (this.getPO != undefined && this.getPO() != null ? this.getPO().name : 'unknown');

  return planet + ':' + this.tile.x + ':' + this.tile.y + ':' + turretType;
};

uranium.t.applyTurretQualityTileCache = function () {
  // The server owns the roll; clients receive the resulting turret data through sync.
  if (Vars.net.client() || this.tile == null || this.getD == undefined) return;
  if (!this.ensureAuthoritativeTurretQuality()) return;

  const now = Date.now();
  const key = this.getTurretQualityTileCacheKey();
  const cache = uranium.turretQualityTileCache;
  const old = cache[key];
  const data = this.getD();

  if (old != undefined && now - old.time <= uranium.turretQualityTileCacheTTL) {
    this.setAuthoritativeTurretQuality(old.q, old.t, false);
  } else {
    cache[key] = {
      q: data.turretQuality.q,
      t: data.turretQuality.t,
      time: now
    };
  }
};

uranium.t.playTurretQualityApplyFx = function (q, t) {
  const effectName = uranium.turretQualityApplyEffects[q];
  if (effectName == undefined || Vars.headless) return;

  // Use the canonical colour of the quality tier. Individual qualities may
  // change turret rendering, but the roll feedback always communicates rarity.
  const color = Color.valueOf(uranium.turretQualityColors[q]);
  uranium.getEffect(effectName).at(this.x, this.y, this.getP().size, color);

  const sound = uranium.turretQualityApplySounds[q];
  if (sound != undefined) {
    sound.at(this.x, this.y, 1, 0.70);
  }
};

uranium.t.serverQualityApplyFx = (() => {
  const TYPE = 'uranium-mod-turretQualityApplyFx';

  // A reliable quality packet can reach the client while the target tile is
  // still represented by ConstructBlock. The old handler simply discarded that
  // packet, leaving the freshly finished turret on the neutral placeholder until
  // some later full sync/snapshot happened. Keep the authoritative roll pending
  // for a short time and apply it as soon as the final building exists.
  let pending = {},
    pendingCount = 0;

  function makePackage(q, t, tilePos, blockName) {
    return uranium.JSON.stringify({
      tP: tilePos,
      q: q,
      t: t,
      b: blockName
    });
  }

  function pendingKey(tilePos, blockName) {
    return tilePos + ':' + (blockName == undefined ? '' : blockName);
  }

  // return: 1 = applied, 0 = target building not ready yet.
  function tryApply(data) {
    if (data == null) return 0;

    const tilePos = uranium.netTilePos(data.tP);
    if (tilePos == null) return 0;

    const tile = Vars.world.tile(tilePos);
    if (tile == null || tile.build == null) return 0;

    const build = tile.build;
    if (data.b != undefined) {
      const currentName = build.block != null ? build.block.name : null;

      // During construction build.block is buildN; ConstructBuild.current is the
      // actual target block. Wait instead of dropping the packet.
      if (currentName != data.b) {
        const targetName =
          build.current != undefined && build.current != null
            ? build.current.name
            : null;
        if (targetName != data.b) return 0;
        return 0;
      }
    }

    if (build.setAuthoritativeTurretQuality == undefined) return 0;

    // Apply q/t first so the first rendered frame of the finished turret already
    // uses its real quality. refreshDerived=true updates deterministic client-side
    // health/shield/render data immediately; the full server sync still follows.
    build.setAuthoritativeTurretQuality(data.q, data.t, true);

    if (build.playTurretQualityApplyFx != undefined) {
      build.playTurretQualityApplyFx(data.q, data.t);
    }
    return 1;
  }

  function queue(data) {
    const tilePos = uranium.netTilePos(data.tP);
    if (tilePos == null) return;

    const key = pendingKey(tilePos, data.b);
    if (pending[key] == undefined) pendingCount++;

    pending[key] = {
      data: data,
      time: Time.millis()
    };
  }

  function updatePending() {
    if (pendingCount <= 0 || !Vars.net.client()) return;

    const keys = Object.keys(pending);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i],
        entry = pending[key];

      if (entry == undefined) continue;

      // 15 s is far longer than the expected constructFinish/network race while
      // preventing a stale packet from surviving indefinitely across later builds.
      if (Time.timeSinceMillis(entry.time) > 15000) {
        delete pending[key];
        pendingCount--;
        continue;
      }

      if (tryApply(entry.data)) {
        delete pending[key];
        pendingCount--;
      }
    }
  }

  let inited = false;
  function init() {
    if (inited) return;
    inited = true;

    if (Vars.netClient) {
      Vars.netClient.addPacketHandler(
        TYPE,
        cons(pack => {
          const data = uranium.JSON.parse(pack);
          if (data == null) return;

          if (!tryApply(data)) {
            queue(data);
          }
        })
      );

      // Usually the packet applies directly. This lightweight fallback only does
      // work while one or more placement packets are waiting for ConstructBlock
      // to become the final Uranium turret.
      Events.run(Trigger.update, () => {
        updatePending();
      });
    }
  }

  Events.on(ClientLoadEvent, cons(e => {
    init();
  }));

  return (q, t, tilePos, blockName) => {
    // In singleplayer the local call above already rendered the feedback.
    // Only an actual network server needs to broadcast it to remote clients.
    if (Vars.net.server()) {
      Call.clientPacketReliable(TYPE, makePackage(q, t, tilePos, blockName));
    }
  };
})();

uranium.t.created = function () {
  // Building.created() is also invoked while loading a save in Mindustry 159.7,
  // so quality-roll feedback and anti-reroll state must not be applied here.
  this.super$created();
};

uranium.t.placed = function () {
  // ConstructBlock calls placed() only after constructFinish() has copied the
  // construction block's health fraction into the final building. This is the
  // safest point to initialize quality-dependent HP without creating fake damage.
  this.super$placed();
  if (Vars.net.client()) return;

  // Generate the real roll only now, on the authoritative side. Constructors use
  // a neutral placeholder so no random pre-roll can ever flash on screen.
  this.ensureAuthoritativeTurretQuality();
  this.applyTurretQualityTileCache();

  const quality = this.getD().turretQuality;

  // Send the tiny authoritative q/t packet immediately after the final roll/cache
  // decision, before updateLvl() emits the larger turret state/health sync. This
  // makes the real quality available to remote clients on the construction-finish
  // frame instead of letting the neutral placeholder linger.
  this.serverQualityApplyFx(quality.q, quality.t, this.tile.pos(), this.block.name);

  // Initialize derived stats immediately on real placement instead of waiting for
  // the first update tick. ConstructFinish writes current HP from block.health, so
  // preserve that fraction against the new quality/level maxHealth. Save loading
  // does not call placed(); runtime initialization remains the fallback for loaded saves.
  if (!this.firstUpdate) {
    let baseHealth = Math.max(1, this.getP().health);
    this._uraniumPlacementHealthFraction = Math.max(0, Math.min(1, this.health / baseHealth));
    this.allResetBoost();
    this.updateLvl();
    this.firstUpdate = true;
  }

  this.playTurretQualityApplyFx(quality.q, quality.t);
};

uranium.t.updateData = function (data) {
  this.data = data;
  this._uraniumQualityReady = true;
  // turretStatus* is authoritative server state. Rebuild the transient boost
  // fields on the client before updateLvl() uses them for visual/derived data.
  this.applySyncedStatusState();
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
          const raspack = uranium.JSON.parse(pack);
          if (raspack == null || raspack.tP == null || raspack.d == null) return;

          const tilePos = uranium.netTilePos(raspack.tP);
          if (tilePos == null) return;

          const tile = Vars.world.tile(tilePos);
          if (tile == null || tile.build == null) return;

          const build = tile.build;
          if (build.updateData == undefined) return;
          build.updateData(raspack.d);
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
          const raspack = uranium.JSON.parse(pack);
          if (raspack == null || raspack.tP == null || raspack.d == null) return;

          const tilePos = uranium.netTilePos(raspack.tP);
          if (tilePos == null) return;

          const tile = Vars.world.tile(tilePos);
          if (tile == null || tile.build == null) return;

          const build = tile.build;
          if (build.getD == undefined) return;

          const data = build.getD();
          data.exp = raspack.d.exp;
          data.lvl = raspack.d.lvl;
          if (raspack.d.lvlUp == 1 && build.expEffect != undefined) {
            build.expEffect();
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
          const raspack = uranium.JSON.parse(pack);
          if (raspack == null || raspack.tP == null || raspack.d == null) return;

          const tilePos = uranium.netTilePos(raspack.tP);
          if (tilePos == null) return;

          const tile = Vars.world.tile(tilePos);
          if (tile == null || tile.build == null) return;

          const build = tile.build;
          if (build.setShealdAndHealth == undefined) return;
          build.setShealdAndHealth(raspack.d);
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

// Lightweight runtime shield synchronization. The current shield is custom
// Uranium state and is not covered by Mindustry's native Building health sync.
// Regular changes use unreliable packets at a throttled rate; zero/full
// transitions and periodic checkpoints are reliable. A sequence number prevents
// an older unreliable packet from overwriting a newer authoritative state.
uranium.t.serverSynchShieldState = (() => {
  const TYPE = 'uranium-mod-SynchShieldState';

  function makePackage(data, tilePos) {
    return uranium.JSON.stringify({
      tP: tilePos,
      d: data
    });
  }

  let inited = false;
  function init() {
    if (inited) return;
    inited = true;

    if (Vars.netClient) {
      Vars.netClient.addPacketHandler(
        TYPE,
        cons(pack => {
          const raspack = uranium.JSON.parse(pack);
          if (raspack == null || raspack.tP == null || raspack.d == null) return;

          const tilePos = uranium.netTilePos(raspack.tP);
          if (tilePos == null) return;

          const tile = Vars.world.tile(tilePos);
          if (tile == null || tile.build == null) return;

          const build = tile.build;
          if (build.setSyncedShieldState == undefined) return;
          build.setSyncedShieldState(raspack.d);
        })
      );
    }
  }

  Events.on(ClientLoadEvent, cons(e => {
    init();
  }));

  return (data, tilePos, reliable) => {
    if (!Vars.net.server()) return;
    const pack = makePackage(data, tilePos);
    if (reliable === false && Call.clientPacketUnreliable != undefined) {
      Call.clientPacketUnreliable(TYPE, pack);
    } else {
      Call.clientPacketReliable(TYPE, pack);
    }
  };
})();

uranium.t.nextShieldSyncVersion = function () {
  let value = Number(this._shieldSyncSeq);
  if (!isFinite(value) || value < 0 || value >= 2000000000) value = 0;
  value = Math.floor(value) + 1;
  this._shieldSyncSeq = value;
  return value;
};

uranium.t.setSyncedShieldState = function (obj) {
  if (obj == null) return false;

  const sheald = Number(obj.s),
    maxSheald = Number(obj.ms),
    version = Number(obj.v);

  if (!isFinite(sheald) || !isFinite(maxSheald) || maxSheald < 0 ||
      !isFinite(version) || version < 0) {
    return false;
  }

  const oldVersion = Number(this._shieldSyncVersion);
  if (isFinite(oldVersion) && version <= oldVersion) return false;

  const oldSheald = this.getD().sheald,
    oldMaxSheald = this._maxSheald;

  this._shieldSyncVersion = version;
  this._maxSheald = Math.max(0, maxSheald);
  this.getD().sheald = Math.max(0, Math.min(sheald, this._maxSheald));

  // Transition effects are reconstructed client-side from authoritative state,
  // so no separate effect packet is required. Suppress them during initial state.
  if (!Vars.headless && isFinite(oldSheald) && oldMaxSheald > 0) {
    if (oldSheald > 0 && this.getD().sheald <= 0) {
      uranium.getEffect('sheald_down').at(this.x, this.y);
    } else if (oldSheald < oldMaxSheald && this._maxSheald > 0 &&
               this.getD().sheald >= this._maxSheald) {
      uranium.getEffect('sheald_up').at(
        this.x, this.y, Color.valueOf(uranium.tier_colors[this.parent.tier - 1])
      );
    }
  }

  return true;
};

uranium.t.flushShieldSync = function (reliable) {
  if (!Vars.net.server() || this.tile == null || this.getD == undefined) return;

  const version = this.nextShieldSyncVersion();
  this.serverSynchShieldState({
    s: this.getD().sheald,
    ms: this._maxSheald,
    v: version
  }, this.tile.pos(), reliable);

  this._shieldSyncDirty = false;
  this._shieldSyncTimer = 0;
  if (reliable !== false) this._shieldReliableTimer = 0;
};

uranium.t.markShieldSync = function (critical) {
  if (!Vars.net.server()) return;
  this._shieldSyncDirty = true;
  if (critical) this.flushShieldSync(true);
};

uranium.t.updateShieldNetwork = function (logicalTicks) {
  if (!Vars.net.server() || !this._rtHasShield) return;
  logicalTicks = Math.max(1, Math.floor(logicalTicks == undefined ? 1 : logicalTicks));

  if (this._shieldSyncTimer == undefined) this._shieldSyncTimer = 0;
  if (this._shieldReliableTimer == undefined) this._shieldReliableTimer = 0;

  this._shieldReliableTimer += logicalTicks;

  if (this._shieldSyncDirty) {
    this._shieldSyncTimer += logicalTicks;
    // Preserve the existing five-updates-per-second threshold in logical ticks.
    if (this._shieldSyncTimer >= 12) this.flushShieldSync(false);
  } else {
    this._shieldSyncTimer = 0;
  }

  // Reliable correction keeps the original 60-logical-tick cadence.
  if (this._shieldReliableTimer >= 60 &&
      this.getD().sheald > 0 && this.getD().sheald < this._maxSheald) {
    this.flushShieldSync(true);
  }
};

uranium.t.setShealdAndHealth = function (obj) {
  if (obj == null) return false;

  const maxHealth = Number(obj.mh),
    health = Number(obj.h),
    maxSheald = Number(obj.ms),
    sheald = Number(obj.s),
    healthUpdate = Number(obj.hu),
    shieldSyncVersion = obj.sv == null ? null : Number(obj.sv);

  // Network data must never be allowed to assign undefined/NaN/Infinity into
  // Mindustry's Java float fields. A malformed packet is ignored instead of
  // disconnecting the entire client.
  if (!isFinite(maxHealth) || maxHealth < 1 ||
      !isFinite(health) || !isFinite(maxSheald) ||
      !isFinite(sheald) || !isFinite(healthUpdate)) {
    Log.warn('[Uranium-Mod] Ignored invalid turret HP/shield sync packet at @: @',
      this.tile != null ? this.tile.pos() : -1,
      String(obj));
    return false;
  }

  this.maxHealth = maxHealth;
  this.health = Math.max(0, Math.min(health, maxHealth));

  let applyShield = true;
  if (shieldSyncVersion != null) {
    if (!isFinite(shieldSyncVersion) || shieldSyncVersion < 0) {
      applyShield = false;
    } else {
      const oldVersion = Number(this._shieldSyncVersion);
      if (isFinite(oldVersion) && shieldSyncVersion < oldVersion) {
        applyShield = false;
      } else {
        this._shieldSyncVersion = shieldSyncVersion;
      }
    }
  }

  if (applyShield) {
    this._maxSheald = Math.max(0, maxSheald);
    this.getD().sheald = Math.max(0, Math.min(sheald, this._maxSheald));
  }
  this.healthUpdate = healthUpdate / 100;
  return true;
};

uranium.t.checkUpdateTurret = function () {
  // Quality evolution is server-authoritative. Previously clients also ran the
  // random update from expEffect(), which could briefly produce a different roll.
  if (Vars.net.client()) return false;

  let
    evo = this.getQD('evo'),
    data = this.getD(),
    oldQ = data.turretQuality.q,
    oldT = data.turretQuality.t;

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

  const changed = oldQ != data.turretQuality.q || oldT != data.turretQuality.t;
  if (changed) {
    this.playTurretQualityApplyFx(data.turretQuality.q, data.turretQuality.t);
    this.serverQualityApplyFx(data.turretQuality.q, data.turretQuality.t, this.tile.pos(), this.block.name);
  }

  return changed;
}

uranium.t.calculateDynamicMaxHealth = function () {
  let health = (this.getP().health + this.getQD('extraHealth') + this._statsBoostHealthExtra)
    * this.getPO().getTurretMap(this.getD().lvl, 'maxHealth')
    * this.getQD('maxHealth')
    * this._statsBoostHealthFactor;
  if (!isFinite(health) || health < 1) health = 1;
  return health;
};

uranium.t.calculateDynamicMaxShield = function (dynamicMaxHealth) {
  if (!this.hasShield()) return 0;

  let value = this.getPO().getTurretMap(this.getD().lvl, 'sheald')
    * this.parent._shield
    * this.getQD('shield')
    * dynamicMaxHealth
    * this._shieldBoostFactor
    + this.parent._extraShield
    + this.getQD('extraSheald')
    + this._shieldBoostExtra;

  if (!isFinite(value) || value < 0) value = 0;
  return value;
};

uranium.t.updateLvl = function () {
  if (!Vars.net.client()) {
    this.serverSynch(this.getD(), this.tile.pos());
  };

  this._qualityData = uranium.turretQualityGet(this.getD().turretQuality.q, this.getD().turretQuality.t);
  this._rtCacheReady = false;

  if (!Vars.net.client()) {
    if (isNaN(this.health)) {
      this.health = this.getP().health;
    };
    let health = this.calculateDynamicMaxHealth();
    // Level/quality/status updates can change maxHealth. Exact float equality is
    // unsafe here: a turret repaired to e.g. 999.99994/1000 was treated as
    // damaged, so a later 1.5x-2x maxHealth increase left it stuck around
    // 50-70% HP even though it had effectively been full.
    let oldMaxHealth = this.maxHealth;
    let fullHealthTolerance = Math.max(0.01, oldMaxHealth * 0.0001);
    let wasAtFullHealth = oldMaxHealth <= 0 || this.health >= oldMaxHealth - fullHealthTolerance;

    this.maxHealth = health;

    // Mindustry 159.7 ConstructBlock.constructFinish() creates the final block
    // first, then writes health = block.health * constructionHealthFraction.
    // Uranium changes maxHealth afterwards based on level/quality. For a freshly
    // placed turret this can make a perfectly healthy block look damaged simply
    // because the vanilla base HP was copied before the quality maxHealth existed.
    // placed() stores the construction health fraction explicitly; consume it once
    // here so quality HP bonuses/penalties scale both current and maximum HP.
    let placementHealthFraction = this._uraniumPlacementHealthFraction;
    if (placementHealthFraction != undefined && typeof placementHealthFraction == 'number' && isFinite(placementHealthFraction)) {
      placementHealthFraction = Math.max(0, Math.min(1, placementHealthFraction));
      this.health = this.maxHealth * placementHealthFraction;
      this._uraniumPlacementHealthFraction = undefined;
    } else if (wasAtFullHealth) {
      this.health = this.maxHealth;
    } else if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }

    if (this.hasShield()) {
      this._maxSheald = this.calculateDynamicMaxShield(this.maxHealth);
      if (this.getD().sheald >= this._maxSheald) {
        this.getD().sheald = this._maxSheald;
      }
    } else {
      this._maxSheald = 0;
      this.getD().sheald = 0;
    }

    this.healthUpdate = (
      this.getQD('healthRegen')
      + this._statsBoostHealthRegen
      + this.maxHealth *
      (this.getQD('healthRegenFactor') + this._statsBoostHealthRegenFactor)
    ) / 3;

    // maxHealth is dynamic in Uranium. Vanilla repair indexing is keyed off
    // damaged(), so changing maxHealth can turn a full building into a damaged one
    // without changing health. Explicitly refresh the index/network state here.
    if (this.health > 0 && this.healthChanged != undefined) {
      this.healthChanged();
    }

    const shieldSyncVersion = this.nextShieldSyncVersion();
    this.serverSynchShealdAndHealth({
      h: this.health,
      mh: this.maxHealth,
      s: this.getD().sheald,
      ms: this._maxSheald,
      hu: Math.round(this.healthUpdate * 10000) / 100,
      sv: shieldSyncVersion
    }, this.tile.pos());
    this._shieldSyncDirty = false;
    this._shieldSyncTimer = 0;
    this._shieldReliableTimer = 0;

  } else {
    // A joining client must not wait for a future level/status change before its
    // shield bar has the correct maximum. These values are deterministic from
    // synchronized level/quality/status data, so calculating them locally is safe.
    const clientDynamicMaxHealth = this.calculateDynamicMaxHealth();
    // Mindustry readBase() clamps a joining client's health/maxHealth to the
    // static block.health. Restore Uranium's deterministic dynamic maximum
    // immediately so the pending saved-health fraction and UI use the same
    // maxHealth as the authoritative server without waiting for a later sync.
    this.maxHealth = clientDynamicMaxHealth;
    this._maxSheald = this.calculateDynamicMaxShield(clientDynamicMaxHealth);
    if (this.getD().sheald > this._maxSheald) this.getD().sheald = this._maxSheald;
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
      _maxPreparedShots = Math.round((this.parent._powerShots * (1 + this.getPO().getTurretMap(this.getD().lvl, 'extraShotsFactor')) + this.getQD('powerShots')) * this.getQD('powerShotsFactor'));
    if (_maxPreparedShots < 0) {
      _maxPreparedShots = 0;
    }
    this._maxPreparedShots = _maxPreparedShots;
  }

  this.rebuildRuntimeCache();
  this.wakeRuntimeScheduler(true);
}

// Save a health ratio in Uranium's own build chunk. Mindustry build 160
// intentionally clamps Building.readBase() to the static block.health value;
// Uranium turrets have a dynamic maxHealth, so the vanilla base field alone
// cannot round-trip their real HP state.
uranium.t.getSavedHealthFraction = function () {
  if (typeof this.maxHealth != 'number' || !isFinite(this.maxHealth) || this.maxHealth <= 0) {
    return 1;
  };
  let f = this.health / this.maxHealth;
  if (typeof f != 'number' || !isFinite(f)) return 1;
  return Math.max(0, Math.min(1, f));
};

uranium.t.restoreSavedHealthFraction = function (savedFraction, revision) {
  const validFraction = revision >= 3 && typeof savedFraction == 'number' && isFinite(savedFraction)
    ? Math.max(0, Math.min(1, savedFraction))
    : undefined;

  // Remote-client block snapshots pass through Mindustry Building.readBase(),
  // which clamps incoming health to the static block.health. Uranium turrets use
  // a dynamic maxHealth, so that vanilla clamp caused periodic client-only HP
  // drops every time a block snapshot arrived. read() has already restored all
  // synchronized level/quality/status data and called updateLvl(), therefore the
  // server-written health fraction can be applied immediately and safely here.
  //
  // Keep save/singleplayer/server loading on the original deferred path below:
  // those states may still be touched by later first-update initialization.
  if (Vars.net.client() && validFraction != undefined) {
    const dynamicMax = Math.max(1, this.maxHealth);
    this.health = Math.max(0, Math.min(dynamicMax, dynamicMax * validFraction));

    this._uraniumSavedHealthRevision = undefined;
    this._uraniumPendingSavedHealthFraction = undefined;
    this._uraniumLegacyBaseClamp = undefined;

    if (this.health > 0 && this.healthChanged != undefined) this.healthChanged();
    return;
  }

  // Do not finalize saved dynamic HP from inside Building.read() outside a remote
  // client. Queue it until the first real update, after updateLvl() has rebuilt all
  // quality/level dependent stats.
  this._uraniumSavedHealthRevision = revision;
  this._uraniumPendingSavedHealthFraction = validFraction;

  // v2 did not store a dynamic HP fraction. readBase() clamps any saved value
  // above static block.health down to block.health. Remember that exact signature
  // so the first update can restore a formerly-full legacy turret instead of
  // mistaking the clamp for real damage.
  const baseHealth = Math.max(1, this.getP().health);
  const eps = Math.max(0.01, baseHealth * 0.0001);
  this._uraniumLegacyBaseClamp = revision < 3 && this.health >= baseHealth - eps;
};

uranium.t.applyPendingSavedHealthFraction = function () {
  if (this._uraniumSavedHealthRevision == undefined) return;

  const revision = this._uraniumSavedHealthRevision;
  const baseHealth = Math.max(1, this.getP().health);
  const dynamicMax = Math.max(1, this.maxHealth);
  const eps = Math.max(0.5, dynamicMax * 0.001);
  let targetHealth = this.health;

  if (revision >= 3 && this._uraniumPendingSavedHealthFraction != undefined) {
    const fraction = this._uraniumPendingSavedHealthFraction;
    const savedDynamicHealth = dynamicMax * fraction;

    // 4.09.15 introduced revision 3, but its restore ran too early. The very
    // characteristic corruption it produced is health == static block.health
    // while maxHealth is much larger. Repair only that exact signature once.
    // This preserves genuine combat damage at all other values.
    const looksLike40915Clamp = revision == 3
      && dynamicMax > baseHealth + eps
      && Math.abs(savedDynamicHealth - baseHealth) <= Math.max(1, baseHealth * 0.002);

    targetHealth = looksLike40915Clamp ? dynamicMax : savedDynamicHealth;
  } else if (revision < 3 && this._uraniumLegacyBaseClamp && dynamicMax > baseHealth + eps) {
    // v2 and older could not distinguish an originally-full dynamic turret from
    // the vanilla clamp. Restoring full HP is the least destructive migration:
    // values below baseHealth were not clamped and are left untouched.
    targetHealth = dynamicMax;
  }

  if (typeof targetHealth == 'number' && isFinite(targetHealth)) {
    this.health = Math.max(0, Math.min(dynamicMax, targetHealth));
  }

  this._uraniumSavedHealthRevision = undefined;
  this._uraniumPendingSavedHealthFraction = undefined;
  this._uraniumLegacyBaseClamp = undefined;

  if (this.health > 0 && this.healthChanged != undefined) this.healthChanged();
};

uranium.t.damage = function (team, d) {
  // Mindustry 160 can call Building.damage in three forms:
  // damage(float), damage(Team, float), damage(Bullet, Team, float).
  if (arguments.length >= 3) {
    d = arguments[2];
  } else if (typeof (team) == 'number') {
    d = team;
  };

  if (typeof d != 'number' || isNaN(d) || !isFinite(d) || d <= 0) {
    return;
  };

  // Custom shield state is server-authoritative. Let native/network health sync
  // and the compact shield packet update remote clients instead of predicting
  // the same hit independently on every machine.
  if (Vars.net.client()) return;

  if (d < this.getQD('armor')) {
    return;
  } else {
    d -= this.getQD('armor');
  };

  let oldHealth = this.health,
    oldSheald = this.getD().sheald;

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

  if (this.getD().sheald != oldSheald) {
    this.markShieldSync(oldSheald > 0 && this.getD().sheald <= 0);
  }

  this._lastDamage = 0;
  // Damage-sensitive gameplay is handled immediately above and in runtimeFastTick().
  // Deferred maintenance contains only VFX, so damage must not force a heavy
  // maintenance pass. Level/quality/status transitions still wake via updateLvl().

  if (this.health <= 0) {
    this.kill();
  } else if (this.health != oldHealth && this.healthChanged != undefined) {
    // Required by Mindustry 160: this updates BlockIndexer (repair targeting)
    // and queues the authoritative health packet on servers. Directly mutating
    // this.health without this call leaves the turret absent from the damaged index.
    this.healthChanged();
  };
};

uranium.t.getReloadMulti = function () {
  if (this._rtCacheReady) return this._rtReloadMulti;
  return this.getPO().getTurretMap(this.getD().lvl, 'reloadMultiplier') * this.getQD('reloadMultiplier') * this._reloadMultiplierBoost;
}

// Theoretical current damage-per-second for the hover HUD. It follows Uranium's
// own firing cadence and the projectile currently returned by peekAmmo(). The
// value is intentionally a raw combat-output estimate: direct + splash damage
// of the primary projectile, plus expected quality-spawned projectiles. Status
// damage, pierce chains and fragment hits are not guessed because their real
// contribution depends on the target/formation rather than the turret alone.
uranium.t.getDpsProjectileDamage = function (type, laserMode) {
  if (type == undefined || type == null) return 0;

  let damage = type.damage != undefined ? Math.max(0, type.damage) : 0;
  if (!laserMode && type.splashDamage != undefined && type.splashDamage > 0 &&
    type.splashDamageRadius != undefined && type.splashDamageRadius > 0) {
    damage += type.splashDamage;
  }

  // For continuous Uranium lasers this helper returns damage PER collideLine
  // pulse. Total beam pulses are derived from LaserTurret.shootDuration in getDps();
  // bullet.lifetime is continuously reset while the beam is active and must not be
  // used as the beam duration.
  return damage;
}

uranium.t.getDpsPrimaryDamage = function () {
  if (this.hasAmmo == undefined || !this.hasAmmo()) return 0;

  let type = this.peekAmmo(),
    turretType = this.getPO().type,
    mode = this.getQD('laserType');

  if (type == undefined || type == null) return 0;

  // Power/plasma qualities swap the projectile deterministically.
  if (turretType == 'PowerTurret' && type.getExtraTypes != undefined) {
    let extra = type.getExtraTypes(mode);
    if (extra != undefined && extra != null) type = extra;
  }

  if (turretType == 'LaserTurret') {
    // Random laser quality selects original/frost/radiation uniformly each shot.
    // Display the expected raw damage instead of rolling the UI value itself.
    if (mode == 'random' && type.extraType != undefined) {
      let sum = this.getDpsProjectileDamage(type, true), count = 1, keys = Object.keys(type.extraType);
      for (let i = 0; i < keys.length; i++) {
        let extraType = type.extraType[keys[i]];
        if (extraType != undefined && extraType != null) {
          sum += this.getDpsProjectileDamage(extraType, true);
          count++;
        }
      }
      return count > 0 ? sum / count : 0;
    }

    if (mode != undefined && mode != null && type.getExtraTypes != undefined) {
      let extra = type.getExtraTypes(mode);
      if (extra != undefined && extra != null) type = extra;
    }
    return this.getDpsProjectileDamage(type, true);
  }

  return this.getDpsProjectileDamage(type, false);
}

uranium.t.getDpsRuntimeScale = function () {
  let scale = 1;
  try {
    if (this.timeScale != undefined) {
      scale = typeof this.timeScale == 'function' ? this.timeScale() : this.timeScale;
    }
  } catch (e) {
    scale = 1;
  }
  if (typeof scale != 'number' || !isFinite(scale) || scale < 0) return 1;
  return scale;
}

// Returns the liquid currently usable by the turret's coolant consumer.
// This deliberately does not call coolant.efficiency(build): when a power turret
// is idle Mindustry may report building efficiency as 0, while the HUD is meant
// to show its combat DPS once it actually starts firing. Liquid availability is
// therefore derived directly from the tank, but the consumption math below
// mirrors ReloadTurret/LaserTurret.
uranium.t.getDpsCoolantLiquid = function () {
  let coolant = this.block != undefined ? this.block.coolant : null;
  if (coolant == undefined || coolant == null || this.liquids == undefined || this.liquids == null) return null;

  try {
    if (coolant.liquid != undefined && coolant.liquid != null && this.liquids.get(coolant.liquid) > 0) {
      return coolant.liquid;
    }
  } catch (e) { }

  try {
    if (coolant.getConsumed != undefined) {
      let liquid = coolant.getConsumed(this);
      if (liquid != undefined && liquid != null && this.liquids.get(liquid) > 0) return liquid;
    }
  } catch (e) { }

  try {
    let liquid = this.liquids.current();
    if (liquid != undefined && liquid != null && this.liquids.get(liquid) > 0) return liquid;
  } catch (e) { }

  return null;
}

// Reload progress contributed by coolant per world tick for normal Uranium
// turrets. ReloadTurret.updateCooling effectively becomes:
// min(amount * timeScale, liquidStored) * heatCapacity * coolantMultiplier * ammoReload.
uranium.t.getDpsCoolantReloadRate = function (ammoReload, runtimeScale) {
  let coolant = this.block != undefined ? this.block.coolant : null,
    liquid = this.getDpsCoolantLiquid();
  if (coolant == undefined || coolant == null || liquid == null) return 0;

  let amount = coolant.amount != undefined ? Math.max(0, coolant.amount) : 0,
    stored = 0,
    heatCapacity = liquid.heatCapacity != undefined ? liquid.heatCapacity : 0.4,
    multiplier = this.block.coolantMultiplier != undefined ? this.block.coolantMultiplier : 1;

  try { stored = Math.max(0, this.liquids.get(liquid)); } catch (e) { stored = 0; }
  if (amount <= 0 || stored <= 0) return 0;

  let consumedPerTick = Math.min(amount * runtimeScale, stored);
  return consumedPerTick * heatCapacity * multiplier * ammoReload;
}

// LaserTurret has a different legacy cooling loop: it first caps liquid usage by
// coolant.amount and only then multiplies by Building.delta()/timeScale.
uranium.t.getDpsLaserCooldownRate = function (runtimeScale) {
  let coolant = this.block != undefined ? this.block.coolant : null;
  if (coolant == undefined || coolant == null) return runtimeScale;

  let liquid = this.getDpsCoolantLiquid();
  if (liquid == null) return 0;

  let amount = coolant.amount != undefined ? Math.max(0, coolant.amount) : 0,
    stored = 0,
    heatCapacity = liquid.heatCapacity != undefined ? liquid.heatCapacity : 0.4,
    multiplier = this.block.coolantMultiplier != undefined ? this.block.coolantMultiplier : 1;

  try { stored = Math.max(0, this.liquids.get(liquid)); } catch (e) { stored = 0; }
  if (amount <= 0 || stored <= 0) return 0;

  return Math.min(stored, amount) * runtimeScale * heatCapacity * multiplier;
}

uranium.t.getDps = function () {
  if (this.hasAmmo == undefined || !this.hasAmmo()) return 0;

  let type = this.peekAmmo();
  if (type == undefined || type == null || this.block.reload <= 0) return 0;

  let turretType = this.getPO().type,
    quality = this._qualityData,
    luckChance = Math.max(0, Math.min(1, this.getLuck() / 100)),
    shots = this.block.shoot != undefined && this.block.shoot.shots != undefined ? Math.max(1, this.block.shoot.shots) : 1,
    projectilesPerShoot = this.block.alternate ? 1 : shots,
    actionMultiplier = 1,
    reloadCostFactor = 1,
    ammoReload = type.reloadMultiplier != undefined ? type.reloadMultiplier : 1,
    runtimeScale = this.getDpsRuntimeScale(),
    reloadSpeed = 0,
    primaryDamage = this.getDpsPrimaryDamage(),
    name = this.getPO().name;

  // Item turrets fire one extra full volley on a successful luck roll. Laser
  // turrets do the same through super$shoot(); PowerTurret does not.
  if (turretType == 'ItemTurret' || turretType == 'LaserTurret') {
    actionMultiplier += luckChance;
  }

  // Cyclone has its own chained-volley/reload mechanic. These are exact expected
  // values of that implementation (uniform reload multipliers have E[x] = 0.5).
  if (name == '25_auto_turret_ceklon') {
    actionMultiplier = 1 + 0.45 + 0.45 * 0.35 + 0.45 * 0.35 * 0.30 + luckChance;
    reloadCostFactor = 0.55 + 0.45 * 0.65 * 0.5 +
      0.45 * 0.35 * 0.70 * 0.25 + 0.45 * 0.35 * 0.30 * 0.125;
  } else if (this.getP().fastShots != undefined && this.getD().fastShots > 0) {
    reloadCostFactor = 0.4 * this.getQD('fastShotsDelay');
  }

  if (turretType == 'LaserTurret') {
    // Vanilla LaserTurret ignores BulletType.reloadMultiplier and Uranium's
    // quality/level reload multiplier. Its reload counter is reduced directly by
    // coolant (or by edelta when there is no coolant). The runtime timeScale is
    // the actual value applied by an overdrive/accelerating projector.
    reloadSpeed = this.getDpsLaserCooldownRate(runtimeScale);
  } else {
    // Uranium suppresses vanilla updateReload() and adds its own quality-aware
    // reload progress after super.updateTile(). Vanilla handleReload() still runs
    // updateCooling(), so the two contributions are additive, not multiplicative.
    let manualMultiplier = this.getReloadMulti();

    // Inquisitor's booster only multiplies the manual Uranium reload increment;
    // coolant is added independently by ReloadTurret.updateCooling().
    if (name == '43_inkvizitor' && this.getD().booster != undefined) {
      manualMultiplier *= Math.max(0, this.getD().booster);
    }

    let manualReloadRate = runtimeScale * ammoReload * manualMultiplier,
      coolantReloadRate = this.getDpsCoolantReloadRate(ammoReload, runtimeScale);

    reloadSpeed = manualReloadRate + coolantReloadRate;
  }

  if (reloadSpeed <= 0 || reloadCostFactor <= 0) return 0;

  let laserBeamTicks = 0,
    laserPulses = 1;

  if (turretType == 'LaserTurret') {
    // LaserTurret keeps the bullet alive for shootDuration ticks, while Uranium's
    // beam deals one collideLine pulse every 6 world ticks. Building timeScale
    // shortens the live beam duration; firstShotDelay itself is a global Time.run
    // delay and is not shortened.
    let nominalBeamTicks = this.block.shootDuration != undefined ? this.block.shootDuration : 100;
    laserBeamTicks = nominalBeamTicks / Math.max(0.0001, runtimeScale);
    laserPulses = Math.max(1, Math.floor(laserBeamTicks / 6));
  }

  let mainDamagePerCycle = primaryDamage * projectilesPerShoot * actionMultiplier * laserPulses,
    extraDamagePerCycle = 0;

  // Quality-spawned projectiles are expected output. Their proc is
  // (base chance OR luck). For laser's lucky duplicate, updateOneShot() is not
  // called, so that duplicate must not duplicate the quality projectile proc.
  if (quality != undefined && quality.extraBulet != undefined && quality.extraBulet != null) {
    let baseChance = Math.max(0, Math.min(1, quality.extraBuletChance)),
      triggerChance = baseChance + luckChance - baseChance * luckChance,
      extraCount = quality.extraBulets != undefined ? Math.max(0, quality.extraBulets) : 1,
      extraDamage = this.getDpsProjectileDamage(quality.extraBulet, false) * extraCount * triggerChance,
      oneShotCallsPerShoot = (turretType == 'LaserTurret' || this.getP().art) ? 1 : projectilesPerShoot,
      extraActionMultiplier = turretType == 'LaserTurret' ? 1 : actionMultiplier;
    extraDamagePerCycle = extraDamage * oneShotCallsPerShoot * extraActionMultiplier;
  }

  let cyclesPerSecond;
  if (turretType == 'LaserTurret') {
    let chargeTicks = this.block.shoot != undefined && this.block.shoot.firstShotDelay != undefined
        ? Math.max(0, this.block.shoot.firstShotDelay) : 0,
      cooldownTicks = (this.block.reload * reloadCostFactor) / reloadSpeed;

    // LaserTurret starts reducing reloadCounter during the charge delay, before
    // the persistent beam exists. Therefore charge and cooldown overlap; after
    // the beam ends only the larger of the two has mattered for cycle spacing.
    let cycleTicks = laserBeamTicks + Math.max(chargeTicks, cooldownTicks);
    cyclesPerSecond = cycleTicks > 0 ? 60 / cycleTicks : 0;
  } else {
    cyclesPerSecond = 60 * reloadSpeed / (this.block.reload * reloadCostFactor);
  }

  let result = (mainDamagePerCycle + extraDamagePerCycle) * cyclesPerSecond;

  if (!isFinite(result) || result < 0) return 0;
  return result;
}

uranium.t.uraniumTurret = function () { return true };

// Runtime-only cache. It is rebuilt only when level/quality/status changes.
// No cache field is serialized; save/network formats remain unchanged.
uranium.t._rtCacheReady = false;
uranium.t._rtHasShield = false;
uranium.t._rtShieldRegenDelayTicks = 0;
uranium.t._rtShieldRegenAmount = 0;
uranium.t._rtHasAura = false;
uranium.t._rtAuraRange = 0;
uranium.t._rtAuraStrong = 0;
uranium.t._rtAuraType = 0;
uranium.t._rtAuraName = '';
uranium.t._rtResistType = 0;
uranium.t._rtResistStrong = 0;
uranium.t._rtHasStatus = false;
uranium.t._rtHasStatusEffect = false;
uranium.t._rtExpUpdateActive = false;
uranium.t._rtExpUpdateValue = 0;
uranium.t._rtHasQualityEffect = false;
uranium.t._rtQualityEffect = 0;
uranium.t._rtQualityEffectDelay = 0;
uranium.t._rtQualityEffectChance = 0;
uranium.t._rtQualityEffectRandomPosition = false;
uranium.t._rtQualityEffectRadius = 0;
uranium.t._rtReloadMulti = 1;
uranium.t._rtMaxFastShots = 0;


// Adaptive Uranium runtime scheduler. These are runtime-only fields copied into
// every turret build object; none are serialized.
uranium.t._rtSchedPendingTicks = 0;
uranium.t._rtSchedCountdown = 0;
uranium.t._rtSchedInterval = 1;
uranium.t._rtSchedWakePending = true;

uranium.t.wakeRuntimeScheduler = function (resetElapsed) {
  // Gameplay-order-sensitive timers run in runtimeFastTick() every logical tick,
  // so waking only needs to bring deferred infrastructure forward. Keep pending
  // maintenance elapsed intact so deferred VFX time is never discarded.
  this._rtSchedWakePending = true;
  this._rtSchedCountdown = 0;
};

uranium.t.getAdaptiveBaseInterval = function () {
  if (!this.firstUpdate || !this._rtCacheReady) return 1;

  // Only deferred visual/infrastructure work remains in base maintenance.
  // Gameplay and shield-network timing stay in the exact fast lane below.
  // VFX retain the existing 12-update cadence. A build with no deferred VFX
  // work now sleeps for 300 updates (~5s at 60 TPS); real level/quality/status
  // changes still wake maintenance immediately through wakeRuntimeScheduler().
  if (!Vars.headless && (this._rtHasStatusEffect || this._rtHasQualityEffect)) return 12;
  return 300;
};

uranium.t.updateHealthRuntimeTick = function () {
  if (Vars.net.client() || this.healthUpdate == 0) return;

  if (this.healthUpdateTimer >= 20) {
    const oldHealth = this.health;
    this.health += this.healthUpdate;
    this.healthUpdateTimer = 0;
    if (this.health <= 0) {
      this.kill();
    } else {
      if (this.health > this.maxHealth) this.health = this.maxHealth;
      if (this.health != oldHealth && this.healthChanged != undefined) this.healthChanged();
    }
  } else {
    this.healthUpdateTimer++;
  }
};

uranium.t.updateExpRuntimeTick = function () {
  if (Vars.net.client() || !this._rtExpUpdateActive) return;
  if (this.expTimer >= 20) {
    this.acceptExp(this._rtExpUpdateValue);
    this.expTimer = 0;
  } else {
    this.expTimer++;
  }
};

uranium.t.hasRuntimeFastWork = function () {
  if (Vars.net.client() || !this._rtCacheReady) return false;

  if (this.healthUpdate != 0 || this._rtExpUpdateActive || this._rtHasAura || this._rtHasStatus) {
    return true;
  }

  if (this._rtHasShield) {
    // Shield regen/delay must remain exact while the shield is not full.
    if (this.getD().sheald < this._maxSheald) return true;
    // A non-critical server shield change is batched by updateShieldNetwork().
    if (Vars.net.server() && this._shieldSyncDirty) return true;
  }

  return false;
};

uranium.t.runtimeFastTick = function () {
  if (!this.hasRuntimeFastWork()) return false;

  // These operations are gameplay-order-sensitive, so whenever any of them is
  // active they still run at the original logical 60 Hz.
  if (this.healthUpdate != 0) this.updateHealthRuntimeTick();
  if (this._rtExpUpdateActive) this.updateExpRuntimeTick();

  if (this._rtHasShield && this.getD().sheald < this._maxSheald) {
    this.updateShieldCore(1);
  }

  if (this._rtHasAura || this._rtHasStatus) this.updateAuraStatus(1);
  if (Vars.net.server() && this._rtHasShield &&
      (this.getD().sheald < this._maxSheald || this._shieldSyncDirty)) {
    this.updateShieldNetwork(1);
  }

  return true;
};

uranium.t.runAdaptiveBaseUpdate = function () {
  // Do not derive/cache a fake client quality while waiting for server q/t.
  if (Vars.net.client() && !this._uraniumQualityReady) return false;

  this._rtSchedPendingTicks++;

  // Loaded saves need derived state rebuilt before the first fast tick.
  if (!this.firstUpdate || !this._rtCacheReady) {
    const logicalTicks = Math.max(1, this._rtSchedPendingTicks);
    this._rtSchedPendingTicks = 0;

    // Rebuild loaded/saved runtime state first, then preserve the historical order:
    // gameplay-critical tick -> visual/deferred maintenance. Initialization itself
    // calls updateLvl(), so clear only that expected wake before the fast tick.
    this.ensureRuntimeInitialized();
    this._rtSchedWakePending = false;
    if (this.hasRuntimeFastWork()) this.runtimeFastTick();
    this.baseMaintenanceUpdate(logicalTicks);

    const interval = this.getAdaptiveBaseInterval();
    this._rtSchedInterval = interval;
    this._rtSchedCountdown = interval - 1;
    return true;
  }

  // Exact gameplay lane: skip it entirely when the turret has no runtime work.
  if (this.hasRuntimeFastWork()) this.runtimeFastTick();

  if (this._rtSchedWakePending || this._rtSchedCountdown <= 0) {
    const logicalTicks = Math.max(1, this._rtSchedPendingTicks);
    this._rtSchedPendingTicks = 0;
    this._rtSchedWakePending = false;

    this.baseMaintenanceUpdate(logicalTicks);
    this._rtSchedWakePending = false;

    const interval = this.getAdaptiveBaseInterval();
    this._rtSchedInterval = interval;
    this._rtSchedCountdown = interval - 1;
    return true;
  }

  this._rtSchedCountdown--;
  return false;
};

uranium.t.rebuildRuntimeCache = function () {
  const q = this._qualityData;
  if (q == undefined || q == null) {
    this._rtCacheReady = false;
    return;
  }

  this._rtHasShield = this.parent._shield > 0 && q['shield'] > 0;
  this._rtShieldRegenDelayTicks = 120 * q['shieldRegenDelay'] * this._shieldBoostDelay;
  this._rtShieldRegenAmount = this.parent.tier * q['shieldRegen'] * this.parent._regenShield;

  this._rtHasAura = !!q['statsBoost'];
  this._rtAuraRange = q['statsBoostRange'] + this.parent.size * 8;
  this._rtAuraStrong = q['statsBoostStrong'];
  this._rtAuraType = q['statsBoostType'];
  this._rtAuraName = q['name'];
  this._rtResistType = q['statsBoostResistType'];
  this._rtResistStrong = q['statsBoostResistStrong'];

  this._rtHasStatus = !!this._statusBoostStronger;
  this._rtHasStatusEffect = !!this._statusBoostStronger && !!this._effectBoost && this._effectBoostChance > 0;

  this._rtExpUpdateActive = !!this._statsBoostExpUpdate || !!q['expUpdate'];
  this._rtExpUpdateValue = (q['expUpdate'] + this._statsBoostExpUpdate) / 3;

  this._rtQualityEffect = q['effect'];
  this._rtHasQualityEffect = !!this._rtQualityEffect;
  this._rtQualityEffectDelay = q['effectDelayTime'];
  this._rtQualityEffectChance = q['effectChance'];
  this._rtQualityEffectRandomPosition = q['effectRandomPosition'];
  this._rtQualityEffectRadius = q['statsBoostRange'] + this.parent.size * 8;

  this._rtReloadMulti = this.getPO().getTurretMap(this.getD().lvl, 'reloadMultiplier') * q['reloadMultiplier'] * this._reloadMultiplierBoost;
  this._rtMaxFastShots = Math.round((this.getP().fastShots + q['fastShots']) * q['fastShotsFactor']);
  this._rtCacheReady = true;

};

uranium.t.updateShieldCore = function (logicalTicks) {
  if (Vars.net.client() || !this._rtHasShield) return;
  logicalTicks = Math.max(1, Math.floor(logicalTicks == undefined ? 1 : logicalTicks));
  const oldSheald = this.getD().sheald;

  // Replay only the tiny shield accumulator for skipped logical updates. This
  // preserves the old regen delay/rate without paying for the whole baseUpdateTile.
  for (let i = 0; i < logicalTicks && this.getD().sheald < this._maxSheald; i++) {
    if (this._lastDamage >= this._rtShieldRegenDelayTicks) {
      this.getD().sheald += this._rtShieldRegenAmount;
    } else {
      this._lastDamage++;
    }

    if (this.getD().sheald >= this._maxSheald) {
      this.getD().sheald = this._maxSheald;
      if (!Vars.headless) uranium.getEffect('sheald_up').at(this.x, this.y, Color.valueOf(uranium.tier_colors[this.parent.tier - 1]));
      break;
    }
  }

  if (this.getD().sheald != oldSheald) {
    const becameFull = oldSheald < this._maxSheald && this.getD().sheald >= this._maxSheald;
    this.markShieldSync(becameFull);
  }
};

uranium.t.updateAuraStatus = function (logicalTicks) {
  if (Vars.net.client()) return;
  logicalTicks = Math.max(1, Math.floor(logicalTicks == undefined ? 1 : logicalTicks));

  if (this._rtHasAura && (this._statusBoostNextScan == undefined || Time.time >= this._statusBoostNextScan)) {
    const thisT = this;
    let targets = 0;
    Vars.indexer.eachBlock(this, this._rtAuraRange, boolf(t => t.uraniumTurret), cons(other => {
      targets++;
      if (other.verefiStatusBoostStronger(thisT._rtAuraStrong, thisT._rtAuraType, thisT._rtAuraName)) {
        other.setStatusBoost(thisT.getD().turretQuality.q, thisT.getD().turretQuality.t);
      };
    }));

    if (this._statusBoostScanPhased) {
      this._statusBoostNextScan += 31;
      if (this._statusBoostNextScan <= Time.time) this._statusBoostNextScan = Time.time + 31;
    } else {
      this._statusBoostScanPhased = true;
      this._statusBoostNextScan = Time.time + 31 + (Math.abs(this.id) % 31);
    }
  }

  if (this._rtHasStatus) {
    this._statusBoostTimer += logicalTicks;
    if (this._statusBoostTimer >= 240) {
      this.resetBoostTimer();
      this.allResetBoost();
      this.updateLvl();
    }
  }
};

uranium.t.updateStatusEffectVisual = function (logicalTicks) {
  if (Vars.headless || !this._rtHasStatusEffect) return;
  logicalTicks = Math.max(1, Math.floor(logicalTicks == undefined ? 1 : logicalTicks));

  // Preserve the old per-logical-tick Bernoulli trials. Several skipped visual
  // events may be emitted together, but their expected count/frequency is unchanged.
  for (let i = 0; i < logicalTicks; i++) {
    if (this._effectBoostChance <= Math.random()) continue;
    let x = this.x, y = this.y;
    if (this._effectBoostRandomPosition) {
      x = x + Math.random() * this.getP().size * 8 - this.getP().size * 4;
      y = y + Math.random() * this.getP().size * 8 - this.getP().size * 4;
    }
    uranium.getEffect(this._effectBoost).at(x, y);
  }
};

// Compatibility wrapper for addons/custom builds that call updateShield() directly.
uranium.t.updateShield = function () {
  this.updateShieldCore(1);
  this.updateAuraStatus(1);
  this.updateStatusEffectVisual(1);
};

uranium.t._statusBoostP = 31;
uranium.t._statusBoost = false;
uranium.t._statusBoostTimer = 0;
uranium.t._statusBoostStronger = 0;
uranium.t._statusType = 0;

uranium.t.resetRuntimeBoostState = function () {
  this.resetShieldBoost();
  this.resetReloadMultiplierBoost();
  this.resetHealthBoost();
  this.resetEffectBoost();
  this.resetExpBoost();
  this.resetAmmoQualityBoost();
  this.resetStatusName();
  this._statusBoostStronger = 0;
  this._statusType = 0;
  this._statusBoostTimer = 0;
};

uranium.t.applyStatusBoostRuntime = function (q, t) {
  const turretQuality = uranium.turretQualityGet(q, t);
  if (turretQuality == undefined || turretQuality == null) return false;

  this._statusBoostStronger = turretQuality['statsBoostStrong'];
  this._statusType = turretQuality['statsBoostType'];
  this.setStatusName(turretQuality['name'], turretQuality['color']);
  this.setShieldBoost(
    turretQuality['statsBoostShieldExtra'],
    turretQuality['statsBoostShieldFactor'],
    turretQuality['statsBoostShieldDelay'],
    turretQuality['statsBoostShieldRegen']
  );
  this.setReloadMultiplierBoost(turretQuality['statsBoostReloadMultiplier']);
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
  this.setExpBoost(turretQuality['statsBoostExp'], turretQuality['statsBoostExpUpdate']);
  this.setAmmoQualityBoost(turretQuality['statsBoostAmmoQuality']);
  this.resetBoostTimer();
  return true;
};

uranium.t.applySyncedStatusState = function () {
  this.resetRuntimeBoostState();
  const data = this.getD();
  if (data != null && data.turretStatusIsset) {
    return this.applyStatusBoostRuntime(data.turretStatusQ, data.turretStatusT);
  }
  return false;
};

uranium.t.setStatusBoost = function (q, t) {
  let turretQuality = uranium.turretQualityGet(q, t),
    data = this.getD();

  if (turretQuality == undefined || turretQuality == null) return;

  data.turretStatusIsset = 1;
  data.turretStatusQ = q;
  data.turretStatusT = t;

  if (turretQuality['statsBoostInfection']) {
    data.turretQuality = {
      q: q,
      t: t
    };
  };

  this.resetRuntimeBoostState();
  this.applyStatusBoostRuntime(q, t);
  this.updateLvl();
}

uranium.t.resetBoostTimer = function () {
  // A refresh of the same aura only extends the gameplay timer. It must not wake
  // deferred maintenance; real status/quality transitions already pass through
  // updateLvl(), which rebuilds runtime state and wakes the scheduler explicitly.
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

// Compact quality/status explanation shown above the regular bars.
// Width stays fixed so localization cannot stretch the hover HUD. Height is
// measured by Arc's own wrapped Label layout instead of estimating line count.
uranium.t.displayBars = function (table) {
  const descriptionWidth = 240, descriptionFontScale = 0.78;

  const addDescription = (text, bottomPad) => {
    let label = new Label(text);
    label.setWrap(true);
    label.setFontScale(descriptionFontScale);
    label.setAlignment(Align.left);

    // Wrapped Label#getPrefHeight() can be a little too tight for Mindustry's
    // outlined font. Force the exact wrapped glyph layout at the final width and
    // use the larger of preferred/rendered heights. Add a proportional safety
    // margin so 3-4+ line descriptions never lose the visual space of the last
    // line because of outline/descent/rounding.
    label.setSize(descriptionWidth, 1000);
    label.invalidate();
    label.layout();

    let font = label.getStyle().font;
    let lineHeight = font.getLineHeight() * descriptionFontScale;
    let renderedHeight = label.getGlyphLayout().height;
    let preferredHeight = label.getPrefHeight();
    let safety = Math.max(7, lineHeight * 0.38);
    let descriptionHeight = Math.ceil(Math.max(preferredHeight, renderedHeight) + safety);

    table.add(label)
      .width(descriptionWidth)
      .height(descriptionHeight)
      .left()
      .padLeft(2)
      .padRight(2)
      .padTop(1)
      .padBottom(bottomPad + 2);
    table.row();
  };

  let qualityUi = uranium.qualityUiBuild(this, false);
  if (qualityUi != null) {
    addDescription(
      '[lightgray]' + uranium.qualityUiText('qualityShortPrefix', 'Quality') + ':[] ' + qualityUi.shortText,
      2
    );
  }

  let statusUi = uranium.qualityUiBuild(this, true);
  if (statusUi != null) {
    addDescription(
      '[lightgray]' + uranium.qualityUiText('effectShortPrefix', 'Effect') + ':[] ' + statusUi.shortText,
      3
    );
  }

  this.super$displayBars(table);
}

uranium.t.verefiStatusBoostStronger = function (strong, type, name) {
  const resistType = this._rtCacheReady ? this._rtResistType : this.getQD('statsBoostResistType');
  const resistStrong = this._rtCacheReady ? this._rtResistStrong : this.getQD('statsBoostResistStrong');
  if (type != resistType
    && resistStrong < strong) {
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
  this.resetRuntimeBoostState();
  let data = this.getD();

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
    // expBoost is already part of getExpMultiplier(); applying it again made
    // quality XP bonuses quadratic instead of linear.
    exp = exp * this.getExpMultiplier();
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
      burstFactor = this.parent.shoot.shots;
    };
    let
      quality = type.getQuality() - ammoQuality;
    this.damage(this.parent.reload * quality * this.parent.size / burstFactor);
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
  if (this._rtCacheReady) return this._rtHasShield;
  return this.parent._shield > 0 && this.getQD('shield') > 0;
}

uranium.t.baseShoting = function () {
  if (!this.hasAmmo())
    return;

  this.updateOneShot();
  this.totalShots++;
  this.curRecoil = 1;
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
  this.baseBullet(type, this.rotation + (Math.random() * inaccuracy - inaccuracy / 2));
}

// Mindustry v126 TurretBuild.bullet(type, angle) only created the projectile.
// v159.7 TurretBuild.bullet(...) also owns ammo/effects/recoil/shot counters, which
// Uranium already handles in baseShoting(). Keep the old responsibility split.
uranium.t.baseBullet = function (type, angle) {
  const
    bulletX = this.x + Angles.trnsx(this.rotation - 90, this.block.shootX, this.block.shootY),
    bulletY = this.y + Angles.trnsy(this.rotation - 90, this.block.shootX, this.block.shootY),
    typeRange = type.range;

  let lifeScl = 1;
  if (type.scaleLife && typeRange > 0) {
    lifeScl = Mathf.clamp(
      (1 + this.block.scaleLifetimeOffset) * Mathf.dst(bulletX, bulletY, this.targetPos.x, this.targetPos.y) / typeRange,
      this.minRange() / typeRange,
      this.range() / typeRange
    );
  }

  type.create(this, this.team, bulletX, bulletY, angle, 1, lifeScl);
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
    for (var i = 0; i < this.block.shoot.shots; i++) {
      Time.run(this.block.shoot.shotDelay * i, () => { this.baseShoting() });
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
    let oldHealth = this.health;
    this.health += this.getQD('shotHealth');
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
    if (this.health != oldHealth && this.healthChanged != undefined) {
      this.healthChanged();
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
    if (this.shot_alternate == undefined || this.shot_alternate >= this.block.shoot.shots - 1) {
      this.shot_alternate = 0;
    } else {
      this.shot_alternate++;
    }
    xR += this.block.spread / this.block.shoot.shots * this.shot_alternate * 2 - this.block.spread / 2;
  };

  tr.trns(angle, baseRot, xR);
  let shootSoundVolume = this.getP()._shootSoundVolume == undefined ? 1 : this.getP()._shootSoundVolume,
    shotSound = this.getP().shootSound;

  // PowerTurret projectiles now get the same audio/VFX routing as vanilla
  // turrets: a bullet-specific shootSound/shootEffect may override the block.
  // Item-turret behavior stays untouched.
  if (this.getPO().type == 'PowerTurret' && type.shootSound != undefined && type.shootSound != Sounds.none) {
    shotSound = type.shootSound;
  }
  shotSound.at(this.x, this.y, 1, shootSoundVolume);

  type.create(this, this.team, this.x + tr.x, this.y + tr.y, angle);
  tr.trns(this.rotation, baseRot, xR);

  if (this.getPO().type == 'PowerTurret') {
    let muzzleX = this.x + tr.x,
      muzzleY = this.y + tr.y;
    if (type.shootEffect != undefined && type.shootEffect != Fx.none) {
      type.shootEffect.at(muzzleX, muzzleY, this.rotation, type.hitColor);
    }
    if (type.smokeEffect != undefined && type.smokeEffect != Fx.none) {
      type.smokeEffect.at(muzzleX, muzzleY, this.rotation, type.hitColor);
    }
  } else {
    const muzzleX = this.x + tr.x,
      muzzleY = this.y + tr.y,
      muzzleSeed = (this.tile != null ? this.tile.pos() : 0) * 4099 + this.totalShots;

    uranium.vfxBudget.spawnEffect(
      uranium.getEffect('9x18-shot'),
      muzzleX, muzzleY, this.rotation, type.frontColor, null,
      'muzzle', 0.16,
      muzzleSeed, 918,
      uranium.vfxBudget.getBulletProfileFactor('9x18'),
      55
    );
  }
};

uranium.t.healthUpdate = 0;
uranium.t.healthUpdateTimer = 10;
uranium.t.expTimer = 0;

uranium.t.ensureRuntimeInitialized = function () {
  if (!this._uraniumQualityReady) {
    if (Vars.net.client()) return false;
    this.ensureAuthoritativeTurretQuality();
  }

  if (!this.firstUpdate) {
    this.applySyncedStatusState();
    this.updateLvl();
    this.applyPendingSavedHealthFraction();
    this.firstUpdate = true;
  };
  if (!this._rtCacheReady) this.rebuildRuntimeCache();
  return true;
};

// Internal deferred maintenance used by the adaptive scheduler. Gameplay-critical
// counters are deliberately excluded; runtimeFastTick() owns their exact 60 Hz order.
uranium.t.baseMaintenanceUpdate = function (logicalTicks) {
  logicalTicks = Math.max(1, Math.floor(logicalTicks == undefined ? 1 : logicalTicks));
  this.ensureRuntimeInitialized();

  if (!Vars.headless && this._rtHasStatusEffect) {
    this.updateStatusEffectVisual(logicalTicks);
  }

  if (!Vars.headless && this._rtHasQualityEffect) {
    let triggers = 0;
    if (this._rtQualityEffectDelay) {
      const effectPhase = Math.abs(this.id) % this._rtQualityEffectDelay;
      for (let i = logicalTicks - 1; i >= 0; i--) {
        if ((Time.time - i + effectPhase) % this._rtQualityEffectDelay < 1) triggers++;
      }
    } else {
      for (let i = 0; i < logicalTicks; i++) {
        if (Math.random() < this._rtQualityEffectChance) triggers++;
      }
    };

    for (let e = 0; e < triggers; e++) {
      let x = this.x, y = this.y;
      if (this._rtQualityEffectRandomPosition) {
        const size = this.getP().size * 8;
        x = x + Math.random() * size - size / 2;
        y = y + Math.random() * size - size / 2;
      }
      if (this._rtQualityEffect == 'Emperors Shield') {
        uranium.getEffect(this._rtQualityEffect).at(x, y, this._rtQualityEffectRadius);
      } else {
        uranium.getEffect(this._rtQualityEffect).at(x, y);
      }
    }
  }
};

// Backward-compatible public API for addons/custom builds that historically call
// baseUpdateTile() from their own updateTile(). One call still performs one complete
// Uranium logical update; an explicit logicalTicks value replays that many fast ticks
// before one deferred-maintenance pass. Standard Uranium builds use the adaptive
// scheduler and call baseMaintenanceUpdate() directly, so they keep the optimization.
uranium.t.baseUpdateTile = function (logicalTicks) {
  logicalTicks = Math.max(1, Math.floor(logicalTicks == undefined ? 1 : logicalTicks));
  this.ensureRuntimeInitialized();

  for (let i = 0; i < logicalTicks; i++) {
    this.runtimeFastTick();
  }
  this.baseMaintenanceUpdate(logicalTicks);

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
      name = this.getP().mod_turret + '-' + this.getPO().name;

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
        newRegion = Core.atlas.find(this.getP().mod_base + '-' + regionType + '-' + baseRegion[i]);
      if (newRegion == 'error') {
        regions.base.push(Core.atlas.find(this.getP().mod_base + '-' + baseRegion[i]));
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
  this.rotation = Angles.moveToward(this.rotation, targetRot, this.efficiency * this.getRotationSpeed() * this.delta());
}

uranium.t.getTurretColor = function () {
  return this.getQD('turretColor');
};

uranium.t.getMaxFastShots = function () {
  if (this._rtCacheReady) return this._rtMaxFastShots;
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
        tq = [4, 0],
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
        draw() {
          f.draw.call(this);
          uranium.t.drawAnchoredEnergyCharge(this);
        },
        updateShooting() {
          if (this.reloadCounter >= this.block.reload) {
            let
              type = this.peekAmmo();

            this.shoot(type);
            if (this.checkLuck()) {
              this.shoot(type);
            };

            if (f.parent.fastShots != undefined && data.fastShots > 0) {
              data.fastShots--;
              this.reloadCounter -= this.block.reload * 0.4 * this.getQD('fastShotsDelay');
            } else {
              this.reloadCounter -= this.block.reload;
            }
            this._lastShot = 0;
            this.fastShotsReload = 0;
          }
        },
        // Mindustry 159.7 Turret.updateTile() already calls updateReload(). Uranium
        // keeps its v126 quality-aware manual reload below, so suppress only the vanilla
        // base increment; handleReload() still calls updateCooling() for turret fuel.
        updateReload() {
        },
        updateTile() {
          this.super$updateTile();
          if (this.getP().fastShots != undefined && this.getD().fastShots < this.getMaxFastShots()) {
            this._lastShot++;
            if (this._lastShot > this.getP().reload * 2 && this.fastShotsReload >= this.getP().reloadFastShots) {
              this.fastShotsReload = 0;
              this.getD().fastShots++;
            } else {
              this.fastShotsReload++;
            }
          }
          this.runAdaptiveBaseUpdate();
          if (this.hasAmmo() && this.reloadCounter < this.block.reload) {
            this.reloadCounter += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed() * this.getReloadMulti();
          }
        },
        shoot: uranium.t.baseShot,
        version() {
          return 4;
        },
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
          data.fastShots = read.i();
          let savedHealthFraction = revision >= 3 ? read.f() : undefined;
          // Restore only transient runtime fields; never clear the status data
          // that was just read from the save/network snapshot.
          this.applySyncedStatusState();
          this.updateLvl();
          this.restoreSavedHealthFraction(savedHealthFraction, revision);

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
        tq = [4, 0],
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
        shootTimer: 0,
        _energyChargeStartTime: -1,
        _energyChargeEndTime: -1,
        _energyChargeVisualTicks: 0,
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
        draw() {
          f.draw.call(this);
          uranium.t.drawAnchoredEnergyCharge(this);
        },
        updateTile() {
        this.super$updateTile();
        this.runAdaptiveBaseUpdate();

          // Explicit visual charge window. This does not depend on queuedBullets:
          // the window is opened at the exact call to shoot(type), then rendered from
          // the turret's CURRENT rotation every frame, so the charge point follows aim.
          if (this._energyChargeEndTime != undefined && Time.time > this._energyChargeEndTime + 1) {
            this._energyChargeVisualTicks = 0;
          }

          this.shootTimer += Time.delta;

          if (this.isShooting) {

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
          let chargeDelay = this.block.shoot != null ? this.block.shoot.firstShotDelay : 0;
          if (chargeDelay > 0) {
            this._energyChargeStartTime = Time.time;
            this._energyChargeEndTime = Time.time + chargeDelay;
            this._energyChargeVisualTicks = 0;
          }

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
        version() {
          return 4;
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
          writer.f(this.getSavedHealthFraction());
        },
        read(read, revision) {
          data.tempCore = read.i();
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
          // Restore only transient runtime fields; never clear the status data
          // that was just read from the save/network snapshot.
          this.applySyncedStatusState();
          this.updateLvl();
          this.restoreSavedHealthFraction(savedHealthFraction, revision);
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
        tq = [4, 0],
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
        getMaxPreparedShots() {
          return this._maxPreparedShots;
        },
        draw() {
          f.draw.call(this);
          uranium.t.drawAnchoredEnergyCharge(this);
        },
        updateShooting() {
          if (this.reloadCounter >= this.block.reload) {

            let
              type = this.peekAmmo();

            this.shoot(type);
            this.reloadCounter -= this.block.reload;
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

          if (this.block.shoot.firstShotDelay > 0 && this.queuedBullets > 0) {
            this._energyChargeVisualTicks = Math.min(
              this.block.shoot.firstShotDelay,
              (this._energyChargeVisualTicks != undefined ? this._energyChargeVisualTicks : 0) + Time.delta
            );
          } else {
            this._energyChargeVisualTicks = 0;
          }

          if (this.hasAmmo() && this.reloadCounter < this.block.reload) {
            this.reloadCounter += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed() * this.getReloadMulti();
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
        version() {
          return 4;
        },
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
          writer.f(this.getSavedHealthFraction());
        },
        read(read, revision) {
          data.lvl = read.i();
          data.exp = read.i();
          data.sheald = read.i();
          data.preparedShots = read.i();
          this.rotation = read.i();
          data.turretQuality.q = read.i();
          data.turretQuality.t = read.i();
          this._uraniumQualityReady = true;
          data.turretStatusIsset = read.i();
          data.turretStatusQ = read.i();
          data.turretStatusT = read.i();
          let savedHealthFraction = revision >= 3 ? read.f() : undefined;
          // Restore only transient runtime fields; never clear the status data
          // that was just read from the save/network snapshot.
          this.applySyncedStatusState();
          this.updateLvl();
          this.restoreSavedHealthFraction(savedHealthFraction, revision);
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