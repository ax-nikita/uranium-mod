const
  uranium = global.uranium;

uranium
  .createEffect('9x18-shot', 10, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(Color.valueOf("dd0134"), e.color, e.fslope());
    Draw.alpha(0.55);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 5);
    Draw.color(Color.valueOf("ffFFFF"), Color.valueOf("ffcccc"), e.color, e.fin());
    Draw.alpha(0.7);
    Angles.randLenVectors(e.id, 7, e.finpow() * 20, e.rotation, 15, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.35 + e.fout() * 0.35);
    })
  })

uranium
  .createEffect('12x108-shot', 15, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(Color.valueOf("dd0134"), Color.valueOf("ffD7CA"), e.fslope());
    Draw.alpha(0.60);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 5);
    Draw.color(Color.valueOf("ffffff"), Color.valueOf("ffcccc"), Color.valueOf("ff0000"), e.fin());
    Draw.alpha(0.7);
    Angles.randLenVectors(e.id, 14, e.finpow() * 20, e.rotation, 20, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.37 + e.fout() * 0.37);
    })
  })

uranium
  .createEffect('ammo-loader', 50, (e) => {
    let
      f = 2.6 - (e.fin() * 2.6);
    Draw.color(e.color);
    Fill.square(e.x + f, e.y - f, 0.5, e.fin() * 90);
    Fill.square(e.x + f, e.y + f, 0.5, e.fin() * 90);
    Fill.square(e.x - f, e.y + f, 0.5, -e.fin() * 90);
    Fill.square(e.x - f, e.y - f, 0.5, -e.fin() * 90);
  });

uranium
  .createEffect('ammo-factory-9x18', 100, (e) => {
    Draw.color(e.color, e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 3);
    Draw.color(e.color, Color.valueOf("ffcc55"), e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 2);
    Draw.color(e.color, Color.valueOf("ffcd33"), e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 1);
  })

uranium
  .createEffect('ammo-factory-12x108', 200, (e) => {

    let
      f = 5,
      d = 1.5;
    Draw.color(e.color, e.fin());
    Fill.circle(e.x + f, e.y + f, e.fslope() * d);
    Fill.circle(e.x + f, e.y - f, e.fslope() * d);
    Fill.circle(e.x - f, e.y + f, e.fslope() * d);
    Fill.circle(e.x - f, e.y - f, e.fslope() * d);

    d = 1;

    Draw.color(e.color, Color.valueOf("ffcd33"), e.fin());
    Fill.circle(e.x + f, e.y + f, e.fslope() * d);
    Fill.circle(e.x + f, e.y - f, e.fslope() * d);
    Fill.circle(e.x - f, e.y + f, e.fslope() * d);
    Fill.circle(e.x - f, e.y - f, e.fslope() * d);

    //Drawf.tri(e.x, e.y, 10 * e.fout(), 10, e.fslope());

    Draw.color(e.color, e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 2.5);
    Draw.color(e.color, Color.valueOf("ffcc55"), e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 1.5);
    Draw.color(e.color, Color.valueOf("ffcd33"), e.fin());
    Fill.circle(e.x, e.y, e.fslope() * 1);
  })

uranium
  .createEffect('ammo-factory-ART', 200, (e) => {

    let
      f = 6.6,
      d = 4;
    Draw.color(e.color, e.fin());
    Fill.circle(e.x + f, e.y + f, e.fslope() * d);
    Fill.circle(e.x + f, e.y - f, e.fslope() * d);
    Fill.circle(e.x - f, e.y + f, e.fslope() * d);
    Fill.circle(e.x - f, e.y - f, e.fslope() * d);

    d = 2;

    Draw.color(e.color, Color.valueOf("ffcd33"), e.fin());
    Fill.circle(e.x + f, e.y + f, e.fslope() * d);
    Fill.circle(e.x + f, e.y - f, e.fslope() * d);
    Fill.circle(e.x - f, e.y + f, e.fslope() * d);
    Fill.circle(e.x - f, e.y - f, e.fslope() * d);

    //Drawf.tri(e.x, e.y, 10 * e.fout(), 10, e.fslope());
  })

uranium
  .createEffect('thorium-ammo-blaze', 100, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(Color.valueOf("00FFFF"), Color.valueOf("00FFFF"), e.fslope());
    Draw.alpha(0.55);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 1);
    Draw.color(Color.valueOf("00FFFF"), Color.valueOf("00FFFF"), Color.valueOf("FFFFFF"), e.fin());
    Draw.alpha(0.7);
    Angles.randLenVectors(e.id, 7, e.finpow() * 20, e.rotation, 15, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.35 + e.fout() * 0.35);
    })
  })

