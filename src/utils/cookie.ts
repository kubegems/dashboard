export function getCookie(name: string): string | null {
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  const arr: RegExpMatchArray = document.cookie.match(reg);
  if (arr) {
    return arr[2];
  }
  return null;
}

export function setCookie(cName: string, value: string, expireTimestamp: number): void {
  const keys: RegExpMatchArray = document.cookie.match(new RegExp('[^ =;]+(?=\\=)', 'g'));
  if (keys) {
    if (keys.indexOf(cName) > -1) {
      return;
    }
  }
  let exdate: Date;
  if (expireTimestamp) {
    exdate = new Date(expireTimestamp);
  }
  document.cookie = cName + '=' + escape(value) + (!expireTimestamp ? '' : '; expires=' + exdate.toUTCString());
}

export function delCookie(cName: string): void {
  const now: Date = new Date();
  now.setMonth(now.getMonth() - 1);
  document.cookie = cName + '=' + '; expires=' + now.toUTCString();
}

export function delAllCookie(): void {
  const keys: RegExpMatchArray = document.cookie.match(new RegExp('[^ =;]+(?=\\=)', 'g'));
  if (keys) {
    for (let i = 0; i < keys.length; i++) {
      const now: Date = new Date();
      now.setTime(now.getTime() - 1000000);
      document.cookie = keys[i] + '=0; expires=' + now.toUTCString();
    }
  }
}
