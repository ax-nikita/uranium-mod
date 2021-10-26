const
  uranium = global.uranium;

uranium
  .createBuild("GenericCrafter", "aluminium_voult_rotor", {})
  .setBuild({
    update() {
      this.dump();
    },
    acceptItem(tile, item) {
      if (this.items.total() >= this.block.itemCapacity)
        return false;
      else
        return true;
    }
  });