/**
 * This file is for everything needed to hook up FinchBlox
 */

var currentFinchBloxBeak = [0, 0, 0];
var fbAudio = null;
var finchBloxRobot = null;
var noFilesLoadedYet = true;
const fbFrontend = document.getElementById('frontend').contentWindow

/**
 * FB_Files - All of the file handling methods for FinchBlox. All files and
 * file information is stored in localStorage.
 */
function FB_Files() {}
/**
 * FB_Files.newFile - Create a new file with the given name and contents
 *
 * @param  {string} filename name of the file
 * @param  {string} contents the xml file contents
 */
FB_Files.newFile = function(filename, contents) {
  console.log("*** newFile " + filename + ": " + contents)
  //check if the filename already exists
  if (Object.keys(localStorage).includes(filename)) {
    console.error("filename " + filename + " already exists.")
    return
  }

  let allFileNames = []
  if (Hatchling) {
    if (localStorage.hatchlingFileNames) {
      allFileNames = localStorage.hatchlingFileNames.split(",")
    }
    allFileNames.push(filename)
    localStorage.hatchlingFileNames = allFileNames.toString()
  } else {
    if (localStorage.finchBloxFileNames) {
      allFileNames = localStorage.finchBloxFileNames.split(",")
    }
    allFileNames.push(filename)
    localStorage.finchBloxFileNames = allFileNames.toString()
  }
  localStorage[filename] = contents
}
/**
 * FB_Files.getFileNames - return a JSON list of the names of all currently
 * saved files.
 *
 * @return {string}  JSON file name list
 */
FB_Files.getFileNames = function() {
  if (Hatchling && localStorage.hatchlingFileNames) {
    let filenames = localStorage.hatchlingFileNames.replace(/,/g, '","')
    let filesString = '{"files":["' + filenames + '"]}'
    return filesString
  } else if (!Hatchling && localStorage.finchBloxFileNames) {
    let filenames = localStorage.finchBloxFileNames.replace(/,/g, '","')
    let filesString = '{"files":["' + filenames + '"]}'
    return filesString
  } else {
    return '{"files":[]}'
  }
}
/**
 * FB_Files.openFile - Finds the file with the given filename and sends its
 * name and contents to the frontend.
 *
 * @param  {string} filename name of the file to open
 */
FB_Files.openFile = function(filename) {
  console.log("*** openFile " + filename + " " + noFilesLoadedYet)
  console.log(localStorage)

  if (noFilesLoadedYet) {
    noFilesLoadedYet = false;
    if (Hatchling) {
      if (localStorage.currentHlFile != null) {
        filename = localStorage.currentHlFile
      }
    } else if (localStorage.currentFbFile != null) {
      filename = localStorage.currentFbFile
    }
  }

  let projectContent = localStorage[filename]

  if (projectContent) {
    //console.log("Opening file " + filename + " with contents: " + projectContent);
    if (Hatchling) {
      localStorage.currentHlFile = filename
    } else {
      localStorage.currentFbFile = filename
    }
    fbFrontend.CallbackManager.data.open(filename, projectContent);
  } else {
    console.error("No contents found for file named " + filename)
  }
}
/**
 * FB_Files.autoSave - Saves the current file with the given contents.
 *
 * @param  {string} projectContent xml contents of the file
 */
FB_Files.autoSave = function(projectContent) {
  const filename = Hatchling ? localStorage.currentHlFile : localStorage.currentFbFile
  console.log("*** autoSave " + filename)
  console.log(projectContent)
  localStorage[filename] = projectContent
}
/**
 * FB_Files.getAvailableName - Checks the requested file name for availability.
 * Finds a similar name that is available if necessary
 *
 * @param  {string} nameRequested the file name to check
 * @return {string}               JSON response to send to frontend
 */
