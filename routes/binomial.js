
/*
 * Statistical calculations.
 */

exports.mean = function(measurements) {
  if(measurements.length > 0) {
    var min = measurements[0].x1.getTime();
    min %= 60 * 60 * 1000;
    var max = measurements[0].x2.getTime();
    max %= 60 * 60 * 1000;
    measurements.forEach(function(measurement) {
        var x1 = measurement.x1.getTime();
        x1 %= 60 * 60 * 1000
        if(x1 < min) {
          min = x1;
        }
        var x2 = measurement.x2.getTime();
        x2 %= 60 * 60 * 1000;
        if(x2 > max) {
          max = x2;
        }
      }
    );
    min /= 1000;
    max /= 1000;
    var weights = [];
    var weight = 0;
    var sum = 0;
    var span = max - min;
    for(var i = 0; i <= span; i++)
      weights.push(0);
      measurements.forEach(function(measurement) {
        var x0 = measurement.x1.getTime();
        x0 %= 60 * 60 * 1000;
        x0 /= 1000;
        x0 = x0 - min;
        var xn = measurement.x2.getTime();
        xn %= 60 * 60 * 1000;
        xn /= 1000;
        xn = xn - min;
        for(var i = x0; i <= xn; i++) {
          weights[i]++;
          weight++;
          sum += i + min;
        }
      }
    );
    return sum/weight * 1000;
  }
  else
    throw "Empty set";
}
