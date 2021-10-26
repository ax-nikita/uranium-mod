const
  uranium = global.uranium;

let
  radiation = uranium.createStatusEffect('radiation', {
    damage: 0.2,
    speedMultiplier: 1.2,
    color: Color.valueOf("12F134"),
    transitionDamage: 25,
    effect: uranium.getEffect('radiation_effect')
  }).const;

let
  thorium_fire = uranium.createStatusEffect('thorium_fire', {
    damage: 0.1,
    speedMultiplier: 1.2,
    color: Color.valueOf("12F134"),
    transitionDamage: 25,
    effect: uranium.getEffect('radiation_effect')
  }).const;
//radiation.opposites.add(StatusEffects.burning);
radiation.affinities.add(thorium_fire);