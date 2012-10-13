
/*
 * Timer.
 */

function Timer() {
  this.time = Date.now();
}

Timer.prototype.stop = function() {
  return Date.now() - this.time
}
Timer.prototype.start = function() {
  this.time = Date.now();
}

exports.Timer = Timer;
