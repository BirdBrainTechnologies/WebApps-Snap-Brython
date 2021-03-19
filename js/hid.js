var hidRobot = null

function findHID() {

  if (!("hid" in navigator)) {
    let title = " " + thisLocaleTable["Incompatible_Browser"] + " "
    let message = thisLocaleTable["Use_Chrome89"]
    showErrorModal(title, message, false);
    return
  }

  navigator.hid.requestDevice({ filters: [{ vendorId: 0x2354 }] }).then(devices => {
    console.log("requestDevice: ")
    console.log(devices)


    if (devices.length > 0) {
      initializeHIDdevice(devices[0])
    } else {
      console.log("No device requested")
    }

    /*devices.forEach((device, i) => {

    });*/

  }).catch(error => {
    console.error("Error requesting HID device: " + error.message)
  })

}


navigator.hid.addEventListener("connect", event => {
  console.log("Device connected: " + event.device.productName);
});
navigator.hid.addEventListener("disconnect", event => {
  console.log("Device disconnected: " + event.device.productName);
});
navigator.hid.getDevices().then(devices => {
  console.log("Already paired devices:")
  console.log(devices)
  console.log("connecting to " + devices[0])
  if (devices.length > 0) {
    initializeHIDdevice(devices[0])
  }
})

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
