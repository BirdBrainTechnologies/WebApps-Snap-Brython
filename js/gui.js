/**
 * This file handles all interactions with the main UI.
 */


/**
 * Global variables/constants and initial setup.
 */
const header = document.getElementById('main-header');
const finder = document.getElementById('finder');
const connected = document.getElementById('connected');
var ideExpanded = false;
var internetIsConnected = false;
var currentSnapProject = "";
var iframe = null; //a frame for snap
var language = "en"
setLanguage();
updateInternetStatus();
setInterval(updateInternetStatus, 5000);
//This is the spinner that you see instead of the connected robots list.
$('#startupState').css("display", "none");
//Set the find robots button to bring up the chrome device chooser.
$('#find-button').on('click', function(e) { findAndConnect(); });
//$('#startProgramming').on('click', function(e) { loadSnap(); })
$('#btn-expand-section').on('click', function(e) { collapseIDE(); })
$('#btn-collapse-section').on('click', function(e) { expandIDE(); })

/**
 * onLoad - Handles everything that needs to be done once the window has loaded.
 * Called right after the service worker registration is started.
 */
function onLoad() {
  let user = navigator.userAgent;
  let usingChrome = false;
  console.log(user);
  if (user.includes("Chrome")) {
    console.log("Found chrome")
    usingChrome = true;
  }
  if (!usingChrome) {
    let title = " " + thisLocaleTable["Incompatible_Browser"] + " "
    let message = thisLocaleTable["Use_Chrome"]
    showErrorModal(title, message, false);
  } else {
    navigator.bluetooth.getAvailability().then(isAvailable => {
      if (!isAvailable) {
        let title = " " + thisLocaleTable["No_Ble"] + " "
        let message = thisLocaleTable["Ble_Required"]
        showErrorModal(title, message, false);
      }
    });
  }
}

/**
 * updateConnectedDevices - Updates the list of connected devices seen by the
 * user.
 */
function updateConnectedDevices() {
  if (FinchBlox) {
    console.log("Updating FinchBlox connected devices")

    let guiDevice = RowDialog.currentDialog.discoveredDevices[0];
    RowDialog.currentDialog.selectDevice(guiDevice)
    CallbackManager.robot.updateStatus(robotConnecting.device.name, true)

    return;
  }

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
    //$('#startProgramming').hide();
  } else {
    $('#connection-state').css("visibility", "visible");
    /*if (iframe == null) {
      $('#startProgramming').show();
    } else {
      $('#startProgramming').hide();
    }*/

    robots.forEach(robot => {
      displayConnectedDevice(robot);
    })
  }
}

/**
 * displayConnectedDevice - Sets up the display for a single connected robot.
 *
 * @param  {type} robot description
 * @return {type}       description
 */
