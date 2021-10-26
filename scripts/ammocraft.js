const
  uranium = global.uranium;

let
  ammoDrawer = (t, d, num) => {
    let
      name = 'uranium-mod-ammo_factory_firearm',
      regions = [];

    regions[0] = Core.atlas.find(name);
    regions[1] = Core.atlas.find(name + "-power");
    regions[2] = Core.atlas.find(name + "-progress");

    Draw.rect(regions[0], t.x, t.y);
    Draw.color(Color.valueOf(uranium.ammo_colors[num]));
    Draw.alpha(t.efficiency());
    Draw.rect(regions[1], t.x, t.y);
    if (d.craft_progress >= 1) {
      Draw.color(Color.valueOf(uranium.ammo_colors[num]));
      Draw.rect(regions[2], t.x, t.y);
    }
  },
  largeAmmoDrawer = (t, d, num) => {
    let
      name = 'uranium-mod-large_round_factory_firearm',
      regions = [];

    regions[0] = Core.atlas.find(name);
    regions[1] = Core.atlas.find(name + "-power");
    regions[2] = Core.atlas.find(name + "-progress");

    Draw.rect(regions[0], t.x, t.y);
    Draw.color(Color.valueOf(uranium.ammo_colors[num]));
    Draw.alpha(t.efficiency());
    Draw.rect(regions[1], t.x, t.y);
    Draw.color(Color.valueOf(uranium.ammo_colors[num]));
    Draw.rect(regions[2], t.x, t.y);
  },
  artAmmoDrawer = (t, d, num) => {
    let
      name = 'uranium-mod-ART_factory',
      regions = [];

    regions[0] = Core.atlas.find(name);
    regions[1] = Core.atlas.find(name + "-power");
    regions[2] = Core.atlas.find(name + "-progress");

    Draw.rect(regions[0], t.x, t.y);
    Draw.color(Color.valueOf(uranium.ammo_colors[num]));
    Draw.alpha(t.efficiency());
    Draw.rect(regions[1], t.x, t.y);
    Draw.color(Color.valueOf(uranium.ammo_colors[num]));
    Draw.rect(regions[2], t.x, t.y);
  },
  ammoLoaderDrawer = (t, d, num) => {
    let
      regions = [],
      name = 'uranium-mod-ammo_loader';
    regions[0] = Core.atlas.find(name);
    regions[1] = Core.atlas.find(name + "-light");

    Draw.rect(regions[0], t.x, t.y);
    Draw.color(Color.valueOf(uranium.ammo_colors[num]));
    Draw.rect(regions[1], t.x, t.y);
  };

