const
  uranium = global.uranium;

for (let i = 0; i < uranium.ammo_types.length; i++) {
  let
    ammoName = uranium.ammo_types[i],
    color = Color.valueOf(uranium.ammo_colors[i]);
  uranium.createItem(ammoName + '_round', {
    color: color
  });

  uranium.createItem(ammoName + '-magazine', {
    color: color,
    explosiveness: 0.15
  });

  uranium.createItem(ammoName + '_large_round', {
    color: color,
    explosiveness: 0.1
  });

  uranium.createItem(ammoName + '_ART_round', {
    color: color,
    explosiveness: 0.2
  });
};