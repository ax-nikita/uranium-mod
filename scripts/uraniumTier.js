const
  uranium = global.uranium;

uranium
  .createBuild("GenericCrafter", "thorium_smelter", {});

uranium
  .createBuild("GenericCrafter", "blue_thorium_forge", {});

uranium
  .createBuild("GenericCrafter", "uranium_forge", {});

uranium
  .createBuild("GenericCrafter", "uranium_centrifuge", {
    load() {
      this.super$load();
      this.regions = [];
      this.regions[0] = Core.atlas.find(this.name);
      this.regions[1] = Core.atlas.find(this.name + "-progress");
      this.regions[2] = Core.atlas.find(this.name + "-progress2");
    }
  })
  .setBuild({
    draw() {
      Draw.rect(this.parent.regions[0], this.x, this.y);
      if (this.progress != 0) {
        Draw.rect(this.parent.regions[1], this.x, this.y, this.progress * 3600);
        if (this.progress < 0.75)
          Draw.alpha(this.progress * 1.33);
        else
          Draw.alpha(1 - (this.progress - 0.75) * 4);
        Draw.rect(this.parent.regions[2], this.x, this.y, this.progress * 3600);
      }
    }
  });

uranium
  .createBuild("GenericCrafter", "uranium_oil_Smelter", {});

uranium
  .createBuild("GenericCrafter", "uranium_compiller", {});

uranium
  .createBuild("GenericCrafter", "atomic_creator", {});