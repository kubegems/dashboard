export function validateJWT(jwt) {
  if (!jwt) return false;
  const jwtInfo = JSON.parse(window.atob(jwt.split('.')[1]));
  const now = Date.parse(new Date()) / 1000;
  return jwtInfo.exp > now;
}

/**
 * @method formatDate
 * @description 格式化日期
 * @param {Date|Number|String} date 时间
 * @param {String} format 格式 y:年 M:月 q:季度 w:星期 d:天 H:小时(24) h:小时(12) m:分 s:秒 S:毫秒
 * @returns {String|Number}
 */
export function formatDatetime(date = new Date(), format = 'yyyy-MM-dd hh:mm:ss') {
  const d = new Date(date);
  if (format === 'timestamp') return d.getTime();
  const opts = {
    'q+': Math.floor((d.getMonth() + 3) / 3),
    'M+': d.getMonth() + 1,
    'w+': d.getDay() === 0 ? 7 : d.getDay(),
    'd+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'S+': d.getMilliseconds(),
  };
  if (new RegExp('(y+)').test(format))
    format = format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (const k in opts) {
    if (new RegExp('(' + k + ')').test(format)) {
      const t = opts[k].toString();
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? t : t.padStart(2, '0'));
    }
  }
  return format;
}

export function parserDatetime(date) {
  return new Date(Date.parse(date.replace(new RegExp('-', 'g'), '/')));
}

export function deepCopy(item) {
  return JSON.parse(JSON.stringify(item));
}

export function sizeOfStorage(num, suffix = 'Gi') {
  if (num === undefined) return 0;
  if (num === null) return 0;
  num = num.toString();
  if (num === '0') return 0;
  const units = ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'];
  const pos = units.indexOf(suffix);
  if (new RegExp('^\\d+$').test(num)) num = `${num}B`;
  for (const index in units) {
    if (num.indexOf(units[index]) > -1) {
      if (index < pos) {
        let n = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < pos - index; i++) {
          n = n / 1024.0;
        }
        return n;
      } else {
        let n = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < index - pos; i++) {
          n = n * 1024.0;
        }
        return n;
      }
    }
  }
  return 0;
}

export function beautifyStorageUnit(num, decimal = 1) {
  let result = num;
  const units = ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'];
  for (const index in units) {
    if (Math.abs(result) < 1024.0) {
      return `${result.toFixed(decimal)} ${units[index]}`;
    }
    result /= 1024.0;
  }
  return `${result.toFixed(decimal)} Yi`;
}

export function sizeOfCpu(num, suffix = 'core') {
  if (num === undefined) return 0;
  if (num === null) return 0;
  num = num.toString();
  if (!isNaN(num)) {
    return parseFloat(num);
  }
  const units = ['n', 'u', 'm', 'core', 'k'];
  const pos = units.indexOf(suffix);
  for (const index in units) {
    if (num.indexOf(units[index]) > -1) {
      if (index < pos) {
        let n = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < pos - index; i++) {
          n = n / 1000.0;
        }
        return n;
      } else {
        let n = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < index - pos; i++) {
          n = n * 1000.0;
        }
        return n;
      }
    }
  }
  return 0;
}
export function beautifyCpuUnit(num, decimal = 1) {
  let result = num;
  const units = ['n', 'u', 'm', 'core', 'k'];
  for (const index in units) {
    if (Math.abs(result) < 1000.0) {
      return `${result.toFixed(decimal)} ${units[index]}`;
    }
    result /= 1000.0;
  }
  return `${result.toFixed(decimal)} Yi`;
}

export function sizeOfNetwork(num, suffix = 'core') {
  if (num === undefined) return 0;
  if (num === null) return 0;
  num = num.toString();
  if (!isNaN(num)) {
    return parseFloat(num);
  }
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  const pos = units.indexOf(suffix);
  for (const index in units) {
    if (num.indexOf(units[index]) > -1) {
      if (index < pos) {
        let n = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < pos - index; i++) {
          n = n / 10024.0;
        }
        return n;
      } else {
        let n = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < index - pos; i++) {
          n = n * 1024.0;
        }
        return n;
      }
    }
  }
  return 0;
}
export function beautifyNetworkUnit(num, decimal = 1) {
  let result = num;
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  for (const index in units) {
    if (Math.abs(result) < 1000.0) {
      return `${result.toFixed(decimal)} ${units[index]}`;
    }
    result /= 1024.0;
  }
  return `${result.toFixed(decimal)} Yi`;
}

export function randomString(e) {
  e = e || 32;
  const t = 'abcdefhijkmnprstwxyz';
  const a = t.length;
  let n = '';
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
}

export function convertStrToNum(obj) {
  const data = {};
  for (const key in obj) {
    if (!isNaN(obj[key]) && obj[key] !== '') {
      if (typeof obj[key] === 'number') {
        data[key] = obj[key];
      } else {
        if (typeof obj[key] === 'object') {
          data[key] = obj[key];
        } else {
          if (obj[key].indexOf('.') > -1) {
            data[key] = parseFloat(obj[key]);
          } else {
            data[key] = parseInt(obj[key]);
          }
        }
      }
    } else {
      data[key] = obj[key];
    }
  }
  return data;
}

export function parsePromExpr(expr) {
  const exprRegex = new RegExp('([\\w|\\W]+)[ ]*(!=|>=|<=|==|>|<)+[ ]*([\\w\\W]+)(?<!\\))$', 'g');
  return exprRegex.exec(expr);
}

export function isJsonString(str) {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true;
    }
  } catch (e) {
    return false;
  }
}

/**
 * @description 判断数据类型
 * @param {*} obj 传入数据
 * @returns String
 */
export function typeOf(obj) {
  if (obj instanceof Element) {
    return 'element';
  } else {
    // toString会返回对应不同的标签的构造函数
    const toString = Object.prototype.toString;
    const map = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regExp',
      '[object Undefined]': 'undefined',
      '[object Null]': 'null',
      '[object Object]': 'object',
    };
    return map[toString.call(obj)];
  }
}

/**
 * @method debounce
 * @description 防抖行数
 * @param fn 执行函数
 * @param wait 延迟执行毫秒数
 * @param immediate true 表立即执行，false 表非立即执行
 */
export const debounce = (fn, wait = 200, immediate = false) => {
  let result, timeout;

  return function (...args) {
    if (timeout) clearTimeout(timeout);

    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) result = fn.apply(this, args);
    } else {
      timeout = setTimeout(() => {
        result = fn.apply(this, args);
      }, wait);
    }

    return result;
  };
};

/**
 * @description 保留几位小数
 * @param {Number} num 数字
 * @param {Number} places 保留几位
 */
export function toFixed(num, places = 2) {
  num = parseFloat(num);
  places = Math.pow(10, places);
  return Math.round(num * places) / places;
}

/**
 * @description 移除对象中的空值
 * @param {Object} obj
 * @param {Function} match 匹配函数
 */
export function deleteEmpty(obj, match = (v) => v === undefined) {
  Object.keys(obj).forEach((key) => {
    if (typeOf(obj[key]) === 'object') {
      deleteEmpty(obj[key]);
    } else {
      if (match(obj[key])) {
        delete obj[key];
      }
    }
  });
  return obj;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function jsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

export function getApiVersion(kind, defaultVersion = 'core/v1') {
  const apiResources = jsonParse(window.localStorage.getItem('api-resources')) || {};
  let apiVersion = apiResources[kind] || defaultVersion;
  apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;
  return apiVersion;
}
