window.birdbrain = {};
window.birdbrain.isConnected = {};
window.birdbrain.isConnected.A = false;
window.birdbrain.isConnected.B = false;
window.birdbrain.isConnected.C = false;
window.birdbrain.sensorData = {};
window.birdbrain.sensorData.A = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
window.birdbrain.sensorData.B = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
window.birdbrain.sensorData.C = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
window.birdbrain.microbitIsV2 = {};
window.birdbrain.microbitIsV2.A = false;
window.birdbrain.microbitIsV2.B = false;
window.birdbrain.microbitIsV2.C = false;
window.birdbrain.robotType = {
  FINCH: 1,
  HUMMINGBIRDBIT: 2,
  MICROBIT: 3,
  UNKNOWN: 4,
  //connected robots default unknown type
  A: 4,
  B: 4,
  C: 4
};

//console.log("setting up message channel")
window.birdbrain.messageChannel = new MessageChannel();
window.birdbrain.messageChannel.port1.onmessage = function(e) {
  //console.log("Got a message: ");
  //console.log(e.data);
  if (e.data.robot != null) {
    let robot = e.data.robot;

    if (e.data.sensorData != null) {
      if (window.birdbrain.isConnected[robot] == false) {
        //This robot has just connected, or we are just loading. Get a fresh start:
        window.birdbrain.sendCommand({
          'robot': robot,
          'cmd': "stopAll"
        })
      }
      window.birdbrain.sensorData[robot] = e.data.sensorData;
      window.birdbrain.robotType[robot] = e.data.robotType;
      window.birdbrain.microbitIsV2[robot] = e.data.hasV2Microbit;
      window.birdbrain.isConnected[robot] = true;
    }

    if (e.data.connectionLost) {
      window.birdbrain.isConnected[robot] = false;
    }
  }
}
window.parent.postMessage("hello from snap", "*", [window.birdbrain.messageChannel.port2]);

window.birdbrain.sendCommand = function(command) {
  window.parent.postMessage(command, "*");
}

//  Converts byte range 0 - 255 to -127 - 127 represented as a 32 bit signe int
function byteToSignedInt8 (byte) {
  var sign = (byte & (1 << 7));
  var value = byte & 0x7F;
  if (sign) { value  = byte | 0xFFFFFF00; }
  return value;
}

//  Converts byte range 0 - 255 to -127 - 127 represented as a 32 bit signe int
function byteToSignedInt16 (msb, lsb) {
  var sign = msb & (1 << 7);
  var value = (((msb & 0xFF) << 8) | (lsb & 0xFF));
  if (sign) {
    value = 0xFFFF0000 | value;  // fill in most significant bits with 1's
  }
  return value;
}

window.birdbrain.getMicrobitAcceleration = function(axis, robot) {
  const rawToMperS = 196/1280; //convert to meters per second squared
  let sensorData = window.birdbrain.sensorData[robot];
  let accVal = 0;
  switch (axis) {
    case 'X':
      accVal = byteToSignedInt8(sensorData[4]);
      break;
    case 'Y':
      accVal = byteToSignedInt8(sensorData[5]);
      break;
    case 'Z':
      accVal = byteToSignedInt8(sensorData[6]);
      break;
  }
  return (accVal * rawToMperS);
}

window.birdbrain.getMicrobitMagnetometer = function(axis, finch) {
  const rawToUT = 1/10; //convert to uT
  let sensorData = window.birdbrain.sensorData[finch];
  let msb = 0;
  let lsb = 0;
  switch (axis) {
    case 'X':
      msb = sensorData[8];
      lsb = sensorData[9];
      break;
    case 'Y':
      msb = sensorData[10];
      lsb = sensorData[11];
      break;
    case 'Z':
      msb = sensorData[12];
      lsb = sensorData[13];
      break;
  }
  let magVal = byteToSignedInt16(msb, lsb);
  return Math.round(magVal * rawToUT);
}

window.birdbrain.microbitOrientation = function (dim, robot) {
  if (dim == "Shake") {
    const index = 7;
    let shake = window.birdbrain.sensorData[robot][index];
    return ((shake & 0x01) > 0);
  }
  const threshold = 7.848;
  let acceleration = 0;
  switch(dim) {
    case "Tilt left":
    case "Tilt right":
      acceleration = window.birdbrain.getMicrobitAcceleration('X', robot);
      break;
    case "Logo up":
    case "Logo down":
      acceleration = window.birdbrain.getMicrobitAcceleration('Y', robot);
      break;
    case "Screen up":
    case "Screen down":
      acceleration = window.birdbrain.getMicrobitAcceleration('Z', robot);
      break;
  }
  switch(dim) {
    case "Tilt left":
    case "Logo down":
    case "Screen down":
      return (acceleration > threshold);
    case "Tilt right":
    case "Logo up":
    case "Screen up":
      return (acceleration < -threshold);
  }
}