uranium
  .createEffect('thorium-ammo-blaze-big', 150, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(Color.valueOf("00FFFF"), Color.valueOf("00FFFF"), e.fslope());
    Draw.alpha(0.55);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 1.3);
    Draw.color(Color.valueOf("00FFFF"), Color.valueOf("00FFFF"), Color.valueOf("FFFFFF"), e.fin());
    Draw.alpha(0.7);
    Angles.randLenVectors(e.id, 15, e.finpow() * 30, e.rotation, 20, (x, y) => {
      Fill.circle(e.x + x, e.y + y, 0.35 + e.fout() * 0.4);
    })
  })

uranium
  .createEffect('iritrium-despawn', 10, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(Color.valueOf("E9FE31"), Color.valueOf("FFFFFF"), e.fslope());
    Draw.alpha(0.30);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 25);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 15);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 5);
    Draw.color(Color.valueOf("E9FE31"));
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 1);
  })

uranium
  .createEffect('iritrium-despawn-big', 15, (e) => {
    let
      rot1 = e.rotation - 90;
    Draw.color(Color.valueOf("E9FE31"), Color.valueOf("FFFFFF"), e.fslope());
    Draw.alpha(0.30);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 45);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 25);
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 15);
    Draw.color(Color.valueOf("E9FE31"));
    Fill.circle(e.x + Math.sin(rot1 / 180 * Math.PI), e.y - Math.cos(rot1 / 180 * Math.PI), e.fslope() * 3);
  })

uranium
  .createEffect('laser-track', 20, (e) => {
    Draw.z(50);
    Draw.color(Color.valueOf("CCCCCC"), e.color, e.fout());
    Draw.alpha(0.04 * e.fout());
    Fill.circle(e.x, e.y, 5 * e.fout());
    Fill.circle(e.x, e.y, 3 * e.fout());
    Draw.color(e.color, Color.valueOf("CCCCCC"), e.fout());
    Fill.circle(e.x, e.y, 1.5 * e.fout());
  })

uranium
  .createEffect('sheald_up', 120, (e) => {
    Draw.color(e.color);
    Draw.alpha(e.fout());
    Draw.rect(Core.atlas.find('uranium-mod-sheald_up'), e.x, e.y);
  })

uranium
  .createEffect('sheald_down', 180, (e) => {
    Draw.color(Color.valueOf("FF0000"));
    Draw.alpha(e.fout() * 10 % 2 - 0.3);
    Draw.rect(Core.atlas.find('uranium-mod-sheald_down'), e.x, e.y);
  })


uranium
  .createEffect('level_up', 120, (e) => {
    Draw.color(e.color);
    Draw.alpha(e.fout());
    Draw.rect(Core.atlas.find('uranium-mod-level_up'), e.x, e.y - 1 + e.fin() * 8);
  })

uranium
  .createEffect('exploz_30x173', 70, (e) => {
    Draw.color(e.color, Color.valueOf("FF9d36"), e.finpow());
    Draw.alpha(1 - e.finpow());
    Fill.circle(e.x, e.y, 5 * e.finpow() + 3);
    Fill.circle(e.x, e.y, 7 * e.finpow());
    Angles.randLenVectors(e.id, 17, 5 + 35 * e.finpow(), (x, y) => {
      Draw.color(e.color, Color.valueOf("FFdd66"), e.fout());
      Draw.alpha(e.fout() + 0.5);
      Fill.circle(e.x + x, e.y + y, 0.2 + e.fout() * 1.5);
    });
  })

uranium
  .createEffect('napalm_30x173', 70, (e) => {
    Draw.color(Color.valueOf("FF5536"), Color.valueOf("FF9d36"), e.finpow());
    Draw.alpha(1 - e.finpow());
    Fill.circle(e.x, e.y, 8 * e.finpow() + 3);
    Fill.circle(e.x, e.y, 13 * e.finpow());
    Angles.randLenVectors(e.id, 19, 5 + 35 * e.finpow(), (x, y) => {
      Draw.color(Color.valueOf("FF9d36"), Color.valueOf("FF5536"), e.fout());
      Draw.alpha(e.fout() + 0.5);
      Fill.circle(e.x + x, e.y + y, 0.2 + e.fout() * 1.5);
    });
  })

