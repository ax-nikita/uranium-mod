const uranium = global.uranium;
const aluminiumBaseRate = 25;
const ticksPerSecond = 60;

// 4.11.3: keep normal aluminium logistics fully native.
// Conveyor / bridge / junction / router / transporter now use only their
// standard Mindustry block implementations and HJSON parameters.
// Router Storage remains custom because storage + controlled aggregate output
// is not a vanilla Router behavior.
uranium
  .createBuild("GenericCrafter", "aluminium_voult_rotor", {
    outputsItems() {
      return true;
    },

    setStats() {
      this.super$setStats();
      this.stats.remove(Stat.productionTime);
      this.stats.remove(Stat.itemsMoved);
      this.stats.add(Stat.itemsMoved, aluminiumBaseRate, StatUnit.itemsSecond);
    }
  })
  .setBuild({
    _uraniumThroughputBudget: 1,

    updateTile() {
      if (this.items.total() <= 0) {
        this._uraniumThroughputBudget = 1;
        return;
      }

      this._uraniumThroughputBudget = Math.min(
        2,
        this._uraniumThroughputBudget + this.delta() * aluminiumBaseRate / ticksPerSecond
      );

      let transfers = Math.floor(this._uraniumThroughputBudget);
      while (transfers-- > 0 && this.items.total() > 0) {
        if (!this.dump()) {
          this._uraniumThroughputBudget = Math.min(this._uraniumThroughputBudget, 1);
          break;
        }
        this._uraniumThroughputBudget -= 1;
      }
    },

    acceptItem(source, item) {
      return this.items.total() < this.block.itemCapacity;
    }
  });
