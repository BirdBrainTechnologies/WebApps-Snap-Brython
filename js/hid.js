var hidRobot = null

function findHID() {

  if (!("hid" in navigator)) {
    let title = " " + thisLocaleTable["Incompatible_Browser"] + " "
    let message = thisLocaleTable["Use_Chrome89"]
    showErrorModal(title, message, false);
    return
  }

  hidAutoConnect(hidUserConnect)
}


navigator.hid.addEventListener("connect", event => {
  console.log("Device connected: " + event.device.productName);
});
navigator.hid.addEventListener("disconnect", event => {
  console.log("Device disconnected: " + event.device.productName);
  hidRobot.onDisconnected()
  hidRobot = null
  let cf = " " + thisLocaleTable["Connection_Failure"];
  let msg = event.device.productName + cf;
  showErrorModal(cf, msg, true)
  collapseIDE()
});
function hidAutoConnect(callback) {
  navigator.hid.getDevices().then(devices => {
    console.log("Already paired devices:")
    console.log(devices)
    if (devices.length > 0) {
      console.log("connecting to " + devices[0])
      initializeHIDdevice(devices[0])
    } else if (callback != null) {
      callback()
    }
  }).catch(error => {
    console.error("Error getting devices: " + error.message)
  })
}
//Call this during startup to see if a connection can be made right away
hidAutoConnect()

function hidUserConnect() {
  // To search all available devices use filters [{ acceptAllDevices: true }]
  navigator.hid.requestDevice({ filters: [{ vendorId: 0x2354 }] }).then(devices => {
    console.log("requestDevice: ")
    console.log(devices)

    if (devices.length > 0) {
      initializeHIDdevice(devices[0])
    } else {
      console.log("No device requested")
    }
  }).catch(error => {
    console.error("Error requesting HID device: " + error.message)
  })
}

function initializeHIDdevice(device) {
  device.open().then(() => {
    console.log("Opened device: " + device.productName);
    console.log(device)

    hidRobot = new HidRobot(device)

    loadIDE();

  }).catch(error => {
    console.error("ERROR opening device: " + error.message)
  })
}