FB_Files.getAvailableName = function(nameRequested) {
  let alreadySanitized = true; //false triggers popup to remove invalid characters
  let alreadyAvailable = true; //false triggers popup to choose another name
  if (Object.keys(localStorage).includes(nameRequested)) {
    let parts = Hatchling ? nameRequested.split("-") : nameRequested.split("_")

    let numParts = parts[parts.length - 2].split("(")
    let currentNum = parseInt(numParts[numParts.length - 1])
    if (numParts.length > 1 && !isNaN(currentNum)) {
      currentNum = currentNum + 1
      numParts[numParts.length - 1] = currentNum + ")"
    } else {
      currentNum = 1
      numParts.push(currentNum + ")")
    }
    parts[parts.length - 2] = numParts.join("(")

    let nameToCheck = Hatchling ? parts.join("-") : parts.join("_")
    //console.log("The name " + nameRequested + " is already taken. Checking " + nameToCheck)
    return this.getAvailableName(nameToCheck)
  } else {
    return '{"availableName":"' + nameRequested + '", "alreadySanitized":' + alreadySanitized + ', "alreadyAvailable":' + alreadyAvailable + '}'
  }
}
/**
 * FB_Files.rename - Rename a specified file
 *
 * @param  {string} request Request from frontend. Includes current name and new name.
 */
FB_Files.rename = function(request) {
  let oldName = request.split("&")[0].split("=").pop();
  let newName = request.split("&")[1].split("=").pop();
  if (Object.keys(localStorage).includes(newName)) {
    console.error("A file named " + newName + " already exists.")
    return;
  }
  console.log("*** rename " + oldName + " to " + newName)
  console.log(localStorage)
  this.newFile(newName, localStorage[oldName])
  this.deleteFile(oldName)
  this.openFile(newName)
}
/**
 * FB_Files.deleteFile - Delete the specified file
 *
 * @param  {string} filename Name of the file to delete
 */
FB_Files.deleteFile = function(filename) {
  console.log("*** deleteFile " + filename)
  let names = Hatchling ? localStorage.hatchlingFileNames : localStorage.finchBloxFileNames
  let fn = names.split(",")
  let remainingFileNames = fn.filter(value => {
    return value != filename
  })
  if (Hatchling) {
    localStorage.hatchlingFileNames = remainingFileNames.toString()  
  } else {
    localStorage.finchBloxFileNames = remainingFileNames.toString()
  }
  delete localStorage[filename]
}

/**
 * FB_Audio - An audio object to handle all of FinchBlox's sound effects (eg.
 * block snaps and keyboard sounds)
 * See https://code.tutsplus.com/tutorials/the-web-audio-api-adding-sound-to-your-web-app--cms-23790
 */
function FB_Audio() {
  // Create the audio context and volume
  this.context = new AudioContext();
  this.volume = this.context.createGain();
  this.volume.connect(this.context.destination)

  //Set up sound effects
  //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
  this.click2Element = document.getElementById("click2")
  const track = this.context.createMediaElementSource(this.click2Element);
  track.connect(this.context.destination);
}
/**
 * FB_Audio.prototype.playNote - Play a tone of a given duration and frequency
 *
 * @param  {string} requestString Frontend request specifying note and duration.
 */
FB_Audio.prototype.playNote = function(requestString) {
  let parts = requestString.split("&")
  let note = parts[0].split("=")[1]
  let duration = (parts[1].split("=")[1]) / 1000
  let frequency = 440 * Math.pow(2, (note - 69) / 12)
  // When to start playing the oscillators
  let startTime = this.context.currentTime;

  let osc1 = this.context.createOscillator(),
    osc2 = this.context.createOscillator();

  // Set oscillator wave type
  osc1.type = 'triangle';
  osc2.type = 'triangle';
  // Set up node routing
  osc1.connect(this.volume);
  osc2.connect(this.volume);
  // Detune oscillators for chorus effect
  osc1.frequency.value = frequency + 1
  osc2.frequency.value = frequency - 2
  // Fade out
  this.volume.gain.value = 0.1;
  this.volume.gain.setValueAtTime(0.1, startTime + duration - 0.05);
  this.volume.gain.linearRampToValueAtTime(0, startTime + duration);
  // Start the oscillators
  osc1.start(startTime)
  osc2.start(startTime)
  // Stop the oscillators
  osc1.stop(startTime + duration)
  osc2.stop(startTime + duration)
}

/**
 * parseFinchBloxRequest - Parse and handle requests coming from the FinchBlox
 * frontend.
 *
 * @param  {string} request The frontend request
 */
