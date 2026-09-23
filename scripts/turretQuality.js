const
  uranium = global.uranium;

uranium.turretQualityColors = [
  'D51700',
  '444444',
  '666666',
  '888888',
  '46AEDE',
  'FF7AC3',
  'FEC424'
];

uranium.turretQualityEffects = [
  'Cursed_effect',
  0,
  0,
  0,
  0,
  0,
  'Legend_effect'
];

// Mindustry v6 exposed Block.buildCost. In v159.7 that field was removed;
// buildTime now uses the same requirements-weighted formula. Recreate the old
// value explicitly so Uranium quality probabilities and min/max cost filters
// keep their original balance semantics.
uranium.getTurretBuildCost = (block) => {
  let cost = 0;
  const requirements = block.requirements;

  if (requirements != undefined) {
    for (let i = 0; i < requirements.length; i++) {
      const stack = requirements[i];
      cost += stack.amount * stack.item.cost;
    }
  }

  return cost * (block.buildCostMultiplier != undefined ? block.buildCostMultiplier : 1);
};

uranium.getTurretQualityChance = (block) => {
  let
    buildCost = Math.sqrt(uranium.getTurretBuildCost(block) / 600);
  return [
    1 * buildCost,
    9 * buildCost,
    15 * buildCost,
    40,
    30 * buildCost,
    8 * buildCost,
    2 * buildCost
  ]
};


uranium.turretQualityGenerate = (block, q) => {
  let
    t,
    baseChance = 0,
    chanceArray = uranium.getTurretQualityChance(block),
    peack,
    checkSumm = 0;

  for (let i = 0; i < chanceArray.length; i++) {
    baseChance += chanceArray[i];
  };

  peack = baseChance * Math.random();

  for (let i = 0; i < chanceArray.length && q == undefined; i++) {
    checkSumm += chanceArray[i];
    if (peack <= checkSumm) {
      q = i;
    }
  };

  let
    turretQualityObj,
    verefy = false,
    verefyRepeator = 1;

  if (q == 4) {
    verefyRepeator = 3;
  } else if (q == 5) {
    verefyRepeator = 2;
  }
  let
    turretQualityKeys = Object.keys(uranium.turretQuality[q]);
  while (!verefy) {
    t = turretQualityKeys[parseInt(Math.random() * turretQualityKeys.length)];
    turretQualityObj = uranium.turretQualityGet(q, t);
    verefy = true;
    if (block.size < turretQualityObj.minSize
      || block.size > turretQualityObj.maxSize
      || uranium.getTurretBuildCost(block) < turretQualityObj.minCost
      || uranium.getTurretBuildCost(block) > turretQualityObj.maxCost
      || (turretQualityObj.personal != undefined && 'uranium-mod-' + turretQualityObj.personal != block.name)
      || (turretQualityObj.turretArt != undefined && turretQualityObj.turretArt != block.art)
      || (turretQualityObj.turretType != undefined && turretQualityObj.turretType != block.getObj().type)
      || (turretQualityObj.typeFastShots != undefined && turretQualityObj.typeFastShots != (block.fastShots != undefined))) {
      verefy = false;
    }
    if (
      verefy == true
      && (
        'uranium-mod-' + turretQualityObj.personal == block.name
        || (turretQualityObj.turretArt != undefined && turretQualityObj.turretArt == block.art)
        || (turretQualityObj.turretType != undefined && turretQualityObj.turretType != block.getObj().type)
        || (turretQualityObj.typeFastShots != undefined && turretQualityObj.typeFastShots == (block.fastShots != undefined))
        || verefyRepeator <= 0
      )
    ) {
      verefy = true;
    } else {
      verefy = false;
      verefyRepeator--;
    }
  }
  return [q, t];
}

