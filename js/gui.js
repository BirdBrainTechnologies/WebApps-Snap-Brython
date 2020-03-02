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

  //hide the find robots button if we are already connected to the max.
  if (robots.length == MAX_CONNECTIONS) {
    $('#find-button').hide();
  } else {
    $('#find-button').show();
  }

  if (robots.length == 0) {
    $('#connection-state').css("visibility", "hidden");
    $('#startProgramming').hide();
  } else {
    $('#connection-state').css("visibility", "visible");
    if (iframe == null) {
      $('#startProgramming').show();
    } else {
      $('#startProgramming').hide();
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
    robot.startCalibration();
    showCalibrationModal(robot.type);
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

  let projectName = "PWAFinchSingleDevice";
  if (robots.length == 1 && (robots[0].type == Robot.ofType.HUMMINGBIRDBIT ||
    robots[0].type == Robot.ofType.MICROBIT)) {
      projectName = "PWAHummingbirdSingleDevice";
  }
  
  iframe = document.createElement("iframe");
  if (internetIsConnected) {
    iframe.src = "https://snap.berkeley.edu/snap/snap.html#present:Username=birdbraintech&ProjectName=" + projectName + "&editMode&lang=" + language;
  } else {
    //iframe.src = "snap/snap.html";
    iframe.src = "snap/snap.html#open:/snap/snapProjects/" + projectName + ".xml&editMode&lang=" + language;
  }

  console.log("opening iframe with src=" + iframe.src);
  let div = document.getElementById('snap-div');
  div.appendChild(iframe);

  expandSnap();
})

$('#btn-expand-section').on('click', function(e) {
  $(this).hide();
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
  $('#btn-expand-section').show();
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

function showCalibrationModal(robotType) {
  /* basic modal setup */
  const section = document.createElement('section');
  section.setAttribute("class", "modal");
  section.setAttribute("style", "display: none;")
  //Make a container to hold everything
  const container = document.createElement('div');
  container.setAttribute("class", "container")
  container.setAttribute("style", "position: relative; margin: 0 auto; height: auto; width: 95%; top: 50%; transform: translateY(-50%);");
  //Create the parts
  const header = document.createElement('h2');
  var icon = document.createElement('i');
  const span = document.createElement('span');
  //Make a container for the video and any other animations
  const animation = document.createElement('div');
  animation.setAttribute("class", "animation");
  /* end basic modal setup */

  let videoName = null;
  switch (robotType) {
    case Robot.ofType.FINCH:
      videoName = "Finch_Calibration";
      break;
    case Robot.ofType.HUMMINGBIRDBIT:
      videoName = "HummBit_Calibration";
      break;
    case Robot.ofType.MICROBIT:
      videoName = "MicroBit_Calibration";
      break;
  }

  //calibration specific settings
  section.setAttribute("id", "calibrate-modal");
  icon.setAttribute("class", "fas fa-compass");
  span.setAttribute("id", "CompassCalibrate");
  span.textContent = " " + thisLocaleTable["CompassCalibrate"] + " ";

  //create checkmark and x to show the status when calibration is complete
  const status = document.createElement('div');
  status.setAttribute("class", "status /*status-success*/ /*status-fail*/");
  const check = document.createElement('i');
  check.setAttribute("class", "fas fa-check bounce");
  status.appendChild(check);
  const times = document.createElement('i');
  times.setAttribute("class", "fas fa-times bounce");
  status.appendChild(times);
  animation.appendChild(status);

  //Make a button to close the calibration modal
  var onClickCloseBtn = "return closeVideoModals();";
  const closeBtn = document.createElement('a');
  closeBtn.setAttribute("href", "#");
  closeBtn.setAttribute("onclick", onClickCloseBtn);
  closeBtn.setAttribute("class", "close btn btn-modal");
  const btnIcon = document.createElement('i');
  btnIcon.setAttribute("class", "fas fa-times");
  closeBtn.appendChild(btnIcon);
  container.appendChild(closeBtn);

  //Make the video element
  const videoElement = document.createElement('video');
  videoElement.setAttribute("type", "video/mp4");
  videoElement.setAttribute("id", "video" + videoName);
  videoElement.setAttribute("loop", "loop");
  videoElement.src = "vid/" + videoName + ".mp4";
  videoElement.muted = true; //video must be muted to autoplay on Android.
  //Wait until the video is ready to play to display it.
  videoElement.addEventListener('canplay', function() {
    section.setAttribute("style", "display: block;");
    videoElement.play();
  }, false);

  //connect up the finished parts
  header.appendChild(icon);
  header.appendChild(span);
  container.appendChild(header);
  animation.appendChild(videoElement);
  container.appendChild(animation);
  section.appendChild(container);
  document.body.appendChild(section);

  /* If overlay of modal window is clicked, close calibration window */
  $(".modal").click(function() {
    closeVideoModals();
  }).children().click(function(e) {
    return false;
  });
}

function updateCalibrationStatus(success) {
  var ha = $('#calibrate-modal .animation').height();
  var hi = $('#calibrate-modal .animation i').height();
  $('#calibrate-modal .animation i').css('marginTop', ((ha - hi) / 2) + 'px');
  if (success) {
    $('#calibrate-modal .status').addClass('status-success');
    setTimeout(function() {
      closeVideoModals();
    }, 3000);
  } else {
    $('#calibrate-modal .status').addClass('status-fail');
  }
}

function closeVideoModals() {
  const videosOpen = document.getElementsByTagName("video").length;
  if (videosOpen > 0) {
    for (var i = 0; i < videosOpen; i++) {
      const videoElement = document.getElementsByTagName("video")[i];
      console.log("removing video " + videoElement.id);
      //Fully unload the video.
      //see https://stackoverflow.com/questions/3258587/how-to-properly-unload-destroy-a-video-element
      videoElement.pause();
      videoElement.removeAttribute('src'); // empty source
      videoElement.load();

      //Remove the whole modal.
      //Each video is presented inside a div element inside a div element
      //inside a section. This is what must be removed.
      const animation = videoElement.parentNode;
      const container = animation.parentNode;
      const section = container.parentNode

      section.parentNode.removeChild(section);
    }
  }
}