function parseFinchBloxRequest(request) {
  //const robot = getRobotByLetter("A");
  const robot = finchBloxRobot
  //console.log("FinchBlox request string " + JSON.stringify(request));
  let status = 200;
  let responseBody = "";

  let path = request.request.split("/");
  let query = path[1].split("?")
  switch (path[0]) {
    case "settings":
      let key = query[1].split("=")[1]
      if (query[0] == "get" && key == "enableSnapNoise") {
        responseBody = "true"
      }
      break;
    case "properties":
    case "ui":
      //We will not handle any settings (except enableSnapNoise), properties
      // or ui requests for now.
      //console.error("got " + path[0] + " request for " + path[1]);
      break;
    case "sound":
      switch (query[0]) {
        case "note":
          if (fbAudio == null) {
            fbAudio = new FB_Audio()
          }
          fbAudio.playNote(query[1])
          break;
        case "play":
          let soundFile = query[1].split("=")[2]
          if (soundFile == "click2") {
            if (fbAudio == null) {
              fbAudio = new FB_Audio()
            }
            fbAudio.click2Element.play()
          } else {
            console.error("Requested to play unknown sound file " + soundFile)
          }
          break;
        case "names":
          //FinchBlox does not have any sound effects or recordings
          break;
        case "stopAll":
          //Since FinchBlox doesn't play any substantial sounds, there is nothing to stop.
          break;
        default:
          console.error("got sound request for " + path[1]);
      }
      break;
    case "tablet":
      switch (path[1]) {
        case "availableSensors":
          //Apparently, this response is expected to take some time. If the
          // response comes too quickly, there are errors because some things
          // have not yet been set up.
          setTimeout(function() {
            fbFrontend.CallbackManager.httpResponse(request.id, status, "");
          }, 1000)
          return;
        default:
          console.error("got tablet request for " + path[1]);
      }

      break;
    case "data":
      let filename;
      switch (query[0]) {
        case "files":
          responseBody = FB_Files.getFileNames();
          break;
        case "new":
          filename = query[1].split("=").pop();
          let projectContent = request.body
          FB_Files.newFile(filename, projectContent)
          break;
        case "open":
          filename = query[1].split("=").pop();
          FB_Files.openFile(filename)
          //TODO: What if opening fails?
          break;
        case "autoSave":
          FB_Files.autoSave(request.body)
          break;
        case "getAvailableName":
          filename = query[1].split("&")[0].split("=").pop();
          responseBody = FB_Files.getAvailableName(filename)
          break;
        case "rename":
          FB_Files.rename(query[1])
          break;
        case "delete":
          filename = query[1].split("&")[0].split("=").pop();
          const currentFile = Hatchling ? localStorage.currentHlFile : localStorage.currentFbFile
          let deletingCurrentFile = (filename == currentFile) 
          FB_Files.deleteFile(filename)
          if (deletingCurrentFile) {
            fbFrontend.CallbackManager.data.close()
          }
          break;
        case "markAsNamed":
          //TODO: anything here?
          console.log("*** markAsNamed")
          break;
        default:
          console.error("got data request for " + path[1]);
      }
      break;
    case "debug":
      switch (path[1]) {
        case "log":
          console.error("DEBUG LOG: " + request.body);
          break;
        default:
          console.error("got debug request for " + path[1]);
      }
      break;
    case "robot":
      switch (query[0]) {
        case "startDiscover":
          if (fbFrontend.RowDialog.currentDialog != null && fbFrontend.RowDialog.currentDialog.constructor == fbFrontend.DiscoverDialog) {
            findAndConnect();
          }
          break;
        case "stopDiscover":
          //TODO: fill in when ble scanning is implemented
          break;
        case "connect":
          //TODO: fill in when ble scanning is implemented
          break;
        case "out":
          handleFinchBloxRobotOutput(path)
          break;
        case "in":
          responseBody = getFinchBloxRobotInput(path, robot)
          break;
        case "stopAll":
          if (robot != null) {
            robot.stopAll()
          }
          break;
        case "disconnect":
          //console.log("finchblox disconnect request.")
          if (robot != null) {
            robot.userDisconnect()
            finchBloxRobot = null
            //TODO: Should this be done in the FinchBlox frontend?
            fbFrontend.DeviceManager.removeAllDevices()
          }
          break;
        default:
          console.error("unknown robot request " + path[1]);
      }
      break;
    default:
      console.error("Unhandled FinchBlox request for " + path[0]);
  }

  //console.log("Sending response for " + request.id + " with body '" + responseBody + "'")
  fbFrontend.CallbackManager.httpResponse(request.id, status, responseBody);
}