uranium.turretQualityGet = (q, t) => {
  let
    obj = {
      name: 'Name',
      reloadMultiplier: 1,
      powerShots: 0,
      powerShotsFactor: 1,
      shield: 1,
      shieldRegen: 1,
      shieldRegenDelay: 1,
      maxHealth: 1,
      extraHealth: 0,
      healthRegen: 0,
      healthRegenFactor: 0,
      expBoost: 1,
      expUpdate: 0,
      upAmmoQuality: 0,
      luck: 0,
      extraSheald: 0,
      armor: 0,
      shotHealth: 0,
      shotDamage: 0,
      shotDamageFactor: 0,
      effect: uranium.turretQualityEffects[q],
      effectDelayTime: 0,
      effectChance: 0.02,
      effectRandomPosition: true,
      reDraw: undefined,
      baseDraw: undefined,
      turretColor: undefined,
      extraBulet: undefined,
      extraBulets: 1,
      extraBuletChance: 0,
      statsBoost: false,
      statsBoostResistStrong: 0,
      statsBoostResistType: undefined,
      statsBoostType: 'good',
      statsBoostRange: 24,
      statsBoostStrong: 1,
      statsBoostEffect: uranium.turretQualityEffects[q],
      statsBoostEffectChance: 0.01,
      statsBoostEffectRandomPositione: true,
      statsBoostShieldExtra: 0,
      statsBoostShieldFactor: 1,
      statsBoostShieldDelay: 1,
      statsBoostShieldRegen: 1,
      statsBoostReloadMultiplier: 1,
      statsBoostHealthExtra: 0,
      statsBoostHealthFactor: 1,
      statsBoostHealthRegen: 0,
      statsBoostHealthRegenFactor: 0,
      statsBoostExp: 1,
      statsBoostExpUpdate: 0,
      statsBoostAmmoQuality: 0,
      statsBoostInfection: false,
      minSize: 0,
      maxSize: 10,
      minCost: 0,
      maxCost: 10000000,
      personal: undefined,
      turretType: undefined,
      turretArt: undefined,
      color: uranium.turretQualityColors[q],
      inaccuracy: 0,
      inaccuracyFactor: 1,
      laserType: undefined,
      evo: undefined,
      evoLvl: 5,
      regionType: '',
      rotateSpeed: 0,
      rotateSpeedFactor: 1,
      fastShots: 0,
      fastShotsDelay: 1,
      fastShotsFactor: 1,
      typeFastShots: undefined
    };

  let
    obj_2 = uranium.turretQuality[q][t],
    keys = Object.keys(obj_2);

  for (let i = 0; i < keys.length; i++) {
    obj[keys[i]] = obj_2[keys[i]];
  }

  obj.color = Color.valueOf(obj.color);
  if (obj.name == 'Prototype') {
    /* let
      allChar = "QWERTYUIOPASDFGHJKLZXCVBNM";

    obj.name = Core.bundle.get("uranium-mod.turretQuality." + obj.name) + " " + allChar[parseInt(Math.random() * allChar.length)] + parseInt(Math.random() * 100) + parseInt(Math.random() * 100);
    print(typeof obj.name); */
    obj.name = Core.bundle.get("uranium-mod.turretQuality." + obj.name);

  } else {
    obj.name = Core.bundle.get("uranium-mod.turretQuality." + obj.name);
  }

  return obj;
}

// Neutral placeholder used only while a newly created building is waiting for
// its authoritative server quality. It must not look or behave like a real roll.
uranium.turretQualityPendingData = () => {
  let obj = uranium.turretQualityGet(4, 0); // structurally complete quality object
  obj.name = '';
  obj.reloadMultiplier = 1;
  obj.maxHealth = 1;
  obj.effect = undefined;
  obj.statsBoostEffect = undefined;
  obj.color = Color.white;
  return obj;
};

function wallDraw(t) {
  t.super$draw();
  let
    size = t.getP().size;
  if (size == 1) {
    Draw.rect('uranium-mod-titan_beton_wall', t.x, t.y);
  } else if (size == 2) {
    Draw.rect('uranium-mod-titan_beton_wall_large', t.x, t.y);
  } else if (size == 3) {
    Draw.rect('uranium-mod-titan_beton_wall_3', t.x, t.y);
  } if (size == 4) {
    Draw.rect('uranium-mod-titan_beton_wall_4', t.x, t.y);
  } if (size == 5) {
    Draw.rect('uranium-mod-titan_beton_wall_3', t.x, t.y);
    let
      x = t.x + 16,
      y = t.y - 16;
    for (let i = 0; i < 5; i++) {
      for (let f = 0; f < 5; f++) {
        if (f == 0 || f == 4 || i == 0 || i == 4) {
          Draw.rect('uranium-mod-titan_beton_wall', x - i * 8, y + f * 8);
        }
      }
    }
  }
  Draw.reset();
};

