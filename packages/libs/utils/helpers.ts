export function validateJWT(jwt: string): boolean {
  if (!jwt) return false;
  try {
    const jwtInfo: any = JSON.parse(window.atob(jwt.split('.')[1]));
    const now: number = Date.parse(new Date().toString()) / 1000;
    return jwtInfo.exp > now;
  } catch (e) {
    return true;
  }
}

export function formatDatetime(date: Date = new Date(), format = 'yyyy-MM-dd hh:mm:ss'): string | number {
  const d: Date = new Date(date);
  if (format === 'timestamp') return d.getTime();
  const opts: { [key: string]: number } = {
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
      const t: string = opts[k].toString();
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? t : t.padStart(2, '0'));
    }
  }
  return format;
}

export function deepCopy(item: any): any {
  return JSON.parse(JSON.stringify(item));
}

export function sizeOfTke(num: number | string, suffix = 's'): number {
  if (num === undefined) return 0;
  if (num === null) return 0;
  num = num.toString();
  if (new RegExp('^[0-9]+\\.?[0-9]*$', 'g').test(num)) {
    return parseFloat(num);
  }
  const units: string[] = ['s', 'k', 'M', 'T'];
  const pos: number = units.indexOf(suffix);
  for (const i in units) {
    const index: number = parseInt(i);
    if (num.indexOf(units[index]) > -1) {
      if (index < pos) {
        let n: number = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < pos - index; i++) {
          n = n / 1000.0;
        }
        return n;
      } else {
        let n: number = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < index - pos; i++) {
          n = n * 1000.0;
        }
        return n;
      }
    }
  }
  return 0;
}

export function sizeOfByte(num: number | string, suffix = 'GB'): number {
  if (num === undefined) return 0;
  if (num === null) return 0;
  num = num.toString().toLocaleLowerCase();
  if (num === '0') return 0;
  const units: string[] = ['', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
  const pos: number = units.indexOf(suffix);
  if (new RegExp('^\\d+$').test(num)) return parseFloat(num);
  for (const i in units) {
    const index: number = parseInt(i);
    if (num.indexOf(units[index].toLocaleLowerCase()) > -1) {
      if (index < pos) {
        let n: number = parseFloat(num.replace(units[index].toLocaleLowerCase(), ''));
        for (let i = 0; i < pos - index; i++) {
          n = n / 1024.0;
        }
        return n;
      } else {
        let n: number = parseFloat(num.replace(units[index].toLocaleLowerCase(), ''));
        for (let i = 0; i < index - pos; i++) {
          n = n * 1024.0;
        }
        return n;
      }
    }
  }
  return 0;
}

export function sizeOfStorage(num: number | string, suffix = 'Gi'): number {
  if (num === undefined) return 0;
  if (num === null) return 0;
  num = num.toString();
  if (num === '0') return 0;
  const units: string[] = ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'];
  const pos: number = units.indexOf(suffix);
  if (new RegExp('^\\d+$').test(num)) num = `${num}B`;
  for (const i in units) {
    const index: number = parseInt(i);
    if (num.indexOf(units[index]) > -1) {
      if (index < pos) {
        let n: number = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < pos - index; i++) {
          n = n / 1024.0;
        }
        return n;
      } else {
        let n: number = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < index - pos; i++) {
          n = n * 1024.0;
        }
        return n;
      }
    }
  }
  return 0;
}

export function beautifyStorageUnit(num: number | string, decimal = 1): string {
  let result: number = parseFloat(num.toString());
  const units: string[] = ['B', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi'];
  for (const index in units) {
    if (Math.abs(result) < 1024.0) {
      return `${result.toFixed(decimal)}${units[index]}`;
    }
    result /= 1024.0;
  }
  return `${result.toFixed(decimal)}Yi`;
}

export function beautifyFileUnit(num: number, decimal = 1): string {
  let result: number = num;
  const units: string[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
  for (const index in units) {
    if (Math.abs(result) < 1024.0) {
      return `${result.toFixed(decimal)}${units[index]}`;
    }
    result /= 1024.0;
  }
  return `${result.toFixed(decimal)}Yi`;
}

export function sizeOfCpu(num: number | string, suffix = 'core'): number {
  if (num === undefined) return 0;
  if (num === null) return 0;
  num = num.toString();
  if (new RegExp('^[0-9]+\\.?[0-9]*$', 'g').test(num)) {
    return parseFloat(num);
  }
  const units: string[] = ['n', 'u', 'm', 'core', 'k'];
  const pos: number = units.indexOf(suffix);
  for (const i in units) {
    const index: number = parseInt(i);
    if (num.indexOf(units[index]) > -1) {
      if (index < pos) {
        let n: number = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < pos - index; i++) {
          n = n / 1000.0;
        }
        return n;
      } else {
        let n: number = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < index - pos; i++) {
          n = n * 1000.0;
        }
        return n;
      }
    }
  }
  return 0;
}

export function beautifyCpuUnit(num: number, decimal = 1): string {
  let result = num;
  const units: string[] = ['n', 'u', 'm', 'core', 'k'];
  for (const index in units) {
    if (Math.abs(result) < 1000.0) {
      return `${result.toFixed(decimal)} ${units[index]}`;
    }
    result /= 1000.0;
  }
  return `${result.toFixed(decimal)} Yi`;
}

