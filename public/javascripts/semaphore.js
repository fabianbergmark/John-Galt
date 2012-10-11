function Semaphore(signal) {
  this.signal = signal;
  this.stack = 0;
}

Semaphore.prototype.increment = function() {
  this.stack += 1;
}
Semaphore.prototype.decrement = function() {
  this.stack -= 1;
  if(this.stack == 0) {
    this.signal();
  }
}