uranium.createNewTurretQuality = function (q, t, obj) {
  uranium.turretQuality[q][t] = obj;
};

uranium.turretQuality = [
  {//Проклятое 0
    0: {//--Cursed
      name: 'Cursed',
      reloadMultiplier: 1.3,
      maxHealth: 1.5,
      extraHealth: 200,
      shield: 0,
      shotDamageFactor: 0.01,
      shotDamage: 5,
      luck: -100
    },
    1: {//--Hungry
      name: 'Hungry',
      reloadMultiplier: 1.3,
      healthRegen: -20,
      shotHealth: 5,
      luck: -100,
      rotateSpeedFactor: 1.1
    },
    2: {//--Oh_no_its_wall
      name: 'Oh_no_its_wall',
      reloadMultiplier: 0,
      maxHealth: 4,
      reDraw: wallDraw,
      rotateSpeedFactor: 0
    },
    3: {//--Plague
      name: 'Plague',
      maxHealth: 2,
      healthRegen: 5,
      healthRegenFactor: -0.01,
      turretColor: 'D3FFD3',
      statsBoost: true,
      statsBoostHealthFactor: 0.8,
      statsBoostEffect: 'radiation_effect',
      statsBoostStrong: 10,
      statsBoostRange: 8,
      statsBoostType: 'bad',
      luck: -100,
      statsBoostInfection: true
    },
    4: {//--War
      name: 'War',
      maxHealth: 1.8,
      reloadMultiplier: 1.45,
      healthRegen: -20,
      shotDamage: 20,
      luck: -100,
      extraSheald: -3000,
      expBoost: 1.1,
      powerShotsFactor: 2.25,
      upAmmoQuality: 1,
      rotateSpeedFactor: 0.8
    },
    5: {//--Dead
      name: 'Dead',
      maxHealth: 1.3,
      reloadMultiplier: 0.1,
      upAmmoQuality: -2,
      healthRegen: -10,
      extraBulet: uranium.getBullet('dead-bird'),
      extraBuletChance: 0.8,
      extraBulets: 3,
      minCost: 550
    }
  },
  {//Оч плохо 1
    0: {//--Broken
      name: 'Broken',
      reloadMultiplier: 0.8,
      maxHealth: 0.6,
      powerShotsFactor: 0,
      shield: 0.6,
      rotateSpeedFactor: 0.5
    },
    1: {//--Bad_barrel
      name: 'Bad_barrel',
      reloadMultiplier: 0.75,
      upAmmoQuality: -2
    },
    2: {//--Shield_only
      name: 'Shield_only',
      maxHealth: 0.1,
      extraHealth: -3000,
      extraSheald: 400,
    },
    3: {//--Fragile
      name: 'Fragile',
      maxHealth: 0.5,
      shield: 0.5,
      extraSheald: -200,
      extraHealth: -200,
      rotateSpeedFactor: 0.2
    }
  },
  {//Плохо 2
    0: {//--Bad
      name: 'Bad',
      reloadMultiplier: 0.9,
      maxHealth: 0.9,
      shield: 0.7,
      rotateSpeed: -1
    },
    1: {//--Wihout_a_shield
      name: 'Wihout_a_shield',
      shield: 0
    },
    2: {//--Delayed
      name: 'Delayed',
      reloadMultiplier: 0.9,
      shieldRegen: 0.5,
      shieldRegenDelay: 1.5,
      powerShotsFactor: 0.5,
      rotateSpeedFactor: 0.25
    },
    3: {//--Corrosion
      name: 'Corrosion',
      healthRegen: -10,
      reloadMultiplier: 0.95,
      turretColor: 'D8F5D8',
      effect: 'radiation_effect',
      effectChance: 0.006
    },
    4: {//--Silly
      name: 'Silly',
      expBoost: 0.75,
    },
    5: {//--Independent
      name: 'Independent',
      statsBoostResistStrong: 100
    },
    6: {//--Broken_sight
      name: 'Broken_sight',
      inaccuracyFactor: 3,
      inaccuracy: 1
    },
    7: {//--Reduced_ammunition
      name: 'Reduced_ammunition',
      typeFastShots: true,
      inaccuracyFactor: 2,
      fastShotsFactor: 0.75
    }
  },
  {//Обычн 3
    0: {
      name: 'Common',
      evo: 4,
      expBoost: 0.4,
      evoLvl: 2,
      regionType: 'legend'
    }
  },
  {//Хор 4
    0: {//--Good 0
      name: 'Good',
      reloadMultiplier: 1.1,
      maxHealth: 1.1,
    },
    1: {//--Presisten 1
      name: 'Presisten',
      maxHealth: 1.2,
      extraHealth: 200
    },
    2: {//--Easli_teach 2
      name: 'Easli_teach',
      expBoost: 1.4,
    },
    3: {//--Lucky 3
      name: 'Lucky',
      luck: 10
    },
    4: {//--Sturdy_shield 4
      name: 'Sturdy_shield',
      extraSheald: 100,
      shield: 1.3
    },
    5: {//--Quick_start 5
      name: 'Quick_start',
      extraSheald: 200,
      extraHealth: 300,
      expBoost: 1.1
    },
    6: {//--Nanobots 6
      name: 'Nanobots',
      shieldRegen: 1.2,
      shieldRegenDelay: 0.9,
      healthRegen: 15,
      statsBoost: true,
      minSize: 2,
      statsBoostHealthFactor: 1.05,
      statsBoostShieldRegen: 1.05,
      statsBoostHealthRegen: 15,
      effect: 'nanobots',
      effectChance: 0.0069,
      statsBoostEffect: 'nanobots',
      statsBoostStrong: 1,
      statsBoostEffectChance: 0.00575
    },
    7: {//--Pure_blood 7
      name: 'Pure_blood',
      healthRegen: 20,
      powerShotsFactor: 1.2,
      statsBoostResistType: 'bad'
    },
    8: {//--Self_learning 8
      name: 'Self_learning',
      expUpdate: 2
    },
    9: {//--Mustang_mk2 9
      name: 'Mustang_mk2',
      maxHealth: 1.1,
      reloadMultiplier: 1.15,
      shield: 1.2,
      upAmmoQuality: 1,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '21_auto_turret_mustang',
      statsBoostResistStrong: 20,
      evo: [5, 5],
      evoLvl: 10
    },
    10: {//--Minsk_mk2 10
      name: 'Minsk_mk2',
      maxHealth: 1.1,
      reloadMultiplier: 1.2,
      extraSheald: 200,
      shield: 1.2,
      upAmmoQuality: 1,
      expUpdate: 1,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '32_auto_turret_scat',
      evo: [5, 16],
      evoLvl: 10,
      statsBoostResistStrong: 20
    },
    11: {//--Rels_mk2 11
      name: 'Rels_mk2',
      maxHealth: 1.2,
      reloadMultiplier: 1.3,
      extraSheald: 100,
      shield: 1.2,
      expUpdate: 1,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '22_air_turret_rels',
      statsBoostResistStrong: 20,
      evo: [5, 8],
      evoLvl: 10,
      rotateSpeedFactor: 1.1
    },
    12: {//--Accurate 12
      name: 'Accurate',
      inaccuracyFactor: 0.5,
      inaccuracy: -5,
      rotateSpeedFactor: 0.9
    },
    13: {//--Prototype 13
      name: 'Prototype',
      inaccuracyFactor: 1.5,
      reloadMultiplier: 1.05,
      regionType: 'proto',
      evo: 5
    },
    14: {//--Prototype 14
      name: 'Prototype',
      inaccuracyFactor: 0.5,
      reloadMultiplier: 0.95,
      regionType: 'proto',
      evo: 5
    },
    15: {//--Zvezda_mk2 15
      name: 'Zvezda_mk2',
      maxHealth: 1.2,
      reloadMultiplier: 1.2,
      shield: 1.2,
      expUpdate: 1,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '35_laser_turret_zvezda',
      statsBoostResistStrong: 20,
      evo: [5, 13],
      evoLvl: 10
    },
    16: {//--Anaconda_mk2 16
      name: 'Anaconda_mk2',
      maxHealth: 1.1,
      reloadMultiplier: 1.15,
      extraSheald: 300,
      shield: 1.15,
      expUpdate: 1,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '33_snap_turret_anaconda',
      statsBoostResistStrong: 20,
      evo: [5, 14],
      evoLvl: 10
    },
    17: {//--Voshod_mk2 17
      name: 'Voshod_mk2',
      maxHealth: 1.2,
      reloadMultiplier: 1.1,
      extraSheald: 400,
      shield: 1.2,
      expUpdate: 1,
      inaccuracyFactor: 0.7,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '34_hard_auto_turret_voshod',
      statsBoostResistStrong: 20,
      evo: [5, 15],
      evoLvl: 10
    },
    18: {//--Extended_ammunition 18
      name: 'Extended_ammunition',
      typeFastShots: true,
      reloadMultiplier: 1.1,
      fastShotsFactor: 1.2
    },
    19: {//--Clen_mk2 19
      name: 'Clen_mk2',
      maxHealth: 1.3,
      reloadMultiplier: 1.1,
      extraSheald: 200,
      shield: 1.2,
      expUpdate: 1,
      inaccuracyFactor: 0.8,
      regionType: 'mk2',
      fastShots: 1,
      fastShotsDelay: 0.8,
      color: uranium.turretQualityColors[5],
      personal: '37_ART_Clen',
      statsBoostResistStrong: 20,
      evo: [5, 18],
      evoLvl: 10
    },
    20: {//--Ceklon_mk2 20
      name: 'Ceklon_mk2',
      maxHealth: 1.2,
      reloadMultiplier: 1.1,
      extraSheald: 100,
      shield: 1.2,
      expUpdate: 1,
      inaccuracyFactor: 0.8,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '25_auto_turret_ceklon',
      statsBoostResistStrong: 20,
      evo: [5, 19],
      evoLvl: 10
    },
    21: {//--Udav_mk2 21
      name: 'Udav_mk2',
      maxHealth: 1.2,
      reloadMultiplier: 1.15,
      extraSheald: 100,
      shield: 1.2,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '23_auto_turret_udav',
      statsBoostResistStrong: 20,
      evo: [5, 20],
      evoLvl: 10
    },
    22: {//--Cobra_mk2 22
      name: 'Cobra_mk2',
      maxHealth: 1.2,
      reloadMultiplier: 1.15,
      extraSheald: 200,
      shield: 1.1,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '26_snap_turret_cobra',
      statsBoostResistStrong: 20,
      evo: [5, 21],
      evoLvl: 10
    },
    23: {//--Mole_mk2 23
      name: 'Mole_mk2',
      maxHealth: 1.3,
      reloadMultiplier: 1.1,
      extraSheald: 100,
      shield: 1.1,
      regionType: 'mk2',
      fastShots: 5,
      inaccuracyFactor: 0.9,
      color: uranium.turretQualityColors[5],
      personal: '24_hard_auto_turret',
      statsBoostResistStrong: 20,
      evo: [5, 22],
      evoLvl: 10
    },
    24: {//--Dalh_mk2 24
      name: 'Dalh_mk2',
      maxHealth: 1.2,
      extraSheald: 300,
      shield: 1.2,
      regionType: 'mk2',
      color: uranium.turretQualityColors[5],
      personal: '36_laser_turret_dalh',
      statsBoostResistStrong: 20,
      rotateSpeedFactor: 1.5,
      evo: [5, 23],
      evoLvl: 10
    }
  },
  {//Качественный 5
    0: {//--Accelerated 0
      name: 'Accelerated',
      reloadMultiplier: 1.3,
      shieldRegen: 2,
      shieldRegenDelay: 0.75,
      powerShotsFactor: 1.25,
      statsBoostResistStrong: 10,
      rotateSpeedFactor: 1.5
    },
    1: {//--Qualitative 1
      name: 'Qualitative',
      reloadMultiplier: 1.15,
      maxHealth: 1.2,
      shield: 1.2,
      upAmmoQuality: 1,
      regionType: 'mk2',
      statsBoostResistStrong: 10,
      rotateSpeedFactor: 1.1
    },
    2: {//--Grenadier 2
      name: 'Grenadier',
      maxHealth: 1.3,
      reloadMultiplier: 0.9,
      upAmmoQuality: -1,
      extraBulet: uranium.getBullet('turret-granade'),
      extraBuletChance: 0.4,
      statsBoostResistStrong: 10,
      rotateSpeedFactor: 0.8
    },
    3: {//--Modified_barrel 3
      name: 'Modified_barrel',
      reloadMultiplier: 1.25,
      powerShotsFactor: 1.5,
      upAmmoQuality: 1,
      statsBoostResistStrong: 10,
      turretType: 'ItemTurret'
    },
    4: {//--Armored 4
      name: 'Armored',
      armor: 15,
      maxHealth: 1.25,
      extraSheald: 150,
      shield: 1.25,
      statsBoostResistStrong: 10,
      rotateSpeedFactor: 0.8
    },
    5: {//--Mustang_mk3 5
      name: 'Mustang_mk3',
      maxHealth: 1.2,
      reloadMultiplier: 1.3,
      extraSheald: 100,
      shield: 1.3,
      upAmmoQuality: 1,
      regionType: 'mk3',
      inaccuracyFactor: 0.5,
      color: uranium.turretQualityColors[6],
      personal: '21_auto_turret_mustang',
      effect: uranium.turretQualityEffects[6],
      statsBoostResistStrong: 20
    },
    6: {//--Improved_nanobots 6
      name: 'Improved_nanobots',
      shieldRegen: 1.3,
      shieldRegenDelay: 0.7,
      healthRegen: 30,
      statsBoost: true,
      minSize: 2,
      statsBoostHealthFactor: 1.1,
      statsBoostShieldRegen: 1.1,
      statsBoostHealthRegen: 30,
      effect: 'nanobots-improved',
      effectChance: 0.01275,
      statsBoostEffect: 'nanobots-improved',
      statsBoostStrong: 12,
      statsBoostEffectChance: 0.0085
    },
    7: {//--Teacher 7
      name: 'Teacher',
      statsBoost: true,
      minSize: 2,
      effect: 'teach',
      statsBoostExp: 1.2,
      statsBoostExpUpdate: 0.75,
      statsBoostEffect: 'teach',
      statsBoostStrong: 11,
      statsBoostEffectChance: 0.005
    },
    8: {//--Rels_mk3 8
      name: 'Rels_mk3',
      maxHealth: 1.2,
      reloadMultiplier: 1.3,
      extraSheald: 200,
      shield: 1.2,
      expBoost: 1.1,
      regionType: 'mk3',
      luck: 10,
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '22_air_turret_rels',
      statsBoostResistStrong: 20,
      rotateSpeedFactor: 1.2
    },
    9: {//--Frost_laser 9
      name: 'Frost_laser',
      maxHealth: 1.1,
      extraSheald: 200,
      shield: 1.2,
      expBoost: 1.1,
      turretType: 'LaserTurret',
      laserType: 'frost',
      statsBoostResistStrong: 10
    },
    10: {//--Rad_laser 10
      name: 'Rad_laser',
      turretType: 'LaserTurret',
      laserType: 'rad',
      statsBoostResistStrong: 10
    },
    11: {//--Prototype 11
      name: 'Prototype',
      reloadMultiplier: 1.05,
      minSize: 2,
      extraSheald: 100,
      evo: 6,
      evoLvl: 10,
      rotateSpeedFactor: 1.2,
      regionType: 'proto'
    },
    12: {//--Pure_plasm 12
      name: 'Pure_plasm',
      turretType: 'PowerTurret',
      laserType: 'pure_plasm',
      regionType: 'mk2',
      statsBoostResistStrong: 10
    },
    13: {//--Zvezda_mk3 13
      name: 'Zvezda_mk3',
      maxHealth: 1.3,
      reloadMultiplier: 1.2,
      regionType: 'mk3',
      laserType: 'zvezda_legend',
      color: uranium.turretQualityColors[6],
      personal: '35_laser_turret_zvezda',
      statsBoostResistStrong: 20
    },
    14: {//--Anaconda_mk3 14
      name: 'Anaconda_mk3',
      maxHealth: 1.2,
      reloadMultiplier: 1.25,
      extraSheald: 400,
      shield: 1.2,
      expBoost: 1.1,
      regionType: 'mk3',
      luck: 10,
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '33_snap_turret_anaconda',
      statsBoostResistStrong: 20
    },
    15: {//--Voshod_mk3 15
      name: 'Voshod_mk3',
      maxHealth: 1.3,
      reloadMultiplier: 1.25,
      extraSheald: 500,
      shield: 1.3,
      inaccuracyFactor: 0.5,
      regionType: 'mk3',
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '34_hard_auto_turret_voshod',
      statsBoostResistStrong: 20,
    },
    16: {//--Minsk_mk3 16
      name: 'Minsk_mk3',
      maxHealth: 1.2,
      reloadMultiplier: 1.25,
      extraSheald: 100,
      shield: 1.2,
      regionType: 'mk3',
      inaccuracyFactor: 0.5,
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '32_auto_turret_scat',
      statsBoostResistStrong: 20
    },
    17: {//--Improved_loader_magazine 17
      name: 'Improved_loader_magazine',
      typeFastShots: true,
      reloadMultiplier: 1.2,
      maxHealth: 1.2,
      fastShotsFactor: 1.4,
      fastShotsDelay: 0.8
    },
    18: {//--Clen_mk3 18
      name: 'Clen_mk3',
      maxHealth: 1.4,
      reloadMultiplier: 1.2,
      extraSheald: 300,
      shield: 1.2,
      expUpdate: 2,
      inaccuracyFactor: 0.5,
      regionType: 'mk3',
      fastShots: 2,
      fastShotsDelay: 0.5,
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '37_ART_Clen',
      statsBoostResistStrong: 20
    },
    19: {//--Ceklon_mk3 19
      name: 'Ceklon_mk3',
      maxHealth: 1.3,
      reloadMultiplier: 1.2,
      extraSheald: 200,
      shield: 1.3,
      expUpdate: 1,
      inaccuracyFactor: 0.6,
      regionType: 'mk3',
      rotateSpeedFactor: 1.3,
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '25_auto_turret_ceklon',
      statsBoostResistStrong: 20
    },
    20: {//--Udav_mk3 20
      name: 'Udav_mk3',
      maxHealth: 1.3,
      reloadMultiplier: 1.25,
      extraSheald: 200,
      shield: 1.2,
      regionType: 'mk3',
      rotateSpeedFactor: 1.3,
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '23_auto_turret_udav',
      statsBoostResistStrong: 20
    },
    21: {//--Cobra_mk3 21
      name: 'Cobra_mk3',
      maxHealth: 1.35,
      reloadMultiplier: 1.25,
      extraSheald: 300,
      shield: 1.1,
      regionType: 'mk3',
      rotateSpeedFactor: 1.2,
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '26_snap_turret_cobra',
      statsBoostResistStrong: 20
    },
    22: {//--Mole_mk3 22
      name: 'Mole_mk3',
      maxHealth: 1.4,
      reloadMultiplier: 1.15,
      extraSheald: 200,
      shield: 1.2,
      regionType: 'mk3',
      fastShots: 10,
      inaccuracyFactor: 0.75,
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '24_hard_auto_turret',
      statsBoostResistStrong: 20
    },
    23: {//--Dalh_mk3 23
      name: 'Dalh_mk3',
      maxHealth: 1.3,
      extraHealth: 150,
      extraSheald: 300,
      shield: 1.3,
      regionType: 'mk3',
      color: uranium.turretQualityColors[6],
      effect: uranium.turretQualityEffects[6],
      personal: '36_laser_turret_dalh',
      rotateSpeedFactor: 2,
      statsBoostResistStrong: 20
    }
  },
  {//--Шедевр 6
    0: {//--Masteroiece 0
      name: 'Masteroiece',
      reloadMultiplier: 1.3,
      maxHealth: 1.35,
      shield: 1.3,
      regionType: 'mk3',
      extraSheald: 200,
      upAmmoQuality: 1,
      expBoost: 0.8,
      powerShotsFactor: 1.4,
      statsBoostResistStrong: 30,
      rotateSpeedFactor: 1.2,
      fastShotsDelay: 0.8,
      fastShotsFactor: 1.2
    },
    1: {//--Gold 1
      name: 'Gold',
      reloadMultiplier: 1.2,
      extraHealth: 200,
      shield: 1.5,
      turretColor: 'FFC529',
      extraBulet: uranium.getBullet('gold-bird'),
      regionType: 'mk3',
      luck: 13,
      statsBoostResistStrong: 30,
      rotateSpeedFactor: 0.75
    },
    2: {//--Holy_grenadier 2
      name: 'Holy_grenadier',
      maxHealth: 1.35,
      extraSheald: 150,
      reloadMultiplier: 0.3,
      upAmmoQuality: -3,
      extraBulet: uranium.getBullet('turret-holy-granade'),
      luck: 5,
      extraBuletChance: 0.15,
      statsBoostResistStrong: 30,
      rotateSpeedFactor: 0.5
    },
    3: {//--Emperors_Shield 3
      name: "Emperors_Shield",
      maxHealth: 1.35,
      shield: 1.5,
      extraSheald: 300,
      armor: 5,
      statsBoost: true,
      statsBoostShieldExtra: 100,
      statsBoostShieldFactor: 1.2,
      statsBoostShieldRegen: 3,
      statsBoostStrong: 31,
      effect: 'Emperors Shield',
      effectRandomPosition: false,
      regionType: 'mk3',
      effectDelayTime: 89,
      minSize: 2,
      maxSize: 3,
      statsBoostResistStrong: 30,
      rotateSpeedFactor: 0.75
    },
    4: {//--Battle_comrade 4
      name: "Battle_comrade",
      maxHealth: 1.3,
      reloadMultiplier: 1.1,
      statsBoost: true,
      statsBoostAmmoQuality: 1,
      statsBoostShieldFactor: 1.25,
      statsBoostStrong: 21,
      statsBoostReloadMultiplier: 1.1,
      statsBoostExp: 1.2,
      minSize: 2,
      minCost: 700,
      statsBoostResistStrong: 30,
      evo: [6, 9],
      evoLvl: 15
    },
    5: {//--Rinbow_laser 5
      name: "Rinbow_laser",
      maxHealth: 1.3,
      expBoost: 1.1,
      turretType: 'LaserTurret',
      laserType: 'random',
      regionType: 'mk3',
      shield: 1.1,
      extraSheald: 300,
      statsBoostResistStrong: 30,
      rotateSpeedFactor: 1.1
    },
    6: {//--Proc_exp 6
      name: "Proc_exp",
      maxHealth: 1.2,
      expBoost: 1.6,
      expUpdate: 2,
      shield: 1.2,
      statsBoostResistStrong: 30
    },
    7: {//--Eternal 7
      name: "Eternal",
      maxHealth: 1.6,
      shield: 1.4,
      shotHealth: 5,
      regionType: 'mk3',
      healthRegenFactor: 0.05,
      statsBoostResistStrong: 30
    },
    8: {//--Legendary_loader_magazine 8
      name: 'Legendary_loader_magazine',
      typeFastShots: true,
      reloadMultiplier: 1.25,
      regionType: 'mk3',
      maxHealth: 1.2,
      shield: 1.3,
      fastShotsFactor: 1.6,
      fastShotsDelay: 0.6
    },
    9: {//--Veteran 9
      name: 'Veteran',
      typeFastShots: true,
      reloadMultiplier: 0.8,
      maxHealth: 0.9,
      healthRegenFactor: 0.05,
      expUpdate: 10,
      expBoost: 2,
      minSize: 2,
      minCost: 800,
      statsBoost: true,
      statsBoostAmmoQuality: 2,
      statsBoostShieldFactor: 1.2,
      statsBoostStrong: 32,
      statsBoostReloadMultiplier: 1.1,
      statsBoostExpUpdate: 0.8,
      statsBoostExp: 1.2,
      statsBoostResistStrong: 30
    }
  }
]