const useHID = false
const Hatchling = false
const HatchPlus = false
const useSnap=false
const FinchBlox = false
const BloxIDE = false
const robotTest = true 

const BLE_TYPE = {
  FINCH: 1,
  HUMMINGBIRD: 2,
  FINCH_AND_HUMMINGBIRD: 3,
}
var findable = BLE_TYPE.FINCH_AND_HUMMINGBIRD

var userRobotID = ""

///// Code tutorial links /////

const robotComponents = {
	'finch': ['motors', 'leds', 'buzzer', 'led_screen', 'sensors'],
	'hummingbird': ['single_color_leds', 'tri_color_leds', 'led_screen', 'position_servos', 'rotation_servos', 'buzzer', 'light_sensor', 'dial_sensor', 'distance_sensor', 'sound_sensor', 'buttons', 'accelerometer', 'compass', 'v2_sensors']
}
const hummingbirdComponents = ['single_color_leds', 'tri_color_leds', 'led_screen', 'position_servos', 'rotation_servos', 'buzzer', 'light_sensor', 'dial_sensor', 'distance_sensor', 'sound_sensor', 'buttons', 'accelerometer', 'compass', 'v2_sensors']
const codeTutorialLangs = ['finchblox', 'birdblox', 'snap', 'makecode', 'python', 'java']
const codeTutorialsByLang = {
	'labels' : {
		'finchblox': "FinchBlox",
		'birdblox': "BirdBlox",
		'snap': "Snap!",
		'makecode': "MakeCode/JavaScript",
		'python': "Python",
		'java': "Java"
	},
	'finch': {
		'finchblox': "https://learn.birdbraintechnologies.com/finch/finchblox/program/1-1",
		'birdblox': "https://learn.birdbraintechnologies.com/finch/birdblox/program/1-1",
		'snap': "https://learn.birdbraintechnologies.com/finch/snap/program/1-1",
		'makecode': "https://learn.birdbraintechnologies.com/finch/makecode/program/1-1",
		'python': "https://learn.birdbraintechnologies.com/finch/python/program/",
		'java': "https://learn.birdbraintechnologies.com/finch/java/program/"
	},
	'hummingbird': {
		'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/1-1",
		'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/1-1",
		'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/1-1",
		'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/",
		'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/?portal=1"
	}
}
const codeTutorials = {
	'finch': {
		'motors': {
			'label': "Motors/Wheels",
			'finchblox': "https://learn.birdbraintechnologies.com/finch/finchblox/program/3-1",
			'birdblox': "https://learn.birdbraintechnologies.com/finch/birdblox/program/3-1",
			'snap': "https://learn.birdbraintechnologies.com/finch/snap/program/3-1",
			'makecode': "https://learn.birdbraintechnologies.com/finch/makecode/program/3-1",
			'python': "https://learn.birdbraintechnologies.com/finch/python/program/lesson-1-moving-and-turning",
			'java': "https://learn.birdbraintechnologies.com/finch/java/program/lesson-1-moving-and-turning"
		},
		'leds': {
			'label': "LEDs",
			'finchblox': "https://learn.birdbraintechnologies.com/finch/finchblox/program/4-1",
			'birdblox': "https://learn.birdbraintechnologies.com/finch/birdblox/program/6-1",
			'snap': "https://learn.birdbraintechnologies.com/finch/snap/program/3-1",
			'makecode': "https://learn.birdbraintechnologies.com/finch/makecode/program/6-1",
			'python': "https://learn.birdbraintechnologies.com/finch/python/program/lesson-3-controlling-lights",
			'java': "https://learn.birdbraintechnologies.com/finch/java/program/lesson-3-controlling-the-lights"
		},
		'led_screen': {
			'label': "LED Screen",
			'finchblox': "https://learn.birdbraintechnologies.com/finch/finchblox/program/10-4",
			'birdblox': "https://learn.birdbraintechnologies.com/finch/birdblox/program/7-1",
			'snap': "https://learn.birdbraintechnologies.com/finch/snap/program/7-1",
			'makecode': "https://learn.birdbraintechnologies.com/finch/makecode/program/7-1",
			'python': "https://learn.birdbraintechnologies.com/finch/python/program/lesson-6-microbit-display",
			'java': "https://learn.birdbraintechnologies.com/finch/java/program/lesson-6-microbit-display"
		},
		'sensors': {
			'label': "Sensors",
			'finchblox': "https://learn.birdbraintechnologies.com/finch/finchblox/program/12-6",
			'birdblox': "https://learn.birdbraintechnologies.com/finch/birdblox/program/10-1",
			'snap': "https://learn.birdbraintechnologies.com/finch/snap/program/10-1",
			'makecode': "https://learn.birdbraintechnologies.com/finch/makecode/program/10-1",
			'python': "https://learn.birdbraintechnologies.com/finch/python/program/",
			'java': "https://learn.birdbraintechnologies.com/finch/java/program/"
		},
		'buzzer': {
			'label': "Buzzer",
			'finchblox': "https://learn.birdbraintechnologies.com/finch/finchblox/program/5-1",
			'birdblox': "https://learn.birdbraintechnologies.com/finch/birdblox/program/8-1",
			'snap': "https://learn.birdbraintechnologies.com/finch/snap/program/8-1",
			'makecode': "https://learn.birdbraintechnologies.com/finch/makecode/program/8-1",
			'python': "https://learn.birdbraintechnologies.com/finch/python/program/lesson-11-buzzer",
			'java': "https://learn.birdbraintechnologies.com/finch/java/program/lesson-11-buzzer"
		},
		/*'blank': {
			'label': ,
			'finchblox': ,
			'birdblox': ,
			'snap': ,
			'makecode': ,
			'python': ,
			'java':
		}*/
	},
	'hummingbird': {
		'single_color_leds': {
			'label': "Single Color LEDs",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/3-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/6-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/3-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-1-single-color-leds",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-1-single-color-leds"
		},
		'tri_color_leds': {
			'label': "Tri-color LEDs",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/4-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/7-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/4-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-2-tri-color-leds",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-2-tri-color-leds"
		},
		'led_screen': {
			'label': "LED Screen",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/5-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/8-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/5-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-3-microbit-display",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-3-microbit-display"
		},
		'position_servos': {
			'label': "Position Servos",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/6-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/9-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/6-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-4-position-servos",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-4-position-servos"
		},
		'rotation_servos': {
			'label': "Rotation Servos",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/7-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/10-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/7-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-5-rotation-servos",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-5-rotation-servos"
		},
		'buzzer': {
			'label': "Buzzer",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/8-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/11-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/8-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-6-buzzer-putting-it-all-together",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-6-rotation-servos-putting-it-all-together"
		},

		'light_sensor': {
			'label': "Light Sensor",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/10-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/13-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/9-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-7-light-sensor",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-7-light-sensor"
		},
		'dial_sensor': {
			'label': "Dial Sensor",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/11-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/14-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/10-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-9-dial-sound-sensors",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-9-dial-sound-sensors"
		},
		'distance_sensor': {
			'label': "Distance Sensor",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/12-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/15-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/11-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-8-distance-sensor",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-8-distance-sensor"
		},
		'sound_sensor': {
			'label': "Sound Sensor",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/13-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/16-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/12-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-9-dial-sound-sensors",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-9-dial-sound-sensors"
		},
		'buttons': {
			'label': "Buttons",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/14-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/17-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/13-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-10-microbit-buttons-and-accelerometer",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-10-microbit-buttons-and-accelerometer"
		},
		'accelerometer': {
			'label': "Accelerometer",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/15-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/18-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/14-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-10-microbit-buttons-and-accelerometer",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-10-microbit-buttons-and-accelerometer"
		},
		'compass': {
			'label': "Compass",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/16-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/19-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/15-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-11-microbit-compass",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-11-microbit-compass"
		},
		'v2_sensors': {
			'label': "Micro:bit V2 Sensors",
			'birdblox': "https://learn.birdbraintechnologies.com/hummingbirdbit/birdblox/program/18-1",
			'snap': "https://learn.birdbraintechnologies.com/hummingbirdbit/snap/program/21-1",
			'makecode': "https://learn.birdbraintechnologies.com/hummingbirdbit/makecode/program/17-1",
			'python': "https://learn.birdbraintechnologies.com/hummingbirdbit/python/program/python-lesson-9-dial-sound-sensors",
			'java': "https://learn.birdbraintechnologies.com/hummingbirdbit/java/program/java-lesson-9-dial-sound-sensors"
		},
		/*'blank': {
			'birdblox': ,
			'snap': ,
			'makecode': ,
			'python': ,
			'java'
		},*/
	}
}


///// Pages /////

function Page(headerName, contentName, setupFn, takedownFn, nextAction) {
	this.headerName = headerName
	this.contentName = contentName
	this.setup = setupFn
	this.takedown = takedownFn
	this.nextAction = nextAction

	this.productID = null
	this.productName = null
	if (headerName.startsWith("finch") || contentName.startsWith("finch")) {
		this.productID = "FN"
		this.productName = "Finch"
	} else if (headerName.startsWith("hummingbird") || contentName.startsWith("hummingbird")) {
		this.productID = "BB"
		this.productName = "Hummingbird"
	}
}
Page.prototype.show = function() {
	const header = sectionHeaders[this.headerName]
	const content = contents[this.contentName]

	if (header && content) {
		const headerDiv = document.getElementById("section-header")
		headerDiv.innerHTML = header

		const mainDiv = document.getElementById("main-content")
		mainDiv.innerHTML = content
	} else {
		console.error("Unknown section header '" + this.headerName + "' or content '" + this.contentName + "'.")
		document.getElementById("main-content").innerHTML = contents['comingSoon']
	}

	if (this.setup) { this.setup() }
}