window.birdbrain.getMicrobitCompass = function (robot) {
  const ax = window.birdbrain.getMicrobitAcceleration('X', robot);
  const ay = window.birdbrain.getMicrobitAcceleration('Y', robot);
  const az = window.birdbrain.getMicrobitAcceleration('Z', robot);
  const mx = window.birdbrain.getMicrobitMagnetometer('X', robot);
  const my = window.birdbrain.getMicrobitMagnetometer('Y', robot);
  const mz = window.birdbrain.getMicrobitMagnetometer('Z', robot);

  const phi = Math.atan(-ay / az)
  const theta = Math.atan(ax / (ay * Math.sin(phi) + az * Math.cos(phi)))

  const xp = mx
  const yp = my * Math.cos(phi) - mz * Math.sin(phi)
  const zp = my * Math.sin(phi) + mz * Math.cos(phi)

  const xpp = xp * Math.cos(theta) + zp * Math.sin(theta)
  const ypp = yp

  const angle = 180.0 + ((Math.atan2(xpp, ypp)) * (180 / Math.PI)) //convert result to degrees

  return ((Math.round(angle) + 180) % 360) //turn so that beak points north
}

window.birdbrain.getFinchAcceleration = function(axis, finch) {
  let sensorData = window.birdbrain.sensorData[finch];
  let accVal = 0;
  switch (axis) {
    case 'X':
      accVal = byteToSignedInt8(sensorData[13]);
      break;
    case 'Y':
    case 'Z':
      const rawY = byteToSignedInt8(sensorData[14]);
      const rawZ = byteToSignedInt8(sensorData[15]);
      const rad = 40 * Math.PI / 180; //40° in radians

      switch(axis) {
        case 'Y':
          accVal = (rawY*Math.cos(rad) - rawZ*Math.sin(rad));
          break;
        case 'Z':
          accVal = (rawY*Math.sin(rad) + rawZ*Math.cos(rad));
          break;
      }
    }
    return (accVal * 196/1280);
}

window.birdbrain.getFinchMagnetometer = function(axis, finch) {
  let sensorData = window.birdbrain.sensorData[finch];
  switch (axis) {
    case 'X':
      return byteToSignedInt8(sensorData[17]);
    case 'Y':
    case 'Z':
      const rawY = byteToSignedInt8(sensorData[18]);
      const rawZ = byteToSignedInt8(sensorData[19]);
      const rad = 40 * Math.PI / 180 //40° in radians

      let magVal = 0;
      switch(axis) {
        case 'Y':
          magVal = (rawY*Math.cos(rad) + rawZ*Math.sin(rad));
          break;
        case 'Z':
          magVal = (rawZ*Math.cos(rad) - rawY*Math.sin(rad));
          break;
      }
      return Math.round(magVal);
  }
}

window.birdbrain.finchOrientation = function (dim, robot) {
  if (dim == "Shake") {
    let shake = window.birdbrain.sensorData[robot][16];
    return ((shake & 0x01) > 0);
  }
  const threshold = 7.848;
  let acceleration = 0;
  switch(dim) {
    case "Tilt left":
    case "Tilt right":
      acceleration = window.birdbrain.getFinchAcceleration('X', robot);
      break;
    case "Beak up":
    case "Beak down":
      acceleration = window.birdbrain.getFinchAcceleration('Y', robot);
      break;
    case "Level":
    case "Upside down":
      acceleration = window.birdbrain.getFinchAcceleration('Z', robot);
      break;
  }
  switch(dim) {
    case "Tilt right":
    case "Beak up":
    case "Upside down":
      return (acceleration > threshold);
    case "Tilt left":
    case "Beak down":
    case "Level":
      return (acceleration < -threshold);
  }
}

window.birdbrain.getFinchCompass = function (robot) {
  const ax = window.birdbrain.getFinchAcceleration('X', robot);
  const ay = window.birdbrain.getFinchAcceleration('Y', robot);
  const az = window.birdbrain.getFinchAcceleration('Z', robot);
  const mx = window.birdbrain.getFinchMagnetometer('X', robot);
  const my = window.birdbrain.getFinchMagnetometer('Y', robot);
  const mz = window.birdbrain.getFinchMagnetometer('Z', robot);

  const phi = Math.atan(-ay / az)
  const theta = Math.atan(ax / (ay * Math.sin(phi) + az * Math.cos(phi)))

  const xp = mx
  const yp = my * Math.cos(phi) - mz * Math.sin(phi)
  const zp = my * Math.sin(phi) + mz * Math.cos(phi)

  const xpp = xp * Math.cos(theta) + zp * Math.sin(theta)
  const ypp = yp

  const angle = 180.0 + ((Math.atan2(xpp, ypp)) * (180 / Math.PI)) //convert result to degrees

  return ((Math.round(angle) + 180) % 360) //turn so that beak points north
}

