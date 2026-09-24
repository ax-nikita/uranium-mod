const
  uranium = global.uranium;

// -----------------------------------------------------------------------------
// MultiCrafter input stats UI
// Mindustry's normal ConsumeItems stat renders every accepted input as if every
// item were required at once. MultiCrafter recipes are different: some inputs
// are common to every recipe while the rest select one recipe. Build two compact
// icon rows that describe that distinction without changing runtime consumption.
// -----------------------------------------------------------------------------

function getMultiCrafterInputGroups(craftMap) {
  let required = [],
    choice = [],
    allItems = [],
    common = {};

  if (craftMap == undefined || craftMap.length == 0) {
    return { required: required, choice: choice };
  }

  // Build a unique ordered list of every input item.
  for (let r = 0; r < craftMap.length; r++) {
    let consumes = craftMap[r].consumes_items;
    for (let i = 0; i < consumes.length; i++) {
      let item = consumes[i][0],
        found = false;

      for (let j = 0; j < allItems.length; j++) {
        if (allItems[j] == item) {
          found = true;
          break;
        }
      }

      if (!found) allItems.push(item);
    }
  }

  // An item is "required" only if every recipe consumes it.
  for (let a = 0; a < allItems.length; a++) {
    let item = allItems[a],
      inEveryRecipe = true,
      minAmount = 2147483647,
      maxAmount = 0;

    for (let r = 0; r < craftMap.length; r++) {
      let consumes = craftMap[r].consumes_items,
        amount = 0;

      for (let i = 0; i < consumes.length; i++) {
        if (consumes[i][0] == item) {
          amount = consumes[i][1];
          break;
        }
      }

      if (amount <= 0) {
        inEveryRecipe = false;
        break;
      }

      if (amount < minAmount) minAmount = amount;
      if (amount > maxAmount) maxAmount = amount;
    }

    if (inEveryRecipe) {
      required.push([item, minAmount, maxAmount]);
      common[item.id] = true;
    }
  }

  // Everything else is a selectable recipe ingredient. Keep one icon per item;
  // show the amount range when different recipes use different quantities.
  for (let a = 0; a < allItems.length; a++) {
    let item = allItems[a];
    if (common[item.id]) continue;

    let minAmount = 2147483647,
      maxAmount = 0,
      found = false;

    for (let r = 0; r < craftMap.length; r++) {
      let consumes = craftMap[r].consumes_items;
      for (let i = 0; i < consumes.length; i++) {
        if (consumes[i][0] == item) {
          let amount = consumes[i][1];
          if (amount < minAmount) minAmount = amount;
          if (amount > maxAmount) maxAmount = amount;
          found = true;
        }
      }
    }

    if (found) choice.push([item, minAmount, maxAmount]);
  }

  return { required: required, choice: choice };
}

function addMultiCrafterInputIcon(row, entry) {
  let item = entry[0],
    minAmount = entry[1],
    maxAmount = entry[2],
    amountText = minAmount == maxAmount
      ? '' + minAmount
      : minAmount + '-' + maxAmount,
    icon = new Stack();

  icon.add(new Image(item.uiIcon).setScaling(Scaling.fit));

  let amount = new Table();
  amount.left().bottom();
  amount.add(amountText).style(Styles.outlineLabel);
  icon.add(amount);

  StatValues.withTooltip(icon, item, true);
  row.add(icon).size(32).padRight(4);
}

function addMultiCrafterInputRow(table, titleKey, entries, emptyKey) {
  let card = new Table();
  card.left();
  card.background(Tex.button);

  let title = new Table();
  title.left();
  title.add(Core.bundle.get(titleKey))
    .color(Pal.accent)
    .style(Styles.outlineLabel)
    .padLeft(8)
    .padTop(4)
    .padBottom(3);
  card.add(title).growX().left();
  card.row();

  let items = new Table();
  items.left();

  if (entries.length == 0) {
    items.add(Core.bundle.get(emptyKey))
      .color(Color.lightGray)
      .padLeft(8)
      .padBottom(6)
      .padRight(8);
  } else {
    for (let i = 0; i < entries.length; i++) {
      addMultiCrafterInputIcon(items, entries[i]);
    }
  }

  card.add(items).growX().left().padLeft(6).padRight(4).padBottom(5);
  table.add(card).growX().left().padTop(2).padBottom(2);
  table.row();
}


function formatMultiCrafterAmount(minAmount, maxAmount) {
  return minAmount == maxAmount
    ? '' + minAmount
    : minAmount + '-' + maxAmount;
}

function createMultiCrafterGroupHeaderBar(bundleKey) {
  return func(ent => new Bar(
    Core.bundle.get(bundleKey) + ':',
    Color.valueOf('454545'),
    floatp(() => 1)
  ));
}