function setupSuccess() {
	document.getElementById("section-header").classList.add("success")
}
function takedownSuccess() {
	document.getElementById("section-header").classList.remove("success")
}

const pages = {}

pages['home'] = new Page("welcome", "home", function() {
	document.getElementById("home-button").setAttribute("style", "visibility: hidden;")
}, function() {
	document.getElementById("home-button").setAttribute("style", "visibility: visible;")
})
//pages['contactSupport'] = new Page("contactSupport", "contactSupport")

//finch pages
pages['finchHome'] = new Page("finch", "finchHome")

pages['finchMotors'] = new Page("finchMotors", "finchMotors1")
pages['finchMotors2'] = new Page("finchMotors", "finchMotors2")
pages['finchMotors3'] = new Page("finchMotors", "finchMotors3")
pages['finchMotors4'] = new Page("finchMotors", "finchMotors4", setupConnectionPage, null, function() {
	navigateTo("finchMotors5")
})
pages['finchMotors5'] = new Page("finchMotors", "finchMotors5", null, null, async function() {
	navigateTo("finchMotors6")
	await testFinchMotors()
	navigateTo("finchMotors7")
})
pages['finchMotors6'] = new Page("finchMotors", "finchMotors6") 
pages['finchMotors7'] = new Page("finchMotors", "finchMotors7") 
pages['finchMotorsSuccess'] = new Page("finchSuccess", "finchMotorsSuccess", setupSuccess, takedownSuccess) 

pages['finchPower'] = new Page("finchPower", "finchPower1")
pages['finchPower2'] = new Page("finchPower", "finchPower2")
pages['finchPower3'] = new Page("finchPower", "finchPower3")
pages['finchPower4'] = new Page("finchPower", "finchPower4")
pages['finchPowerSuccess'] = new Page("finchSuccess", "finchPowerSuccess", setupSuccess, takedownSuccess)

function setupBluetooth1() {
	let prefix = this.productName.toLowerCase()
	document.getElementById("btn_not_on").setAttribute("onclick", "navigateTo('" + prefix + "Power')")
	document.getElementById("btn_no_display").setAttribute("onclick", "navigateTo('" + prefix + "Bluetooth2')")
	document.getElementById("btn_ok").setAttribute("onclick", "navigateTo('" + prefix + "Bluetooth3')")
}
pages['finchBluetooth'] = new Page("finchBluetooth", "bluetooth1", setupBluetooth1)

function setupBluetooth2() {
	let prefix = this.productName.toLowerCase()
	document.getElementById("btn_success").setAttribute("onclick", "navigateTo('" + prefix + "Bluetooth3')")
	document.getElementById("btn_fail").setAttribute("onclick", "navigateTo('" + prefix + "Bluetooth8')")
}
pages['finchBluetooth2'] = new Page("finchBluetooth", "bluetooth2", setupBluetooth2)

function nextActionBluetooth3() {
	let prefix = this.productName.toLowerCase()
	navigateTo(prefix + "Bluetooth4")
}
pages['finchBluetooth3'] = new Page("finchBluetooth", "bluetooth3", null, null, nextActionBluetooth3)
pages['finchBluetooth4'] = new Page("finchBluetooth", "bluetooth4", setupConnectionPage)

function setupBluetooth5() {
	let prefix = this.productName.toLowerCase()
	document.getElementById("chars").innerHTML = userRobotID.slice(2, 7)
	document.getElementById("yes").setAttribute("onclick", "navigateTo('" + prefix + "Bluetooth7')")
}
pages['finchBluetooth5'] = new Page("finchBluetooth", "bluetooth5", setupBluetooth5)

function setupBluetooth6() {
	let prefix = this.productName.toLowerCase()
	if (robots.length == 0) {
		document.getElementById("details").innerHTML = "You have been disconnected"
	} else {
		document.getElementById("details").innerHTML = "You have entered the ID " + userRobotID + " but are now connected to a robot with ID " + robots[0].device.name
	}
	document.getElementById("no_problem").setAttribute("onclick", "navigateTo('" + prefix + "BluetoothSuccess')")
}
function nextActionBluetooth6() {
	let prefix = this.productName.toLowerCase()
	navigateTo(prefix + "Bluetooth5")
}
pages['finchBluetooth6'] = new Page("finchBluetooth", "bluetooth6", setupBluetooth6, null, nextActionBluetooth6)

function setupBluetooth7() {
	let prefix = this.productName.toLowerCase()
	document.getElementById("robot_forgotten").setAttribute("onclick", "navigateTo('" + prefix + "Bluetooth4')")
}
pages['finchBluetooth7'] = new Page("finchBluetooth", "bluetooth7", setupBluetooth7)

function setupBluetooth8() {
	let prefix = this.productName.toLowerCase()
	document.getElementById("btn_success").setAttribute("onclick", "navigateTo('" + prefix + "Bluetooth3')")
}
pages['finchBluetooth8'] = new Page("finchBluetooth", "bluetooth8", setupBluetooth8)

function setupBluetoothSuccess() {
	setupSuccess()
	if (robots.length == 0) {
		document.getElementById("details").innerHTML = "You are currently disconnected"
	} else {
		document.getElementById("details").innerHTML = "You are currently connected to " + robots[0].fancyName
	}
	let prefix = this.productName.toLowerCase()
	document.getElementById("btn_robot_home").setAttribute("onclick", "navigateTo('" + prefix + "Home')")
	document.getElementById("btn_mobile").setAttribute("onclick", "navigateTo('" + prefix + "BluetoothMobile')")
}
function nextActionBluetoothSuccess() {
	let prefix = this.productName.toLowerCase()
	navigateTo("" + prefix + "Bluetooth4")
}
pages['finchBluetoothSuccess'] = new Page("finchSuccess", "bluetoothSuccess", setupBluetoothSuccess, takedownSuccess, nextActionBluetoothSuccess)
pages['finchBluetoothMobile'] = new Page("finchBluetooth", "bluetoothMobile")

pages['finchCode'] = new Page("finchCode", "finchCode1")

pages['finchLEDs'] = new Page("finchLEDs", "finchLEDs1")
pages['finchLEDs2'] = new Page("finchLEDs", "finchLEDs2", setupConnectionPage, null, function() {
	navigateTo("finchLEDs3")
})
pages['finchLEDs3'] = new Page("finchLEDs", "finchLEDs3", null, null, async function() {
	navigateTo("finchLEDs4")
	await testFinchLEDs()
	navigateTo("finchLEDs5")
})
pages['finchLEDs4'] = new Page("finchLEDs", "finchLEDs4")
pages['finchLEDs5'] = new Page("finchLEDs", "finchLEDs5")
pages['finchLEDsSuccess'] = new Page("finchSuccess", "finchLEDsSuccess", setupSuccess, takedownSuccess)

pages['finchSensors'] = new Page("finchSensors", "finchSensors1")
pages['finchSensors2'] = new Page("finchSensors", "finchSensors2")
pages['finchSensors3'] = new Page("finchSensors", "finchSensors3", setupConnectionPage, null, function() {
	navigateTo("finchSensors4")
})
pages['finchSensors4'] = new Page("finchSensors", "finchSensors4", null, null, function() {
	navigateTo("finchSensors5")
})
pages['finchSensors5'] = new Page("finchSensors", "finchSensors5")
pages['finchSensorsFail'] = new Page("finchSensors", "finchSensorsFail", function() {
	console.log(finchSensorResults)
	console.log(document.getElementById("results"))
	document.getElementById("results").innerHTML = finchSensorResults
})
pages['finchSensorsSuccess'] = new Page("finchSuccess", "finchSensorsSuccess", function() {
	setupSuccess()
	document.getElementById("results").innerHTML = finchSensorResults
}, takedownSuccess)

//hummingbird pages
pages['hummingbirdHome'] = new Page("hummingbird", "hummingbirdHome")

pages['hummingbirdPower'] = new Page("hummingbirdPower", "hummingbirdPower1")
pages['hummingbirdPower2'] = new Page("hummingbirdPower", "hummingbirdPower2")
pages['hummingbirdPower3'] = new Page("hummingbirdPower", "hummingbirdPower3")
pages['hummingbirdPowerSuccess'] = new Page("hummingbirdSuccess", "hummingbirdPowerSuccess", setupSuccess, takedownSuccess)

pages['hummingbirdBluetooth'] = new Page("hummingbirdBluetooth", "bluetooth1", setupBluetooth1)
pages['hummingbirdBluetooth2'] = new Page("hummingbirdBluetooth", "bluetooth2", setupBluetooth2)
pages['hummingbirdBluetooth3'] = new Page("hummingbirdBluetooth", "bluetooth3", null, null, nextActionBluetooth3)
pages['hummingbirdBluetooth4'] = new Page("hummingbirdBluetooth", "bluetooth4", setupConnectionPage)
pages['hummingbirdBluetooth5'] = new Page("hummingbirdBluetooth", "bluetooth5", setupBluetooth5)
pages['hummingbirdBluetooth6'] = new Page("hummingbirdBluetooth", "bluetooth6", setupBluetooth6, null, nextActionBluetooth6)
pages['hummingbirdBluetooth7'] = new Page("hummingbirdBluetooth", "bluetooth7", setupBluetooth7)
pages['hummingbirdBluetooth8'] = new Page("hummingbirdBluetooth", "bluetooth8", setupBluetooth8)
pages['hummingbirdBluetoothSuccess'] = new Page("hummingbirdSuccess", "bluetoothSuccess", setupBluetoothSuccess, takedownSuccess, nextActionBluetoothSuccess)
pages['hummingbirdBluetoothMobile'] = new Page("hummingbirdBluetooth", "bluetoothMobile")

