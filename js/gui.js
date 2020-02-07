$('#finder').css("display", "block");

//TODO: this is the spinner that you see instead of the connected robots list. Do we ever want this?
$('#startupState').css("display", "none");

setLanguage();

var robots = []
var robotConnecting = null;
var iframe = null; //a frame for snap

$('#find-button').on('click', function(e) {
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
});

function onConnectionComplete() {
  if (robotConnecting == null || robotConnecting.RX == null || robotConnecting.TX == null) {
    console.error("onConnectionComplete: incomplete connection");
    return;
  }

  //Start polling sensors
  var pollStart = Uint8Array.of(62, 67);
  var pollStop = Uint8Array.of(62, 73);
  //robotConnecting.write(pollStart);

  //test command
  //0xCA LED1 Reserved R1 G1 B1 R2 G2 B2 SS1 SS2 SS3 SS4 LED2 LED3 Time us(MSB) Time us(LSB) Time ms(MSB) Time ms(LSB)
  //var command = new Uint8Array([0xCA, 255, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0]);
  //robotConnecting.write(command);
  //robotConnecting.setLED(1, 100);
  robotConnecting.setTriLED(1, 255, 255, 255);
  robotConnecting.write(robotConnecting.setAllData);

  robots.push(robotConnecting);
  updateConnectedDevices();
  //displayConnectedDevice(robotConnecting);

  robotConnecting = null;
}

function updateConnectedDevices() {
  $('#robots-connected').empty();
  if (robots.length == 0) {
    $('#connection-state').css("visibility", "hidden");
    $('#startProgramming').css("visibility", "hidden");
  } else {
    $('#connection-state').css("visibility", "visible");
    if (iframe == null) {
      $('#startProgramming').css("visibility", "visible");
    }

    robots.forEach(robot => {
      displayConnectedDevice(robot);
    })
  }
}

// Display connected deivce(s)
function displayConnectedDevice(robot) {
  var deviceImage = "img/img-hummingbird-bit.svg"
  var deviceFancyName = robot.fancyName;
  var batteryDisplay = "style=\"display:inline-block\"";


  if (robot.device.name.startsWith("MB")) {
    deviceImage = "img/img-bit.svg";
    batteryDisplay = "style=\"display:none\"";
  } else if (robot.device.name.startsWith("FN")) {
    deviceImage = "img/img-finch.svg";
  }

  var el = $(

    "             <div class=\"row robot-item\">" +
    "               <div class=\"col-xs-2 img\"> <img src=\"" + deviceImage + "\" alt=\"Hummingbird Bit\" /></div>" +
    "               <div class=\"col-xs-6 name\">" + deviceFancyName + "</div>" +
    "               <div class=\"col-xs-4 buttons\">" +

    //Battery for Hummingbits and Finches only
    "                 <div style=\"display:inline-block\">" +
    "                   <span " + batteryDisplay + " class=\"button button-battery fa-stack fa-2x\"><i class=\"fas /*fa-battery-full fa-battery-half*/ /*fa-battery-quarter*/ fa-stack-2x\"></i></span>                " +

    //Calibrate button
    "                   <a class=\"button\" href=\"#\" ><span class=\"button-calibrate fa-stack fa-2x\">" +
    "                     <i class=\"fas fa-square fa-stack-2x\"></i>" +
    "                     <i class=\"fas fa-compass fa-stack-1x fa-inverse\"></i>" +
    "                   </span></a>" +
    "                  </div>" +

    //Disconnect Button
    "                 <a class=\"button\" href=\"#\"><span class=\"button-disconnect fa-stack fa-2x\">" +
    "                   <i class=\"fas fa-circle fa-stack-2x\"></i>" +
    "                   <i class=\"fas fa-minus fa-stack-1x fa-inverse\"></i>" +
    "                 </span></a>" +
    "               </div>" +
    "             </div>"


  );

  el.find('.button-disconnect').click(function() {
    console.log("button-disconnect");
    robot.disconnect();
  });

  el.find('.button-calibrate').click(function() {
    console.log("button-calibrate");

  });

  robot.displayElement = el;

  $('#robots-connected').append(el);
}

function onDisconnected(event) {
  let device = event.target;
  console.log('Device ' + device.name + ' is disconnected.');
}

function onCharacteristicValueChanged(event) {
  var value = event.target.value;
  console.log('Received ' + value);
}

$('#startProgramming').on('click', function(e) {
  $('#startProgramming').css("visibility", "hidden");

  //<iframe src="https://snap.berkeley.edu/snap/snap.html" width="100%" height="600">blabla</iframe>
  iframe = document.createElement("iframe");
  iframe.src = "https://snap.berkeley.edu/snap/snap.html";
  iframe.width = "100%";
  iframe.height = "600";

  document.body.appendChild(iframe);
})
