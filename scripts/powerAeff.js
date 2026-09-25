//Енергетика
const
  uranium = global.uranium;

// Vanilla v159.7 RTG balance for Uranium resources. ConsumeItemRadioactive uses
// item.radioactivity as the instantaneous power multiplier, while ConsumeGenerator
// supports a per-item duration multiplier. Use both dimensions so refining uranium
// concentrates fuel instead of multiplying total RTG energy for free.
Events.on(ContentInitEvent, cons(e => {
  const rtg = Blocks.rtgGenerator;
  if (rtg == null || rtg.itemDurationMultipliers == null) {
    Log.err("[Uranium-Mod] vanilla RTG not found; Uranium RTG balance patch skipped.");
    return;
  }

  const u238 = uranium.getI('uranium-238');
  const u235 = uranium.getI('uranium-235');
  const fuelCell = uranium.getI('uranium-fuel-cell');

  // Relative to vanilla thorium (radioactivity 1.0, duration x1):
  // U-238: 0.90x power, 1.00x duration = 0.90x total energy.
  //
  // Vanilla phase fabric is the useful benchmark here:
  // 0.60x power * 15x duration = 9x thorium energy per item.
  // One phase fabric costs 4 thorium, so vanilla deliberately rewards refining
  // radioactive material with roughly 2.25x higher energy density.
  //
  // Uranium follows the same principle:
  // 1 U-235 costs 4 U-238 + sulfur.
  // Direct RTG value of 4 U-238 = 3.6x thorium energy.
  // 3.6 * ~2.25 = ~8.1x, therefore U-235 uses duration x6.5:
  // 1.25x power * 6.5x duration = 8.125x total energy.
  //
  // One fuel cell costs 3 U-235 + graphite. Three U-235 already represent
  // 24.375x thorium energy, so the additional forge step gets a modest
  // concentration bonus instead of losing energy:
  // 1.75x power * 17x duration = 29.75x total energy.
  if (u238 != null) rtg.itemDurationMultipliers.put(u238, 1.0);
  if (u235 != null) rtg.itemDurationMultipliers.put(u235, 6.5);
  if (fuelCell != null) rtg.itemDurationMultipliers.put(fuelCell, 17.0);
}));

let aluminiumBattery = uranium.createBuild("Battery", "aluminium_battery", {
  icons() {
    return [Core.atlas.find(this.name)];
  },
  drawPlanRegion(plan, list) {
    Draw.rect(Core.atlas.find(this.name), plan.drawx(), plan.drawy());
  }
});

// Mindustry 159.7 Battery disables updates by default; Uranium batteries have active mechanics.
aluminiumBattery.const.update = true;
aluminiumBattery.setBuildEntity(() => {
  let
    d = {
      stabile: 175,
    };
  let
    entity = aluminiumBattery.extendBuild({
      draw() {
        Draw.rect(Core.atlas.find(this.block.name), this.x, this.y);
        Draw.alpha(0.5);
        Draw.color(uranium.getRuntimeColor("00dda0"), uranium.getRuntimeColor("dd2222"), 1 - d.stabile / 100);
        Fill.square(this.x, this.y, 1.5);
        Draw.alpha(0.5);
        Draw.color(uranium.getRuntimeColor("00FFFF"), uranium.getRuntimeColor("FF1111"), 1 - d.stabile / 100);
        Fill.square(this.x, this.y, 1);
      },
      updateTile() {
        if (this.timer.get(2)) {
          this.power.graph.transferPower((50 + d.stabile) / (20));//210 в секунду
          if (Math.random() < 0.1) {
            d.stabile -= 0.1;
            if (Math.random() < 0.12) {
              this.items.add(uranium.getI('altit'), parseInt(Math.random() * 2 + 1));
            }
          }
          if (d.stabile < 0) {
            if (Math.random() < 0.1 + -d.stabile * 0.1) {
              entity.onDestroyed();
              this.power.graph.transferPower(60);
              if (Math.random() < 0.3) {
                this.items.add(uranium.getI('altit'), parseInt(Math.random() * 2 + 1));
              }
            }
          }
          this.dump(uranium.getI('altit'));
        }
      },
      outputsItems() {
        return true;
      },
      write(writer) {
        this.super$write(writer);
        writer.i(d.stabile);
      },
      read(read, revision) {
        this.super$read(read, revision);
        d.stabile = read.i();
      }
    });
  return entity;
});

