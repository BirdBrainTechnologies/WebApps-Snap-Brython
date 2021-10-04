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

  //Remove comments: They occasionally cause problems with the other changes below
  let commentText = "THISISACOMMENT"
  let cr = new RegExp("#.*", "g")
  let comments = stringsRemoved.match(cr) || []
  let replaced = stringsRemoved.replace(cr, commentText)
  //let replaced = stringsRemoved.replace(/#.*/g, "")

  //Replace birdbrain function calls with async versions
  replaced = replaced.replace(/([a-zA-Z_][a-zA-Z_0-9]*)\.(setMove|setTurn|setMotors|playNote|setTail|setBeak|setDisplay|print|setPoint|stopAll|setLED|setTriLED|setPositionServo|setRotationServo|stop|resetEncoders|getAcceleration|getCompass|getMagnetometer|getButton|isShaking|getOrientation|getLight|getSound|getDistance|getDial|getVoltage|getLine|getEncoder|getTemperature)/g, "await $1.$2")
  //Machine Learning
  replaced = replaced.replace(/MachineLearningModel\.load/g, "await MachineLearningModel.load")
  if (replaced.includes("MachineLearningModel")) {
    replaced = replaced + "\nMachineLearningModel.unload()"
  }
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

  //Put back the comments
  var cTextRe = new RegExp(commentText)
  comments.forEach((comment, i) => {
    wrapped = wrapped.replace(cTextRe, comment)
  });

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

//*** Machine Learning ***
// See also: https://github.com/googlecreativelab/teachablemachine-community/
//  and https://teachablemachine.withgoogle.com/
window.birdbrain.ml = {}
window.birdbrain.ml.librariesLoaded = false;
window.birdbrain.ml.librariesLoading = false;
window.birdbrain.ml.modelLoaded = false;
window.birdbrain.ml.prediction = {};
window.birdbrain.ml.predictionsRunning = false;
window.birdbrain.ml.loadLibrary = function(url, onloadFn) {
  console.log("loading library: " + url);
  let script = document.createElement("script");
  script.type = "text/javascript";
  script.onload = onloadFn;
  script.src = url;
  document.head.appendChild(script);
}
window.birdbrain.ml.loadLibraries = function() {
  if (window.birdbrain.ml.librariesLoading || window.birdbrain.ml.librariesLoaded) { return; }
  window.birdbrain.ml.librariesLoading = true;

  const tfUrl = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"
  window.birdbrain.ml.loadLibrary(tfUrl, function () {
    const imageUrl = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"
    window.birdbrain.ml.loadLibrary(imageUrl, function () {
      const audioUrl = "https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands@0.4.0/dist/speech-commands.min.js"
      window.birdbrain.ml.loadLibrary(audioUrl, function () {
        const poseUrl = "https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"
        window.birdbrain.ml.loadLibrary(poseUrl, function () {
          window.birdbrain.ml.librariesLoaded = true;
          window.birdbrain.ml.librariesLoading = false;
          console.log("libraries loaded")
        })
      })
    })
  })
}

