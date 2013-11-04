/*
 * Date formatting.
 */

Date.prototype.get_date = function() {
  var year  = this.getFullYear(),
      month = this.getMonth() + 1,
      date  = this.getDate();
  if (month < 10)
    month = "0" + month;
  if (date < 10)
    date = "0" + date;
  return year + "-" + month + "-" + date;
}

Date.prototype.get_time = function() {
  var hour   = this.getHours(),
      minute = this.getMinutes(),
      second = this.getSeconds();
  if (hour < 10)
    hour = "0" + hour;
  if (minute < 10)
    minute = "0" + minute;
  if (second < 10)
    second = "0" + second;
  return hour + ":" + minute + ":" + second;
}
