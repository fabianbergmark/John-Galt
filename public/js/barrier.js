function Barrier() {
  this.active = true;
}

Barrier.prototype.stop = function() {
  this.active = false;
}
Barrier.prototype.isActive = function() {
  return this.active;
}