/**
 * handleFinchBloxRobotOutput - Handles requests for robot output from
 * FinchBlox.
 *
 * @param  {[string]} path the request from FinchBlox
 */
function handleFinchBloxRobotOutput(path) {
  let fullCommand = path[2].split("?")
  let params = fullCommand[1].split("&")
  let robot = "A";
  let msg = {
    robot: robot
  }

  switch (fullCommand[0]) {
    case "microblocks":
      msg.cmd = "microblocks"
      msg.data = params[2].split("=")[1].split(",")
      break;
    case "beak":
      msg.cmd = "triled"
      msg.port = 1
      msg.red = Math.round((params[2].split("=")[1]) * 2.55)
      msg.green = Math.round((params[3].split("=")[1]) * 2.55)
      msg.blue = Math.round((params[4].split("=")[1]) * 2.55)
      currentFinchBloxBeak = [msg.red, msg.green, msg.blue]
      break;
    case "tail":
      msg.cmd = "triled"
      msg.port = params[2].split("=")[1] //FinchBlox always requests 'all'
      msg.red = params[3].split("=")[1]
      msg.green = params[4].split("=")[1]
      msg.blue = params[5].split("=")[1]
      break;
    case "buzzer":
      msg.cmd = "playNote"
      msg.note = params[2].split("=")[1]
      msg.duration = params[3].split("=")[1]
      break;
    case "motors":
      msg.cmd = "motors"
      msg.speedL = params[2].split("=")[1]
      msg.ticksL = params[3].split("=")[1]
      msg.speedR = params[4].split("=")[1]
      msg.ticksR = params[5].split("=")[1]
      break;
    case "ledArray":
      msg.cmd = "symbol"
      msg.symbolString = params[2].split("=")[1]
      break;
    case "rotationServo":
      msg.cmd = "hlSetServo"
      msg.port = params[2].split("=")[1]
      msg.value = params[3].split("=")[1]
      break;
    case "positionServo":
      msg.cmd = "hlSetServo"
      msg.port = params[2].split("=")[1]
      msg.value = params[3].split("=")[1]
      break;
    case "singleNeopix":
      msg.cmd = "triled"
      msg.port = params[2].split("=")[1]
      let values = params[3].split("=")[1].split(":")
      msg.red = values[0]
      msg.green = values[1]
      msg.blue = values[2]
      break;
    case "neopixStrip":
      msg.cmd = "hlSetNeopixelStrip"
      msg.port = params[2].split("=")[1]
      msg.values = params[3].split("=")[1]
      break;
    case "fairyLights":
      msg.cmd = "hlFairyLights"
      msg.port = params[2].split("=")[1]
      msg.value = params[3].split("=")[1]
      break;
    case "portOff":
      msg.cmd = "hlPortOff"
      msg.port = params[2].split("=")[1]
      msg.value = params[3].split("=")[1]
      break;
    default:
      console.error("Unhandled robot out: " + fullCommand[0])
  }

  parseMessage(msg);
}

/**
 * getFinchBloxRobotInput - Handles requests for sensor data.
 *
 * @param  {[string]} path  request array
 * @param  {Object} robot The robot to get sensor data from
 * @return {string}       sensor value
 */
