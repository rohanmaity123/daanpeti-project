
const Cookie = {
  getCookie(name) {
    let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? decodeURIComponent(v[2]) : null;
  },
 
  setCookie(name, value, days) {
    let d = new Date();
    d.setTime(d.getTime() + 24*60*60*1000*parseInt(days));
    document.cookie = name + "=" + encodeURIComponent(value) + ";path=/;expires=" + d.toGMTString();
  },

  setHourCookie(name, value, days) {
    let d = new Date();
    d.setTime(d.getTime() + 60000*2 + 5000); //min 2 and add 5sec for test
    document.cookie = name + "=" + encodeURIComponent(value) + ";path=/;expires=" + d.toGMTString();
  },

  deleteCookie(name) {
    this.setCookie(name, '', -1);
  }
};

export default Cookie;
