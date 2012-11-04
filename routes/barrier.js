
/*
 * Barrier for parallel code.
 */

function Barrier() {
  this.active = true;
}

Barrier.prototype.stop = function() {
  this.active = false;
}
Barrier.prototype.start = function() {
  this.active = true;
}
Barrier.prototype.isActive = function() {
  return this.active;
}

exports.Barrier = Barrier;