pages['hummingbirdCode'] = new Page("hummingbirdCode", "hummingbirdCode1")
//pages['hummingbirdCodeLEDs'] = new Page("hummingbirdCode", "hummingbirdCodeLEDs")
//pages['hummingbirdCodeSuccess'] = new Page("hummingbirdSuccess", "hummingbirdCodeSuccess", setupSuccess, takedownSuccess)


pages['hummingbirdServos'] = new Page("hummingbirdServos", "hummingbirdServos1")
pages['hummingbirdServos2'] = new Page("hummingbirdServos", "hummingbirdServos2")
pages['hummingbirdServos3'] = new Page("hummingbirdServos", "hummingbirdServos3", setupConnectionPage, null, function() {
	navigateTo("hummingbirdServos4")
})
pages['hummingbirdServos4'] = new Page("hummingbirdServos", "hummingbirdServos4")
pages['hummingbirdServosPosition'] = new Page("hummingbirdServos", "hummingbirdServosPosition")
pages['hummingbirdServosRotation'] = new Page("hummingbirdServos", "hummingbirdServosRotation")
pages['hummingbirdServosSuccess'] = new Page("hummingbirdSuccess", "hummingbirdServosSuccess", setupSuccess, takedownSuccess)

pages['hummingbirdLEDs'] = new Page("hummingbirdLEDs", "hummingbirdLEDs1")
pages['hummingbirdLEDs2'] = new Page("hummingbirdLEDs", "hummingbirdLEDs2")
pages['hummingbirdLEDs3'] = new Page("hummingbirdLEDs", "hummingbirdLEDs3")
pages['hummingbirdLEDs4'] = new Page("hummingbirdLEDs", "hummingbirdLEDs4", setupConnectionPage, null, function() {
	navigateTo("hummingbirdLEDs5")
})
pages['hummingbirdLEDs5'] = new Page("hummingbirdLEDs", "hummingbirdLEDs5")
pages['hummingbirdLEDsSuccess'] = new Page("hummingbirdSuccess", "hummingbirdLEDsSuccess", setupSuccess, takedownSuccess)

pages['hummingbirdSensors'] = new Page("hummingbirdSensors", "hummingbirdSensors1")
pages['hummingbirdSensors2'] = new Page("hummingbirdSensors", "hummingbirdSensors2")
pages['hummingbirdSensors3'] = new Page("hummingbirdSensors", "hummingbirdSensors3")
pages['hummingbirdSensors4'] = new Page("hummingbirdSensors", "hummingbirdSensors4", setupConnectionPage, null, function() {
	navigateTo("hummingbirdSensors5")
})
pages['hummingbirdSensors5'] = new Page("hummingbirdSensors", "hummingbirdSensors5")
pages['hummingbirdSensorsSuccess'] = new Page("hummingbirdSuccess", "hummingbirdSensorsSuccess", setupSuccess, takedownSuccess)




///// Section Headers /////

const sectionHeaders = {}

sectionHeaders['welcome'] = `
<div class="row p-4 text-center">
	<h1>Welcome to our support app!</h1>
</div>
`
sectionHeaders['contactSupport'] = `
<div class="row p-4 text-center">
	<h1>Contact Support</h1>
</div>
`

function createSectionHeader(product, section) {
	let text = (product == 'finch') ? "Finch Robot Support " : "Hummingbird Support "
	let subText = (section != null) ? "<h2>" + section + "</h2>" : ""
	let imageFile = (product == 'finch') ? "finch_top_left_transparent.png" : "hummingbirdControllerTransparent.png"
	return `
		<div class="d-flex">
			<div class="flex-grow col-lg-6 text-end align-self-center">
				<h1>` + text + `</h1>
				` + subText + `
			</div>
			<div class="flex-fill col-lg-6">
				<img src="support/` + imageFile + `"/>
			</div>
		</div>
	`
}

sectionHeaders['finch'] = createSectionHeader("finch")
sectionHeaders['finchPower'] = createSectionHeader("finch", "Power") 
sectionHeaders['finchBluetooth'] = createSectionHeader("finch", "Bluetooth")
sectionHeaders['finchCode'] = createSectionHeader("finch", "Code")
sectionHeaders['finchMotors'] = createSectionHeader("finch", "Motors")
sectionHeaders['finchLEDs'] = createSectionHeader("finch", "LEDs")
sectionHeaders['finchSensors'] = createSectionHeader("finch", "Sensors")
sectionHeaders['finchSuccess'] = `
<div class="row p-4 text-center">
	<h1>Success!</h1>
</div>
`

sectionHeaders['hummingbird'] = createSectionHeader("hummingbird")
sectionHeaders['hummingbirdPower'] = createSectionHeader("hummingbird", "Power") 
sectionHeaders['hummingbirdBluetooth'] = createSectionHeader("hummingbird", "Bluetooth")
sectionHeaders['hummingbirdCode'] = createSectionHeader("hummingbird", "Code")
sectionHeaders['hummingbirdServos'] = createSectionHeader("hummingbird", "Servos")
sectionHeaders['hummingbirdLEDs'] = createSectionHeader("hummingbird", "LEDs")
sectionHeaders['hummingbirdSensors'] = createSectionHeader("hummingbird", "Sensors")
sectionHeaders['hummingbirdSuccess'] = sectionHeaders['finchSuccess']

///// Reusable Elements /////

function basicButton(text, onclickFnString, tealBg, idString) {
	let colorClass = tealBg ? `btn-teal` : `btn-orange`
	let onclick = onclickFnString ? ` onclick="` + onclickFnString + `"` : ``
	let id = idString ? ` id="` + idString + `"` : ``
	return `<button` + id + ` class="btn ` + colorClass + ` btn-lg m-1"` + onclick + `>` + text + `</button>`
}

function externalLinkButton(text, href, tealBg) {
	let colorClass = tealBg ? `btn-teal` : `btn-orange`
	return `<a class="btn ` + colorClass + ` btn-lg m-1" style="color: #fff;" target="_blank" href="` + href + `">` + text + `</a>`
}

function buttonWithHoverText(btnLabel, onclickFnString, hoverText) {
	let onclick = onclickFnString ? ` onclick="` + onclickFnString + `"` : ``
	//return `<div class="hoverable"><button class="btn btn-orange btn-lg m-1 btn-menu"` + onclick + `>` + btnLabel + `</button><span class="hovertext">` + hoverText + `</span></div>`
	return `<button class="btn btn-orange btn-lg m-1 btn-menu hoverable"` + onclick + `><span class="hovertext">` + hoverText + `</span>` + btnLabel + `</button>`
}

function codeTutorialButtons(product, component) {
	let links = codeTutorials[product][component]
	let html = `
	<div class="row align-self-center">
		<span>Check out these tutorials to program your ` + links['label'] + ` in the language of your choice</span>
	</div>
	<div class="row align-self-center">
		<div class="col-sm-12">
	` 
	for (let i = 0; i < codeTutorialLangs.length; i++) {
		let lang = codeTutorialLangs[i]
		let label = codeTutorialsByLang['labels'][lang]
		let link = links[lang]
		if (link) {
			html += externalLinkButton(label, link)
		}
	}
	html += `
		</div>
	</div>
	<div class="row align-self-center">
	</div>
	`
	return html
}
function codeTutorialPage(product) {
	let page = `
	<div class="row align-self-center">
		<h2>Check out a full tutorial in the language of your choice</h2>
	</div>
	<div class="row align-self-center">
		<div class="col-sm-12">
		` 
	for (let i = 0; i < codeTutorialLangs.length; i++) {
		let lang = codeTutorialLangs[i]
		let label = codeTutorialsByLang['labels'][lang]
		let link = codeTutorialsByLang[product][lang]
		if (link) {
			page += externalLinkButton(label, link)
		}
	}
	page += `
		</div>
	</div>
	<div class="row align-self-center">
		<span>Or, get advice on controlling a specific component with code</span>
	</div>
	<div class="row align-self-center">
		<div class="col-sm-12">
	`
	let components = robotComponents[product]
	for(let i = 0; i < components.length; i++) {
		let component = components[i]
		let label = codeTutorials[product][component]['label']
		let pageName = product + 'Code' + component 
		page += basicButton(label, "navigateTo('" + pageName + "')")
		contents[pageName] = codeTutorialButtons(product, component)
		pages[pageName] = new Page(product + "Code", pageName)
	}
	page += `
		</div>
	</div>
	<div class="row align-self-center">
	</div>
	`
	return page
}
function createContactSupportPage(pageName, detailText) {
	let content = `
	<div class="row align-self-center">
		<h2>Thank you for using the support app!</h2> 
	</div>
	<div class="row align-self-center justify-content-center">
		<div class="col-12 col-lg-10 col-xl-8 col-xxl-6">
			<div class="row">
				<span style="text-align: left">Please contact our support team for further assistance.<br>Be sure to include the following information in your message:
					<ul>
						<li id="details">` + detailText + `</li>
						<li>A detailed description of what you have tried to fix the problem</li>
						<li>Any images or videos of the problem you have</li>
					</ul>
				</span>
			</div>
		</div>
	</div>
	<div class="row align-self-center">
		<div class="col-sm-12">
		`	+ externalLinkButton("Contact Support", "https://www.birdbraintechnologies.com/about-us/contact-us/", true) + `
		</div>
	</div>
	<div class="row"></div>
	`
	contents[pageName] = content
	pages[pageName] = new Page("contactSupport", pageName)
}