export function sizeOfNetwork(num: number | string, suffix = 'core'): number {
  if (num === undefined) return 0;
  if (num === null) return 0;
  num = num.toString();
  if (new RegExp('^[0-9]+\\.?[0-9]*$', 'g').test(num)) {
    return parseFloat(num);
  }
  const units: string[] = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  const pos: number = units.indexOf(suffix);
  for (const i in units) {
    const index: number = parseInt(i);
    if (num.indexOf(units[index]) > -1) {
      if (index < pos) {
        let n: number = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < pos - index; i++) {
          n = n / 10024.0;
        }
        return n;
      } else {
        let n: number = parseFloat(num.replace(units[index], ''));
        for (let i = 0; i < index - pos; i++) {
          n = n * 1024.0;
        }
        return n;
      }
    }
  }
  return 0;
}

export function beautifyNetworkUnit(num: number, decimal = 1): string {
  let result = num;
  const units: string[] = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  for (const index in units) {
    if (Math.abs(result) < 1000.0) {
      return `${result.toFixed(decimal)} ${units[index]}`;
    }
    result /= 1024.0;
  }
  return `${result.toFixed(decimal)} Yi`;
}

export function randomString(e: number): string {
  e = e || 32;
  const t = 'abcdefhijkmnprstwxyz';
  const a: number = t.length;
  let n = '';
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
}

export function convertStrToNum(obj: { [key: string]: any }): { [key: string]: any } {
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

export function typeOf(obj: any): string {
  if (obj instanceof Element) {
    return 'element';
  } else {
    // toString会返回对应不同的标签的构造函数
    const toString: any = Object.prototype.toString;
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

type debounceHandle = (..._: any[]) => void;
export const debounce = (fn: debounceHandle, wait = 200, immediate = false): debounceHandle => {
  let result: debounceHandle, timeout: any;

  return function (...args: any[]) {
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

export function toFixed(num: any, places = 2): number {
  num = parseFloat(num);
  places = Math.pow(10, places);
  return Math.round(num * places) / places;
}

type emptyHandle = (_: any) => boolean;
export function deleteEmpty(
  obj: { [key: string]: any },
  match: emptyHandle = (v) => v === undefined,
): { [key: string]: any } {
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

export function sleep(ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function jsonParse(str: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

export function getApiVersion(kind, defaultVersion = 'core/v1'): string {
  const apiResources: { [key: string]: any } = jsonParse(window.localStorage.getItem('api-resources') as string) || {};
  let apiVersion = apiResources[kind] || defaultVersion;
  apiVersion = apiVersion === 'v1' ? 'core/v1' : apiVersion;
  return apiVersion;
}

export function getQueryString(name: string): string | null {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  const r: RegExpMatchArray | null = location.search.substr(1).match(reg);
  if (r != null) return unescape(decodeURI(r[2]));
  return null;
}

export function beautifyTime(num: string, deg = 1): string {
  if (num === 'NaN') return '-';
  let result = parseFloat(num) * deg;
  const units = ['us', 'ms', 's'];
  for (const index in units) {
    if (Math.abs(result) <= 1000 || parseInt(index) === units.length - 1) {
      return `${result.toFixed(3)} ${units[index]}`;
    }
    result /= 1000;
  }
  return `${result.toFixed(3)} Yi`;
}

export function colorRgb(color: string): string {
  let sColor = color.toLowerCase();
  //十六进制颜色值的正则表达式
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  // 如果是16进制颜色
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    const sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    return 'RGB(' + sColorChange.join(',') + ')';
  }
  return sColor;
}

export function colorRgbArray(color: string): number[] {
  let sColor = color.toLowerCase();
  //十六进制颜色值的正则表达式
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  // 如果是16进制颜色
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    const sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    return sColorChange;
  }
  return [];
}

export const beautifyFloatNum = (num: number | string, decimal = 1): string => {
  let result = parseFloat(num.toString());
  if (result > 1000) {
    decimal = 1;
  }
  if (result > 1000000) {
    decimal = 2;
  }
  const units = ['', 'K', 'M'];
  for (const index in units) {
    if (Math.abs(result) < 1000.0) {
      return `${result.toFixed(decimal)}${units[index]}`;
    }
    result /= 1000.0;
  }
  return `${result.toFixed(decimal)}Yi`;
};

export const formatDuring = (millisecond: number): string => {
  if (millisecond <= 0) return '0';
  const days = parseInt((millisecond / (1000 * 60 * 60 * 24)).toString());
  const hours = parseInt(((millisecond % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString());
  const minutes = parseInt(((millisecond % (1000 * 60 * 60)) / (1000 * 60)).toString());
  const seconds = parseInt(((millisecond % (1000 * 60)) / 1000).toString());
  let s = ``;
  if (days) s += days + 'd';
  if (hours) s += hours + 'h';
  if (minutes) s += minutes + 'm';
  if (seconds) s += seconds + 's';
  return s;
};

export function validateJWTExpiredSoon(jwt: string): boolean {
  if (!jwt) return false;
  try {
    const jwtInfo: any = JSON.parse(window.atob(jwt.split('.')[1]));
    const now: number = Date.parse(new Date().toString()) / 1000;
    return jwtInfo.exp - 10 * 60 > now;
  } catch (e) {
    return true;
  }
}
