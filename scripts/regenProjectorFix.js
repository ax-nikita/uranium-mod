// Compatibility fix for vanilla RegenProjector + Uranium dynamic maxHealth.
//
// Vanilla v159.7/v160 RegenProjector calculates both repair throughput and the
// remaining repair cap from build.block.health. Uranium turrets intentionally
// keep block.health as their static base HP and expose quality/level HP through
// Building.maxHealth. Once current health rises above static block.health,
// vanilla code computes a negative "remaining" value and calls heal() with a
// negative amount, which actually damages the building.
//
// This replacement keeps vanilla behavior for ordinary blocks (where both values
// are equal), but uses the runtime maxHealth for dynamic-HP buildings. Multiple
// regen projectors still do not stack: only the strongest repair amount for a
// target in the current update frame is applied.

const regenProjector = Blocks.regenProjector;

if (regenProjector != null && !global.__uraniumRegenProjectorDynamicHpFix) {
  global.__uraniumRegenProjectorDynamicHpFix = true;

  // pos -> { frame, amount }. amount is the total regen already applied by all
  // RegenProjectors to this target in the current game update.
  const applied = {};

  regenProjector.buildType = prov(() => extend(RegenProjector.RegenProjectorBuild, regenProjector, {
    updateTile() {
      if (this.lastChange != Vars.world.tileChanges) {
        this.lastChange = Vars.world.tileChanges;
        this.updateTargets();
      }

      this.warmup = Mathf.approachDelta(this.warmup, this.didRegen ? 1 : 0, 1 / 70);
      this.totalTime += this.warmup * Time.delta;
      this.didRegen = false;
      this.anyTargets = false;

      if (this.checkSuppression()) return;

      // Avoid Seq predicate adapters here; an indexed loop is more reliable
      // across Rhino/JS API revisions.
      for (let i = 0; i < this.targets.size; i++) {
        let target = this.targets.get(i);
        if (target != null && target.damaged()) {
          this.anyTargets = true;
          break;
        }
      }

      if (this.efficiency <= 0) return;

      if ((this.optionalTimer += this.edelta() * this.optionalEfficiency) >= this.block.optionalUseTime) {
        this.consume();
        this.optionalTimer = 0;
      }

      const healPercent = Mathf.lerp(1, this.block.optionalMultiplier, this.optionalEfficiency) * this.block.healPercent;
      const frame = Vars.state.updateId;

      for (let i = 0; i < this.targets.size; i++) {
        let build = this.targets.get(i);
        if (build == null || !build.damaged() || build.isHealSuppressed()) continue;

        this.didRegen = true;

        // Runtime maxHealth is the critical compatibility point. For vanilla
        // buildings this equals block.health, so vanilla balance is unchanged.
        let maxHealth = build.maxHealth;
        if (typeof maxHealth != 'number' || !isFinite(maxHealth) || maxHealth <= 0) {
          maxHealth = build.block.health;
        }

        const pos = build.pos();
        let record = applied[pos];
        if (record == undefined || record.frame != frame) {
          record = { frame: frame, amount: 0 };
          applied[pos] = record;
        }

        // Reconstruct missing HP at the beginning of this frame so several
        // projectors can choose max(strength) instead of stacking additively.
        const missingBeforeProjectorRegen = Math.max(0, maxHealth - build.health + record.amount);
        const rateThisFrame = Math.max(0, healPercent * this.edelta() * maxHealth / 100);
        const desiredTotal = Math.min(rateThisFrame, missingBeforeProjectorRegen);
        const add = desiredTotal - record.amount;

        if (add > 0.000001) {
          build.heal(add);
          build.recentlyHealed();
          record.amount = desiredTotal;
        }

        if (Mathf.chanceDelta(this.block.effectChance * build.block.size * build.block.size)) {
          this.block.effect.at(
            build.x + Mathf.range(build.block.size * Vars.tilesize / 2 - 1),
            build.y + Mathf.range(build.block.size * Vars.tilesize / 2 - 1)
          );
        }
      }
    }
  }));

}
