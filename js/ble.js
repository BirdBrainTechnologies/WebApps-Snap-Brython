var robots = []
var robotConnecting = null;

function findAndConnect() {
  if (robotConnecting) {
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
      robotConnecting = new Robot(device);
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
  sendMessage({sensorData: dataArray});
}
