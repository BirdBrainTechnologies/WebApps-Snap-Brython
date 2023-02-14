/**
 * HidRobot - Class to handle communication with robot connected over hid.
 *
 * @param  {HIDDevice} device The device to communicate with
 */
function HidRobot(device) {
  this.device = device
  this.isFinch = (device.productId == 0x1111) //0x2222 for HB?
  this.currentSensorData = [0,0,0,0,0,0,0,0,0]
  this.pollingTimer = null

  //finch only
  this.finchRightSpeed = 0
  this.finchLeftSpeed = 0
  this.maxSpeedChange = 10//20//30
  this.speedGoal = null

  device.addEventListener("inputreport", this.handleInputReport.bind(this));
  this.pollSensors()
}
/**
 * HidRobot.requestFinchSensorData - Sensor polling function for finch
 */
HidRobot.requestFinchSensorData = function() {
  this.sendBytes(HidRobot.makeFinchRequest("T"),
    [HidRobot.makeFinchRequest("L"), HidRobot.makeFinchRequest("I"),
      HidRobot.makeFinchRequest("A")])
}
/**
 * HidRobot.makeFinchRequest - Construct a sensor polling request for finch.
 *
 * @param  {string} c Single character request code
 */
HidRobot.makeFinchRequest = function(c) {
    var bytes = new Uint8Array([0,0,0,0,0,0,0,0]);
    bytes[0] = c.charCodeAt();
    bytes[7] = c.charCodeAt();
    return bytes;
}
/**
 * HidRobot.requestDuoSensorData - Sensor polling function for hummingbird
 */
HidRobot.requestDuoSensorData = function() {
  var bytes = new Uint8Array([0,0,0,0,0,0,0,0]);
  //all sensors
  bytes[0] = "G".charCodeAt(0);
  bytes[1] = "3".charCodeAt(0);
  this.sendBytes(bytes)
}
/**
 * HidRobot.prototype.sendBytes - Sends a command to the robot.
 *
 * @param  {Uint8Array} bytes  8 byte command to send
 * @param  {type} messageQueue queue of 8 byte commands to follow the current command
 */
HidRobot.prototype.sendBytes = function(bytes, messageQueue) {
  //Motor command that are too dramatic a change cause disconnections on macOS.
  if (this.isFinch && bytes[0] == 77) {
    //console.log("Finch motor command " + bytes + " currentL=" + this.finchLeftSpeed + " currentR=" + this.finchRightSpeed);
    let newLeftSpeed = bytes[1] ? -bytes[2] : bytes[2]
    let newRightSpeed = bytes[3] ? -bytes[4] : bytes[4]
    let deltaLeft = Math.abs(this.finchLeftSpeed - newLeftSpeed)
    let deltaRight = Math.abs(this.finchRightSpeed - newRightSpeed)
    if (Math.max(deltaLeft, deltaRight) > this.maxSpeedChange) {
      this.speedGoal = bytes.slice()
      if (deltaLeft > this.maxSpeedChange) {
        let fl = this.finchLeftSpeed
        let setLeft = (fl < newLeftSpeed) ? fl + this.maxSpeedChange : fl - this.maxSpeedChange
        bytes[1] = setLeft < 0 ? 1 : 0
        bytes[2] = Math.abs(setLeft)
        this.finchLeftSpeed = setLeft
      }
      if (deltaRight > this.maxSpeedChange) {
        let fr = this.finchRightSpeed
        let setRight = (fr < newRightSpeed) ? fr + this.maxSpeedChange : fr - this.maxSpeedChange
        bytes[3] = setRight < 0 ? 1 : 0
        bytes[4] = Math.abs(setRight)
        this.finchRightSpeed = setRight
      }
    } else {
      this.finchLeftSpeed = newLeftSpeed
      this.finchRightSpeed = newRightSpeed
      this.speedGoal = null
    }
    console.log("Finch motor ramp actually sending " + bytes + ". Goal: " + this.speedGoal);
  }

  this.device.sendReport(0, bytes).then(() => {
    //console.log("Sent bytes " + bytes);
    if (messageQueue && messageQueue.length > 0) {
      let nextMessage = messageQueue.shift()
      setTimeout(function() {
        this.sendBytes(nextMessage, messageQueue)
      }.bind(this), 10)
    }
    //When trying to set the speed of a finch...
    if (this.isFinch && bytes[0] == 77 && this.speedGoal != null) {
      setTimeout(function() {
        //The goal may have been overwritten in the meantime
        if (this.speedGoal != null) { this.sendBytes(this.speedGoal) }
      }.bind(this), 10)
    }
  }).catch(error => {
    console.error("ERROR sending [" + bytes + "]: " + error.message)
  });
}
/**
 * HidRobot.prototype.pollSensors - Start sensor polling.
 */
