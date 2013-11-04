var $ = require('jquery');
var ical = require('ical');

function increment_day_to_date(date) {
  return new Date(date.getTime() + 3600 * 1000 * 24);
}

function convert_date_to_next_0800_hours_and_weekday(date) {
  var new_date = new Date(date.getFullYear(),
                          date.getMonth(),
                          date.getUTCDate(),
                          8);
  if (new_date > date) {
    return new_date;
  } else {
    new_date = increment_day_to_date(new_date);
  }

  while (new_date.getDay() == 0 || new_date.getDay() == 6) {
    new_date = increment_day_to_date(new_date);
  }

  return new_date;
}

function is_in_period(a, b) {
  return !(a.start.getTime() >= b.end.getTime() ||
           b.start.getTime() >= a.end.getTime());
}

exports.get_free_periods = function(url, start, days, continuation) {
  $.ajax(
    { "type"    : "GET",
      "url"     : url,
      "success" : function(data) {
        var calendar = ical.parseICS(data);

        var end = new Date(start.getTime() + 3600*1000*24*days);
        start = convert_date_to_next_0800_hours_and_weekday(start);

        var periods = [];
        for (var key in calendar) {
          var event = calendar[key];

          event_start = new Date(event.start);
          event_end = new Date(event.end);

          if (event_start.getTime() >= start.getTime()
              && event_end.getTime() <= end.getTime()) {
            var period = {};
            period.start = event_start;
            period.end = event_end;
            periods.push(period);
          }
        }

        var free_periods = [];
        while (start <= end) {
          var p1 = {};
          p1.start = new Date(start.getTime());
          p1.end = new Date(p1.start.getTime() + 3600 * 1000 * 2);

          var p2 = {};
          p2.start = p1.end;
          p2.end = new Date(p2.start.getTime() + 3600 * 1000 * 2);

          var p3 = {};
          p3.start = new Date(p2.end.getTime() + 3600 * 1000);
          p3.end = new Date(p3.start.getTime() + 3600 * 1000 * 2);

          var p4 = {};
          p4.start = p3.end;
          p4.end = new Date(p4.start.getTime() + 3600 * 1000 * 2);

          var p1_good = p1.end.getTime() <= end.getTime();
          var p2_good = p2.end.getTime() <= end.getTime();
          var p3_good = p3.end.getTime() <= end.getTime();
          var p4_good = p4.end.getTime() <= end.getTime();

          for (var i = 0; i < periods.length; ++i) {
            var period = periods[i];
            if (is_in_period(p1, period)) {
              p1_good = false;
            }

            if (is_in_period(p2, period)) {
              p2_good = false;
            }

            if (is_in_period(p3, period)) {
              p3_good = false;
            }

            if (is_in_period(p4, period)) {
              p4_good = false;
            }
          }

          if (p1_good) {
            free_periods.push(p1);
          }

          if (p2_good) {
            free_periods.push(p2);
          }

          if (p3_good) {
            free_periods.push(p3);
          }

          if (p4_good) {
            free_periods.push(p4);
          }

          start = convert_date_to_next_0800_hours_and_weekday(start);
        }

        continuation(free_periods, null);

      },
      "error": function(request, error, code) {
        continuation(null, error);
      }
    });
}