function getFinchBloxRobotInput(path, robot) {
  let params = path[1].split("?")[1].split("&")
  let sensor = params[2].split("=")[1]
  let response = ""
  if (robot == null || robot.currentSensorData.length == 0) {
    return response;
  }

  switch (sensor) {
    case "shake":
      if (Hatchling) {
        let shake = robot.currentSensorData[6];
        response = ((shake & 0x01) > 0).toString()
      }
    case "light":
      if (Hatchling) {
        response = (robot.currentSensorData[1]).toString();
      } else {
        const port = params[3].split("=")[1]
        const R = currentFinchBloxBeak[0] * 100 / 255;
        const G = currentFinchBloxBeak[1] * 100 / 255;
        const B = currentFinchBloxBeak[2] * 100 / 255;
        var raw = 0;
        var correction = 0;
        switch (port) {
          case 'right':
            raw = robot.currentSensorData[3];
            correction = 6.40473070e-03 * R + 1.41015162e-02 * G + 5.05547817e-02 * B + 3.98301391e-04 * R * G + 4.41091223e-04 * R * B + 6.40756862e-04 * G * B + -4.76971242e-06 * R * G * B;
            break;
          case 'left':
            raw = robot.currentSensorData[2];
            correction = 1.06871493e-02 * R + 1.94526614e-02 * G + 6.12409825e-02 * B + 4.01343475e-04 * R * G + 4.25761981e-04 * R * B + 6.46091068e-04 * G * B + -4.41056971e-06 * R * G * B;
            break;
          default:
            console.error("unknown light port " + port);
            return "0";
        }

        response = Math.round(Math.max(0, Math.min(100, (raw - correction)))).toString();
      }
      break;
    case "distance":
      if (Hatchling) {
        const port = parseInt(params[3].split("=")[1])
        if (port >=0 && port < 6) {
          response = (robot.currentSensorData[14 + port]).toString()
        }
      } else if (robot.hasV2Microbit) {
        response = (robot.currentSensorData[1]).toString()
      } else {
        let msb = robot.currentSensorData[0]
        let lsb = robot.currentSensorData[1]
        response = ((msb << 8) | lsb).toString()
      }
      break;
    case "isMoving":
      response = (robot.currentSensorData[4] > 127) ? "1" : "0"
      if (robot.circling != null && robot.circling.started) {
        let encoderL = robot.currentSensorData[7] << 16 | robot.currentSensorData[8] << 8 | robot.currentSensorData[9]
        let encoderR = robot.currentSensorData[10] << 16 | robot.currentSensorData[11] << 8 | robot.currentSensorData[12]

        if (encoderL >= robot.circling.ticksL && encoderR >= robot.circling.ticksR) {
          robot.setMotors(0, 0, 0, 0)
          robot.circling = null 
        } else {
          response = "1"
        }
      }
      break;
    case "V2sound":
      //because of the when clap block, this request may come while the robot is still setting up
      let sound = robot.currentSensorData[0]
      if (Hatchling && sound == 255) { sound = 0; }
      response = sound ? sound.toString() : "0"
      break;
    default:
      console.error("Unknown sensor requested: " + sensor)
  }

  return response
}

/**
 * finchBloxNotifyDiscovered - Tell the frontend which device was 'discovered'.
 * Currently, this will be the device selected in the chooser, or the device
 * that has reconnected automatically.
 *
 * @param  {Object} device ble device connecting
 */
function finchBloxNotifyDiscovered(device) {
  console.log("Discovered " + device.name);
  let fancyName = null
  if (Hatchling) {
    fancyName = device.name
  } else {
    fancyName = getDeviceFancyName(device.name)
    fancyName = fancyName.slice(0, -6)
  }

  if (Hatchling) {
    fbFrontend.CallbackManager.robot.discovered('[{"id":"' + device.name + '", "device":"Hatch", "name":"' + fancyName + '", "RSSI":0, "advertisedName":"' + device.name + '"}]')
  } else {
    fbFrontend.CallbackManager.robot.discovered('[{"id":"' + device.name + '", "device":"Finch", "name":"' + fancyName + '", "RSSI":0}]')
  }
}

/**
 * finchBloxSetDevice - Set the device in the frontend
 *
 * @return {boolean}  true if set successfully
 */
function finchBloxSetFrontendDevice() {
  if (fbFrontend.RowDialog.currentDialog != null &&
    fbFrontend.RowDialog.currentDialog.discoveredDevices != null &&
    fbFrontend.RowDialog.currentDialog.discoveredDevices.length > 0) {
    let guiDevice = fbFrontend.RowDialog.currentDialog.discoveredDevices[0];
    fbFrontend.RowDialog.currentDialog.selectDevice(guiDevice)
    return true
  } else {
    return false
  }
}

/**
 * finchBloxFullScreen - Make the finchBlox web app go full screen. Requires
 * a user gesture (such as a button click).
 */
function finchBloxFullScreen() {
  document.getElementById('frontend').requestFullscreen().then(v => {
    console.log("Now in fullscreen mode")
  }).catch(error => {
    console.error("error " + error.message)
  })
}
