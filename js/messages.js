/**
 * This file handles Message Channel communications with the snap iframe.
 */

window.addEventListener('message', onMessage);
var messagePort;

/**
 * onMessage - Handle message received by this window.
 *
 * @param  {Object} e Message event.
 */
function onMessage(e) {
  //console.log(e.data);

  if (e.ports[0] != undefined) {
    //This message sets up the message port so that the app can send updates.
    messagePort = e.ports[0]
    // Use the transfered port to post a message back to the main frame
    messagePort.postMessage('Port received');
  } else {
    //This message is a robot command
    parseMessage(e.data);
  }
}

/**
 * parseMessage - Function for parsing robot commands
 *
 * @param  {Object} message Object containing command information
 */
function parseMessage(message) {
  const robot = getRobotByLetter(message.robot);
  if (robot == null) {
    console.error("Unable to find robot " + message.robot);
    return;
  }

  switch(message.cmd) {
    case "triled":
      robot.setTriLED(message.port, message.red, message.green, message.blue);

      break;
    case "playNote":
      robot.setBuzzer(message.note, message.duration)

      break;
    case "symbol":
      robot.setSymbol(message.symbolString)

      break;
    case "print":
      robot.setPrint(message.printString.split(""))

      break;
    case "wheels":
      robot.setMotors(message.speedL, 0, message.speedR, 0);

      break;
    case "turn":
      shouldFlip = (message.angle < 0);
      const shouldTurnRight = (message.direction == "Right" && !shouldFlip) || (message.direction == "Left" && shouldFlip);
      const shouldTurnLeft = (message.direction == "Left" && !shouldFlip) || (message.direction == "Right" && shouldFlip);
      const turnTicks = Math.abs(message.angle * FINCH_TICKS_PER_DEGREE);

      if (turnTicks != 0) { //ticks=0 is the command for continuous motion
        if (shouldTurnRight) {
          robot.setMotors(message.speed, turnTicks, -message.speed, turnTicks);
        } else if (shouldTurnLeft) {
          robot.setMotors(-message.speed, turnTicks, message.speed, turnTicks);
        }
      }
      break;
    case "move":
      shouldFlip = (message.distance < 0);
      const shouldGoForward = (message.direction == "Forward" && !shouldFlip) || (message.direction == "Backward" && shouldFlip);
      const shouldGoBackward = (message.direction == "Backward" && !shouldFlip) || (message.direction == "Forward" && shouldFlip);
      const moveTicks = Math.abs(message.distance * FINCH_TICKS_PER_CM);

      if (moveTicks != 0) { //ticks=0 is the command for continuous motion
        if (shouldGoForward) {
          robot.setMotors(message.speed, moveTicks, message.speed, moveTicks);
        } else if (shouldGoBackward) {
          robot.setMotors(-message.speed, moveTicks, -message.speed, moveTicks);
        }
      }
      break;
    case "motors": //FinchBlox specific
      robot.setMotors(message.speedL, message.ticksL, message.speedR, message.ticksR);
      break;
    case "stopFinch":
      robot.setMotors(0, 0, 0, 0);

      break;
    case "resetEncoders":
      robot.resetEncoders();

      break;
    case "stopAll":
      robot.stopAll();

      break;
    case "servo":
      robot.setServo(message.port, message.value);

      break;
    case "led":
      robot.setLED(message.port, message.intensity);

      break;
    default:
      console.log("Command not implemented: " + message.cmd);
  }
}

/**
 * sendMessage - Function for sending data back to snap. Does nothing if message
 * channel has not been set up yet.
 *
 * @param  {Object} message Information to send
 */
function sendMessage(message) {
  if (messagePort == undefined) {
    //console.log("Message channel not set up. Trying to send: ");
    //console.log(message);
    return;
  }
  //console.log("Sending: ");
  //console.log(message);
  messagePort.postMessage(message);
}


//FINCHBLOX
if (typeof FinchBlox === undefined) { var FinchBlox = false }
var allFinchBloxFiles = {};
var currentFinchBloxFileName;
var currentFinchBloxBeak = [0,0,0];
//var finchBloxUserDisconnecting = false;
var fbAudio = null;

