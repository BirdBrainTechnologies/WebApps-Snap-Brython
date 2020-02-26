const SET_ALL_INTERVAL = 30;
const MAX_LED_PRINT_WORD_LEN = 10;

//Finch constants
const FINCH_TICKS_PER_CM = 49.7;
const FINCH_TICKS_PER_DEGREE = 4.335;
//This array tells the motors to keep doing what they are doing
const FINCH_INITIAL_MOTOR_ARRAY = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 1]);

function Robot(device, devLetter) {
  this.device = device;
  this.devLetter = devLetter;
  this.fancyName = getDeviceFancyName(device.name);
  this.batteryLevel = Robot.batteryLevel.UNKNOWN
  this.RX = null; //receiving
  this.TX = null; //sending
  this.displayElement = null;
  this.type = Robot.getTypeFromName(device.name);
  console.log("type set to " + this.type);
  this.writeInProgress = false;
  this.dataQueue = [];
  this.printTimer = null;

  //Robot state arrays
  this.initializeDataArrays();

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
    triLedCount: 5,
    buzzerIndex: 16,
    stopCommand: new Uint8Array([0xDF])
  },
  //hummingbird bit
  2: {
    setAllLetter: 0xCA,
    setAllLength: 19,
    triLedCount: 2,
    buzzerIndex: 15,
    stopCommand: new Uint8Array([0xCB, 0xFF, 0xFF, 0xFF])
  },
  //micro:bit
  3: {
    setAllLetter: 0x90,
    setAllLength: 8,
    triLedCount: 0,
    buzzerIndex: null, //no buzzer on the micro:bit
    stopCommand: new Uint8Array([144, 0, 0, 0, 0, 0, 0, 0])
  }
}
Robot.batteryLevel = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  UNKNOWN: 4
}
Robot.getTypeFromName = function(name) {
  if (name.startsWith("FN")) {
    return Robot.ofType.FINCH
  } else if (name.startsWith("BB")) {
    return Robot.ofType.HUMMINGBIRDBIT
  } else if (name.startsWith("MB")) {
    return Robot.ofType.MICROBIT
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
Robot.dataIsEqual = function(data1, data2) {
  if (data1.length != data2.length) { return false; }

  var equal = true;
  for (var i = 0; i < data1.length; i++) {
    if (data1[i] != data2[i]) { equal = false; }
  }
  return equal;
}

Robot.prototype.initializeDataArrays = function() {
  this.setAllData = Robot.initialSetAllFor(this.type);
  this.oldSetAllData = this.setAllData.slice();
  this.ledDisplayData = new Uint8Array(8);
  this.oldLedDisplayData = this.ledDisplayData.slice();
  if (this.isA(Robot.ofType.FINCH)) {
    this.motorsData = FINCH_INITIAL_MOTOR_ARRAY.slice();
    this.oldMotorsData = FINCH_INITIAL_MOTOR_ARRAY.slice();
  }
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
    console.log("Write already in progress. Pushing data to the queue.")
    if (data != null) {
      console.log(data);
      this.dataQueue.push(data);
    }
    setTimeout(function() {
      console.log("timeout");
      this.write()
    }.bind(this), SET_ALL_INTERVAL);
    return;
  }

  console.log("About to write:");
  console.log(data);
  this.writeInProgress = true;
  if (this.dataQueue.length != 0) {
    if (data != null) { this.dataQueue.push(data); }
    data = this.dataQueue.shift();
    console.log(data);
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
//TODO: Make sure updates don't get skipped
//TODO: Update group of data at once (eg entire buzzer command)
Robot.prototype.updateData = function(data, startIndex, valueArray) {
  //values must be between 0 and 255
  for(let i = 0; i < valueArray.length; i++) {
    if (valueArray[i] < 0 || valueArray[i] > 255) {
      console.log("updateData invalid value: " + value);
      return;
    }
  }

  //make sure the index is not out of bounds
  if (startIndex < 0 || (startIndex + valueArray.length) > data.length) {
    console.log("updateData invalid index: " + index);
    return;
  }

  let newData = data.slice();
  for(let i = 0; i < valueArray.length; i++) {
    newData[startIndex + i] = valueArray[i];
  }

  if (data === this.setAllData) {
    this.setAllData = newData;
  } else if (data === this.motorsData) {
    this.motorsData = newData;
  } else if (data === this.ledDisplayData) {
    this.ledDisplayData = newData;
  } else {
    console.log("NOT FOUND " + data)
  }
}



Robot.prototype.sendSetAll = function() {
  var setAllChanged = !Robot.dataIsEqual(this.setAllData, this.oldSetAllData);

  //console.log("sendSetAll " + setAllChanged + " " + this.setAllData + " " + this.oldSetAllData);
  if (setAllChanged) {
    const data = this.setAllData.slice();
    this.clearBuzzerBytes();
    this.oldSetAllData = this.setAllData.slice();
    this.write(data);
  }

  //in another half cycle, check to see if the other data needs to be sent
  setTimeout(function() {
    const ledArrayChanged = !Robot.dataIsEqual(this.ledDisplayData, this.oldLedDisplayData);

    if (this.isA(Robot.ofType.FINCH)) {
      let symbolSet = false
      let flashSet = false
      if (ledArrayChanged) {
        symbolSet = (this.ledDisplayData[1] == 0x80)
        if (!symbolSet) { flashSet = true; }
      }
      const motorsChanged = !Robot.dataIsEqual(this.motorsData, this.oldMotorsData);
      //TODO: when should this be done?
      this.oldLedDisplayData = this.ledDisplayData.slice();
      this.oldMotorsData = this.motorsData.slice();

      let motorArray = []
      if (motorsChanged) {
        motorArray = Array.prototype.slice.call(this.motorsData);
        this.motorsData = FINCH_INITIAL_MOTOR_ARRAY.slice();
      }

      let mode = 0x00
      if (motorsChanged && flashSet) {
          mode = 0x80 + this.ledDisplayData.length - 2
      } else if (motorsChanged && symbolSet) {
          mode = 0x60
      } else if (motorsChanged) {
          mode = 0x40
      } else if (flashSet) {
          mode = this.ledDisplayData.length - 2
      } else if (symbolSet) {
          mode = 0x20
      }

      if (mode != 0) {
        const cmdArray = [0xD2, mode].concat(motorArray, Array.prototype.slice.call(this.ledDisplayData, 2))
        const command = new Uint8Array(cmdArray)
        this.write(command);
      }

    } else {
      if (ledArrayChanged) {
        this.write(this.ledDisplayData);
        this.oldLedDisplayData = this.ledDisplayData.slice();
      }
    }
  }.bind(this), SET_ALL_INTERVAL/2)
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

  this.updateData(this.setAllData, index, [intensity]);
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

  this.updateData(this.setAllData, index, [red, green, blue]);
}

Robot.prototype.setServo = function(port, value) {
  if (!this.isA(Robot.ofType.HUMMINGBIRDBIT)) {
    console.log("Only hummingbirds have servos.")
    return
  }
  if (port < 1 || port > 4) {
    console.log("setServo invalid port: " + port);
  }
  this.updateData(this.setAllData, port + 8, [value]);
}

Robot.prototype.setMotors = function(speedL, ticksL, speedR, ticksR) {
  if (!this.isA(Robot.ofType.FINCH)) {
    console.log("Only finches have motors.")
    return
  }

  //const ticksPerCM = 49.7;

	//Make sure speeds do not exceed 100%
	if (speedL > 100) { speedL = 100; }
	if (speedL < -100) { speedL = -100; }
	if (speedR > 100) { speedR = 100; }
	if (speedR < -100) { speedR = -100; }

	//let ticksL = Math.round(distL * ticksPerCM);
	//let ticksR = Math.round(distR * ticksPerCM);
  //let velL = Math.round(speedL * speedScaling));
  //let velR = Math.round(speedR * speedScaling));

  let scaledVelocity = function(speed) {
    const speedScaling = 36/100;
    let vel = Math.round(speed * speedScaling);
    if (vel > 0 && vel < 128) {
      return vel + 128;
    } else if (vel <= 0 && vel > -128) {
      return Math.abs(vel);
    } else {
      console.error("bad speed value " + speed);
      return 0;
    }
  }
/*
  this.motorsData[0] = scaledVelocity(speedL)
  this.motorsData[1] = ((ticksL & 0x00ff0000) >> 16)
  this.motorsData[2] = ((ticksL & 0x0000ff00) >> 8)
  this.motorsData[3] = (ticksL & 0x000000ff)
  this.motorsData[4] = scaledVelocity(speedR)
  this.motorsData[5] = ((ticksR & 0x00ff0000) >> 16)
  this.motorsData[6] = ((ticksR & 0x0000ff00) >> 8)
  this.motorsData[7] = (ticksR & 0x000000ff)
  console.log("setMotors " + ticksL + " array " + this.motorsData);
  console.log((ticksL & 0x00ff0000 >> 16) + " " + (ticksL & 0x0000ff00 >> 8) + " " + (ticksL & 0x000000ff));
  console.log((ticksL & 0xff0000 >> 16) + " " + (ticksL & 0xff00 >> 8) + " " + (ticksL & 0xff));
  console.log((ticksL >> 16) + " " + (ticksL >> 8) + " " + (ticksL));
  console.log(((ticksL >> 16) & 0xff) + " " + ((ticksL >> 8) & 0xff) + " " + (ticksL & 0xff));
*/
  this.updateData(this.motorsData, 0, [
    scaledVelocity(speedL), ((ticksL & 0x00ff0000) >> 16),
    ((ticksL & 0x0000ff00) >> 8), (ticksL & 0x000000ff),
    scaledVelocity(speedR), ((ticksR & 0x00ff0000) >> 16),
    ((ticksR & 0x0000ff00) >> 8), (ticksR & 0x000000ff)
  ])
}

Robot.prototype.setBuzzer = function(note, duration) {
  var index = Robot.propertiesFor[this.type].buzzerIndex
  if (index == null) {
    console.log("setBuzzer invalid robot type: " + this.type);
    return;
  }

  let frequency = 440 * Math.pow(2, (note - 69)/12)
  let period = (1/frequency) * 1000000
  //TODO: check if period is in range?

  this.updateData(this.setAllData, index, [
    period >> 8, period & 0x00ff, duration >> 8, duration & 0x00ff
  ])
}

Robot.prototype.clearBuzzerBytes = function() {
  var index = Robot.propertiesFor[this.type].buzzerIndex
  if (index == null) {
    console.log("clearBuzzerBytes invalid robot type: " + this.type);
    return;
  }

  this.updateData(this.setAllData, index, [0, 0, 0, 0])
}

Robot.prototype.setSymbol = function(symbolString) {
  if (this.printTimer !== null) { clearTimeout(this.printTimer); }

  let data = [];
  data[0] = 0xCC
  data[1] = 0x80 //set symbol
  const sa = symbolString.split("/")
  let iData = 2
  let shift = 0

  for (let i = 24; i >= 0; i--) {
    //console.log("processing " + sa[i] + " " + iData + " " + shift)
    data[iData] = (sa[i] == "true") ? (data[iData] | (1 << shift)) : (data[iData] & ~(1 << shift));
    if (shift == 0) {
      shift = 7
      iData += 1
    } else {
      shift -= 1
    }
  }
  this.updateData(this.ledDisplayData, 0, data);
  console.log("processed symbol:")
  console.log(this.ledDisplayData)

}

Robot.prototype.setPrint = function(printChars) {
  if (this.printTimer !== null) { clearTimeout(this.printTimer); }

  if (printChars.length > MAX_LED_PRINT_WORD_LEN) {
    let nextPrintChars = printChars.slice(MAX_LED_PRINT_WORD_LEN, printChars.length);
    this.printTimer = setTimeout (function () {
      this.setPrint(nextPrintChars);
    }.bind(this), MAX_LED_PRINT_WORD_LEN * 600);  // number of chars * 600ms per char

    printChars = printChars.slice(0, MAX_LED_PRINT_WORD_LEN);
  }

  //let data = new Uint8Array(printChars.length + 2);
  let data = [];
  data[0] = 0xCC
  data[1] = printChars.length | 0x40;

  for (var i = 0; i < printChars.length; i++) {
    data[i+2] = printChars[i].charCodeAt(0);
  }

  this.updateData(this.ledDisplayData, 0, data);
}

Robot.prototype.stopAll = function() {
  if (this.printTimer !== null) { clearTimeout(this.printTimer); }
  this.write(Robot.propertiesFor[this.type].stopCommand);
  this.initializeDataArrays();
}

Robot.prototype.resetEncoders = function() {
  if (!this.isA(Robot.ofType.FINCH)) {
    console.log("Only finches have encoders.")
    return
  }

  this.write(new Uint8Array([0xD5]));
}

Robot.prototype.receiveSensorData = function(data) {
  var batteryIndex = null;
  var batteryFactor = 0;
  var greenThreshold = 0;
  var yellowThreshold = 0;
  switch(this.type) {
    case Robot.ofType.FINCH:
      batteryIndex = 6
      batteryFactor = 0.0376
      greenThreshold = 3.386
      yellowThreshold = 3.271
      break;
    case Robot.ofType.HUMMINGBIRDBIT:
      batteryIndex = 3
      batteryFactor = 0.0406
      greenThreshold = 4.75
      yellowThreshold = 4.4
      break;
    //No battery monitoring for micro:bit
  }

  if (batteryIndex != null) {
    const rawVoltage = data[batteryIndex]
    const voltage = rawVoltage * batteryFactor
    var newLevel = Robot.batteryLevel.UNKNOWN
    if (voltage > greenThreshold) {
      newLevel = Robot.batteryLevel.HIGH
    } else if (voltage > yellowThreshold) {
      newLevel = Robot.batteryLevel.MEDIUM
    } else {
      newLevel = Robot.batteryLevel.LOW
    }
    if (newLevel != this.batteryLevel) {
      this.batteryLevel = newLevel
      updateBatteryStatus(this)
    }
  }
}
