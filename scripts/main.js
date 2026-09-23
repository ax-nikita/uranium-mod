
let
  uranium = require("uranium");

require("customJSON");

require("liquids");
require("items");
require("ammo");
require("effects");
require("ammoEffects");
require("statusEffects");
require("bullets");
require("createTurret");
require("turretQuality");
require("customBuilds");
require("multiCrafter");

require("rotors");
require("wall");
require("turret");
require("effectBlocks");
require("regenProjectorFix");
require("liquidBlocks");
require("powerAeff");
require("baseCraft");
require("ammocraft");
require("new_texture");
require("uraniumTier");
require("ores");
require("drillBalance");

// Detailed quality information appears only after deliberately hovering the
// world turret for five seconds. Bars and description rows are not hover targets.
if (uranium.qualityUiInitHoverTooltip != undefined) {
  uranium.qualityUiInitHoverTooltip();
}

if (this.uranium_addons != undefined && typeof (this.uranium_addons) == 'object') {
  for (let i = 0; i < this.uranium_addons.length; i++) {
    this.uranium_addons[i](uranium);
  }
}

this.uranium_core = uranium;

//1й тир


