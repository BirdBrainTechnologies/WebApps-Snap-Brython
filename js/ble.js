/**
 * This file handles all bluetooth actions
 */


 /**
  *  Global variables/constants
  */
const MAX_CONNECTIONS = 3; //If increased, make sure to update getNextDevLetter
var robots = [] //Robot array representing all currently connected robots
var robotConnecting = null; //Robot that is in the process of connecting

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
  if (robotConnecting || robots.length == MAX_CONNECTIONS) {
    return;
  }
  navigator.bluetooth.requestDevice({
      //acceptAllDevices: true
      filters: [{
        services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
        //namePrefix: "FN"
      }]
    })
    .then(device => {

      //once the user has selected a device, check that it is a supported device.
      console.log("User selected " + device.name);
      const type = Robot.getTypeFromName(device.name);
      if (type == null) {
        return Promise.reject(new Error("Device selected is not of a supported type."));
      }

      //if the device is supported, assign it a letter and Robot object.
      const devLetter = getNextDevLetter();
      console.log("setting dev letter " + devLetter);
      robotConnecting = new Robot(device, devLetter);
      //Get a notification if this device disconnects.
      device.addEventListener('gattserverdisconnected', onDisconnected);
      //Attempt to connect to remote GATT Server.
      return device.gatt.connect();
    })
    .then(server => {
      // Get the Service
      console.log("getting service")
      return server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
    })
    .then(service => {
      console.log("getting characteristic from ")
      console.log(service)

      // Get receiving Characteristic
      service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e")
        .then(characteristic => characteristic.startNotifications())
        .then(characteristic => {
          characteristic.addEventListener('characteristicvaluechanged',
            onCharacteristicValueChanged);
          console.log('Notifications have been started.');
          robotConnecting.RX = characteristic;
          if (robotConnecting.TX != null) {
            onConnectionComplete();
          }
        })
        .catch(error => {
          console.error("Failed to get RX: " + error.message);
        });

      // Get sending Characteristic
      service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e")
        .then(characteristic => {
          robotConnecting.TX = characteristic;
          if (robotConnecting.RX != null) {
            onConnectionComplete();
          }
        })
        .catch(error => {
          console.error("Failed to get TX: " + error.message);
        });

    })
    .catch(error => {
      console.error("Device request failed: " + error.message);
    });
}

/**
 * onConnectionComplete - Called when a device has been connected and its RX
 * and TX characteristics discovered. Starts polling for sensor data, adds the
 * device to the array of connected robots, and loads the snap iframe.
 */
function onConnectionComplete() {
  if (robotConnecting == null || robotConnecting.RX == null || robotConnecting.TX == null) {
    console.error("onConnectionComplete: incomplete connection");
    return;
  }

  console.log("Connection to " + robotConnecting.fancyName + " complete. Starting sensor polling.")

  //Start polling sensors
  var pollStart = Uint8Array.of(0x62, 0x67);
  var pollStop = Uint8Array.of(0x62, 0x73);
  robotConnecting.write(pollStart);

  //Start the setAll timer
  robotConnecting.startSetAll();

  //Add robot to the list and open snap
  robots.push(robotConnecting);
  updateConnectedDevices();
  robotConnecting = null;
  loadSnap();
}

/**
 * onDisconnected - Handles robot disconnection events.
 *
 * @param  {Object} event Disconnection event
 */
function onDisconnected(event) {
  let device = event.target;
  console.log('Device ' + device.name + ' is disconnected.');
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].device.name == device.name) {
      robots.splice(i, 1);
      updateConnectedDevices();
      //In the case that the robot is still in the list, it has disconnected
      // from outside the app. Start some sort of auto reconnect here?
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
    sendMessage({
      robot: robot.devLetter,
      robotType: robot.type,
      sensorData: dataArray
    });
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
 * ending with C.
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
 * allRobotsAreFinches - Checks whether all connected robots are finches.
 *
 * @return {boolean}  True if all connected robots are finches
 */
function allRobotsAreFinches() {
  let onlyFinches = true;
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].type != Robot.ofType.FINCH) { onlyFinches = false; }
  }
  return onlyFinches;
}

/**
 * noRobotsAreFinches - Checks to see if any of the robots are finches.
 *
 * @return {boolean}  True if none of the connected robots are finches.
 */
function noRobotsAreFinches() {
  let noFinches = true;
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].type == Robot.ofType.FINCH) { noFinches = false; }
  }
  return noFinches;
}
