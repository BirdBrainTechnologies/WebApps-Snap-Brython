const header = document.getElementById('main-header');
const finder = document.getElementById('finder');
const connected = document.getElementById('connected');
var snapExpanded = false;
var internetIsConnected = false;
updateInternetStatus();
setInterval(updateInternetStatus, 5000);

$('#finder').css("display", "block");

//TODO: this is the spinner that you see instead of the connected robots list. Do we ever want this?
$('#startupState').css("display", "none");

var language = "en"
setLanguage();

var iframe = null; //a frame for snap

$('#find-button').on('click', function(e) {
  findAndConnect();
});



function updateConnectedDevices() {
  $('#robots-connected').empty();
  $('#robots-connected-snap').empty();

  if (robots.length == 0) {
    $('#connection-state').css("visibility", "hidden");
    $('#startProgramming').css("visibility", "hidden");
  } else {
    $('#connection-state').css("visibility", "visible");
    if (iframe == null) {
      $('#startProgramming').css("visibility", "visible");
    } else {
      $('#startProgramming').css("visibility", "hidden");
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
  var deviceLetter = robot.devLetter;
  var batteryDisplay = "style=\"display:inline-block\"";

  switch (robot.type) {
    case Robot.ofType.MICROBIT:
      deviceImage = "img/img-bit.svg";
      batteryDisplay = "style=\"display:none\"";
      break;
    case Robot.ofType.FINCH:
      deviceImage = "img/img-finch.svg";
  }

  var el = $(

    "             <div class=\"row robot-item\">" +
    "               <div class=\"col-xs-2 img\">" + deviceLetter + " <img src=\"" + deviceImage + "\" alt=\"Hummingbird Bit\" /></div>" +
    "               <div class=\"col-xs-6 name\">" + deviceFancyName + "</div>" +
    "               <div class=\"col-xs-4 buttons\">" +

    //Battery for Hummingbits and Finches only
    "                 <div style=\"display:inline-block\">" +
    "                   <span " + batteryDisplay + " class=\"button button-battery button-battery-" + deviceLetter + " fa-stack fa-2x\"><i class=\"fas /*fa-battery-full fa-battery-half*/ /*fa-battery-quarter*/ fa-stack-2x\"></i></span>                " +

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

  robot.displayElement = el; //TODO: need this?

  if (snapExpanded) {
    $('#robots-connected-snap').append(el);
  } else {
    $('#robots-connected').append(el);
  }
  updateBatteryStatus();
}


$('#startProgramming').on('click', function(e) {
  updateInternetStatus();
  //$('#startProgramming').css("visibility", "hidden");
  //$('#main-header').css("visibility", "hidden");
  //$('#finder').css("visibility", "hidden");
  //header.remove();
  //finder.remove();
  //connected.remove();

  //snapExpanded = true;
  //updateConnectedDevices();

  //const connectedRobotsHeight = document.getElementById('robots-connected-snap').offsetHeight;
  //const snapHeight = window.innerHeight - connectedRobotsHeight;
  //console.log("crh " + connectedRobotsHeight + " sh " + snapHeight);
  //<iframe src="https://snap.berkeley.edu/snap/snap.html" width="100%" height="600">blabla</iframe>
  let projectName = "PWAFinchSingleDevice";
  iframe = document.createElement("iframe");
  if (internetIsConnected) {
    iframe.src = "https://snap.berkeley.edu/snap/snap.html";
  } else {
    //iframe.src = "snap/snap.html";
    iframe.src = "snap/snap.html#open:/snap/snapProjects/" + projectName + ".xml&editMode&noRun&lang=" + language;
  }

  //iframe.width = "100%";
  //iframe.height = "500";
  console.log("opening iframe with src=" + iframe.src);
  let div = document.getElementById('snap-div');
  div.appendChild(iframe);

  //document.body.appendChild(iframe);
  //$('#connected-expanded').css("visibility", "visible");
  expandSnap();
})

$('#btn-expand-section').on('click', function(e) {
  snapExpanded = false;
  $('#connected-expanded').css("visibility", "hidden");
  document.body.insertBefore(connected, document.body.childNodes[0]);
  document.body.insertBefore(finder, document.body.childNodes[0]);
  document.body.insertBefore(header, document.body.childNodes[0]);
  updateConnectedDevices();
  $('#btn-collapse-section').css("visibility", "visible");
})

$('#btn-collapse-section').on('click', function(e) {
  expandSnap();
})

function expandSnap() {
  header.remove();
  finder.remove();
  connected.remove();

  snapExpanded = true;
  updateConnectedDevices();
  $('#connected-expanded').css("visibility", "visible");
}

function updateBatteryStatus() {
  //For some reason, all battery icons have their classes removed
  // when trying to remove them from only one. So, here we remove
  // all of them and add back all the correct ones.
  var battSelector = '.button-battery i';
  $(battSelector).removeClass("fa-battery-full");
  $(battSelector).removeClass("fa-battery-half");
  $(battSelector).removeClass("fa-battery-quarter");

  robots.forEach(function (robot) {
    console.log("Updating battery status for " + robot.devLetter + " of type " + robot.type + " to " + robot.batteryLevel)
    battSelector = '.button-battery-' + robot.devLetter + ' i';

    switch (robot.batteryLevel) {
      case Robot.batteryLevel.HIGH:
        $(battSelector).addClass("fa-battery-full");
        break;
      case Robot.batteryLevel.MEDIUM:
        $(battSelector).addClass("fa-battery-half");
        break;
      case Robot.batteryLevel.LOW:
        $(battSelector).addClass("fa-battery-quarter");
        break;
      default: //UNKNOWN
    }
  })
}

function updateInternetStatus() {
  const connected = navigator.onLine;
  if (connected === internetIsConnected) {
    return;
  }
  internetIsConnected = connected;

  if (connected) {
    $('#indicator-wifi').addClass("indicator-on");
  } else {
    $('#indicator-wifi').removeClass("indicator-on");
  }
}