window.birdbrain.finchIsMoving = function(finch) {
  return (window.birdbrain.sensorData[finch][4] > 127);
}

/**
 * wrapPython - Because programming robots requires waits, all user code must
 * use the async module. For the ease of the user, this function takes regular
 * python code and wraps it in an async function, converting the fuction calls
 * to async calls.
 *
 * @param  {string} src python code to be converted
 * @return {string}     converted code
 */
window.birdbrain.wrapPython = function(src) {

  //Remove all the strings and hold on to them for later
  let longStringText = "LONGSTRINGREPLACEMENT"
  let lsr = new RegExp("([\"'])\\1\\1.*?\\1\\1\\1", "gs")
  let longStrings = src.match(lsr) || []
  let stringsRemoved = src.replace(lsr, "$1$1$1"+longStringText+"$1$1$1")
  let normalStringText = "NORMALSTRINGREPLACEMENT"
  let nsr = new RegExp("([\"']).+?\\1", "g")
  let strings = stringsRemoved.match(nsr) || []
  stringsRemoved = stringsRemoved.replace(nsr, "$1"+normalStringText+"$1")

  //Get a list of functions defined so that they can be turned into async functions
  let functionsDefined = stringsRemoved.match(/def [a-zA-Z_][a-zA-Z_0-9]*/g) || []

  //Remove comments: We don't need them and they occasionally cause problems with the other changes below
  let replaced = stringsRemoved.replace(/#.*/g, "")
  //Replace birdbrain function calls with async versions
  replaced = replaced.replace(/([a-zA-Z_][a-zA-Z_0-9]*)\.(setMove|setTurn|setMotors|playNote|setTail|setBeak|setDisplay|print|setPoint|stopAll|setLED|setTriLED|setPositionServo|setRotationServo|stop|resetEncoders|getAcceleration|getCompass|getMagnetometer|getButton|isShaking|getOrientation|getLight|getSound|getDistance|getDial|getVoltage|getLine|getEncoder|getTemperature)/g, "await $1.$2")
  //Replace sleep with async sleep
  replaced = replaced.replace(/(time\.)?sleep/g, "await aio.sleep")
  //Replace user function definitions with async definitions
  replaced = replaced.replace(/def /g, "async def ")
  //Replace user defined function calls with async versions
  functionsDefined.forEach((funcDef) => {
    var name = funcDef.replace(/def ([a-zA-Z_][a-zA-Z_0-9]*)/, "$1")
    var re = new RegExp("(?<!def |[a-zA-Z_0-9])(" + name + ")(?![a-zA-Z_0-9])","g");
    replaced = replaced.replace(re, "await $1")
  });
  //Put parentheses around function calls in 'while not' loops. May need to be done in more places.
  replaced = replaced.replace(/while not await ([^:]*):/g, "while not (await $1):")

  //Indent the current script
  let wrapped = replaced.replace(/\n/g, "\n\t")
  //Wrap the whole script in an async function and call the function at the end
  wrapped = "from browser import aio\n\nasync def main():\n\t" + wrapped + "\n\naio.run(main())"

  //Put back the strings
  var stringTextRe = new RegExp(normalStringText);
  strings.forEach((str, i) => {
    str = str.replace(/^["']/, "").replace(/["']$/, "")
    wrapped = wrapped.replace(stringTextRe, str)
  });
  var longStTextRe = new RegExp(longStringText);
  longStrings.forEach((str, i) => {
    str = str.replace(/^["']["']["']/, "").replace(/["']["']["']$/, "")
    wrapped = wrapped.replace(longStTextRe, str)
  });

  console.log("WRAPPED SCRIPT:")
  console.log(wrapped)
  return wrapped
}

function onFileChoice() {
  var input = document.getElementById('chooseFile')
  //console.log("found " + input.files.length + " files.")
  //console.log(input.files[0].name + " " + input.files[0].size + " " + input.files[0].type)
  input.files[0].text().then(contents => {
    //console.log("found contents:")
    //console.log(contents)
    var container = document.getElementById('loadedScript');
    container.value = contents;
    container.click();
    var fileNameLabel = document.getElementById('fileName');
    fileNameLabel.innerHTML = input.files[0].name
    fileNameLabel.dispatchEvent(new Event("input"));
  }).catch(error => {
    console.error("failed to read file: " + error.message);
  });
}

function performClick(elemId) {
   var elem = document.getElementById(elemId);
   if(elem && document.createEvent) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
   }
}

window.birdbrain.savePythonProject = function(fileName, contents) {
  var blob = new Blob([contents], {
    type: "text/x-python-script"
  });
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";

  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