uranium
  .createEffect('radiation_effect', 90, (e) => {
    Angles.randLenVectors(e.id, 2, 1 + 4 * e.finpow(), (x, y) => {
      Draw.color(Color.valueOf("2Ffd36"), Color.valueOf("9Ff536"), e.fout());
      Draw.alpha(e.fout() + 0.5);
      Fill.circle(e.x + x, e.y + y, 0.3 + e.fout() * 0.3);
    });
    Angles.randLenVectors(e.id, 3, 2 + 7 * e.finpow(), (x, y) => {
      Draw.color(Color.valueOf("0Fff06"), Color.valueOf("9Ff526"), e.fout());
      Draw.alpha(e.fout() + 0.5);
      Fill.circle(e.x + x, e.y + y, 0.4 + e.fout() * 0.5);
    });
  })

uranium
  .createEffect('Cursed_effect', 120, (e) => {
    Angles.randLenVectors(e.id, 2, 1 + 1 * e.finpow(), (x, y) => {
      Draw.color(Color.valueOf("D51700"), Color.valueOf("F50700"), e.fout());
      Draw.alpha(e.fout() + 0.1);
      Fill.circle(e.x + x, e.y + y, 0.1 + e.fout() * 0.2);
    });
    Angles.randLenVectors(e.id, 3, 2 + 4 * e.finpow(), (x, y) => {
      Draw.color(Color.valueOf("F50710"), Color.valueOf("D51700"), e.fout());
      Draw.alpha(e.fout() + 0.15);
      Fill.circle(e.x + x, e.y + y, 0.2 + e.fout() * 0.3);
    });
  })

uranium
  .createEffect('Legend_effect', 160, (e) => {
    Angles.randLenVectors(e.id, 1, 1 + 1 * e.finpow(), (x, y) => {
      Draw.color(Color.valueOf("FEC424"), Color.valueOf("FFFFFF"), e.fout());
      Draw.alpha(e.fout());
      Fill.circle(e.x + x, e.y + y, 0.1 + e.fout() * 0.1);
    });
    Angles.randLenVectors(e.id, 2, 2 + 2 * e.finpow(), (x, y) => {
      Draw.color(Color.valueOf("FFFFFF"), Color.valueOf("FEC424"), e.fout());
      Draw.alpha(e.fout());
      Fill.circle(e.x + x, e.y + y, e.fout() * 0.3);
    });
  })

uranium
  .createEffect('nanobots', 180, (e) => {
    Angles.randLenVectors(e.id, 2, 2 + 3 * e.fout(), (x, y) => {
      Draw.color(Color.valueOf("889988"));
      Draw.alpha(e.fslope());
      Fill.circle(e.x + x, e.y + y, 0.2 + e.fout() * 0.3);
      Draw.color(Color.valueOf("77c777"));
      Fill.circle(e.x + x, e.y + y, 0.1 + e.fout() * 0.1);
    });
  });

uranium
  .createEffect('teach', 180, (e) => {
    Angles.randLenVectors(e.id, 2, 2 + 3 * e.fout(), (x, y) => {
      Draw.color(Color.valueOf("64F964"));
      Draw.alpha(e.fslope());
      Fill.square(e.x + x, e.y - y, 0.4 * e.fslope());
      Fill.square(e.x + x, e.y - y, 0.2 * e.fslope());
    });
  });

uranium
  .createEffect('Emperors Shield', 160, (e) => {
    Draw.color(Color.valueOf("FEC424"));
    Draw.alpha(e.fslope() * 0.6);
    Fill.circle(e.x, e.y, 36 + e.fout() * 6);
    Lines.stroke(3 * e.fout());
    Lines.circle(e.x, e.y, 36 + e.fin() * 6);
  });

uranium
  .createEffect('holy-explosion', 80, (e) => {
    e.scaled(7, cons(i => {
      Lines.stroke(3 * i.fout());
      Lines.circle(e.x, e.y, 3 + i.fin() * 30);
    }));

    Draw.color(Color.valueOf("FEC424"));

    Angles.randLenVectors(e.id, 9, 2 + 40 * e.finpow(), new Floatc2({
      get: (x, y) => {
        Fill.circle(e.x + x, e.y + y, e.fout() * 5 + 0.5);
        Fill.circle(e.x + x / 2, e.y + y / 2, e.fout() * 2);
      }
    }));

    Draw.color(Color.valueOf("FEC424"), Color.valueOf("FFFFFF"), Color.valueOf("FEC424"), e.fin());
    Lines.stroke(1.5 * e.fout());

    Angles.randLenVectors(e.id + 1, 7, 1 + 70 * e.finpow(), new Floatc2({
      get: (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 6);
      }
    }));
  })



