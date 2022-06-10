export function getCookie(name) {
  const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  const arr = document.cookie.match(reg);
  if (arr) {
    return arr[2];
  }
  return null;
}

export function setCookie(cName, value, expireTimestamp) {
  var keys = document.cookie.match(new RegExp('[^ =;]+(?=\\=)', 'g'));
  if (keys) {
    if (keys.indexOf(cName) > -1) {
      return;
    }
  }
  let exdate;
  if (expireTimestamp) {
    exdate = new Date(expireTimestamp);
  }
  document.cookie = cName + '=' + escape(value) + (!expireTimestamp ? '' : '; expires=' + exdate.toUTCString());
}

export function delCookie(cName) {
  var now = new Date();
  now.setMonth(now.getMonth() - 1);
  document.cookie = cName + '=' + '; expires=' + now.toUTCString();
}

export function delAllCookie() {
  var keys = document.cookie.match(new RegExp('[^ =;]+(?=\\=)', 'g'));
  if (keys) {
    for (var i = 0; i < keys.length; i++) {
      var now = new Date();
      now.setTime(now.getTime() - 1000000);
      document.cookie = keys[i] + '=0; expires=' + now.toUTCString();
    }
  }
}