window.birdbrain.ml.loadModel = function(URL, type) {
  //Unload any model that is currently loaded.
  window.birdbrain.ml.stopPredictions()

  window.birdbrain.ml.modelType = type
  window.birdbrain.ml.modelURL = URL + "model.json"; // model topology
  window.birdbrain.ml.metadataURL = URL + "metadata.json"; // model metadata
  switch (type) {
    case "audio":
      window.birdbrain.ml.loadAudioModel()
      break;
    case "image":
      window.birdbrain.ml.loadVideoModel()
      break;
    case "pose":
      window.birdbrain.ml.loadPoseModel()
      break;
    default:
      return false;
  }
  return true;
}
window.birdbrain.ml.loadVideoModel = function() {
  const ml = window.birdbrain.ml

  tmImage.load(ml.modelURL, ml.metadataURL).then((loaded_model) => {
    ml.imageModel = loaded_model;
    if (ml.webcam != null) { ml.modelLoaded = true; }
  }).catch(error => {
    console.error("Problem loading image model: " + error.message)
  })

  ml.requestWebcam()
}
window.birdbrain.ml.requestWebcam = function() {
  navigator.permissions.query({name: 'camera'}).then( response => {
    switch (response.state) {
      case "granted":
        window.birdbrain.ml.setupWebcam()
      break;
      case "denied":
        console.error('The camera must be enabled to use this model.')
      break;
      case "prompt":
        response.onchange = ((e)=>{
          // detecting if the event is a change
          if (e.type === 'change'){
            // checking what the new permissionStatus state is
            const newState = e.target.state
            if (newState === 'denied') {
              console.error('The camera must be enabled to use this model.')
            } else if (newState === 'granted') {
              window.birdbrain.ml.setupWebcam()
            } else {
              console.log('Unknown new state: ' + newState)
            }
          }
        })
        navigator.mediaDevices.getUserMedia({ video: true })
      break;
      default:
        console.error("unknown permission status: " + response.status)
    }
  })
}
window.birdbrain.ml.setupWebcam = function() {
  const ml = window.birdbrain.ml
  // Setup a webcam (can also use tmPose.Webcam)
  const size = 300
  const webCam = new tmImage.Webcam(size, size, true); // width, height, should flip the webcam
  webCam.setup().then(() => {
    webCam.play().then(() => {

      ml.webcam = webCam
      ml.webcam.update();
      if (ml.imageModel != null || ml.poseModel != null) { ml.modelLoaded = true; }

      //Append elements to the DOM to see what the webcam is seeing
      const section = document.createElement('section');
      section.setAttribute("id", "webcamModal")
      section.setAttribute("style", "display: block; position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: 100; pointer-events: none;")
      const container = document.createElement('div');
      container.setAttribute("class", "container")
      container.setAttribute("style", "margin: 0 auto; height: auto; width: auto; top: 50%; transform: translateY(-50%); background-color: rgba(0,0,0,0); padding:0; position: relative; max-width: 800px;");
      const animation = document.createElement('div');
      animation.setAttribute("style", "height: " + size + "px; width: " + (size+25) + "px; ")
      const closeBtn = document.createElement('button');
      closeBtn.setAttribute("onclick", 'this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); return false;');
      closeBtn.setAttribute("style", "position: relative; float:right; display:inline-block; padding:2px 5px; pointer-events: auto;");
      const icon = document.createElement('i');
      icon.setAttribute("class", "fas fa-times");
      closeBtn.appendChild(icon);

      if (ml.modelType == "pose") {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        ml.poseCtx = canvas.getContext("2d")
        animation.appendChild(canvas)
      } else {
        animation.appendChild(ml.webcam.canvas);
      }

      animation.appendChild(closeBtn);
      container.appendChild(animation);
      section.appendChild(container);
      document.body.appendChild(section);
    })
  }).catch(error => {
    console.error("Problem setting up webcam: " + error.message)
    ml.webcam = null
  })
}
window.birdbrain.ml.loadAudioModel = function() {
  const ml = window.birdbrain.ml

  const recognizer = speechCommands.create(
      "BROWSER_FFT", // fourier transform type, not useful to change
      undefined, // speech commands vocabulary feature, not useful for your models
      ml.modelURL,
      ml.metadataURL);

  // check that model and metadata are loaded via HTTPS requests.
  recognizer.ensureModelLoaded().then(() => {
    ml.audioModel = recognizer
    ml.modelLoaded = true;
  }).catch(error => {
    console.error("Problem loading audio model: " + error.message)
  })
}
window.birdbrain.ml.loadPoseModel = function() {
  const ml = window.birdbrain.ml

  tmPose.load(ml.modelURL, ml.metadataURL).then((loaded_model) => {
    ml.poseModel = loaded_model;
    if (ml.webcam != null) { ml.modelLoaded = true; }
  }).catch(error => {
    console.error("Problem loading pose model: " + error.message)
  })

  ml.requestWebcam()
}

