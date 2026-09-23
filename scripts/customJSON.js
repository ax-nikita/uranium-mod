const
  uranium = global.uranium;

// Uranium packets historically use a compact object format such as
// {tP:123,d:{h:700.5,mh:900,s:0,ms:120,hu:-6.67}}.
// The old parser used /[\\d\\w]+/ for values, which silently dropped decimal
// and negative numbers. That was fatal for dynamic turret HP/shield sync: the
// missing `mh` then reached a Java float field as `undefined`.
//
// Keep the existing wire format for compatibility, but parse it properly.
uranium.JSON = {
  stringify(obj) {
    if (obj === null) return 'null';

    const type = typeof obj;
    if (type == 'object') {
      let str = '', keys = Object.keys(obj);
      str += '{';
      for (let i = 0; i < keys.length; i++) {
        if (i != 0) str += ',';
        const key = keys[i];
        str += key + ':' + uranium.JSON.stringify(obj[key]);
      }
      str += '}';
      return str;
    }

    if (type == 'number') {
      // Do not put NaN/Infinity into the packet. They cannot represent valid
      // Mindustry state and would otherwise turn into hard-to-debug strings.
      return isFinite(obj) ? String(obj) : 'null';
    }

    if (type == 'boolean') return obj ? 'true' : 'false';
    if (type == 'undefined') return 'null';

    // Current Uranium packets only use numeric/boolean/object payloads. Keep
    // legacy raw-string behaviour for any older addon that may still use it.
    return String(obj);
  },

  parse(str) {
    const text = String(str == null ? '' : str).trim();
    let index = 0;

    function skipWhitespace() {
      while (index < text.length && /\s/.test(text.charAt(index))) index++;
    }

    function parseToken() {
      skipWhitespace();
      const start = index;
      while (index < text.length) {
        const ch = text.charAt(index);
        if (ch == ',' || ch == '}') break;
        index++;
      }

      const token = text.substring(start, index).trim();
      if (token == 'null' || token == 'undefined' || token == '') return null;
      if (token == 'true') return true;
      if (token == 'false') return false;

      const number = Number(token);
      if (!isNaN(number)) return number;

      return token;
    }

    function parseObject() {
      skipWhitespace();
      if (text.charAt(index) != '{') {
        return parseToken();
      }

      index++; // {
      const obj = {};

      while (index < text.length) {
        skipWhitespace();
        if (text.charAt(index) == '}') {
          index++;
          return obj;
        }

        const keyStart = index;
        while (index < text.length && text.charAt(index) != ':') index++;
        if (index >= text.length) return obj;

        const key = text.substring(keyStart, index).trim();
        index++; // :
        skipWhitespace();

        let value;
        if (text.charAt(index) == '{') {
          value = parseObject();
        } else {
          value = parseToken();
        }
        obj[key] = value;

        skipWhitespace();
        if (text.charAt(index) == ',') {
          index++;
          continue;
        }
        if (text.charAt(index) == '}') {
          index++;
          return obj;
        }
      }

      return obj;
    }

    if (text.length == 0) return {};
    return parseObject();
  }
};

// Network packet handlers must never pass untrusted/raw JS values directly into
// overloaded Java methods such as World.tile(int). Rhino tries to coerce the
// value before our JS can recover, and a malformed string can disconnect a client.
// Keep these helpers deliberately small and side-effect free.
uranium.netNumber = function (value) {
  if (value == null) return null;

  if (typeof value == 'number') {
    return isFinite(value) ? value : null;
  }

  const text = String(value).trim();
  if (text.length == 0) return null;

  // Strict numeric form first. This covers integers, decimals and exponents.
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) {
    const number = Number(text);
    return isFinite(number) ? number : null;
  }

  return null;
};

uranium.netTilePos = function (value) {
  const direct = uranium.netNumber(value);
  if (direct != null) return Math.floor(direct);

  // Compatibility/recovery path for malformed legacy compact packets. Some old
  // packets can arrive as e.g. "24379503,tP:24379503}". The first integer is the
  // original tile position; extracting it is safe because tile positions are ints.
  const text = String(value == null ? '' : value);
  const match = text.match(/[+-]?\d+/);
  if (match == null) return null;

  const number = Number(match[0]);
  if (!isFinite(number)) return null;
  return Math.floor(number);
};

