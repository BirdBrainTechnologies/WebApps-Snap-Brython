function Robot(device) {
  this.device = device;
  this.name = device.name;
  this.RX = null; //receiving
  this.TX = null; //sending
  this.displayElement = null;
}
Robot.prototype.disconnect = function () {
  this.device.gatt.disconnect();
  var index = robots.indexOf(this);
  if (index !== -1) robots.splice(index, 1);
  console.log("after disconnect: " + robots.length);
  this.displayElement.remove();
  if (robots.length == 0) {
    $('#connection-state').css("visibility", "hidden");
    $('#startProgramming').css("visibility", "hidden");
  }
}
