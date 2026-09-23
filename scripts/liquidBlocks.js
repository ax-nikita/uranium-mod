// Liquid blocks with legacy Uranium visuals adapted to Mindustry 159.7.
const uranium = global.uranium;

uranium
  .createBuild("LiquidRouter", "aluminium-LiqRot", {
    icons() {
      // Uranium ships the v126 LiquidBlock atlas contract: bottom + top.
      return [this.bottomRegion, this.topRegion];
    },
    drawPlanRegion(plan, list) {
      Draw.rect(this.bottomRegion, plan.drawx(), plan.drawy());
      Draw.rect(this.topRegion, plan.drawx(), plan.drawy());
    }
  })
  .setBuild({
    draw() {
      let rotation = this.parent.rotate ? this.rotdeg() : 0,
        amount = this.liquids.currentAmount();

      Draw.rect(this.parent.bottomRegion, this.x, this.y, rotation);

      if (amount > 0.001) {
        Drawf.liquid(
          this.parent.liquidRegion,
          this.x,
          this.y,
          amount / this.parent.liquidCapacity,
          this.liquids.current().color
        );
      }

      Draw.rect(this.parent.topRegion, this.x, this.y, rotation);
    }
  });