function createMultiCrafterGroupItemBar(index, groupName, groups) {
  return func(ent => {
    let group = groups[groupName],
      entry = index < group.length ? group[index] : null,
      item_name,
      item_quontity,
      item_storage,
      item_color;

    if (!entry) {
      item_name = 'none';
      item_quontity = '';
      item_color = '505050';
    } else {
      item_name = entry[0].localizedName + ': ';
      item_quontity = formatMultiCrafterAmount(entry[1], entry[2]);
      item_color = entry[0].color;
    }

    return new Bar(
      item_name + item_quontity,
      Color.valueOf(item_color),
      floatp(() => {
        if (!entry) return 0;

        let item = entry[0],
          currentRecipe = ent.getCraftMap()[ent.getQD().craft_num],
          target = 0;

        for (let i = 0; i < currentRecipe.consumes_items.length; i++) {
          let consumes = currentRecipe.consumes_items[i];
          if (consumes[0] == item) {
            target = consumes[1];
            break;
          }
        }

        if (target <= 0) return 0;

        item_storage = ent.items.get(item) / target;
        if (item_storage > 1) item_storage = 1;
        return item_storage;
      })
    );
  });
}


function getCurrentRecipeItemRequirement(recipe, item) {
  for (let i = 0; i < recipe.consumes_items.length; i++) {
    if (recipe.consumes_items[i][0] == item) {
      return recipe.consumes_items[i][1];
    }
  }
  return 0;
}

function addMultiCrafterDisplayIcon(table, build, entry, currentRecipe, isChoice) {
  let item = entry[0],
    minAmount = entry[1],
    maxAmount = entry[2],
    currentRequirement = getCurrentRecipeItemRequirement(currentRecipe, item),
    amountText = currentRequirement > 0
      ? '' + currentRequirement
      : (minAmount == maxAmount ? '' + minAmount : minAmount + '-' + maxAmount),
    hasEnough = currentRequirement <= 0 || build.items.get(item) >= currentRequirement,
    stack = new Stack(),
    image = new Image(item.uiIcon),
    amount = new Table();

  image.setScaling(Scaling.fit);

  if (isChoice && currentRequirement <= 0) {
    image.setColor(0.55, 0.55, 0.55, 0.65);
  } else if (!hasEnough) {
    image.setColor(1.0, 1.0, 1.0, 0.85);
  }

  amount.left().bottom();
  amount.add(amountText).style(Styles.outlineLabel);

  stack.add(image);
  stack.add(amount);

  StatValues.withTooltip(stack, item, true);
  table.add(stack).size(34).pad(2);
}

function addMultiCrafterDisplaySection(table, build, titleKey, entries, currentRecipe, isChoice) {
  if (entries.length == 0) return;

  table.left();
  table.add(Core.bundle.get(titleKey) + ':')
    .left()
    .color(Pal.accent)
    .style(Styles.outlineLabel)
    .padTop(4)
    .padBottom(2);
  table.row();

  let icons = new Table();
  icons.left();

  for (let i = 0; i < entries.length; i++) {
    addMultiCrafterDisplayIcon(icons, build, entries[i], currentRecipe, isChoice);
    if ((i + 1) % 4 == 0 && i + 1 < entries.length) {
      icons.row();
    }
  }

  table.add(icons).left();
  table.row();
}

