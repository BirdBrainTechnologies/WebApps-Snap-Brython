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
  var robot = robots[0];
  switch(message.cmd) {
    case "triled":
      //finch tail leds only
      if (message.port == "all") {
        robot.setTriLED(2, message.red, message.green, message.blue);
        robot.setTriLED(3, message.red, message.green, message.blue);
        robot.setTriLED(4, message.red, message.green, message.blue);
        robot.setTriLED(5, message.red, message.green, message.blue);
      } else {
        robot.setTriLED(message.port, message.red, message.green, message.blue);
      }

      //robot.write(robot.setAllData);
      break;
    case "playNote":
      robot.setBuzzer(message.note, message.duration)

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
