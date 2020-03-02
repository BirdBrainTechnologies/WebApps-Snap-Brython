window.addEventListener('message', onMessage);
console.log("Adding listener");
var messagePort;
var messageCount = 0;

function onMessage(e) {
  console.log(e.data);
  messageCount += 1;

  if (e.ports[0] != undefined) {
    messagePort = e.ports[0]
  }
  // Use the transfered port to post a message back to the main frame
  //e.ports[0].postMessage('Message back from the IFrame');
  if (messagePort != undefined) {
    messagePort.postMessage('Message back');
    messagePort.postMessage(messageCount);
  }

  parseMessage(e.data);
}

function parseMessage(message) {
  const robot = getRobotByLetter(message.robot);
  if (robot == null) {
    console.error("Unable to find robot " + message.robot);
    return;
  }
  //var robot = robots[0];
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
      const turnTicks = message.angle * FINCH_TICKS_PER_DEGREE;
      switch(message.direction) {
        case "Right":
          robot.setMotors(message.speed, turnTicks, -message.speed, turnTicks);
          break;
        case "Left":
          robot.setMotors(-message.speed, turnTicks, message.speed, turnTicks);
      }
      break;
    case "move":
      const moveTicks = message.distance * FINCH_TICKS_PER_CM;
      switch(message.direction) {
        case "Forward":
          robot.setMotors(message.speed, moveTicks, message.speed, moveTicks);
        break;
        case "Backward":
          robot.setMotors(-message.speed, moveTicks, -message.speed, moveTicks);
        break;
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
