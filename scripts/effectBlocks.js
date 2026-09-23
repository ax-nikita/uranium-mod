// Effect blocks with v159.7 compatibility hooks.
const uranium = global.uranium;

function createForceProjector(name, shieldColorHex) {
  const shieldColor = Color.valueOf(shieldColorHex);

  let obj = uranium.createBuild("ForceProjector", name, {
    init() {
      // In v126 ForceProjector discovered its item booster from the generic consume
      // system. v159.7 stores it in itemConsumer, but JSON parsing does not fill that
      // field automatically. findConsumer() intentionally works before init by
      // searching consumeBuilder, so bind the parsed tritium booster first.
      let booster = this.findConsumer(boolf(c => c instanceof ConsumeItems && c.booster));
      if (booster != null) {
        this.itemConsumer = booster;
      }
      this.super$init();
    },

    // Keep the placement preview consistent with the runtime shield color.
    drawPlace(x, y, rotation, valid) {
      this.super$drawPlace(x, y, rotation, valid);

      Draw.color(Pal.gray);
      Lines.stroke(3);
      Lines.poly(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, this.sides, this.radius, this.shieldRotation);
      Draw.color(shieldColor);
      Lines.stroke(1);
      Lines.poly(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, this.sides, this.radius, this.shieldRotation);
      Draw.reset();
    }
  });

  // ForceProjector's vanilla ForceBuild hard-codes team.color in drawShield().
  // Override only rendering; shield mechanics, buildup, regeneration, networking
  // and collision behavior remain completely vanilla.
  obj.const.buildType = prov(() => extend(ForceProjector.ForceBuild, obj.const, {
    drawShield() {
      if (!this.broken) {
        let radius = this.realRadius();

        if (radius > 0.001) {
          Draw.color(shieldColor, Color.white, Mathf.clamp(this.hit));

          if (Vars.renderer.animateShields) {
            Draw.z(Layer.shields + 0.001 * this.hit);
            Fill.poly(this.x, this.y, this.block.sides, radius, this.block.shieldRotation);
          } else {
            Draw.z(Layer.shields);
            Lines.stroke(1.5);
            Draw.alpha(0.09 + Mathf.clamp(0.08 * this.hit));
            Fill.poly(this.x, this.y, this.block.sides, radius, this.block.shieldRotation);
            Draw.alpha(1);
            Lines.poly(this.x, this.y, this.block.sides, radius, this.block.shieldRotation);
          }
        }
      }

      Draw.reset();
    }
  }));

  return obj;
}

// Match each projector to the resource family it represents.
createForceProjector("blue_thorium_shield", "555599"); // Phoenix
createForceProjector("uranium_shield", "0cc406");      // Turtle
