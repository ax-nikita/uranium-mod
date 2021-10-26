const
  uranium = global.uranium;

uranium.createMultiCrafter = function (craft_map, name, entity_f) {
  entity_f.setBars = function () {
    this.super$setBars();
    this.bars.add("craftTime", func(ent => {
      let
        data = ent.getQD();
      return new Bar(
        Core.bundle.get("uranium-mod.bars.craftTime") + ": " + parseInt(ent.getCraftMap()[data.craft_num].craft_time / 60 * 10) / 10 + 's',
        Color.valueOf('454545'),
        floatp(() => {
          return 1;
        }));
    }));
    this.bars.add("power", func(ent => {
      let
        data = ent.getQD();
      return new Bar(
        Core.bundle.get("uranium-mod.bars.needPower") + ": " + ent.getCraftMap()[data.craft_num].power,
        Color.valueOf('454545'),
        floatp(() => {
          return 1;
        }));
    }));
    this.bars.add("ItemsNeeded:", func(ent => {
      let
        data = ent.getQD();
      return new Bar(
        Core.bundle.get("uranium-mod.bars.needItems") + ":",
        Color.valueOf('454545'),
        floatp(() => {
          return 1;
        }));
    }));
    this.bars.add("item_1", func(ent => {
      let
        data = ent.getQD(),
        item = ent.getCraftMap()[data.craft_num].consumes_items[0],
        item_name,
        item_quontity,
        item_storage,
        item_color;
      if (!item) {
        item_name = 'none';
        item_quontity = '';
        item_color = '505050';
      } else {
        item_name = item[0].localizedName + ': ';
        item_quontity = item[1];
        item_color = item[0].color;
      }
      return new Bar(
        item_name + item_quontity,
        Color.valueOf(item_color),
        floatp(() => {
          if (!item) {
            item_storage = 0;
          } else {
            item_storage = ent.items.get(item[0]) / item_quontity;
            if (item_storage > 1) {
              item_storage = 1;
            }
          }
          return item_storage;
        }));
    }));
    if (this.maxItemReq > 1)
      this.bars.add("item_2", func(ent => {
        let
          data = ent.getQD(),
          item = ent.getCraftMap()[data.craft_num].consumes_items[1],
          item_name,
          item_quontity,
          item_storage,
          item_color;

        if (!item) {
          item_name = 'none';
          item_quontity = '';
          item_color = '505050';
        } else {
          item_name = item[0].localizedName + ': ';
          item_quontity = item[1];
          item_color = item[0].color;
        }
        return new Bar(
          item_name + item_quontity,
          Color.valueOf(item_color),
          floatp(() => {
            if (!item) {
              item_storage = 0;
            } else {
              item_storage = ent.items.get(item[0]) / item_quontity;
              if (item_storage > 1) {
                item_storage = 1;
              }
            }
            return item_storage;
          }));
      }));
    if (this.maxItemReq > 2)
      this.bars.add("item_3", func(ent => {
        let
          data = ent.getQD(),
          item = ent.getCraftMap()[data.craft_num].consumes_items[2],
          item_name,
          item_quontity,
          item_storage,
          item_color;
        if (!item) {
          item_name = 'none';
          item_quontity = '';
          item_color = '505050';
        } else {
          item_name = item[0].localizedName + ': ';
          item_quontity = item[1];
          item_color = item[0].color;
        }
        return new Bar(
          item_name + item_quontity,
          Color.valueOf(item_color),
          floatp(() => {
            if (!item) {
              item_storage = 0;
            } else {
              item_storage = ent.items.get(item[0]) / item_quontity;
              if (item_storage > 1) {
                item_storage = 1;
              }
            }
            return item_storage;
          }));
      }));
    this.bars.add("ItemsCrafted:", func(ent => {
      return new Bar(
        Core.bundle.get("uranium-mod.bars.outputItems") + ":",
        Color.valueOf('454545'),
        floatp(() => {
          return 1;
        }));
    }));
    this.bars.add("item_c_1", func(ent => {
      let
        data = ent.getQD(),
        item = ent.getCraftMap()[data.craft_num].output_items[0],
        item_name,
        item_quontity,
        item_storage,
        item_color;
      if (!item) {
        item_name = 'none';
        item_quontity = '';
        item_color = '505050';
      } else {
        item_name = item[0].localizedName + ': ';
        item_quontity = item[1];

        item_color = item[0].color;
      }
      return new Bar(
        item_name + item_quontity,
        Color.valueOf(item_color),
        floatp(() => {
          if (!item) {
            item_storage = 0;
          } else {
            item_storage = ent.items.get(item[0]) / item_quontity;
            if (item_storage > 1) {
              item_storage = 1;
            }
          }
          return item_storage;
        }));
    }));
    this.bars.add("craftProgress", func(ent => {
      let
        data = ent.getQD(),
        time = ent.getCraftMap()[data.craft_num].craft_time / (data.update_time * 2);

      return new Bar(
        Core.bundle.get("uranium-mod.bars.craftProgress"),
        Color.valueOf('f4a624'),
        floatp(() => {
          return data.craft_progress / time;
        }));
    }));
  };

  entity_f.craft_map = craft_map;
  entity_f.maxItemReq = 0;

  for (let i = 0; i < craft_map.length; i++) {
    if (entity_f.maxItemReq < craft_map[i].consumes_items.length) {
      entity_f.maxItemReq = craft_map[i].consumes_items.length;
    };
  }

  let
    newObj = uranium.createBuild('GenericCrafter', name, entity_f);

  newObj.const.buildType = prov(() => {
    let
      d = {
        craft_num: 0,
        craft_progress: 0,
        update_time: 2
      };

    const
      entity = new JavaAdapter(Building, {
        data: d,
        getCraftMap() {
          return this.getP().craft_map;
        },
        getQD() {
          return this.data;
        },
        getP() {
          return newObj.const;
        },
        draw() {
          for (let i = 0; i < this.getCraftMap()[d.craft_num].regions.length; i++) {
            let
              dr = this.getCraftMap()[d.craft_num].regions[i];
            if (typeof (dr) == 'string') {
              Draw.rect(Core.atlas.find(dr), this.x, this.y);
            } else {
              dr(this, d);
            }
          }
        },
        acceptItem(tile, item) {
          if (this.items.total() >= newObj.const.itemCapacity) {
            return false;
          } else {
            return this.getNeeded(item);
          }

        },
        getNeeded(item) {
          let
            accept = false,
            new_craft = false,
            old_craft = d.craft_num,
            eding = false;
          for (let i = 0; i < this.getCraftMap()[d.craft_num].consumes_items.length; i++) {
            let
              c_item = this.getCraftMap()[d.craft_num].consumes_items[i][0],
              quontity = this.getCraftMap()[d.craft_num].consumes_items[i][1] * 2;
            if (!accept && !eding) {
              if (item == c_item) {
                if (this.items.get(item) <= quontity) {
                  accept = true;
                } else {
                  eding = true;
                }
              }
            }
          }
          if (!accept && !eding) {
            for (let i = 0; i < this.getCraftMap().length; i++) {
              if (i != d.craft_num && !accept) {
                for (let j = 0; j < this.getCraftMap()[i].consumes_items.length; j++) {
                  let
                    c_item = this.getCraftMap()[i].consumes_items[j][0],
                    quontity = this.getCraftMap()[i].consumes_items[j][1] * 2;
                  if (!accept) {
                    if (item == c_item && this.items.get(item) <= quontity) {
                      d.craft_num = i;
                      new_craft = true;
                      accept = true;
                    }
                  }
                }
              }
            }
          }
          if (new_craft) {
            d.craft_progress = 0;
            for (let i = 0; i < this.getCraftMap()[old_craft].consumes_items.length; i++) {
              let
                c_item = this.getCraftMap()[old_craft].consumes_items[i][0],
                quontity = this.getCraftMap()[old_craft].consumes_items[i][1] * 2,
                dell = true;
              for (let j = 0; j < this.getCraftMap()[d.craft_num].consumes_items.length; j++) {
                let
                  t_item = this.getCraftMap()[d.craft_num].consumes_items[j][0];
                if (dell && t_item == c_item) {
                  dell = false;
                }
              }
              if (dell) {
                this.items.remove(c_item, quontity * 2);
              }
            }
          }
          return accept;
        },
        outputsItems() {
          return true;
        },
        update() {
          let
            consume_item = true,
            craft_info = this.getCraftMap()[d.craft_num];
          for (let i = 0; i < craft_info.consumes_items.length; i++) {
            let
              c_item = craft_info.consumes_items[i][0],
              quontity = craft_info.consumes_items[i][1];
            if (this.items.get(c_item) < quontity) {
              consume_item = false;
            }
          }
          if (consume_item) {
            if (this.timer.get(d.update_time)) {//2
              if (this.power.graph.getPowerBalance() >= craft_info.power * this.delta() / (600 * d.update_time)) {
                this.power.graph.transferPower(-craft_info.power * this.delta() / (47 / d.update_time));
                if (craft_info.effects_time !== undefined && parseInt(d.craft_progress) % parseInt(craft_info.effects_time / (d.update_time * 2)) == 0) {
                  for (let i = 0; i < craft_info.progress_effects.length; i++) {
                    let
                      effect = craft_info.progress_effects[i];
                    if (typeof (effect) == 'string') {
                      uranium.getEffect(effect).at(this.x, this.y, craft_info.output_items[0][0].color);
                    } else {
                      effect(this, d);
                    }
                  }
                }
                d.craft_progress += this.delta();

                if (d.craft_progress > craft_info.craft_time / (d.update_time * 2)) {
                  for (let i = 0; i < craft_info.consumes_items.length; i++) {
                    let
                      c_item = craft_info.consumes_items[i][0],
                      quontity = craft_info.consumes_items[i][1];
                    this.items.remove(c_item, quontity);
                  }
                  for (let i = 0; i < craft_info.output_items.length; i++) {
                    let
                      c_item = craft_info.output_items[i][0],
                      quontity = craft_info.output_items[i][1];
                    this.items.add(c_item, quontity);
                  }
                  d.craft_progress = 0;
                }
              }
            }
          }
          for (let i = 0; i < this.getCraftMap().length; i++) {
            let
              outputsItems = this.getCraftMap()[i].output_items;
            for (let j = 0; j < outputsItems.length; j++) {
              this.dump(this.getCraftMap()[i].output_items[j][0]);
            }
          }
          return true;
        },
        write(writer) {
          this.super$write(writer);
          writer.i(d.craft_num);
          writer.i(d.craft_progress);
        },
        read(read, revision) {
          d.craft_num = read.i();
          d.craft_progress = read.i();
          this.super$read(read, revision);
        },
      });
    return entity;
  });
  return newObj;
};