uranium.createMultiCrafter = function (craft_map, name, entity_f) {
  // Keep the grouped recipe metadata in a Rhino closure. Do not store/read it
  // through Building.block: JavaAdapter does not reliably expose arbitrary JS
  // properties through the generated Java Block reference.
  const inputGroups = getMultiCrafterInputGroups(craft_map);

  entity_f.setStats = function () {
    this.super$setStats();

    // Hide GenericCrafter/ConsumeItems' misleading all-inputs-at-once row.
    this.stats.remove(Stat.input);

    const groups = inputGroups;

    this.stats.add(Stat.input, cons(table => {
      table.left();
      addMultiCrafterInputRow(
        table,
        'uranium-mod.stats.requiredResources',
        groups.required,
        'uranium-mod.stats.noRequiredResources'
      );
      addMultiCrafterInputRow(
        table,
        'uranium-mod.stats.choiceResources',
        groups.choice,
        'uranium-mod.stats.noChoiceResources'
      );
    }));
  };

  entity_f.setBars = function () {
    this.super$setBars();
    this.addBar("craftTime", func(ent => {
      let
        data = ent.getQD();
      return new Bar(
        Core.bundle.get("uranium-mod.bars.craftTime") + ": " + parseInt(ent.getCraftMap()[data.craft_num].craft_time / 60 * 10) / 10 + 's',
        Color.valueOf('454545'),
        floatp(() => {
          return 1;
        }));
    }));
    this.addBar("power", func(ent => {
      let
        data = ent.getQD();
      return new Bar(
        Core.bundle.get("uranium-mod.bars.needPower") + ": " + ent.getCraftMap()[data.craft_num].power,
        Color.valueOf('454545'),
        floatp(() => {
          return 1;
        }));
    }));
    this.addBar("ItemsNeeded:", func(ent => {
      let
        data = ent.getQD();
      return new Bar(
        Core.bundle.get("uranium-mod.bars.needItems") + ":",
        Color.valueOf('454545'),
        floatp(() => {
          return 1;
        }));
    }));
    this.addBar("item_1", func(ent => {
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
      this.addBar("item_2", func(ent => {
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
      this.addBar("item_3", func(ent => {
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
    this.addBar("ItemsCrafted:", func(ent => {
      return new Bar(
        Core.bundle.get("uranium-mod.bars.outputItems") + ":",
        Color.valueOf('454545'),
        floatp(() => {
          return 1;
        }));
    }));
    this.addBar("item_c_1", func(ent => {
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
    this.addBar("craftProgress", func(ent => {
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
        displayConsumption(table) {
          let currentRecipe = this.getCraftMap()[d.craft_num],
            groups = inputGroups;

          table.left();

          addMultiCrafterDisplaySection(
            table,
            this,
            'uranium-mod.ui.requiredResources',
            groups.required,
            currentRecipe,
            false
          );

          addMultiCrafterDisplaySection(
            table,
            this,
            'uranium-mod.ui.choiceResources',
            groups.choice,
            currentRecipe,
            true
          );
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
        // IMPORTANT: acceptItem() is a routing probe in Mindustry and may be called
        // repeatedly before an item is actually transferred. It must never mutate
        // recipe state or item storage. The legacy implementation switched recipes,
        // reset progress and deleted old inputs from this callback, which could eat
        // items without ever completing a craft on current game versions.
        acceptItem(tile, item) {
          if (this.items.total() >= newObj.const.itemCapacity) {
            return false;
          }
          return this.getNeeded(item);
        },
        getRecipeItemRequirement(recipeNum, item) {
          let consumes = this.getCraftMap()[recipeNum].consumes_items;
          for (let i = 0; i < consumes.length; i++) {
            if (consumes[i][0] == item) {
              return consumes[i][1];
            }
          }
          return 0;
        },
        hasRecipeInputs(recipeNum) {
          let consumes = this.getCraftMap()[recipeNum].consumes_items;
          for (let i = 0; i < consumes.length; i++) {
            if (this.items.get(consumes[i][0]) < consumes[i][1]) {
              return false;
            }
          }
          return consumes.length > 0;
        },
        getNeeded(item) {
          let requirement = this.getRecipeItemRequirement(d.craft_num, item);

          // Keep up to two batches of ingredients for the active recipe.
          if (requirement > 0 && this.items.get(item) < requirement * 2) {
            return true;
          }

          // Never switch recipes while a craft is already in progress or while
          // the active recipe is fully supplied and waiting for power/update.
          if (d.craft_progress > 0 || this.hasRecipeInputs(d.craft_num)) {
            return false;
          }

          // If idle, another recipe may accept this item. This is only a pure
          // availability check; the actual recipe switch happens in handleItem().
          for (let i = 0; i < this.getCraftMap().length; i++) {
            if (i == d.craft_num) continue;
            requirement = this.getRecipeItemRequirement(i, item);
            if (requirement > 0 && this.items.get(item) < requirement * 2) {
              return true;
            }
          }
          return false;
        },
        selectRecipeForItem(item) {
          if (d.craft_progress > 0 || this.hasRecipeInputs(d.craft_num)) return;

          // Prefer the current recipe whenever it can use the delivered item.
          if (this.getRecipeItemRequirement(d.craft_num, item) > 0) return;

          for (let i = 0; i < this.getCraftMap().length; i++) {
            if (i == d.craft_num) continue;
            if (this.getRecipeItemRequirement(i, item) > 0) {
              d.craft_num = i;
              return;
            }
          }
        },
        handleItem(source, item) {
          // Recipe changes are committed only when an item is really delivered.
          // Existing ingredients are intentionally preserved; no silent deletion.
          this.selectRecipeForItem(item);
          this.items.add(item, 1);
        },
        outputsItems() {
          return true;
        },
        updateTile() {
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

                if (d.craft_progress >= craft_info.craft_time / (d.update_time * 2)) {
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
          this.super$read(read, revision);
          d.craft_num = read.i();
          d.craft_progress = read.i();
        },
      });
    return entity;
  });
  return newObj;
};