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
var allFinchBloxFiles = {};
var currentFinchBloxFileName;

function parseFinchBloxRequest(request) {
  console.log("FinchBlox request string " + JSON.stringify(request));
  let status = 200;
  let responseBody = "";

  let path = request.request.split("/");
  let query = path[1].split("?")
  switch (path[0]) {
    case "settings":
      console.error("got settings request for " + path[1]);
      break;
    case "properties":
      console.error("got properties request for " + path[1]);
      break;
    case "ui":
      console.error("got ui request for " + path[1]);
      break;
    case "sound":
      console.error("got sound request for " + path[1]);
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
          findAndConnect();
          break;
        case "stopDiscover":
          break;
        case "connect":
          //TODO: fill in when ble scanning is implemented
          break;
        case "out":
          handleFinchBloxRobotOutput(path)
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
      msg.red = params[2].split("=")[1]
      msg.green = params[3].split("=")[1]
      msg.blue = params[4].split("=")[1]
      break;
    default:
      console.error("Unhandled robot out: " + fullCommand[0])
  }


  parseMessage(msg);
}