//https://code.tutsplus.com/tutorials/the-web-audio-api-adding-sound-to-your-web-app--cms-23790
function FB_Audio() {
  // Create the audio context
  this.context = new AudioContext();
  //this.oscillator = this.context.createOscillator()
  //this.oscillator.type = 'triangle'
  this.volume = this.context.createGain();
  //this.volume.gain.value = 0.1;
  //this.oscillator.connect(this.volume)
  this.volume.connect(this.context.destination)


  //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
  this.click2Element = document.getElementById("click2")
  const track = this.context.createMediaElementSource(this.click2Element);
  track.connect(this.context.destination);
}
FB_Audio.prototype.playNote = function(requestString) {
  let parts = requestString.split("&")
  let note = parts[0].split("=")[1]
  let duration = (parts[1].split("=")[1])/1000
  let frequency = 440 * Math.pow(2, (note - 69)/12)
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


function parseFinchBloxRequest(request) {
  const robot = getRobotByLetter("A");
  console.log("FinchBlox request string " + JSON.stringify(request));
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
      switch(query[0]) {
        case "note":
          if (fbAudio == null) { fbAudio = new FB_Audio() }
          fbAudio.playNote(query[1])
          break;
        case "play":
          let soundFile = query[1].split("=")[2]
          if (soundFile == "click2") {
            if (fbAudio == null) { fbAudio = new FB_Audio() }
            fbAudio.click2Element.play()
          } else {
            console.error("Requested to play unknown sound file " + soundFile)
          }
          break;
        default:
          console.error("got sound request for " + path[1]);
      }
      break;
    case "tablet":
      switch (path[1]) {
        case "availableSensors":
          responseBody = "";
          break;
        default:
          console.error("got tablet request for " + path[1]);
      }

      break;
    case "data":
      switch (query[0]) {
        case "files":
          responseBody = '{"files":[]}';
          break;
        case "new":
          if (query[1].startsWith("filename=")) {
            let filename = query[1].split("=").pop();
            let projectContent = request.body
            console.error("Create new file " + filename + " with contents: " + projectContent);
            //TODO: check if name already exists
            allFinchBloxFiles[filename] = projectContent;
          } else {
            console.error("Bad new file request for " + query[1]);
          }
          break;
        case "open":
          if (query[1].startsWith("filename=")) {
            let filename = query[1].split("=").pop();
            let projectContent = allFinchBloxFiles[filename];
            console.log("Open file " + filename + " with contents: " + projectContent);

            CallbackManager.data.open(filename, projectContent);

            responseBody = filename + " successfully opened."
            currentFinchBloxFileName = filename;
          } else {
            console.error("Bad open file request for " + query[1]);
          }
          break;
        case "autoSave":
          //TODO: Save this somewhere
          allFinchBloxFiles[currentFinchBloxFileName] = request.body
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
      switch(query[0]) {
        case "startDiscover":
          //This prevents the automatic scan FinchBlox wants to do when a robot disconnects.
          /*if (finchBloxUserDisconnecting) {
            console.log("not starting discover and setting disconnecting to false")
            CallbackManager.robot.stopDiscover()
            finchBloxUserDisconnecting = false
          } else {*/
            findAndConnect();
          //}
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
          if (robot != null) { robot.stopAll() }
          break;
        case "disconnect":
          if (robot != null) {
            robot.disconnect()
            //TODO: Should this be done in the FinchBlox frontend?
            DeviceManager.removeAllDevices()
          }
          break;
        default:
          console.error("unknown robot request " + path[1]);
      }
      break;
    default:
      console.error("Unhandled FinchBlox request for " + path[0]);
  }

  console.log("Sending response for " + request.id + " with body '" + responseBody + "'")
  CallbackManager.httpResponse(request.id, status, responseBody);

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
    case "beak":
      msg.cmd = "triled"
      msg.port = 1
      msg.red = Math.round((params[2].split("=")[1])*2.55)
      msg.green = Math.round((params[3].split("=")[1])*2.55)
      msg.blue = Math.round((params[4].split("=")[1])*2.55)
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
    default:
      console.error("Unhandled robot out: " + fullCommand[0])
  }

  parseMessage(msg);
}

function getFinchBloxRobotInput(path, robot) {
  //const robot = getRobotByLetter("A");
  let params = path[1].split("?")[1].split("&")
  let sensor = params[2].split("=")[1]
  let response = ""
  if (robot == null) { return response; }

  switch(sensor) {
    case "light":
      const port = params[3].split("=")[1]
      const R = currentFinchBloxBeak[0]*100/255;
      const G = currentFinchBloxBeak[1]*100/255;
      const B = currentFinchBloxBeak[2]*100/255;
      var raw = 0;
      var correction = 0;
      switch (port) {
        case 'right':
          raw = robot.currentSensorData[3];
          correction = 6.40473070e-03*R + 1.41015162e-02*G + 5.05547817e-02*B + 3.98301391e-04*R*G + 4.41091223e-04*R*B + 6.40756862e-04*G*B + -4.76971242e-06*R*G*B;
          break;
        case 'left':
          raw = robot.currentSensorData[2];
          correction = 1.06871493e-02*R + 1.94526614e-02*G + 6.12409825e-02*B + 4.01343475e-04*R*G + 4.25761981e-04*R*B + 6.46091068e-04*G*B + -4.41056971e-06*R*G*B;
          break;
        default:
          console.log("unknown light port " + port);
          return 0;
      }

      return Math.round(Math.max(0, Math.min(100, (raw - correction)))).toString();
      break;
    case "distance":
      let msb = robot.currentSensorData[0]
      let lsb = robot.currentSensorData[1]
      response = ( (msb << 8) | lsb ).toString()
      break;
    case "isMoving":
      response = (robot.currentSensorData[4] > 127) ? "1" : "0"
      break;
    default:
      console.error("Unknown sensor requested: " + sensor)
  }

  return response
}
