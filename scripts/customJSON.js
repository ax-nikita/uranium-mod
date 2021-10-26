const
  uranium = global.uranium;

uranium.JSON = {
  stringify(obj) {
    let
      str = '',
      keys = Object.keys(obj);

    str += '{';
    for (let i = 0; i < keys.length; i++) {
      if (i != 0) {
        str += ',';
      };
      str += keys[i] + ':';
      if (typeof (obj[keys[i]]) == 'object') {
        str += uranium.JSON.stringify(obj[keys[i]]);
      } else {
        str += obj[keys[i]];
      };
    };
    str += '}';
    return str;
  },
  parse(str) {
    let
      reg = /[\d\w\.]+:({.*?}|[\d\w]+)(,|}$)/g,
      strArray = str.match(reg),
      obj = {};
    for (let i = 0; i < strArray.length; i++) {
      let
        pure_string = strArray[i].substring(0, strArray[i].length - 1),
        firstDelimetr = pure_string.indexOf(':'),
        key = pure_string.substring(0, firstDelimetr),
        value = pure_string.substring(firstDelimetr + 1);
      if (value.indexOf('}') != -1) {
        obj[key] = uranium.JSON.parse(value);
      } else {
        obj[key] = value;
      }
    };
    return obj;
  }
};