HidRobot.prototype.pollSensors = function() {
  let requestSensorData
  let frequency
  if (this.isFinch) {
    //console.log("Starting Finch sensor polling")
    requestSensorData = HidRobot.requestFinchSensorData
    frequency = 200
  } else {
    //console.log("Starting Hummingbird Duo sensor polling")
    requestSensorData = HidRobot.requestDuoSensorData
    frequency = 50
  }

  this.pollingTimer = setInterval(requestSensorData.bind(this), frequency)
}
/**
 * HidRobot.prototype.handleInputReport - Receive sensor data. Store it and
 * send it to the iframe.
 *
 * @param  {HIDInputReportEvent} e sensor data event
 */
HidRobot.prototype.handleInputReport = function(e) {
  //console.log(e.device.productName + ": got input report " + e.reportId);
  //console.log(new Uint8Array(e.data.buffer));

  if (this.isFinch) {
    this.sortFinchMessages(e.data.buffer)
  } else {
    this.currentSensorData = new Uint8Array(e.data.buffer)
  }
  //console.log(this.currentSensorData)
  sendMessage({
    hidSensorData: this.currentSensorData,
    isFinch: this.isFinch
  });
}
/**
 * HidRobot.prototype.sortFinchMessages - this is called on a report recieved
 * from the finch, it figures out hat sensor the report is about and saves it
 * NOTE: calculations are already made to convert the raw sensor data into
 * usable information. Temperature is in Celcius.
 *
 * currentSensorData - LL | RL | AX | AY | AZ | LO | RO | T | TS
 *
 * @param  {type} data incomming sensor data
 */
HidRobot.prototype.sortFinchMessages = function(data) {
    var data_array = new Uint8Array(data);
    if (data_array[7] === "T".charCodeAt()) {
        this.currentSensorData[7] = Math.round(((data_array[0] - 127) / 2.4 + 25) * 10) / 10;
    } else if (data_array[7] === "L".charCodeAt()) {
        this.currentSensorData[0] = Math.round(data_array[0] / 2.55)
        this.currentSensorData[1] = Math.round(data_array[1] / 2.55)
    } else if (data_array[7] === "I".charCodeAt()) {
        this.currentSensorData[5] = data_array[0]
        this.currentSensorData[6] = data_array[1]
    } else if (data_array[0] === 153) {
        this.currentSensorData[8] = data_array[4] // tap/shake
        var newdata = Array(3);
        for (var i = 1; i < 4; i++) {
            let value
            if (data_array[i] > 0x1F)
                value = (data_array[i] - 64) / 32 * 1.5;
            else
                value = data_array[i] / 32 * 1.5;

            newdata[i - 1] = Math.round(value * 10) / 10;
        }
        this.currentSensorData[2] = newdata[0]
        this.currentSensorData[3] = newdata[1]
        this.currentSensorData[4] = newdata[2]
    }
}
/**
 * HidRobot.prototype.onDisconnected - Called when the robot disconnects. Stops
 * the sensor polling.
 */
HidRobot.prototype.onDisconnected = function() {
  clearInterval(this.pollingTimer)
}
