const uranium = global.uranium;

// Thorium drill balance:
// - light ores (hardness 0..2): exactly 20% lower extraction speed;
// - hard ores (hardness 3+): unchanged;
// - thorium fuel: another 10% lower throughput than 4.10.16 (0.81x vs 4.10.14);
// - uranium fuel: another 25% lower throughput than 4.10.16 (0.5625x vs 4.10.14 uranium mode);
// - uranium remains faster than thorium; both fuels keep the same 0.096/tick use.
//
// Vanilla Drill applies its speed factor both directly to progress and as the
// warmup target, so steady-state throughput is approximately speed^2.
// After applying the same reductions a second time, cumulative real throughput
// is 0.81x for thorium and 0.5625x for uranium relative to 4.10.14. Because
// steady-state throughput is approximately speed^2, the corresponding internal
// efficiency scales are sqrt(0.81)=0.90 and sqrt(0.5625)=0.75.
const fuelUse = 0.096;
const thoriumThroughputScale = 0.90;
const uraniumThroughputScale = 0.75;
let drill = null;
let thoriumFuel = null;
let uraniumFuel = null;
let drillBuildPatched = false;

Events.on(ModContentLoadEvent, cons(e => {
  drill = uranium.getB('thorium_drill');
  thoriumFuel = uranium.getL('thorium_oil');
  uraniumFuel = uranium.getL('uranium_oil');

  if (drill == null || thoriumFuel == null || uraniumFuel == null) {
    Log.err('[Uranium-Mod] thorium_drill fuel setup failed: required content not found.');
    return;
  }

  // Replace the HJSON single-liquid requirement with one required consumer
  // accepting either thorium or uranium fuel. This consumer performs the only
  // actual fuel drain, so both fuels retain the existing 0.096/tick cost.
  const legacyLiquid = drill.findConsumer(boolf(c => c instanceof ConsumeLiquidBase && !c.booster));
  if (legacyLiquid != null) {
    drill.removeConsumer(legacyLiquid);
  }

  const fuelConsumer = new ConsumeLiquidFilter(
    boolf(l => l == thoriumFuel || l == uraniumFuel),
    fuelUse
  );
  drill.consume(fuelConsumer);

  // Detection-only uranium booster. It checks ONLY the active liquid, not any
  // residual uranium left elsewhere in the tank, preventing the old sticky
  // boost bug after switching back to thorium. Fuel is not drained here.
  const uraniumBoost = new JavaAdapter(ConsumeLiquidFilter, {
    efficiency(build) {
      if (build == null || build.liquids == null) return 0;
      if (build.liquids.current() != uraniumFuel) return 0;

      const ed = build.edelta();
      if (ed <= 0.00000001) return 0;
      return Math.min(build.liquids.currentAmount() / (fuelUse * ed), 1);
    }
  }, boolf(l => l == uraniumFuel), fuelUse);
  uraniumBoost.optional = true;
  uraniumBoost.booster = true;
  uraniumBoost.update = false;
  drill.consume(uraniumBoost);

  drill.liquidBoostIntensity = 1.5;
}));

Events.on(ContentInitEvent, cons(e => {
  if (drill == null) drill = uranium.getB('thorium_drill');
  if (thoriumFuel == null) thoriumFuel = uranium.getL('thorium_oil');
  if (uraniumFuel == null) uraniumFuel = uranium.getL('uranium_oil');

  if (drill == null || drill.drillMultipliers == null) {
    Log.err('[Uranium-Mod] thorium_drill not found; drill balance patch skipped.');
    return;
  }

  // Preserve the pre-existing 4.10.0 balance: light ores are exactly 20%
  // slower; hard ores (hardness 3+) keep their original extraction speed.
  Vars.content.items().each(cons(item => {
    if (item != null && item.hardness <= 2) {
      drill.drillMultipliers.put(item, 0.8);
    }
  }));

  // Apply fuel-dependent throughput at the level where vanilla Drill actually
  // calculates progress. Temporarily scaling only `efficiency` preserves
  // uranium's optionalEfficiency=1 -> native 1.5x boost. Restore immediately
  // after the vanilla update so consumption/status logic is not modified.
  if (!drillBuildPatched) {
    drillBuildPatched = true;
    drill.buildType = prov(() => extend(Drill.DrillBuild, drill, {
      updateTile() {
        let scale = 1.0;
        if (this.liquids != null && this.liquids.currentAmount() > 0.000001) {
          const activeFuel = this.liquids.current();
          if (activeFuel == thoriumFuel) {
            scale = thoriumThroughputScale;
          } else if (activeFuel == uraniumFuel) {
            scale = uraniumThroughputScale;
          }
        }

        const originalEfficiency = this.efficiency;
        this.efficiency = originalEfficiency * scale;
        try {
          this.super$updateTile();
        } finally {
          this.efficiency = originalEfficiency;
        }
      }
    }));
  }

  // Keep the existing uranium booster stat presentation. No description/text
  // changes are made by this balance patch.
  if (uraniumFuel != null) {
    drill.stats.remove(Stat.booster);
    drill.stats.add(
      Stat.booster,
      StatValues.speedBoosters(
        "{0}" + StatUnit.timesSpeed.localized(),
        fuelUse,
        1.5,
        false,
        boolf(l => l == uraniumFuel)
      )
    );
  }
}));
