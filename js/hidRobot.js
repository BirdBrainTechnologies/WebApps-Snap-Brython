


function HidRobot(device) {
  this.device = device
  this.isFinch = (device.productId == 0x1111) //0x2222 for HB?
  this.currentSensorData = [0,0,0,0,0,0,0,0]
  this.pollingTimer = null

  device.addEventListener("inputreport", this.handleInputReport.bind(this));
  this.pollSensors()
  console.log("hey")
}

HidRobot.requestFinchSensorData = function() {
  this.sendBytes(HidRobot.makeFinchRequest("T"),
    [HidRobot.makeFinchRequest("L"), HidRobot.makeFinchRequest("I"),
      HidRobot.makeFinchRequest("A")])
}
HidRobot.makeFinchRequest = function(c) {
    var bytes = new Uint8Array([0,0,0,0,0,0,0,0]);
    //temperature
    bytes[0] = c.charCodeAt();
    bytes[7] = c.charCodeAt();
    return bytes;
}
HidRobot.requestDuoSensorData = function () {
  var bytes = new Uint8Array([0,0,0,0,0,0,0,0]);
  //all sensors
  bytes[0] = "G".charCodeAt(0);
  bytes[1] = "3".charCodeAt(0);
  this.sendBytes(bytes)
}

HidRobot.prototype.sendBytes = function(bytes, messageQueue) {
  this.device.sendReport(0, bytes).then(() => {
    //console.log("Sent bytes " + bytes);
    if (messageQueue && messageQueue.length > 0) {
      let nextMessage = messageQueue.shift()
      setTimeout(function() {
        this.sendBytes(nextMessage, messageQueue)
      }.bind(this), 10)//TODO: is this enough time? Do we need to wait at all?
    }
  }).catch(error => {
    console.error("ERROR sending report: " + error.message)
  });
}

HidRobot.prototype.pollSensors = function() {
  let requestSensorData
  let frequency
  if (this.isFinch) {
    console.log("Starting Finch sensor polling")
    requestSensorData = HidRobot.requestFinchSensorData
    frequency = 200
  } else {
    console.log("Starting Hummingbird Duo sensor polling")
    requestSensorData = HidRobot.requestDuoSensorData
    frequency = 50
  }

  this.pollingTimer = setInterval(requestSensorData.bind(this), frequency)
}

HidRobot.prototype.handleInputReport = function(e) {
  //console.log(e.device.productName + ": got input report " + e.reportId);
  //console.log(new Uint8Array(e.data.buffer));
  //console.log(this)
  if (this.isFinch) {
    this.sortFinchMessages(e.data.buffer)
  } else {
    this.currentSensorData = new Uint8Array(e.data.buffer)
  }
  //console.log(this.currentSensorData)
  sendMessage({
    hidSensorData: this.currentSensorData
  });
}
/**
 * HidRobot.prototype.sortFinchMessages - this is called on a report recieved
 * from the finch, it figures out hat sensor the report is about and saves it
 * NOTE: calculations are already made to convert the raw sensor data into
 * usable information. Temperature is in Celcius.
 *
 * currentSensorData - LL | RL | AX | AY | AZ | LO | RO | T
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

HidRobot.prototype.onDisconnected = function() {
  clearInterval(this.pollingTimer)
}
