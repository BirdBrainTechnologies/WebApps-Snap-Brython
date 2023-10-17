/**
 * This file handles all bluetooth actions
 */


 /**
  *  Global variables/constants
  */
var robots = [] //Robot array representing all currently known robots

/*
About getting the ble state... Cannot really determine whether ble is turned on
in the computer - the ble chooser takes care of that and gives instructions
if ble is off. You can find out if the computer has ble capability with the
following (but availability will be true if ble is present but off):
navigator.bluetooth.getAvailability().then(isAvailable => {
  // get BLE availability by the promise value
});
navigator.bluetooth.addEventListener('availabilitychanged', e => {
  // get BLE availability by `e.value`
});
Theoretically, one can see if the user has granted ble permissions, but chrome
doesn't seem to be participating in that right now:
https://stackoverflow.com/questions/52221609/connect-to-a-paired-device-without-user-permission-in-chrome-web-bluetooth-api
https://bugs.chromium.org/p/chromium/issues/detail?id=577953
*/


/**
 * findAndConnect - Opens the chrome device chooser and connects to the chosen
 * device if it is of a recognized type.
 */
function findAndConnect() {
  if (getNextDevLetter() == null) {
    console.error("No more connections available.")
    return;
  }

  //uncomment for autoreconnect
  //When the user opens the chooser, cancel any robots currently
  // looking to reconnect.
  /*for (let i = 0; i < robots.length; i++) {
    if (robots[i].isReconnecting) {
      //This should cancel the connect attempt, but it doesn't seem to work.
      robots[i].device.gatt.disconnect();
      robots[i].isReconnecting = false;
    }
  }*/

  //Other ways to scan...
  //let bleFilters = [{ services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] }]
  //let bleFilters = [{ acceptAllDevices: true }]
  let bleFilters = [
    { namePrefix: "FN", services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] },
    { namePrefix: "BB", services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] },
    { namePrefix: "MB", services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] }
  ]
  if (useSnap) {
    bleFilters.push({ namePrefix: "GB", services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] })
  }
  if (FinchBlox) {
    bleFilters = [
      { namePrefix: "FN", services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] }
    ]
  }
  if (Hatchling) {
    bleFilters = [
      //{ namePrefix: "HL", services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] }
      {  services: ["bc4c31b0-647f-11ee-8c99-0242ac120002"]  }
    ]
  }
  //console.log(bleFilters)

  navigator.bluetooth.requestDevice({ filters: bleFilters }).then(device => {

      //Note: If a robot changes name from one scan to the next, this
      // device.name property still remains the same. The app must be reloaded
      // to see the new name.
      console.log("Connecting to " + device.name)

      //once the user has selected a device, check that it is a supported device.
      const type = Robot.getTypeFromName(device.name);
      if (type == null) {
        return Promise.reject(new Error("Device selected is not of a supported type."));
      }

      let robot = getRobotByName(device.name)
      if (robot == null) {
        robot = new Robot(device)
        robots.push(robot);
      }

      //This block is temporary until ble scanning is implemented. For now, we
      // will send the requested device to the dialog so that finchblox can set
      // the device up.
      if (FinchBlox) {
        finchBloxNotifyDiscovered(device)
        finchBloxRobot = robot
      }

      connectToRobot(robot)

    }).catch(error => {
      console.error("Error requesting device: " + error.message)
      updateConnectedDevices()
    })
}

function connectToRobot(robot) {

  if (robot.devLetter == "X") {
    robot.devLetter = getNextDevLetter();
  } else {
    console.log(robot.device.name + " is already at position " + robot.devLetter + ".")
  }
  let device = robot.device

  //Get a notification if this device disconnects.
  device.addEventListener('gattserverdisconnected', onDisconnected);
  //Attempt to connect to remote GATT Server.
  device.gatt.connect().then(server => {
      // Get the Service
      //console.log("getting service")
      if (Hatchling) { return server.getPrimaryService("bc4c31b0-647f-11ee-8c99-0242ac120002") }
      return server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
    })
    .then(service => {
      //console.log("getting characteristic from ")
      //console.log(service)
      let txuuid = Hatchling ? "bc4c31b1-647f-11ee-8c99-0242ac120002" : "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
      let rxuuid = Hatchling ? "bc4c31b2-647f-11ee-8c99-0242ac120002" : "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

      // Get receiving Characteristic
      service.getCharacteristic(rxuuid)
        .then(characteristic => characteristic.startNotifications())
        .then(characteristic => {
          characteristic.addEventListener('characteristicvaluechanged',
            onCharacteristicValueChanged);
          //console.log('Notifications have been started.');
          robot.RX = characteristic;
          if (robot.TX != null) {
            onConnectionComplete(robot);
          }
        })
        .catch(error => {
          console.error("Failed to get RX: " + error.message);
        });

      // Get sending Characteristic
      service.getCharacteristic(txuuid)
        .then(characteristic => {
          robot.TX = characteristic;
          if (robot.RX != null) {
            onConnectionComplete(robot);
          }
        })
        .catch(error => {
          console.error("Failed to get TX: " + error.message);
        });

    })
    .catch(error => {
      console.error("Device request failed: " + error.message);
      //robot.isReconnecting = false //uncomment for autoreconnect
      /*if (robot.isReconnecting) {
        //console.error("Should attempt to reconnect...")
        setTimeout(function() {
          console.log("Attempting to reconnect again to " + robot.fancyName)
          connectToRobot(robot)
        }, 2000)
      }*/
    });
}

