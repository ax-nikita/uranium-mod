//Енергетика
const
  uranium = global.uranium;

uranium
  .createBuild("OreBlock", "uraniumOre", {
    decoration: "rock",
    lightColor: Color.valueOf("77dd77"),
    emitLight: true,
    lightRadius: 60,
    mapColor: Color.valueOf("77dd77")
  });