const subHeader = `<div class="row align-self-center"><h2>What seems to be the trouble?</h2></div>`

const connectRobotOverBle = `
<div class="row align-self-center">
	<h2 id="intro">For this test, your robot will need to be connected via bluetooth.</h2>
</div>
<div id="currentConnection" class="row align-self-center justify-content-center">

</div>
<div class="row"></div>
`
const establishConnection = `
<div class="row">
	<span>Click the 'Find Robots' button to look for a connection.<br>Once you connect your robot, the test will resume automatically.</span>
</div>
<div class="row">
	<div class="col-sm-12">`
		+ basicButton("Find Robots", "findAndConnect()") + `
	</div>
</div>
<div class="row pt-5">
	<div class="col-sm-12">`
		+ basicButton("Having Trouble Connecting?", null, true, "help-button") + `
	</div>
</div>
`
const switchBrowsers = `
<div class="row">
	<h2>Web bluetooth is not currently available</h2> 
	<span>Make sure you have bluetooth switched on and that you are using a compatible browser. We recommend the latest versions of Chrome or Edge.</span>
</div>
`
const currentlyConnectedTo = `
<div class="row">
	<span>You are currently connected to</span>
</div>
<div id="robotDetails" class="row p-2">
	
</div>
<div class="row">
	<div class="col-sm-12">`
		+ basicButton("Test this robot", "currentPage.nextAction()") 
		+ basicButton("Test a different robot", "disconnectFromAllRobots()", true) + `
	</div>
</div>
`
const cameraInstruction = `
<div class="row">
	<span>Please have your phone or other recording device ready to record the test.  Your video may need to be sent to the support team to confirm the test results.</span>
</div>
<div class="row">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" onclick="currentPage.nextAction()">I am recording</button>
	</div>
</div>
<div class="row"></div>
`
const hummingbirdWires1 = `
<div class="row align-self-center">
	<h2>Wires can wear over time, making them hard to plug in</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<img src="support/hummingbird_wires.png" style="height: 150px; width: 268px;"/>
	</div>
	<div class="col-sm-8">
		<p>The image to the left shows 3 wires. The left most wire is in almost new condition, the middle wire is frayed, and the right most wire is almost completely stripped. If your wires are only frayed, twisting them back together with your fingers should be enough to get them back in working order. If, on the other hand, your wires have been stripped, you will need to use wire strippers to remove the outer casing and expose more wire.</p>
	</div>
</div>
`
const hummingbirdWires2 = `
<div class="row align-self-center">
	<h2>Stripping and twisting</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<video width="250" height="250" controls muted>
			<source src="support/hummingbird_fixWire.mp4" type="video/mp4">
		</video>
	</div>
	<div class="col-sm-6 align-self-center">
		<span>The video to the left shows how you can make an old wire as good as new</span>
	</div>
</div>
`
const testingInProgress = `
<div class="row align-self-center">
<div class="row align-self-center">
	<span>Testing in progress...</span>
</div>
<div class="row align-self-center">
`

///// Contents /////

const contents = {}

contents["home"] =  `
<div class="row align-self-center"><h2>Select your product</h2></div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg btn-product" aria-label="finch" onclick="navigateTo('finchHome')">
			<span>Finch Robot</span></br>
			<img src="support/finch_top_left_transparent.png"/>
		</button>
	</div>
	<div class="col-sm-6">
		<button class="btn btn-orange btn-lg btn-product" aria-label="hummingbird" onclick="navigateTo('hummingbirdHome')">
			<span>Hummingbird Kit</span></br>
			<img src="support/hummingbirdControllerTransparent.png"/>
		</button>
	</div>
</div>
<div class="row"></div>
`
contents["comingSoon"] = `
<div class="row align-self-center"><h2>Support for this topic is coming soon</h2></div>
`
/*contents["contactSupport"] = `
<div class="row align-self-center">
	<h2>Thank you for using the support app!</h2> 
</div>
<div class="row align-self-center justify-content-center">
	<div class="col-12 col-lg-10 col-xl-8 col-xxl-6">
		<div class="row">
			<span style="text-align: left">Please contact our support team for further assistance.<br>Be sure to include the following information in your message:
				<ul>
					<li id="details"></li>
					<li>A detailed description of what you have tried to fix the problem</li>
					<li>Any images or videos of the problem you have</li>
				</ul>
			</span>
		</div>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	`	+ externalLinkButton("Contact Support", "https://www.birdbraintechnologies.com/about-us/contact-us/", true) + `
	</div>
</div>
<div class="row"></div>
`*/
contents["finchHome"] = subHeader + `
<div class="row align-self-center">
	<div class="col-sm-4">
	` + buttonWithHoverText("Power", "navigateTo('finchPower')", "Click here if your Finch isn't powering on, or powers off randomly") + `
	</div>
	<div class="col-sm-4">
	` + buttonWithHoverText("Bluetooth", "navigateTo('finchBluetooth')", "Click here if you cannot connect to Bluetooth") + `
	</div>
	<div class="col-sm-4">
	` + buttonWithHoverText("Code", "navigateTo('finchCode')", "Click here for coding support and tutorials") + `
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
	` + buttonWithHoverText("Motors/Wheels", "navigateTo('finchMotors')", "Click here to troubleshoot and test your Finch motors/wheels") + `
	</div>
	<div class="col-sm-4">
	` + buttonWithHoverText("LEDs", "navigateTo('finchLEDs')", "Click here to troubleshoot and test your Finch LEDs") + `
	</div>
	<div class="col-sm-4">
	` + buttonWithHoverText("Sensors", "navigateTo('finchSensors')", "Click here to troubleshoot and test your Finch sensors") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["hummingbirdHome"] = subHeader + `
<div class="row align-self-center">
	<div class="col-sm-4">
	` + buttonWithHoverText("Power", "navigateTo('hummingbirdPower')", "Click here if your Hummingbird isn't powering on") + `
	</div>
	<div class="col-sm-4">
	` + buttonWithHoverText("Bluetooth", "navigateTo('hummingbirdBluetooth')", "Click here if you cannot connect to Bluetooth") + `
	</div>
	<div class="col-sm-4">
	` + buttonWithHoverText("Code", "navigateTo('hummingbirdCode')", "Click here for coding support and tutorials") + `
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
	` + buttonWithHoverText("Motors/Servos", "navigateTo('hummingbirdServos')", "Click here to troubleshoot and test your Hummingbird motors/servos") + `
	</div>
	<div class="col-sm-4">
	` + buttonWithHoverText("LEDs", "navigateTo('hummingbirdLEDs')", "Click here to troubleshoot and test your Hummingbird LEDs") + `
	</div>
	<div class="col-sm-4">
	` + buttonWithHoverText("Sensors", "navigateTo('hummingbirdSensors')", "Click here to troubleshoot and test your Hummingbird sensors") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["finchMotors1"] = `
<div class="col-sm-6 align-self-center">
	<img src="support/finch_grommet.jpg"/>
</div>
<div class="col-sm-6 align-self-center">
	<div class="row pb-5">
		<span>First, please flip your Finch over to look at the underside. Take a look at the gray star-shaped rubber grommet. Is it dislodged or torn?</span>
	</div>
	<div class="row">
		<div class="col-sm-12">
		` + basicButton("My grommet looks fine", "navigateTo('finchMotors3')")
			+ basicButton("My grommet needs help", "navigateTo('finchMotors2')", true) + `
		</div>
	</div>
</div>
`
contents["finchMotors2"] = `
<div class="row align-self-center">
	<span>The grommet is only there to hold a marker during drawing activities, and many markers don't even need it. You can safely remove this part, adjust its position, or replace it if you have a spare. If you need help doing this, please take a look at this <a target="_blank" href="https://support.birdbraintechnologies.com/hc/en-us/articles/21908696662811-How-do-I-replace-Finch-2-0-s-rubber-marker-grommet">support article</a>. </span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		` + basicButton("Fixing the grommet has solved my problem", "navigateTo('finchMotorsSuccess')")
			+ basicButton("I have fixed my grommet but still have a problem", "navigateTo('finchMotors3')", true) + `
	</div>
</div>
<div class="row">
</div>
`
contents["finchMotors3"] = `
<div class="row align-self-center">
	<span>Next, we will test the motors by sending some commands automatically. Please ensure that your Finch is powered on.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		` + basicButton("My Finch is powered on", "navigateTo('finchMotors4')")
			+ basicButton("My Finch will not power on", "navigateTo('finchPower')", true) + `
	</div>
</div>
<div class="row">
</div>
`
contents["finchMotors4"] = connectRobotOverBle

contents["finchMotors5"] = `
<div class="row align-self-center">
	<span>Your Finch is about to receive commands to move forward, move backward, turn right, and turn left.</span>
</div>
` + cameraInstruction

contents["finchMotors6"] = testingInProgress

contents["finchMotors7"] = `
<div class="row align-self-center">
	<span>Did the Finch move forward, move backward, turn right, and turn left?</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Yes", "navigateTo('finchMotorsSuccess')")
		+ basicButton("No", "navigateTo('contactSupportFinchMotors')", true) + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
createContactSupportPage("contactSupportFinchMotors", "A finch has failed the support app motors test")

contents["finchMotorsSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app!<br>Your Finch's motors appear to be functioning normally!</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Help me with my code", "navigateTo('finchCode')")
		+ basicButton("Diagnose another problem", "navigateTo('finchHome')") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["finchLEDs1"] = `