uranium
  .createBuild("NuclearReactor", "nuclear_reactor", {
    fuelItem: uranium.getI("uranium-fuel-cell"),
    init() {
      // v6 NuclearReactor used its liquid consumer only as an accepted coolant
      // and removed cryofluid manually according to the current heat value.
      // In v159.7 a parsed legacy HJSON ConsumeLiquid updates automatically unless
      // explicitly disabled, which breaks the old reactor heating/cooling loop.
      let coolant = this.findConsumer(boolf(c => c instanceof ConsumeLiquid));
      if (coolant != null) {
        coolant.update = false;
      }
      this.super$init();
    },
    load() {
      this.super$load();
      this.regions = [];
      this.regions[0] = Core.atlas.find(this.name);
      this.regions[1] = Core.atlas.find(this.name + "-fuel1");
      this.regions[2] = Core.atlas.find(this.name + "-fuel2");
      this.regions[3] = Core.atlas.find(this.name + "-fuel3");
      this.regions[4] = Core.atlas.find(this.name + "-liquid");
    }
  })
  .setBuild({
    draw() {
      let
        regions = this.parent.regions,
        liquids = this.liquids.currentAmount() / this.parent.liquidCapacity,
        items = this.items.total() / this.parent.itemCapacity;
      Draw.rect(regions[0], this.x, this.y);
      Draw.alpha(items);
      Draw.rect(regions[1], this.x, this.y);
      Draw.rect(regions[3], this.x, this.y, 0);
      Draw.alpha(items - Math.random(100, 300) / 4);
      Draw.rect(regions[2], this.x, this.y, 0);
      Draw.color(this.liquids.current().color);
      Draw.alpha(liquids);
      Draw.rect(regions[4], this.x, this.y);
    }
  });

let uraniumBattery = uranium
  .createBuild("Battery", "uranium_battery", {
    icons() {
      return [Core.atlas.find(this.name)];
    },
    drawPlanRegion(plan, list) {
      Draw.rect(Core.atlas.find(this.name), plan.drawx(), plan.drawy());
    },
    load() {
      this.super$load();
      this.regions = [];
      this.regions[0] = Core.atlas.find(this.name);
      this.regions[1] = Core.atlas.find(this.name + "_power");
    }
  })
  .setBuild({
    draw() {
      const regions = this.parent.regions,
        graph = this.power == null ? null : this.power.graph,
        // Mindustry's own power UI reads these cached PowerGraph values. They
        // preserve the old network-wide charge display without scanning every
        // battery from every Uranium battery draw call.
        capacity = graph == null ? 0 : graph.getLastCapacity(),
        stored = graph == null ? 0 : graph.getLastPowerStored(),
        charge = capacity > 0 ? Math.max(0, Math.min(1, stored / capacity)) : 0,
        pulse = 0.5 + 0.5 * Math.sin(Time.time / 17 + this.id * 0.19),
        // Sample-and-hold electrical flicker. Per-frame Math.random() was too fast
        // and visually averaged into a nearly constant emissive layer.
        flickerStep = Math.floor((Time.time + this.id * 1.73) / 7),
        flickerNoise = Math.abs(Math.sin(flickerStep * 12.9898 + this.id * 78.233) * 43758.5453) % 1,
        spriteFlicker = 0.68 + 0.32 * flickerNoise,
        lightFlicker = 0.93 + 0.07 * flickerNoise,
        glowColor = uranium.getRuntimeColor('63FF72'),
        coreColor = uranium.getRuntimeColor('B9FFC0');

      Draw.rect(regions[0], this.x, this.y);

      // uranium_battery_power is the emissive mask. The mask itself now flickers
      // in softer held pulses, while charge still controls the overall strength.
      if (charge > 0.001) {
        const chargeGlow = 0.22 + 0.78 * charge,
          emissive = (0.46 + 0.34 * pulse) * spriteFlicker * chargeGlow;

        Draw.color(glowColor, coreColor, 0.24 + 0.20 * pulse);
        Draw.blend(Blending.additive);
        Draw.alpha(emissive);
        Draw.rect(regions[1], this.x, this.y);
        Draw.blend();
        Draw.color();

        // Keep the world light brighter than 4.09.5, but deliberately much less
        // flickery than the emissive texture so the sprite flicker remains readable.
        const radius = 30 * (0.90 + 0.10 * pulse),
          lightAlpha = (0.085 + 0.060 * pulse) * lightFlicker * charge;
        Drawf.light(this.x, this.y, radius, glowColor, lightAlpha);
      }

      Draw.reset();
    },
    updateTile() {
      if (this.timer.get(2)) {
        this.power.graph.transferPower(180 / (40 / 2));//210 в секунду
      }
    }
  });

// Mindustry 159.7 Battery disables updates by default.
uraniumBattery.const.update = true;