const MAX_CONNECTIONS = 3;
var robots = []
var robotConnecting = null;

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

      console.log(device.name);
      const devLetter = getNextDevLetter();
      console.log("setting dev letter " + devLetter);
      robotConnecting = new Robot(device, devLetter);
      device.addEventListener('gattserverdisconnected', onDisconnected);
      // Attempts to connect to remote GATT Server.
      return device.gatt.connect();
    })
    .then(server => {
      // Getting Battery Service...
      console.log("getting service")
      return server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
    })
    .then(service => {
      console.log("getting characteristic from ")
      console.log(service)

      // Get receiving Characteristics
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
          console.log(error);
        });

      // Get sending Characteristics
      service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e")
        .then(characteristic => {
          robotConnecting.TX = characteristic;
          if (robotConnecting.RX != null) {
            onConnectionComplete();
          }
        })
        .catch(error => {
          console.log(error);
        });

    })
    .catch(error => {
      console.log(error);
    });
}

function onConnectionComplete() {
  if (robotConnecting == null || robotConnecting.RX == null || robotConnecting.TX == null) {
    console.error("onConnectionComplete: incomplete connection");
    return;
  }

  //Start polling sensors
  var pollStart = Uint8Array.of(0x62, 0x67);
  var pollStop = Uint8Array.of(0x62, 0x73);
  robotConnecting.write(pollStart);

  //test command
  //0xCA LED1 Reserved R1 G1 B1 R2 G2 B2 SS1 SS2 SS3 SS4 LED2 LED3 Time us(MSB) Time us(LSB) Time ms(MSB) Time ms(LSB)
  //var command = new Uint8Array([0xCA, 255, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0]);
  //robotConnecting.write(command);
  //robotConnecting.setLED(1, 100);
  //robotConnecting.setTriLED(1, 255, 255, 255);
  //robotConnecting.write(robotConnecting.setAllData);

  robots.push(robotConnecting);
  updateConnectedDevices();
  //displayConnectedDevice(robotConnecting);

  robotConnecting = null;
}

function onDisconnected(event) {
  let device = event.target;
  console.log('Device ' + device.name + ' is disconnected.');
}

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

function getRobotByName(name) {
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].device.name === name) {
      return robots[i]
    }
  }
  return null
}

function getRobotByLetter(letter) {
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].devLetter === letter) {
      return robots[i]
    }
  }
  return null
}

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

function devLetterUsed(letter) {
  var letterFound = false;
  for (let i = 0; i < robots.length; i++) {
    if (robots[i].devLetter == letter) { letterFound = true; }
  }
  return letterFound
}
