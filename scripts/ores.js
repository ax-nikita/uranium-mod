// Ore environment VFX — compatibility-safe 159.7 path.
// IMPORTANT: never override drawBase() here. Floor/OreBlock drawBase is executed while
// map/save floor caches are rebuilt, so cosmetic VFX must stay in render/update paths.
const uranium = global.uranium;

const uraniumOreGlow = Color.valueOf('A3D63B');

uranium
  .createBuild("OreBlock", "uraniumOre", {
    // No permanent tile light. Uranium ore illumination comes exclusively from motes.
    emitLight: false,
    lightRadius: 0,
    lightColor: Color.valueOf('00000000'),
    mapColor: Color.valueOf('4D9956'),

    updateRender(tile) {
      return true;
    },

    renderUpdate(state) {
      if (Vars.headless || state == null || state.tile == null || Core.camera == null) return;

      const tile = state.tile,
        wx = tile.worldx(),
        wy = tile.worldy(),
        cam = Core.camera,
        margin = 24;

      // updateRender states exist for every uranium ore tile; only create VFX near camera.
      if (Math.abs(wx - cam.position.x) > cam.width * 0.5 + margin ||
          Math.abs(wy - cam.position.y) > cam.height * 0.5 + margin) return;

      const seed = tile.pos(),
        // Keep the established low density and per-emission random timing.
        spacing = 225 + Math.abs(seed % 81);

      // 4.07: do not make a newly visible uranium deposit wait a full ambient cycle.
      // The old zero-state started near 0 and therefore needed ~225-305 ticks before
      // the first mote. Seeded 1..18 tick warm-up makes fly-bys readable immediately
      // while staggering neighboring ore tiles and preserving the normal cadence later.
      if (state.data == 0) {
        const firstDelay = 1 + Math.abs((seed * 31) % 18);
        state.data = spacing - firstDelay;
      }
      state.data += Time.delta;
      if (state.data < spacing) return;

      // After the first emission, return to the established sparse/random cadence.
      state.data = Mathf.range(55);

      const phase = Time.time * 0.002 + Math.abs(seed % 997) * 0.013,
        orbit = 0.7 + 2.7 * (0.5 + 0.5 * Math.sin(phase)),
        angle = ((Math.abs(seed * 37) % 360) + Time.time * 0.09) % 360,
        px = wx + Angles.trnsx(angle, orbit),
        py = wy + Angles.trnsy(angle, orbit),
        spawnAngle = angle + Mathf.random(-8, 8);

      uranium.getEffect('uranium-ore-radiation-mote').at(px, py, spawnAngle, uraniumOreGlow);
    }
  });
