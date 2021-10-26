//Енергетика
const
  uranium = global.uranium;

uranium
  .createBuild("Battery", "aluminium_battery", {})
  .setBuildEntity(() => {
    let
      d = {
        stabile: 175,
      };
    let
      entity = new JavaAdapter(Building, {
        draw() {
          Draw.rect(Core.atlas.find(this.block.name), this.x, this.y);
          Draw.alpha(0.5);
          Draw.color(Color.valueOf("00dda0"), Color.valueOf("dd2222"), 1 - d.stabile / 100);
          Fill.square(this.x, this.y, 1.5);
          Draw.alpha(0.5);
          Draw.color(Color.valueOf("00FFFF"), Color.valueOf("FF1111"), 1 - d.stabile / 100);
          Fill.square(this.x, this.y, 1);
        },
        updateTile(tile) {
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
          d.stabile = read.i();
          this.super$read(read, revision);
        }
      });
    return entity;
  });

uranium
  .createBuild("NuclearReactor", "nuclear_reactor", {
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
        liquids = this.liquids.total() / this.parent.liquidCapacity,
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

uranium
  .createBuild("Battery", "uranium_battery", {
    load() {
      this.super$load();
      this.regions = [];
      this.regions[0] = Core.atlas.find(this.name);
      this.regions[1] = Core.atlas.find(this.name + "_power");
    }
  })
  .setBuild({
    draw() {
      let
        regions = this.parent.regions,
        power = this.power.graph.batteryStored / this.power.graph.getTotalBatteryCapacity() * (Math.random() / 2 + 0.5);
      Draw.rect(regions[0], this.x, this.y);
      Draw.alpha(power);
      Draw.rect(regions[1], this.x, this.y);
    },
    update() {
      if (this.timer.get(2)) {
        this.power.graph.transferPower(180 / (40 / 2));//210 в секунду
      }
    }
  });