function displayConnectedDevice(robot) {
  var deviceImage = "img/img-hummingbird-bit.svg"
  var deviceFancyName = robot.fancyName;
  var deviceLetter = robot.devLetter;
  var batteryDisplay = "style=\"display:inline-block\"";
  var el = null;
  console.log("displayConnectedDevice " + deviceFancyName + " " + robot.isConnected)
  if (robot.isConnected) {

    switch (robot.type) {
      case Robot.ofType.MICROBIT:
        deviceImage = "img/img-bit.svg";
        batteryDisplay = "style=\"display:none\"";
        break;
      case Robot.ofType.FINCH:
        deviceImage = "img/img-finch.svg";
    }

    el = $(

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

    el.find('.button-calibrate').click(function() {
      console.log("button-calibrate");
      robot.startCalibration();
      showCalibrationModal(robot.type);
    });
  } else {
    el = $(

      "             <div class=\"row robot-item\">" +
      "               <div class=\"col-xs-10 name\">" + thisLocaleTable["Connection_Failure"] + ": " + deviceFancyName + "</div>" +
      "               <div class=\"col-xs-2 buttons\">" +
      //Disconnect Button
      "                 <a class=\"button\" href=\"#\"><span class=\"button-disconnect fa-stack fa-2x\">" +
      "                   <i class=\"fas fa-circle fa-stack-2x\"></i>" +
      "                   <i class=\"fas fa-minus fa-stack-1x fa-inverse\"></i>" +
      "                 </span></a>" +
      "               </div>" +
      "             </div>"


    );
  }

  el.find('.button-disconnect').click(function() {
    console.log("button-disconnect");
    robot.disconnect();
  });

  robot.displayElement = el; //TODO: need this?

  if (ideExpanded) {
    $('#robots-connected-snap').append(el);
  } else {
    $('#robots-connected').append(el);
  }
  updateBatteryStatus();
}

/**
 * loadIde - Load snap or brython in an iframe with the appropriate starter project.
 * Compresses the rest of the UI so that snap can have as much space as
 * possible.
 */
function loadIDE() {
  if (FinchBlox) {
    console.log("Not loading IDE - FinchBlox.")
    return;
  }
  //const useSnap = ($('#snap-slider').prop('checked'))

  updateInternetStatus();

  let projectName = "";
  if (robots.length == 1) {
    if (robots[0].type == Robot.ofType.FINCH) {
      projectName = "PWAFinchSingleDevice";
    } else {
      projectName = "PWAHummingbirdSingleDevice";
    }
  } else {
    if (allRobotsAreFinches()) {
      projectName = "PWAFinchMultiDevice";
    } else if (noRobotsAreFinches()) {
      projectName = "PWAHummingbirdMultiDevice";
    } else {
      projectName = "PWAMixedMultiDevice";
    }
  }

  if (projectName != currentSnapProject) {
    $('#ideLoading').css("display", "block");
    currentSnapProject = projectName;

    if (iframe != null) {
      iframe.remove();
    }
    iframe = document.createElement("iframe");
    iframe.frameBorder = "0";
    if (robots.length == 2) {
      iframe.setAttribute("style", "width: 100%; height: 80vh;")
    } else if (robots.length == 3) {
      iframe.setAttribute("style", "width: 100%; height: 72vh;")
    }
    let div = document.getElementById('snap-div');
    div.appendChild(iframe);

    //Do we want some sort of warning if the snap page will be reloaded?
    //Snap! does this automatically if you reload the page, but within the app,
    //you are not allowed to show that popup if there has been no user gesture
    //in the iframe and reload fails. That's why I am replacing the iframe for
    //now.

    //Just changing src should get the iframe to reload, but doesn't work with
    //urls that have # in them. A trick that works to get the reload is to
    //first do this:
    //iframe.src = "";

    if (!useSnap) {
      iframe.src = "brython/editor.html"; //"brython/console.html";  //"http://brython.info/console.html"
    } else if (internetIsConnected) {
      iframe.src = "https://snap.berkeley.edu/snap/snap.html#present:Username=birdbraintech&ProjectName=" + projectName + "&editMode&lang=" + language;
    } else {
      //iframe.src = "snap/snap.html";
      iframe.src = "snap/snap.html#open:snapProjects/" + projectName + ".xml&editMode&lang=" + language;
    }

    console.log("opening iframe with src=" + iframe.src);
    iframe.addEventListener('load', iframeOnLoadHandler, false)
  }

  expandIDE();
}


/**
 * iframeOnLoadHandler - Hide the spinner once the iframe has loaded.
 */
function iframeOnLoadHandler() {
  console.log("iframe has loaded")
  $('#ideLoading').css("display", "none");
}

/**
 * collapseIDE - Remove the iframe from view and expand the rest of the
 * UI.
 */
function collapseIDE() {
  $('#btn-expand-section').hide();
  ideExpanded = false;
  $('#connected-expanded').css("visibility", "hidden");
  document.body.insertBefore(connected, document.body.childNodes[0]);
  document.body.insertBefore(finder, document.body.childNodes[0]);
  document.body.insertBefore(header, document.body.childNodes[0]);
  updateConnectedDevices();
  $('#btn-collapse-section').css("visibility", "visible");
}

/**
 * expandIDE - Show the ide iframe and compress the rest of the UI.
 */
function expandIDE() {
  header.remove();
  finder.remove();
  connected.remove();

  ideExpanded = true;
  updateConnectedDevices();
  $('#connected-expanded').css("visibility", "visible");
  $('#btn-expand-section').show();
}

/**
 * updateBatteryStatus - Update the displayed battery statuses for all
 * connected robots.
 */
function updateBatteryStatus() {
  //For some reason, all battery icons have their classes removed
  // when trying to remove them from only one. So, here we remove
  // all of them and add back all the correct ones.
  var battSelector = '.button-battery i';
  $(battSelector).removeClass("fa-battery-full");
  $(battSelector).removeClass("fa-battery-half");
  $(battSelector).removeClass("fa-battery-quarter");

  robots.forEach(function (robot) {
    if (robot.isConnected) {
      console.log("Updating battery status for " + robot.devLetter + " of type " + robot.type + " to " + robot.batteryLevel)
      battSelector = '.button-battery-' + robot.devLetter + ' i';

      switch (robot.batteryLevel) {
        case Robot.batteryLevel.HIGH:
          if (FinchBlox) { CallbackManager.robot.updateBatteryStatus(robot.device.name, "2") }
          $(battSelector).addClass("fa-battery-full");
          break;
        case Robot.batteryLevel.MEDIUM:
          if (FinchBlox) { CallbackManager.robot.updateBatteryStatus(robot.device.name, "1") }
          $(battSelector).addClass("fa-battery-half");
          break;
        case Robot.batteryLevel.LOW:
          if (FinchBlox) { CallbackManager.robot.updateBatteryStatus(robot.device.name, "0") }
          $(battSelector).addClass("fa-battery-quarter");
          break;
        default: //UNKNOWN
      }
    }
  })
}

/**
 * updateInternetStatus - Update and display the internet status.
 */
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

/**
 * createModal - Create a basic modal section.
 *
 * @return {Object}  The section created
 */
function createModal() {
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
  //Make a container for content
  const animation = document.createElement('div');
  animation.setAttribute("class", "animation");
  /* end basic modal setup */

  header.appendChild(icon);
  header.appendChild(span);
  container.appendChild(header);
  container.appendChild(animation);
  section.appendChild(container);

  return section;
}

/**
 * showErrorModal - Show a modal displaying an error. This modal cannot be
 * closed.
 *
 * @param  {string} title   Title to display in the modal header
 * @param  {string} content Text to display in the body of the modal.
 */
function showErrorModal(title, content, shouldAddCloseBtn) {
  let section = createModal();
  let icon = section.getElementsByTagName('i')[0];
  icon.setAttribute("class", "fas fa-exclamation-circle");
  let span = section.getElementsByTagName('span')[0];
  span.textContent = title;
  let div = section.getElementsByTagName('div')[1];
  div.textContent = content;
  div.setAttribute("style", "position: relative; opacity: 1; background-color: rgba(255,255,255, 0.75); text-align: center; padding: 2em 2em 2em 2em;")

  if (shouldAddCloseBtn) {
    let container = section.getElementsByTagName('div')[0];
    section.setAttribute("id", "errorModal")
    addCloseBtn(container, "return closeErrorModal();")
  }

  section.setAttribute("style", "display: block;");
  document.body.appendChild(section);
}

/**
 * showCalibrationModal - Show a modal displaying the calibration video for the
 * given robot type. This modal can be closed by clicking on the x in the header
 * or by clicking outside the modal.
 *
 * @param  {Robot.ofType} robotType The type of robot undergoing calibration.
 */
function showCalibrationModal(robotType) {
  let section = createModal();
  let icon = section.getElementsByTagName('i')[0];
  let span = section.getElementsByTagName('span')[0];
  let container = section.getElementsByTagName('div')[0];
  let animation = section.getElementsByTagName('div')[1];

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

  //set modal id
  section.setAttribute("id", "calibrate-modal");
  //set up the header
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
  addCloseBtn(container, onClickCloseBtn);

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
  animation.appendChild(videoElement);

  //finally, show the finished modal.
  document.body.appendChild(section);

  /* If overlay of modal window is clicked, close calibration window */
  $(".modal").click(function() {
    closeVideoModals();
  }).children().click(function(e) {
    return false;
  });
}

/**
 * addCloseBtn - Add a close button to a modal
 *
 * @param  {type} container div to add the button to
 * @param  {type} onClickFn function to call when button is clicked
 */
function addCloseBtn(container, onClickFn) {
  const closeBtn = document.createElement('a');
  closeBtn.setAttribute("href", "#");
  closeBtn.setAttribute("onclick", onClickFn);
  closeBtn.setAttribute("class", "close btn btn-modal");
  const btnIcon = document.createElement('i');
  btnIcon.setAttribute("class", "fas fa-times");
  closeBtn.appendChild(btnIcon);
  container.insertBefore(closeBtn, container.childNodes[0]);
}

/**
 * updateCalibrationStatus - Update the status of the current calibration.
 * Display a green checkmark upon success or a red x upon failure.
 *
 * @param  {boolean} success True if calibration has succeeded
 */
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

/**
 * closeVideoModals - Close any currently open video modals.
 */
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

/**
 * closeErrorModal - Function for closing an error modal. Called by clicking
 * the x on the modal.
 */
function closeErrorModal() {
  let modal = document.getElementById("errorModal");
  modal.parentNode.removeChild(modal)
}