<div class="row align-self-center">
	<span>We will test your Finch's LEDs by sending some commands automatically. Please ensure that your Finch is powered on.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		` + basicButton("My Finch is powered on", "navigateTo('finchLEDs2')")
			+ basicButton("My Finch will not power on", "navigateTo('finchPower')", true) + `
	</div>
</div>
<div class="row">
</div>
`
contents["finchLEDs2"] = connectRobotOverBle

contents["finchLEDs3"] = `
<div class="row align-self-center">
	<span>Your Finch has 4 LEDs in the tail and 1 LED in the beak. We are about to send commands to turn all 5 on. They will turn red, then green, then blue, then white.</span>
</div>
` + cameraInstruction

contents["finchLEDs4"] = testingInProgress

contents["finchLEDs5"] = `
<div class="row align-self-center">
	<span>Did the Finch's 5 LEDs turn red, then green, then blue, and finally white?</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Yes", "navigateTo('finchLEDsSuccess')")
		+ basicButton("No", "navigateTo('contactSupportFinchLEDs')", true) + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
createContactSupportPage("contactSupportFinchLEDs", "A finch has failed the support app LED test")

contents["finchLEDsSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app!<br>Your Finch's LEDs appear to be functioning normally!</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Help me with my code", "navigateTo('finchCode')")
		+ basicButton("Diagnose another problem", "navigateTo('finchHome')") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["finchSensors1"] = `
<div class="row align-self-center">
	<span>For this test, we will take a look at the sensor data coming from your Finch. Please ensure that your Finch is powered on.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		` + basicButton("My Finch is powered on", "navigateTo('finchSensors2')")
			+ basicButton("My Finch will not power on", "navigateTo('finchPower')", true) + `
	</div>
</div>
<div class="row">
</div>
`
contents["finchSensors2"] = `
<div class="row align-self-center">
	<span>To get the sensor data needed for this test, you will need to be in a well lit room. You will also need to have box that your Finch can be placed inside with a lid that closes completely. The box the Finch came in, any shoe box, or similar will do.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		` + basicButton("I am in a well lit room and have a box", "navigateTo('finchSensors3')") + `
	</div>
</div>
<div class="row">
</div>
`
contents["finchSensors3"] = connectRobotOverBle

contents["finchSensors4"] = `
<div class="row align-self-center">
	<span>Hold the Finch up in the air with the beak pointed into the distance</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		` + basicButton("I am holding the Finch up", "testFinchSensorsMax()") + `
	</div>
</div>
<div class="row">
</div>
`
contents["finchSensors5"] = `
<div class="row align-self-center">
	<span>Place the finch in a dark box with the lid closed</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		` + basicButton("The Finch is in the box", "testFinchSensorsMin()") + `
	</div>
</div>
<div class="row">
</div>
`
contents["finchSensorsFail"] = `
<div class="row align-self-center">
	<span>Your Finch has failed the sensor test. Please take a screenshot of these results to send to support.</span>
</div>
<div class="row align-self-center">
	<p id="results"></p>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		` + basicButton("Try again", "navigateTo('finchSensors4')")
			+ basicButton("I have a screenshot", "navigateTo('contactSupportFinchSensors')", true) + `
	</div>
</div>
<div class="row">
</div>
`
createContactSupportPage("contactSupportFinchSensors", "A finch has failed the support app sensors test")

contents["finchSensorsSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app!<br>Your Finch's Sensors appear to be functioning normally!</h2>
</div>
<div class="row align-self-center">
	<p id="results"></p>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Help me with my code", "navigateTo('finchCode')")
		+ basicButton("Diagnose another problem", "navigateTo('finchHome')") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["finchPower1"] = `
<div class="row align-self-center">
	<h2>First, make sure your battery is charged</h2>
</div>
<div class="row align-self-center">
	<div class="col-lg-4 col-md-6">
		<img src="support/finch_plugged_in.png"/>
	</div>
	<div class="col-lg-8 col-md-6">
		<p>
			To charge the Finch, plug the USB-C cable (micro-USB on older models) into the charging slot beneath the Finch’s tail. A small green or yellow light will illuminate next to the charging charging plug. 
			<br>
			Plugging the micro USB into the micro:bit will <b>NOT</b> charge the Finch! A full charge requires 7 hours, consider charging overnight.
		</p>
	</div>
</div>
<div class="row align-self-center text-center">
	<div class="col-12">
	` + basicButton("Charging solved my problem", "navigateTo('finchPowerSuccess')")
		+ basicButton("My battery is charged", "navigateTo('finchPower2')")
		+ basicButton("My battery won't charge", "navigateTo('finchPower3')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["finchPower2"] = `
<div class="row align-self-center">
	<h2>Next, attempt to power your finch on</h2>
