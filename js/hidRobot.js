


function HidRobot(device) {
  this.device = device
  this.isFinch = (device.productId == 0x1111)
  this.isHbDuo = (device.productId == 0x2222)
  this.currentSensorData = []

  device.addEventListener("inputreport", this.handleInputReport.bind(this));
}

HidRobot.prototype.sendBytes = function(bytes) {
  this.device.sendReport(0, bytes).then(() => {
    console.log("Sent bytes " + bytes);
  }).catch(error => {
    console.error("ERROR sending report: " + error.message)
  });
}

//TODO: Delete?
HidRobot.prototype.pollSensors = function() {
  if (this.isHbDuo) {
    var bytes = new Uint8Array([0,0,0,0,0,0,0,0]);
    //all sensors
    bytes[0] = "G".charCodeAt(0);
    bytes[1] = "3".charCodeAt(0);
    this.sendBytes(bytes)
  } else {
    console.error("Finch sensor polling not implemented.")
  }
}

HidRobot.prototype.handleInputReport = function(e) {
  this.currentSensorData = new Uint8Array(e.data.buffer)
  //console.log(e.device.productName + ": got input report " + e.reportId);
  //console.log(new Uint8Array(e.data.buffer));
  //console.log(this)
  sendMessage({
    hidSensorData: this.currentSensorData
  });
}
