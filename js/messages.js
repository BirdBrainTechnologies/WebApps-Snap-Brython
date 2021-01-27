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
      robot.setMotors(message.speedL * 100/36, message.ticksL, message.speedR * 100/36, message.ticksR);
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