</div>
<div class="row align-self-center">
	<div class="col-lg-4 col-md-6">
		<img src="support/finch_power_on.png"/>
	</div>
	<div class="col-lg-8 col-md-6">
		<p>
			To turn on the Finch press and hold the power button on the bottom of your Finch until one or more of the LEDs in the tail turn on. This should take about 2 seconds.
		</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("My Finch is powered on", "navigateTo('finchPowerSuccess')")
		+ basicButton("My Finch will not power on", "navigateTo('finchPower3')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["finchPower3"] = `
<div class="row align-self-center">
	<span>Now, ensure that the Finch's battery is seated correctly</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<iframe src="//fast.wistia.com/embed/iframe/u5v892f6q9" width="448" height="252" frameborder="0" allowfullscreen=""></iframe>
	</div>
	<div class="col-sm-6">
		<p>
			One reason you may be experiencing battery issues is because the battery is not seated properly in the holder. To correct this, please open the battery door and push the battery into the holder with enough force to depress the springs in the Finch. You can see this procedure in the video to the left.
		</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("This solved my problem", "navigateTo('finchPowerSuccess')")
		+ basicButton("My Finch still won't power on", "navigateTo('finchPower4')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["finchPower4"] = `
<div class="row align-self-center">
	<span>Check that the Finch's battery is able to hold a charge</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<iframe src="//fast.wistia.com/embed/iframe/u5v892f6q9" width="448" height="252" frameborder="0" allowfullscreen=""></iframe>
	</div>
	<div class="col-sm-6">
		<p>
			Another reason you may be experiencing battery issues is because the battery is no longer holding a charge. You can test this by switching batteries with a working Finch using the same video below. If swapping the battery works, then you will need a replacement battery.
		</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("This solved my problem", "navigateTo('finchPowerSuccess')")
		+ basicButton("My Finch would not power on with the new battery", "navigateTo('contactSupportFinchPowerFail')", true) 
		+ basicButton("I need a replacement battery", "navigateTo('contactSupportFinchPowerNewBatt')", true) 
		+ basicButton("I don't have a second Finch", "navigateTo('contactSupportFinchPowerNoFinch')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
createContactSupportPage("contactSupportFinchPowerFail", "A finch will not power on, even with a new battery")
createContactSupportPage("contactSupportFinchPowerNewBatt", "A finch needs a replacement battery")
createContactSupportPage("contactSupportFinchPowerNoFinch", "A finch will not power on and no second finch is available for testing")

contents["finchPowerSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app! Your Finch appears to be functioning normally!</h2>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("Diagnose another problem", "navigateTo('finchHome')") + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["finchCode1"] = codeTutorialPage('finch')

contents["bluetooth1"] = `
<div class="row align-self-center">
	<span>When connecting over bluetooth, your robot should be on, and the micro:bit display should be flashing a sequence of characters.</span>
	<span>This sequence should be three letters, followed by the '#' symbol, followed by a seven character code.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("My robot is on and flashing the right characters", null, false, "btn_ok")
		+ basicButton("My robot is on but the display is off or wrong", null, true, "btn_no_display") 
		+ basicButton("My robot will not power on", null, true, "btn_not_on") + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["bluetooth2"] = `
<div class="row align-self-center">
	<span>If your robot is powered on, but is not displaying the correct sequence of characters, please update your firmware. For detailed installation instructions view steps 2 and 3 of this <a href="https://learn.birdbraintechnologies.com/finch/finchblox/program/1-2" target="_blank">tutorial</a>.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<button class="btn btn-orange btn-lg" type="button" onclick="location.href='https://learn.birdbraintechnologies.com/downloads/installers/BBTFirmware.hex'">Download latest firmware</button>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("I have updated the firmware", null, false, "btn_success")
		+ basicButton("My micro:bit would not accept the update", null, true, "btn_fail") + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["bluetooth3"] = `
<div class="row align-self-center">
	<span>To connect your robot over bluetooth using a web browser, you will need your seven character code. <strong>This is the code that follows the '#' symbol.</strong> The first two characters of this code denote the type of robot you are using (FN for Finch, BB for Hummingbird, and MB for micro:bit). The five characters after that are unique to the micro:bit.</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-3">
	</div>
	<div class="col-sm-6">
		
			<label for="robotID">Please enter your code below (eg. MB4A50F):</label>
		
	 		<input type="text" id="robotID" name="robotID">
	 		<button class="btn btn-orange btn-lg" onclick="saveRobotId()">Submit</button>
	
 	</div>
 	<div class="col-sm-3">
 	</div>
</div>
<div class="row align-self-center">
	<p id="response"></p>
</div>
<div class="row align-self-center">
</div>
`
contents["bluetooth4"] = connectRobotOverBle

contents["bluetooth5"] = `
<div class="row align-self-center">
	<span>Did you see a name in the popup with the same last 5 characters (<b id="chars"></b>) as yours?</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Yes", null, false, "yes")
		+ basicButton("No", "navigateTo('contactSupportBleNoRobot')", true) + `
	</div>
</div>
<div class="row align-self-center">
</div>
` 
createContactSupportPage("contactSupportBleNoRobot", "A robot is not appearing in the bluetooth popup despite being powered on")

contents["bluetooth6"] = `
<div class="row align-self-center">
	<span id="details"></span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("It's OK, I have solved my problem", null, false, "no_problem")
		+ basicButton("I selected that device because mine was not listed", "disconnectFromAllRobots()", true) + `
	</div>
</div>
<div class="row align-self-center">
</div>
` 
contents["bluetooth7"] = `
<div class="row align-self-center">
	<p>If, in the popup, you see a name that matches yours except for the first two characters, then it may be that your browser has acquired the wrong name from your robot.</p> 
	<p>Refreshing or restarting your browser may correct this.</p>
	<p>Sometimes, however, this incorrect name persists. In that case, if you are using Chrome, you can open the bluetooth settings and force Chrome to forget your device. You can view Chrome's bluetooth settings at chrome://bluetooth-internals/#devices (copy and paste this address into a new tab).</p>
	<p>Often, the 'Forget' link in the table on the bluetooth settings page does not work. Then, you will need to select 'Inspect' and use the 'Forget' button in the upper right corner.</p>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Chrome has now forgotten my robot", null, false, "robot_forgotten")
		+ basicButton("I have a different problem", "navigateTo('contactSupportBleWrongRobot')", true) + `
	</div>
</div>
<div class="row align-self-center">
</div>
` 
createContactSupportPage("contactSupportBleWrongRobot", "A robot is appearing in the bluetooth popup with the wrong code and this was not correctable with any of the advice given")

contents["bluetooth8"] = `
<div class="row align-self-center">
	<span>If you are having trouble updating the firmware on your micro:bit, please try the <a href="https://microbit.org/tools/webusb-hex-flashing/" target="_blank">webUSB flashing tool</a> on the micro:bit website</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
		<iframe width="560" height="315" src="https://www.youtube.com/embed/XUs-sv3DGFg?si=DIS4Ps78alQtaMce" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("I have updated the firmware", null, false, "btn_success")
		+ basicButton("My micro:bit would still not accept the update", "navigateTo('contactSupportBleNoUpdate')", true) + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
createContactSupportPage("contactSupportBleNoUpdate", "A micro:bit would not accept the firmware update, even with the webUSB flashing tool")

contents["bluetoothSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app!</h2>
	<span>You have successfully connected your robot over bluetooth!</span>
</div>
<div class="row align-self-center">
	<div class="row">
		<span id="details"></span>
	</div>
	<div class="row">
		<div class="col-sm-12">
		` + basicButton("Test connecting to a different robot", "disconnectFromAllRobots()")
			+ basicButton("Help me connect to a mobile app", null, true, "btn_mobile")
			+ basicButton("Diagnose another problem", null, false, "btn_robot_home") + `
		</div>
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["bluetoothMobile"] = `
<div class="row align-self-center">
	<h2>To connect your robot to one of our bluetooth mobile apps, make sure bluetooth is enabled</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<div class="row justify-content-center">
			<img class="img-fluid" src="support/BirdBloxSettings.png"/>
		</div>
	</div>
	<div class="col-sm-8 align-self-center">
		<span>To use these apps, bluetooth must be turned on in your tablet or phone's settings AND the app must be given permission to use bluetooth. To check your app's permissions, take a look at the app specific settings.</span>
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["hummingbirdPower1"] = `
<div class="row align-self-center">
	<h2>First, let's review the parts of your controller</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-6">
		<div class="row justify-content-center">
			<img class="img-fluid" src="support/hummingbird-bit-controller.png"/>
		</div>
	</div>
	<div class="col-sm-6">
		<span>You should be using the 4 AA battery pack provided with your kit or our <a href="https://store.birdbraintechnologies.com/collections/hummingbird-bit/products/hummingbird-rechargeable-battery" target="_blank">rechargeable power bank</a>, plugged in to the power connector located next to servo port 4</span>
		<p></p>
		<p>Using the USB connector or the battery port on the micro:bit will also provide some power, but it will not be enough for all components</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("I am using the Power Connector", "navigateTo('hummingbirdPower2')") + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["hummingbirdPower2"] = `
<div class="row align-self-center">
	<h2>Next, make sure your batteries have enough charge</h2>
</div>
<div class="row align-self-center">
	<span>Try swapping your batteries for fresh ones. If you are using rechargeable batteries, read this <a href="https://support.birdbraintechnologies.com/hc/en-us/articles/15374980232859-Why-aren-t-my-rechargeable-batteries-working" target="_blank">support article</a>.</span>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("My batteries are charged", "navigateTo('hummingbirdPower3')") + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["hummingbirdPower3"] = `
<div class="row align-self-center">
	<h2>Inspect your battery pack</h2>
</div>
<div class="row align-self-center">
	<span>Make sure the switch on the battery pack is switched to the 'on' position. Check the battery pack for loose wires and other defects.</span>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("My Hummingbird is now powered on", "navigateTo('hummingbirdPowerSuccess')") 
		+ basicButton("I still have a problem", "navigateTo('contactSupportBBPower')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
createContactSupportPage("contactSupportBBPower", "A hummingbird controller will not power on")

contents["hummingbirdPowerSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app!</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Diagnose another problem", "navigateTo('hummingbirdHome')") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["hummingbirdServos1"] = `
<div class="row align-self-center">
	<h2>First, make sure your servos are plugged in correctly and securely</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<div class="row justify-content-center">
			<img src="support/hummingbird_servo.png" style="height: 212px; width: 157px;"/>
		</div>
	</div>
	<div class="col-sm-8">
		<span>Make sure the color coded wires are connected to the terminals as shown. The black wire should be attached to the negative terminal toward the outside edge of the board, the red to positive, and the white to 'S' (for signal). The plug should be pushed down as far as it will go.</span>
		<p>For more advice, check out this <a href="https://support.birdbraintechnologies.com/hc/en-us/articles/360042769673-Why-is-my-servo-motor-not-responding-or-not-responding-as-expected-BirdBlox" target="_blank">support article</a>.</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("Looks Good", "navigateTo('hummingbirdServos2')")
	  + basicButton("Servo does not plug in", "navigateTo('contactSupportServoPlug')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
createContactSupportPage("contactSupportServoPlug", "A Hummingbird Kit servo cannot be plugged into the servo port")

contents["hummingbirdServos2"] = `
<div class="row align-self-center">
	<h2>Next, make sure the hummingbird is getting enough power</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<div class="row justify-content-center">
			<img src="support/hummingbird_servo_power.png" style="height: 255px; width: 224px;"/>
		</div>
	</div>
	<div class="col-sm-8">
		<span>The hummingbird should be plugged into the included 4 AA battery pack, the rechargeable power bank, or an approved wall plug using the power connector next to servo port 4.</span>
		<p>Servos require more power than other components. If the batteries are low, or if the hummingbird is plugged in through either of the ports on the micro:bit, the lights and sensors may work while the servos do not.</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("Looks Good", "navigateTo('hummingbirdServos3')") + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["hummingbirdServos3"] = connectRobotOverBle

contents["hummingbirdServos4"] = `
<div class="row align-self-center">
	<h2>Now, decide which type of servo you will test</h2>
	<span>Servos in the Hummingbird Kit come with labels on the side. If these labels are lost, you can use the part number shown on the top. FS5103R is a rotation servo and FS5103B is a position servo. The FS90 micro servo included with the Hummingbird Base Kit is a position servo.</span>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("Test Position Servos", "navigateTo('hummingbirdServosPosition')")
		+ basicButton("Test Rotation Servos", "navigateTo('hummingbirdServosRotation')") + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["hummingbirdServosPosition"] = `
<div class="row align-self-center">
	<h2>Position Servo Test</h2>
	<span>Use the buttons below to test a position servo at the indicated port.</span>
	<span>Your servo should move to the 0° position and then to 180°.</span>
	<span><strong>If a servo fails, please repeat the test and record a short video to send to support</strong><span>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("SERVOS 1", "testBBPosition(1)")
		+ basicButton("SERVOS 2", "testBBPosition(2)")
		+ basicButton("SERVOS 3", "testBBPosition(3)")
		+ basicButton("SERVOS 4", "testBBPosition(4)") + `
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("My servos are working", "navigateTo('hummingbirdServosSuccess')")
		+ basicButton("Test Rotation Servos", "navigateTo('hummingbirdServosRotation')")
		+ basicButton("I have a video", "navigateTo('contactSupportBBPositionServo')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
createContactSupportPage("contactSupportBBPositionServo", "A position servo is failing the support app test")

contents["hummingbirdServosRotation"] = `
<div class="row align-self-center">
	<h2>Rotation Servo Test</h2>
	<span>Use the buttons below to test a rotation servo at the indicated port.</span>
	<span>Your servo should turn clockwise and then counterclockwise.</span>
	<span><strong>If a servo fails, please repeat the test and record a short video to send to support</strong><span>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("SERVOS 1", "testBBRotation(1)")
		+ basicButton("SERVOS 2", "testBBRotation(2)")
		+ basicButton("SERVOS 3", "testBBRotation(3)")
		+ basicButton("SERVOS 4", "testBBRotation(4)") + `
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("My servos are working", "navigateTo('hummingbirdServosSuccess')")
		+ basicButton("Test Position Servos", "navigateTo('hummingbirdServosPosition')")
		+ basicButton("I have a video", "navigateTo('contactSupportBBRotationServo')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
createContactSupportPage("contactSupportBBRotationServo", "A rotation servo is failing the support app test")

contents["hummingbirdServosSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app!</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Help me with my code", "navigateTo('hummingbirdCode')")
	  + basicButton("Diagnose another problem", "navigateTo('hummingbirdHome')") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["hummingbirdLEDs1"] = `
<div class="row align-self-center">
	<h2>First, make sure your LEDs are plugged in correctly and securely</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-3">
		<div class="row justify-content-center">
			<img src="support/hummingbird_triLED.png" style="height: 150px; width: 165px;"/>
		</div>
		<div class="row">
			<span>tri-color LEDs</span>
		</div>
	</div>
	<div class="col-sm-3">
		<div class="row justify-content-center">
			<img src="support/hummingbird_singleLED.png" style="height: 150px; width: 152px;"/>
		</div>
		<div class="row">
			<span>Single color LEDs</span>
		</div>
	</div>
	<div class="col-sm-6">
		<span>Make sure the color coded wires are connected to the terminals as shown. Once plugged in, a gentle tug on the wires should not dislodge them.</span>
		<p>For more advice, check out these support articles: <a href="https://support.birdbraintechnologies.com/hc/en-us/articles/360042280434-Why-is-my-tri-color-LED-not-responding-or-not-responding-as-expected-in-BirdBlox" target="_blank">Tri-color LED</a> or <a href="https://support.birdbraintechnologies.com/hc/en-us/articles/360042280314-Why-is-my-LED-not-responding-or-not-responding-as-expected-in-BirdBlox" target="_blank">Single color LED</a>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("Looks Good", "navigateTo('hummingbirdLEDs4')")
	  + basicButton("LED does not plug in", "navigateTo('hummingbirdLEDs2')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["hummingbirdLEDs2"] = hummingbirdWires1 + `
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("LED is now plugged in", "navigateTo('hummingbirdLEDs4')")
	  + basicButton("I need more help", "navigateTo('hummingbirdLEDs3')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["hummingbirdLEDs3"] = hummingbirdWires2 + `
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("LED is now plugged in", "navigateTo('hummingbirdLEDs4')")
	  + basicButton("I have a different problem", "navigateTo('contactSupportBBLEDPlug')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
createContactSupportPage("contactSupportBBLEDPlug", "A Hummingbird Kit LED cannot be plugged in and support app advice was not sufficient")

contents["hummingbirdLEDs4"] = connectRobotOverBle

contents["hummingbirdLEDs5"] = `
<div class="row align-self-center">
	<h2>Use the buttons below to turn on the LED in each port</h2>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("LEDS 1", "testBBLED(1)") 
		+ basicButton("LEDS 2", "testBBLED(2)")
		+ basicButton("LEDS 3", "testBBLED(3)")
		+ basicButton("TRI-COLOR 1", "testBBTri(1)")
		+ basicButton("TRI-COLOR 2", "testBBTri(2)") + `
	</div>	
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("My LEDs are on", "navigateTo('hummingbirdLEDsSuccess')")
	  + basicButton("My LEDs are not working", "navigateTo('contactSupportBBLEDFail')", true) + `
	</div>	
</div>
<div class="row align-self-center">
</div>
`
createContactSupportPage("contactSupportBBLEDFail", "A Hummingbird Kit LED has failed the support app test")

contents["hummingbirdLEDsSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app!</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Help me with my code", "navigateTo('hummingbirdCode')")
	  + basicButton("Diagnose another problem", "navigateTo('hummingbirdHome')") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["hummingbirdSensors1"] = `
<div class="row align-self-center">
	<h2>First, make sure your sensors are plugged in correctly and securely</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-4">
		<div class="row justify-content-center">
			<img src="support/hummingbird_sensor.png" style="height: 187px; width: 264px;"/>
		</div>
	</div>
	<div class="col-sm-8">
		<span>Make sure the color coded wires are connected to the terminals as shown. Regardless of which sensor you are using, the black wire should be attached to the negative terminal, the red to positive, and the yellow to 'S' (for signal). Once plugged in, a gentle tug on the wires should not dislodge them.</span>
		<p>For more advice, check out this <a href="https://support.birdbraintechnologies.com/hc/en-us/articles/360042769833-Why-is-my-sensor-not-responding-or-not-responding-as-expected-in-BirdBlox" target="_blank">support article</a>.</p>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("Looks Good", "navigateTo('hummingbirdSensors4')")
	  + basicButton("Sensor does not plug in", "navigateTo('hummingbirdSensors2')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["hummingbirdSensors2"] = hummingbirdWires1 + `
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("Sensor is now plugged in", "navigateTo('hummingbirdSensors4')")
	  + basicButton("I need more help", "navigateTo('hummingbirdSensors3')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
contents["hummingbirdSensors3"] = hummingbirdWires2 + `
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("Sensor is now plugged in", "navigateTo('hummingbirdSensors4')")
	  + basicButton("I have a different problem", "navigateTo('contactSupportBBSensorPlug')", true) + `
	</div>
</div>
<div class="row align-self-center"></div>
`
createContactSupportPage("contactSupportBBSensorPlug", "A Hummingbird Kit sensor cannot be plugged and support app advice was not sufficient")

contents["hummingbirdSensors4"] = connectRobotOverBle

contents["hummingbirdSensors5"] = `
<div class="row align-self-center">
	<h2>Follow these steps to test your sensor</h2>
	<span>Take several readings in different conditions to see the range of values</span>
</div>
<div class="row align-self-center">
	<div class="col-sm-4 text-start">
		<p>1. Select the sensor you will test</p>
		<input type="radio" id="distance" name="sensor" value="distance">
		<label for="distance">Distance</label><br>
		<input type="radio" id="dial" name="sensor" value="dial">
		<label for="dial">Dial</label><br>
		<input type="radio" id="light" name="sensor" value="light">
		<label for="light">Light</label><br>
		<input type="radio" id="sound" name="sensor" value="sound">
		<label for="sound">Sound</label><br>
	</div>
	<div class="col-sm-4">
		<p>2. Click the button to take a reading on the port your sensor is attached to</p>
	` + basicButton("SENSORS 1", "testBBSENSOR(1)") 
		+ basicButton("SENSORS 2", "testBBSENSOR(2)")
		+ basicButton("SENSORS 3", "testBBSENSOR(3)") + `
	</div>	
	<div class="col-sm-4">
		<p>3. Results are displayed below</p>
		<code id="results">No results yet...</code>
	</div>
</div>
<div class="row align-self-center">
	<div class="col-12">
	` + basicButton("My sensors are responsive", "navigateTo('hummingbirdSensorsSuccess')")
	  + basicButton("My sensors are not working", "navigateTo('contactSupportBBSensorFail')", true) + `
	</div>	
</div>
<div class="row align-self-center">
</div>
`
createContactSupportPage("contactSupportBBSensorFail", "A Hummingbird Kit sensor has failed the support app test")

contents["hummingbirdSensorsSuccess"] = `
<div class="row align-self-center">
	<h2>Thanks for using the support app!</h2>
</div>
<div class="row align-self-center">
	<div class="col-sm-12">
	` + basicButton("Help me with my code", "navigateTo('hummingbirdCode')")
	  + basicButton("Diagnose another problem", "navigateTo('hummingbirdHome')") + `
	</div>
</div>
<div class="row align-self-center">
</div>
`
contents["hummingbirdCode1"] = codeTutorialPage('hummingbird')




///// Navigation /////

function navigateTo(pageName) {
	previousPages.push(currentPage) 
	document.getElementById("back-button").setAttribute("style", "visibility: visible;")

	let page = pages[pageName]
	if (!page) {
		console.error("Unknown page " + pageName)
		document.getElementById("main-content").innerHTML = contents['comingSoon']
		return
	}
	_showPage(page)
}

function navigateBack() {
	if (previousPages.length == 0) { return } //Should not happen

	let page = previousPages.pop()
	if (previousPages.length == 0) {
		document.getElementById("back-button").setAttribute("style", "visibility: hidden;")
	}

	_showPage(page)
}

function _showPage(page) {
	if (currentPage.takedown) { currentPage.takedown() }

	currentPage = page
	page.show()
}

///// Connections /////

function setupConnectionPage() {
	if (robots.length == 0) {
		let bleOn = webBleIsAvailable()
		document.getElementById("currentConnection").innerHTML = bleOn ? establishConnection : switchBrowsers

		if (bleOn) {
			let helpBn = document.getElementById("help-button")
			let sectionName = (currentPage.productName == "Finch") ? "finchBluetooth" : "hummingbirdBluetooth"
			let onclickAction =  "navigateTo('" + sectionName + "')" 
			if (currentPage.headerName.endsWith("Bluetooth")) {
				helpBn.innerHTML = "My robot was not listed in the popup"
				onclickAction = "navigateTo('" + sectionName + "5')" 
				document.getElementById("intro").innerHTML = "Please try again to connect<br>(remember to look for " + userRobotID + ")"
			} 
			helpBn.setAttribute("onclick", onclickAction) 
		}
	} else {
		updateConnectedDevices()
	}
}

/* replaces function in gui.js */
function updateConnectedDevices() {
	if (robots.length == 0) { 
		if (currentPage.headerName.endsWith("Success") || currentPage.headerName.endsWith("Bluetooth")) {
			currentPage.nextAction?.()
		} else {
			setupConnectionPage() 
		}
		return
	}

	if (currentPage.headerName.endsWith("Bluetooth")) {
		if (robots[0].device.name != userRobotID) {
			navigateTo(currentPage.headerName + "6")
		} else {
			navigateTo(currentPage.headerName + "Success")
		}
		return
	}

	let robot = robots[0]
	document.getElementById("currentConnection").innerHTML = currentlyConnectedTo
	document.getElementById("robotDetails").innerHTML = "<span>" + robot.fancyName + "</span>"

}

function disconnectFromAllRobots() {
	if (robots.length == 0) {
		updateConnectedDevices()
	}
	while (robots.length != 0) {
		let robot = robots.pop()
		robot.userDisconnect()
	}
}

//Should we display the battery status?
function updateBatteryStatus() {}

// replacements for functions in gui.js. Maybe not needed?
function closeErrorModal() {}
function loadIDE() {}

function webBleIsAvailable() {
	if (!("bluetooth" in navigator)) {
		//console.log("*** not ble in nav ")
		return false
	}

	navigator.bluetooth.getAvailability().then(isAvailable => {
  	if (!isAvailable) {
  		//console.log("*** ble not avail")
  		return false
  	}

	}).catch(error => {
  	console.error("Unable to determine whether bluetooth is available. Error: " + error.message)
  	return false
  });

  return true
}


///// Shared Test Functions /////

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function saveRobotId() {
	userRobotID = document.getElementById("robotID").value.toUpperCase()

	let idOK = checkRobotId()

	if (idOK) {
		currentPage.nextAction()
	}
}

function checkRobotId() {
	let text = ""
	let success = true
	if (userRobotID.length != 7) {
		text = "You have entered " + userRobotID + ". This ID is " + userRobotID.length + " characters long. Your id should be 7 characters long and begin after the # symbol."
		success = false
	} else {

		let mbCode = userRobotID.slice(2, 5)
		let isHex = /^[0-9a-fA-F]+$/.test(mbCode)
		if (!isHex) {
			text = "The code " + userRobotID + " is invalid."
			success = false
		} else {

			let type = userRobotID.slice(0, 2)
			let codes = ["FN", "BB", "MB"]
			if (type != currentPage.productID) {
				if (codes.includes(type)) {
					text = "You have entered " + userRobotID + " which starts with " + type + ". The correct code for the " + currentPage.productName + " is " + currentPage.productID + ". Your micro:bit may not be seated correctly. Please remove and reinsert the micro:bit, and be sure that its USB port is disconnected. Then enter the updated code. <button class=\"btn btn-teal btn-sm\" onclick=\"navigateTo('contactSupportMBCode')\">Code would not update</button>"
				} else {
					text = "You have entered " + userRobotID + " which is an invalid code."
				}
				success = false
			}

		}

	}
	
	document.getElementById("response").innerHTML = text
	return success
}
createContactSupportPage("contactSupportMBCode", "A micro:bit with updated firmware is flashing a 7 character code that starts with the wrong product code and reseating/restarting the robot does not correct this")


///// Finch Tests /////

async function testFinchMotors() {

  await timeout(500)

  let speed = 50
  let distance = 10
  
  await moveFinchAndWait(speed, speed, distance)
  await moveFinchAndWait(-speed, -speed, distance)
  await moveFinchAndWait(speed, -speed, distance)
  await moveFinchAndWait(-speed, speed, distance)

}

async function moveFinchAndWait(speedL, speedR, distance) {
  let robot = robots[0]
  let ticks = distance * FINCH_TICKS_PER_CM
  let wasMoving = robot.isMoving()
  let moveSentTime = new Date().getTime()
  let moveStartTimedOut = false
  let done = false
  
  robot.setMotors(speedL, ticks, speedR, ticks)

  while(!done) {
    await timeout(100)
    moveStartTimedOut = (new Date().getTime() > moveSentTime + 500);
    let isMoving = robot.isMoving()
    //console.log("Waiting for move " + moveStartTimedOut + " " + isMoving + " " + wasMoving + " " + done)
    done = ((wasMoving || moveStartTimedOut) && !isMoving)
    wasMoving = isMoving
  }
}

async function testFinchLEDs() {

	await timeout(500)

	let robot = robots[0]
	robot.setTriLED(1, 255, 0, 0)
	robot.setTriLED("all", 255, 0, 0)
	await timeout(1000)
	robot.setTriLED(1, 0, 255, 0)
	robot.setTriLED("all", 0, 255, 0)
	await timeout(1000)
	robot.setTriLED(1, 0, 0, 255)
	robot.setTriLED("all", 0, 0, 255)
	await timeout(1000)
	robot.setTriLED(1, 255, 255, 255)
	robot.setTriLED("all", 255, 255, 255)
	await timeout(500)

}

const finchSensorNames = ["Distance", "Left Light", "Right Light", "Left Line", "Right Line"]
const maxFinchThresholds = [60, 5, 5, 60, 60]
const minFinchThresholds = [20, 5, 5, 10, 10]
var finchMaxSensors = []
var finchMinSensors = []
var finchSensorResults = ""
function testFinchSensorsMax() {
	robots[0].stopAll()
	getFinchSensorValues(true)
	currentPage.nextAction()
}
function testFinchSensorsMin() {
	getFinchSensorValues(false)
	let pass = true
	finchSensorResults = "The values recorded were as follows:<br>"
	for (let i = 0; i < 5; i++) {
		finchSensorResults += finchSensorNames[i] + ": " + finchMinSensors[i] + " to " + finchMaxSensors[i]

		let failed = (i > 2) ? (finchMinSensors[i] < maxFinchThresholds[i] || finchMaxSensors[i] > minFinchThresholds[i])
			: (finchMaxSensors[i] < maxFinchThresholds[i] || finchMinSensors[i] > minFinchThresholds[i])

		finchSensorResults += failed ? " (fail)<br>" : " (pass)<br>"

		pass = pass && !failed
	}
	console.log(finchSensorResults)
	if (pass) {
		navigateTo("finchSensorsSuccess")
	} else {
		navigateTo("finchSensorsFail")
	}
}
function getFinchSensorValues(max) {
	let robot = robots[0]
	let values = []
	for (let i = 0; i < 5; i++) {
		values.push(robot.getSensor(finchSensorNames[i]))
	}

	if (max) {
		finchMaxSensors = values
	} else {
		finchMinSensors = values
	}
}


///// Hummingbird Tests /////

function testBBLED(port) {
	let robot = robots[0]
	robot.setLED(port, 255)
}

function testBBTri(port) {
	let robot = robots[0]
	robot.setTriLED(port, 255, 255, 255)
}

function testBBSENSOR(port) {
	let robot = robots[0]
	let sensor = document.querySelector('input[name="sensor"]:checked')
	let results = document.getElementById("results")
	if (!sensor) {
		results.innerHTML = "Please select the type of sensor you are testing"
	} else {
		let sensorName = sensor.value
		let sensorValue = robot.getSensor(sensorName, port)
		results.innerHTML = "Your " + sensorName + " sensor on port " + port + " has reported the following value:</br>" + sensorValue
	}
}

async function testBBPosition(port) {

	await timeout(500)

	let robot = robots[0]
	robot.setServo(port, 0) //0 degree setting
	await timeout(1000)
	robot.setServo(port, 254) //180 degree setting
	await timeout(1000)
	robot.setServo(port, 255) //servo off
}

async function testBBRotation(port) {

	await timeout(500)

	let robot = robots[0]
	robot.setServo(port, 99)
	await timeout(1000)
	robot.setServo(port, 145)
	await timeout(1000)
	robot.setServo(port, 255) //servo off
}

///// Initialize State ///////

const currentUrl = window.location.href

//Could redirect to main url and use document.referrer to get query
/*console.log("*** referrer : " + document.referrer)
if (currentPage != pages["home"]) {
	window.location.replace(currentUrl.split('?')[0])
}*/

let paramString = currentUrl.split('?')[1];
let queryString = new URLSearchParams(paramString);
let startingProduct = null
let startingSection = null
for(let pair of queryString.entries()) {
    switch (pair[0].toLowerCase()) {
    case "product": 
    	startingProduct = pair[1].toLowerCase()
    	break;
    case "troubleshoot":
    	startingSection = pair[1].toLowerCase()
    	break;
    }
}

var currentPage = pages["home"]
if (startingProduct == "finch" || startingProduct == "hummingbird") {
	switch(startingSection) {
	case "power":
		currentPage = pages[startingProduct + "Power"]
		break;
	case "bluetooth":
	case "ble":
		currentPage = pages[startingProduct + "Bluetooth"]
		break;
	case "code":
		currentPage = pages[startingProduct + "Code"]
		break;
	case "motors":
	case "motor":
	case "wheels":
	case "wheel":
		if (startingProduct == "finch") {
			currentPage = pages[startingProduct + "Motors"]
		} else {
			currentPage = pages[startingProduct + "Home"]
		}
		break;
	case "leds":
	case "led":
		currentPage = pages[startingProduct + "LEDs"]
		break;
	case "sensors":
	case "sensor":
		currentPage = pages[startingProduct + "Sensors"]
		break;
	case "servos":
	case "servo":
		if (startingProduct == "hummingbird") {
			currentPage = pages[startingProduct + "Servos"]
		} else {
			currentPage = pages[startingProduct + "Home"]
		}
		break;
	default:
		currentPage = pages[startingProduct + "Home"]
	}
	
}

const previousPages = []
currentPage.show()