/**
 * onConnectionComplete - Called when a device has been connected and its RX
 * and TX characteristics discovered. Starts polling for sensor data, adds the
 * device to the array of connected robots, and loads the snap iframe.
 */
function onConnectionComplete(robot) {
  if (robot == null || robot.RX == null || robot.TX == null) {
    console.error("onConnectionComplete: incomplete connection");
    robot = null
    return;
  }

  //console.log("Connection to " + robot.fancyName + " complete. Starting sensor polling.")
  robot.initialize()

  closeErrorModal()


  if (!robots.includes(robot)) { robots.push(robot) }
  if (FinchBlox && fbFrontend.RowDialog.currentDialog && fbFrontend.RowDialog.currentDialog.constructor == fbFrontend.DiscoverDialog) {
    finchBloxRobot = robot
  }
  updateConnectedDevices();
  updateBatteryStatus()
  //open snap or brython.
  loadIDE();
}

/**
 * onDisconnected - Handles robot disconnection events.
 *
 * @param  {Object} event Disconnection event
 */
function onDisconnected(event) {
  let device = event.target;
  //console.log('Device ' + device.name + ' is disconnected.');
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].device.name == device.name && robots[i].isConnected) {
      sendMessage({
        robot: robots[i].devLetter,
        connectionLost: true
      });
      let cf = " " + thisLocaleTable["Connection_Failure"];
      let msg = robots[i].fancyName + cf;
      showErrorModal(cf, msg, true)
      robots[i].externalDisconnect();
    }
  }
}

/**
 * onCharacteristicValueChanged - Handles characteristic value changes. This is
 * called when there is a sensor notification. Passes the data to the snap
 * iframe if available, and updates the device's Robot object.
 *
 * @param  {Object} event Characteristic value change event
 */
function onCharacteristicValueChanged(event) {
  var dataArray = new Uint8Array(event.target.value.buffer);
  var deviceName = event.target.service.device.name;
  //console.log('Received from ' + deviceName + ":");
  //console.log(dataArray);
  const robot = getRobotByName(deviceName)
  if (robot != null && dataArray != null) {
    robot.receiveSensorData(dataArray)
  }
}

/**
 * getRobotByName - Returns the Robot with the given device name or null if no
 * device with that name is found.
 *
 * @param  {string} name Robot's advertised name
 * @return {?Robot}      Robot found or null if not found
 */
function getRobotByName(name) {
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].device.name === name) {
      return robots[i]
    }
  }
  return null
}

/**
 * getRobotByLetter - Returns the Robot associated with the given device letter
 * (A, B, or C), or null if there is none.
 *
 * @param  {string} letter Character id to look for (A, B, or C)
 * @return {?Robot}        Robot identified by the given letter, or null if none is found
 */
function getRobotByLetter(letter) {
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].devLetter === letter) {
      return robots[i]
    }
  }
  return null
}

/**
 * getNextDevLetter - Returns the next available id letter starting with A and
 * ending with C. Max 3 connections.
 *
 * @return {?string}  Next available id letter of null if they are all taken
 */
function getNextDevLetter() {
  let letter = 'A';
  if (!devLetterUsed(letter)) {
    return letter;
  } else {
    letter = 'B'
    if (!devLetterUsed(letter)) {
      return letter;
    } else {
      letter = 'C'
      if (!devLetterUsed(letter)) {
        return letter;
      } else {
        return null
      }
    }
  }
}

/**
 * devLetterUsed - Checks to see if any of the currently connected robots are
 * using the given id letter.
 *
 * @param  {string} letter Letter to check for
 * @return {boolean}       True if the letter is currently being used.
 */
function devLetterUsed(letter) {
  let letterFound = false;
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].devLetter == letter) { letterFound = true; }
  }
  return letterFound;
}

/**
 * getConnectedRobotCount - Returns a count of the number of currently
 * connected robots.
 *
 * @return {number}  Number of connected robots
 */
function getConnectedRobotCount() {
  let count = 0;
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].isConnected) { count += 1; }
  }
  return count;
}

function getFirstConnectedRobot() {
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].isConnected) { return robots[i] }
  }
  return null
}

/**
 * getDisplayedRobotCount - Returns the number of robots that are currently
 * displayed in the list.
 *
 * @return {type}  description
 */
function getDisplayedRobotCount() {
  let count = 0;
  for (let i = 0; i < robots.length; i++) {
    if (!robots[i].userDisconnected) { count += 1; }
  }
  return count;
}

/**
 * allRobotsAreFinches - Checks whether all connected robots are finches.
 *
 * @return {boolean}  True if all connected robots are finches
 */
function allRobotsAreFinches() {
  let onlyFinches = true;
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].isConnected && robots[i].type != Robot.ofType.FINCH) {
      onlyFinches = false;
    }
  }
  return onlyFinches;
}

function allRobotsAreGlowBoards() {
  let onlyGB = true;
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].isConnected && !robots[i].isA(Robot.ofType.GLOWBOARD)) {
      onlyGB = false;
    }
  }
  return onlyGB;
}

/**
 * noRobotsAreFinches - Checks to see if any of the robots are finches.
 *
 * @return {boolean}  True if none of the connected robots are finches.
 */
function noRobotsAreFinches() {
  let noFinches = true;
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].isConnected && robots[i].type == Robot.ofType.FINCH) {
      noFinches = false;
    }
  }
  return noFinches;
}