uranium
  .createMultiCrafter([
    { //---------| firearm
      consumes_items: [
        [uranium.getI('firearm_round'), 10]
      ],
      output_items: [
        [uranium.getI('firearm-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 0)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 10,
      effects_time: 60,
      craft_time: 300
    },
    { //---------| titanium
      consumes_items: [
        [uranium.getI('titanium_round'), 10]
      ],
      output_items: [
        [uranium.getI('titanium-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 1)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 15,
      effects_time: 60,
      craft_time: 360
    },
    { //---------| aluminium
      consumes_items: [
        [uranium.getI('aluminium_round'), 10]
      ],
      output_items: [
        [uranium.getI('aluminium-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 2)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 15,
      effects_time: 60,
      craft_time: 360
    },
    { //---------| fire
      consumes_items: [
        [uranium.getI('fire_round'), 10]
      ],
      output_items: [
        [uranium.getI('fire-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 3)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 15,
      effects_time: 60,
      craft_time: 300
    },
    { //---------| thorium
      consumes_items: [
        [uranium.getI('thorium_round'), 10]
      ],
      output_items: [
        [uranium.getI('thorium-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 4)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 20,
      effects_time: 60,
      craft_time: 420
    },
    { //---------| exp
      consumes_items: [
        [uranium.getI('exp_round'), 10]
      ],
      output_items: [
        [uranium.getI('exp-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 5)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 20,
      effects_time: 60,
      craft_time: 360
    },
    { //---------| altit
      consumes_items: [
        [uranium.getI('altit_round'), 10]
      ],
      output_items: [
        [uranium.getI('altit-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 6)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 30,
      effects_time: 60,
      craft_time: 360
    },
    { //---------| blue-thorium
      consumes_items: [
        [uranium.getI('blue-thorium_round'), 10]
      ],
      output_items: [
        [uranium.getI('blue-thorium-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 7)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 30,
      effects_time: 60,
      craft_time: 420
    },
    { //---------| ultrafast
      consumes_items: [
        [uranium.getI('ultrafast_round'), 10]
      ],
      output_items: [
        [uranium.getI('ultrafast-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 8)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 60,
      effects_time: 60,
      craft_time: 300
    },
    { //---------| uranium
      consumes_items: [
        [uranium.getI('uranium_round'), 10]
      ],
      output_items: [
        [uranium.getI('uranium-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 9)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 40,
      effects_time: 60,
      craft_time: 420
    },
    { //---------| iridium
      consumes_items: [
        [uranium.getI('iridium_round'), 10]
      ],
      output_items: [
        [uranium.getI('iridium-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 10)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 45,
      effects_time: 60,
      craft_time: 480
    },
    { //---------| tritium
      consumes_items: [
        [uranium.getI('tritium_round'), 10]
      ],
      output_items: [
        [uranium.getI('tritium-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 11)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 45,
      effects_time: 60,
      craft_time: 540
    },
    { //---------| iritrium
      consumes_items: [
        [uranium.getI('iritrium_round'), 10]
      ],
      output_items: [
        [uranium.getI('iritrium-magazine'), 1]
      ],
      regions: [
        (t, d) => {
          ammoLoaderDrawer(t, d, 12)
        }
      ],
      progress_effects: [
        'ammo-loader'
      ],
      power: 90,
      effects_time: 60,
      craft_time: 360
    }
  ], "ammo_loader", {});

uranium
  .createMultiCrafter([
    { //---------| firearm
      consumes_items: [
        [uranium.getI('copper', true), 1],
        [uranium.getI('lead', true), 1]
      ],
      output_items: [
        [uranium.getI('firearm_round'), 1]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 0)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 120,
      effects_time: 40,
      craft_time: 30
    },
    { //---------| titanium
      consumes_items: [
        [uranium.getI('copper', true), 1],
        [uranium.getI('titanium', true), 1]
      ],
      output_items: [
        [uranium.getI('titanium_round'), 1]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 1)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 150,
      effects_time: 40,
      craft_time: 40
    },
    { //---------| aluminium
      consumes_items: [
        [uranium.getI('copper', true), 2],
        [uranium.getI('aluminium'), 2]
      ],
      output_items: [
        [uranium.getI('aluminium_round'), 2]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 2)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 180,
      effects_time: 40,
      craft_time: 60
    },
    { //---------| fire
      consumes_items: [
        [uranium.getI('copper', true), 2],
        [uranium.getI('pyratite', true), 1]
      ],
      output_items: [
        [uranium.getI('fire_round'), 2]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 3)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 200,
      effects_time: 40,
      craft_time: 65
    },
    { //---------| fire
      consumes_items: [
        [uranium.getI('copper', true), 1],
        [uranium.getI('sulfur'), 1]
      ],
      output_items: [
        [uranium.getI('fire_round'), 1]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 3)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 220,
      effects_time: 40,
      craft_time: 50
    },
    { //---------| thorium
      consumes_items: [
        [uranium.getI('copper', true), 4],
        [uranium.getI('thorium', true), 3]
      ],
      output_items: [
        [uranium.getI('thorium_round'), 3]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 4)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 260,
      effects_time: 40,
      craft_time: 90
    },
    { //---------| exp
      consumes_items: [
        [uranium.getI('copper', true), 3],
        [uranium.getI('blast-compound', true), 2]
      ],
      output_items: [
        [uranium.getI('exp_round'), 3]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 5)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 240,
      effects_time: 40,
      craft_time: 75
    },
    { //---------| altit
      consumes_items: [
        [uranium.getI('copper', true), 4],
        [uranium.getI('altit'), 2]
      ],
      output_items: [
        [uranium.getI('altit_round'), 2]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 6)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 320,
      effects_time: 40,
      craft_time: 30
    },
    { //---------| blue-thorium
      consumes_items: [
        [uranium.getI('copper', true), 6],
        [uranium.getI('blue_thorium'), 3]
      ],
      output_items: [
        [uranium.getI('blue-thorium_round'), 5]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 7)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 350,
      effects_time: 40,
      craft_time: 120
    },
    { //---------| ultrafast
      consumes_items: [
        [uranium.getI('copper', true), 5],
        [uranium.getI('phase-fabric', true), 1]
      ],
      output_items: [
        [uranium.getI('ultrafast_round'), 5]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 8)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 380,
      effects_time: 40,
      craft_time: 90
    },
    { //---------| uranium
      consumes_items: [
        [uranium.getI('copper', true), 7],
        [uranium.getI('uranium-235'), 2]
      ],
      output_items: [
        [uranium.getI('uranium_round'), 5]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 9)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 400,
      effects_time: 40,
      craft_time: 120
    },
    { //---------| iridium
      consumes_items: [
        [uranium.getI('copper', true), 20],
        [uranium.getI('iridium'), 1]
      ],
      output_items: [
        [uranium.getI('iridium_round'), 10]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 10)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 400,
      effects_time: 40,
      craft_time: 130
    },
    { //---------| tritium
      consumes_items: [
        [uranium.getI('copper', true), 20],
        [uranium.getI('tritium'), 1]
      ],
      output_items: [
        [uranium.getI('tritium_round'), 20]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 11)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 420,
      effects_time: 40,
      craft_time: 180
    },
    { //---------| iritrium
      consumes_items: [
        [uranium.getI('copper', true), 10],
        [uranium.getI('iritrium'), 1]
      ],
      output_items: [
        [uranium.getI('tritium_round'), 7]
      ],
      regions: [
        (t, d) => {
          ammoDrawer(t, d, 12)
        }
      ],
      progress_effects: [
        'ammo-factory-9x18'
      ],
      power: 440,
      effects_time: 40,
      craft_time: 110
    }
  ], "ammo_factory_firearm", {});

uranium
  .createMultiCrafter([
    { //----------| firearm
      consumes_items: [
        [uranium.getI('bronze'), 1],
        [uranium.getI('lead', true), 2]
      ],
      output_items: [
        [uranium.getI('firearm_large_round'), 1]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 0)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 180,
      effects_time: 80,
      craft_time: 70
    },
    { //----------| titanium
      consumes_items: [
        [uranium.getI('bronze'), 2],
        [uranium.getI('titanium', true), 1]
      ],
      output_items: [
        [uranium.getI('titanium_large_round'), 1]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 1)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 200,
      effects_time: 80,
      craft_time: 70
    },
    { //----------| aluminium
      consumes_items: [
        [uranium.getI('bronze'), 2],
        [uranium.getI('aluminium'), 2]
      ],
      output_items: [
        [uranium.getI('aluminium_large_round'), 2]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 2)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 240,
      effects_time: 80,
      craft_time: 110
    },
    { //----------| fire
      consumes_items: [
        [uranium.getI('bronze'), 3],
        [uranium.getI('pyratite', true), 2]
      ],
      output_items: [
        [uranium.getI('fire_large_round'), 2]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 3)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 260,
      effects_time: 80,
      craft_time: 115
    },
    { //----------| fire
      consumes_items: [
        [uranium.getI('bronze'), 2],
        [uranium.getI('sulfur'), 3]
      ],
      output_items: [
        [uranium.getI('fire_large_round'), 1]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 3)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 280,
      effects_time: 80,
      craft_time: 90
    },
    { //----------| thorium
      consumes_items: [
        [uranium.getI('bronze'), 1],
        [uranium.getI('thorium', true), 1]
      ],
      output_items: [
        [uranium.getI('thorium_large_round'), 1]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 4)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 300,
      effects_time: 80,
      craft_time: 85
    },
    { //---------| exp
      consumes_items: [
        [uranium.getI('bronze'), 3],
        [uranium.getI('blast-compound', true), 2]
      ],
      output_items: [
        [uranium.getI('exp_large_round'), 3]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 5)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 270,
      effects_time: 80,
      craft_time: 110
    },
    { //---------| altit
      consumes_items: [
        [uranium.getI('bronze'), 3],
        [uranium.getI('altit'), 2]
      ],
      output_items: [
        [uranium.getI('altit_large_round'), 2]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 6)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 340,
      effects_time: 80,
      craft_time: 100
    },
    { //---------| blue-thorium
      consumes_items: [
        [uranium.getI('bronze'), 4],
        [uranium.getI('blue_thorium'), 2]
      ],
      output_items: [
        [uranium.getI('blue-thorium_large_round'), 3]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 7)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 300,
      effects_time: 80,
      craft_time: 115
    },
    { //---------| ultrafast
      consumes_items: [
        [uranium.getI('bronze'), 3],
        [uranium.getI('phase-fabric', true), 1]
      ],
      output_items: [
        [uranium.getI('ultrafast_large_round'), 2]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 8)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 480,
      effects_time: 80,
      craft_time: 100
    },
    { //---------| uranium
      consumes_items: [
        [uranium.getI('bronze'), 5],
        [uranium.getI('uranium-235'), 2]
      ],
      output_items: [
        [uranium.getI('uranium_large_round'), 3]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 9)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 400,
      effects_time: 80,
      craft_time: 115
    },
    { //---------| iridium
      consumes_items: [
        [uranium.getI('bronze'), 10],
        [uranium.getI('iridium'), 1]
      ],
      output_items: [
        [uranium.getI('iridium_large_round'), 5]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 10)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 460,
      effects_time: 80,
      craft_time: 130
    },
    { //---------| tritium
      consumes_items: [
        [uranium.getI('bronze'), 20],
        [uranium.getI('tritium'), 1]
      ],
      output_items: [
        [uranium.getI('tritium_large_round'), 10]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 11)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 500,
      effects_time: 80,
      craft_time: 200
    },
    { //---------| iritrium
      consumes_items: [
        [uranium.getI('bronze'), 10],
        [uranium.getI('iritrium'), 1]
      ],
      output_items: [
        [uranium.getI('iritrium_large_round'), 5]
      ],
      regions: [
        (t, d) => {
          largeAmmoDrawer(t, d, 12)
        }
      ],
      progress_effects: [
        'ammo-factory-12x108'
      ],
      power: 600,
      effects_time: 80,
      craft_time: 140
    }
  ], "large_round_factory_firearm", {});

uranium
  .createMultiCrafter([
    { //----------| firearm
      consumes_items: [
        [uranium.getI('ART_sleeve'), 1],
        [uranium.getI('lead', true), 3]
      ],
      output_items: [
        [uranium.getI('firearm_ART_round'), 1]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 0)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 360,
      effects_time: 80,
      craft_time: 100
    },
    { //----------| titanium
      consumes_items: [
        [uranium.getI('ART_sleeve'), 1],
        [uranium.getI('titanium', true), 2]
      ],
      output_items: [
        [uranium.getI('titanium_ART_round'), 1]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 1)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 370,
      effects_time: 80,
      craft_time: 95
    },
    { //----------| aluminium
      consumes_items: [
        [uranium.getI('ART_sleeve'), 1],
        [uranium.getI('aluminium'), 2]
      ],
      output_items: [
        [uranium.getI('aluminium_ART_round'), 1]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 2)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 380,
      effects_time: 80,
      craft_time: 90
    },
    { //----------| fire
      consumes_items: [
        [uranium.getI('ART_sleeve'), 2],
        [uranium.getI('pyratite', true), 4]
      ],
      output_items: [
        [uranium.getI('fire_ART_round'), 2]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 3)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 400,
      effects_time: 80,
      craft_time: 175
    },
    { //----------| fire
      consumes_items: [
        [uranium.getI('ART_sleeve'), 1],
        [uranium.getI('sulfur'), 5]
      ],
      output_items: [
        [uranium.getI('fire_ART_round'), 1]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 3)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 600,
      effects_time: 80,
      craft_time: 105
    },
    { //----------| thorium
      consumes_items: [
        [uranium.getI('ART_sleeve'), 2],
        [uranium.getI('thorium', true), 3]
      ],
      output_items: [
        [uranium.getI('thorium_ART_round'), 2]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 4)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 460,
      effects_time: 80,
      craft_time: 180
    },
    { //---------| exp
      consumes_items: [
        [uranium.getI('ART_sleeve'), 3],
        [uranium.getI('blast-compound', true), 4]
      ],
      output_items: [
        [uranium.getI('exp_ART_round'), 3]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 5)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 480,
      effects_time: 80,
      craft_time: 270
    },
    { //---------| altit
      consumes_items: [
        [uranium.getI('ART_sleeve'), 1],
        [uranium.getI('altit'), 2]
      ],
      output_items: [
        [uranium.getI('altit_ART_round'), 2]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 6)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 520,
      effects_time: 80,
      craft_time: 75
    },
    { //---------| blue-thorium
      consumes_items: [
        [uranium.getI('ART_sleeve'), 1],
        [uranium.getI('blue_thorium'), 2]
      ],
      output_items: [
        [uranium.getI('blue-thorium_ART_round'), 1]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 7)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 600,
      effects_time: 80,
      craft_time: 100
    },
    { //---------| ultrafast
      consumes_items: [
        [uranium.getI('ART_sleeve'), 2],
        [uranium.getI('phase-fabric', true), 1]
      ],
      output_items: [
        [uranium.getI('ultrafast_ART_round'), 2]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 8)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 800,
      effects_time: 80,
      craft_time: 120
    },
    { //---------| uranium
      consumes_items: [
        [uranium.getI('ART_sleeve'), 1],
        [uranium.getI('uranium-235'), 2]
      ],
      output_items: [
        [uranium.getI('uranium_ART_round'), 1]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 9)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 600,
      effects_time: 80,
      craft_time: 120
    },
    { //---------| iridium
      consumes_items: [
        [uranium.getI('ART_sleeve'), 3],
        [uranium.getI('iridium'), 1]
      ],
      output_items: [
        [uranium.getI('iridium_ART_round'), 3]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 10)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 740,
      effects_time: 80,
      craft_time: 300
    },
    { //---------| tritium
      consumes_items: [
        [uranium.getI('ART_sleeve'), 4],
        [uranium.getI('tritium'), 1]
      ],
      output_items: [
        [uranium.getI('tritium_ART_round'), 4]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 11)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 760,
      effects_time: 80,
      craft_time: 475
    },
    { //---------| iritrium
      consumes_items: [
        [uranium.getI('ART_sleeve'), 2],
        [uranium.getI('iritrium'), 1]
      ],
      output_items: [
        [uranium.getI('iritrium_ART_round'), 2]
      ],
      regions: [
        (t, d) => {
          artAmmoDrawer(t, d, 12)
        }
      ],
      progress_effects: [
        'ammo-factory-ART'
      ],
      power: 800,
      effects_time: 80,
      craft_time: 200
    }
  ], "ART_factory", {});

