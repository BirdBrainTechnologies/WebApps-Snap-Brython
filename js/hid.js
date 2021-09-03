//Reference to the connected HidRobot. null if nothing is connected.
var hidRobot = null

/**
 * findHID - Called by the 'Find Robots' button. Shows an error modal if hid is
 * not supported. First tries to autoconnect. If no connection is made, opens
 * the connect popup.
 */
function findHID() {
  hidAutoConnect(hidUserConnect)
}

/**
 * Handle connect and disconnect events.
 */
navigator.hid.addEventListener("connect", event => {
  console.log("Device connected: " + event.device.productName);
  //Only ever called on Chromebooks?
  //This is called on a chromebook when a device that has been unplugged
  // is plugged back in.
  if (hidRobot == null) {
    hidAutoConnect()
    closeErrorModal()
  }
});
navigator.hid.addEventListener("disconnect", event => {
  console.log("Device disconnected: " + event.device.productName);
  hidRobot.onDisconnected()
  hidRobot = null
  hidAutoConnect(function() {
    let cf = " " + thisLocaleTable["Connection_Failure"];
    let msg = event.device.productName + cf;
    showErrorModal(cf, msg, true)
  })
  collapseIDE()
});

/**
 * hidAutoConnect - Gets a list of devices that have already connected to this
 * site. Connects to the first device on the list if there is one.
 *
 * @param  {function} callback Function to call if no devices are found
 */
function hidAutoConnect(callback) {
  navigator.hid.getDevices().then(devices => {
    //console.log("Already paired devices:")
    //console.log(devices)
    if (devices.length > 0) {
      //console.log("connecting to " + devices[0])
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

/**
 * hidUserConnect - Open the Chrome hid device chooser popup. Connect to the
 * first of the devices selected.
 */
function hidUserConnect() {
  // To search all available devices use filters [{ acceptAllDevices: true }]
  navigator.hid.requestDevice({ filters: [{ vendorId: 0x2354 }] }).then(devices => {
    //console.log("requestDevice: ")
    //console.log(devices)

    if (devices.length > 0) {
      initializeHIDdevice(devices[0])
    } else {
      console.log("Chooser closed without selecting a device")
    }
  }).catch(error => {
    console.error("Error requesting HID device: " + error.message)
  })
}

/**
 * initializeHIDdevice - Once a device is selected, open it, do some setup, and
 * immediately load snap!
 *
 * @param  {HIDDevice} device selected hid device
 */
function initializeHIDdevice(device) {
  device.open().then(() => {
    //console.log("Opened device: " + device.productName);
    //console.log(device)

    hidRobot = new HidRobot(device)

    loadIDE();

  }).catch(error => {
    console.error("ERROR opening device: " + error.message)
  })
}
