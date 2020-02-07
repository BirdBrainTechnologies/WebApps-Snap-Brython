const SET_ALL_INTERVAL = 30;

function Robot(device) {
  this.device = device;
  this.fancyName = getDeviceFancyName(device.name);
  this.RX = null; //receiving
  this.TX = null; //sending
  this.displayElement = null;
  this.type = Robot.getTypeFromName(device.name);
  console.log("type set to " + this.type);
  this.setAllData = Robot.initialSetAllFor(this.type);
  this.oldSetAllData = this.setAllData.slice();
  this.writeInProgress = false;
  this.dataQueue = [];

  this.setAllInterval = setInterval(this.sendSetAll.bind(this), SET_ALL_INTERVAL);
}

Robot.ofType = {
  FINCH: 1,
  HUMMINGBIRDBIT: 2,
  MICROBIT: 3,
}
Robot.propertiesFor = {
  //finch
  1: {
    setAllLetter: 0xD0,
    setAllLength: 20,
    triLedCount: 5
  },
  //hummingbird bit
  2: {
    setAllLetter: 0xCA,
    setAllLength: 19,
    triLedCount: 2
  },
  //microbit
  3: {
    setAllLetter: 0x90,
    setAllLength: 8,
    triLedCount: 0
  }
}
Robot.getTypeFromName = function(name) {
  if (name.startsWith("FN")) {
    return Robot.ofType.FINCH
  } else if (name.startsWith("BB")) {
    return Robot.ofType.HUMMINGBIRDBIT
  } else if (name.startsWith("MB")) {
    return Robot.ofType.FINCH
  } else return null;
}
Robot.initialSetAllFor = function(type) {
  var array = new Uint8Array(Robot.propertiesFor[type].setAllLength);
  array[0] = Robot.propertiesFor[type].setAllLetter;
  if (type == Robot.ofType.HUMMINGBIRDBIT) {
    array[9] = 0xFF;
    array[10] = 0xFF;
    array[11] = 0xFF;
    array[12] = 0xFF;
  }
  return array;
}


Robot.prototype.isA = function(type) {
  if (this.type === type) return true
  else return false
}

Robot.prototype.disconnect = function() {
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

Robot.prototype.write = function(data) {
  if (this.writeInProgress) {
    if (data != null) { this.dataQueue.push(data); }
    setTimeout(this.write(null), SET_ALL_INTERVAL);
    return;
  }

  this.writeInProgress = true;
  if (this.dataQueue.length != 0) {
    if (data != null) { this.dataQueue.push(data); }
    data = this.dataQueue.shift();
  }
  this.TX.writeValue(data).then(_ => {
      console.log('Wrote to ' + this.fancyName + ":");
      console.log(data);
      this.writeInProgress = false;
    })
    .catch(error => {
      console.log("Error writting to " + this.fancyName + ": " + error);
      this.writeInProgress = false;
    });
}

Robot.prototype.updateSetAll = function(index, value) {
  //values must be between 0 and 255
  if (value < 0 || value > 255) {
    console.log("updateSetAll invalid value: " + value);
    return;
  }
  //make sure the index is not out of bounds
  if (index < 0 || index >= Robot.propertiesFor[this.type].setAllLength) {
    console.log("updateSetAll invalid index: " + index);
    return;
  }
  this.setAllData[index] = value;
}

Robot.prototype.sendSetAll = function() {
  var setAllChanged = false;
  for (var i = 0; i < this.setAllData.length; i++) {
    if (this.setAllData[i] != this.oldSetAllData[i]) { setAllChanged = true; }
  }
  console.log("sendSetAll " + setAllChanged + " " + this.setAllData + this.oldSetAllData);
  if (setAllChanged) {
    this.write(this.setAllData);
    this.oldSetAllData = this.setAllData.slice();
  }
}

Robot.prototype.setLED = function(port, intensity) {
  //Only Hummingbird bits have single color leds
  if (!this.isA(Robot.ofType.HUMMINGBIRDBIT)) {
    console.log("setLED called but robot is not a hummingbird.");
    return;
  }

  var index;
  switch (port) {
    case 1:
      index = 1;
      break;
    case 2:
      index = 13;
      break;
    case 3:
      index = 14;
      break;
    default:
      console.log("setLED invalid port: " + port);
      return;
  }

  this.updateSetAll(index, intensity);
}

Robot.prototype.setTriLED = function(port, red, green, blue) {
  //microbits do not have any trileds
  if (this.isA(Robot.ofType.MICROBIT)) {
    console.log("setTriLED called on a robot of type microbit");
    return;
  }
  if (port < 1 || port > Robot.propertiesFor[this.type].triLedCount){
    console.log("setTriLED invalid port: " + port);
    return;
  }
  var index;
  const portAdjust = (port - 1) * 3;
  switch(this.type) {
    case Robot.ofType.HUMMINGBIRDBIT:
      index = 3 + portAdjust;
      break;
    case Robot.ofType.FINCH:
      index = 1 + portAdjust;
      break;
    default:
      console.log("setTriLED invalid robot type: " + this.type);
      return;
  }

  this.updateSetAll(index, red);
  this.updateSetAll(index + 1, green);
  this.updateSetAll(index + 2, blue);
}

Robot.prototype.setServo = function(port, value) {
  if (!this.isA(Robot.ofType.HUMMINGBIRDBIT)) {
    console.log("Only hummingbirds have servos.");
    return
  }
  if (port < 1 || port > 4) {
    console.log("setServo invalid port: " + port);
  }
  this.updateSetAll(port + 8, value);
}
