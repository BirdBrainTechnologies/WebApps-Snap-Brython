$('#finder').css("display", "block");

//TODO: this is the spinner that you see instead of the connected robots list. Do we ever want this?
$('#startupState').css("display", "none");



var robots = []
var deviceConnecting = null;

$('#find-button').on('click', function(e) {
  if (deviceConnecting) { return; }
  navigator.bluetooth.requestDevice({
      //acceptAllDevices: true
      filters: [{
        services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
        //namePrefix: "FN"
      }]
    })
    .then(device => {

      console.log(device.name);
      deviceConnecting = new Robot(device);
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
      // Getting Characteristics
      service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e").then((char) => {
        console.log(char)
        deviceConnecting.RX = char;
        if (deviceConnecting.TX != null) { onConnectionComplete(); }
      })
      service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e").then((char) => {
        console.log(char)
        deviceConnecting.TX = char;
        if (deviceConnecting.RX != null) { onConnectionComplete(); }
      })
    })
    .catch(error => {
      console.log(error);
    });
});

function onConnectionComplete() {
  if (deviceConnecting == null || deviceConnecting.RX == null || deviceConnecting.TX == null) {
    console.error("onConnectionComplete: incomplete connection");
    return;
  }

  robots.push(deviceConnecting);
  //updateConnectedDevices();
  displayConnectedDevice(deviceConnecting);

  deviceConnecting = null;
}

function updateConnectedDevices() {
  $('#robots-connected').empty();
  if (robots.length == 0) {
    $('#connection-state').css("visibility", "hidden");
    $('#startProgramming').css("visibility", "hidden");
  } else {
    $('#connection-state').css("visibility", "visible");
    $('#startProgramming').css("visibility", "visible");

    robots.forEach(robot => {
      displayConnectedDevice(robot);
    })
  }
}

// Display connected deivce(s)
function displayConnectedDevice(robot) {
  var deviceImage = "img/img-hummingbird-bit.svg"
  var deviceFancyName = robot.name;
  var batteryDisplay = "style=\"display:inline-block\"";

  if (robot.name.startsWith("MB")) {
    deviceImage = "img/img-bit.svg";
    batteryDisplay = "style=\"display:none\"";
  } else if (robot.name.startsWith("FN")) {
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
    "                  </div>"+

    //Disconnect Button
    "                 <a class=\"button\" href=\"#\"><span class=\"button-disconnect fa-stack fa-2x\">"+
    "                   <i class=\"fas fa-circle fa-stack-2x\"></i>"+
    "                   <i class=\"fas fa-minus fa-stack-1x fa-inverse\"></i>"+
    "                 </span></a>"+
    "               </div>"+
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