window.birdbrain.ml.startPredictions = function() {
  window.birdbrain.ml.predictionsRunning = false;
  console.log("starting predictions...")
  switch (window.birdbrain.ml.modelType) {
    case "audio":
      window.birdbrain.ml.startAudioPredictions()
      break;
    case "image":
      window.birdbrain.ml.startVideoPredictions()
      break;
    case "pose":
      window.birdbrain.ml.startPosePredictions()
      break;
    default:
      return false;
  }
  return true;
}
window.birdbrain.ml.startVideoPredictions = function() {
  const ml = window.birdbrain.ml
  if (ml.webcam == null || ml.imageModel == null) {
    console.error("Webcam and video model must be set up before beginning video predictions")
    return;
  }

  function loop() {
    if (ml.webcam == null) {
      ml.predictionsRunning = false;
      return;
    }
    ml.webcam.update(); // update the webcam frame

    // run the webcam image through the image model
    // predict can take in an image, video or canvas html element
    ml.imageModel.predict(ml.webcam.canvas).then((prediction) => {
      ml.prediction = prediction;
      ml.predictionsRunning = true;
      window.requestAnimationFrame(loop);
    });
  }

  window.requestAnimationFrame(loop);
}
window.birdbrain.ml.startAudioPredictions = function() {
  const ml = window.birdbrain.ml
  if (ml.audioModel == null) {
    console.error("Audio model must be set up before beginning audio predictions")
    return;
  }

  // listen() takes two arguments:
  // 1. A callback function that is invoked anytime a word is recognized.
  // 2. A configuration object with adjustable fields
  ml.audioModel.listen(prediction => {
    console.log(prediction)
    let class_names = ml.audioModel.wordLabels()

    let predictionList = []
    for (let i = 0; i < class_names.length; i++) {
      predictionList[i] = {}
      predictionList[i].className = class_names[i]
      predictionList[i].probability = prediction.scores[i]
    }

    ml.prediction = predictionList
    ml.predictionsRunning = true;
 }, {
   invokeCallbackOnNoiseAndUnknown: true
 });
}
window.birdbrain.ml.startPosePredictions = function() {
  const ml = window.birdbrain.ml
  if (ml.webcam == null || ml.poseModel == null) {
    console.error("Webcam and pose model must be set up before beginning pose predictions")
    return;
  }

  function loop() {
    if (ml.webcam == null) {
      ml.predictionsRunning = false;
      return;
    }
    ml.webcam.update(); // update the webcam frame

    // run the webcam image through the pose model
    // Have to estimate the pose and then run it through the teachable machine
    ml.poseModel.estimatePose(ml.webcam.canvas).then((pose) => {
      ml.poseModel.predict(pose.posenetOutput).then((prediction) => {
        ml.prediction = prediction

        if (pose.pose && ml.webcam) {
            // draw webcam image
            ml.poseCtx.drawImage(ml.webcam.canvas, 0, 0)
            // draw the keypoints and skeleton
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.pose.keypoints, minPartConfidence, ml.poseCtx);
            tmPose.drawSkeleton(pose.pose.keypoints, minPartConfidence, ml.poseCtx);
        }

        ml.predictionsRunning = true;
        window.requestAnimationFrame(loop);
      });
    });
  }

  window.requestAnimationFrame(loop);
}
window.birdbrain.ml.stopPredictions = function() {

  let modal = document.getElementById("webcamModal");
  if (modal != null) {
    modal.parentNode.removeChild(modal)
  }

  if (window.birdbrain.ml.webcam != null) {
    window.birdbrain.ml.webcam.stop()
    window.birdbrain.ml.webcam = null;
  }

  if (window.birdbrain.ml.imageModel != null) {
    window.birdbrain.ml.imageModel = null;
  }
  if (window.birdbrain.ml.audioModel != null) {
    window.birdbrain.ml.audioModel.stopListening();
    window.birdbrain.ml.audioModel = null;
  }
  if (window.birdbrain.ml.poseModel != null) {
    window.birdbrain.ml.poseModel = null;
  }

  window.birdbrain.ml.modelLoaded = false;
}
